using HRMSWebAPI.Models;
namespace HRMSWebAPI.Repository
{
    public interface IAccountRepository
    {
        public Task<bool> InsertAccountMaster(AccountMst AccountMaster);
        public Task<(int totalCount, IEnumerable<AccountMst>)> GetAll(int pageIndex, int pageSize);
        public Task<bool> UpdateMasterAccount(AccountMst accountMaster);
        public Task<AccountMst> GetById(string bankId);
        public Task<bool> DeleteAccountMaster(string pk_account_id);
    }
}
