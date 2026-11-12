-- ======================================================================================
-- HR TASK MANAGER & INTERACTIVE KANBAN MODULE - DATABASE ENGINE SETUP SCRIPT
-- Database: HRBook (SQL Server)
-- Tables: dbo.HR_TaskMaster, dbo.HR_TaskHistory
-- Stored Procedures:
--   1. dbo.usp_HR_Task_ProcessRecurring
--   2. dbo.usp_HR_Task_GetLookups
--   3. dbo.usp_HR_Task_GetBoard
--   4. dbo.usp_HR_Task_Create
--   5. dbo.usp_HR_Task_UpdateStatusAndRemarks
--   6. dbo.usp_HR_Task_GetByIdWithHistory
-- ======================================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 1. TABLE: dbo.HR_TaskMaster
-- --------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HR_TaskMaster' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.HR_TaskMaster
    (
        TaskId              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        TaskCode            VARCHAR(50)       NOT NULL,
        Subject             NVARCHAR(250)     NOT NULL,
        Description         NVARCHAR(MAX)     NULL,
        Priority            VARCHAR(20)       NOT NULL CONSTRAINT DF_HR_TaskMaster_Priority DEFAULT ('MEDIUM'),
        Status              VARCHAR(20)       NOT NULL CONSTRAINT DF_HR_TaskMaster_Status DEFAULT ('OPEN'),
        TargetDeptId        VARCHAR(50)       NULL,
        AssignedToEmpId     VARCHAR(50)       NULL,
        CreatedByEmpId      VARCHAR(50)       NULL,
        CreatedByUserId     VARCHAR(50)       NULL,
        CreatedByName       NVARCHAR(150)     NULL,
        CreatorDeptId       VARCHAR(50)       NULL,
        DueDate             DATETIME          NOT NULL,
        AttachmentName      NVARCHAR(255)     NULL,
        AttachmentPath      NVARCHAR(500)     NULL,
        IsRecurring         BIT               NOT NULL CONSTRAINT DF_HR_TaskMaster_IsRecurring DEFAULT (0),
        RecurrenceType      VARCHAR(20)       NULL     CONSTRAINT DF_HR_TaskMaster_RecurrenceType DEFAULT ('NONE'),
        RecurrenceInterval  INT               NOT NULL CONSTRAINT DF_HR_TaskMaster_RecurrenceInterval DEFAULT (1),
        NextOccurrenceDate  DATETIME          NULL,
        ParentTaskId        INT               NULL,
        IsSelfTask          BIT               NOT NULL CONSTRAINT DF_HR_TaskMaster_IsSelfTask DEFAULT (0),
        ClosedAt            DATETIME          NULL,
        CompanyId           VARCHAR(50)       NULL,
        CreatedAt           DATETIME          NOT NULL CONSTRAINT DF_HR_TaskMaster_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt           DATETIME          NOT NULL CONSTRAINT DF_HR_TaskMaster_UpdatedAt DEFAULT (GETDATE()),
        IsActive            BIT               NOT NULL CONSTRAINT DF_HR_TaskMaster_IsActive DEFAULT (1)
    );

    CREATE UNIQUE NONCLUSTERED INDEX UQ_HR_TaskMaster_TaskCode ON dbo.HR_TaskMaster(TaskCode);
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_Status_Active ON dbo.HR_TaskMaster(Status, IsActive);
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_AssignedTo ON dbo.HR_TaskMaster(AssignedToEmpId) WHERE AssignedToEmpId IS NOT NULL;
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_CreatedBy ON dbo.HR_TaskMaster(CreatedByEmpId);
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_TargetDept ON dbo.HR_TaskMaster(TargetDeptId);
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_Recurrence ON dbo.HR_TaskMaster(IsRecurring, NextOccurrenceDate) WHERE IsRecurring = 1;
END
GO

