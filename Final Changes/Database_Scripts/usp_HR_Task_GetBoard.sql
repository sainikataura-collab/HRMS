-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_GetBoard
-- TYPE: SQL_STORED_PROCEDURE
-- EXTRACTED LIVE FROM DATABASE: HRBook
-- ======================================================================================

USE HRBook;
GO

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