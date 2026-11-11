-- ======================================================================================
-- ALL TASK MANAGER STORED PROCEDURES & FUNCTIONS (LIVE EXTRACT FROM HRBook DATABASE)
-- EXTRACTED AT: 2026-11-11 12:51:17
-- ======================================================================================
USE HRBook;
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.fn_HR_Task_ResolveViewer (SQL_INLINE_TABLE_VALUED_FUNCTION)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 1. INLINE TABLE-VALUED FUNCTION: dbo.fn_HR_Task_ResolveViewer
-- --------------------------------------------------------------------------------------
CREATE   FUNCTION dbo.fn_HR_Task_ResolveViewer
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
-- OBJECT: dbo.fn_HR_Task_VisibleTasks (SQL_INLINE_TABLE_VALUED_FUNCTION)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 2. INLINE TABLE-VALUED FUNCTION: dbo.fn_HR_Task_VisibleTasks
-- Single source of truth for task visibility across Admin, HOD, Manager, and Employee.
-- --------------------------------------------------------------------------------------
CREATE   FUNCTION dbo.fn_HR_Task_VisibleTasks
(
    @ViewerId  VARCHAR(50),
    @UserType  VARCHAR(20),
    @CompanyId VARCHAR(50) = NULL
)
RETURNS TABLE
AS
RETURN
(
    WITH ViewerInfo AS
    (
        SELECT TOP 1 *
        FROM dbo.fn_HR_Task_ResolveViewer(@ViewerId, @UserType)
    ),
    HodDepts AS
    (
        SELECT d.pk_deptid AS DeptId
        FROM dbo.Department_Mst d
        CROSS JOIN ViewerInfo v
        WHERE v.EmpId IS NOT NULL
          AND d.fk_depHodid = v.EmpId COLLATE DATABASE_DEFAULT
    ),
    DirectReports AS
    (
        SELECT rep.pk_empid AS EmpId
        FROM dbo.SAL_Employee_Mst rep
        CROSS JOIN ViewerInfo v
        WHERE v.EmpId IS NOT NULL
          AND (rep.fk_FunctionalRepempid = v.EmpId COLLATE DATABASE_DEFAULT 
            OR rep.fk_AdministrativeRepempid = v.EmpId COLLATE DATABASE_DEFAULT)
    ),
    DeptEmployees AS
    (
        SELECT de.pk_empid AS EmpId, de.fk_deptid AS DeptId
        FROM dbo.SAL_Employee_Mst de
        INNER JOIN HodDepts hd ON de.fk_deptid = hd.DeptId COLLATE DATABASE_DEFAULT
    )
    SELECT 
        t.TaskId,
        CASE 
            WHEN v.IsAdmin = 1 THEN 'ADMIN'
            WHEN (v.EmpId IS NOT NULL AND t.CreatedByEmpId = v.EmpId COLLATE DATABASE_DEFAULT)
              OR (v.UserId IS NOT NULL AND t.CreatedByUserId = v.UserId COLLATE DATABASE_DEFAULT) THEN 'CREATOR'
            WHEN (v.EmpId IS NOT NULL AND t.AssignedToEmpId = v.EmpId COLLATE DATABASE_DEFAULT) THEN 'ASSIGNEE'
            WHEN EXISTS (SELECT 1 FROM HodDepts hd WHERE t.TargetDeptId = hd.DeptId COLLATE DATABASE_DEFAULT) THEN 'HOD_TARGET'
            WHEN EXISTS (SELECT 1 FROM HodDepts hd WHERE t.CreatorDeptId = hd.DeptId COLLATE DATABASE_DEFAULT) THEN 'HOD_CREATOR_DEPT'
            WHEN EXISTS (SELECT 1 FROM DeptEmployees de WHERE t.AssignedToEmpId = de.EmpId COLLATE DATABASE_DEFAULT) THEN 'HOD_ASSIGNEE_DEPT'
            WHEN EXISTS (SELECT 1 FROM DeptEmployees de WHERE t.CreatedByEmpId = de.EmpId COLLATE DATABASE_DEFAULT) THEN 'HOD_CREATOR_EMP'
            WHEN EXISTS (SELECT 1 FROM DirectReports dr WHERE t.AssignedToEmpId = dr.EmpId COLLATE DATABASE_DEFAULT) THEN 'MANAGER'
            ELSE 'OTHER'
        END AS VisibilityReason,
        CASE 
            WHEN EXISTS (SELECT 1 FROM HodDepts hd WHERE t.TargetDeptId = hd.DeptId COLLATE DATABASE_DEFAULT) THEN CAST(1 AS BIT)
            WHEN EXISTS (SELECT 1 FROM HodDepts hd WHERE t.CreatorDeptId = hd.DeptId COLLATE DATABASE_DEFAULT) THEN CAST(1 AS BIT)
            WHEN EXISTS (SELECT 1 FROM DeptEmployees de WHERE t.AssignedToEmpId = de.EmpId COLLATE DATABASE_DEFAULT) THEN CAST(1 AS BIT)
            WHEN EXISTS (SELECT 1 FROM DeptEmployees de WHERE t.CreatedByEmpId = de.EmpId COLLATE DATABASE_DEFAULT) THEN CAST(1 AS BIT)
            WHEN v.IsAdmin = 1 AND v.IsHod = 0 AND t.TargetDeptId IS NOT NULL THEN CAST(1 AS BIT)
            WHEN v.IsHod = 0 AND v.DeptId IS NOT NULL AND (t.TargetDeptId = v.DeptId COLLATE DATABASE_DEFAULT OR t.CreatorDeptId = v.DeptId COLLATE DATABASE_DEFAULT) THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS IsDeptVisible
    FROM dbo.HR_TaskMaster t
    CROSS JOIN ViewerInfo v
    WHERE t.IsActive = 1
      AND (@CompanyId IS NULL OR t.CompanyId = @CompanyId COLLATE DATABASE_DEFAULT)
      AND (
          -- Rule 1: Admin sees ALL company tasks
          v.IsAdmin = 1

          -- Rule 2: Tasks created by viewer
          OR (v.EmpId IS NOT NULL AND t.CreatedByEmpId = v.EmpId COLLATE DATABASE_DEFAULT)
          OR (v.UserId IS NOT NULL AND t.CreatedByUserId = v.UserId COLLATE DATABASE_DEFAULT)

          -- Rule 3: Tasks assigned directly to viewer
          OR (v.EmpId IS NOT NULL AND t.AssignedToEmpId = v.EmpId COLLATE DATABASE_DEFAULT)

          -- Rule 4: HOD Department visibility (Target Dept, Creator Dept, or Assigned to/Created by Dept member)
          OR EXISTS (SELECT 1 FROM HodDepts hd WHERE t.TargetDeptId = hd.DeptId COLLATE DATABASE_DEFAULT)
          OR EXISTS (SELECT 1 FROM HodDepts hd WHERE t.CreatorDeptId = hd.DeptId COLLATE DATABASE_DEFAULT)
          OR EXISTS (SELECT 1 FROM DeptEmployees de WHERE t.AssignedToEmpId = de.EmpId COLLATE DATABASE_DEFAULT)
          OR EXISTS (SELECT 1 FROM DeptEmployees de WHERE t.CreatedByEmpId = de.EmpId COLLATE DATABASE_DEFAULT)

          -- Rule 5: Reporting Manager visibility over direct reports' tasks
          OR EXISTS (SELECT 1 FROM DirectReports dr WHERE t.AssignedToEmpId = dr.EmpId COLLATE DATABASE_DEFAULT)
      )
);
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_Create (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 2. STORED PROCEDURE: dbo.usp_HR_Task_Create
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_Create
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
-- OBJECT: dbo.usp_HR_Task_DispatchNotification (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 6. STORED PROCEDURE: dbo.usp_HR_Task_DispatchNotification
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_DispatchNotification
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

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_GetBoard (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 2. STORED PROCEDURE: dbo.usp_HR_Task_GetBoard
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_GetBoard
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

    -- Process any pending recurring tasks
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

    -- 1. Base visible tasks across user/role scope and search filters (WITHOUT card status filters)
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
    INTO #BaseTasks
    FROM dbo.HR_TaskMaster t
    INNER JOIN dbo.fn_HR_Task_VisibleTasks(@ViewerId, @UserType, @ResolvedCompanyId) vis ON vis.TaskId = t.TaskId
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst e ON t.AssignedToEmpId = e.pk_empid COLLATE DATABASE_DEFAULT
    CROSS JOIN #Viewer v
    WHERE t.IsActive = 1
      AND (
          @Scope = 'ALL'
          OR (@Scope = 'RECURRING' AND t.IsRecurring = 1)
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
      AND (@Priority IS NULL OR t.Priority = @Priority COLLATE DATABASE_DEFAULT)
      AND (@RecurrenceType IS NULL OR t.RecurrenceType = @RecurrenceType COLLATE DATABASE_DEFAULT)
      AND (@TaskTypeId IS NULL OR t.TaskTypeId = @TaskTypeId)
      AND (
          @SearchText IS NULL 
          OR t.Subject LIKE '%' + @SearchText + '%' 
          OR t.TaskCode LIKE '%' + @SearchText + '%' 
          OR t.Description LIKE '%' + @SearchText + '%' 
          OR e.empname LIKE '%' + @SearchText + '%'
      );

    -- Result Set 1: KPI Summary Counts (Computed on #BaseTasks so clicking a card button never mutates or zeroes other counts)
    SELECT 
        COUNT(1) AS TotalCount,
        SUM(CASE WHEN Status = 'OPEN' THEN 1 ELSE 0 END) AS OpenCount,
        SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) AS ClosedCount,
        SUM(CASE WHEN Status IN ('ON_HOLD', 'ON HOLD') THEN 1 ELSE 0 END) AS OnHoldCount,
        SUM(CASE WHEN AssignedToEmpId IS NULL THEN 1 ELSE 0 END) AS UnassignedCount,
        SUM(CASE WHEN IsOverdue = 1 THEN 1 ELSE 0 END) AS OverdueCount
    FROM #BaseTasks;

    -- 2. Apply status / unassigned / overdue card-level filters to get execution task cards
    SELECT *
    INTO #FilteredTasks
    FROM #BaseTasks
    WHERE (@Status IS NULL OR Status = @Status COLLATE DATABASE_DEFAULT)
      AND (@OnlyUnassigned = 0 OR AssignedToEmpId IS NULL)
      AND (@OnlyOverdue = 0 OR IsOverdue = 1);

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
    ELSE IF @Scope = 'RECURRING'
    BEGIN
        SELECT *
        FROM #FilteredTasks
        WHERE IsRecurring = 1
        ORDER BY NextOccurrenceDate ASC, TaskId DESC
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

    -- Result Set 4: Dedicated Recurring Cadences (All recurring parent templates in current scope)
    SELECT *
    FROM #BaseTasks
    WHERE IsRecurring = 1
    ORDER BY NextOccurrenceDate ASC, TaskId DESC;

    DROP TABLE #FilteredTasks;
    DROP TABLE #BaseTasks;
    DROP TABLE #Viewer;
END;
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_GetByIdWithHistory (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetByIdWithHistory
    @TaskId     INT,
    @ViewerId   VARCHAR(50) = NULL,
    @UserType   VARCHAR(20) = NULL,
    @CompanyId  VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    EXEC dbo.usp_HR_Task_GetDetail @TaskId = @TaskId, @ViewerId = @ViewerId, @UserType = @UserType, @CompanyId = @CompanyId;
END;
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_GetDetail (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 4. STORED PROCEDURE: dbo.usp_HR_Task_GetDetail (and usp_HR_Task_GetByIdWithHistory)
-- Security hardened with IsAuthorized check.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_GetDetail
    @TaskId     INT,
    @ViewerId   VARCHAR(50) = NULL,
    @UserType   VARCHAR(20) = NULL,
    @CompanyId  VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Authorization check
    IF @ViewerId IS NOT NULL AND @ViewerId <> ''
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.fn_HR_Task_VisibleTasks(@ViewerId, @UserType, @CompanyId)
            WHERE TaskId = @TaskId
        )
        BEGIN
            -- Return unauthorized signal in Result Set 1
            SELECT 
                CAST(0 AS BIT) AS IsAuthorized,
                @TaskId        AS TaskId,
                ''             AS TaskCode,
                ''             AS Subject,
                'OPEN'         AS Status,
                'MEDIUM'       AS Priority,
                GETDATE()      AS DueDate,
                GETDATE()      AS CreatedAt,
                GETDATE()      AS UpdatedAt;

            -- Empty Result Set 2
            SELECT TOP 0 1 AS HistoryId, 1 AS TaskId, '' AS ActionType, '' AS ActionByName, GETDATE() AS CreatedAt;
            RETURN;
        END
    END

    -- Result Set 1: Master task details
    SELECT 
        CAST(1 AS BIT) AS IsAuthorized,
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
    FROM dbo.HR_TaskMaster t
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst e ON t.AssignedToEmpId = e.pk_empid COLLATE DATABASE_DEFAULT
    WHERE t.TaskId = @TaskId
      AND t.IsActive = 1
      AND (@CompanyId IS NULL OR t.CompanyId = @CompanyId COLLATE DATABASE_DEFAULT);

    -- Result Set 2: Audit History Timeline
    SELECT 
        h.HistoryId,
        h.TaskId,
        h.ActionType,
        h.OldStatus,
        h.NewStatus,
        h.NewAssigneeEmpId,
        ISNULL(ae.empname, '') AS NewAssigneeName,
        h.Remarks,
        h.AttachmentName,
        h.AttachmentPath,
        h.ActionByEmpId,
        h.ActionByName,
        h.CreatedAt
    FROM dbo.HR_TaskHistory h
    LEFT JOIN dbo.SAL_Employee_Mst ae ON h.NewAssigneeEmpId = ae.pk_empid COLLATE DATABASE_DEFAULT
    WHERE h.TaskId = @TaskId
    ORDER BY h.CreatedAt ASC;
END;
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_GetLookups (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 1. STORED PROCEDURE: dbo.usp_HR_Task_GetLookups
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_GetLookups
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
            @ResolvedEmpId     = v.EmpId,
            @ResolvedUserId    = v.UserId,
            @ResolvedDeptId    = v.DeptId,
            @ResolvedName      = v.ResolvedName,
            @IsAdmin           = v.IsAdmin,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, v.CompanyId)
        FROM dbo.fn_HR_Task_ResolveViewer(@ViewerId, @UserType) v;

        IF @ResolvedDeptId IS NOT NULL AND @ResolvedDeptId <> ''
        BEGIN
            SELECT TOP 1 @ResolvedDeptName = ISNULL(d.description, '')
            FROM dbo.Department_Mst d
            WHERE d.pk_deptid = @ResolvedDeptId COLLATE DATABASE_DEFAULT;
        END

        IF @ResolvedEmpId IS NOT NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM dbo.Department_Mst WHERE fk_depHodid = @ResolvedEmpId COLLATE DATABASE_DEFAULT AND (@ResolvedCompanyId IS NULL OR fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT))
                SET @IsHod = 1;

            IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE (fk_FunctionalRepempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT OR fk_AdministrativeRepempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT) AND (@ResolvedCompanyId IS NULL OR fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT))
                SET @IsManager = 1;
        END
    END

    -- Fallback resolution for Department Name if empty
    IF (@ResolvedDeptName IS NULL OR @ResolvedDeptName = '') AND @ResolvedDeptId IS NOT NULL
    BEGIN
        SELECT TOP 1 @ResolvedDeptName = ISNULL(d.description, '')
        FROM dbo.Department_Mst d
        WHERE d.pk_deptid = @ResolvedDeptId COLLATE DATABASE_DEFAULT;
    END

    -- Fallback resolution for CompanyId if still empty
    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
    BEGIN
        IF @ResolvedEmpId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ResolvedEmpId COLLATE DATABASE_DEFAULT;
        IF (@ResolvedCompanyId IS NULL OR @ResolvedCompanyId = '') AND @ResolvedUserId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.UM_Users_Mst WHERE pk_userId = @ResolvedUserId COLLATE DATABASE_DEFAULT;
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

    -- Result Set 3: Initial Employee Dropdown (TOP 50)
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

    -- Result Set 4: Task Type Lookup (Deduplicated via ROW_NUMBER())
    WITH DistinctTaskTypes AS (
        SELECT 
            g.CodeId          AS TaskTypeId,
            g.Name            AS TaskTypeName,
            g.Code            AS TaskTypeCode,
            g.CodeDescription AS TaskTypeDescription,
            ROW_NUMBER() OVER (
                PARTITION BY g.CodeId 
                ORDER BY CASE 
                    WHEN @ResolvedCompanyId IS NOT NULL AND g.fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT THEN 1 
                    WHEN g.fk_companyId = '0' THEN 2 
                    ELSE 3 
                END, g.EntryDate DESC
            ) AS rn
        FROM dbo.LSP_Master_General g
        WHERE g.CodeTypeId = 24
          AND g.IsActive = 1
          AND (
              @ResolvedCompanyId IS NULL
              OR g.fk_companyId = '0'
              OR g.fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT
          )
    )
    SELECT TaskTypeId, TaskTypeName, TaskTypeCode, TaskTypeDescription
    FROM DistinctTaskTypes
    WHERE rn = 1
    ORDER BY CAST(TaskTypeId AS INT) ASC;
END;
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_ProcessRecurring (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 8. STORED PROCEDURE: dbo.usp_HR_Task_ProcessRecurring
-- Copies attachment, creator metadata, and uses UPDLOCK for task codes.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_ProcessRecurring
    @TargetTaskId    INT = NULL,
    @SuppressOutput  BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurTaskId INT;
    DECLARE @CurTaskCode VARCHAR(50);
    DECLARE @CurSubject NVARCHAR(250);
    DECLARE @CurDescription NVARCHAR(MAX);
    DECLARE @CurPriority VARCHAR(20);
    DECLARE @CurTargetDeptId VARCHAR(50);
    DECLARE @CurAssignedToEmpId VARCHAR(50);
    DECLARE @CurCreatedByEmpId VARCHAR(50);
    DECLARE @CurCreatedByUserId VARCHAR(50);
    DECLARE @CurCreatedByName NVARCHAR(150);
    DECLARE @CurCreatorDeptId VARCHAR(50);
    DECLARE @CurAttachmentName NVARCHAR(255);
    DECLARE @CurAttachmentPath NVARCHAR(500);
    DECLARE @CurRecurrenceType VARCHAR(20);
    DECLARE @CurRecurrenceInterval INT;
    DECLARE @CurRecurrenceDays VARCHAR(50);
    DECLARE @CurRecurrenceDayOfMonth INT;
    DECLARE @CurRecurrenceEndType VARCHAR(20);
    DECLARE @CurRecurrenceEndDate DATETIME;
    DECLARE @CurRecurrenceTotal INT;
    DECLARE @CurRecurrenceCount INT;
    DECLARE @CurDueOffsetHours INT;
    DECLARE @CurDueOffsetUnit VARCHAR(10);
    DECLARE @CurNextDate DATETIME;
    DECLARE @CurDueDate DATETIME;
    DECLARE @CurCompanyId VARCHAR(50);
    DECLARE @CurTaskTypeId INT;
    DECLARE @CurTaskTypeName VARCHAR(100);

    DECLARE @GeneratedCount INT = 0;
    DECLARE @NewChildTaskId INT;
    DECLARE @NewChildTaskCode VARCHAR(50);
    DECLARE @CalculatedDueDate DATETIME;
    DECLARE @ComputedNextOccurrence DATETIME;

    DECLARE recurring_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT 
        TaskId, TaskCode, Subject, Description, Priority, TargetDeptId, AssignedToEmpId,
        CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId,
        AttachmentName, AttachmentPath,
        RecurrenceType, RecurrenceInterval, RecurrenceDays, RecurrenceDayOfMonth,
        RecurrenceEndType, RecurrenceEndDate, RecurrenceOccurrencesTotal, RecurrenceOccurrencesCount,
        RecurrenceDueOffsetHours, RecurrenceDueOffsetUnit,
        ISNULL(NextOccurrenceDate, GETDATE()), DueDate, ISNULL(CompanyId, 'GU-1'), TaskTypeId, TaskTypeName
    FROM dbo.HR_TaskMaster
    WHERE IsActive = 1
      AND IsRecurring = 1
      AND (@TargetTaskId IS NULL OR TaskId = @TargetTaskId)
      AND (
          @TargetTaskId IS NOT NULL 
          OR (NextOccurrenceDate IS NOT NULL AND NextOccurrenceDate <= GETDATE())
      );

    OPEN recurring_cursor;
    FETCH NEXT FROM recurring_cursor INTO
        @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
        @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
        @CurAttachmentName, @CurAttachmentPath,
        @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
        @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
        @CurDueOffsetHours, @CurDueOffsetUnit,
        @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Check end conditions
        IF @CurRecurrenceEndType = 'AFTER_COUNT' AND @CurRecurrenceTotal IS NOT NULL AND @CurRecurrenceCount >= @CurRecurrenceTotal
        BEGIN
            FETCH NEXT FROM recurring_cursor INTO
                @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
                @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
                @CurAttachmentName, @CurAttachmentPath,
                @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
                @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
                @CurDueOffsetHours, @CurDueOffsetUnit,
                @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
            CONTINUE;
        END

        IF @CurRecurrenceEndType = 'ON_DATE' AND @CurRecurrenceEndDate IS NOT NULL AND GETDATE() > @CurRecurrenceEndDate
        BEGIN
            FETCH NEXT FROM recurring_cursor INTO
                @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
                @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
                @CurAttachmentName, @CurAttachmentPath,
                @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
                @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
                @CurDueOffsetHours, @CurDueOffsetUnit,
                @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
            CONTINUE;
        END

        -- Calculate SLA due date
        DECLARE @ActualOffsetHours INT = ISNULL(@CurDueOffsetHours, 24);
        IF @ActualOffsetHours <= 0 SET @ActualOffsetHours = 24;
        SET @CalculatedDueDate = DATEADD(HOUR, @ActualOffsetHours, GETDATE());

        -- Generate sequential TaskCode
        DECLARE @YearStr VARCHAR(4) = CAST(YEAR(GETDATE()) AS VARCHAR(4));
        DECLARE @NextNum INT = 1;

        SELECT @NextNum = ISNULL(MAX(CAST(RIGHT(TaskCode, 4) AS INT)), 0) + 1
        FROM dbo.HR_TaskMaster WITH (UPDLOCK, HOLDLOCK)
        WHERE TaskCode LIKE 'HR_TSK-' + @YearStr + '-%'
          AND ISNUMERIC(RIGHT(TaskCode, 4)) = 1;

        SET @NewChildTaskCode = 'HR_TSK-' + @YearStr + '-' + RIGHT('0000' + CAST(@NextNum AS VARCHAR(4)), 4);

        -- Insert newly spawned non-recurring instance into OPEN swimlane
        INSERT INTO dbo.HR_TaskMaster
        (
            TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
            CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
            AttachmentName, AttachmentPath,
            IsRecurring, RecurrenceType, RecurrenceInterval, NextOccurrenceDate, ParentTaskId,
            IsSelfTask, TaskTypeId, TaskTypeName, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
        )
        VALUES
        (
            @NewChildTaskCode, @CurSubject, @CurDescription, @CurPriority, 'OPEN', @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId, @CalculatedDueDate,
            @CurAttachmentName, @CurAttachmentPath,
            0, 'NONE', 1, NULL, @CurTaskId,
            0, @CurTaskTypeId, ISNULL(@CurTaskTypeName, 'General'), NULL, @CurCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewChildTaskId = SCOPE_IDENTITY();
        SET @GeneratedCount = @GeneratedCount + 1;
        SET @CurRecurrenceCount = @CurRecurrenceCount + 1;

        -- Record audit history on the newly generated child task
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, Remarks, ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewChildTaskId, 'RECURRENCE_GENERATED',
            CONCAT('Task automatically generated from recurring schedule #', @CurTaskCode, '.'),
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, GETDATE()
        );

        -- Dispatch notification for recurring child instance
        BEGIN TRY
            EXEC dbo.usp_HR_Task_DispatchNotification
                @TaskId = @NewChildTaskId,
                @EventType = 'RECURRENCE_GENERATED',
                @ActorEmpId = @CurCreatedByEmpId,
                @ActorName = @CurCreatedByName,
                @Remarks = 'Recurring schedule instance generated';
        END TRY
        BEGIN CATCH
        END CATCH;

        -- Calculate next occurrence date for template
        DECLARE @Interval INT = ISNULL(@CurRecurrenceInterval, 1);
        IF @Interval <= 0 SET @Interval = 1;

        IF @CurRecurrenceType = 'DAILY'
            SET @ComputedNextOccurrence = DATEADD(DAY, @Interval, @CurNextDate);
        ELSE IF @CurRecurrenceType = 'WEEKLY'
            SET @ComputedNextOccurrence = DATEADD(WEEK, @Interval, @CurNextDate);
        ELSE IF @CurRecurrenceType = 'MONTHLY'
        BEGIN
            DECLARE @TargetMDay INT = ISNULL(@CurRecurrenceDayOfMonth, DAY(@CurNextDate));
            IF @TargetMDay < 1 SET @TargetMDay = 1;
            IF @TargetMDay > 31 SET @TargetMDay = 31;

            DECLARE @NextMonthDate DATETIME = DATEADD(MONTH, @Interval, @CurNextDate);
            DECLARE @LastDayOfNextMonth INT = DAY(EOMONTH(@NextMonthDate));
            DECLARE @SafeMDay INT = CASE WHEN @TargetMDay > @LastDayOfNextMonth THEN @LastDayOfNextMonth ELSE @TargetMDay END;

            SET @ComputedNextOccurrence = DATEFROMPARTS(YEAR(@NextMonthDate), MONTH(@NextMonthDate), @SafeMDay);
        END
        ELSE IF @CurRecurrenceType = 'YEARLY'
            SET @ComputedNextOccurrence = DATEADD(YEAR, @Interval, @CurNextDate);
        ELSE
            SET @ComputedNextOccurrence = DATEADD(DAY, 1, @CurNextDate);

        -- Update the recurring master template
        UPDATE dbo.HR_TaskMaster
        SET NextOccurrenceDate = @ComputedNextOccurrence,
            RecurrenceOccurrencesCount = @CurRecurrenceCount,
            UpdatedAt = GETDATE()
        WHERE TaskId = @CurTaskId;

        FETCH NEXT FROM recurring_cursor INTO
            @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
            @CurAttachmentName, @CurAttachmentPath,
            @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
            @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
            @CurDueOffsetHours, @CurDueOffsetUnit,
            @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
    END

    CLOSE recurring_cursor;
    DEALLOCATE recurring_cursor;

    IF @SuppressOutput = 0
    BEGIN
        SELECT @GeneratedCount AS GeneratedCount;
    END
END;
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_SearchEmployees (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 5. STORED PROCEDURE: dbo.usp_HR_Task_SearchEmployees
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_SearchEmployees
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
-- OBJECT: dbo.usp_HR_Task_UpdateStatusAndRemarks (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 5. STORED PROCEDURE: dbo.usp_HR_Task_UpdateStatusAndRemarks
-- Checks authorization before allowing status transitions.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_UpdateStatusAndRemarks
    @TaskId             INT,
    @NewStatus          VARCHAR(20),
    @Remarks            NVARCHAR(MAX),
    @NewAssigneeEmpId   VARCHAR(50)   = '__KEEP__',
    @NewPriority        VARCHAR(20)   = NULL,
    @NewDueDate         DATETIME      = NULL,
    @AttachmentName     NVARCHAR(255) = NULL,
    @AttachmentPath     NVARCHAR(500) = NULL,
    @ActionById         VARCHAR(50)   = NULL,
    @ActionByName       NVARCHAR(150) = NULL,
    @UserType           VARCHAR(20)   = NULL,
    @CompanyId          VARCHAR(50)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Remarks IS NULL OR LTRIM(RTRIM(@Remarks)) = ''
    BEGIN
        RAISERROR('Mandatory remarks must be provided for task status transition or history update.', 16, 1);
        RETURN;
    END

    -- Authorization check
    IF @ActionById IS NOT NULL AND @ActionById <> ''
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.fn_HR_Task_VisibleTasks(@ActionById, @UserType, @CompanyId)
            WHERE TaskId = @TaskId
        )
        BEGIN
            RAISERROR('Not authorized to update this task.', 16, 1);
            RETURN;
        END
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

    -- Resolve actor using fn_HR_Task_ResolveViewer
    SELECT TOP 1
        @ResolvedActionByEmp  = EmpId,
        @ResolvedActionByUser = UserId,
        @ResolvedActorName    = ISNULL(@ActionByName, ResolvedName)
    FROM dbo.fn_HR_Task_ResolveViewer(@ActionById, @UserType);

    IF @ResolvedActorName IS NULL OR @ResolvedActorName = ''
        SET @ResolvedActorName = ISNULL(@ActionByName, 'User');

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

        -- Dispatch notification to stakeholders
        BEGIN TRY
            EXEC dbo.usp_HR_Task_DispatchNotification
                @TaskId = @TaskId,
                @EventType = @ActionType,
                @ActorEmpId = @ResolvedActionByEmp,
                @ActorName = @ResolvedActorName,
                @Remarks = @Remarks;
        END TRY
        BEGIN CATCH
        END CATCH;

        SELECT 1 AS Success, @TaskId AS TaskId, @NewStatus AS NewStatus;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- --------------------------------------------------------------------------------------
-- OBJECT: dbo.usp_HR_Task_UpdateTaskDetails (SQL_STORED_PROCEDURE)
-- --------------------------------------------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 6. STORED PROCEDURE: dbo.usp_HR_Task_UpdateTaskDetails
-- Checks authorization before allowing detail editing.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_UpdateTaskDetails
    @TaskId                         INT,
    @Subject                        NVARCHAR(250),
    @Description                    NVARCHAR(MAX)   = NULL,
    @Priority                       VARCHAR(20)     = 'MEDIUM',
    @TargetDeptId                   VARCHAR(50)     = NULL,
    @AssignedToEmpId                VARCHAR(50)     = NULL,
    @DueDate                        DATETIME        = NULL,
    @IsRecurring                    BIT             = 0,
    @RecurrenceType                 VARCHAR(20)     = 'NONE',
    @RecurrenceInterval             INT             = 1,
    @RecurrenceDays                 VARCHAR(100)    = NULL,
    @RecurrenceDayOfMonth           INT             = NULL,
    @RecurrenceEndType              VARCHAR(20)     = 'NEVER',
    @RecurrenceEndDate              DATETIME        = NULL,
    @RecurrenceOccurrencesTotal     INT             = NULL,
    @RecurrenceDueOffsetHours       INT             = 24,
    @RecurrenceDueOffsetUnit        VARCHAR(20)     = 'DAYS',
    @TaskTypeId                     INT             = NULL,
    @TaskTypeName                   NVARCHAR(100)   = 'General',
    @ActionById                     VARCHAR(50)     = NULL,
    @ActionByName                   NVARCHAR(150)   = 'Admin',
    @UserType                       VARCHAR(20)     = NULL,
    @CompanyId                      VARCHAR(50)     = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.HR_TaskMaster WHERE TaskId = @TaskId)
    BEGIN
        SELECT 0 AS Success, 'Task not found.' AS Message;
        RETURN;
    END

    -- Authorization check
    IF @ActionById IS NOT NULL AND @ActionById <> ''
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.fn_HR_Task_VisibleTasks(@ActionById, @UserType, @CompanyId)
            WHERE TaskId = @TaskId
        )
        BEGIN
            SELECT 0 AS Success, 'Not authorized to update this task.' AS Message;
            RETURN;
        END
    END

    UPDATE dbo.HR_TaskMaster
    SET Subject                     = @Subject,
        Description                 = @Description,
        Priority                    = ISNULL(@Priority, 'MEDIUM'),
        TargetDeptId                = @TargetDeptId,
        AssignedToEmpId             = @AssignedToEmpId,
        DueDate                     = ISNULL(@DueDate, DueDate),
        IsRecurring                 = ISNULL(@IsRecurring, 0),
        RecurrenceType              = ISNULL(@RecurrenceType, 'NONE'),
        RecurrenceInterval          = ISNULL(@RecurrenceInterval, 1),
        RecurrenceDays              = @RecurrenceDays,
        RecurrenceDayOfMonth        = @RecurrenceDayOfMonth,
        RecurrenceEndType           = ISNULL(@RecurrenceEndType, 'NEVER'),
        RecurrenceEndDate           = @RecurrenceEndDate,
        RecurrenceOccurrencesTotal  = @RecurrenceOccurrencesTotal,
        RecurrenceDueOffsetHours    = @RecurrenceDueOffsetHours,
        RecurrenceDueOffsetUnit     = @RecurrenceDueOffsetUnit,
        TaskTypeId                  = @TaskTypeId,
        TaskTypeName                = ISNULL(@TaskTypeName, 'General'),
        UpdatedAt                   = GETDATE()
    WHERE TaskId = @TaskId;

    INSERT INTO dbo.HR_TaskHistory
    (
        TaskId, ActionType, Remarks, ActionByName, CreatedAt
    )
    VALUES
    (
        @TaskId, 'EDITED', 'Task details and cadence parameters updated.', @ActionByName, GETDATE()
    );

    SELECT 1 AS Success, 'Task updated successfully.' AS Message;
END;
GO
