-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_DispatchNotification
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
-- 6. STORED PROCEDURE: dbo.usp_HR_Task_DispatchNotification
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_DispatchNotification
    @TaskId     INT,
    @EventType  VARCHAR(20),
    @ActorName  NVARCHAR(150) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TaskCode VARCHAR(50);
    DECLARE @Subject NVARCHAR(250);
    DECLARE @Status VARCHAR(20);
    DECLARE @Priority VARCHAR(20);
    DECLARE @TargetDeptId VARCHAR(50);
    DECLARE @CreatorDeptId VARCHAR(50);
    DECLARE @AssignedToEmpId VARCHAR(50);
    DECLARE @CreatedByEmpId VARCHAR(50);
    DECLARE @CreatedByName NVARCHAR(150);
    DECLARE @CompanyId VARCHAR(50);

    SELECT TOP 1
        @TaskCode = t.TaskCode,
        @Subject = t.Subject,
        @Status = t.Status,
        @Priority = t.Priority,
        @TargetDeptId = t.TargetDeptId,
        @CreatorDeptId = t.CreatorDeptId,
        @AssignedToEmpId = t.AssignedToEmpId,
        @CreatedByEmpId = t.CreatedByEmpId,
        @CreatedByName = t.CreatedByName,
        @CompanyId = t.CompanyId
    FROM dbo.HR_TaskMaster t
    WHERE t.TaskId = @TaskId;

    IF @TaskCode IS NULL RETURN;

    DECLARE @Title VARCHAR(100);
    DECLARE @Description VARCHAR(255);
    DECLARE @ActorDisplay NVARCHAR(150) = ISNULL(@ActorName, ISNULL(@CreatedByName, 'System'));

    IF @EventType = 'CREATED'
    BEGIN
        SET @Title = 'New Task Assigned: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' created task "' + @Subject + '"', 1, 255);
    END
    ELSE IF @EventType = 'STATUS_CHANGED'
    BEGIN
        SET @Title = 'Task Status Updated: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' changed status of "' + @Subject + '" to ' + @Status, 1, 255);
    END
    ELSE IF @EventType = 'REASSIGNED'
    BEGIN
        SET @Title = 'Task Reassigned: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' reassigned task "' + @Subject + '"', 1, 255);
    END
    ELSE
    BEGIN
        SET @Title = 'Task Updated: ' + @TaskCode;
        SET @Description = SUBSTRING(@ActorDisplay + ' updated task "' + @Subject + '"', 1, 255);
    END

    -- Collect deduplicated stakeholder EmpIds
    DECLARE @Stakeholders TABLE (EmpId VARCHAR(50) PRIMARY KEY);

    IF @AssignedToEmpId IS NOT NULL AND LTRIM(RTRIM(@AssignedToEmpId)) <> ''
        INSERT INTO @Stakeholders (EmpId) VALUES (@AssignedToEmpId);

    IF @CreatedByEmpId IS NOT NULL AND LTRIM(RTRIM(@CreatedByEmpId)) <> ''
        INSERT INTO @Stakeholders (EmpId) 
        SELECT @CreatedByEmpId WHERE @CreatedByEmpId NOT IN (SELECT EmpId FROM @Stakeholders);

    IF @TargetDeptId IS NOT NULL AND LTRIM(RTRIM(@TargetDeptId)) <> ''
        INSERT INTO @Stakeholders (EmpId)
        SELECT d.fk_depHodid 
        FROM dbo.Department_Mst d
        WHERE d.pk_deptid = @TargetDeptId 
          AND d.fk_depHodid IS NOT NULL 
          AND LTRIM(RTRIM(d.fk_depHodid)) <> ''
          AND d.fk_depHodid NOT IN (SELECT EmpId FROM @Stakeholders);

    IF @CreatorDeptId IS NOT NULL AND LTRIM(RTRIM(@CreatorDeptId)) <> ''
        INSERT INTO @Stakeholders (EmpId)
        SELECT d.fk_depHodid 
        FROM dbo.Department_Mst d
        WHERE d.pk_deptid = @CreatorDeptId 
          AND d.fk_depHodid IS NOT NULL 
          AND LTRIM(RTRIM(d.fk_depHodid)) <> ''
          AND d.fk_depHodid NOT IN (SELECT EmpId FROM @Stakeholders);

    IF @AssignedToEmpId IS NOT NULL AND LTRIM(RTRIM(@AssignedToEmpId)) <> ''
    BEGIN
        INSERT INTO @Stakeholders (EmpId)
        SELECT mgr.Id
        FROM dbo.SAL_Employee_Mst e
        CROSS APPLY (
            SELECT e.fk_rmanagerid AS Id UNION
            SELECT e.fk_imanagerid AS Id UNION
            SELECT e.fk_FunctionalRepempid AS Id UNION
            SELECT e.fk_AdministrativeRepempid AS Id
        ) mgr
        WHERE e.pk_empid = @AssignedToEmpId
          AND mgr.Id IS NOT NULL 
          AND LTRIM(RTRIM(mgr.Id)) <> ''
          AND mgr.Id NOT IN (SELECT EmpId FROM @Stakeholders);
    END

    IF EXISTS (SELECT 1 FROM @Stakeholders)
    BEGIN
        INSERT INTO dbo.LMS_Notification_Mst (title, description, active)
        VALUES (@Title, @Description, 1);

        DECLARE @NotificationId BIGINT = SCOPE_IDENTITY();

        INSERT INTO dbo.LMS_Notification_Employee_Map (fk_empid, fk_notificationid, diffusion, diffusiondate, active)
        SELECT s.EmpId, @NotificationId, 0, GETDATE(), 1
        FROM @Stakeholders s
        WHERE s.EmpId IS NOT NULL AND LTRIM(RTRIM(s.EmpId)) <> '';
    END
END;
GO