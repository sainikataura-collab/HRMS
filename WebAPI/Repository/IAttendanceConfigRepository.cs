using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IAttendanceConfigRepository
    {
        Task<bool> InsertAttendanceConfigAsync(AttendanceConfigMst attendanceConfigs, string fk_companyId);
        Task<IEnumerable<SAL_LeaveConfig>> GetAttendanceConfigByCompanyAsync(string fk_companyId);
        Task<bool> UpdateAttendanceConfigAsync(AttendanceConfigMst attendanceConfigs, string fk_companyId);

    }
}
