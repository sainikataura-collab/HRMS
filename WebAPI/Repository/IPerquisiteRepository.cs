using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IPerquisiteRepository
    {
         public Task<bool> InsertperquisitesAsync(PerquisiteMst perquisite, string fk_locId, string fk_userId, string fk_companyId);
        public Task<(int totalCount, IEnumerable<PerquisiteMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public Task<PerquisiteMst> GetperquisitesByIdAsync(string perquisiteId);
         public Task<bool> DeleteperquisitesAsync(string perquisiteId);
        public Task<bool> UpdatePerquisitesAsync(PerquisiteMst section, string fk_locId, string fk_userId);


    }
}
