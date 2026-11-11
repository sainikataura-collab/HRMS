-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_ProcessRecurring
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
-- 8. STORED PROCEDURE: dbo.usp_HR_Task_ProcessRecurring
-- Copies attachment, creator metadata, and uses UPDLOCK for task codes.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_ProcessRecurring
    @TargetTaskId    INT = NULL,
    @SuppressOutput  BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurTaskId INT;
    DECLARE @CurTaskCode VARCHAR(50);
    DECLARE @CurSubject NVARCHAR(250);
    DECLARE @CurDescription NVARCHAR(MAX);
    DECLARE @CurPriority VARCHAR(20);
    DECLARE @CurTargetDeptId VARCHAR(50);
    DECLARE @CurAssignedToEmpId VARCHAR(50);
    DECLARE @CurCreatedByEmpId VARCHAR(50);
    DECLARE @CurCreatedByUserId VARCHAR(50);
    DECLARE @CurCreatedByName NVARCHAR(150);
    DECLARE @CurCreatorDeptId VARCHAR(50);
    DECLARE @CurAttachmentName NVARCHAR(255);
    DECLARE @CurAttachmentPath NVARCHAR(500);
    DECLARE @CurRecurrenceType VARCHAR(20);
    DECLARE @CurRecurrenceInterval INT;
    DECLARE @CurRecurrenceDays VARCHAR(50);
    DECLARE @CurRecurrenceDayOfMonth INT;
    DECLARE @CurRecurrenceEndType VARCHAR(20);
    DECLARE @CurRecurrenceEndDate DATETIME;
    DECLARE @CurRecurrenceTotal INT;
    DECLARE @CurRecurrenceCount INT;
    DECLARE @CurDueOffsetHours INT;
    DECLARE @CurDueOffsetUnit VARCHAR(10);
    DECLARE @CurNextDate DATETIME;
    DECLARE @CurDueDate DATETIME;
    DECLARE @CurCompanyId VARCHAR(50);
    DECLARE @CurTaskTypeId INT;
    DECLARE @CurTaskTypeName VARCHAR(100);

    DECLARE @GeneratedCount INT = 0;
    DECLARE @NewChildTaskId INT;
    DECLARE @NewChildTaskCode VARCHAR(50);
    DECLARE @CalculatedDueDate DATETIME;
    DECLARE @ComputedNextOccurrence DATETIME;

    DECLARE recurring_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT 
        TaskId, TaskCode, Subject, Description, Priority, TargetDeptId, AssignedToEmpId,
        CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId,
        AttachmentName, AttachmentPath,
        RecurrenceType, RecurrenceInterval, RecurrenceDays, RecurrenceDayOfMonth,
        RecurrenceEndType, RecurrenceEndDate, RecurrenceOccurrencesTotal, RecurrenceOccurrencesCount,
        RecurrenceDueOffsetHours, RecurrenceDueOffsetUnit,
        ISNULL(NextOccurrenceDate, GETDATE()), DueDate, ISNULL(CompanyId, 'GU-1'), TaskTypeId, TaskTypeName
    FROM dbo.HR_TaskMaster
    WHERE IsActive = 1
      AND IsRecurring = 1
      AND (@TargetTaskId IS NULL OR TaskId = @TargetTaskId)
      AND (
          @TargetTaskId IS NOT NULL 
          OR (NextOccurrenceDate IS NOT NULL AND NextOccurrenceDate <= GETDATE())
      );

    OPEN recurring_cursor;
    FETCH NEXT FROM recurring_cursor INTO
        @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
        @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
        @CurAttachmentName, @CurAttachmentPath,
        @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
        @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
        @CurDueOffsetHours, @CurDueOffsetUnit,
        @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Check end conditions
        IF @CurRecurrenceEndType = 'AFTER_COUNT' AND @CurRecurrenceTotal IS NOT NULL AND @CurRecurrenceCount >= @CurRecurrenceTotal
        BEGIN
            FETCH NEXT FROM recurring_cursor INTO
                @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
                @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
                @CurAttachmentName, @CurAttachmentPath,
                @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
                @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
                @CurDueOffsetHours, @CurDueOffsetUnit,
                @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
            CONTINUE;
        END

        IF @CurRecurrenceEndType = 'ON_DATE' AND @CurRecurrenceEndDate IS NOT NULL AND GETDATE() > @CurRecurrenceEndDate
        BEGIN
            FETCH NEXT FROM recurring_cursor INTO
                @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
                @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
                @CurAttachmentName, @CurAttachmentPath,
                @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
                @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
                @CurDueOffsetHours, @CurDueOffsetUnit,
                @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
            CONTINUE;
        END

        -- Calculate SLA due date
        DECLARE @ActualOffsetHours INT = ISNULL(@CurDueOffsetHours, 24);
        IF @ActualOffsetHours <= 0 SET @ActualOffsetHours = 24;
        SET @CalculatedDueDate = DATEADD(HOUR, @ActualOffsetHours, GETDATE());

        -- Generate sequential TaskCode
        DECLARE @YearStr VARCHAR(4) = CAST(YEAR(GETDATE()) AS VARCHAR(4));
        DECLARE @NextNum INT = 1;

        SELECT @NextNum = ISNULL(MAX(CAST(RIGHT(TaskCode, 4) AS INT)), 0) + 1
        FROM dbo.HR_TaskMaster WITH (UPDLOCK, HOLDLOCK)
        WHERE TaskCode LIKE 'HR_TSK-' + @YearStr + '-%'
          AND ISNUMERIC(RIGHT(TaskCode, 4)) = 1;

        SET @NewChildTaskCode = 'HR_TSK-' + @YearStr + '-' + RIGHT('0000' + CAST(@NextNum AS VARCHAR(4)), 4);

        -- Insert newly spawned non-recurring instance into OPEN swimlane
        INSERT INTO dbo.HR_TaskMaster
        (
            TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
            CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
            AttachmentName, AttachmentPath,
            IsRecurring, RecurrenceType, RecurrenceInterval, NextOccurrenceDate, ParentTaskId,
            IsSelfTask, TaskTypeId, TaskTypeName, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
        )
        VALUES
        (
            @NewChildTaskCode, @CurSubject, @CurDescription, @CurPriority, 'OPEN', @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId, @CalculatedDueDate,
            @CurAttachmentName, @CurAttachmentPath,
            0, 'NONE', 1, NULL, @CurTaskId,
            0, @CurTaskTypeId, ISNULL(@CurTaskTypeName, 'General'), NULL, @CurCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewChildTaskId = SCOPE_IDENTITY();
        SET @GeneratedCount = @GeneratedCount + 1;
        SET @CurRecurrenceCount = @CurRecurrenceCount + 1;

        -- Record audit history on the newly generated child task
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, Remarks, ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewChildTaskId, 'RECURRENCE_GENERATED',
            CONCAT('Task automatically generated from recurring schedule #', @CurTaskCode, '.'),
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, GETDATE()
        );

        -- Dispatch notification for recurring child instance
        BEGIN TRY
            EXEC dbo.usp_HR_Task_DispatchNotification
                @TaskId = @NewChildTaskId,
                @EventType = 'RECURRENCE_GENERATED',
                @ActorEmpId = @CurCreatedByEmpId,
                @ActorName = @CurCreatedByName,
                @Remarks = 'Recurring schedule instance generated';
        END TRY
        BEGIN CATCH
        END CATCH;

        -- Calculate next occurrence date for template
        DECLARE @Interval INT = ISNULL(@CurRecurrenceInterval, 1);
        IF @Interval <= 0 SET @Interval = 1;

        IF @CurRecurrenceType = 'DAILY'
            SET @ComputedNextOccurrence = DATEADD(DAY, @Interval, @CurNextDate);
        ELSE IF @CurRecurrenceType = 'WEEKLY'
            SET @ComputedNextOccurrence = DATEADD(WEEK, @Interval, @CurNextDate);
        ELSE IF @CurRecurrenceType = 'MONTHLY'
        BEGIN
            DECLARE @TargetMDay INT = ISNULL(@CurRecurrenceDayOfMonth, DAY(@CurNextDate));
            IF @TargetMDay < 1 SET @TargetMDay = 1;
            IF @TargetMDay > 31 SET @TargetMDay = 31;

            DECLARE @NextMonthDate DATETIME = DATEADD(MONTH, @Interval, @CurNextDate);
            DECLARE @LastDayOfNextMonth INT = DAY(EOMONTH(@NextMonthDate));
            DECLARE @SafeMDay INT = CASE WHEN @TargetMDay > @LastDayOfNextMonth THEN @LastDayOfNextMonth ELSE @TargetMDay END;

            SET @ComputedNextOccurrence = DATEFROMPARTS(YEAR(@NextMonthDate), MONTH(@NextMonthDate), @SafeMDay);
        END
        ELSE IF @CurRecurrenceType = 'YEARLY'
            SET @ComputedNextOccurrence = DATEADD(YEAR, @Interval, @CurNextDate);
        ELSE
            SET @ComputedNextOccurrence = DATEADD(DAY, 1, @CurNextDate);

        -- Update the recurring master template
        UPDATE dbo.HR_TaskMaster
        SET NextOccurrenceDate = @ComputedNextOccurrence,
            RecurrenceOccurrencesCount = @CurRecurrenceCount,
            UpdatedAt = GETDATE()
        WHERE TaskId = @CurTaskId;

        FETCH NEXT FROM recurring_cursor INTO
            @CurTaskId, @CurTaskCode, @CurSubject, @CurDescription, @CurPriority, @CurTargetDeptId, @CurAssignedToEmpId,
            @CurCreatedByEmpId, @CurCreatedByUserId, @CurCreatedByName, @CurCreatorDeptId,
            @CurAttachmentName, @CurAttachmentPath,
            @CurRecurrenceType, @CurRecurrenceInterval, @CurRecurrenceDays, @CurRecurrenceDayOfMonth,
            @CurRecurrenceEndType, @CurRecurrenceEndDate, @CurRecurrenceTotal, @CurRecurrenceCount,
            @CurDueOffsetHours, @CurDueOffsetUnit,
            @CurNextDate, @CurDueDate, @CurCompanyId, @CurTaskTypeId, @CurTaskTypeName;
    END

    CLOSE recurring_cursor;
    DEALLOCATE recurring_cursor;

    IF @SuppressOutput = 0
    BEGIN
        SELECT @GeneratedCount AS GeneratedCount;
    END
END;
GO