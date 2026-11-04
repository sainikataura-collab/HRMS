using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IScheduleInterviewRepository
    {
        //public Task<bool> InsertScheduleInterview(ScheduleIntervieDataSet ScheduleInterviewInsData);
        Task<bool> InsertScheduleInterview(ScheduleIntervieDataSet Data);

        //Task<List<ScheduleInterviewGetData>> GetScheduleInterviewById(string fk_jobid);

        Task<(List<ScheduleInterviewGetData>, dateData)> GetScheduleInterviewById(string fk_jobid);





    }
}
