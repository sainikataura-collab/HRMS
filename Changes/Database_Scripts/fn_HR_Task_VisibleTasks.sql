-- ======================================================================================
-- OBJECT: dbo.fn_HR_Task_VisibleTasks
-- TYPE: SQL_INLINE_TABLE_VALUED_FUNCTION
-- EXTRACTED LIVE FROM DATABASE: HRBook
-- ======================================================================================

USE HRBook;
GO

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