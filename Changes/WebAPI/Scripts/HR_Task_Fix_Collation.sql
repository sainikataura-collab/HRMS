USE [HRBook];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

PRINT '--> Updating usp_HR_Task_GetBoard to eliminate subqueries in aggregates...';
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
    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ViewerId COLLATE DATABASE_DEFAULT)
    BEGIN
        SET @ResolvedEmpId = @ViewerId;
        SELECT TOP 1 @ResolvedUserId = pk_userId FROM dbo.UM_Users_Mst WHERE fk_empId = @ResolvedEmpId COLLATE DATABASE_DEFAULT;
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.UM_Users_Mst WHERE pk_userId = @ViewerId COLLATE DATABASE_DEFAULT)
    BEGIN
        SET @ResolvedUserId = @ViewerId;
        SELECT TOP 1 @ResolvedEmpId = fk_empId, @RoleId = ISNULL(@RoleId, fk_roleId) 
        FROM dbo.UM_Users_Mst WHERE pk_userId = @ViewerId COLLATE DATABASE_DEFAULT;
    END
    ELSE
    BEGIN
        SET @ResolvedUserId = @ViewerId;
    END

    -- Admin resolution
    IF ISNULL(@RoleId, 0) IN (1, 2, 7) OR @UserType = 'User'
        SET @IsAdmin = 1;

    -- Collect HOD departments for the viewer with explicit database default collation
    CREATE TABLE #HodDepts (DeptId VARCHAR(50) COLLATE DATABASE_DEFAULT PRIMARY KEY);
    IF @ResolvedEmpId IS NOT NULL
    BEGIN
        INSERT INTO #HodDepts (DeptId)
        SELECT pk_deptid FROM dbo.Department_Mst WHERE fk_depHodid = @ResolvedEmpId COLLATE DATABASE_DEFAULT AND ISNULL(dep_active, 1) = 1
        UNION
        SELECT DISTINCT fk_deptid FROM dbo.SAL_Employee_Mst 
        WHERE (pk_empid = @ResolvedEmpId COLLATE DATABASE_DEFAULT AND isHod = '1')
           OR fk_FunctionalHODempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT
           OR fk_AdministrativeHODempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT;

        IF EXISTS (SELECT 1 FROM #HodDepts) SET @IsHod = 1;
    END

    -- Collect team direct reports for the viewer with explicit database default collation
    CREATE TABLE #TeamMembers (EmpId VARCHAR(50) COLLATE DATABASE_DEFAULT PRIMARY KEY);
    IF @ResolvedEmpId IS NOT NULL
    BEGIN
        INSERT INTO #TeamMembers (EmpId)
        SELECT pk_empid FROM dbo.SAL_Employee_Mst
        WHERE pk_empid = @ResolvedEmpId COLLATE DATABASE_DEFAULT
           OR fk_rmanagerid = @ResolvedEmpId COLLATE DATABASE_DEFAULT
           OR fk_imanagerid = @ResolvedEmpId COLLATE DATABASE_DEFAULT
           OR fk_FunctionalRepempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT
           OR fk_AdministrativeRepempid = @ResolvedEmpId COLLATE DATABASE_DEFAULT
           OR fk_deptid IN (SELECT DeptId FROM #HodDepts);

        IF EXISTS (SELECT 1 FROM #TeamMembers WHERE EmpId <> @ResolvedEmpId COLLATE DATABASE_DEFAULT) SET @IsManager = 1;
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
              (@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT)
              OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId COLLATE DATABASE_DEFAULT)
              -- Assigned employee sees per D-05
              OR (@ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT)
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
    SELECT
        COUNT(*) AS TotalCount,
        ISNULL(SUM(CASE WHEN t.Status = 'OPEN' THEN 1 ELSE 0 END), 0) AS OpenCount,
        ISNULL(SUM(CASE WHEN t.Status = 'CLOSED' THEN 1 ELSE 0 END), 0) AS ClosedCount,
        ISNULL(SUM(CASE WHEN t.Status = 'ON_HOLD' THEN 1 ELSE 0 END), 0) AS OnHoldCount,
        ISNULL(SUM(CASE WHEN t.AssignedToEmpId IS NULL OR LTRIM(RTRIM(t.AssignedToEmpId)) = '' THEN 1 ELSE 0 END), 0) AS UnassignedCount,
        ISNULL(SUM(CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() THEN 1 ELSE 0 END), 0) AS OverdueCount,
        ISNULL(SUM(CASE WHEN @ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT THEN 1 ELSE 0 END), 0) AS MyAssignedCount,
        ISNULL(SUM(CASE WHEN hod.DeptId IS NOT NULL THEN 1 ELSE 0 END), 0) AS DeptTaskCount,
        ISNULL(SUM(CASE WHEN (@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT) 
                          OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId COLLATE DATABASE_DEFAULT) THEN 1 ELSE 0 END), 0) AS CreatedByMeCount,
        ISNULL(SUM(CASE WHEN t.IsSelfTask = 1 AND ((@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT) 
                                             OR (@ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT)) THEN 1 ELSE 0 END), 0) AS SelfTaskCount
    FROM dbo.HR_TaskMaster t
    INNER JOIN #AccessibleTasks a ON t.TaskId = a.TaskId
    LEFT JOIN #HodDepts hod ON t.TargetDeptId = hod.DeptId;

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
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst empAssign ON t.AssignedToEmpId = empAssign.pk_empid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst empCreate ON t.CreatedByEmpId = empCreate.pk_empid COLLATE DATABASE_DEFAULT
    WHERE 1 = 1
      -- Scope filter
      AND (
          @Scope = 'ALL'
          OR (@Scope = 'MY_TASKS' AND @ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT)
          OR (@Scope = 'DEPT_TASKS' AND (t.TargetDeptId IN (SELECT DeptId FROM #HodDepts) OR t.CreatorDeptId IN (SELECT DeptId FROM #HodDepts)))
          OR (@Scope = 'CREATED_BY_ME' AND ((@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT) OR (@ResolvedUserId IS NOT NULL AND t.CreatedByUserId = @ResolvedUserId COLLATE DATABASE_DEFAULT)))
          OR (@Scope = 'SELF_TASKS' AND t.IsSelfTask = 1 AND ((@ResolvedEmpId IS NOT NULL AND t.CreatedByEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT) OR (@ResolvedEmpId IS NOT NULL AND t.AssignedToEmpId = @ResolvedEmpId COLLATE DATABASE_DEFAULT)))
      )
      -- Specific filters
      AND (@DeptId IS NULL OR t.TargetDeptId = @DeptId COLLATE DATABASE_DEFAULT)
      AND (@AssignedToEmpId IS NULL OR t.AssignedToEmpId = @AssignedToEmpId COLLATE DATABASE_DEFAULT)
      AND (@CreatedByEmpId IS NULL OR t.CreatedByEmpId = @CreatedByEmpId COLLATE DATABASE_DEFAULT OR t.CreatedByUserId = @CreatedByEmpId COLLATE DATABASE_DEFAULT)
      AND (@Status IS NULL OR t.Status = @Status COLLATE DATABASE_DEFAULT)
      AND (@Priority IS NULL OR t.Priority = @Priority COLLATE DATABASE_DEFAULT)
      AND (@RecurrenceType IS NULL OR t.RecurrenceType = @RecurrenceType COLLATE DATABASE_DEFAULT)
      -- KPI Card toggle shortcuts
      AND (@OnlyUnassigned = 0 OR t.AssignedToEmpId IS NULL OR LTRIM(RTRIM(t.AssignedToEmpId)) = '')
      AND (@OnlyOverdue = 0 OR (t.Status <> 'CLOSED' AND t.DueDate < GETDATE()))
      -- Quick search filter
      AND (
          @SearchText = ''
          OR t.TaskCode LIKE '%' + @SearchText + '%'
          OR t.Subject LIKE '%' + @SearchText + '%'
          OR ISNULL(t.Description, '') LIKE '%' + @SearchText + '%'
          OR ISNULL(empAssign.empname, '') LIKE '%' + @SearchText + '%'
          OR ISNULL(empCreate.empname, '') LIKE '%' + @SearchText + '%'
          OR ISNULL(d.description, '') LIKE '%' + @SearchText + '%'
      )
    ORDER BY 
        CASE WHEN t.Status <> 'CLOSED' AND t.DueDate < GETDATE() THEN 0 ELSE 1 END ASC, -- Overdue first
        t.DueDate ASC,
        t.CreatedAt DESC;

    DROP TABLE #AccessibleTasks;
    DROP TABLE #HodDepts;
    DROP TABLE #TeamMembers;
END;
GO
