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
-- Resolves Viewer identity, Admin rights, HOD status, and reporting manager hierarchy.
-- Correctly handles Admin users whose fk_empId is NULL in UM_Users_Mst.
-- --------------------------------------------------------------------------------------
CREATE OR ALTER FUNCTION dbo.fn_HR_Task_ResolveViewer
(
    @ViewerId VARCHAR(50),
    @UserType VARCHAR(20) = NULL
)
RETURNS TABLE
AS
RETURN
(
    WITH MatchedUser AS (
        SELECT TOP 1
            u.pk_userId                              AS UserId,
            u.fk_empId                               AS EmpId,
            CAST(u.fk_roleId AS INT)                 AS RoleId,
            u.fk_companyId                           AS CompanyId,
            CASE WHEN u.fk_roleId IN (1, 2) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsAdmin,
            ISNULL(u.name, 'Admin')                  AS UserName
        FROM dbo.UM_Users_Mst u
        WHERE (u.pk_userId = @ViewerId COLLATE DATABASE_DEFAULT OR u.fk_empId = @ViewerId COLLATE DATABASE_DEFAULT)
          AND u.active = 1
        ORDER BY CASE WHEN u.pk_userId = @ViewerId COLLATE DATABASE_DEFAULT THEN 1 ELSE 2 END,
                 CASE WHEN u.fk_roleId IN (1, 2) THEN 1 ELSE 2 END
    ),
    MatchedEmployee AS (
        SELECT TOP 1
            e.pk_empid                               AS EmpId,
            e.fk_companyId                           AS CompanyId,
            e.fk_deptid                              AS DeptId,
            ISNULL(e.empname, 'Employee')            AS EmployeeName
        FROM dbo.SAL_Employee_Mst e
        LEFT JOIN MatchedUser u ON 1=1
        WHERE e.pk_empid = @ViewerId COLLATE DATABASE_DEFAULT
           OR (u.EmpId IS NOT NULL AND e.pk_empid = u.EmpId COLLATE DATABASE_DEFAULT)
        ORDER BY CASE WHEN e.pk_empid = @ViewerId COLLATE DATABASE_DEFAULT THEN 1 ELSE 2 END
    )
    SELECT TOP 1
        COALESCE(u.EmpId, e.EmpId, @ViewerId)        AS EmpId,
        COALESCE(u.UserId, @ViewerId)                AS UserId,
        u.RoleId                                     AS RoleId,
        COALESCE(u.CompanyId, e.CompanyId, 'GU-1')   AS CompanyId,
        e.DeptId                                     AS DeptId,
        CASE 
            WHEN u.IsAdmin = 1 THEN CAST(1 AS BIT)
            WHEN UPPER(ISNULL(@UserType, '')) IN ('ADMIN', 'SUPERADMIN', 'USER', 'HR') AND ISNULL(u.RoleId, 0) IN (1, 2) THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS IsAdmin,
        CASE 
            WHEN (e.EmpId IS NOT NULL OR @ViewerId IS NOT NULL) AND EXISTS (
                SELECT 1 FROM dbo.Department_Mst d 
                WHERE d.fk_depHodid = COALESCE(e.EmpId, u.EmpId, @ViewerId) COLLATE DATABASE_DEFAULT
            ) THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS IsHod,
        CASE 
            WHEN (e.EmpId IS NOT NULL OR @ViewerId IS NOT NULL) AND EXISTS (
                SELECT 1 FROM dbo.SAL_Employee_Mst rep 
                WHERE rep.fk_FunctionalRepempid = COALESCE(e.EmpId, u.EmpId, @ViewerId) COLLATE DATABASE_DEFAULT 
                   OR rep.fk_AdministrativeRepempid = COALESCE(e.EmpId, u.EmpId, @ViewerId) COLLATE DATABASE_DEFAULT
            ) THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS IsManager,
        COALESCE(u.UserName, e.EmployeeName, 'User') AS ResolvedName
    FROM (SELECT 1 AS dummy) d
    LEFT JOIN MatchedUser u ON 1=1
    LEFT JOIN MatchedEmployee e ON 1=1
);
GO
