using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITrainingCalendarRepository
    {
        Task<bool> InsertTrainingCalendarAsync(TrainingCalendar training);
        Task<TrainingPlanning> GetByIdAsyncforCalendar(long planningId);
        IEnumerable<getAdminCalendarList> GetAdminCalendarList();
        IEnumerable<getAdminCalendarList> GetAll(string empid);

        //Task<bool> InsertTrainingAttendanceAsync(TrainingAttendanceDto attendance);
        Task<ModelResponse> InsertTrainingAttendanceAsync(TrainingAttendanceDto attendance);
        Task<string> CheckTodayAttendanceAsync(int calendarId, string empId);

        Task<(TrainingAttendanceEmployeeInfo, List<TrainingAttendanceDetail>)> GetTrainingAttendanceView(int pk_planningId, string fk_empid);

        Task<bool> InsertMaterialAsync(TrainingMaterial material);
        Task<(int totalCount, IEnumerable<TrainingMaterial>)> GetAll(
        int pageIndex,
        int pageSize,
        int? fk_planningId = null,
        string? materialType = null,
        bool? isActive = null);

        Task<TrainingMaterial?> GetById(int materialId);

        Task<bool> UpdateMaterialAsync(TrainingMaterial material);


        Task<bool> InsertTrainingFeedbackAsync(TrainingFeedback feedback);

    }
}
