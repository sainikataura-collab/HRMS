using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILeaveConfigRepository
    {
        public Task<bool> InsertLeaveConfigAsync(List<LeaveConfigMst> leaveConfigList, string fk_companyId);

        public Task<LeaveConfigMst> GetLeaveConfigByCompanyIdAsync(string fk_companyId);

        public Task<bool> UpdateLeaveConfigAsync(List<LeaveConfigMst> leaveConfigList, string fk_companyId);

    }
}
