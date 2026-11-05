-- =============================================================================
-- Stored Procedure: dbo.usp_HR_Task_Create
-- Description: Creates task and automatically spawns initial OPEN execution
--              instance when @IsRecurring = 1
-- =============================================================================
CREATE OR ALTER PROCEDURE dbo.usp_HR_Task_Create
    @Subject                    NVARCHAR(250),
    @Description                NVARCHAR(MAX)   = NULL,
    @Priority                   VARCHAR(20)     = 'MEDIUM',
    @Status                     VARCHAR(20)     = 'OPEN',
    @TargetDeptId               VARCHAR(50)     = NULL,
    @AssignedToEmpId            VARCHAR(50)     = NULL,
    @DueDate                    DATETIME,
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
    @CompanyId                  VARCHAR(50)     = NULL,
    @InitialRemarks             NVARCHAR(MAX)   = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET ANSI_NULLS ON;
    SET QUOTED_IDENTIFIER ON;

    DECLARE @CreatedByEmpId    VARCHAR(50) = NULL;
    DECLARE @CreatedByUserId   VARCHAR(50) = NULL;
    DECLARE @CreatorDeptId     VARCHAR(50) = NULL;
    DECLARE @ResolvedName      NVARCHAR(150) = ISNULL(@ActionByName, 'User');
    DECLARE @ResolvedCompanyId VARCHAR(50) = @CompanyId;
    DECLARE @ResolvedTaskType  VARCHAR(100) = @TaskTypeName;
    DECLARE @TaskCode          VARCHAR(50);
    DECLARE @NewTaskId         INT;
    DECLARE @NextOccurDate     DATETIME = NULL;
    DECLARE @CalculatedInitialDue DATETIME = @DueDate;

    IF EXISTS (SELECT 1 FROM dbo.SAL_Employee_Mst WHERE pk_empid = @ActionById)
    BEGIN
        SELECT TOP 1 
            @CreatedByEmpId    = e.pk_empid,
            @CreatorDeptId     = e.fk_deptid,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, e.fk_companyId),
            @ResolvedName      = ISNULL(@ActionByName, e.empname)
        FROM dbo.SAL_Employee_Mst e
        WHERE e.pk_empid = @ActionById;
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.Tbl_User_Master WHERE pk_userid = @ActionById)
    BEGIN
        SELECT TOP 1 
            @CreatedByUserId   = u.pk_userid,
            @ResolvedCompanyId = ISNULL(@ResolvedCompanyId, u.fk_companyId),
            @ResolvedName      = ISNULL(@ActionByName, u.username)
        FROM dbo.Tbl_User_Master u
        WHERE u.pk_userid = @ActionById;
    END

    IF @TaskTypeId IS NOT NULL AND @ResolvedTaskType IS NULL
    BEGIN
        SELECT TOP 1 @ResolvedTaskType = TypeName
        FROM dbo.HR_TaskTypes
        WHERE TaskTypeId = @TaskTypeId;
    END

    IF @ResolvedTaskType IS NULL SET @ResolvedTaskType = 'General';
    IF @ResolvedCompanyId IS NULL SET @ResolvedCompanyId = 'GU-1';

    -- Generate sequential TaskCode
    DECLARE @YearStr VARCHAR(4) = CAST(YEAR(GETDATE()) AS VARCHAR(4));
    DECLARE @NextNum INT = 1;

    SELECT @NextNum = ISNULL(MAX(CAST(RIGHT(TaskCode, 4) AS INT)), 0) + 1
    FROM dbo.HR_TaskMaster
    WHERE TaskCode LIKE 'HR_TSK-' + @YearStr + '-%'
      AND ISNUMERIC(RIGHT(TaskCode, 4)) = 1;

    SET @TaskCode = 'HR_TSK-' + @YearStr + '-' + RIGHT('0000' + CAST(@NextNum AS VARCHAR(4)), 4);

    -- Calculate NextOccurrenceDate for recurring task
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
            IF @RecurrenceDayOfMonth IS NOT NULL AND @RecurrenceDayOfMonth BETWEEN 1 AND 28
                SET @NextOccurDate = DATEFROMPARTS(YEAR(DATEADD(MONTH, @RecInterval, @BaseNext)), MONTH(DATEADD(MONTH, @RecInterval, @BaseNext)), @RecurrenceDayOfMonth);
            ELSE
                SET @NextOccurDate = DATEADD(MONTH, @RecInterval, @BaseNext);
        END
        ELSE IF @RecurrenceType = 'YEARLY'
            SET @NextOccurDate = DATEADD(YEAR, @RecInterval, @BaseNext);
        ELSE
            SET @NextOccurDate = DATEADD(DAY, 1, @BaseNext);

        -- SLA offset
        DECLARE @OffHours INT = ISNULL(@RecurrenceDueOffsetHours, 24);
        IF @OffHours <= 0 SET @OffHours = 24;
        SET @CalculatedInitialDue = DATEADD(HOUR, @OffHours, GETDATE());
    END

    INSERT INTO dbo.HR_TaskMaster
    (
        TaskCode, Subject, Description, Priority, Status, TargetDeptId, AssignedToEmpId,
        CreatedByEmpId, CreatedByUserId, CreatedByName, CreatorDeptId, DueDate,
        AttachmentName, AttachmentPath, IsRecurring, RecurrenceType, RecurrenceInterval,
        RecurrenceDays, RecurrenceDayOfMonth, RecurrenceEndType, RecurrenceEndDate,
        RecurrenceOccurrencesTotal, RecurrenceOccurrencesCount, RecurrenceDueOffsetHours, RecurrenceDueOffsetUnit,
        NextOccurrenceDate, ParentTaskId, IsSelfTask, TaskTypeId, TaskTypeName, ClosedAt, CompanyId, CreatedAt, UpdatedAt, IsActive
    )
    VALUES
    (
        @TaskCode, @Subject, @Description, ISNULL(@Priority, 'MEDIUM'), ISNULL(@Status, 'OPEN'),
        @TargetDeptId, @AssignedToEmpId, @CreatedByEmpId, @CreatedByUserId, @ResolvedName, @CreatorDeptId,
        @CalculatedInitialDue, @AttachmentName, @AttachmentPath, ISNULL(@IsRecurring, 0), ISNULL(@RecurrenceType, 'NONE'),
        ISNULL(@RecurrenceInterval, 1), @RecurrenceDays, @RecurrenceDayOfMonth,
        ISNULL(@RecurrenceEndType, 'NEVER'), @RecurrenceEndDate, @RecurrenceOccurrencesTotal, 0,
        @RecurrenceDueOffsetHours, ISNULL(@RecurrenceDueOffsetUnit, 'DAYS'),
        @NextOccurDate, NULL, ISNULL(@IsSelfTask, 0), @TaskTypeId, @ResolvedTaskType,
        CASE WHEN @Status = 'CLOSED' THEN GETDATE() ELSE NULL END, @ResolvedCompanyId, GETDATE(), GETDATE(), 1
    );

    SET @NewTaskId = SCOPE_IDENTITY();

    INSERT INTO dbo.HR_TaskHistory
    (
        TaskId, ActionType, OldStatus, NewStatus, NewAssigneeEmpId,
        Remarks, AttachmentName, AttachmentPath, ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
    )
    VALUES
    (
        @NewTaskId, 'CREATED', NULL, ISNULL(@Status, 'OPEN'), @AssignedToEmpId,
        ISNULL(@InitialRemarks, CONCAT('Task created under ', @ResolvedTaskType, '.')), @AttachmentName, @AttachmentPath,
        @CreatedByEmpId, @CreatedByUserId, @ResolvedName, GETDATE()
    );

    -- If recurring, automatically spawn the first active OPEN task instance!
    IF @IsRecurring = 1
    BEGIN
        EXEC dbo.usp_HR_Task_ProcessRecurring @TargetTaskId = @NewTaskId;
    END

    SELECT 
        TaskId, TaskCode, Subject, Status, Priority, TaskTypeId, TaskTypeName, AssignedToEmpId, TargetDeptId, DueDate, CompanyId, CreatedAt
    FROM dbo.HR_TaskMaster
    WHERE TaskId = @NewTaskId;
END
GO

