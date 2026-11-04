using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDealerOutletRepository
    {
        public Task<(int totalCount, IEnumerable<dynamic>)> GetAllAsync(int pageIndex, int pageSize, string fk_userId, string fk_companyId);

        public Task<bool> InsertDealerOutletAsync(List<DealerOutletMst> outletList,string fk_companyId);

     
            Task<bool> DeleteDealerOutletAsync(int pk_dealerOutletId);
        Task<DealerOutletMst> GetDealerOutletByIdAsync(int pk_dealerOutletId);

        public Task<bool> UpdateDealerOutletAsync(List<DealerOutletMst> outletList);
    }
}
