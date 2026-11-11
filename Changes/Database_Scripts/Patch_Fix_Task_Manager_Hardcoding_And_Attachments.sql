-- ======================================================================================
-- Patch Script: Fix Task Manager Hardcoding, Multi-Tenant Isolation & Update Attachments
-- Eliminates hardcoded 'GU-1' and 'Admin' fallbacks.
-- Adds @AttachmentName and @AttachmentPath to usp_HR_Task_UpdateTaskDetails.
-- ======================================================================================
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 1. INLINE TABLE-VALUED FUNCTION: dbo.fn_HR_Task_ResolveViewer
-- --------------------------------------------------------------------------------------
CREATE OR ALTER FUNCTION dbo.fn_HR_Task_ResolveViewer
(
    @ViewerId VARCHAR(50),
    @UserType VARCHAR(20)
)
RETURNS TABLE
AS
RETURN
(
    WITH ViewerResolved AS
    (
        -- Case A: Logged in as User (Admin / HR Management) via UM_Users_Mst
        SELECT 
            u.fk_empId                               AS EmpId,
            u.pk_userId                              AS UserId,
            CAST(u.fk_roleId AS INT)                 AS RoleId,
            u.fk_companyId                           AS CompanyId,
            emp.fk_deptid                            AS DeptId,
            CASE WHEN u.fk_roleId IN (1, 2) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsAdmin,
            ISNULL(u.name, 'User')                   AS ResolvedName
        FROM dbo.UM_Users_Mst u
        LEFT JOIN dbo.SAL_Employee_Mst emp ON u.fk_empId = emp.pk_empid COLLATE DATABASE_DEFAULT
        WHERE UPPER(ISNULL(@UserType, '')) = 'USER'
          AND u.pk_userId = @ViewerId COLLATE DATABASE_DEFAULT
          AND u.active = 1

        UNION ALL

        -- Case B: Logged in as Employee via SAL_Employee_Mst
        SELECT 
            e.pk_empid                               AS EmpId,
            u.pk_userId                              AS UserId,
            CAST(u.fk_roleId AS INT)                 AS RoleId,
            e.fk_companyId                           AS CompanyId,
            e.fk_deptid                              AS DeptId,
            CASE WHEN u.fk_roleId IN (1, 2) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsAdmin,
            ISNULL(e.empname, 'Employee')            AS ResolvedName
        FROM dbo.SAL_Employee_Mst e
        LEFT JOIN dbo.UM_Users_Mst u ON u.fk_empId = e.pk_empid COLLATE DATABASE_DEFAULT AND u.active = 1
        WHERE UPPER(ISNULL(@UserType, '')) <> 'USER'
          AND e.pk_empid = @ViewerId COLLATE DATABASE_DEFAULT
    )
    SELECT TOP 1
        v.EmpId,
        v.UserId,
        v.RoleId,
        v.CompanyId,
        v.DeptId,
        v.IsAdmin,
        CASE 
            WHEN v.EmpId IS NOT NULL AND EXISTS (
                SELECT 1 FROM dbo.Department_Mst d WHERE d.fk_depHodid = v.EmpId COLLATE DATABASE_DEFAULT
            ) THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS IsHod,
        CASE 
            WHEN v.EmpId IS NOT NULL AND EXISTS (
                SELECT 1 FROM dbo.SAL_Employee_Mst rep 
                WHERE (rep.fk_FunctionalRepempid = v.EmpId COLLATE DATABASE_DEFAULT 
                    OR rep.fk_AdministrativeRepempid = v.EmpId COLLATE DATABASE_DEFAULT)
            ) THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS IsManager,
        v.ResolvedName
    FROM ViewerResolved v
);
GO

