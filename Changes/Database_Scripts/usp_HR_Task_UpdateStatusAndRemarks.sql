-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_UpdateStatusAndRemarks
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
-- 5. STORED PROCEDURE: dbo.usp_HR_Task_UpdateStatusAndRemarks
-- Checks authorization before allowing status transitions.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_UpdateStatusAndRemarks
    @TaskId             INT,
    @NewStatus          VARCHAR(20),
    @Remarks            NVARCHAR(MAX),
    @NewAssigneeEmpId   VARCHAR(50)   = '__KEEP__',
    @NewPriority        VARCHAR(20)   = NULL,
    @NewDueDate         DATETIME      = NULL,
    @AttachmentName     NVARCHAR(255) = NULL,
    @AttachmentPath     NVARCHAR(500) = NULL,
    @ActionById         VARCHAR(50)   = NULL,
    @ActionByName       NVARCHAR(150) = NULL,
    @UserType           VARCHAR(20)   = NULL,
    @CompanyId          VARCHAR(50)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Remarks IS NULL OR LTRIM(RTRIM(@Remarks)) = ''
    BEGIN
        RAISERROR('Mandatory remarks must be provided for task status transition or history update.', 16, 1);
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
            RAISERROR('Not authorized to update this task.', 16, 1);
            RETURN;
        END
    END

    DECLARE @OldStatus           VARCHAR(20);
    DECLARE @OldAssigneeEmpId    VARCHAR(50);
    DECLARE @ResolvedActionByEmp VARCHAR(50) = NULL;
    DECLARE @ResolvedActionByUser VARCHAR(50) = NULL;
    DECLARE @ResolvedActorName   NVARCHAR(150) = ISNULL(@ActionByName, 'User');
    DECLARE @ActionType          VARCHAR(50) = 'STATUS_CHANGED';

    -- Fetch current state
    SELECT TOP 1 
        @OldStatus        = Status,
        @OldAssigneeEmpId = AssignedToEmpId
    FROM dbo.HR_TaskMaster
    WHERE TaskId = @TaskId;

    IF @OldStatus IS NULL
    BEGIN
        RAISERROR('Task not found.', 16, 1);
        RETURN;
    END

    -- Resolve actor using fn_HR_Task_ResolveViewer
    SELECT TOP 1
        @ResolvedActionByEmp  = EmpId,
        @ResolvedActionByUser = UserId,
        @ResolvedActorName    = ISNULL(@ActionByName, ResolvedName)
    FROM dbo.fn_HR_Task_ResolveViewer(@ActionById, @UserType);

    IF @ResolvedActorName IS NULL OR @ResolvedActorName = ''
        SET @ResolvedActorName = ISNULL(@ActionByName, 'User');

    -- Determine ActionType
    IF @OldStatus <> @NewStatus
        SET @ActionType = 'STATUS_CHANGED';
    ELSE IF @NewAssigneeEmpId <> '__KEEP__' AND ISNULL(@OldAssigneeEmpId, '') <> ISNULL(@NewAssigneeEmpId, '')
        SET @ActionType = 'ASSIGNED';
    ELSE IF @AttachmentName IS NOT NULL
        SET @ActionType = 'ATTACHMENT_ADDED';
    ELSE
        SET @ActionType = 'REMARK_ADDED';

    BEGIN TRANSACTION;
    BEGIN TRY
        -- Update Task Master
        UPDATE dbo.HR_TaskMaster
        SET Status = @NewStatus,
            ClosedAt = CASE WHEN @NewStatus = 'CLOSED' THEN ISNULL(ClosedAt, GETDATE()) 
                            WHEN @OldStatus = 'CLOSED' AND @NewStatus <> 'CLOSED' THEN NULL 
                            ELSE ClosedAt END,
            AssignedToEmpId = CASE WHEN @NewAssigneeEmpId = '__KEEP__' THEN AssignedToEmpId ELSE @NewAssigneeEmpId END,
            Priority = ISNULL(@NewPriority, Priority),
            DueDate = ISNULL(@NewDueDate, DueDate),
            AttachmentName = ISNULL(@AttachmentName, AttachmentName),
            AttachmentPath = ISNULL(@AttachmentPath, AttachmentPath),
            UpdatedAt = GETDATE()
        WHERE TaskId = @TaskId;

        -- Insert History audit trail
        INSERT INTO dbo.HR_TaskHistory
        (
            TaskId, ActionType, OldStatus, NewStatus, OldAssigneeEmpId,
            NewAssigneeEmpId, Remarks, AttachmentName, AttachmentPath,
            ActionByEmpId, ActionByUserId, ActionByName, CreatedAt
        )
        VALUES
        (
            @TaskId, @ActionType, @OldStatus, @NewStatus, @OldAssigneeEmpId,
            CASE WHEN @NewAssigneeEmpId = '__KEEP__' THEN @OldAssigneeEmpId ELSE @NewAssigneeEmpId END,
            @Remarks, @AttachmentName, @AttachmentPath,
            @ResolvedActionByEmp, @ResolvedActionByUser, @ResolvedActorName, GETDATE()
        );

        COMMIT TRANSACTION;

        -- Dispatch notification to stakeholders
        BEGIN TRY
            EXEC dbo.usp_HR_Task_DispatchNotification
                @TaskId = @TaskId,
                @EventType = @ActionType,
                @ActorEmpId = @ResolvedActionByEmp,
                @ActorName = @ResolvedActorName,
                @Remarks = @Remarks;
        END TRY
        BEGIN CATCH
        END CATCH;

        SELECT 1 AS Success, @TaskId AS TaskId, @NewStatus AS NewStatus;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO