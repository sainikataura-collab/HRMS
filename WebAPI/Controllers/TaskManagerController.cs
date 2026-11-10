using HRMSWebAPI.Hubs;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
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
        private readonly IHubContext<ChatHub> _chatHubContext;
        private readonly IHubContext<TaskHub> _taskHubContext;

        public TaskManagerController(
            ITaskManagerRepository repository,
            IHubContext<ChatHub> chatHubContext,
            IHubContext<TaskHub> taskHubContext)
        {
            _repository = repository;
            _chatHubContext = chatHubContext;
            _taskHubContext = taskHubContext;
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

        private string GetUserType(string? explicitUserType = null)
        {
            if (!string.IsNullOrWhiteSpace(explicitUserType))
                return explicitUserType.Trim();

            if (Request.Headers.TryGetValue("X-User-Type", out var utHeader) && !string.IsNullOrWhiteSpace(utHeader))
                return utHeader.ToString().Trim();

            if (Request.Headers.TryGetValue("UserType", out var utHeader2) && !string.IsNullOrWhiteSpace(utHeader2))
                return utHeader2.ToString().Trim();

            if (Request.Headers.TryGetValue("usertype", out var utHeader3) && !string.IsNullOrWhiteSpace(utHeader3))
                return utHeader3.ToString().Trim();

            var fromItems = HttpContext.Items["DecryptedUserType"]?.ToString();
            if (!string.IsNullOrWhiteSpace(fromItems))
                return fromItems.Trim();

            return "Employee";
        }

        private (string? Id, string Type) GetViewer(string? fallbackId = null, string? explicitUserType = null)
        {
            var userType = GetUserType(explicitUserType);
            var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString()?.Trim();
            var id = !string.IsNullOrWhiteSpace(decryptedUserId) ? decryptedUserId : fallbackId?.Trim();
            return (id, userType);
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
                recurrenceInterval = t.RecurrenceInterval,
                recurrenceDays = t.RecurrenceDays,
                recurrenceDayOfMonth = t.RecurrenceDayOfMonth,
                recurrenceEndType = t.RecurrenceEndType,
                recurrenceEndDate = t.RecurrenceEndDate,
                recurrenceOccurrencesTotal = t.RecurrenceOccurrencesTotal,
                recurrenceOccurrencesCount = t.RecurrenceOccurrencesCount,
                recurrenceDueOffsetHours = t.RecurrenceDueOffsetHours,
                recurrenceDueOffsetUnit = t.RecurrenceDueOffsetUnit,
                nextOccurrenceDate = t.NextOccurrenceDate,
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

        [HttpGet("lookups")]
        public async Task<IActionResult> GetLookups(
            [FromQuery] string? viewerId = null,
            [FromQuery] string? userType = null,
            [FromQuery] int? roleId = null,
            [FromQuery] string? companyId = null)
        {
            try
            {
                var (resolvedId, resolvedUserType) = GetViewer(viewerId, userType);
                var resolvedCompId = ResolveCompanyId(companyId);
                var lookups = await _repository.GetLookupsAsync(resolvedId, resolvedUserType, roleId, resolvedCompId);

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
                var (viewerId, userType) = GetViewer(payload?.ViewerEmpId, payload?.UserType);
                if (string.IsNullOrWhiteSpace(viewerId))
                    return Unauthorized(new { isSuccess = false, message = "Session expired or user not authenticated." });

                var filter = new TaskBoardFilterDto();
                filter.ViewerId = viewerId;
                filter.UserType = userType;
                if (payload != null)
                {
                    filter.Scope = !string.IsNullOrWhiteSpace(payload.Scope) ? payload.Scope : "ALL";
                    filter.DeptId = payload.DepartmentId;
                    filter.AssignedToEmpId = payload.AssignedToEmpId;
                    filter.CreatedByEmpId = payload.CreatedByEmpId;
                    filter.Priority = payload.Priority;
                    filter.RecurrenceType = payload.RecurrencePattern;
                    filter.TaskTypeId = payload.TaskTypeId;
                    filter.SearchText = payload.SearchKeyword;
                    filter.CompanyId = ResolveCompanyId(payload.CompanyId);
                    filter.TargetStatus = payload.TargetStatus;
                    filter.PageIndex = payload.PageIndex.GetValueOrDefault(1);
                    filter.PageSize = payload.PageSize.GetValueOrDefault(10);

                    var fc = (payload.FilterCard ?? "").ToUpper().Trim();
                    if (fc == "UNASSIGNED") filter.OnlyUnassigned = true;
                    else if (fc == "OVERDUE") filter.OnlyOverdue = true;
                    else if (fc == "OPEN") filter.Status = "OPEN";
                    else if (fc == "CLOSED") filter.Status = "CLOSED";
                    else if (fc == "ON_HOLD" || fc == "ON HOLD") filter.Status = "ON_HOLD";
                }

                var board = await _repository.GetBoardAsync(filter);

                var allList = board.AllTasks ?? new List<TaskCardDto>();
                var totalCount = board.Summary.TotalCount > 0 ? board.Summary.TotalCount : allList.Count;
                var openCount = board.Summary.OpenCount > 0 ? board.Summary.OpenCount : allList.Count(t => t.Status == "OPEN");
                var closedCount = board.Summary.ClosedCount > 0 ? board.Summary.ClosedCount : allList.Count(t => t.Status == "CLOSED");
                var onHoldCount = board.Summary.OnHoldCount > 0 ? board.Summary.OnHoldCount : allList.Count(t => t.Status == "ON_HOLD" || t.Status == "ON HOLD");
                var unassignedCount = board.Summary.UnassignedCount > 0 ? board.Summary.UnassignedCount : allList.Count(t => string.IsNullOrWhiteSpace(t.AssignedToEmpId));
                var overdueCount = board.Summary.OverdueCount > 0 ? board.Summary.OverdueCount : allList.Count(t => t.IsOverdue);

                return Ok(new
                {
                    isSuccess = true,
                    counts = new
                    {
                        allTasks = totalCount,
                        openTasks = openCount,
                        closedTasks = closedCount,
                        onHoldTasks = onHoldCount,
                        unassignedTasks = unassignedCount,
                        overdueTasks = overdueCount
                    },
                    openTasks = board.OpenTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    closedTasks = board.ClosedTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    onHoldTasks = board.OnHoldTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    allTasks = board.AllTasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    viewer = board.ViewerContext != null ? new
                    {
                        isAdmin = board.ViewerContext.IsAdmin,
                        isHod = board.ViewerContext.IsHod,
                        isManager = board.ViewerContext.IsManager
                    } : null,
                    data = board
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading task board: " + ex.Message });
            }
        }

        [HttpPost("column-tasks")]
        public async Task<IActionResult> GetColumnTasksPost([FromBody] BoardRequestPayload payload)
        {
            return await HandleGetColumnTasks(payload);
        }

        [HttpGet("column-tasks")]
        public async Task<IActionResult> GetColumnTasksGet([FromQuery] BoardRequestPayload payload)
        {
            return await HandleGetColumnTasks(payload);
        }

        private async Task<IActionResult> HandleGetColumnTasks(BoardRequestPayload? payload)
        {
            try
            {
                var (viewerId, userType) = GetViewer(payload?.ViewerEmpId, payload?.UserType);
                if (string.IsNullOrWhiteSpace(viewerId))
                    return Unauthorized(new { isSuccess = false, message = "Session expired or user not authenticated." });

                var filter = new TaskBoardFilterDto
                {
                    ViewerId = viewerId,
                    UserType = userType,
                    Scope = !string.IsNullOrWhiteSpace(payload?.Scope) ? payload.Scope : "ALL",
                    DeptId = payload?.DepartmentId,
                    AssignedToEmpId = payload?.AssignedToEmpId,
                    CreatedByEmpId = payload?.CreatedByEmpId,
                    Priority = payload?.Priority,
                    RecurrenceType = payload?.RecurrencePattern,
                    TaskTypeId = payload?.TaskTypeId,
                    SearchText = payload?.SearchKeyword,
                    CompanyId = ResolveCompanyId(payload?.CompanyId),
                    TargetStatus = payload?.TargetStatus ?? "OPEN",
                    PageIndex = payload?.PageIndex > 0 ? payload.PageIndex.Value : 1,
                    PageSize = payload?.PageSize > 0 ? payload.PageSize.Value : 10
                };

                var tasks = await _repository.GetColumnTasksAsync(filter);
                return Ok(new
                {
                    isSuccess = true,
                    tasks = tasks.Where(t => t.TaskId > 0).Select(MapTaskCard),
                    pageIndex = filter.PageIndex,
                    pageSize = filter.PageSize,
                    hasMore = tasks.Count >= filter.PageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading column tasks: " + ex.Message });
            }
        }

        [HttpGet("{taskId:int}")]
        public async Task<IActionResult> GetTaskById([FromRoute] int taskId, [FromQuery] string? companyId = null)
        {
            try
            {
                var (viewerId, userType) = GetViewer();
                var resolvedCompId = ResolveCompanyId(companyId);
                var detail = await _repository.GetTaskByIdWithHistoryAsync(taskId, viewerId, userType, resolvedCompId);
                if (detail == null || detail.Task == null)
                    return StatusCode(403, new { isSuccess = false, message = "You do not have permission to access this task." });

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

        [HttpPost("create")]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskJsonDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Subject))
                return BadRequest(new { isSuccess = false, message = "Task subject is required." });

            try
            {
                var (actorId, userType) = GetViewer(dto.CreatedByEmpId, dto.UserType);
                if (string.IsNullOrWhiteSpace(actorId))
                    return Unauthorized(new { isSuccess = false, message = "User not authenticated." });

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
                    IsSelfTask = dto.IsSelfTask,
                    CompanyId = ResolveCompanyId(dto.CompanyId),
                    TaskTypeId = dto.TaskTypeId,
                    TaskTypeName = dto.TaskTypeName,
                    ActionById = actorId,
                    ActionByName = dto.CreatedByName,
                    UserType = userType,
                    InitialRemarks = dto.InitialRemarks
                };

                var (taskId, taskCode) = await _repository.CreateTaskAsync(req, dto.AttachmentFileName, dto.AttachmentUrl);

                await BroadcastTaskNotificationAsync(taskId, taskCode, req.Subject, "CREATED", req.Priority, "OPEN", req.ActionByName);

                return Ok(new
                {
                    isSuccess = true,
                    message = "Task created successfully.",
                    taskId = taskId,
                    taskCode = taskCode,
                    notificationDispatched = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error creating task: " + ex.Message });
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateTask([FromBody] CreateTaskJsonDto dto)
        {
            if (dto == null || !dto.TaskId.HasValue || dto.TaskId.Value <= 0)
                return BadRequest(new { isSuccess = false, message = "Valid TaskId is required for update." });

            if (string.IsNullOrWhiteSpace(dto.Subject))
                return BadRequest(new { isSuccess = false, message = "Task subject is required." });

            try
            {
                var (actorId, userType) = GetViewer(dto.CreatedByEmpId, dto.UserType);
                if (string.IsNullOrWhiteSpace(actorId))
                    return Unauthorized(new { isSuccess = false, message = "User not authenticated." });

                var req = new CreateTaskRequestDto
                {
                    Subject = dto.Subject.Trim(),
                    Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                    TargetDeptId = string.IsNullOrWhiteSpace(dto.DepartmentId) ? null : dto.DepartmentId.Trim(),
                    AssignedToEmpId = string.IsNullOrWhiteSpace(dto.AssignedToEmpId) ? null : dto.AssignedToEmpId.Trim(),
                    Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "MEDIUM" : dto.Priority.ToUpper().Trim(),
                    DueDate = dto.DeadlineDate ?? DateTime.Today.AddDays(1).AddHours(18),
                    IsRecurring = dto.IsRecurring,
                    RecurrenceType = dto.IsRecurring ? (dto.RecurrencePattern ?? "WEEKLY").ToUpper().Trim() : "NONE",
                    RecurrenceInterval = dto.RecurrenceInterval.GetValueOrDefault(1),
                    RecurrenceDays = dto.RecurrenceDays,
                    RecurrenceDayOfMonth = dto.RecurrenceDayOfMonth,
                    RecurrenceEndType = (dto.RecurrenceEndType ?? "NEVER").ToUpper().Trim(),
                    RecurrenceEndDate = dto.RecurrenceEndDate,
                    RecurrenceOccurrencesTotal = dto.RecurrenceOccurrencesTotal,
                    RecurrenceDueOffsetHours = dto.RecurrenceDueOffsetHours ?? 24,
                    RecurrenceDueOffsetUnit = dto.RecurrenceDueOffsetUnit ?? "DAYS",
                    IsSelfTask = dto.IsSelfTask,
                    CompanyId = ResolveCompanyId(dto.CompanyId),
                    TaskTypeId = dto.TaskTypeId,
                    TaskTypeName = dto.TaskTypeName,
                    ActionById = actorId,
                    ActionByName = dto.CreatedByName ?? "Admin",
                    UserType = userType,
                    InitialRemarks = dto.InitialRemarks
                };

                var success = await _repository.UpdateTaskAsync(dto.TaskId.Value, req);

                if (success)
                {
                    await BroadcastTaskNotificationAsync(dto.TaskId.Value, $"TSK-{dto.TaskId.Value}", req.Subject, "STATUS_CHANGED", req.Priority, "OPEN", req.ActionByName);
                }

                return Ok(new
                {
                    isSuccess = success,
                    message = success ? "Task updated successfully." : "Failed to update task.",
                    taskId = dto.TaskId.Value
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error updating task: " + ex.Message });
            }
        }

        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusJsonDto dto)
        {
            if (dto == null || dto.TaskId <= 0)
                return BadRequest(new { isSuccess = false, message = "Valid TaskId is required." });

            try
            {
                var (actorId, userType) = GetViewer(dto.UpdatedByEmpId, dto.UserType);
                if (string.IsNullOrWhiteSpace(actorId))
                    return Unauthorized(new { isSuccess = false, message = "User not authenticated." });

                var targetStatus = (dto.NewStatus ?? "OPEN").Trim().ToUpper();
                if (targetStatus == "ON HOLD") targetStatus = "ON_HOLD";

                var transitionDto = new TaskStatusTransitionRequestDto
                {
                    TaskId = dto.TaskId,
                    NewStatus = targetStatus,
                    Remarks = dto.Remarks ?? "",
                    ActionById = actorId,
                    ActionByName = dto.UpdatedByName,
                    UserType = userType
                };

                bool success = await _repository.UpdateStatusAndRemarksAsync(transitionDto, null, null);

                if (success)
                {
                    _ = Task.Run(async () =>
                    {
                        var taskDetail = await _repository.GetTaskByIdWithHistoryAsync(dto.TaskId);
                        var code = taskDetail?.Task?.TaskCode ?? $"TSK-{dto.TaskId}";
                        var subj = taskDetail?.Task?.Subject ?? "Task status updated";
                        var prio = taskDetail?.Task?.Priority ?? "MEDIUM";
                        await BroadcastTaskNotificationAsync(dto.TaskId, code, subj, "STATUS_CHANGED", prio, targetStatus, dto.UpdatedByName);
                    });
                }

                return Ok(new
                {
                    isSuccess = success,
                    message = success ? "Status updated successfully." : "Failed to update status.",
                    notificationDispatched = success
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error updating status: " + ex.Message });
            }
        }

        private async Task BroadcastTaskNotificationAsync(int taskId, string taskCode, string subject, string eventType, string priority, string status, string? actorName)
        {
            Console.WriteLine($"[SignalR Broadcast] START task={taskId} code={taskCode} event={eventType}");
            try
            {
                // 1. Silent sync signal to all users on Kanban board across both hubs
                var boardPayload = new
                {
                    taskId = taskId,
                    taskCode = taskCode,
                    eventType = eventType,
                    newStatus = status
                };

                await _chatHubContext.Clients.Group("TaskWorkspaceBoard").SendAsync("TaskBoardChanged", boardPayload);
                await _taskHubContext.Clients.Group("TaskWorkspaceBoard").SendAsync("TaskBoardChanged", boardPayload);

                // 2. Fetch distinct stakeholders (Assignee, Creator, HOD, Reporting Managers)
                var stakeholders = await _repository.GetTaskStakeholderEmpIdsAsync(taskId);

                var payload = new
                {
                    taskId = taskId,
                    taskCode = taskCode,
                    subject = subject,
                    eventType = eventType,
                    priority = priority,
                    status = status,
                    actorName = actorName ?? "System",
                    timestamp = DateTime.UtcNow.ToString("o")
                };

                var chatNotificationPayload = new
                {
                    senderId = actorName ?? "System",
                    senderName = actorName ?? "System Notification",
                    senderRole = "System",
                    notificationType = "Task",
                    redirectUrl = "/task-manager",
                    message = $"Task {taskCode}: {subject} ({status})",
                    timestamp = DateTime.UtcNow,
                    taskPayload = payload
                };

                Console.WriteLine($"[SignalR Broadcast] Task #{taskCode} ({taskId}) dispatching to {stakeholders.Count} stakeholder keys: {string.Join(", ", stakeholders)}");

                // 3. Push real-time toast notification to each stakeholder user group on both ChatHub & TaskHub
                foreach (var empId in stakeholders)
                {
                    if (string.IsNullOrWhiteSpace(empId)) continue;
                    var trimmed = empId.Trim();

                    var groups = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                    {
                        trimmed,
                        $"{trimmed}:EMP",
                        $"{trimmed}:HR",
                        $"{trimmed}:Vendor"
                    };

                    if (trimmed.StartsWith("GU-", StringComparison.OrdinalIgnoreCase))
                    {
                        var bare = trimmed.Substring(3);
                        groups.Add(bare);
                        groups.Add($"{bare}:EMP");
                        groups.Add($"{bare}:HR");
                    }
                    else if (int.TryParse(trimmed, out _))
                    {
                        var prefixed = "GU-" + trimmed;
                        groups.Add(prefixed);
                        groups.Add($"{prefixed}:EMP");
                        groups.Add($"{prefixed}:HR");
                    }

                    foreach (var grp in groups)
                    {
                        // ChatHub (where live application browser sessions are actively connected)
                        await _chatHubContext.Clients.Group(grp).SendAsync("TaskNotificationReceived", payload);
                        await _chatHubContext.Clients.Group(grp).SendAsync("ReceiveNotification", chatNotificationPayload);

                        // TaskHub (where direct task listeners are connected)
                        await _taskHubContext.Clients.Group(grp).SendAsync("TaskNotificationReceived", payload);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SignalR Broadcast ERROR] {ex}");
            }
            Console.WriteLine($"[SignalR Broadcast] END task={taskId}");
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
        public async Task<IActionResult> ProcessRecurring([FromBody] ProcessRecurringRequestDto? req = null)
        {
            try
            {
                int generated = await _repository.ProcessRecurringTasksAsync(req?.TaskId);
                return Ok(new { isSuccess = true, generatedCount = generated });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error processing recurring tasks: " + ex.Message });
            }
        }
    }
}
