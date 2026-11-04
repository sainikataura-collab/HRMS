using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class TaskManagerController : ControllerBase
    {
        private readonly ITaskManagerRepository _repository;

        public TaskManagerController(ITaskManagerRepository repository)
        {
            _repository = repository;
        }

        private string? ResolveCompanyId(string? explicitCompanyId = null)
        {
            if (!string.IsNullOrWhiteSpace(explicitCompanyId))
                return explicitCompanyId.Trim();

            var fromItems = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            if (!string.IsNullOrWhiteSpace(fromItems))
                return fromItems.Trim();

            if (Request.Headers.TryGetValue("companyId", out var compHeader) && !string.IsNullOrWhiteSpace(compHeader))
                return compHeader.ToString().Trim();

            if (Request.Headers.TryGetValue("CompanyId", out var compHeader2) && !string.IsNullOrWhiteSpace(compHeader2))
                return compHeader2.ToString().Trim();

            return null;
        }

        private string? ResolveViewerId(string? explicitId)
        {
            if (!string.IsNullOrWhiteSpace(explicitId))
                return explicitId.Trim();

            var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
            if (!string.IsNullOrWhiteSpace(decryptedUserId))
                return decryptedUserId.Trim();

            return null;
        }

        private async Task<(string? FileName, string? RelativeUrl)> SaveAttachmentAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return (null, null);

            var rawFileName = Path.GetFileName(file.FileName);
            var sanitizedFileName = string.Join("_", rawFileName.Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries));
            if (string.IsNullOrWhiteSpace(sanitizedFileName))
                sanitizedFileName = "attachment.dat";

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Tasks");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var uniquePrefix = Guid.NewGuid().ToString("N").Substring(0, 8);
            var uniqueStoredFileName = $"{uniquePrefix}_{sanitizedFileName}";
            var fullFilePath = Path.Combine(uploadsDir, uniqueStoredFileName);

            using (var stream = new FileStream(fullFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return (rawFileName, $"/Uploads/Tasks/{uniqueStoredFileName}");
        }

        private static string FormatRelativeAge(int minutes, DateTime createdAt)
        {
            if (minutes <= 0)
                return "Just now";
            if (minutes < 60)
                return $"{minutes} min(s) ago";
            int hours = minutes / 60;
            if (hours < 24)
                return $"{hours} hour(s) ago";
            int days = hours / 24;
            if (days < 30)
                return $"{days} day(s) ago";
            int months = days / 30;
            return $"{months} month(s) ago";
        }

        private static object MapTaskCard(TaskCardDto t)
        {
            return new
            {
                taskId = t.TaskId,
                taskCode = t.TaskCode,
                subject = t.Subject,
                description = t.Description,
                priority = t.Priority,
                status = t.Status,
                departmentId = t.TargetDeptId,
                departmentName = t.DepartmentName,
                assignedToEmpId = t.AssignedToEmpId,
                assignedToEmpName = t.AssignedToDisplayName,
                assignedToDisplayName = t.AssignedToDisplayName,
                createdByEmpId = t.CreatedByEmpId,
                createdByName = t.CreatedByDisplayName,
                createdByDisplayName = t.CreatedByDisplayName,
                deadlineDate = t.DueDate,
                isOverdue = t.IsOverdue,
                overdueHours = t.OverdueHours,
                relativeAgeText = FormatRelativeAge(t.AgeMinutes, t.CreatedAt),
                isRecurring = t.IsRecurring,
                recurrencePattern = t.RecurrenceType,
                recurrenceDays = t.RecurrenceDays,
                recurrenceDayOfMonth = t.RecurrenceDayOfMonth,
                recurrenceEndType = t.RecurrenceEndType,
                recurrenceEndDate = t.RecurrenceEndDate,
                recurrenceOccurrencesTotal = t.RecurrenceOccurrencesTotal,
                recurrenceOccurrencesCount = t.RecurrenceOccurrencesCount,
                companyId = t.CompanyId,
                taskTypeId = t.TaskTypeId,
                taskTypeName = t.TaskTypeName ?? "General",
                hasAttachments = !string.IsNullOrWhiteSpace(t.AttachmentPath),
                attachmentUrl = t.AttachmentPath,
                attachmentFileName = t.AttachmentName,
                createdAt = t.CreatedAt,
                updatedAt = t.UpdatedAt
            };
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

        [HttpGet("lookups")]
        public async Task<IActionResult> GetLookups(
            [FromQuery] string? viewerId = null,
            [FromQuery] string? userType = null,
            [FromQuery] int? roleId = null,
            [FromQuery] string? companyId = null)
        {
            try
            {
                var resolvedId = ResolveViewerId(viewerId);
                var resolvedCompId = ResolveCompanyId(companyId);
                var lookups = await _repository.GetLookupsAsync(resolvedId, userType, roleId, resolvedCompId);

                return Ok(new
                {
                    isSuccess = true,
                    data = lookups,
                    departments = lookups.Departments.Select(d => new { id = d.DeptId, name = d.DeptName }),
                    employees = lookups.Employees.Select(e => new
                    {
                        id = e.EmpId,
                        name = e.EmpName,
                        departmentId = e.DeptId,
                        departmentName = e.DeptName,
                        isHod = false
                    }),
                    taskTypes = lookups.TaskTypes.Select(t => new
                    {
                        id = t.TaskTypeId,
                        name = t.TaskTypeName,
                        code = t.TaskTypeCode,
                        description = t.TaskTypeDescription
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading lookups: " + ex.Message });
            }
        }

        [HttpGet("employees")]
        public async Task<IActionResult> SearchEmployees(
            [FromQuery] string? deptId = null,
            [FromQuery] string? search = null,
            [FromQuery] string? companyId = null,
            [FromQuery] int top = 20)
        {
            try
            {
                var resolvedCompId = ResolveCompanyId(companyId) ?? "GU-1";
                var list = await _repository.SearchEmployeesAsync(resolvedCompId, deptId, search, top);
                return Ok(new
                {
                    isSuccess = true,
                    employees = list.Select(e => new
                    {
                        id = e.EmpId,
                        name = e.EmpName,
                        departmentId = e.DeptId,
                        departmentName = e.DeptName,
                        isHod = false
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error searching employees: " + ex.Message });
            }
        }

        [HttpPost("board")]
        public async Task<IActionResult> GetBoardPost([FromBody] BoardRequestPayload payload)
        {
            return await HandleGetBoard(payload);
        }

        [HttpGet("board")]
        public async Task<IActionResult> GetBoardGet([FromQuery] BoardRequestPayload payload)
        {
            return await HandleGetBoard(payload);
        }

        private async Task<IActionResult> HandleGetBoard(BoardRequestPayload? payload)
        {
            try
            {
                var filter = new TaskBoardFilterDto();
                if (payload != null)
                {
                    filter.ViewerId = ResolveViewerId(payload.ViewerEmpId);
                    filter.Scope = !string.IsNullOrWhiteSpace(payload.Scope) ? payload.Scope : "ALL";
                    filter.DeptId = payload.DepartmentId;
                    filter.AssignedToEmpId = payload.AssignedToEmpId;
                    filter.CreatedByEmpId = payload.CreatedByEmpId;
                    filter.Priority = payload.Priority;
                    filter.RecurrenceType = payload.RecurrencePattern;
                    filter.TaskTypeId = payload.TaskTypeId;
                    filter.SearchText = payload.SearchKeyword;
                    filter.CompanyId = ResolveCompanyId(payload.CompanyId);

                    var fc = (payload.FilterCard ?? "").ToUpper().Trim();
                    if (fc == "UNASSIGNED") filter.OnlyUnassigned = true;
                    else if (fc == "OVERDUE") filter.OnlyOverdue = true;
                    else if (fc == "OPEN") filter.Status = "OPEN";
                    else if (fc == "CLOSED") filter.Status = "CLOSED";
                    else if (fc == "ON_HOLD" || fc == "ON HOLD") filter.Status = "ON_HOLD";
                }

                var board = await _repository.GetBoardAsync(filter);

                return Ok(new
                {
                    isSuccess = true,
                    counts = new
                    {
                        allTasks = board.Summary.TotalCount,
                        openTasks = board.Summary.OpenCount,
                        closedTasks = board.Summary.ClosedCount,
                        onHoldTasks = board.Summary.OnHoldCount,
                        unassignedTasks = board.Summary.UnassignedCount,
                        overdueTasks = board.Summary.OverdueCount
                    },
                    openTasks = board.OpenTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    closedTasks = board.ClosedTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    onHoldTasks = board.OnHoldTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    allTasks = board.AllTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    data = board
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading task board: " + ex.Message });
            }
        }

        [HttpGet("{taskId:int}")]
        public async Task<IActionResult> GetTaskById([FromRoute] int taskId, [FromQuery] string? companyId = null)
        {
            try
            {
                var resolvedCompId = ResolveCompanyId(companyId);
                var detail = await _repository.GetTaskByIdWithHistoryAsync(taskId, resolvedCompId);
                if (detail == null || detail.Task == null)
                    return NotFound(new { isSuccess = false, message = $"Task with ID {taskId} was not found." });

                var mappedTask = MapTaskCard(detail.Task);
                var mappedHistory = detail.History.Select(h => new
                {
                    historyId = h.HistoryId,
                    taskId = h.TaskId,
                    actionType = h.ActionType,
                    fromStatus = h.OldStatus,
                    toStatus = h.NewStatus,
                    remarks = h.Remarks,
                    actorEmpId = h.ActionByEmpId,
                    actorName = h.ActionByDisplayName,
                    createdAt = h.CreatedAt,
                    timeAgo = FormatRelativeAge((int)Math.Max(0, (DateTime.Now - h.CreatedAt).TotalMinutes), h.CreatedAt)
                });

                return Ok(new
                {
                    isSuccess = true,
                    task = mappedTask,
                    history = mappedHistory,
                    data = detail
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading task details: " + ex.Message });
            }
        }

        public class CreateTaskJsonDto
        {
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

        [HttpPost("create")]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskJsonDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Subject))
                return BadRequest(new { isSuccess = false, message = "Task subject is required." });

            try
            {
                var req = new CreateTaskRequestDto
                {
                    Subject = dto.Subject.Trim(),
                    Description = dto.Description?.Trim(),
                    TargetDeptId = dto.DepartmentId,
                    AssignedToEmpId = dto.AssignedToEmpId,
                    Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "MEDIUM" : dto.Priority.Trim(),
                    DueDate = dto.DeadlineDate ?? DateTime.Today.AddDays(7),
                    IsRecurring = dto.IsRecurring,
                    RecurrenceType = dto.IsRecurring ? (dto.RecurrencePattern ?? "WEEKLY") : "NONE",
                    RecurrenceInterval = dto.RecurrenceInterval ?? 1,
                    RecurrenceDays = dto.RecurrenceDays,
                    RecurrenceDayOfMonth = dto.RecurrenceDayOfMonth,
                    RecurrenceEndType = dto.RecurrenceEndType ?? "NEVER",
                    RecurrenceEndDate = dto.RecurrenceEndDate,
                    RecurrenceOccurrencesTotal = dto.RecurrenceOccurrencesTotal,
                    RecurrenceDueOffsetHours = dto.RecurrenceDueOffsetHours ?? 24,
                    RecurrenceDueOffsetUnit = string.IsNullOrWhiteSpace(dto.RecurrenceDueOffsetUnit) ? "DAYS" : dto.RecurrenceDueOffsetUnit,
                    CompanyId = ResolveCompanyId(dto.CompanyId),
                    TaskTypeId = dto.TaskTypeId,
                    TaskTypeName = dto.TaskTypeName,
                    ActionById = ResolveViewerId(dto.CreatedByEmpId)
                };

                var (taskId, taskCode) = await _repository.CreateTaskAsync(req, dto.AttachmentFileName, dto.AttachmentUrl);

                return Ok(new
                {
                    isSuccess = true,
                    message = "Task created successfully.",
                    taskId = taskId,
                    taskCode = taskCode
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error creating task: " + ex.Message });
            }
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

        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusJsonDto dto)
        {
            if (dto == null || dto.TaskId <= 0)
                return BadRequest(new { isSuccess = false, message = "Valid TaskId is required." });

            try
            {
                var targetStatus = (dto.NewStatus ?? "OPEN").Trim().ToUpper();
                if (targetStatus == "ON HOLD") targetStatus = "ON_HOLD";

                var transitionDto = new TaskStatusTransitionRequestDto
                {
                    TaskId = dto.TaskId,
                    NewStatus = targetStatus,
                    Remarks = dto.Remarks ?? "",
                    ActionById = ResolveViewerId(dto.UpdatedByEmpId)
                };

                bool success = await _repository.UpdateStatusAndRemarksAsync(transitionDto, null, null);
                return Ok(new
                {
                    isSuccess = success,
                    message = success ? "Status updated successfully." : "Failed to update status."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error updating status: " + ex.Message });
            }
        }

        [HttpPost("upload-attachment")]
        public async Task<IActionResult> UploadAttachment([FromForm] IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { isSuccess = false, message = "No file uploaded." });

            try
            {
                var (fileName, relativeUrl) = await SaveAttachmentAsync(file);
                return Ok(new
                {
                    isSuccess = true,
                    fileName = fileName,
                    fileUrl = relativeUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error uploading attachment: " + ex.Message });
            }
        }

        [HttpPost("process-recurring")]
        public async Task<IActionResult> ProcessRecurring()
        {
            try
            {
                int generated = await _repository.ProcessRecurringTasksAsync();
                return Ok(new { isSuccess = true, generatedCount = generated });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error processing recurring tasks: " + ex.Message });
            }
        }
    }
}
