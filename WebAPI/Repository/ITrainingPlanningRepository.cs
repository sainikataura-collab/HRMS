using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITrainingPlanningRepository
    {


        Task<(int totalCount, IEnumerable<TrainingPlanning>)> GetAll(int pageIndex, int pageSize);
        Task<(TrainingPlanning, List<TrainingPlanning_AudienceDetail>)> GetTrainingPlanningByIdAsync(long planningId);
        Task<bool> InsertTrainingPlanningAsync(TrainingPlanning training, List<TrainingPlanning_AudienceDetail> audienceDetails);
        Task<bool> UpdateTrainingPlanningAsync(TrainingPlanning training, List<TrainingPlanning_AudienceDetail> audienceDetails);

        Task<bool> DeleteAsync(long id);
        Task<(TrainingPlanning, List<TrainingPlanning_AudienceDetail>)> GetTrainingPlanEmpView(int programid, int subprogramid);

        //Task<(TrainingPlanning, List<attendanceDetails>)>GetTrainingAttendance(string pk_empid);
        Task<(TrainingPlanning, List<attendanceDetails>)> GetTrainingAttendance(string pk_empid, int programid, int subprogramid);

        Task<Result<List<NameValue>>> GetCompletedProgramsDropdownList(string userID);


    }

}