-- --------------------------------------------------------------------------------------
-- 2. STORED PROCEDURE: dbo.usp_HR_Task_Create
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_Create
    @Subject                    NVARCHAR(250),
    @Description                NVARCHAR(MAX)   = NULL,
    @Priority                   VARCHAR(20)     = 'MEDIUM',
    @Status                     VARCHAR(20)     = 'OPEN',
    @TargetDeptId               VARCHAR(50)     = NULL,
    @AssignedToEmpId            VARCHAR(50)     = NULL,
    @DueDate                    DATETIME        = NULL,
    @AttachmentName             NVARCHAR(255)   = NULL,
    @AttachmentPath             NVARCHAR(500)   = NULL,
    @IsRecurring                BIT             = 0,
    @RecurrenceType             VARCHAR(20)     = 'NONE',
    @RecurrenceInterval         INT             = 1,
    @RecurrenceDays             VARCHAR(50)     = NULL,
    @RecurrenceDayOfMonth       INT             = NULL,
    @RecurrenceEndType          VARCHAR(20)     = 'NEVER',
    @RecurrenceEndDate          DATETIME        = NULL,
    @RecurrenceOccurrencesTotal INT             = NULL,
    @RecurrenceDueOffsetHours   INT             = 24,
    @RecurrenceDueOffsetUnit    VARCHAR(10)     = 'DAYS',
    @IsSelfTask                 BIT             = 0,
    @TaskTypeId                 INT             = NULL,
    @TaskTypeName               VARCHAR(100)    = NULL,
    @ActionById                 VARCHAR(50)     = NULL,
    @ActionByName               NVARCHAR(150)   = NULL,
    @UserType                   VARCHAR(20)     = NULL,
    @CompanyId                  VARCHAR(50)     = NULL,
    @InitialRemarks             NVARCHAR(MAX)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CreatedByEmpId    VARCHAR(50) = NULL;
    DECLARE @CreatedByUserId   VARCHAR(50) = NULL;
    DECLARE @CreatorDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedName      NVARCHAR(150) = NULL;
    DECLARE @ResolvedCompanyId VARCHAR(50) = @CompanyId;
    DECLARE @ResolvedTaskType  VARCHAR(100) = @TaskTypeName;
    DECLARE @NextOccurDate     DATETIME = NULL;

    -- 1. Resolve Creator Identity via fn_HR_Task_ResolveViewer
    SELECT TOP 1
        @CreatedByEmpId    = EmpId,
        @CreatedByUserId   = UserId,
        @CreatorDeptId     = DeptId,
        @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, CompanyId),
        @ResolvedName      = ISNULL(@ActionByName, ResolvedName)
    FROM dbo.fn_HR_Task_ResolveViewer(@ActionById, @UserType);

    -- Strict creator check
    IF @CreatedByEmpId IS NULL AND @CreatedByUserId IS NULL
    BEGIN
        RAISERROR('Creator identity could not be resolved. Please log in again.', 16, 1);
        RETURN;
    END

    IF @ResolvedName IS NULL OR @ResolvedName = ''
        SET @ResolvedName = ISNULL(@ActionByName, 'User');

    -- Dynamically resolve CompanyId from employee or user master if still missing
    IF @ResolvedCompanyId IS NULL OR @ResolvedCompanyId = ''
    BEGIN
        IF @CreatedByEmpId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.SAL_Employee_Mst WHERE pk_empid = @CreatedByEmpId;
        IF (@ResolvedCompanyId IS NULL OR @ResolvedCompanyId = '') AND @CreatedByUserId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.UM_Users_Mst WHERE pk_userId = @CreatedByUserId;
    END

    -- Handle self-task assignment
    IF @IsSelfTask = 1 AND @CreatedByEmpId IS NOT NULL
    BEGIN
        SET @AssignedToEmpId = @CreatedByEmpId;
        IF @TargetDeptId IS NULL AND @CreatorDeptId IS NOT NULL
            SET @TargetDeptId = @CreatorDeptId;
    END

    -- 2. Resolve Task Type Name from General Master (CodeTypeId = 24)
    IF @TaskTypeId IS NOT NULL AND (@ResolvedTaskType IS NULL OR @ResolvedTaskType = '')
    BEGIN
        SELECT TOP 1 @ResolvedTaskType = Name
        FROM dbo.LSP_Master_General
        WHERE CodeTypeId = 24 AND CodeId = @TaskTypeId;
    END
    IF @ResolvedTaskType IS NULL OR @ResolvedTaskType = '' SET @ResolvedTaskType = 'General';

    -- 3. Calculate initial DueDate and NextOccurrenceDate for recurring
    IF @IsRecurring = 1
    BEGIN
        DECLARE @BaseNext DATETIME = GETDATE();
        DECLARE @RecInterval INT = ISNULL(@RecurrenceInterval, 1);
        IF @RecInterval <= 0 SET @RecInterval = 1;

        IF @RecurrenceType = 'DAILY'
            SET @NextOccurDate = DATEADD(DAY, @RecInterval, @BaseNext);
        ELSE IF @RecurrenceType = 'WEEKLY'
            SET @NextOccurDate = DATEADD(WEEK, @RecInterval, @BaseNext);
        ELSE IF @RecurrenceType = 'MONTHLY'
        BEGIN
            DECLARE @TargetDay INT = ISNULL(@RecurrenceDayOfMonth, DAY(@BaseNext));
            IF @TargetDay < 1 SET @TargetDay = 1;
            IF @TargetDay > 31 SET @TargetDay = 31;

            DECLARE @TargetMonthDate DATETIME;
            IF DAY(@BaseNext) < @TargetDay
                SET @TargetMonthDate = @BaseNext;
            ELSE
                SET @TargetMonthDate = DATEADD(MONTH, @RecInterval, @BaseNext);

            DECLARE @MaxDayOfMonth INT = DAY(EOMONTH(@TargetMonthDate));
            DECLARE @ClampedDay INT = CASE WHEN @TargetDay > @MaxDayOfMonth THEN @MaxDayOfMonth ELSE @TargetDay END;

            SET @NextOccurDate = DATEFROMPARTS(YEAR(@TargetMonthDate), MONTH(@TargetMonthDate), @ClampedDay);
            SET @NextOccurDate = DATEADD(HOUR, 9, @NextOccurDate);
        END
        ELSE IF @RecurrenceType = 'YEARLY'
            SET @NextOccurDate = DATEADD(YEAR, @RecInterval, @BaseNext);
        ELSE
            SET @NextOccurDate = DATEADD(DAY, @RecInterval, @BaseNext);
    END

    IF @DueDate IS NULL
    BEGIN
        SET @DueDate = DATEADD(DAY, 7, GETDATE());
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        -- 4. Atomic TaskCode generation & Insert
        DECLARE @NewTaskId INT;
        DECLARE @NewTaskCode VARCHAR(50);

        INSERT INTO dbo.HR_TaskMaster
        (
            TaskCode, Subject, Description, Priority, Status,
            TargetDeptId, AssignedToEmpId,
            CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId,
            DueDate, AttachmentName, AttachmentPath,
            IsRecurring, RecurrenceType, RecurrenceInterval, RecurrenceDays, RecurrenceDayOfMonth,
            RecurrenceEndType, RecurrenceEndDate, RecurrenceOccurrencesTotal, RecurrenceOccurrencesCount,
            RecurrenceDueOffsetHours, RecurrenceDueOffsetUnit,
            NextOccurrenceDate, ParentTaskId, IsSelfTask,
            TaskTypeId, TaskTypeName,
            CompanyId, CreatedAt, UpdatedAt, IsActive
        )
        VALUES
        (
            'PENDING', @Subject, @Description, @Priority, @Status,
            @TargetDeptId, @AssignedToEmpId,
            @CreatedByEmpId, @CreatedByUserId, @ResolvedName, @CreatorDeptId,
            @DueDate, @AttachmentName, @AttachmentPath,
            @IsRecurring, @RecurrenceType, @RecurrenceInterval, @RecurrenceDays, @RecurrenceDayOfMonth,
            @RecurrenceEndType, @RecurrenceEndDate, @RecurrenceOccurrencesTotal, 0,
            @RecurrenceDueOffsetHours, @RecurrenceDueOffsetUnit,
            @NextOccurDate, NULL, @IsSelfTask,
            @TaskTypeId, @ResolvedTaskType,
            @ResolvedCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewTaskId = SCOPE_IDENTITY();
        SET @NewTaskCode = 'TSK-' + CAST(@NewTaskId AS VARCHAR(20));

        UPDATE dbo.HR_TaskMaster
        SET TaskCode = @NewTaskCode
        WHERE TaskId = @NewTaskId;

        -- 5. Audit History Log
        DECLARE @HistoryRemarks NVARCHAR(MAX) = ISNULL(@InitialRemarks, 'Task created.');
        IF @IsSelfTask = 1
            SET @HistoryRemarks = @HistoryRemarks + ' (Self-assigned task)';

        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, NewStatus, NewAssigneeEmpId,
            Remarks, AttachmentName, AttachmentPath,
            ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewTaskId, 'CREATED', @Status, @AssignedToEmpId,
            @HistoryRemarks, @AttachmentName, @AttachmentPath,
            @CreatedByEmpId, @CreatedByUserId, @ResolvedName, GETDATE()
        );

        COMMIT TRANSACTION;

        -- 6. Dispatch Notifications to Stakeholders
        BEGIN TRY
            EXEC dbo.usp_HR_Task_DispatchNotification 
                @TaskId = @NewTaskId, 
                @EventType = 'CREATED', 
                @ActorName = @ResolvedName;
        END TRY
        BEGIN CATCH
            -- Notifications never fail the task creation
        END CATCH;

        SELECT 
            @NewTaskId   AS TaskId, 
            @NewTaskCode AS TaskCode, 
            1            AS Success, 
            'Task created successfully.' AS Message;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- --------------------------------------------------------------------------------------
