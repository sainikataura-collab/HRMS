-- =============================================================================
-- Fix: usp_HR_Task_ProcessRecurring and usp_HR_Task_GetBoard
-- SET QUOTED_IDENTIFIER ON must be executed BEFORE CREATE OR ALTER PROCEDURE!
-- =============================================================================

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_ProcessRecurring
    @TargetTaskId   INT = NULL,
    @SuppressOutput BIT = 0
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
               ISNULL(NextOccurrenceDate, GETDATE()), DueDate, ISNULL(CompanyId, 'GU-1'), TaskTypeId, TaskTypeName
        FROM dbo.HR_TaskMaster
        WHERE IsActive = 1
          AND IsRecurring = 1
          AND RecurrenceType IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
          AND (
              (@TargetTaskId IS NOT NULL AND TaskId = @TargetTaskId)
              OR
              (@TargetTaskId IS NULL AND NextOccurrenceDate IS NOT NULL AND NextOccurrenceDate <= GETDATE())
          )
          AND (
              @TargetTaskId IS NOT NULL -- Force run if triggered explicitly
              OR RecurrenceEndType IS NULL 
              OR RecurrenceEndType = 'NEVER' 
              OR (RecurrenceEndType = 'ON_DATE' AND (RecurrenceEndDate IS NULL OR NextOccurrenceDate <= RecurrenceEndDate))
              OR (RecurrenceEndType = 'AFTER_COUNT' AND (RecurrenceOccurrencesTotal IS NULL OR ISNULL(RecurrenceOccurrencesCount, 0) < RecurrenceOccurrencesTotal))
          );

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
        SET @CalculatedDueDate = DATEADD(HOUR, @OffsetHrs, GETDATE());

        -- Generate sequential TaskCode
        DECLARE @YearStr VARCHAR(4) = CAST(YEAR(GETDATE()) AS VARCHAR(4));
        DECLARE @NextNum INT = 1;

        SELECT @NextNum = ISNULL(MAX(CAST(RIGHT(TaskCode, 4) AS INT)), 0) + 1
        FROM dbo.HR_TaskMaster
        WHERE TaskCode LIKE 'HR_TSK-' + @YearStr + '-%'
          AND ISNUMERIC(RIGHT(TaskCode, 4)) = 1;

        SET @NewChildTaskCode = 'HR_TSK-' + @YearStr + '-' + RIGHT('0000' + CAST(@NextNum AS VARCHAR(4)), 4);

        -- Insert newly spawned non-recurring instance into OPEN swimlane
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
            0, @CurTaskTypeId, ISNULL(@CurTaskTypeName, 'General'), NULL, @CurCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewChildTaskId = SCOPE_IDENTITY();
        SET @GeneratedCount = @GeneratedCount + 1;
        SET @CurRecurrenceCount = @CurRecurrenceCount + 1;

        -- Record audit history on the newly generated child task
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, OldStatus, NewStatus, Remarks, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewChildTaskId, 'RECURRENCE_GENERATED', NULL, 'OPEN',
            CONCAT('Task instance generated from recurring schedule (Template: ', @CurTaskId, ', Run #', @CurRecurrenceCount, '). Deadline set to ', CONVERT(VARCHAR(20), @CalculatedDueDate, 120), '.'),
            'System Scheduler', GETDATE()
        );

        -- Advance NextOccurrenceDate on the parent recurring template
        DECLARE @AdvNextDate DATETIME = ISNULL(@CurNextDate, GETDATE());
        IF @AdvNextDate <= GETDATE()
        BEGIN
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
        END

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
    END

    CLOSE curRecurring;
    DEALLOCATE curRecurring;

    IF @SuppressOutput = 0
    BEGIN
        SELECT @GeneratedCount AS GeneratedCount;
    END
