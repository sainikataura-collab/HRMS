using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRestrictedHolidaysRepository
    {

        Task<IEnumerable<RestrictedHolidaysMst>> GetAll(string? fk_yearid, string? fk_empid);

        //For Gazatted

        Task<IEnumerable<RestrictedHolidaysMst>> GetAllGazatted(string? fk_yearid, string? fk_empid);
    }
}