-- 3. STORED PROCEDURE: dbo.usp_HR_Task_GetBoard
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetBoard
    @ViewerId           VARCHAR(50)     = NULL,
    @UserType           VARCHAR(20)     = NULL,
    @RoleId             INT             = NULL,
    @Scope              VARCHAR(30)     = 'ALL',
    @DeptId             VARCHAR(50)     = NULL,
    @AssignedToEmpId    VARCHAR(50)     = NULL,
    @CreatedByEmpId     VARCHAR(50)     = NULL,
    @Status             VARCHAR(20)     = NULL,
    @Priority           VARCHAR(20)     = NULL,
    @RecurrenceType     VARCHAR(20)     = NULL,
    @TaskTypeId         INT             = NULL,
    @OnlyUnassigned     BIT             = 0,
    @OnlyOverdue        BIT             = 0,
    @SearchText         NVARCHAR(100)   = NULL,
    @CompanyId          VARCHAR(50)     = NULL,
    @TargetStatus       VARCHAR(20)     = NULL,
    @PageIndex          INT             = 1,
    @PageSize           INT             = 10
AS
BEGIN
    SET NOCOUNT ON;

    SET @PageIndex = ISNULL(@PageIndex, 1);
    SET @PageSize = ISNULL(@PageSize, 10);
    IF @PageIndex < 1 SET @PageIndex = 1;
    IF @PageSize < 1 SET @PageSize = 10;

    EXEC dbo.usp_HR_Task_ProcessRecurring @SuppressOutput = 1;

    SELECT TOP 1 *
    INTO #Viewer
    FROM dbo.fn_HR_Task_ResolveViewer(@ViewerId, @UserType);

    DECLARE @ResolvedCompanyId VARCHAR(50) = @CompanyId;
    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
    BEGIN
        SELECT @ResolvedCompanyId = CompanyId FROM #Viewer;
    END
    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
    BEGIN
        SELECT TOP 1 @ResolvedCompanyId = e.fk_companyId 
        FROM dbo.SAL_Employee_Mst e CROSS JOIN #Viewer v WHERE v.EmpId IS NOT NULL AND e.pk_empid = v.EmpId;
    END

    SELECT 
        t.TaskId,
        t.TaskCode,
        t.Subject,
        t.Description,
        t.Priority,
        t.Status,
        t.TargetDeptId,
        ISNULL(d.description, 'All Departments') AS DepartmentName,
        t.AssignedToEmpId,
        ISNULL(e.empname, 'Unassigned') AS AssignedToDisplayName,
        t.CreatedByEmpId,
        t.CreatedByUserId,
        t.CreatedByName AS CreatedByDisplayName,
        t.CreatorDeptId,
        t.DueDate,
        t.AttachmentName,
        t.AttachmentPath,
        t.IsRecurring,
        t.RecurrenceType,
        t.RecurrenceInterval,
        t.RecurrenceDays,
        t.RecurrenceDayOfMonth,
        t.RecurrenceEndType,
        t.RecurrenceEndDate,
        t.RecurrenceOccurrencesTotal,
        t.RecurrenceOccurrencesCount,
        t.RecurrenceDueOffsetHours,
        t.RecurrenceDueOffsetUnit,
        t.NextOccurrenceDate,
        t.ParentTaskId,
        t.IsSelfTask,
        t.TaskTypeId,
        ISNULL(t.TaskTypeName, 'General') AS TaskTypeName,
        t.ClosedAt,
        t.CompanyId,
        t.CreatedAt,
        t.UpdatedAt,
        CASE 
            WHEN t.Status <> 'CLOSED' AND t.DueDate IS NOT NULL AND t.DueDate < GETDATE() 
            THEN 1 ELSE 0 
        END AS IsOverdue,
        CASE 
            WHEN t.Status <> 'CLOSED' AND t.DueDate IS NOT NULL AND t.DueDate < GETDATE() 
            THEN DATEDIFF(HOUR, t.DueDate, GETDATE()) 
            ELSE 0 
        END AS OverdueHours,
        DATEDIFF(MINUTE, t.CreatedAt, GETDATE()) AS AgeMinutes
    INTO #FilteredTasks
    FROM dbo.HR_TaskMaster t
    INNER JOIN dbo.fn_HR_Task_VisibleTasks(@ViewerId, @UserType, @ResolvedCompanyId) vis ON vis.TaskId = t.TaskId
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst e ON t.AssignedToEmpId = e.pk_empid COLLATE DATABASE_DEFAULT
    CROSS JOIN #Viewer v
    WHERE t.IsActive = 1
      AND (
          @Scope = 'ALL'
          OR (@Scope IN ('MY_ASSIGNED', 'MY_TASKS') AND v.EmpId IS NOT NULL AND t.AssignedToEmpId = v.EmpId COLLATE DATABASE_DEFAULT)
          OR (@Scope IN ('CREATED_BY_ME', 'CREATED_BY') AND (
                (v.EmpId IS NOT NULL AND t.CreatedByEmpId = v.EmpId COLLATE DATABASE_DEFAULT)
             OR (v.UserId IS NOT NULL AND t.CreatedByUserId = v.UserId COLLATE DATABASE_DEFAULT)
          ))
          OR (@Scope IN ('MY_DEPT', 'DEPT_TASKS') AND (
                (v.IsHod = 1 AND (
                     EXISTS (SELECT 1 FROM dbo.Department_Mst hd WHERE hd.fk_depHodid = v.EmpId COLLATE DATABASE_DEFAULT AND (t.TargetDeptId = hd.pk_deptid COLLATE DATABASE_DEFAULT OR t.CreatorDeptId = hd.pk_deptid COLLATE DATABASE_DEFAULT))
                  OR EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst de JOIN dbo.Department_Mst hd ON de.fk_deptid = hd.pk_deptid COLLATE DATABASE_DEFAULT WHERE hd.fk_depHodid = v.EmpId COLLATE DATABASE_DEFAULT AND (t.AssignedToEmpId = de.pk_empid COLLATE DATABASE_DEFAULT OR t.CreatedByEmpId = de.pk_empid COLLATE DATABASE_DEFAULT))
                ))
                OR (v.IsHod = 0 AND v.DeptId IS NOT NULL AND (t.TargetDeptId = v.DeptId COLLATE DATABASE_DEFAULT OR t.CreatorDeptId = v.DeptId COLLATE DATABASE_DEFAULT))
                OR (v.IsAdmin = 1 AND v.IsHod = 0 AND t.TargetDeptId IS NOT NULL)
          ))
          OR (@Scope IN ('SELF_TASKS', 'SELF') AND t.IsSelfTask = 1 AND v.EmpId IS NOT NULL AND t.CreatedByEmpId = v.EmpId COLLATE DATABASE_DEFAULT)
      )
      AND (@DeptId IS NULL OR t.TargetDeptId = @DeptId COLLATE DATABASE_DEFAULT)
      AND (@AssignedToEmpId IS NULL OR t.AssignedToEmpId = @AssignedToEmpId COLLATE DATABASE_DEFAULT)
      AND (@CreatedByEmpId IS NULL OR t.CreatedByEmpId = @CreatedByEmpId COLLATE DATABASE_DEFAULT)
      AND (@Status IS NULL OR t.Status = @Status COLLATE DATABASE_DEFAULT)
      AND (@Priority IS NULL OR t.Priority = @Priority COLLATE DATABASE_DEFAULT)
      AND (@RecurrenceType IS NULL OR t.RecurrenceType = @RecurrenceType COLLATE DATABASE_DEFAULT)
      AND (@TaskTypeId IS NULL OR t.TaskTypeId = @TaskTypeId)
      AND (@OnlyUnassigned = 0 OR t.AssignedToEmpId IS NULL)
      AND (@OnlyOverdue = 0 OR (t.Status <> 'CLOSED' AND t.DueDate IS NOT NULL AND t.DueDate < GETDATE()))
      AND (
          @SearchText IS NULL 
          OR t.Subject LIKE '%' + @SearchText + '%' 
          OR t.TaskCode LIKE '%' + @SearchText + '%' 
          OR t.Description LIKE '%' + @SearchText + '%' 
          OR e.empname LIKE '%' + @SearchText + '%'
      );

    -- Result Set 1: KPI Summary Counts
    SELECT 
        COUNT(1) AS TotalCount,
        SUM(CASE WHEN Status = 'OPEN' THEN 1 ELSE 0 END) AS OpenCount,
        SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) AS ClosedCount,
        SUM(CASE WHEN Status IN ('ON_HOLD', 'ON HOLD') THEN 1 ELSE 0 END) AS OnHoldCount,
        SUM(CASE WHEN AssignedToEmpId IS NULL THEN 1 ELSE 0 END) AS UnassignedCount,
        SUM(CASE WHEN IsOverdue = 1 THEN 1 ELSE 0 END) AS OverdueCount
    FROM #FilteredTasks;

    -- Result Set 2: Task Records
    IF @TargetStatus IS NOT NULL AND LTRIM(RTRIM(@TargetStatus)) <> ''
    BEGIN
        SELECT *
        FROM #FilteredTasks
        WHERE Status = @TargetStatus COLLATE DATABASE_DEFAULT
        ORDER BY DueDate ASC, TaskId DESC
        OFFSET (@PageIndex - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    END
    ELSE
    BEGIN
        WITH PartitionedTasks AS (
            SELECT 
                *,
                ROW_NUMBER() OVER(
                    PARTITION BY Status 
                    ORDER BY DueDate ASC, TaskId DESC
                ) AS ColumnRowNum
            FROM #FilteredTasks
        )
        SELECT *
        FROM PartitionedTasks
        WHERE ColumnRowNum <= @PageSize
        ORDER BY DueDate ASC, TaskId DESC;
    END

    -- Result Set 3: Viewer Context
    SELECT 
        v.IsAdmin,
        v.IsHod,
        v.IsManager,
        v.EmpId,
        v.UserId,
        v.ResolvedName
    FROM #Viewer v;

    DROP TABLE #FilteredTasks;
    DROP TABLE #Viewer;
END;
GO

-- --------------------------------------------------------------------------------------
-- 4. STORED PROCEDURE: dbo.usp_HR_Task_GetLookups
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetLookups
    @ViewerId       VARCHAR(50) = NULL,
    @UserType       VARCHAR(20) = NULL,
    @RoleId         INT         = NULL,
    @CompanyId      VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ResolvedEmpId     VARCHAR(50)  = NULL;
    DECLARE @ResolvedUserId    VARCHAR(50)  = NULL;
    DECLARE @ResolvedDeptId    VARCHAR(50)  = NULL;
    DECLARE @ResolvedDeptName  VARCHAR(150) = '';
    DECLARE @ResolvedName      NVARCHAR(150)= '';
    DECLARE @IsAdmin           BIT          = 0;
    DECLARE @IsHod             BIT          = 0;
    DECLARE @IsManager         BIT          = 0;
    DECLARE @ResolvedCompanyId VARCHAR(50)  = @CompanyId;

    IF @ViewerId IS NOT NULL AND @ViewerId <> ''
    BEGIN
        SELECT TOP 1
            @ResolvedEmpId     = EmpId,
            @ResolvedUserId    = UserId,
            @ResolvedDeptId    = DeptId,
            @IsAdmin           = IsAdmin,
            @IsHod             = IsHod,
            @IsManager         = IsManager,
            @ResolvedName      = ResolvedName,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, CompanyId)
        FROM dbo.fn_HR_Task_ResolveViewer(@ViewerId, @UserType);

        IF @ResolvedDeptId IS NOT NULL AND @ResolvedDeptId <> ''
        BEGIN
            SELECT TOP 1 @ResolvedDeptName = ISNULL(description, '') 
            FROM dbo.Department_Mst 
            WHERE pk_deptid = @ResolvedDeptId;
        END
        ELSE IF @ResolvedEmpId IS NOT NULL
        BEGIN
            SELECT TOP 1
                @ResolvedDeptId   = e.fk_deptid,
                @ResolvedDeptName = ISNULL(d.description, '')
            FROM dbo.SAL_Employee_Mst e
            LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid
            WHERE e.pk_empid = @ResolvedEmpId;
        END
    END

    -- Dynamic fallback if company is unresolved
    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
    BEGIN
        IF @ResolvedEmpId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ResolvedEmpId;
        IF (@ResolvedCompanyId IS NULL OR @ResolvedCompanyId = '') AND @ResolvedUserId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.UM_Users_Mst WHERE pk_userId = @ResolvedUserId;
    END

    IF @UserType IN ('SuperAdmin', 'Admin', 'HRAdmin') OR @RoleId IN (1, 2)
    BEGIN
        SET @IsAdmin = 1;
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

    -- Result Set 2: Department Lookup
    SELECT 
        d.pk_deptid      AS DeptId,
        d.description    AS DeptName,
        d.fk_depHodid    AS HodEmpId
    FROM dbo.Department_Mst d
    WHERE ISNULL(d.dep_active, 1) = 1
      AND (@ResolvedCompanyId IS NULL OR d.fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT)
    ORDER BY d.description ASC;

    -- Result Set 3: Initial Employee Dropdown
    SELECT TOP (50)
        e.pk_empid        AS EmpId,
        e.empcode         AS EmpCode,
        e.empname         AS EmpName,
        e.fk_deptid       AS DeptId,
        ISNULL(d.description, '') AS DeptName,
        ISNULL(e.email, '')       AS Email
    FROM dbo.SAL_Employee_Mst e
    LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid COLLATE DATABASE_DEFAULT
    WHERE e.active = 1
      AND ISNULL(e.employeeleftstatus, 'N') = 'N'
      AND (@ResolvedCompanyId IS NULL OR e.fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT)
    ORDER BY e.empname ASC;

    -- Result Set 4: Task Type Lookup
    SELECT 
        g.CodeId          AS TaskTypeId,
        g.Name            AS TaskTypeName,
        g.Code            AS TaskTypeCode,
        g.CodeDescription AS TaskTypeDescription
    FROM dbo.LSP_Master_General g
    WHERE g.CodeTypeId = 24
      AND g.IsActive = 1
      AND (
          @ResolvedCompanyId IS NULL
          OR g.fk_companyId = '0'
          OR g.fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT
      )
    ORDER BY g.CodeId ASC;
