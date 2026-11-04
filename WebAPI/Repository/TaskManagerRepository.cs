using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class TaskManagerRepository : ITaskManagerRepository
    {
        public async Task<TaskLookupsResponseDto> GetLookupsAsync(string? viewerId, string? userType, int? roleId, string? companyId = null)
        {
            var response = new TaskLookupsResponseDto();

            using var conn = DataBaseFactory.ConnString();
            var parameters = new
            {
                ViewerId = viewerId,
                UserType = userType,
                RoleId = roleId,
                CompanyId = companyId
            };

            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_HR_Task_GetLookups",
                parameters,
                commandType: CommandType.StoredProcedure);

            response.ViewerContext = await multi.ReadFirstOrDefaultAsync<TaskViewerRoleDto>();
            response.Departments = (await multi.ReadAsync<TaskDepartmentLookupDto>()).ToList();
            response.Employees = (await multi.ReadAsync<TaskEmployeeLookupDto>()).ToList();

            return response;
        }

        public async Task<TaskBoardResponseDto> GetBoardAsync(TaskBoardFilterDto filter)
        {
            var response = new TaskBoardResponseDto();

            using var conn = DataBaseFactory.ConnString();
            var parameters = new
            {
                ViewerId = filter.ViewerId,
                UserType = filter.UserType,
                RoleId = filter.RoleId,
                Scope = string.IsNullOrWhiteSpace(filter.Scope) ? "ALL" : filter.Scope,
                DeptId = string.IsNullOrWhiteSpace(filter.DeptId) ? null : filter.DeptId,
                AssignedToEmpId = string.IsNullOrWhiteSpace(filter.AssignedToEmpId) ? null : filter.AssignedToEmpId,
                CreatedByEmpId = string.IsNullOrWhiteSpace(filter.CreatedByEmpId) ? null : filter.CreatedByEmpId,
                Status = string.IsNullOrWhiteSpace(filter.Status) ? null : filter.Status,
                Priority = string.IsNullOrWhiteSpace(filter.Priority) ? null : filter.Priority,
                RecurrenceType = string.IsNullOrWhiteSpace(filter.RecurrenceType) ? null : filter.RecurrenceType,
                OnlyUnassigned = filter.OnlyUnassigned,
                OnlyOverdue = filter.OnlyOverdue,
                SearchText = string.IsNullOrWhiteSpace(filter.SearchText) ? null : filter.SearchText,
                CompanyId = string.IsNullOrWhiteSpace(filter.CompanyId) ? null : filter.CompanyId
            };

            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_HR_Task_GetBoard",
                parameters,
                commandType: CommandType.StoredProcedure);

            response.Summary = await multi.ReadFirstOrDefaultAsync<TaskKpiSummaryDto>() ?? new TaskKpiSummaryDto();
            var tasks = (await multi.ReadAsync<TaskCardDto>()).ToList();

            response.AllTasks = tasks;
            response.OpenTasks = tasks.Where(t => t.Status == "OPEN").ToList();
            response.ClosedTasks = tasks.Where(t => t.Status == "CLOSED").ToList();
            response.OnHoldTasks = tasks.Where(t => t.Status == "ON_HOLD").ToList();

            return response;
        }

        public async Task<TaskDetailResponseDto?> GetTaskByIdWithHistoryAsync(int taskId, string? companyId = null)
        {
            using var conn = DataBaseFactory.ConnString();
            var parameters = new { TaskId = taskId, CompanyId = companyId };

            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_HR_Task_GetDetail",
                parameters,
                commandType: CommandType.StoredProcedure);

            var task = await multi.ReadFirstOrDefaultAsync<TaskCardDto>();
            if (task == null) return null;

            var history = (await multi.ReadAsync<TaskHistoryItemDto>()).ToList();

            return new TaskDetailResponseDto
            {
                Task = task,
                History = history
            };
        }

        public async Task<(int TaskId, string TaskCode)> CreateTaskAsync(CreateTaskRequestDto dto, string? attachmentName, string? attachmentPath)
        {
            using var conn = DataBaseFactory.ConnString();
            var parameters = new
            {
                Subject = dto.Subject,
                Description = dto.Description,
                Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "MEDIUM" : dto.Priority,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "OPEN" : dto.Status,
                TargetDeptId = string.IsNullOrWhiteSpace(dto.TargetDeptId) ? null : dto.TargetDeptId,
                AssignedToEmpId = string.IsNullOrWhiteSpace(dto.AssignedToEmpId) ? null : dto.AssignedToEmpId,
                DueDate = dto.DueDate,
                AttachmentName = attachmentName,
                AttachmentPath = attachmentPath,
                IsRecurring = dto.IsRecurring,
                RecurrenceType = string.IsNullOrWhiteSpace(dto.RecurrenceType) ? "NONE" : dto.RecurrenceType,
                RecurrenceInterval = dto.RecurrenceInterval > 0 ? dto.RecurrenceInterval : 1,
                RecurrenceDays = string.IsNullOrWhiteSpace(dto.RecurrenceDays) ? null : dto.RecurrenceDays,
                RecurrenceDayOfMonth = dto.RecurrenceDayOfMonth,
                RecurrenceEndType = string.IsNullOrWhiteSpace(dto.RecurrenceEndType) ? "NEVER" : dto.RecurrenceEndType,
                RecurrenceEndDate = dto.RecurrenceEndDate,
                RecurrenceOccurrencesTotal = dto.RecurrenceOccurrencesTotal,
                IsSelfTask = dto.IsSelfTask,
                ActionById = dto.ActionById,
                ActionByName = dto.ActionByName,
                CompanyId = dto.CompanyId,
                InitialRemarks = dto.InitialRemarks
            };

            var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_HR_Task_Create",
                parameters,
                commandType: CommandType.StoredProcedure);

            if (result == null)
                throw new InvalidOperationException("Failed to create task record.");

            return ((int)result.TaskId, (string)result.TaskCode);
        }

        public async Task<bool> UpdateStatusAndRemarksAsync(TaskStatusTransitionRequestDto dto, string? attachmentName, string? attachmentPath)
        {
            using var conn = DataBaseFactory.ConnString();
            var parameters = new
            {
                TaskId = dto.TaskId,
                NewStatus = dto.NewStatus,
                Remarks = dto.Remarks,
                NewAssigneeEmpId = dto.NewAssigneeEmpId ?? "__KEEP__",
                NewPriority = string.IsNullOrWhiteSpace(dto.NewPriority) ? null : dto.NewPriority,
                NewDueDate = dto.NewDueDate,
                AttachmentName = attachmentName,
                AttachmentPath = attachmentPath,
                ActionById = dto.ActionById,
                ActionByName = dto.ActionByName
            };

            var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_HR_Task_UpdateStatusAndRemarks",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result != null && Convert.ToInt32(result.Success) == 1;
        }

        public async Task<int> ProcessRecurringTasksAsync()
        {
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_HR_Task_ProcessRecurring",
                commandType: CommandType.StoredProcedure);

            return result != null ? Convert.ToInt32(result.GeneratedCount) : 0;
        }
    }
}

