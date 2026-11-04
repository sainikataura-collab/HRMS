USE [HRBook];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ======================================================================================
-- 1. GENERAL MASTER: Seed CodeType 'Task Type' in dbo.LSP_Master_CodeType
-- ======================================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.LSP_Master_CodeType WHERE CodeTypeId = 24 OR CodeType = 'Task Type')
BEGIN
    INSERT INTO dbo.LSP_Master_CodeType 
    (
        CodeTypeId, CodeType, HasUserAccess, IsActive, EntryBy, EntryDate, 
        UsedIn, IsOrganizationSpecific, IsCodeRequired
    )
    VALUES 
    (
        24, 'Task Type', 1, 1, '1', GETDATE(), 
        'Task Manager', 1, 1
    );
END
GO

-- ======================================================================================
-- 2. GENERAL MASTER: Seed Task Type Items in dbo.LSP_Master_General
-- ======================================================================================
DECLARE @CompanyList TABLE (CompanyId VARCHAR(100));
INSERT INTO @CompanyList (CompanyId)
SELECT DISTINCT fk_companyId FROM dbo.LSP_Master_General
UNION 
SELECT 'GU-1'
UNION 
SELECT '0';

DECLARE @CompId VARCHAR(100);
DECLARE curComp CURSOR LOCAL FAST_FORWARD FOR SELECT CompanyId FROM @CompanyList;
OPEN curComp;
FETCH NEXT FROM curComp INTO @CompId;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- 1. Compliance
    IF NOT EXISTS (SELECT 1 FROM dbo.LSP_Master_General WHERE CodeTypeId = 24 AND CodeId = 1 AND fk_companyId = @CompId)
    BEGIN
        INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, CodeDescription, IsActive, EntryBy, EntryDate, fk_companyId, Name, Code)
        VALUES (24, 1, 'Statutory, legal and regulatory compliance', 1, '1', GETDATE(), @CompId, 'Compliance', 'COMP');
    END;

    -- 2. Audit
    IF NOT EXISTS (SELECT 1 FROM dbo.LSP_Master_General WHERE CodeTypeId = 24 AND CodeId = 2 AND fk_companyId = @CompId)
    BEGIN
        INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, CodeDescription, IsActive, EntryBy, EntryDate, fk_companyId, Name, Code)
        VALUES (24, 2, 'Internal, external and client audit reviews', 1, '1', GETDATE(), @CompId, 'Audit', 'AUD');
    END;

    -- 3. Operations
    IF NOT EXISTS (SELECT 1 FROM dbo.LSP_Master_General WHERE CodeTypeId = 24 AND CodeId = 3 AND fk_companyId = @CompId)
    BEGIN
        INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, CodeDescription, IsActive, EntryBy, EntryDate, fk_companyId, Name, Code)
        VALUES (24, 3, 'Operational execution and workflow tasks', 1, '1', GETDATE(), @CompId, 'Operations', 'OPS');
    END;

    -- 4. Payroll
    IF NOT EXISTS (SELECT 1 FROM dbo.LSP_Master_General WHERE CodeTypeId = 24 AND CodeId = 4 AND fk_companyId = @CompId)
    BEGIN
        INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, CodeDescription, IsActive, EntryBy, EntryDate, fk_companyId, Name, Code)
        VALUES (24, 4, 'Payroll processing, incentives and deductions', 1, '1', GETDATE(), @CompId, 'Payroll', 'PAY');
    END;

    -- 5. General
    IF NOT EXISTS (SELECT 1 FROM dbo.LSP_Master_General WHERE CodeTypeId = 24 AND CodeId = 5 AND fk_companyId = @CompId)
    BEGIN
        INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, CodeDescription, IsActive, EntryBy, EntryDate, fk_companyId, Name, Code)
        VALUES (24, 5, 'General administrative and ad-hoc task', 1, '1', GETDATE(), @CompId, 'General', 'GEN');
    END;

    FETCH NEXT FROM curComp INTO @CompId;
END;

CLOSE curComp;
DEALLOCATE curComp;
GO

-- ======================================================================================
-- 3. ALTER TABLE: Add TaskTypeId and TaskTypeName to dbo.HR_TaskMaster
-- ======================================================================================
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'TaskTypeId')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD TaskTypeId INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'TaskTypeName')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD TaskTypeName VARCHAR(100) NULL;
END
GO

UPDATE dbo.HR_TaskMaster
SET TaskTypeId = 5, TaskTypeName = 'General'
WHERE TaskTypeId IS NULL;
GO