END;
GO

-- --------------------------------------------------------------------------------------
-- 5. STORED PROCEDURE: dbo.usp_HR_Task_SearchEmployees
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_SearchEmployees
    @CompanyId      VARCHAR(50) = NULL,
    @DeptId         VARCHAR(50) = NULL,
    @SearchText     NVARCHAR(100) = NULL,
    @Top            INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    IF @Top <= 0 OR @Top > 100 SET @Top = 20;
    IF @CompanyId IS NOT NULL AND LTRIM(RTRIM(@CompanyId)) = '' SET @CompanyId = NULL;

    SELECT TOP (@Top)
        e.pk_empid        AS EmpId,
        e.empcode         AS EmpCode,
        e.empname         AS EmpName,
        e.fk_deptid       AS DeptId,
        ISNULL(d.description, '') AS DeptName,
        ISNULL(e.email, '')       AS Email
    FROM dbo.SAL_Employee_Mst e
    LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid COLLATE DATABASE_DEFAULT
    WHERE e.active = 1
      AND ISNULL(e.employeeleftstatus, 'N') = 'N'
      AND (@CompanyId IS NULL OR e.fk_companyId = @CompanyId COLLATE DATABASE_DEFAULT)
      AND (@DeptId IS NULL OR LTRIM(RTRIM(@DeptId)) = '' OR e.fk_deptid = @DeptId COLLATE DATABASE_DEFAULT)
      AND (
          @SearchText IS NULL 
          OR LTRIM(RTRIM(@SearchText)) = ''
          OR e.empname LIKE '%' + @SearchText + '%'
          OR e.empcode LIKE '%' + @SearchText + '%'
      )
    ORDER BY e.empname ASC;
