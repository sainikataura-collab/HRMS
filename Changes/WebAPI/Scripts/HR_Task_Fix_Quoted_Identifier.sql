USE [HRBook];
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Ensure table and index are clean
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskMaster_Recurrence' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    DROP INDEX IX_HR_TaskMaster_Recurrence ON dbo.HR_TaskMaster;
END
GO

-- Recreate index with QUOTED_IDENTIFIER ON
CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_Recurrence 
ON dbo.HR_TaskMaster(IsRecurring, NextOccurrenceDate) 
WHERE IsRecurring = 1;
GO

-- 2. dbo.usp_HR_Task_ProcessRecurring with QUOTED_IDENTIFIER ON
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_ProcessRecurring
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_NULLS ON;
    SET QUOTED_IDENTIFIER ON;

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
    DECLARE @CurRecurrenceDays VARCHAR(50);
    DECLARE @CurRecurrenceDayOfMonth INT;
    DECLARE @CurRecurrenceEndType VARCHAR(20);
    DECLARE @CurRecurrenceEndDate DATETIME;
    DECLARE @CurRecurrenceTotal INT;
    DECLARE @CurRecurrenceCount INT;
    DECLARE @CurRecurrenceDueOffsetHours INT;
    DECLARE @CurRecurrenceDueOffsetUnit VARCHAR(10);
    DECLARE @CurNextDate DATETIME;
    DECLARE @CurDueDate DATETIME;
    DECLARE @CurCompanyId VARCHAR(50);
    DECLARE @CurTaskTypeId INT;
    DECLARE @CurTaskTypeName VARCHAR(100);
    DECLARE @NewChildTaskId INT;
    DECLARE @NewChildTaskCode VARCHAR(50);
    DECLARE @CalculatedDueDate DATETIME;

    DECLARE curRecurring CURSOR LOCAL FAST_FORWARD FOR
        SELECT TaskId, Subject, Description, Priority, TargetDeptId, AssignedToEmpId,
               CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId,
               RecurrenceType, ISNULL(RecurrenceInterval, 1), RecurrenceDays, RecurrenceDayOfMonth,
               ISNULL(RecurrenceEndType, 'NEVER'), RecurrenceEndDate, RecurrenceOccurrencesTotal,
               ISNULL(RecurrenceOccurrencesCount, 0), ISNULL(RecurrenceDueOffsetHours, 24), ISNULL(RecurrenceDueOffsetUnit, 'DAYS'),
               NextOccurrenceDate, DueDate, ISNULL(CompanyId, 'GU-1'), TaskTypeId, TaskTypeName
        FROM dbo.HR_TaskMaster
        WHERE IsActive = 1
          AND IsRecurring = 1
          AND RecurrenceType IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
          AND NextOccurrenceDate IS NOT NULL
          AND NextOccurrenceDate <= GETDATE()
          AND (RecurrenceEndType IS NULL OR RecurrenceEndType = 'NEVER' 
               OR (RecurrenceEndType = 'ON_DATE' AND (RecurrenceEndDate IS NULL OR NextOccurrenceDate <= RecurrenceEndDate))
               OR (RecurrenceEndType = 'AFTER_COUNT' AND (RecurrenceOccurrencesTotal IS NULL OR ISNULL(RecurrenceOccurrencesCount, 0) < RecurrenceOccurrencesTotal)));

    OPEN curRecurring;
    FETCH NEXT FROM curRecurring INTO 
        @CurTaskId, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
        @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
        @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
        @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal,
        @CurRecurrenceCount, @CurRecurrenceDueOffsetHours, @CurRecurrenceDueOffsetUnit,
        @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Calculate due date for child task using template offset
        DECLARE @OffsetHrs INT = ISNULL(@CurRecurrenceDueOffsetHours, 24);
        IF @OffsetHrs <= 0 SET @OffsetHrs = 24;
        SET @CalculatedDueDate = DATEADD(HOUR, @OffsetHrs, @CurNextDate);

        -- Generate sequential TaskCode
        SET @NewChildTaskCode = 'HR_TSK-' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-' + 
                                RIGHT('0000' + CAST((ISNULL((SELECT MAX(TaskId) FROM dbo.HR_TaskMaster), 1000) + 1) AS VARCHAR(10)), 4);

        -- Insert child task instance
        INSERT INTO dbo.HR_TaskMaster
        (
            TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
            CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
            IsRecurring, RecurrenceType, RecurrenceInterval, NextOccurrenceDate, ParentTaskId,
            IsSelfTask, TaskTypeId, TaskTypeName, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
        )
        VALUES
        (
            @NewChildTaskCode, @CurSubject, @CurDescription, @CurPriority, 'OPEN', @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId, @CalculatedDueDate,
            0, 'NONE', 1, NULL, @CurTaskId,
            0, @CurTaskTypeId, @CurTaskTypeName, NULL, @CurCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewChildTaskId = SCOPE_IDENTITY();
        SET @GeneratedCount = @GeneratedCount + 1;
        SET @CurRecurrenceCount = @CurRecurrenceCount + 1;

        -- Record audit history
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, OldStatus, NewStatus, Remarks, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewChildTaskId, 'RECURRENCE_GENERATED', NULL, 'OPEN',
            CONCAT('Task instance generated automatically from recurring schedule (Template: ', @CurTaskId, ', Run #', @CurRecurrenceCount, '). Deadline set to ', CONVERT(VARCHAR(20), @CalculatedDueDate, 120), '.'),
            'System Scheduler', GETDATE()
        );

        -- Advance NextOccurrenceDate
        DECLARE @AdvNextDate DATETIME = @CurNextDate;
        WHILE @AdvNextDate <= GETDATE()
        BEGIN
            IF @CurRecurrenceType = 'DAILY'
                SET @AdvNextDate = DATEADD(DAY, @CurRecurrenceInterval, @AdvNextDate);
            ELSE IF @CurRecurrenceType = 'WEEKLY'
                SET @AdvNextDate = DATEADD(WEEK, @CurRecurrenceInterval, @AdvNextDate);
            ELSE IF @CurRecurrenceType = 'MONTHLY'
            BEGIN
                IF @CurRecurrenceDayOfMonth IS NOT NULL AND @CurRecurrenceDayOfMonth BETWEEN 1 AND 28
                    SET @AdvNextDate = DATEFROMPARTS(YEAR(DATEADD(MONTH, @CurRecurrenceInterval, @AdvNextDate)), MONTH(DATEADD(MONTH, @CurRecurrenceInterval, @AdvNextDate)), @CurRecurrenceDayOfMonth);
                ELSE
                    SET @AdvNextDate = DATEADD(MONTH, @CurRecurrenceInterval, @AdvNextDate);
            END
            ELSE IF @CurRecurrenceType = 'YEARLY'
                SET @AdvNextDate = DATEADD(YEAR, @CurRecurrenceInterval, @AdvNextDate);
            ELSE
                BREAK;
        END

        IF @CurRecurrenceEndType = 'ON_DATE' AND @CurRecurrenceEndDate IS NOT NULL AND @AdvNextDate > @CurRecurrenceEndDate
            SET @AdvNextDate = NULL;
        ELSE IF @CurRecurrenceEndType = 'AFTER_COUNT' AND @CurRecurrenceTotal IS NOT NULL AND @CurRecurrenceCount >= @CurRecurrenceTotal
            SET @AdvNextDate = NULL;

        UPDATE dbo.HR_TaskMaster
        SET NextOccurrenceDate = @AdvNextDate,
            RecurrenceOccurrencesCount = @CurRecurrenceCount,
            UpdatedAt = GETDATE()
        WHERE TaskId = @CurTaskId;

        FETCH NEXT FROM curRecurring INTO 
            @CurTaskId, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
            @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
            @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal,
            @CurRecurrenceCount, @CurRecurrenceDueOffsetHours, @CurRecurrenceDueOffsetUnit,
            @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
    END;

    CLOSE curRecurring;
    DEALLOCATE curRecurring;

    RETURN @GeneratedCount;
