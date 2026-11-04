using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICostRepository
    {
        public Task<bool> InsertCostMstAsync(CostMst CostMst, string fk_companyId);
        public Task<(int totalCount, IEnumerable<CostMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<CostMst> GetCostMstByIdAsync(long functionalId);
        public Task<bool> UpdateCostMstAsync(CostMst CostMst);

        public Task<bool> DeleteCostMstAsync(long functionalId);
    }
}
