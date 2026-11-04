using HRBook.Models;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDailyAttendanceRepository
    {

        Task<(bool IsSuccessfull, string Message)> SaveAttendance(DailyAttendanceModelins model);

        Task<DailyAttendanceModel> GetAttendance(string empId, short monthId, short yearId, string finId);
    }
}
