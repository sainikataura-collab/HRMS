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
            if (!multi.IsConsumed)
            {
                response.TaskTypes = (await multi.ReadAsync<TaskTypeLookupDto>()).ToList();
            }

            return response;
        }

        public async Task<List<TaskEmployeeLookupDto>> SearchEmployeesAsync(string companyId, string? deptId, string? searchText, int top = 20)
        {
            using var conn = DataBaseFactory.ConnString();
            var parameters = new
            {
                CompanyId = string.IsNullOrWhiteSpace(companyId) ? "GU-1" : companyId,
                DeptId = string.IsNullOrWhiteSpace(deptId) ? null : deptId,
                SearchText = string.IsNullOrWhiteSpace(searchText) ? null : searchText,
                Top = top > 0 ? top : 20
            };

            var employees = await conn.QueryAsync<TaskEmployeeLookupDto>(
                "dbo.usp_HR_Task_SearchEmployees",
                parameters,
                commandType: CommandType.StoredProcedure);

            return employees.ToList();
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
                TaskTypeId = filter.TaskTypeId,
                OnlyUnassigned = filter.OnlyUnassigned,
                OnlyOverdue = filter.OnlyOverdue,
                SearchText = string.IsNullOrWhiteSpace(filter.SearchText) ? null : filter.SearchText,
                CompanyId = string.IsNullOrWhiteSpace(filter.CompanyId) ? null : filter.CompanyId,
                TargetStatus = (string?)null,
                PageIndex = filter.PageIndex > 0 ? filter.PageIndex : 1,
                PageSize = filter.PageSize > 0 ? filter.PageSize : 10
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
            response.OnHoldTasks = tasks.Where(t => t.Status == "ON_HOLD" || t.Status == "ON HOLD").ToList();

            if (!multi.IsConsumed)
            {
                response.ViewerContext = await multi.ReadFirstOrDefaultAsync<TaskViewerContextDto>();
            }

            return response;
        }

        public async Task<List<TaskCardDto>> GetColumnTasksAsync(TaskBoardFilterDto filter)
        {
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
                TaskTypeId = filter.TaskTypeId,
                OnlyUnassigned = filter.OnlyUnassigned,
                OnlyOverdue = filter.OnlyOverdue,
                SearchText = string.IsNullOrWhiteSpace(filter.SearchText) ? null : filter.SearchText,
                CompanyId = string.IsNullOrWhiteSpace(filter.CompanyId) ? null : filter.CompanyId,
                TargetStatus = filter.TargetStatus,
                PageIndex = filter.PageIndex > 0 ? filter.PageIndex : 1,
                PageSize = filter.PageSize > 0 ? filter.PageSize : 10
            };

            var tasks = await conn.QueryAsync<TaskCardDto>(
                "dbo.usp_HR_Task_GetBoard",
                parameters,
                commandType: CommandType.StoredProcedure);

            return tasks.ToList();
        }

        public async Task<TaskDetailResponseDto?> GetTaskByIdWithHistoryAsync(int taskId, string? viewerId = null, string? userType = null, string? companyId = null)
        {
            using var conn = DataBaseFactory.ConnString();
            var parameters = new
            {
                TaskId = taskId,
                ViewerId = viewerId,
                UserType = userType,
                CompanyId = companyId
            };

            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_HR_Task_GetDetail",
                parameters,
                commandType: CommandType.StoredProcedure);

            var task = await multi.ReadFirstOrDefaultAsync<TaskCardDto>();
            if (task == null || !task.IsAuthorized) return null;

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
                RecurrenceDueOffsetHours = dto.RecurrenceDueOffsetHours ?? 24,
                RecurrenceDueOffsetUnit = string.IsNullOrWhiteSpace(dto.RecurrenceDueOffsetUnit) ? "DAYS" : dto.RecurrenceDueOffsetUnit,
                IsSelfTask = dto.IsSelfTask,
                TaskTypeId = dto.TaskTypeId,
                TaskTypeName = dto.TaskTypeName,
                ActionById = dto.ActionById,
                ActionByName = dto.ActionByName,
                UserType = dto.UserType,
                CompanyId = dto.CompanyId,
                InitialRemarks = dto.InitialRemarks
            };

            var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_HR_Task_Create",
                parameters,
                commandType: CommandType.StoredProcedure);

            if (result == null || result.TaskId == null)
                throw new InvalidOperationException("Failed to create task record.");

            return (Convert.ToInt32(result.TaskId), Convert.ToString(result.TaskCode) ?? "");
        }

        public async Task<bool> UpdateTaskAsync(int taskId, CreateTaskRequestDto dto)
        {
            using var conn = DataBaseFactory.ConnString();
            var parameters = new
            {
                TaskId = taskId,
                Subject = dto.Subject,
                Description = dto.Description,
                Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "MEDIUM" : dto.Priority,
                TargetDeptId = string.IsNullOrWhiteSpace(dto.TargetDeptId) ? null : dto.TargetDeptId,
                AssignedToEmpId = string.IsNullOrWhiteSpace(dto.AssignedToEmpId) ? null : dto.AssignedToEmpId,
                DueDate = dto.DueDate,
                IsRecurring = dto.IsRecurring,
                RecurrenceType = dto.RecurrenceType ?? "NONE",
                RecurrenceInterval = dto.RecurrenceInterval > 0 ? dto.RecurrenceInterval : 1,
                RecurrenceDays = dto.RecurrenceDays,
                RecurrenceDayOfMonth = dto.RecurrenceDayOfMonth,
                RecurrenceEndType = dto.RecurrenceEndType ?? "NEVER",
                RecurrenceEndDate = dto.RecurrenceEndDate,
                RecurrenceOccurrencesTotal = dto.RecurrenceOccurrencesTotal,
                RecurrenceDueOffsetHours = dto.RecurrenceDueOffsetHours ?? 24,
                RecurrenceDueOffsetUnit = dto.RecurrenceDueOffsetUnit ?? "DAYS",
                TaskTypeId = dto.TaskTypeId,
                TaskTypeName = dto.TaskTypeName ?? "General",
                ActionById = dto.ActionById,
                ActionByName = dto.ActionByName ?? "Admin",
                UserType = dto.UserType,
                CompanyId = dto.CompanyId
            };

            var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_HR_Task_UpdateTaskDetails",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result != null && Convert.ToInt32(result.Success) == 1;
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
                ActionByName = dto.ActionByName,
                UserType = dto.UserType
            };

            var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_HR_Task_UpdateStatusAndRemarks",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result != null && Convert.ToInt32(result.Success) == 1;
        }

        public async Task<int> ProcessRecurringTasksAsync(int? targetTaskId = null)
        {
            using var conn = DataBaseFactory.ConnString();
            var parameters = new { TargetTaskId = targetTaskId };
            var result = await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_HR_Task_ProcessRecurring",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result != null ? Convert.ToInt32(result.GeneratedCount) : 0;
        }

        public async Task<List<string>> GetTaskStakeholderEmpIdsAsync(int taskId)
        {
            using var conn = DataBaseFactory.ConnString();
            var sql = @"
                SELECT DISTINCT EmpId FROM (
                    SELECT AssignedToEmpId AS EmpId FROM dbo.HR_TaskMaster WHERE TaskId = @TaskId AND AssignedToEmpId IS NOT NULL AND AssignedToEmpId <> ''
                    UNION
                    SELECT CreatedByEmpId AS EmpId FROM dbo.HR_TaskMaster WHERE TaskId = @TaskId AND CreatedByEmpId IS NOT NULL AND CreatedByEmpId <> ''
                    UNION
                    SELECT d.fk_depHodid AS EmpId 
                    FROM dbo.Department_Mst d
                    INNER JOIN dbo.HR_TaskMaster t ON t.TargetDeptId = d.pk_deptid
                    WHERE t.TaskId = @TaskId AND d.fk_depHodid IS NOT NULL AND d.fk_depHodid <> ''
                    UNION
                    SELECT e.fk_rmanagerid AS EmpId
                    FROM dbo.SAL_Employee_Mst e
                    INNER JOIN dbo.HR_TaskMaster t ON t.AssignedToEmpId = e.pk_empid
                    WHERE t.TaskId = @TaskId AND e.fk_rmanagerid IS NOT NULL AND e.fk_rmanagerid <> ''
                    UNION
                    SELECT e.fk_imanagerid AS EmpId
                    FROM dbo.SAL_Employee_Mst e
                    INNER JOIN dbo.HR_TaskMaster t ON t.AssignedToEmpId = e.pk_empid
                    WHERE t.TaskId = @TaskId AND e.fk_imanagerid IS NOT NULL AND e.fk_imanagerid <> ''
                ) stakeholders
                WHERE EmpId IS NOT NULL AND LTRIM(RTRIM(EmpId)) <> '';";

            var result = await conn.QueryAsync<string>(sql, new { TaskId = taskId });
            return result.Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList();
        }
    }
}

