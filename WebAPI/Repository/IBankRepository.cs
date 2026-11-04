using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IBankRepository
    {
        public Task<(int totalCount, IEnumerable<BankMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "");

        public Task<BankMst> GetBankByIdAsync(string bankId);

        public Task<bool> InsertBankMstAsync(BankMst BankMst);
        public Task<bool> UpdateBankMstAsync(BankMst BankMst);
        

        public Task<bool> DeleteBankMstAsync(string bankId);



        
    }
}
