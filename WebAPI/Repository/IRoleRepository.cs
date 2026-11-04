using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRoleRepository
    {

        public Task<(int totalCount, IEnumerable<RoleMst>)> GetAll(int pageindex, int pagesize);

        public Task<RoleMst> GetByIdAsync(string pk_roleId);

        public Task<bool> DeleteAsync(string pk_roleId);

        public Task<bool> InsertAsync(RoleMst roleMst);
        public Task<bool> UpdateAsync(RoleMst roleMst);
    }
}
