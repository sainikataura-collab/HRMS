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
                CompanyId = string.IsNullOrWhiteSpace(companyId) ? null : companyId.Trim(),
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

            if (!multi.IsConsumed)
            {
                response.RecurringTasks = (await multi.ReadAsync<TaskCardDto>()).ToList();
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

            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_HR_Task_GetBoard",
                parameters,
                commandType: CommandType.StoredProcedure);

            // Skip Result Set 1 (Counts)
            await multi.ReadFirstOrDefaultAsync();

            // Result Set 2 (Task Records for target column / page)
            var tasks = (await multi.ReadAsync<TaskCardDto>()).ToList();

            return tasks;
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

        public async Task<bool> UpdateTaskAsync(int taskId, CreateTaskRequestDto dto, string? attachmentName = null, string? attachmentPath = null)
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
                AttachmentName = attachmentName,
                AttachmentPath = attachmentPath,
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
                TaskTypeName = dto.TaskTypeName,
                ActionById = dto.ActionById,
                ActionByName = dto.ActionByName,
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
                WITH RawStakeholders AS (
                    -- Assignee
                    SELECT t.AssignedToEmpId AS Id
                    FROM dbo.HR_TaskMaster t
                    WHERE t.TaskId = @TaskId AND t.AssignedToEmpId IS NOT NULL AND LTRIM(RTRIM(t.AssignedToEmpId)) <> ''
                    UNION
                    -- Creator
                    SELECT t.CreatedByEmpId AS Id
                    FROM dbo.HR_TaskMaster t
                    WHERE t.TaskId = @TaskId AND t.CreatedByEmpId IS NOT NULL AND LTRIM(RTRIM(t.CreatedByEmpId)) <> ''
                    UNION
                    -- Target Dept HOD
                    SELECT d.fk_depHodid AS Id 
                    FROM dbo.Department_Mst d
                    INNER JOIN dbo.HR_TaskMaster t ON t.TargetDeptId = d.pk_deptid
                    WHERE t.TaskId = @TaskId AND d.fk_depHodid IS NOT NULL AND LTRIM(RTRIM(d.fk_depHodid)) <> ''
                    UNION
                    -- Creator Dept HOD (if present)
                    SELECT d.fk_depHodid AS Id 
                    FROM dbo.Department_Mst d
                    INNER JOIN dbo.HR_TaskMaster t ON t.CreatorDeptId = d.pk_deptid
                    WHERE t.TaskId = @TaskId AND d.fk_depHodid IS NOT NULL AND LTRIM(RTRIM(d.fk_depHodid)) <> ''
                    UNION
                    -- Reporting Managers of Assignee
                    SELECT mgr.Id
                    FROM dbo.HR_TaskMaster t
                    INNER JOIN dbo.SAL_Employee_Mst e ON t.AssignedToEmpId = e.pk_empid
                    CROSS APPLY (
                        SELECT e.fk_rmanagerid AS Id UNION
                        SELECT e.fk_imanagerid AS Id UNION
                        SELECT e.fk_FunctionalRepempid AS Id UNION
                        SELECT e.fk_AdministrativeRepempid AS Id
                    ) mgr
                    WHERE t.TaskId = @TaskId AND mgr.Id IS NOT NULL AND LTRIM(RTRIM(mgr.Id)) <> ''
                ),
                ExpandedStakeholders AS (
                    -- Original raw IDs
                    SELECT Id FROM RawStakeholders
                    UNION
                    -- Map EmpId -> UserId from UM_Users_Mst
                    SELECT u.pk_userId AS Id
                    FROM dbo.UM_Users_Mst u
                    INNER JOIN RawStakeholders r ON u.fk_empId = r.Id
                    WHERE u.pk_userId IS NOT NULL AND LTRIM(RTRIM(u.pk_userId)) <> ''
                    UNION
                    -- Map UserId -> EmpId from UM_Users_Mst
                    SELECT u.fk_empId AS Id
                    FROM dbo.UM_Users_Mst u
                    INNER JOIN RawStakeholders r ON u.pk_userId = r.Id
                    WHERE u.fk_empId IS NOT NULL AND LTRIM(RTRIM(u.fk_empId)) <> ''
                )
                SELECT DISTINCT Id FROM ExpandedStakeholders
                WHERE Id IS NOT NULL AND LTRIM(RTRIM(Id)) <> '';";

            var result = (await conn.QueryAsync<string>(sql, new { TaskId = taskId })).ToList();
            var allIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var id in result)
            {
                if (string.IsNullOrWhiteSpace(id)) continue;
                var trimmed = id.Trim();
                allIds.Add(trimmed);

                // Add without "GU-" or "gu-" prefix if present
                if (trimmed.StartsWith("GU-", StringComparison.OrdinalIgnoreCase))
                {
                    allIds.Add(trimmed.Substring(3));
                }
                // Add with "GU-" prefix if pure numeric
                else if (int.TryParse(trimmed, out _))
                {
                    allIds.Add("GU-" + trimmed);
                }
            }

            return allIds.ToList();
        }
    }
}

