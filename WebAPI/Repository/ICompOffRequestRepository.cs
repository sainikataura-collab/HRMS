using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICompOffRequestRepository
    {
        Task<dynamic> ApproveOrRejectCompOffAsync(long pk_applycompoffId, int approvalOrder);
        public Task<ModelResponse> InsertCompOffRequestAsync(CompOffRequestMstDataSet data);

        public Task<IEnumerable<CompOffRequestSelforGrid>> GetAllCompOffByEmpAllAsync(string? fk_empid);

        public Task<IEnumerable<CompOffRequestSelforGrid>> GetAllCompOffByEmpIdAsync(string? pk_applycompoffId);

        public Task<IEnumerable<CompOffRequestSelforGrid>> GetCompOffByEmpAllAsync(string fk_empid, string dated);
        public Task<(bool isSuccess, string message)> DeleteCompOffLeaveAsync(string pk_applycompoffId);
    }
}