-- =============================================================================
-- Stored Procedure: dbo.usp_HR_Task_ProcessRecurring
-- Description: Generates task instances from recurring templates.
--              Supports @TargetTaskId for immediate "Run Now" execution.
-- =============================================================================
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_ProcessRecurring
    @TargetTaskId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_NULLS ON;
    SET QUOTED_IDENTIFIER ON;

    DECLARE @GeneratedCount INT = 0;
    DECLARE @CurTaskId INT;
    DECLARE @CurSubject NVARCHAR(250);
    DECLARE @CurDescription NVARCHAR(MAX);
    DECLARE @CurPriority VARCHAR(20);
    DECLARE @CurTargetDeptId VARCHAR(50);
    DECLARE @CurAssignedToEmpId VARCHAR(50);
    DECLARE @CurCreatedByEmpId VARCHAR(50);
    DECLARE @CurCreatedByUserId VARCHAR(50);
    DECLARE @CurCreatedByName NVARCHAR(150);
    DECLARE @CurCreatorDeptId VARCHAR(50);
    DECLARE @CurRecurrenceType VARCHAR(20);
    DECLARE @CurRecurrenceInterval INT;
    DECLARE @CurRecurrenceDays VARCHAR(50);
    DECLARE @CurRecurrenceDayOfMonth INT;
    DECLARE @CurRecurrenceEndType VARCHAR(20);
    DECLARE @CurRecurrenceEndDate DATETIME;
    DECLARE @CurRecurrenceTotal INT;
    DECLARE @CurRecurrenceCount INT;
    DECLARE @CurRecurrenceDueOffsetHours INT;
    DECLARE @CurRecurrenceDueOffsetUnit VARCHAR(10);
    DECLARE @CurNextDate DATETIME;
    DECLARE @CurDueDate DATETIME;
    DECLARE @CurCompanyId VARCHAR(50);
    DECLARE @CurTaskTypeId INT;
    DECLARE @CurTaskTypeName VARCHAR(100);
    DECLARE @NewChildTaskId INT;
    DECLARE @NewChildTaskCode VARCHAR(50);
    DECLARE @CalculatedDueDate DATETIME;

    DECLARE curRecurring CURSOR LOCAL FAST_FORWARD FOR
        SELECT TaskId, Subject, Description, Priority, TargetDeptId, AssignedToEmpId,
               CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId,
               RecurrenceType, ISNULL(RecurrenceInterval, 1), RecurrenceDays, RecurrenceDayOfMonth,
               ISNULL(RecurrenceEndType, 'NEVER'), RecurrenceEndDate, RecurrenceOccurrencesTotal,
               ISNULL(RecurrenceOccurrencesCount, 0), ISNULL(RecurrenceDueOffsetHours, 24), ISNULL(RecurrenceDueOffsetUnit, 'DAYS'),
               ISNULL(NextOccurrenceDate, GETDATE()), DueDate, ISNULL(CompanyId, 'GU-1'), TaskTypeId, TaskTypeName
        FROM dbo.HR_TaskMaster
        WHERE IsActive = 1
          AND IsRecurring = 1
          AND RecurrenceType IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
          AND (
              (@TargetTaskId IS NOT NULL AND TaskId = @TargetTaskId)
              OR
              (@TargetTaskId IS NULL AND NextOccurrenceDate IS NOT NULL AND NextOccurrenceDate <= GETDATE())
          )
          AND (
              @TargetTaskId IS NOT NULL -- Force run if triggered explicitly
              OR RecurrenceEndType IS NULL 
              OR RecurrenceEndType = 'NEVER' 
              OR (RecurrenceEndType = 'ON_DATE' AND (RecurrenceEndDate IS NULL OR NextOccurrenceDate <= RecurrenceEndDate))
              OR (RecurrenceEndType = 'AFTER_COUNT' AND (RecurrenceOccurrencesTotal IS NULL OR ISNULL(RecurrenceOccurrencesCount, 0) < RecurrenceOccurrencesTotal))
          );

    OPEN curRecurring;
    FETCH NEXT FROM curRecurring INTO 
        @CurTaskId, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
        @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
        @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
        @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal,
        @CurRecurrenceCount, @CurRecurrenceDueOffsetHours, @CurRecurrenceDueOffsetUnit,
        @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Calculate due date for child task using template offset
        DECLARE @OffsetHrs INT = ISNULL(@CurRecurrenceDueOffsetHours, 24);
        IF @OffsetHrs <= 0 SET @OffsetHrs = 24;
        SET @CalculatedDueDate = DATEADD(HOUR, @OffsetHrs, GETDATE());

        -- Generate sequential TaskCode
        DECLARE @YearStr VARCHAR(4) = CAST(YEAR(GETDATE()) AS VARCHAR(4));
        DECLARE @NextNum INT = 1;

        SELECT @NextNum = ISNULL(MAX(CAST(RIGHT(TaskCode, 4) AS INT)), 0) + 1
        FROM dbo.HR_TaskMaster
        WHERE TaskCode LIKE 'HR_TSK-' + @YearStr + '-%'
          AND ISNUMERIC(RIGHT(TaskCode, 4)) = 1;

        SET @NewChildTaskCode = 'HR_TSK-' + @YearStr + '-' + RIGHT('0000' + CAST(@NextNum AS VARCHAR(4)), 4);

        -- Insert newly spawned non-recurring instance into OPEN swimlane
        INSERT INTO dbo.HR_TaskMaster
        (
            TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
            CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
            IsRecurring, RecurrenceType, RecurrenceInterval, NextOccurrenceDate, ParentTaskId,
            IsSelfTask, TaskTypeId, TaskTypeName, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
        )
        VALUES
        (
            @NewChildTaskCode, @CurSubject, @CurDescription, @CurPriority, 'OPEN', @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId, @CalculatedDueDate,
            0, 'NONE', 1, NULL, @CurTaskId,
            0, @CurTaskTypeId, ISNULL(@CurTaskTypeName, 'General'), NULL, @CurCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewChildTaskId = SCOPE_IDENTITY();
        SET @GeneratedCount = @GeneratedCount + 1;
        SET @CurRecurrenceCount = @CurRecurrenceCount + 1;

        -- Record audit history on the newly generated child task
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, OldStatus, NewStatus, Remarks, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewChildTaskId, 'RECURRENCE_GENERATED', NULL, 'OPEN',
            CONCAT('Task instance generated from recurring schedule (Template: ', @CurTaskId, ', Run #', @CurRecurrenceCount, '). Deadline set to ', CONVERT(VARCHAR(20), @CalculatedDueDate, 120), '.'),
            'System Scheduler', GETDATE()
        );

        -- Advance NextOccurrenceDate on the parent recurring template
        DECLARE @AdvNextDate DATETIME = ISNULL(@CurNextDate, GETDATE());
        IF @AdvNextDate <= GETDATE()
        BEGIN
            WHILE @AdvNextDate <= GETDATE()
            BEGIN
                IF @CurRecurrenceType = 'DAILY'
                    SET @AdvNextDate = DATEADD(DAY, @CurRecurrenceInterval, @AdvNextDate);
                ELSE IF @CurRecurrenceType = 'WEEKLY'
                    SET @AdvNextDate = DATEADD(WEEK, @CurRecurrenceInterval, @AdvNextDate);
                ELSE IF @CurRecurrenceType = 'MONTHLY'
                BEGIN
                    IF @CurRecurrenceDayOfMonth IS NOT NULL AND @CurRecurrenceDayOfMonth BETWEEN 1 AND 28
                        SET @AdvNextDate = DATEFROMPARTS(YEAR(DATEADD(MONTH, @CurRecurrenceInterval, @AdvNextDate)), MONTH(DATEADD(MONTH, @CurRecurrenceInterval, @AdvNextDate)), @CurRecurrenceDayOfMonth);
                    ELSE
                        SET @AdvNextDate = DATEADD(MONTH, @CurRecurrenceInterval, @AdvNextDate);
                END
                ELSE IF @CurRecurrenceType = 'YEARLY'
                    SET @AdvNextDate = DATEADD(YEAR, @CurRecurrenceInterval, @AdvNextDate);
                ELSE
                    BREAK;
            END
        END

        UPDATE dbo.HR_TaskMaster
        SET NextOccurrenceDate = @AdvNextDate,
            RecurrenceOccurrencesCount = @CurRecurrenceCount,
            UpdatedAt = GETDATE()
        WHERE TaskId = @CurTaskId;

        FETCH NEXT FROM curRecurring INTO 
            @CurTaskId, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
            @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
            @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal,
            @CurRecurrenceCount, @CurRecurrenceDueOffsetHours, @CurRecurrenceDueOffsetUnit,
            @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
    END

    CLOSE curRecurring;
    DEALLOCATE curRecurring;

    SELECT @GeneratedCount AS GeneratedCount;
END
GO