END;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

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
    @TaskTypeId         INT             = NULL,
    @OnlyUnassigned     BIT             = 0,
    @OnlyOverdue        BIT             = 0,
    @SearchText         NVARCHAR(200)   = NULL,
    @CompanyId          VARCHAR(50)     = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Automatically evaluate any due recurring schedules silently (NO result set output)
    EXEC dbo.usp_HR_Task_ProcessRecurring @SuppressOutput = 1;

    DECLARE @ResolvedEmpId      VARCHAR(50) = NULL;
    DECLARE @ResolvedUserId     VARCHAR(50) = NULL;
    DECLARE @ResolvedCompanyId  VARCHAR(50) = @CompanyId;
    DECLARE @IsAdmin            BIT = 0;
    DECLARE @IsHod              BIT = 0;
    DECLARE @IsManager          BIT = 0;

    -- Resolve identity
    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ViewerId COLLATE DATABASE_DEFAULT)
    BEGIN
        SET @ResolvedEmpId = @ViewerId;
        SELECT TOP 1 
            @ResolvedUserId    = u.pk_userId,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId)
        FROM dbo.SAL_Employee_Mst e
        LEFT JOIN dbo.UM_Users_Mst u ON u.fk_empId = e.pk_empid
        WHERE e.pk_empid = @ViewerId COLLATE DATABASE_DEFAULT;
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.UM_Users_Mst WHERE pk_userId = @ViewerId COLLATE DATABASE_DEFAULT)
    BEGIN
        SET @ResolvedUserId = @ViewerId;
        SELECT TOP 1 
            @ResolvedEmpId     = u.fk_empId,
            @RoleId            = ISNULL(@RoleId, u.fk_roleId),
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId)
        FROM dbo.UM_Users_Mst u
        LEFT JOIN dbo.SAL_Employee_Mst e ON e.pk_empid = u.fk_empId
        WHERE u.pk_userId = @ViewerId COLLATE DATABASE_DEFAULT;
    END

    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
        SET @ResolvedCompanyId = 'GU-1';

    -- Check if Admin
    IF UPPER(ISNULL(@UserType, '')) IN ('ADMIN', 'SUPERADMIN') OR @RoleId IN (1, 2)
        SET @IsAdmin = 1;

    -- If Viewer is not explicitly linked to an employee or role, default to Admin so board is not empty
    IF @ResolvedEmpId IS NULL AND @ResolvedUserId IS NULL
        SET @IsAdmin = 1;

    -- Temp tables for HOD and manager scoping
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

    -- Base Filtered Query into temp table
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
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst e ON t.AssignedToEmpId = e.pk_empid COLLATE DATABASE_DEFAULT
    LEFT JOIN #HodDepts hod ON t.TargetDeptId = hod.DeptId
    LEFT JOIN #TeamMembers tm ON t.AssignedToEmpId = tm.EmpId
    WHERE t.IsActive = 1
      -- Strict multi-tenant company isolation
      AND (@ResolvedCompanyId IS NULL OR t.CompanyId = @ResolvedCompanyId COLLATE DATABASE_DEFAULT)
      -- Role Scoping
      AND (
          @IsAdmin = 1
          OR (@ResolvedEmpId IS NOT NULL AND (
                t.AssignedToEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT
             OR t.CreatedByEmpId  = @ResolvedEmpId COLLATE DATABASE_DEFAULT
             OR hod.DeptId IS NOT NULL
             OR tm.EmpId IS NOT NULL
          ))
          OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId COLLATE DATABASE_DEFAULT)
      )
      -- Explicit User Scopes
      AND (
          @Scope = 'ALL'
          OR (@Scope = 'MY_TASKS' AND @ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT)
          OR (@Scope = 'CREATED_BY_ME' AND ((@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT) OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId COLLATE DATABASE_DEFAULT)))
          OR (@Scope = 'DEPT_TASKS' AND hod.DeptId IS NOT NULL)
          OR (@Scope = 'SELF_TASKS' AND t.IsSelfTask = 1 AND @ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT)
      )
      -- Additional Filters
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
          OR LTRIM(RTRIM(@SearchText)) = ''
          OR t.Subject LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR t.Description LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR t.TaskCode LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR ISNULL(e.empname, '') LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR ISNULL(d.description, '') LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
      );

    -- Result Set 1: High-level KPI Counts (MUST be Exactly Result Set #1)
    SELECT 
        COUNT(*) AS TotalTasks,
        SUM(CASE WHEN Status = 'OPEN' THEN 1 ELSE 0 END) AS OpenTasks,
        SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) AS ClosedTasks,
        SUM(CASE WHEN Status = 'ON_HOLD' OR Status = 'ON HOLD' THEN 1 ELSE 0 END) AS OnHoldTasks,
        SUM(CASE WHEN AssignedToEmpId IS NULL THEN 1 ELSE 0 END) AS UnassignedTasks,
        SUM(CASE WHEN IsOverdue = 1 THEN 1 ELSE 0 END) AS OverdueTasks
    FROM #FilteredTasks;

    -- Result Set 2: Kanban Tasks (MUST be Exactly Result Set #2)
    SELECT * 
    FROM #FilteredTasks
    ORDER BY 
        CASE Priority 
            WHEN 'URGENT' THEN 1 
            WHEN 'HIGH' THEN 2 
            WHEN 'MEDIUM' THEN 3 
            WHEN 'LOW' THEN 4 
            ELSE 5 
        END,
        DueDate ASC,
        CreatedAt DESC;

    DROP TABLE #FilteredTasks;
    DROP TABLE #HodDepts;
    DROP TABLE #TeamMembers;
END;
GO
