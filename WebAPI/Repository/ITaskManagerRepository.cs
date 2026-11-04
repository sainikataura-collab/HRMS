using HRMSWebAPI.Models;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface ITaskManagerRepository
    {
        Task<TaskLookupsResponseDto> GetLookupsAsync(string? viewerId, string? userType, int? roleId);
        Task<TaskBoardResponseDto> GetBoardAsync(TaskBoardFilterDto filter);
        Task<TaskDetailResponseDto?> GetTaskByIdWithHistoryAsync(int taskId);
        Task<(int TaskId, string TaskCode)> CreateTaskAsync(CreateTaskRequestDto dto, string? attachmentName, string? attachmentPath);
        Task<bool> UpdateStatusAndRemarksAsync(TaskStatusTransitionRequestDto dto, string? attachmentName, string? attachmentPath);
        Task<int> ProcessRecurringTasksAsync();
    }
}