-- --------------------------------------------------------------------------------------
-- 2. TABLE: dbo.HR_TaskHistory (Full Lifecycle Audit Trail)
-- --------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HR_TaskHistory' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.HR_TaskHistory
    (
        HistoryId           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        TaskId              INT               NOT NULL,
        ActionType          VARCHAR(50)       NOT NULL, -- CREATED, STATUS_CHANGED, ASSIGNED, REMARK_ADDED, EDITED, ATTACHMENT_ADDED, RECURRENCE_GENERATED
        OldStatus           VARCHAR(20)       NULL,
        NewStatus           VARCHAR(20)       NULL,
        OldAssigneeEmpId    VARCHAR(50)       NULL,
        NewAssigneeEmpId    VARCHAR(50)       NULL,
        Remarks             NVARCHAR(MAX)     NOT NULL,
        AttachmentName      NVARCHAR(255)     NULL,
        AttachmentPath      NVARCHAR(500)     NULL,
        ActionByEmpId       VARCHAR(50)       NULL,
        ActionByUserId      VARCHAR(50)       NULL,
        ActionByName        NVARCHAR(150)     NULL,
        CreatedAt           DATETIME          NOT NULL CONSTRAINT DF_HR_TaskHistory_CreatedAt DEFAULT (GETDATE()),
        CONSTRAINT FK_HR_TaskHistory_TaskId FOREIGN KEY (TaskId) REFERENCES dbo.HR_TaskMaster(TaskId) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_HR_TaskHistory_TaskId ON dbo.HR_TaskHistory(TaskId, CreatedAt DESC);
END
GO

-- --------------------------------------------------------------------------------------
-- 3. STORED PROCEDURE: dbo.usp_HR_Task_ProcessRecurring
-- Evaluates active recurring template tasks where NextOccurrenceDate <= GETDATE()
-- Generates new child task instances with Status = 'OPEN' and ParentTaskId linked
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_ProcessRecurring
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @GeneratedCount INT = 0;
    DECLARE @CurTaskId INT;
    DECLARE @CurSubject NVARCHAR(250);
    DECLARE @CurDescription NVARCHAR(MAX);
    DECLARE @CurPriority VARCHAR(20);
    DECLARE @CurTargetDeptId VARCHAR(50);
    DECLARE @CurAssignedToEmpId VARCHAR(50);
    DECLARE @CurCreatedByEmpId VARCHAR(50);
    DECLARE @CurCreatedByUserId VARCHAR(50);
    DECLARE @CurCreatedByName NVARCHAR(150);
    DECLARE @CurCreatorDeptId VARCHAR(50);
    DECLARE @CurRecurrenceType VARCHAR(20);
    DECLARE @CurRecurrenceInterval INT;
    DECLARE @CurNextDate DATETIME;
    DECLARE @CurDueDate DATETIME;
    DECLARE @CurCompanyId VARCHAR(50);
    DECLARE @NewChildTaskId INT;
    DECLARE @NewChildTaskCode VARCHAR(50);
    DECLARE @CalculatedDueDate DATETIME;

    DECLARE curRecurring CURSOR LOCAL FAST_FORWARD FOR
        SELECT TaskId, Subject, Description, Priority, TargetDeptId, AssignedToEmpId,
               CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId,
               RecurrenceType, ISNULL(RecurrenceInterval, 1), NextOccurrenceDate, DueDate, CompanyId
        FROM dbo.HR_TaskMaster
        WHERE IsActive = 1
          AND IsRecurring = 1
          AND RecurrenceType IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
          AND NextOccurrenceDate IS NOT NULL
          AND NextOccurrenceDate <= GETDATE();

    OPEN curRecurring;
    FETCH NEXT FROM curRecurring INTO 
        @CurTaskId, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
        @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
        @CurRecurrenceType, @CurRecurrenceInterval, @CurNextDate, @CurDueDate, @CurCompanyId;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Calculate due date for the child task (default to current occurrence date + difference or + 1 day)
        SET @CalculatedDueDate = DATEADD(DAY, 1, @CurNextDate);

        -- Generate unique sequential TaskCode
        SET @NewChildTaskCode = 'HR_TSK-' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-' + 
                                RIGHT('0000' + CAST((ISNULL((SELECT MAX(TaskId) FROM dbo.HR_TaskMaster), 1000) + 1) AS VARCHAR(10)), 4);

        -- Insert child task instance (child tasks have IsRecurring = 0; the parent template maintains the recurrence schedule)
        INSERT INTO dbo.HR_TaskMaster
        (
            TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
            CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
            IsRecurring, RecurrenceType, RecurrenceInterval, NextOccurrenceDate, ParentTaskId,
            IsSelfTask, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
        )
        VALUES
        (
            @NewChildTaskCode, @CurSubject, @CurDescription, @CurPriority, 'OPEN', @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId, @CalculatedDueDate,
            0, 'NONE', 1, NULL, @CurTaskId,
            0, NULL, @CurCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewChildTaskId = SCOPE_IDENTITY();
        SET @GeneratedCount = @GeneratedCount + 1;

        -- Record audit history on the newly generated child task
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, OldStatus, NewStatus, Remarks, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewChildTaskId, 'RECURRENCE_GENERATED', NULL, 'OPEN',
            CONCAT('Task instance generated automatically from recurring schedule (Parent Task: ', @CurTaskId, ').'),
            'System Scheduler', GETDATE()
        );

        -- Advance NextOccurrenceDate on the parent recurring task until it is in the future
        WHILE @CurNextDate <= GETDATE()
        BEGIN
            IF @CurRecurrenceType = 'DAILY'
                SET @CurNextDate = DATEADD(DAY, @CurRecurrenceInterval, @CurNextDate);
            ELSE IF @CurRecurrenceType = 'WEEKLY'
                SET @CurNextDate = DATEADD(WEEK, @CurRecurrenceInterval, @CurNextDate);
            ELSE IF @CurRecurrenceType = 'MONTHLY'
                SET @CurNextDate = DATEADD(MONTH, @CurRecurrenceInterval, @CurNextDate);
            ELSE IF @CurRecurrenceType = 'YEARLY'
                SET @CurNextDate = DATEADD(YEAR, @CurRecurrenceInterval, @CurNextDate);
            ELSE
                BREAK;
        END;

        UPDATE dbo.HR_TaskMaster
        SET NextOccurrenceDate = @CurNextDate,
            UpdatedAt = GETDATE()
        WHERE TaskId = @CurTaskId;

        FETCH NEXT FROM curRecurring INTO 
            @CurTaskId, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
            @CurRecurrenceType, @CurRecurrenceInterval, @CurNextDate, @CurDueDate, @CurCompanyId;
    END;

    CLOSE curRecurring;
    DEALLOCATE curRecurring;

    SELECT @GeneratedCount AS GeneratedCount;
END;
GO

-- --------------------------------------------------------------------------------------
-- 4. STORED PROCEDURE: dbo.usp_HR_Task_GetLookups
-- Returns:
--   Result Set 1: Viewer Identity & Context (IsAdmin, IsHod, IsManager, Dept info)
--   Result Set 2: Active Departments list
--   Result Set 3: Active Employees list
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetLookups
    @ViewerId       VARCHAR(50) = NULL,
    @UserType       VARCHAR(20) = NULL,
    @RoleId         INT         = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ResolvedEmpId      VARCHAR(50) = NULL;
    DECLARE @ResolvedUserId     VARCHAR(50) = NULL;
    DECLARE @ResolvedName       NVARCHAR(150) = 'User';
    DECLARE @ResolvedDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedDeptName   NVARCHAR(150) = '';
    DECLARE @IsAdmin            BIT = 0;
    DECLARE @IsHod              BIT = 0;
    DECLARE @IsManager          BIT = 0;

    -- 1. Check if ViewerId is an employee in SAL_Employee_Mst
    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ViewerId)
    BEGIN
        SELECT TOP 1 
            @ResolvedEmpId    = e.pk_empid,
            @ResolvedName     = e.empname,
            @ResolvedDeptId   = e.fk_deptid,
            @ResolvedDeptName = ISNULL(d.description, '')
        FROM dbo.SAL_Employee_Mst e
        LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid
        WHERE e.pk_empid = @ViewerId;

        -- Check if employee is mapped to a system user
        SELECT TOP 1 @ResolvedUserId = pk_userId 
        FROM dbo.UM_Users_Mst 
        WHERE fk_empId = @ResolvedEmpId;
    END
    -- 2. Check if ViewerId is a User in UM_Users_Mst
    ELSE IF EXISTS (SELECT 1 FROM dbo.UM_Users_Mst WHERE pk_userId = @ViewerId)
    BEGIN
        SELECT TOP 1 
            @ResolvedUserId = u.pk_userId,
            @ResolvedEmpId  = u.fk_empId,
            @ResolvedName   = u.name,
            @RoleId         = ISNULL(@RoleId, u.fk_roleId)
        FROM dbo.UM_Users_Mst u
        WHERE u.pk_userId = @ViewerId;

        IF @ResolvedEmpId IS NOT NULL
        BEGIN
            SELECT TOP 1 
                @ResolvedDeptId   = e.fk_deptid,
                @ResolvedDeptName = ISNULL(d.description, '')
            FROM dbo.SAL_Employee_Mst e
            LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid
            WHERE e.pk_empid = @ResolvedEmpId;
        END
    END
    ELSE
    BEGIN
        SET @ResolvedUserId = @ViewerId;
    END

    -- Determine Admin role (Admin roles: 1 = Admin, 2 = Super Admin, 7 = HR Manager)
    IF ISNULL(@RoleId, 0) IN (1, 2, 7) OR @UserType = 'User'
        SET @IsAdmin = 1;

    -- Determine HOD status (multi-source hierarchy check per D-04)
    IF @ResolvedEmpId IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.Department_Mst WHERE fk_depHodid = @ResolvedEmpId AND ISNULL(dep_active, 1) = 1)
           OR EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ResolvedEmpId AND isHod = '1')
           OR EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE fk_FunctionalHODempid = @ResolvedEmpId OR fk_AdministrativeHODempid = @ResolvedEmpId)
        BEGIN
            SET @IsHod = 1;
        END

        -- Determine Manager status
        IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst 
                   WHERE fk_rmanagerid = @ResolvedEmpId 
                      OR fk_imanagerid = @ResolvedEmpId 
                      OR fk_FunctionalRepempid = @ResolvedEmpId 
                      OR fk_AdministrativeRepempid = @ResolvedEmpId)
        BEGIN
            SET @IsManager = 1;
        END
    END

    -- Result Set 1: Viewer Context
    SELECT 
        @ResolvedEmpId    AS ViewerEmpId,
        @ResolvedUserId   AS ViewerUserId,
        @ResolvedName     AS ViewerName,
        @ResolvedDeptId   AS ViewerDeptId,
        @ResolvedDeptName AS ViewerDeptName,
        @IsAdmin          AS IsAdmin,
        @IsHod            AS IsHod,
        @IsManager        AS IsManager;

    -- Result Set 2: Active Departments
    SELECT 
        d.pk_deptid       AS DeptId,
        d.description     AS DeptName,
        d.fk_depHodid     AS HodEmpId
    FROM dbo.Department_Mst d
    WHERE ISNULL(d.dep_active, 1) = 1
    ORDER BY d.description;

    -- Result Set 3: Active Employees
    SELECT 
        e.pk_empid        AS EmpId,
        e.empcode         AS EmpCode,
        e.empname         AS EmpName,
        e.fk_deptid       AS DeptId,
        ISNULL(d.description, '') AS DeptName,
        ISNULL(e.email, '')       AS Email
    FROM dbo.SAL_Employee_Mst e
    LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid
    WHERE e.active = 1 
      AND ISNULL(e.employeeleftstatus, 'N') = 'N'
    ORDER BY e.empname;
