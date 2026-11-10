using HRMSWebAPI.Models;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface ITaskManagerRepository
    {
        Task<TaskLookupsResponseDto> GetLookupsAsync(string? viewerId, string? userType, int? roleId, string? companyId = null);
        Task<List<TaskEmployeeLookupDto>> SearchEmployeesAsync(string companyId, string? deptId, string? searchText, int top = 20);
        Task<TaskBoardResponseDto> GetBoardAsync(TaskBoardFilterDto filter);
        Task<List<TaskCardDto>> GetColumnTasksAsync(TaskBoardFilterDto filter);
        Task<TaskDetailResponseDto?> GetTaskByIdWithHistoryAsync(int taskId, string? viewerId = null, string? userType = null, string? companyId = null);
        Task<(int TaskId, string TaskCode)> CreateTaskAsync(CreateTaskRequestDto dto, string? attachmentName, string? attachmentPath);
        Task<bool> UpdateTaskAsync(int taskId, CreateTaskRequestDto dto);
        Task<bool> UpdateStatusAndRemarksAsync(TaskStatusTransitionRequestDto dto, string? attachmentName, string? attachmentPath);
        Task<int> ProcessRecurringTasksAsync(int? targetTaskId = null);
        Task<List<string>> GetTaskStakeholderEmpIdsAsync(int taskId);
    }
}

