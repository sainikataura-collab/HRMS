-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_SearchEmployees
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