-- ======================================================================================
-- 4. STORED PROCEDURE: dbo.usp_HR_Task_SearchEmployees
-- On-demand search & dynamic department filtering (prevents loading all employees at once)
-- ======================================================================================
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_SearchEmployees
    @CompanyId      VARCHAR(50) = NULL,
    @DeptId         VARCHAR(50) = NULL,
    @SearchText     NVARCHAR(100) = NULL,
    @Top            INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    IF @Top <= 0 OR @Top > 100 SET @Top = 20;
    IF @CompanyId IS NULL OR LTRIM(RTRIM(@CompanyId)) = '' SET @CompanyId = 'GU-1';

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
      AND e.fk_companyId = @CompanyId COLLATE DATABASE_DEFAULT
      AND (@DeptId IS NULL OR LTRIM(RTRIM(@DeptId)) = '' OR e.fk_deptid = @DeptId COLLATE DATABASE_DEFAULT)
      AND (
          @SearchText IS NULL 
          OR LTRIM(RTRIM(@SearchText)) = ''
          OR e.empname LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR e.empcode LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
          OR e.email LIKE '%' + @SearchText + '%' COLLATE DATABASE_DEFAULT
      )
    ORDER BY e.empname;
END;
GO

-- ======================================================================================
-- 5. STORED PROCEDURE: dbo.usp_HR_Task_GetLookups (Updated with Task Types & Initial Top 10 Employees)
-- ======================================================================================
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetLookups
    @ViewerId       VARCHAR(50) = NULL,
    @UserType       VARCHAR(20) = NULL,
    @RoleId         INT         = NULL,
    @CompanyId      VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ResolvedEmpId      VARCHAR(50) = NULL;
    DECLARE @ResolvedUserId     VARCHAR(50) = NULL;
    DECLARE @ResolvedName       NVARCHAR(150) = 'User';
    DECLARE @ResolvedDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedDeptName   NVARCHAR(150) = '';
    DECLARE @ResolvedCompanyId  VARCHAR(50) = @CompanyId;
    DECLARE @IsAdmin            BIT = 0;
    DECLARE @IsHod              BIT = 0;
    DECLARE @IsManager          BIT = 0;

    -- 1. Check if ViewerId is an employee in SAL_Employee_Mst
    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ViewerId)
    BEGIN
        SELECT TOP 1 
            @ResolvedEmpId     = e.pk_empid,
            @ResolvedName      = e.empname,
            @ResolvedDeptId    = e.fk_deptid,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId),
            @ResolvedDeptName  = ISNULL(d.description, '')
        FROM dbo.SAL_Employee_Mst e
        LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid
        WHERE e.pk_empid = @ViewerId;

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
                @ResolvedDeptId    = e.fk_deptid,
                @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId),
                @ResolvedDeptName  = ISNULL(d.description, '')
            FROM dbo.SAL_Employee_Mst e
            LEFT JOIN dbo.Department_Mst d ON e.fk_deptid = d.pk_deptid
            WHERE e.pk_empid = @ResolvedEmpId;
        END
    END

    -- Final fallback for company if still null
    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
        SET @ResolvedCompanyId = 'GU-1';

    -- Evaluate Role & Status
    IF UPPER(ISNULL(@UserType, '')) IN ('ADMIN', 'SUPERADMIN', 'HR', 'MANAGEMENT') OR @RoleId = 1
    BEGIN
        SET @IsAdmin = 1;
    END

    IF @ResolvedEmpId IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.Department_Mst WHERE fk_depHodid = @ResolvedEmpId AND (@ResolvedCompanyId IS NULL OR fk_companyId = @ResolvedCompanyId))
        BEGIN
            SET @IsHod = 1;
        END

        IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst 
                   WHERE (fk_FunctionalRepempid = @ResolvedEmpId 
                          OR fk_AdministrativeRepempid = @ResolvedEmpId)
                     AND (@ResolvedCompanyId IS NULL OR fk_companyId = @ResolvedCompanyId))
        BEGIN
            SET @IsManager = 1;
        END
    END

    -- Result Set 1: Viewer Context
    SELECT 
        @ResolvedEmpId      AS ViewerEmpId,
        @ResolvedUserId     AS ViewerUserId,
        @ResolvedName       AS ViewerName,
        @ResolvedDeptId     AS ViewerDeptId,
        @ResolvedDeptName   AS ViewerDeptName,
        @ResolvedCompanyId  AS CompanyId,
        @IsAdmin            AS IsAdmin,
        @IsHod              AS IsHod,
        @IsManager          AS IsManager;

    -- Result Set 2: Active Departments (Strictly scoped by CompanyId)
    SELECT 
        d.pk_deptid       AS DeptId,
        d.description     AS DeptName,
        d.fk_depHodid     AS HodEmpId
    FROM dbo.Department_Mst d
    WHERE ISNULL(d.dep_active, 1) = 1
      AND (@ResolvedCompanyId IS NULL OR d.fk_companyId = @ResolvedCompanyId)
    ORDER BY d.description;

    -- Result Set 3: Initial Employees (Strictly TOP 10 to prevent loading all at once)
    SELECT TOP 10 
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
      AND (@ResolvedCompanyId IS NULL OR e.fk_companyId = @ResolvedCompanyId)
    ORDER BY e.empname;

    -- Result Set 4: Task Types (From General Master LSP_Master_General CodeTypeId = 24)
    SELECT DISTINCT
        CAST(g.CodeId AS INT)   AS TaskTypeId,
        g.Name                  AS TaskTypeName,
        g.Code                  AS TaskTypeCode,
        g.CodeDescription       AS TaskTypeDescription
    FROM dbo.LSP_Master_General g
    WHERE g.CodeTypeId = 24 
      AND g.IsActive = 1
      AND (
          g.fk_companyId = @ResolvedCompanyId 
          OR (g.fk_companyId = '0' AND NOT EXISTS (
              SELECT 1 FROM dbo.LSP_Master_General g2 
              WHERE g2.CodeTypeId = 24 AND g2.CodeId = g.CodeId AND g2.fk_companyId = @ResolvedCompanyId
          ))
      )
    ORDER BY CAST(g.CodeId AS INT);
