using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILoanAllotmentRepository
    {
        public Task<bool> InsertLoanAllotmentAsync(List<LoanAllotmentMst> loanAllotmentMstList, string fk_insUserID, string fk_LocID);
        public Task<(int totalCount, IEnumerable<LoanAllotmentMst>)> GetAllLoanAllotment(int pageIndex, int pageSize, string fk_empid);
        public Task<LoanAllotmentMst> GetLoanAllotmentByIdAsync(string pk_allotid);
        public Task<bool> UpdateLoanAllotmentAsync(List<LoanAllotmentMst> loanAllotmentMstList, string fk_updUserID, string fk_LocID, string pk_allotid, byte[] timestamp);
        public Task<bool> DeleteLoanAllotmentAsync(string pk_allotid);




    }
}