END;
GO

-- 3. dbo.usp_HR_Task_Create with QUOTED_IDENTIFIER ON
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_Create
    @Subject                    NVARCHAR(250),
    @Description                NVARCHAR(MAX)   = NULL,
    @Priority                   VARCHAR(20)     = 'MEDIUM',
    @Status                     VARCHAR(20)     = 'OPEN',
    @TargetDeptId               VARCHAR(50)     = NULL,
    @AssignedToEmpId            VARCHAR(50)     = NULL,
    @DueDate                    DATETIME,
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
    @CompanyId                  VARCHAR(50)     = NULL,
    @InitialRemarks             NVARCHAR(MAX)   = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_NULLS ON;
    SET QUOTED_IDENTIFIER ON;

    DECLARE @CreatedByEmpId    VARCHAR(50) = NULL;
    DECLARE @CreatedByUserId   VARCHAR(50) = NULL;
    DECLARE @CreatorDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedName      NVARCHAR(150) = ISNULL(@ActionByName, 'User');
    DECLARE @ResolvedCompanyId VARCHAR(50) = @CompanyId;
    DECLARE @ResolvedTaskType  VARCHAR(100) = @TaskTypeName;
    DECLARE @TaskCode          VARCHAR(50);
    DECLARE @NewTaskId         INT;
    DECLARE @NextOccurDate     DATETIME = NULL;
    DECLARE @CalculatedInitialDue DATETIME = @DueDate;

    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ActionById)
    BEGIN
        SELECT TOP 1 
            @CreatedByEmpId    = e.pk_empid,
            @CreatorDeptId     = e.fk_deptid,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId),
            @ResolvedName      = ISNULL(@ActionByName, e.empname)
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
            SELECT TOP 1 
                @CreatorDeptId     = e.fk_deptid,
                @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId)
            FROM dbo.SAL_Employee_Mst e 
            WHERE pk_empid = @CreatedByEmpId;
        END
    END
    ELSE
    BEGIN
        SET @CreatedByUserId = @ActionById;
    END

    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
        SET @ResolvedCompanyId = 'GU-1';

    IF @TaskTypeId IS NOT NULL AND (@ResolvedTaskType IS NULL OR LTRIM(RTRIM(@ResolvedTaskType)) = '')
    BEGIN
        SELECT TOP 1 @ResolvedTaskType = Name 
        FROM dbo.LSP_Master_General 
        WHERE CodeTypeId = 24 AND CodeId = @TaskTypeId;
    END

    IF @ResolvedTaskType IS NULL OR LTRIM(RTRIM(@ResolvedTaskType)) = ''
        SET @ResolvedTaskType = 'General';

    IF (@TargetDeptId IS NULL OR LTRIM(RTRIM(@TargetDeptId)) = '') AND (@AssignedToEmpId IS NOT NULL)
    BEGIN
        SELECT TOP 1 @TargetDeptId = fk_deptid FROM dbo.SAL_Employee_Mst WHERE pk_empid = @AssignedToEmpId;
    END

    IF @IsSelfTask = 1 AND @CreatedByEmpId IS NOT NULL AND (@AssignedToEmpId IS NULL OR @AssignedToEmpId = '')
    BEGIN
        SET @AssignedToEmpId = @CreatedByEmpId;
    END

    IF @RecurrenceDueOffsetHours IS NULL OR @RecurrenceDueOffsetHours <= 0
        SET @RecurrenceDueOffsetHours = 24;

    IF @IsRecurring = 1 AND @RecurrenceType IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
    BEGIN
        SET @CalculatedInitialDue = DATEADD(HOUR, @RecurrenceDueOffsetHours, @DueDate);

        IF @RecurrenceType = 'DAILY'
            SET @NextOccurDate = DATEADD(DAY, ISNULL(@RecurrenceInterval, 1), @DueDate);
        ELSE IF @RecurrenceType = 'WEEKLY'
            SET @NextOccurDate = DATEADD(WEEK, ISNULL(@RecurrenceInterval, 1), @DueDate);
        ELSE IF @RecurrenceType = 'MONTHLY'
        BEGIN
            IF @RecurrenceDayOfMonth IS NOT NULL AND @RecurrenceDayOfMonth BETWEEN 1 AND 28
                SET @NextOccurDate = DATEFROMPARTS(YEAR(DATEADD(MONTH, ISNULL(@RecurrenceInterval, 1), @DueDate)), MONTH(DATEADD(MONTH, ISNULL(@RecurrenceInterval, 1), @DueDate)), @RecurrenceDayOfMonth);
            ELSE
                SET @NextOccurDate = DATEADD(MONTH, ISNULL(@RecurrenceInterval, 1), @DueDate);
        END
        ELSE IF @RecurrenceType = 'YEARLY'
            SET @NextOccurDate = DATEADD(YEAR, ISNULL(@RecurrenceInterval, 1), @DueDate);

        IF @RecurrenceEndType = 'ON_DATE' AND @RecurrenceEndDate IS NOT NULL AND @NextOccurDate > @RecurrenceEndDate
            SET @NextOccurDate = NULL;
    END;

    SET @TaskCode = 'HR_TSK-' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-' + 
                    RIGHT('0000' + CAST((ISNULL((SELECT MAX(TaskId) FROM dbo.HR_TaskMaster), 1000) + 1) AS VARCHAR(10)), 4);

    INSERT INTO dbo.HR_TaskMaster
    (
        TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
        CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
        AttachmentName, AttachmentPath, IsRecurring, RecurrenceType, RecurrenceInterval,
        RecurrenceDays, RecurrenceDayOfMonth, RecurrenceEndType, RecurrenceEndDate,
        RecurrenceOccurrencesTotal, RecurrenceOccurrencesCount, RecurrenceDueOffsetHours, RecurrenceDueOffsetUnit,
        NextOccurrenceDate, ParentTaskId, IsSelfTask, TaskTypeId, TaskTypeName, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
    )
    VALUES
    (
        @TaskCode, @Subject, @Description, ISNULL(@Priority, 'MEDIUM'), ISNULL(@Status, 'OPEN'),
        @TargetDeptId, @AssignedToEmpId, @CreatedByEmpId, @CreatedByUserId, @ResolvedName, @CreatorDeptId,
        @CalculatedInitialDue, @AttachmentName, @AttachmentPath, ISNULL(@IsRecurring, 0), ISNULL(@RecurrenceType, 'NONE'),
        ISNULL(@RecurrenceInterval, 1), @RecurrenceDays, @RecurrenceDayOfMonth,
        ISNULL(@RecurrenceEndType, 'NEVER'), @RecurrenceEndDate, @RecurrenceOccurrencesTotal, 0,
        @RecurrenceDueOffsetHours, ISNULL(@RecurrenceDueOffsetUnit, 'DAYS'),
        @NextOccurDate, NULL, ISNULL(@IsSelfTask, 0), @TaskTypeId, @ResolvedTaskType,
        CASE WHEN @Status = 'CLOSED' THEN GETDATE() ELSE NULL END, @ResolvedCompanyId, GETDATE(), GETDATE(), 1
    );

    SET @NewTaskId = SCOPE_IDENTITY();

    INSERT INTO dbo.HR_TaskHistory
    (
        TaskId, ActionType, OldStatus, NewStatus, NewAssigneeEmpId,
        Remarks, AttachmentName, AttachmentPath, ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
    )
    VALUES
    (
        @NewTaskId, 'CREATED', NULL, ISNULL(@Status, 'OPEN'), @AssignedToEmpId,
        ISNULL(@InitialRemarks, CONCAT('Task created under ', @ResolvedTaskType, '.')), @AttachmentName, @AttachmentPath,
        @CreatedByEmpId, @CreatedByUserId, @ResolvedName, GETDATE()
    );

    SELECT 
        TaskId, TaskCode, Subject, Status, Priority, TaskTypeId, TaskTypeName, AssignedToEmpId, TargetDeptId, DueDate, CompanyId, CreatedAt
    FROM dbo.HR_TaskMaster
    WHERE TaskId = @NewTaskId;
