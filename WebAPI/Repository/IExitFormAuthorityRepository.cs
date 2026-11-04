using HRMSWebAPI.Models;
using static HRMSWebAPI.Models.ExitFormAuthorityMst;

namespace HRMSWebAPI.Repository
{
    public interface IExitFormAuthorityRepository
    {

        Task<bool> CreateAsync(ExitInterviewApprovalDetailWrapper model);
        Task<EmployeeApprovalDetail> GetById(string pk_Empid);

    }
}
