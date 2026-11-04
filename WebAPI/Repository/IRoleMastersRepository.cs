using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRoleMastersRepository
    {

        public Task<(int totalCount, IEnumerable<RoleMastersMst>)> GetAll(int pageindex, int pagesize);

        public Task<RoleMastersMst> GetByIdAsync(int RoleId);

        public Task<bool> DeleteAsync(int RoleId);

        public Task<bool> InsertAsync(RoleMastersMst RoleMastersMst);
        public Task<bool> UpdateAsync(RoleMastersMst RoleMastersMst);
    }
}
