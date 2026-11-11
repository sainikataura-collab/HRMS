-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_GetByIdWithHistory
-- TYPE: SQL_STORED_PROCEDURE
-- EXTRACTED LIVE FROM DATABASE: HRBook
-- ======================================================================================

USE HRBook;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_GetByIdWithHistory
    @TaskId     INT,
    @ViewerId   VARCHAR(50) = NULL,
    @UserType   VARCHAR(20) = NULL,
    @CompanyId  VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    EXEC dbo.usp_HR_Task_GetDetail @TaskId = @TaskId, @ViewerId = @ViewerId, @UserType = @UserType, @CompanyId = @CompanyId;
END;
GO