END;
GO

-- ======================================================================================
-- 6. STORED PROCEDURE: dbo.usp_HR_Task_Create (With TaskType Support)
-- ======================================================================================
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

    DECLARE @CreatedByEmpId    VARCHAR(50) = NULL;
    DECLARE @CreatedByUserId   VARCHAR(50) = NULL;
    DECLARE @CreatorDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedName      NVARCHAR(150) = ISNULL(@ActionByName, 'User');
    DECLARE @ResolvedCompanyId VARCHAR(50) = @CompanyId;
    DECLARE @ResolvedTaskType  VARCHAR(100) = @TaskTypeName;
    DECLARE @TaskCode          VARCHAR(50);
    DECLARE @NewTaskId         INT;
    DECLARE @NextOccurDate     DATETIME = NULL;

    -- Resolve creator details
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

    -- Final fallback company
    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
        SET @ResolvedCompanyId = 'GU-1';

    -- Resolve Task Type Name if ID provided
    IF @TaskTypeId IS NOT NULL AND (@ResolvedTaskType IS NULL OR LTRIM(RTRIM(@ResolvedTaskType)) = '')
    BEGIN
        SELECT TOP 1 @ResolvedTaskType = Name 
        FROM dbo.LSP_Master_General 
        WHERE CodeTypeId = 24 AND CodeId = @TaskTypeId;
    END

    IF @ResolvedTaskType IS NULL OR LTRIM(RTRIM(@ResolvedTaskType)) = ''
        SET @ResolvedTaskType = 'General';

    -- Default TargetDeptId if assignee selected
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
        BEGIN
            IF @RecurrenceDayOfMonth IS NOT NULL AND @RecurrenceDayOfMonth BETWEEN 1 AND 28
                SET @NextOccurDate = DATEFROMPARTS(YEAR(DATEADD(MONTH, ISNULL(@RecurrenceInterval, 1), @DueDate)), MONTH(DATEADD(MONTH, ISNULL(@RecurrenceInterval, 1), @DueDate)), @RecurrenceDayOfMonth);
            ELSE
                SET @NextOccurDate = DATEADD(MONTH, ISNULL(@RecurrenceInterval, 1), @DueDate);
        END
        ELSE IF @RecurrenceType = 'YEARLY'
            SET @NextOccurDate = DATEADD(YEAR, ISNULL(@RecurrenceInterval, 1), @DueDate);

        -- Check if end condition is immediately met
        IF @RecurrenceEndType = 'ON_DATE' AND @RecurrenceEndDate IS NOT NULL AND @NextOccurDate > @RecurrenceEndDate
            SET @NextOccurDate = NULL;
    END;

    -- Generate sequential TaskCode
    SET @TaskCode = 'HR_TSK-' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + '-' + 
                    RIGHT('0000' + CAST((ISNULL((SELECT MAX(TaskId) FROM dbo.HR_TaskMaster), 1000) + 1) AS VARCHAR(10)), 4);

    -- Insert task record
    INSERT INTO dbo.HR_TaskMaster
    (
        TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
        CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
        AttachmentName, AttachmentPath, IsRecurring, RecurrenceType, RecurrenceInterval,
        RecurrenceDays, RecurrenceDayOfMonth, RecurrenceEndType, RecurrenceEndDate,
        RecurrenceOccurrencesTotal, RecurrenceOccurrencesCount, NextOccurrenceDate,
        ParentTaskId, IsSelfTask, TaskTypeId, TaskTypeName, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
    )
    VALUES
    (
        @TaskCode, @Subject, @Description, ISNULL(@Priority, 'MEDIUM'), ISNULL(@Status, 'OPEN'),
        @TargetDeptId, @AssignedToEmpId, @CreatedByEmpId, @CreatedByUserId, @ResolvedName, @CreatorDeptId,
        @DueDate, @AttachmentName, @AttachmentPath, ISNULL(@IsRecurring, 0), ISNULL(@RecurrenceType, 'NONE'),
        ISNULL(@RecurrenceInterval, 1), @RecurrenceDays, @RecurrenceDayOfMonth,
        ISNULL(@RecurrenceEndType, 'NEVER'), @RecurrenceEndDate, @RecurrenceOccurrencesTotal, 0,
        @NextOccurDate, NULL, ISNULL(@IsSelfTask, 0), @TaskTypeId, @ResolvedTaskType,
        CASE WHEN @Status = 'CLOSED' THEN GETDATE() ELSE NULL END, @ResolvedCompanyId, GETDATE(), GETDATE(), 1
    );

    SET @NewTaskId = SCOPE_IDENTITY();

    -- Insert initial audit history
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

