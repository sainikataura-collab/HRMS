-- ======================================================================================
-- PATCH: Fix Duplicate Task Types, Recurring Task Cadences & KPI Counts Preservation
-- 1. usp_HR_Task_GetLookups: Deduplicate Task Types (CodeTypeId = 24) via ROW_NUMBER()
-- 2. usp_HR_Task_GetBoard:
--    - Compute KPI summary counts from #BaseTasks before applying status/unassigned/overdue
--    - Support @Scope = 'RECURRING'
--    - Return Result Set 4 (All recurring cadences for Lane 4)
-- ======================================================================================

USE HRBook;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 1. STORED PROCEDURE: dbo.usp_HR_Task_GetLookups
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
-- 2. STORED PROCEDURE: dbo.usp_HR_Task_GetBoard
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