END;
GO

-- --------------------------------------------------------------------------------------
-- 6. STORED PROCEDURE: dbo.usp_HR_Task_DispatchNotification
-- --------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_DispatchNotification
    @TaskId     INT,
    @EventType  VARCHAR(20),
    @ActorName  NVARCHAR(150) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TaskCode VARCHAR(50);
    DECLARE @Subject NVARCHAR(250);
    DECLARE @Status VARCHAR(20);
    DECLARE @Priority VARCHAR(20);
    DECLARE @TargetDeptId VARCHAR(50);
    DECLARE @CreatorDeptId VARCHAR(50);
    DECLARE @AssignedToEmpId VARCHAR(50);
    DECLARE @CreatedByEmpId VARCHAR(50);
    DECLARE @CreatedByName NVARCHAR(150);
    DECLARE @CompanyId VARCHAR(50);

    SELECT TOP 1
        @TaskCode = t.TaskCode,
        @Subject = t.Subject,
        @Status = t.Status,
        @Priority = t.Priority,
        @TargetDeptId = t.TargetDeptId,
        @CreatorDeptId = t.CreatorDeptId,
        @AssignedToEmpId = t.AssignedToEmpId,
        @CreatedByEmpId = t.CreatedByEmpId,
        @CreatedByName = t.CreatedByName,
        @CompanyId = t.CompanyId
    FROM dbo.HR_TaskMaster t
    WHERE t.TaskId = @TaskId;

    IF @TaskCode IS NULL RETURN;

    DECLARE @Title VARCHAR(100);
    DECLARE @Description VARCHAR(255);
    DECLARE @ActorDisplay NVARCHAR(150) = ISNULL(@ActorName, ISNULL(@CreatedByName, 'System'));

    IF @EventType = 'CREATED'
    BEGIN
        SET @Title = 'New Task Assigned: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' created task "' + @Subject + '"', 1, 255);
    END
    ELSE IF @EventType = 'STATUS_CHANGED'
    BEGIN
        SET @Title = 'Task Status Updated: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' changed status of "' + @Subject + '" to ' + @Status, 1, 255);
    END
    ELSE IF @EventType = 'REASSIGNED'
    BEGIN
        SET @Title = 'Task Reassigned: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' reassigned task "' + @Subject + '"', 1, 255);
    END
    ELSE
    BEGIN
        SET @Title = 'Task Updated: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' updated task "' + @Subject + '"', 1, 255);
    END

    -- Collect deduplicated stakeholder EmpIds
    DECLARE @Stakeholders TABLE (EmpId VARCHAR(50) PRIMARY KEY);

    IF @AssignedToEmpId IS NOT NULL AND LTRIM(RTRIM(@AssignedToEmpId)) <> ''
        INSERT INTO @Stakeholders (EmpId) VALUES (@AssignedToEmpId);

    IF @CreatedByEmpId IS NOT NULL AND LTRIM(RTRIM(@CreatedByEmpId)) <> ''
        INSERT INTO @Stakeholders (EmpId) 
        SELECT @CreatedByEmpId WHERE @CreatedByEmpId NOT IN (SELECT EmpId FROM @Stakeholders);

    IF @TargetDeptId IS NOT NULL AND LTRIM(RTRIM(@TargetDeptId)) <> ''
        INSERT INTO @Stakeholders (EmpId)
        SELECT d.fk_depHodid 
        FROM dbo.Department_Mst d
        WHERE d.pk_deptid = @TargetDeptId 
          AND d.fk_depHodid IS NOT NULL 
          AND LTRIM(RTRIM(d.fk_depHodid)) <> ''
          AND d.fk_depHodid NOT IN (SELECT EmpId FROM @Stakeholders);

    IF @CreatorDeptId IS NOT NULL AND LTRIM(RTRIM(@CreatorDeptId)) <> ''
        INSERT INTO @Stakeholders (EmpId)
        SELECT d.fk_depHodid 
        FROM dbo.Department_Mst d
        WHERE d.pk_deptid = @CreatorDeptId 
          AND d.fk_depHodid IS NOT NULL 
          AND LTRIM(RTRIM(d.fk_depHodid)) <> ''
          AND d.fk_depHodid NOT IN (SELECT EmpId FROM @Stakeholders);

    IF @AssignedToEmpId IS NOT NULL AND LTRIM(RTRIM(@AssignedToEmpId)) <> ''
    BEGIN
        INSERT INTO @Stakeholders (EmpId)
        SELECT mgr.Id
        FROM dbo.SAL_Employee_Mst e
        CROSS APPLY (
            SELECT e.fk_rmanagerid AS Id UNION
            SELECT e.fk_imanagerid AS Id UNION
            SELECT e.fk_FunctionalRepempid AS Id UNION
            SELECT e.fk_AdministrativeRepempid AS Id
        ) mgr
        WHERE e.pk_empid = @AssignedToEmpId
          AND mgr.Id IS NOT NULL 
          AND LTRIM(RTRIM(mgr.Id)) <> ''
          AND mgr.Id NOT IN (SELECT EmpId FROM @Stakeholders);
    END

    IF EXISTS (SELECT 1 FROM @Stakeholders)
    BEGIN
        INSERT INTO dbo.LMS_Notification_Mst (title, description, active)
        VALUES (@Title, @Description, 1);

        DECLARE @NotificationId BIGINT = SCOPE_IDENTITY();

        INSERT INTO dbo.LMS_Notification_Employee_Map (fk_empid, fk_notificationid, diffusion, diffusiondate, active)
        SELECT s.EmpId, @NotificationId, 0, GETDATE(), 1
        FROM @Stakeholders s
        WHERE s.EmpId IS NOT NULL AND LTRIM(RTRIM(s.EmpId)) <> '';
    END
END;
GO