-- ======================================================================================
-- 7. STORED PROCEDURE: dbo.usp_HR_Task_GetBoard (With TaskTypeId & TaskTypeName)
-- ======================================================================================
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

    -- Automatically evaluate any due recurring schedules first
    EXEC dbo.usp_HR_Task_ProcessRecurring;

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

    -- Final company fallback
    IF @ResolvedCompanyId IS NULL OR LTRIM(RTRIM(@ResolvedCompanyId)) = ''
        SET @ResolvedCompanyId = 'GU-1';

    -- Evaluate admin rights
    IF UPPER(ISNULL(@UserType, '')) IN ('ADMIN', 'SUPERADMIN', 'HR', 'MANAGEMENT') OR @RoleId = 1
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

    -- Result Set 1: High-level KPI Counts
    SELECT 
        COUNT(*) AS TotalTasks,
        SUM(CASE WHEN Status = 'OPEN' THEN 1 ELSE 0 END) AS OpenTasks,
        SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) AS ClosedTasks,
        SUM(CASE WHEN Status = 'ON_HOLD' OR Status = 'ON HOLD' THEN 1 ELSE 0 END) AS OnHoldTasks,
        SUM(CASE WHEN AssignedToEmpId IS NULL THEN 1 ELSE 0 END) AS UnassignedTasks,
        SUM(CASE WHEN IsOverdue = 1 THEN 1 ELSE 0 END) AS OverdueTasks
    FROM #FilteredTasks;

    -- Result Set 2: Kanban Tasks
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

-- ======================================================================================
-- 8. STORED PROCEDURE: dbo.usp_HR_Task_GetDetail
-- ======================================================================================
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetDetail
    @TaskId         INT,
    @ViewerId       VARCHAR(50) = NULL,
    @CompanyId      VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Result Set 1: Master task details
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
        h.OldAssigneeEmpId,
        h.NewAssigneeEmpId,
        ISNULL(eNew.empname, '') AS NewAssigneeName,
        h.Remarks,
        h.AttachmentName,
        h.AttachmentPath,
        h.ActionByEmpId,
        h.ActionByUserId,
        h.ActionByName,
        h.CreatedAt
    FROM dbo.HR_TaskHistory h
    LEFT JOIN dbo.SAL_Employee_Mst eNew ON h.NewAssigneeEmpId = eNew.pk_empid COLLATE DATABASE_DEFAULT
    WHERE h.TaskId = @TaskId
    ORDER BY h.CreatedAt DESC;
END;
GO
