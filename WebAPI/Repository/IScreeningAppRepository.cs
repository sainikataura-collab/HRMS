using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IScreeningAppRepository
    {
        //Task<ScreenedApplicationGetData> GetScreeningApp(string fk_jobid);
        //Task<IEnumerable<ScreenedApplicationGetData>> GetScreeningApp(string fk_jobid);

        Task<bool> Update(ScreeningAppGenNode screeningAppGenNode, string Fk_UserID, string Fk_LocID);

        //Task<(int totalCount, IEnumerable<ScreenedApplicationGetData>)> GetScreeningApp(int pageIndex, int pageSize, string fk_jobid);

        Task<(List<ScreenedApplicationGetData>, jobdata,int)> GetScreeningAppById(string fk_jobid);


    }
}
