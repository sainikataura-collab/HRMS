using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IFunctionalRepository
    {
        public Task<bool> InsertFunctionalMstAsync(FunctionalMst FunctionalMst, string fk_companyId);
        public Task<(int totalCount, IEnumerable<FunctionalMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<FunctionalMst> GetFunctionalByIdAsync(long functionalId);
        public  Task<bool> UpdateFunctionalMstAsync(FunctionalMst FunctionalMst);

        public Task<bool> DeleteFunctionalMstAsync(long functionalId);






    }
}
