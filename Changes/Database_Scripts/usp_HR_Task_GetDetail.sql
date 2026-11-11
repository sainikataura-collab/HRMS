-- ======================================================================================
-- OBJECT: dbo.usp_HR_Task_GetDetail
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
-- 4. STORED PROCEDURE: dbo.usp_HR_Task_GetDetail (and usp_HR_Task_GetByIdWithHistory)
-- Security hardened with IsAuthorized check.
-- --------------------------------------------------------------------------------------
CREATE   PROCEDURE dbo.usp_HR_Task_GetDetail
    @TaskId     INT,
    @ViewerId   VARCHAR(50) = NULL,
    @UserType   VARCHAR(20) = NULL,
    @CompanyId  VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Authorization check
    IF @ViewerId IS NOT NULL AND @ViewerId <> ''
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM dbo.fn_HR_Task_VisibleTasks(@ViewerId, @UserType, @CompanyId)
            WHERE TaskId = @TaskId
        )
        BEGIN
            -- Return unauthorized signal in Result Set 1
            SELECT 
                CAST(0 AS BIT) AS IsAuthorized,
                @TaskId        AS TaskId,
                ''             AS TaskCode,
                ''             AS Subject,
                'OPEN'         AS Status,
                'MEDIUM'       AS Priority,
                GETDATE()      AS DueDate,
                GETDATE()      AS CreatedAt,
                GETDATE()      AS UpdatedAt;

            -- Empty Result Set 2
            SELECT TOP 0 1 AS HistoryId, 1 AS TaskId, '' AS ActionType, '' AS ActionByName, GETDATE() AS CreatedAt;
            RETURN;
        END
    END

    -- Result Set 1: Master task details
    SELECT 
        CAST(1 AS BIT) AS IsAuthorized,
        t.TaskId,
        t.TaskCode,
        t.Subject,
        t.Description,
        t.Priority,
        t.Status,
        t.TargetDeptId,
        ISNULL(d.description, 'All Departments') AS DepartmentName,
        t.AssignedToEmpId,
        ISNULL(e.empname, 'Unassigned') AS AssignedToDisplayName,
        t.CreatedByEmpId,
        t.CreatedByUserId,
        t.CreatedByName AS CreatedByDisplayName,
        t.CreatorDeptId,
        t.DueDate,
        t.AttachmentName,
        t.AttachmentPath,
        t.IsRecurring,
        t.RecurrenceType,
        t.RecurrenceInterval,
        t.RecurrenceDays,
        t.RecurrenceDayOfMonth,
        t.RecurrenceEndType,
        t.RecurrenceEndDate,
        t.RecurrenceOccurrencesTotal,
        t.RecurrenceOccurrencesCount,
        t.RecurrenceDueOffsetHours,
        t.RecurrenceDueOffsetUnit,
        t.NextOccurrenceDate,
        t.ParentTaskId,
        t.IsSelfTask,
        t.TaskTypeId,
        ISNULL(t.TaskTypeName, 'General') AS TaskTypeName,
        t.ClosedAt,
        t.CompanyId,
        t.CreatedAt,
        t.UpdatedAt,
        CASE 
            WHEN t.Status <> 'CLOSED' AND t.DueDate IS NOT NULL AND t.DueDate < GETDATE() 
            THEN 1 ELSE 0 
        END AS IsOverdue,
        CASE 
            WHEN t.Status <> 'CLOSED' AND t.DueDate IS NOT NULL AND t.DueDate < GETDATE() 
            THEN DATEDIFF(HOUR, t.DueDate, GETDATE()) 
            ELSE 0 
        END AS OverdueHours,
        DATEDIFF(MINUTE, t.CreatedAt, GETDATE()) AS AgeMinutes
    FROM dbo.HR_TaskMaster t
    LEFT JOIN dbo.Department_Mst d ON t.TargetDeptId = d.pk_deptid COLLATE DATABASE_DEFAULT
    LEFT JOIN dbo.SAL_Employee_Mst e ON t.AssignedToEmpId = e.pk_empid COLLATE DATABASE_DEFAULT
    WHERE t.TaskId = @TaskId
      AND t.IsActive = 1
      AND (@CompanyId IS NULL OR t.CompanyId = @CompanyId COLLATE DATABASE_DEFAULT);

    -- Result Set 2: Audit History Timeline
    SELECT 
        h.HistoryId,
        h.TaskId,
        h.ActionType,
        h.OldStatus,
        h.NewStatus,
        h.NewAssigneeEmpId,
        ISNULL(ae.empname, '') AS NewAssigneeName,
        h.Remarks,
        h.AttachmentName,
        h.AttachmentPath,
        h.ActionByEmpId,
        h.ActionByName,
        h.CreatedAt
    FROM dbo.HR_TaskHistory h
    LEFT JOIN dbo.SAL_Employee_Mst ae ON h.NewAssigneeEmpId = ae.pk_empid COLLATE DATABASE_DEFAULT
    WHERE h.TaskId = @TaskId
    ORDER BY h.CreatedAt ASC;
END;
GO