END;
GO

-- 4. dbo.usp_HR_Task_GetBoard with QUOTED_IDENTIFIER ON
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetBoard
    @ViewerId       VARCHAR(50) = NULL,
    @UserType       VARCHAR(20) = NULL,
    @RoleId         INT         = NULL,
    @CompanyId      VARCHAR(50) = NULL,
    @Perspective    VARCHAR(20) = 'ALL',
    @DepartmentId   VARCHAR(50) = NULL,
    @AssigneeEmpId  VARCHAR(50) = NULL,
    @Priority       VARCHAR(20) = NULL,
    @Status         VARCHAR(20) = NULL,
    @TaskTypeId     INT         = NULL,
    @SearchText     NVARCHAR(150)= NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_NULLS ON;
    SET QUOTED_IDENTIFIER ON;

    -- Trigger recurrence evaluation safely
    EXEC dbo.usp_HR_Task_ProcessRecurring;

    DECLARE @ResolvedEmpId      VARCHAR(50) = NULL;
    DECLARE @ResolvedDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedCompanyId  VARCHAR(50) = @CompanyId;
    DECLARE @IsAdmin            BIT = 0;
    DECLARE @IsHod              BIT = 0;
    DECLARE @IsManager          BIT = 0;

    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ViewerId)
    BEGIN
        SELECT TOP 1 
            @ResolvedEmpId     = e.pk_empid,
            @ResolvedDeptId    = e.fk_deptid,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId)
        FROM dbo.SAL_Employee_Mst e
        WHERE e.pk_empid = @ViewerId;
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.UM_Users_Mst WHERE pk_userId = @ViewerId)
    BEGIN
        SELECT TOP 1 
            @ResolvedEmpId     = u.fk_empId,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, u.fk_companyId)
        FROM dbo.UM_Users_Mst u
        WHERE u.pk_userId = @ViewerId;

        IF @ResolvedEmpId IS NOT NULL
        BEGIN
            SELECT TOP 1 @ResolvedDeptId = fk_deptid FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ResolvedEmpId;
        END
    END

    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
        SET @ResolvedCompanyId = 'GU-1';

    IF UPPER(ISNULL(@UserType, '')) IN ('ADMIN', 'SUPERADMIN') OR @RoleId IN (1, 2)
        SET @IsAdmin = 1;

    -- Scoping tables
    CREATE TABLE #HodDepts (
        DeptId VARCHAR(50) COLLATE DATABASE_DEFAULT PRIMARY KEY
    );

    CREATE TABLE #TeamMembers (
        EmpId VARCHAR(50) COLLATE DATABASE_DEFAULT PRIMARY KEY
    );

    IF @ResolvedEmpId IS NOT NULL
    BEGIN
        INSERT INTO #HodDepts (DeptId)
        SELECT pk_deptid 
        FROM dbo.Department_Mst 
        WHERE fk_depHodid = @ResolvedEmpId COLLATE DATABASE_DEFAULT
          AND (@ResolvedCompanyId IS NULL OR fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT);

        IF EXISTS (SELECT 1 FROM #HodDepts)
            SET @IsHod = 1;

        INSERT INTO #TeamMembers (EmpId)
        SELECT pk_empid 
        FROM dbo.SAL_Employee_Mst 
        WHERE (fk_FunctionalRepempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT 
               OR fk_AdministrativeRepempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT)
          AND (@ResolvedCompanyId IS NULL OR fk_companyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT);

        IF EXISTS (SELECT 1 FROM #TeamMembers)
            SET @IsManager = 1;
    END;

    -- Return Tasks
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
        t.NextOccurrenceDate,
        t.ParentTaskId,
        pt.TaskCode AS ParentTaskCode,
        t.IsSelfTask,
        t.TaskTypeId,
        ISNULL(t.TaskTypeName, 'General') AS TaskTypeName,
        t.ClosedAt,
        t.CompanyId,
        t.CreatedAt,
        t.UpdatedAt,
        CASE WHEN t.Status NOT IN ('CLOSED') AND t.DueDate < GETDATE() THEN 1 ELSE 0 END AS IsOverdue,
        CASE WHEN t.Status NOT IN ('CLOSED') AND t.DueDate < GETDATE() 
             THEN ROUND(DATEDIFF(MINUTE, t.DueDate, GETDATE()) / 60.0, 1) 
             ELSE 0.0 END AS OverdueHours,
        DATEDIFF(MINUTE, t.CreatedAt, GETDATE()) AS AgeMinutes,
        (SELECT COUNT(1) FROM dbo.HR_TaskHistory h WHERE h.TaskId = t.TaskId) AS HistoryCount
    FROM dbo.HR_TaskMaster t
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst e ON t.AssignedToEmpId = e.pk_empid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.HR_TaskMaster pt ON t.ParentTaskId = pt.TaskId
    WHERE t.IsActive = 1
      AND t.CompanyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT
      AND (
          @IsAdmin = 1
          OR (@Perspective = 'MINE' AND (t.AssignedToEmpId = @ResolvedEmpId OR t.CreatedByEmpId = @ResolvedEmpId))
          OR (@Perspective = 'CREATED_BY_ME' AND t.CreatedByEmpId = @ResolvedEmpId)
          OR (@Perspective = 'MY_DEPT' AND (
              t.TargetDeptId IN (SELECT DeptId FROM #HodDepts)
              OR t.TargetDeptId = @ResolvedDeptId
              OR t.CreatorDeptId = @ResolvedDeptId
          ))
          OR (@Perspective = 'ALL' AND (
              @IsHod = 1 AND t.TargetDeptId IN (SELECT DeptId FROM #HodDepts)
              OR @IsManager = 1 AND t.AssignedToEmpId IN (SELECT EmpId FROM #TeamMembers)
              OR t.AssignedToEmpId = @ResolvedEmpId 
              OR t.CreatedByEmpId = @ResolvedEmpId
              OR (t.AssignedToEmpId IS NULL AND (t.TargetDeptId IS NULL OR t.TargetDeptId = @ResolvedDeptId))
          ))
      )
      AND (@DepartmentId IS NULL OR LTRIM(RTRIM(@DepartmentId)) = '' OR t.TargetDeptId = @DepartmentId COLLATE DATABASE_DEFAULT)
      AND (@AssigneeEmpId IS NULL OR LTRIM(RTRIM(@AssigneeEmpId)) = '' OR t.AssignedToEmpId = @AssigneeEmpId COLLATE DATABASE_DEFAULT)
      AND (@Priority IS NULL OR LTRIM(RTRIM(@Priority)) = '' OR t.Priority = @Priority COLLATE DATABASE_DEFAULT)
      AND (@Status IS NULL OR LTRIM(RTRIM(@Status)) = '' OR t.Status = @Status COLLATE DATABASE_DEFAULT)
      AND (@TaskTypeId IS NULL OR t.TaskTypeId = @TaskTypeId)
      AND (
          @SearchText IS NULL OR LTRIM(RTRIM(@SearchText)) = ''
          OR t.Subject LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR t.TaskCode LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR ISNULL(e.empname, '') LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR ISNULL(t.TaskTypeName, '') LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
      )
    ORDER BY 
        CASE WHEN t.Status NOT IN ('CLOSED') AND t.DueDate < GETDATE() THEN 0 ELSE 1 END,
        CASE t.Priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
        t.DueDate ASC;

    DROP TABLE #HodDepts;
    DROP TABLE #TeamMembers;
END;
GO

