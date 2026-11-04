using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IAppreciationRepository
    {
        public Task<bool> InsertEmployeeAppreciation(AppreciationMst appreciation);

        public Task<(int totalCount, IEnumerable<AppreciationMst>)> GetAll(int pageIndex, int pageSize, string companyId);


        public Task<AppreciationMst> GetById(long pk_appreciationId);
        public Task<bool> UpdateAppreciation(AppreciationMst appreciation);
        public Task<bool> DeleteAppreciation(long pk_appreciationId);


    }
}
