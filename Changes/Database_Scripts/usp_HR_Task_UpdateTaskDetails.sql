-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_UpdateTaskDetails
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
-- 6. STORED PROCEDURE: dbo.usp_HR_Task_UpdateTaskDetails
-- Checks authorization before allowing detail editing.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_UpdateTaskDetails
    @TaskId                         INT,
    @Subject                        NVARCHAR(250),
    @Description                    NVARCHAR(MAX)   = NULL,
    @Priority                       VARCHAR(20)     = 'MEDIUM',
    @TargetDeptId                   VARCHAR(50)     = NULL,
    @AssignedToEmpId                VARCHAR(50)     = NULL,
    @DueDate                        DATETIME        = NULL,
    @IsRecurring                    BIT             = 0,
    @RecurrenceType                 VARCHAR(20)     = 'NONE',
    @RecurrenceInterval             INT             = 1,
    @RecurrenceDays                 VARCHAR(100)    = NULL,
    @RecurrenceDayOfMonth           INT             = NULL,
    @RecurrenceEndType              VARCHAR(20)     = 'NEVER',
    @RecurrenceEndDate              DATETIME        = NULL,
    @RecurrenceOccurrencesTotal     INT             = NULL,
    @RecurrenceDueOffsetHours       INT             = 24,
    @RecurrenceDueOffsetUnit        VARCHAR(20)     = 'DAYS',
    @TaskTypeId                     INT             = NULL,
    @TaskTypeName                   NVARCHAR(100)   = 'General',
    @ActionById                     VARCHAR(50)     = NULL,
    @ActionByName                   NVARCHAR(150)   = 'Admin',
    @UserType                       VARCHAR(20)     = NULL,
    @CompanyId                      VARCHAR(50)     = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.HR_TaskMaster WHERE TaskId = @TaskId)
    BEGIN
        SELECT 0 AS Success, 'Task not found.' AS Message;
        RETURN;
    END

    -- Authorization check
    IF @ActionById IS NOT NULL AND @ActionById <> ''
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.fn_HR_Task_VisibleTasks(@ActionById, @UserType, @CompanyId)
            WHERE TaskId = @TaskId
        )
        BEGIN
            SELECT 0 AS Success, 'Not authorized to update this task.' AS Message;
            RETURN;
        END
    END

    UPDATE dbo.HR_TaskMaster
    SET Subject                     = @Subject,
        Description                 = @Description,
        Priority                    = ISNULL(@Priority, 'MEDIUM'),
        TargetDeptId                = @TargetDeptId,
        AssignedToEmpId             = @AssignedToEmpId,
        DueDate                     = ISNULL(@DueDate, DueDate),
        IsRecurring                 = ISNULL(@IsRecurring, 0),
        RecurrenceType              = ISNULL(@RecurrenceType, 'NONE'),
        RecurrenceInterval          = ISNULL(@RecurrenceInterval, 1),
        RecurrenceDays              = @RecurrenceDays,
        RecurrenceDayOfMonth        = @RecurrenceDayOfMonth,
        RecurrenceEndType           = ISNULL(@RecurrenceEndType, 'NEVER'),
        RecurrenceEndDate           = @RecurrenceEndDate,
        RecurrenceOccurrencesTotal  = @RecurrenceOccurrencesTotal,
        RecurrenceDueOffsetHours    = @RecurrenceDueOffsetHours,
        RecurrenceDueOffsetUnit     = @RecurrenceDueOffsetUnit,
        TaskTypeId                  = @TaskTypeId,
        TaskTypeName                = ISNULL(@TaskTypeName, 'General'),
        UpdatedAt                   = GETDATE()
    WHERE TaskId = @TaskId;

    INSERT INTO dbo.HR_TaskHistory
    (
        TaskId, ActionType, Remarks, ActionByName, CreatedAt
    )
    VALUES
    (
        @TaskId, 'EDITED', 'Task details and cadence parameters updated.', @ActionByName, GETDATE()
    );

    SELECT 1 AS Success, 'Task updated successfully.' AS Message;
END;
GO