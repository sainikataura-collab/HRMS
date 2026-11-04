namespace HRMSWebAPI.Repository
{
    public interface IEventRepository
    {

        Task<IEnumerable<dynamic>> GetUpcomingBirthdaysAsync();
        Task<IEnumerable<dynamic>> GetTodayBirthdaysAsync();
        Task<IEnumerable<dynamic>> GetEvents();
        Task<IEnumerable<dynamic>> GetAniversary();

        Task<IEnumerable<dynamic>> RecentAcitvityofHR();
    }

}