END;
GO

-- --------------------------------------------------------------------------------------
-- 5. STORED PROCEDURE: dbo.usp_HR_Task_GetBoard
-- Applies role visibility rules and multi-filtering.
-- Result Set 1: KPI Summary Counts (Total, Open, Closed, On Hold, Unassigned, Overdue, etc.)
-- Result Set 2: Task card list with metadata, overdue metrics, and relative timestamps
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetBoard
    @ViewerId           VARCHAR(50)     = NULL,
    @UserType           VARCHAR(20)     = NULL,
    @RoleId             INT             = NULL,
    @Scope              VARCHAR(30)     = 'ALL', -- ALL, MY_TASKS, DEPT_TASKS, CREATED_BY_ME, SELF_TASKS
    @DeptId             VARCHAR(50)     = NULL,
    @AssignedToEmpId    VARCHAR(50)     = NULL,
    @CreatedByEmpId     VARCHAR(50)     = NULL,
    @Status             VARCHAR(20)     = NULL,
    @Priority           VARCHAR(20)     = NULL,
    @RecurrenceType     VARCHAR(20)     = NULL,
    @OnlyUnassigned     BIT             = 0,
    @OnlyOverdue        BIT             = 0,
    @SearchText         NVARCHAR(200)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Automatically evaluate any due recurring schedules first
    EXEC dbo.usp_HR_Task_ProcessRecurring;

    DECLARE @ResolvedEmpId  VARCHAR(50) = NULL;
    DECLARE @ResolvedUserId VARCHAR(50) = NULL;
    DECLARE @IsAdmin        BIT = 0;
    DECLARE @IsHod          BIT = 0;
    DECLARE @IsManager      BIT = 0;

    -- Resolve identity
    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ViewerId)
    BEGIN
        SET @ResolvedEmpId = @ViewerId;
        SELECT TOP 1 @ResolvedUserId = pk_userId FROM dbo.UM_Users_Mst WHERE fk_empId = @ResolvedEmpId;
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.UM_Users_Mst WHERE pk_userId = @ViewerId)
    BEGIN
        SET @ResolvedUserId = @ViewerId;
        SELECT TOP 1 @ResolvedEmpId = fk_empId, @RoleId = ISNULL(@RoleId, fk_roleId) 
        FROM dbo.UM_Users_Mst WHERE pk_userId = @ViewerId;
    END
    ELSE
    BEGIN
        SET @ResolvedUserId = @ViewerId;
    END

    -- Admin resolution
    IF ISNULL(@RoleId, 0) IN (1, 2, 7) OR @UserType = 'User'
        SET @IsAdmin = 1;

    -- Collect HOD departments for the viewer
    CREATE TABLE #HodDepts (DeptId VARCHAR(50) PRIMARY KEY);
    IF @ResolvedEmpId IS NOT NULL
    BEGIN
        INSERT INTO #HodDepts (DeptId)
        SELECT pk_deptid FROM dbo.Department_Mst WHERE fk_depHodid = @ResolvedEmpId AND ISNULL(dep_active, 1) = 1
        UNION
        SELECT DISTINCT fk_deptid FROM dbo.SAL_Employee_Mst 
        WHERE (pk_empid = @ResolvedEmpId AND isHod = '1')
           OR fk_FunctionalHODempid = @ResolvedEmpId 
           OR fk_AdministrativeHODempid = @ResolvedEmpId;

        IF EXISTS (SELECT 1 FROM #HodDepts) SET @IsHod = 1;
    END

    -- Collect team direct reports for the viewer
    CREATE TABLE #TeamMembers (EmpId VARCHAR(50) PRIMARY KEY);
    IF @ResolvedEmpId IS NOT NULL
    BEGIN
        INSERT INTO #TeamMembers (EmpId)
        SELECT pk_empid FROM dbo.SAL_Employee_Mst
        WHERE pk_empid = @ResolvedEmpId
           OR fk_rmanagerid = @ResolvedEmpId
           OR fk_imanagerid = @ResolvedEmpId
           OR fk_FunctionalRepempid = @ResolvedEmpId
           OR fk_AdministrativeRepempid = @ResolvedEmpId
           OR fk_deptid IN (SELECT DeptId FROM #HodDepts);

        IF EXISTS (SELECT 1 FROM #TeamMembers WHERE EmpId <> @ResolvedEmpId) SET @IsManager = 1;
    END

    -- Base accessible tasks set (enforcing role scoping per D-05)
    CREATE TABLE #AccessibleTasks (TaskId INT PRIMARY KEY);

    IF @IsAdmin = 1
    BEGIN
        INSERT INTO #AccessibleTasks (TaskId)
        SELECT TaskId FROM dbo.HR_TaskMaster WHERE IsActive = 1;
    END
    ELSE
    BEGIN
        INSERT INTO #AccessibleTasks (TaskId)
        SELECT DISTINCT t.TaskId
        FROM dbo.HR_TaskMaster t
        WHERE t.IsActive = 1
          AND (
              -- Task Creator always sees per D-05
              (@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId)
              OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId)
              -- Assigned employee sees per D-05
              OR (@ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId)
              -- Target or creator department HOD sees per D-05
              OR (t.TargetDeptId IN (SELECT DeptId FROM #HodDepts))
              OR (t.CreatorDeptId IN (SELECT DeptId FROM #HodDepts))
              -- Reporting Manager / HOD sees team members' tasks per D-05
              OR (t.AssignedToEmpId IN (SELECT EmpId FROM #TeamMembers))
              OR (t.CreatedByEmpId IN (SELECT EmpId FROM #TeamMembers))
          );
    END;

    -- Clean search string
    SET @SearchText = LTRIM(RTRIM(ISNULL(@SearchText, '')));

    -- RESULT SET 1: KPI Summary Counts on all accessible tasks for the viewer
    -- (Calculated across the accessible set so summary cards display accurate counts)
    SELECT
        COUNT(*) AS TotalCount,
        SUM(CASE WHEN t.Status = 'OPEN' THEN 1 ELSE 0 END) AS OpenCount,
        SUM(CASE WHEN t.Status = 'CLOSED' THEN 1 ELSE 0 END) AS ClosedCount,
        SUM(CASE WHEN t.Status = 'ON_HOLD' THEN 1 ELSE 0 END) AS OnHoldCount,
        SUM(CASE WHEN t.AssignedToEmpId IS NULL OR LTRIM(RTRIM(t.AssignedToEmpId)) = '' THEN 1 ELSE 0 END) AS UnassignedCount,
        SUM(CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() THEN 1 ELSE 0 END) AS OverdueCount,
        SUM(CASE WHEN @ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId THEN 1 ELSE 0 END) AS MyAssignedCount,
        SUM(CASE WHEN t.TargetDeptId IN (SELECT DeptId FROM #HodDepts) THEN 1 ELSE 0 END) AS DeptTaskCount,
        SUM(CASE WHEN (@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId) 
                      OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId) THEN 1 ELSE 0 END) AS CreatedByMeCount,
        SUM(CASE WHEN t.IsSelfTask = 1 AND ((@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId) 
                                         OR (@ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId)) THEN 1 ELSE 0 END) AS SelfTaskCount
    FROM dbo.HR_TaskMaster t
    INNER JOIN #AccessibleTasks a ON t.TaskId = a.TaskId;

    -- RESULT SET 2: Filtered task cards for the 3-column Kanban board
    SELECT 
        t.TaskId,
        t.TaskCode,
        t.Subject,
        t.Description,
        t.Priority,
        t.Status,
        t.TargetDeptId,
        ISNULL(d.description, 'General / Org') AS DepartmentName,
        t.AssignedToEmpId,
        ISNULL(empAssign.empname, 'Unassigned') AS AssignedToDisplayName,
        ISNULL(empAssign.empcode, '')           AS AssignedToEmpCode,
        t.CreatedByEmpId,
        t.CreatedByUserId,
        ISNULL(t.CreatedByName, ISNULL(empCreate.empname, 'Admin')) AS CreatedByDisplayName,
        t.CreatorDeptId,
        t.DueDate,
        t.AttachmentName,
        t.AttachmentPath,
        t.IsRecurring,
        t.RecurrenceType,
        t.RecurrenceInterval,
        t.NextOccurrenceDate,
        t.ParentTaskId,
        t.IsSelfTask,
        t.ClosedAt,
        t.CreatedAt,
        t.UpdatedAt,
        -- Computed Overdue and Age metrics
        CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsOverdue,
        CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() 
             THEN CAST(ROUND(DATEDIFF(MINUTE, t.DueDate, GETDATE()) / 60.0, 1) AS DECIMAL(10,1)) 
             ELSE CAST(0 AS DECIMAL(10,1)) END AS OverdueHours,
        DATEDIFF(MINUTE, t.CreatedAt, GETDATE()) AS AgeMinutes,
        (SELECT COUNT(*) FROM dbo.HR_TaskHistory h WHERE h.TaskId = t.TaskId) AS HistoryCount
    FROM dbo.HR_TaskMaster t
    INNER JOIN #AccessibleTasks a ON t.TaskId = a.TaskId
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid
    LEFT JOIN dbo.SAL_Employee_Mst empAssign ON t.AssignedToEmpId = empAssign.pk_empid
    LEFT JOIN dbo.SAL_Employee_Mst empCreate ON t.CreatedByEmpId = empCreate.pk_empid
    WHERE 1 = 1
      -- Scope filter
      AND (
          @Scope = 'ALL'
          OR (@Scope = 'MY_TASKS' AND @ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId)
          OR (@Scope = 'DEPT_TASKS' AND (t.TargetDeptId IN (SELECT DeptId FROM #HodDepts) OR t.CreatorDeptId IN (SELECT DeptId FROM #HodDepts)))
          OR (@Scope = 'CREATED_BY_ME' AND ((@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId) OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId)))
          OR (@Scope = 'SELF_TASKS' AND t.IsSelfTask = 1)
      )
      -- Specific filters
      AND (@DeptId IS NULL OR t.TargetDeptId = @DeptId)
      AND (@AssignedToEmpId IS NULL OR t.AssignedToEmpId = @AssignedToEmpId)
      AND (@CreatedByEmpId IS NULL OR t.CreatedByEmpId = @CreatedByEmpId)
      AND (@Status IS NULL OR t.Status = @Status)
      AND (@Priority IS NULL OR t.Priority = @Priority)
      AND (@RecurrenceType IS NULL OR t.RecurrenceType = @RecurrenceType)
      AND (@OnlyUnassigned = 0 OR (t.AssignedToEmpId IS NULL OR LTRIM(RTRIM(t.AssignedToEmpId)) = ''))
      AND (@OnlyOverdue = 0 OR (t.Status <> 'CLOSED' AND t.DueDate < GETDATE()))
      AND (
          @SearchText = '' 
          OR t.Subject LIKE '%' + @SearchText + '%' 
          OR t.TaskCode LIKE '%' + @SearchText + '%' 
          OR t.Description LIKE '%' + @SearchText + '%'
          OR empAssign.empname LIKE '%' + @SearchText + '%'
      )
    ORDER BY 
        CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() THEN 0 ELSE 1 END,
        CASE t.Priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
        t.CreatedAt DESC;

    DROP TABLE #AccessibleTasks;
    DROP TABLE #HodDepts;
    DROP TABLE #TeamMembers;
END;
GO

-- --------------------------------------------------------------------------------------
-- 6. STORED PROCEDURE: dbo.usp_HR_Task_Create
-- Creates new task, generates TaskCode, records initial CREATED audit history
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_Create
    @Subject            NVARCHAR(250),
    @Description        NVARCHAR(MAX)   = NULL,
    @Priority           VARCHAR(20)     = 'MEDIUM',
    @Status             VARCHAR(20)     = 'OPEN',
    @TargetDeptId       VARCHAR(50)     = NULL,
    @AssignedToEmpId    VARCHAR(50)     = NULL,
    @DueDate            DATETIME,
    @AttachmentName     NVARCHAR(255)   = NULL,
    @AttachmentPath     NVARCHAR(500)   = NULL,
    @IsRecurring        BIT             = 0,
    @RecurrenceType     VARCHAR(20)     = 'NONE',
    @RecurrenceInterval INT             = 1,
    @IsSelfTask         BIT             = 0,
    @ActionById         VARCHAR(50)     = NULL,
    @ActionByName       NVARCHAR(150)   = NULL,
    @CompanyId          VARCHAR(50)     = NULL,
    @InitialRemarks     NVARCHAR(MAX)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CreatedByEmpId   VARCHAR(50) = NULL;
    DECLARE @CreatedByUserId  VARCHAR(50) = NULL;
    DECLARE @CreatorDeptId    VARCHAR(50) = NULL;
    DECLARE @ResolvedName     NVARCHAR(150) = ISNULL(@ActionByName, 'User');
    DECLARE @TaskCode         VARCHAR(50);
    DECLARE @NewTaskId        INT;
    DECLARE @NextOccurDate    DATETIME = NULL;

    -- Resolve creator details
    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ActionById)
    BEGIN
        SELECT TOP 1 
            @CreatedByEmpId = e.pk_empid,
            @CreatorDeptId  = e.fk_deptid,
            @ResolvedName   = ISNULL(@ActionByName, e.empname)
        FROM dbo.SAL_Employee_Mst e
        WHERE e.pk_empid = @ActionById;

        SELECT TOP 1 @CreatedByUserId = pk_userId FROM dbo.UM_Users_Mst WHERE fk_empId = @CreatedByEmpId;
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.UM_Users_Mst WHERE pk_userId = @ActionById)
    BEGIN
        SELECT TOP 1 
            @CreatedByUserId = u.pk_userId,
            @CreatedByEmpId  = u.fk_empId,
            @ResolvedName    = ISNULL(@ActionByName, u.name)
        FROM dbo.UM_Users_Mst u
        WHERE u.pk_userId = @ActionById;

        IF @CreatedByEmpId IS NOT NULL
        BEGIN
            SELECT TOP 1 @CreatorDeptId = fk_deptid FROM dbo.SAL_Employee_Mst WHERE pk_empid = @CreatedByEmpId;
        END
    END
    ELSE
    BEGIN
        SET @CreatedByUserId = @ActionById;
    END

    -- If AssignedToEmpId is set but TargetDeptId is empty, default TargetDeptId to assignee's department
    IF (@TargetDeptId IS NULL OR LTRIM(RTRIM(@TargetDeptId)) = '') AND (@AssignedToEmpId IS NOT NULL)
    BEGIN
        SELECT TOP 1 @TargetDeptId = fk_deptid FROM dbo.SAL_Employee_Mst WHERE pk_empid = @AssignedToEmpId;
    END

    -- If SelfTask, align AssignedToEmpId to CreatedByEmpId
    IF @IsSelfTask = 1 AND @CreatedByEmpId IS NOT NULL AND (@AssignedToEmpId IS NULL OR @AssignedToEmpId = '')
    BEGIN
        SET @AssignedToEmpId = @CreatedByEmpId;
    END

    -- Compute NextOccurrenceDate if recurring
    IF @IsRecurring = 1 AND @RecurrenceType IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
    BEGIN
        IF @RecurrenceType = 'DAILY'
            SET @NextOccurDate = DATEADD(DAY, ISNULL(@RecurrenceInterval, 1), @DueDate);
        ELSE IF @RecurrenceType = 'WEEKLY'
            SET @NextOccurDate = DATEADD(WEEK, ISNULL(@RecurrenceInterval, 1), @DueDate);
        ELSE IF @RecurrenceType = 'MONTHLY'
            SET @NextOccurDate = DATEADD(MONTH, ISNULL(@RecurrenceInterval, 1), @DueDate);
        ELSE IF @RecurrenceType = 'YEARLY'
            SET @NextOccurDate = DATEADD(YEAR, ISNULL(@RecurrenceInterval, 1), @DueDate);
    END;

    -- Generate sequential TaskCode: HR_TSK-YYYY-NNNN
    SET @TaskCode = 'HR_TSK-' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-' + 
                    RIGHT('0000' + CAST((ISNULL((SELECT MAX(TaskId) FROM dbo.HR_TaskMaster), 1000) + 1) AS VARCHAR(10)), 4);

    -- Insert into HR_TaskMaster
    INSERT INTO dbo.HR_TaskMaster
    (
        TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
        CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
        AttachmentName, AttachmentPath, IsRecurring, RecurrenceType, RecurrenceInterval,
        NextOccurrenceDate, ParentTaskId, IsSelfTask, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
    )
    VALUES
    (
        @TaskCode, @Subject, @Description, ISNULL(@Priority, 'MEDIUM'), ISNULL(@Status, 'OPEN'),
        @TargetDeptId, @AssignedToEmpId, @CreatedByEmpId, @CreatedByUserId, @ResolvedName, @CreatorDeptId,
        @DueDate, @AttachmentName, @AttachmentPath, ISNULL(@IsRecurring, 0), ISNULL(@RecurrenceType, 'NONE'),
        ISNULL(@RecurrenceInterval, 1), @NextOccurDate, NULL, ISNULL(@IsSelfTask, 0),
        CASE WHEN @Status = 'CLOSED' THEN GETDATE() ELSE NULL END, @CompanyId, GETDATE(), GETDATE(), 1
    );

    SET @NewTaskId = SCOPE_IDENTITY();

    -- Record initial audit log in HR_TaskHistory
    INSERT INTO dbo.HR_TaskHistory
    (
        TaskId, ActionType, OldStatus, NewStatus, OldAssigneeEmpId, NewAssigneeEmpId,
        Remarks, AttachmentName, AttachmentPath, ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
    )
    VALUES
    (
        @NewTaskId, 'CREATED', NULL, ISNULL(@Status, 'OPEN'), NULL, @AssignedToEmpId,
        ISNULL(@InitialRemarks, 'Task created.'), @AttachmentName, @AttachmentPath,
        @CreatedByEmpId, @CreatedByUserId, @ResolvedName, GETDATE()
    );

    SELECT @NewTaskId AS TaskId, @TaskCode AS TaskCode;
END;
GO

-- --------------------------------------------------------------------------------------
-- 7. STORED PROCEDURE: dbo.usp_HR_Task_UpdateStatusAndRemarks
-- Updates status, assignee, priority, deadline, attachment and records mandatory audit remark
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_UpdateStatusAndRemarks
    @TaskId             INT,
    @NewStatus          VARCHAR(20),
    @Remarks            NVARCHAR(MAX),
    @NewAssigneeEmpId   VARCHAR(50)   = '__KEEP__',
    @NewPriority        VARCHAR(20)   = NULL,
    @NewDueDate         DATETIME      = NULL,
    @AttachmentName     NVARCHAR(255) = NULL,
    @AttachmentPath     NVARCHAR(500) = NULL,
    @ActionById         VARCHAR(50)   = NULL,
    @ActionByName       NVARCHAR(150) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Remarks IS NULL OR LTRIM(RTRIM(@Remarks)) = ''
    BEGIN
        RAISERROR('Mandatory remarks must be provided for task status transition or history update.', 16, 1);
        RETURN;
    END

    DECLARE @OldStatus           VARCHAR(20);
    DECLARE @OldAssigneeEmpId    VARCHAR(50);
    DECLARE @ResolvedActionByEmp VARCHAR(50) = NULL;
    DECLARE @ResolvedActionByUser VARCHAR(50) = NULL;
    DECLARE @ResolvedActorName   NVARCHAR(150) = ISNULL(@ActionByName, 'User');
    DECLARE @ActionType          VARCHAR(50) = 'STATUS_CHANGED';

    -- Fetch current state
    SELECT TOP 1 
        @OldStatus        = Status,
        @OldAssigneeEmpId = AssignedToEmpId
    FROM dbo.HR_TaskMaster
    WHERE TaskId = @TaskId;

    IF @OldStatus IS NULL
    BEGIN
        RAISERROR('Task not found.', 16, 1);
        RETURN;
    END

    -- Resolve actor
    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ActionById)
    BEGIN
        SELECT TOP 1 
            @ResolvedActionByEmp = pk_empid,
            @ResolvedActorName   = ISNULL(@ActionByName, empname)
        FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ActionById;

        SELECT TOP 1 @ResolvedActionByUser = pk_userId FROM dbo.UM_Users_Mst WHERE fk_empId = @ResolvedActionByEmp;
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.UM_Users_Mst WHERE pk_userId = @ActionById)
    BEGIN
        SELECT TOP 1 
            @ResolvedActionByUser = pk_userId,
            @ResolvedActionByEmp  = fk_empId,
            @ResolvedActorName    = ISNULL(@ActionByName, name)
        FROM dbo.UM_Users_Mst WHERE pk_userId = @ActionById;
    END
    ELSE
    BEGIN
        SET @ResolvedActionByUser = @ActionById;
    END

    -- Determine ActionType
    IF @OldStatus <> @NewStatus
        SET @ActionType = 'STATUS_CHANGED';
    ELSE IF @NewAssigneeEmpId <> '__KEEP__' AND ISNULL(@OldAssigneeEmpId, '') <> ISNULL(@NewAssigneeEmpId, '')
        SET @ActionType = 'ASSIGNED';
    ELSE IF @AttachmentName IS NOT NULL
        SET @ActionType = 'ATTACHMENT_ADDED';
    ELSE
        SET @ActionType = 'REMARK_ADDED';

    BEGIN TRANSACTION;
    BEGIN TRY
        -- Update Task Master
        UPDATE dbo.HR_TaskMaster
        SET Status = @NewStatus,
            ClosedAt = CASE WHEN @NewStatus = 'CLOSED' THEN ISNULL(ClosedAt, GETDATE()) 
                            WHEN @OldStatus = 'CLOSED' AND @NewStatus <> 'CLOSED' THEN NULL 
                            ELSE ClosedAt END,
            AssignedToEmpId = CASE WHEN @NewAssigneeEmpId = '__KEEP__' THEN AssignedToEmpId ELSE @NewAssigneeEmpId END,
            Priority = ISNULL(@NewPriority, Priority),
            DueDate = ISNULL(@NewDueDate, DueDate),
            AttachmentName = ISNULL(@AttachmentName, AttachmentName),
            AttachmentPath = ISNULL(@AttachmentPath, AttachmentPath),
            UpdatedAt = GETDATE()
        WHERE TaskId = @TaskId;

        -- Insert History audit trail
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, OldStatus, NewStatus, OldAssigneeEmpId,
            NewAssigneeEmpId, Remarks, AttachmentName, AttachmentPath,
            ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
        )
        VALUES
        (
            @TaskId, @ActionType, @OldStatus, @NewStatus, @OldAssigneeEmpId,
            CASE WHEN @NewAssigneeEmpId = '__KEEP__' THEN @OldAssigneeEmpId ELSE @NewAssigneeEmpId END,
            @Remarks, @AttachmentName, @AttachmentPath,
            @ResolvedActionByEmp, @ResolvedActionByUser, @ResolvedActorName, GETDATE()
        );

        COMMIT TRANSACTION;

        SELECT 1 AS Success, @TaskId AS TaskId, @NewStatus AS NewStatus;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- --------------------------------------------------------------------------------------
-- 8. STORED PROCEDURE: dbo.usp_HR_Task_GetByIdWithHistory
-- Returns:
--   Result Set 1: Full Task Details
--   Result Set 2: Chronological History and Remark timeline
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetByIdWithHistory
    @TaskId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Result Set 1: Single Task Details
    SELECT 
        t.TaskId,
        t.TaskCode,
        t.Subject,
        t.Description,
        t.Priority,
        t.Status,
        t.TargetDeptId,
        ISNULL(d.description, 'General / Org') AS DepartmentName,
        t.AssignedToEmpId,
        ISNULL(empAssign.empname, 'Unassigned') AS AssignedToDisplayName,
        ISNULL(empAssign.empcode, '')           AS AssignedToEmpCode,
        t.CreatedByEmpId,
        t.CreatedByUserId,
        ISNULL(t.CreatedByName, ISNULL(empCreate.empname, 'Admin')) AS CreatedByDisplayName,
        t.CreatorDeptId,
        t.DueDate,
        t.AttachmentName,
        t.AttachmentPath,
        t.IsRecurring,
        t.RecurrenceType,
        t.RecurrenceInterval,
        t.NextOccurrenceDate,
        t.ParentTaskId,
        parent.TaskCode AS ParentTaskCode,
        t.IsSelfTask,
        t.ClosedAt,
        t.CreatedAt,
        t.UpdatedAt,
        CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsOverdue,
        CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() 
             THEN CAST(ROUND(DATEDIFF(MINUTE, t.DueDate, GETDATE()) / 60.0, 1) AS DECIMAL(10,1)) 
             ELSE CAST(0 AS DECIMAL(10,1)) END AS OverdueHours,
        DATEDIFF(MINUTE, t.CreatedAt, GETDATE()) AS AgeMinutes,
        (SELECT COUNT(*) FROM dbo.HR_TaskHistory h WHERE h.TaskId = t.TaskId) AS HistoryCount
    FROM dbo.HR_TaskMaster t
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid
    LEFT JOIN dbo.SAL_Employee_Mst empAssign ON t.AssignedToEmpId = empAssign.pk_empid
    LEFT JOIN dbo.SAL_Employee_Mst empCreate ON t.CreatedByEmpId = empCreate.pk_empid
    LEFT JOIN dbo.HR_TaskMaster parent ON t.ParentTaskId = parent.TaskId
    WHERE t.TaskId = @TaskId;

    -- Result Set 2: Chronological History log (most recent first)
    SELECT 
        h.HistoryId,
        h.TaskId,
        h.ActionType,
        h.OldStatus,
        h.NewStatus,
        h.OldAssigneeEmpId,
        ISNULL(empOld.empname, '') AS OldAssigneeName,
        h.NewAssigneeEmpId,
        ISNULL(empNew.empname, 'Unassigned') AS NewAssigneeName,
        h.Remarks,
        h.AttachmentName,
        h.AttachmentPath,
        h.ActionByEmpId,
        h.ActionByUserId,
        ISNULL(h.ActionByName, ISNULL(empAction.empname, 'System')) AS ActionByDisplayName,
        h.CreatedAt
    FROM dbo.HR_TaskHistory h
    LEFT JOIN dbo.SAL_Employee_Mst empOld ON h.OldAssigneeEmpId = empOld.pk_empid
    LEFT JOIN dbo.SAL_Employee_Mst empNew ON h.NewAssigneeEmpId = empNew.pk_empid
    LEFT JOIN dbo.SAL_Employee_Mst empAction ON h.ActionByEmpId = empAction.pk_empid
    WHERE h.TaskId = @TaskId
    ORDER BY h.CreatedAt DESC, h.HistoryId DESC;
END;
GO

