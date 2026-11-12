-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_GetLookups
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
-- 1. STORED PROCEDURE: dbo.usp_HR_Task_GetLookups
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_GetLookups
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
        WHERE g.CodeTypeId = 25
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