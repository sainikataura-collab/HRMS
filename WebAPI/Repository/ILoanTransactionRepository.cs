using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public interface ILoanTransactionRepository
    {
        public Task<bool> InsertLoanTransactionAsync(List<LoanTransactionMst> loanTransactionMstList, List<LoanTransactionDetails> loanTransactionDetailsList, string fk_insUserID, string fk_LocID);

         public Task<(int totalCount, IEnumerable<LoanTransactionMst>)> GetAllLoanTransactionAsync(int pageIndex, int pageSize, string fk_empid, string company_id);
        public Task<LoanTransactionMstResult> GetLoanTransactionByIdAsync(string pk_lid);

        public Task<bool> UpdateLoanTransactionAsync(
          string pk_lid,
          List<LoanTransactionMst> loanTransactionMstList,
          List<LoanTransactionDetails> loanTransactionDetailsList,
          string fk_updUserID,
          string fk_LocID,
          byte[] timestamp);
        public Task<bool> DeleteLoanTransactionAsync(string pk_lid);




    }
}
