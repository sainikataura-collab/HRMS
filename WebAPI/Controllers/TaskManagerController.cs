using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
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

        [HttpGet("lookups")]
        public async Task<IActionResult> GetLookups(
            [FromQuery] string? viewerId = null,
            [FromQuery] string? userType = null,
            [FromQuery] int? roleId = null)
        {
            try
            {
                var resolvedId = ResolveViewerId(viewerId);
                var lookups = await _repository.GetLookupsAsync(resolvedId, userType, roleId);
                return Ok(new { isSuccess = true, data = lookups });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading lookups: " + ex.Message });
            }
        }

        [HttpGet("board")]
        public async Task<IActionResult> GetBoard([FromQuery] TaskBoardFilterDto filter)
        {
            try
            {
                filter.ViewerId = ResolveViewerId(filter.ViewerId);
                var board = await _repository.GetBoardAsync(filter);
                return Ok(new { isSuccess = true, data = board });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading task board: " + ex.Message });
            }
        }

        [HttpGet("{taskId:int}")]
        public async Task<IActionResult> GetTaskById([FromRoute] int taskId)
        {
            try
            {
                var detail = await _repository.GetTaskByIdWithHistoryAsync(taskId);
                if (detail == null)
                    return NotFound(new { isSuccess = false, message = $"Task with ID {taskId} was not found." });

                return Ok(new { isSuccess = true, data = detail });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading task details: " + ex.Message });
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTask([FromForm] CreateTaskRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Subject))
                return BadRequest(new { isSuccess = false, message = "Task subject is required." });

            try
            {
                dto.ActionById = ResolveViewerId(dto.ActionById);

                var (attachmentName, attachmentPath) = await SaveAttachmentAsync(dto.Attachment);
                var (taskId, taskCode) = await _repository.CreateTaskAsync(dto, attachmentName, attachmentPath);

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

        [HttpPost("create-json")]
        public async Task<IActionResult> CreateTaskJson([FromBody] CreateTaskRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Subject))
                return BadRequest(new { isSuccess = false, message = "Task subject is required." });

            try
            {
                dto.ActionById = ResolveViewerId(dto.ActionById);
                var (taskId, taskCode) = await _repository.CreateTaskAsync(dto, null, null);

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

        [HttpPost("transition")]
        public async Task<IActionResult> TransitionStatus([FromForm] TaskStatusTransitionRequestDto dto)
        {
            if (dto == null || dto.TaskId <= 0)
                return BadRequest(new { isSuccess = false, message = "Valid TaskId is required." });

            if (string.IsNullOrWhiteSpace(dto.Remarks))
                return BadRequest(new { isSuccess = false, message = "Mandatory remarks must be provided for status transitions." });

            try
            {
                dto.ActionById = ResolveViewerId(dto.ActionById);
                var (attachmentName, attachmentPath) = await SaveAttachmentAsync(dto.Attachment);

                bool success = await _repository.UpdateStatusAndRemarksAsync(dto, attachmentName, attachmentPath);
                if (!success)
                    return BadRequest(new { isSuccess = false, message = "Failed to update task status." });

                return Ok(new { isSuccess = true, message = "Task status updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error updating task status: " + ex.Message });
            }
        }

        [HttpPost("transition-json")]
        public async Task<IActionResult> TransitionStatusJson([FromBody] TaskStatusTransitionRequestDto dto)
        {
            if (dto == null || dto.TaskId <= 0)
                return BadRequest(new { isSuccess = false, message = "Valid TaskId is required." });

            if (string.IsNullOrWhiteSpace(dto.Remarks))
                return BadRequest(new { isSuccess = false, message = "Mandatory remarks must be provided for status transitions." });

            try
            {
                dto.ActionById = ResolveViewerId(dto.ActionById);
                bool success = await _repository.UpdateStatusAndRemarksAsync(dto, null, null);
                if (!success)
                    return BadRequest(new { isSuccess = false, message = "Failed to update task status." });

                return Ok(new { isSuccess = true, message = "Task status updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error updating task status: " + ex.Message });
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

