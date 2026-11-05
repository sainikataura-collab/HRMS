using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    // =========================================================================
    // TASK MANAGER LOOKUP & VIEWER CONTEXT DTOs
    // =========================================================================

    public class TaskViewerRoleDto
    {
        public string? ViewerEmpId { get; set; }
        public string? ViewerUserId { get; set; }
        public string ViewerName { get; set; } = "";
        public string? ViewerDeptId { get; set; }
        public string? ViewerDeptName { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsHod { get; set; }
        public bool IsManager { get; set; }
    }

    public class TaskDepartmentLookupDto
    {
        public string DeptId { get; set; } = "";
        public string DeptName { get; set; } = "";
        public string? HodEmpId { get; set; }
    }

    public class TaskEmployeeLookupDto
    {
        public string EmpId { get; set; } = "";
        public string EmpCode { get; set; } = "";
        public string EmpName { get; set; } = "";
        public string? DeptId { get; set; }
        public string? DeptName { get; set; }
        public string? Email { get; set; }
    }

    public class TaskTypeLookupDto
    {
        public int TaskTypeId { get; set; }
        public string TaskTypeName { get; set; } = "";
        public string? TaskTypeCode { get; set; }
        public string? TaskTypeDescription { get; set; }
    }

    public class TaskLookupsResponseDto
    {
        public TaskViewerRoleDto? ViewerContext { get; set; }
        public List<TaskDepartmentLookupDto> Departments { get; set; } = new();
        public List<TaskEmployeeLookupDto> Employees { get; set; } = new();
        public List<TaskTypeLookupDto> TaskTypes { get; set; } = new();
    }

    // =========================================================================
    // TASK BOARD FILTER & KPI SUMMARY DTOs
    // =========================================================================

    public class TaskBoardFilterDto
    {
        public string? ViewerId { get; set; }
        public string? UserType { get; set; }
        public int? RoleId { get; set; }
        public string Scope { get; set; } = "ALL"; // ALL, MY_TASKS, DEPT_TASKS, CREATED_BY_ME, SELF_TASKS
        public string? DeptId { get; set; }
        public string? AssignedToEmpId { get; set; }
        public string? CreatedByEmpId { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? RecurrenceType { get; set; }
        public int? TaskTypeId { get; set; }
        public bool OnlyUnassigned { get; set; }
        public bool OnlyOverdue { get; set; }
        public string? SearchText { get; set; }
        public string? CompanyId { get; set; }
    }

    public class TaskKpiSummaryDto
    {
        public int TotalCount { get; set; }
        public int OpenCount { get; set; }
        public int ClosedCount { get; set; }
        public int OnHoldCount { get; set; }
        public int UnassignedCount { get; set; }
        public int OverdueCount { get; set; }
        public int MyAssignedCount { get; set; }
        public int DeptTaskCount { get; set; }
        public int CreatedByMeCount { get; set; }
        public int SelfTaskCount { get; set; }

        // SQL Stored Procedure alias properties for Dapper mapping
        public int TotalTasks { get => TotalCount; set => TotalCount = value; }
        public int OpenTasks { get => OpenCount; set => OpenCount = value; }
        public int ClosedTasks { get => ClosedCount; set => ClosedCount = value; }
        public int OnHoldTasks { get => OnHoldCount; set => OnHoldCount = value; }
        public int UnassignedTasks { get => UnassignedCount; set => UnassignedCount = value; }
        public int OverdueTasks { get => OverdueCount; set => OverdueCount = value; }
    }

    // =========================================================================
    // TASK CARD & BOARD RESPONSE DTOs
    // =========================================================================

    public class TaskCardDto
    {
        public int TaskId { get; set; }
        public string TaskCode { get; set; } = "";
        public string Subject { get; set; } = "";
        public string? Description { get; set; }
        public string Priority { get; set; } = "MEDIUM"; // HIGH, MEDIUM, LOW
        public string Status { get; set; } = "OPEN"; // OPEN, CLOSED, ON_HOLD
        public string? TargetDeptId { get; set; }
        public string DepartmentName { get; set; } = "";
        public string? AssignedToEmpId { get; set; }
        public string AssignedToDisplayName { get; set; } = "Unassigned";
        public string? AssignedToEmpCode { get; set; }
        public string? CreatedByEmpId { get; set; }
        public string? CreatedByUserId { get; set; }
        public string CreatedByDisplayName { get; set; } = "Admin";
        public string? CreatorDeptId { get; set; }
        public DateTime DueDate { get; set; }
        public string? AttachmentName { get; set; }
        public string? AttachmentPath { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrenceType { get; set; } = "NONE";
        public int RecurrenceInterval { get; set; } = 1;
        public string? RecurrenceDays { get; set; }
        public int? RecurrenceDayOfMonth { get; set; }
        public string? RecurrenceEndType { get; set; } = "NEVER";
        public DateTime? RecurrenceEndDate { get; set; }
        public int? RecurrenceOccurrencesTotal { get; set; }
        public int RecurrenceOccurrencesCount { get; set; }
        public int? RecurrenceDueOffsetHours { get; set; }
        public string? RecurrenceDueOffsetUnit { get; set; }
        public DateTime? NextOccurrenceDate { get; set; }
        public int? ParentTaskId { get; set; }
        public string? ParentTaskCode { get; set; }
        public bool IsSelfTask { get; set; }
        public int? TaskTypeId { get; set; }
        public string TaskTypeName { get; set; } = "General";
        public DateTime? ClosedAt { get; set; }
        public string? CompanyId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsOverdue { get; set; }
        public decimal OverdueHours { get; set; }
        public int AgeMinutes { get; set; }
        public int HistoryCount { get; set; }
    }

    public class TaskBoardResponseDto
    {
        public TaskKpiSummaryDto Summary { get; set; } = new();
        public List<TaskCardDto> OpenTasks { get; set; } = new();
        public List<TaskCardDto> ClosedTasks { get; set; } = new();
        public List<TaskCardDto> OnHoldTasks { get; set; } = new();
        public List<TaskCardDto> AllTasks { get; set; } = new();
    }

    // =========================================================================
    // TASK HISTORY & DETAIL DTOs
    // =========================================================================

    public class TaskHistoryItemDto
    {
        public int HistoryId { get; set; }
        public int TaskId { get; set; }
        public string ActionType { get; set; } = ""; // CREATED, STATUS_CHANGED, ASSIGNED, REMARK_ADDED, EDITED, ATTACHMENT_ADDED, RECURRENCE_GENERATED
        public string? OldStatus { get; set; }
        public string? NewStatus { get; set; }
        public string? OldAssigneeEmpId { get; set; }
        public string? OldAssigneeName { get; set; }
        public string? NewAssigneeEmpId { get; set; }
        public string? NewAssigneeName { get; set; }
        public string Remarks { get; set; } = "";
        public string? AttachmentName { get; set; }
        public string? AttachmentPath { get; set; }
        public string? ActionByEmpId { get; set; }
        public string? ActionByUserId { get; set; }
        public string ActionByDisplayName { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class TaskDetailResponseDto
    {
        public TaskCardDto? Task { get; set; }
        public List<TaskHistoryItemDto> History { get; set; } = new();
    }

    // =========================================================================
    // TASK CREATE & STATUS TRANSITION REQUEST DTOs
    // =========================================================================

    public class CreateTaskRequestDto
    {
        public string Subject { get; set; } = "";
        public string? Description { get; set; }
        public string Priority { get; set; } = "MEDIUM";
        public string Status { get; set; } = "OPEN";
        public string? TargetDeptId { get; set; }
        public string? AssignedToEmpId { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsRecurring { get; set; }
        public string RecurrenceType { get; set; } = "NONE"; // NONE, DAILY, WEEKLY, MONTHLY, YEARLY
        public int RecurrenceInterval { get; set; } = 1;
        public string? RecurrenceDays { get; set; }
        public int? RecurrenceDayOfMonth { get; set; }
        public string? RecurrenceEndType { get; set; } = "NEVER"; // NEVER, ON_DATE, AFTER_COUNT
        public DateTime? RecurrenceEndDate { get; set; }
        public int? RecurrenceOccurrencesTotal { get; set; }
        public int? RecurrenceDueOffsetHours { get; set; } = 24;
        public string? RecurrenceDueOffsetUnit { get; set; } = "DAYS";
        public bool IsSelfTask { get; set; }
        public int? TaskTypeId { get; set; }
        public string? TaskTypeName { get; set; }
        public string? ActionById { get; set; }
        public string? ActionByName { get; set; }
        public string? CompanyId { get; set; }
        public string? InitialRemarks { get; set; }
        public IFormFile? Attachment { get; set; }
    }

    public class TaskStatusTransitionRequestDto
    {
        public int TaskId { get; set; }
        public string NewStatus { get; set; } = "";
        public string Remarks { get; set; } = "";
        public string? NewAssigneeEmpId { get; set; } = "__KEEP__";
        public string? NewPriority { get; set; }
        public DateTime? NewDueDate { get; set; }
        public string? ActionById { get; set; }
        public string? ActionByName { get; set; }
        public IFormFile? Attachment { get; set; }
    }

    public class BoardRequestPayload
    {
        public string? ViewerEmpId { get; set; }
        public string? Scope { get; set; }
        public string? DepartmentId { get; set; }
        public string? AssignedToEmpId { get; set; }
        public string? CreatedByEmpId { get; set; }
        public string? Priority { get; set; }
        public string? RecurrencePattern { get; set; }
        public string? SearchKeyword { get; set; }
        public string? FilterCard { get; set; }
        public string? CompanyId { get; set; }
        public int? TaskTypeId { get; set; }
    }

    public class CreateTaskJsonDto
    {
        public int? TaskId { get; set; }
        public string Subject { get; set; } = "";
        public string? Description { get; set; }
        public string? DepartmentId { get; set; }
        public string? AssignedToEmpId { get; set; }
        public string Priority { get; set; } = "MEDIUM";
        public DateTime? DeadlineDate { get; set; }
        public bool IsRecurring { get; set; }
        public string? RecurrencePattern { get; set; }
        public int? RecurrenceInterval { get; set; }
        public string? RecurrenceDays { get; set; }
        public int? RecurrenceDayOfMonth { get; set; }
        public string? RecurrenceEndType { get; set; }
        public DateTime? RecurrenceEndDate { get; set; }
        public int? RecurrenceOccurrencesTotal { get; set; }
        public int? RecurrenceDueOffsetHours { get; set; }
        public string? RecurrenceDueOffsetUnit { get; set; }
        public string? AttachmentUrl { get; set; }
        public string? AttachmentFileName { get; set; }
        public string? CreatedByEmpId { get; set; }
        public string? CreatedByName { get; set; }
        public string? CompanyId { get; set; }
        public int? TaskTypeId { get; set; }
        public string? TaskTypeName { get; set; }
    }

    public class UpdateStatusJsonDto
    {
        public int TaskId { get; set; }
        public string NewStatus { get; set; } = "";
        public string? Remarks { get; set; }
        public string? UpdatedByEmpId { get; set; }
        public string? UpdatedByName { get; set; }
        public string? CompanyId { get; set; }
    }
}

