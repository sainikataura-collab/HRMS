namespace HRMSWebAPI.Repository
{
    public interface IExitDashboardRepository
    {
        Task<dynamic> GetExitDashboardAsync(int month, int year);
    }
}
