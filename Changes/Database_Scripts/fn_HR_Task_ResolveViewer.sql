-- ======================================================================================
-- OBJECT: dbo.fn_HR_Task_ResolveViewer
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