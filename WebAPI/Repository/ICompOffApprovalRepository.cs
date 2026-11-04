

using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICompOffApprovalRepository
    {
        public Task<bool> Insert_ApprovalApplyCompOffReqMstAsync(LeaveModuleMst model);
        Task<IEnumerable<CompOffApprovalMst>> GetAll_ApprovalApplyCompOffAsync(string EmpId);
        Task<CompOffRequestSelforGrid> GetAllCompOffByEmpIdAsync(string pk_applycompoffId);


    }
}
