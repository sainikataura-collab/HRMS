-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_Create
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
-- 2. STORED PROCEDURE: dbo.usp_HR_Task_Create
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_Create
    @Subject                    NVARCHAR(250),
    @Description                NVARCHAR(MAX)   = NULL,
    @Priority                   VARCHAR(20)     = 'MEDIUM',
    @Status                     VARCHAR(20)     = 'OPEN',
    @TargetDeptId               VARCHAR(50)     = NULL,
    @AssignedToEmpId            VARCHAR(50)     = NULL,
    @DueDate                    DATETIME        = NULL,
    @AttachmentName             NVARCHAR(255)   = NULL,
    @AttachmentPath             NVARCHAR(500)   = NULL,
    @IsRecurring                BIT             = 0,
    @RecurrenceType             VARCHAR(20)     = 'NONE',
    @RecurrenceInterval         INT             = 1,
    @RecurrenceDays             VARCHAR(50)     = NULL,
    @RecurrenceDayOfMonth       INT             = NULL,
    @RecurrenceEndType          VARCHAR(20)     = 'NEVER',
    @RecurrenceEndDate          DATETIME        = NULL,
    @RecurrenceOccurrencesTotal INT             = NULL,
    @RecurrenceDueOffsetHours   INT             = 24,
    @RecurrenceDueOffsetUnit    VARCHAR(10)     = 'DAYS',
    @IsSelfTask                 BIT             = 0,
    @TaskTypeId                 INT             = NULL,
    @TaskTypeName               VARCHAR(100)    = NULL,
    @ActionById                 VARCHAR(50)     = NULL,
    @ActionByName               NVARCHAR(150)   = NULL,
    @UserType                   VARCHAR(20)     = NULL,
    @CompanyId                  VARCHAR(50)     = NULL,
    @InitialRemarks             NVARCHAR(MAX)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CreatedByEmpId    VARCHAR(50) = NULL;
    DECLARE @CreatedByUserId   VARCHAR(50) = NULL;
    DECLARE @CreatorDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedName      NVARCHAR(150) = NULL;
    DECLARE @ResolvedCompanyId VARCHAR(50) = @CompanyId;
    DECLARE @ResolvedTaskType  VARCHAR(100) = @TaskTypeName;
    DECLARE @NextOccurDate     DATETIME = NULL;

    -- 1. Resolve Creator Identity via fn_HR_Task_ResolveViewer
    SELECT TOP 1
        @CreatedByEmpId    = EmpId,
        @CreatedByUserId   = UserId,
        @CreatorDeptId     = DeptId,
        @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, CompanyId),
        @ResolvedName      = ISNULL(@ActionByName, ResolvedName)
    FROM dbo.fn_HR_Task_ResolveViewer(@ActionById, @UserType);

    -- Strict creator check
    IF @CreatedByEmpId IS NULL AND @CreatedByUserId IS NULL
    BEGIN
        RAISERROR('Creator identity could not be resolved. Please log in again.', 16, 1);
        RETURN;
    END

    IF @ResolvedName IS NULL OR @ResolvedName = ''
        SET @ResolvedName = ISNULL(@ActionByName, 'User');

    -- Dynamically resolve CompanyId from employee or user master if still missing
    IF @ResolvedCompanyId IS NULL OR @ResolvedCompanyId = ''
    BEGIN
        IF @CreatedByEmpId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.SAL_Employee_Mst WHERE pk_empid = @CreatedByEmpId;
        IF (@ResolvedCompanyId IS NULL OR @ResolvedCompanyId = '') AND @CreatedByUserId IS NOT NULL
            SELECT TOP 1 @ResolvedCompanyId = fk_companyId FROM dbo.UM_Users_Mst WHERE pk_userId = @CreatedByUserId;
    END

    -- Handle self-task assignment
    IF @IsSelfTask = 1 AND @CreatedByEmpId IS NOT NULL
    BEGIN
        SET @AssignedToEmpId = @CreatedByEmpId;
        IF @TargetDeptId IS NULL AND @CreatorDeptId IS NOT NULL
            SET @TargetDeptId = @CreatorDeptId;
    END

    -- 2. Resolve Task Type Name from General Master (CodeTypeId = 25)
    IF @TaskTypeId IS NOT NULL AND (@ResolvedTaskType IS NULL OR @ResolvedTaskType = '')
    BEGIN
        SELECT TOP 1 @ResolvedTaskType = Name
        FROM dbo.LSP_Master_General
        WHERE CodeTypeId = 25 AND CodeId = @TaskTypeId;
    END
    IF @ResolvedTaskType IS NULL OR @ResolvedTaskType = '' SET @ResolvedTaskType = 'General';

    -- 3. Calculate initial DueDate and NextOccurrenceDate for recurring
    IF @IsRecurring = 1
    BEGIN
        DECLARE @BaseNext DATETIME = GETDATE();
        DECLARE @RecInterval INT = ISNULL(@RecurrenceInterval, 1);
        IF @RecInterval <= 0 SET @RecInterval = 1;

        IF @RecurrenceType = 'DAILY'
            SET @NextOccurDate = DATEADD(DAY, @RecInterval, @BaseNext);
        ELSE IF @RecurrenceType = 'WEEKLY'
            SET @NextOccurDate = DATEADD(WEEK, @RecInterval, @BaseNext);
        ELSE IF @RecurrenceType = 'MONTHLY'
        BEGIN
            DECLARE @TargetDay INT = ISNULL(@RecurrenceDayOfMonth, DAY(@BaseNext));
            IF @TargetDay < 1 SET @TargetDay = 1;
            IF @TargetDay > 31 SET @TargetDay = 31;

            DECLARE @TargetMonthDate DATETIME;
            IF DAY(@BaseNext) < @TargetDay
                SET @TargetMonthDate = @BaseNext;
            ELSE
                SET @TargetMonthDate = DATEADD(MONTH, @RecInterval, @BaseNext);

            DECLARE @MaxDayOfMonth INT = DAY(EOMONTH(@TargetMonthDate));
            DECLARE @ClampedDay INT = CASE WHEN @TargetDay > @MaxDayOfMonth THEN @MaxDayOfMonth ELSE @TargetDay END;

            SET @NextOccurDate = DATEFROMPARTS(YEAR(@TargetMonthDate), MONTH(@TargetMonthDate), @ClampedDay);
            SET @NextOccurDate = DATEADD(HOUR, 9, @NextOccurDate);
        END
        ELSE IF @RecurrenceType = 'YEARLY'
            SET @NextOccurDate = DATEADD(YEAR, @RecInterval, @BaseNext);
        ELSE
            SET @NextOccurDate = DATEADD(DAY, @RecInterval, @BaseNext);
    END

    IF @DueDate IS NULL
    BEGIN
        SET @DueDate = DATEADD(DAY, 7, GETDATE());
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        -- 4. Atomic TaskCode generation & Insert
        DECLARE @NewTaskId INT;
        DECLARE @NewTaskCode VARCHAR(50);

        INSERT INTO dbo.HR_TaskMaster
        (
            TaskCode, Subject, Description, Priority, Status,
            TargetDeptId, AssignedToEmpId,
            CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId,
            DueDate, AttachmentName, AttachmentPath,
            IsRecurring, RecurrenceType, RecurrenceInterval, RecurrenceDays, RecurrenceDayOfMonth,
            RecurrenceEndType, RecurrenceEndDate, RecurrenceOccurrencesTotal, RecurrenceOccurrencesCount,
            RecurrenceDueOffsetHours, RecurrenceDueOffsetUnit,
            NextOccurrenceDate, ParentTaskId, IsSelfTask,
            TaskTypeId, TaskTypeName,
            CompanyId, CreatedAt, UpdatedAt, IsActive
        )
        VALUES
        (
            'PENDING', @Subject, @Description, @Priority, @Status,
            @TargetDeptId, @AssignedToEmpId,
            @CreatedByEmpId, @CreatedByUserId, @ResolvedName, @CreatorDeptId,
            @DueDate, @AttachmentName, @AttachmentPath,
            @IsRecurring, @RecurrenceType, @RecurrenceInterval, @RecurrenceDays, @RecurrenceDayOfMonth,
            @RecurrenceEndType, @RecurrenceEndDate, @RecurrenceOccurrencesTotal, 0,
            @RecurrenceDueOffsetHours, @RecurrenceDueOffsetUnit,
            @NextOccurDate, NULL, @IsSelfTask,
            @TaskTypeId, @ResolvedTaskType,
            @ResolvedCompanyId, GETDATE(), GETDATE(), 1
        );

        SET @NewTaskId = SCOPE_IDENTITY();
        SET @NewTaskCode = 'TSK-' + CAST(@NewTaskId AS VARCHAR(20));

        UPDATE dbo.HR_TaskMaster
        SET TaskCode = @NewTaskCode
        WHERE TaskId = @NewTaskId;

        -- 5. Audit History Log
        DECLARE @HistoryRemarks NVARCHAR(MAX) = ISNULL(@InitialRemarks, 'Task created.');
        IF @IsSelfTask = 1
            SET @HistoryRemarks = @HistoryRemarks + ' (Self-assigned task)';

        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, NewStatus, NewAssigneeEmpId,
            Remarks, AttachmentName, AttachmentPath,
            ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
        )
        VALUES
        (
            @NewTaskId, 'CREATED', @Status, @AssignedToEmpId,
            @HistoryRemarks, @AttachmentName, @AttachmentPath,
            @CreatedByEmpId, @CreatedByUserId, @ResolvedName, GETDATE()
        );

        COMMIT TRANSACTION;

        -- 6. Dispatch Notifications to Stakeholders
        BEGIN TRY
            EXEC dbo.usp_HR_Task_DispatchNotification 
                @TaskId = @NewTaskId, 
                @EventType = 'CREATED', 
                @ActorName = @ResolvedName;
        END TRY
        BEGIN CATCH
            -- Notifications never fail the task creation
        END CATCH;

        SELECT 
            @NewTaskId   AS TaskId, 
            @NewTaskCode AS TaskCode, 
            1            AS Success, 
            'Task created successfully.' AS Message;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO