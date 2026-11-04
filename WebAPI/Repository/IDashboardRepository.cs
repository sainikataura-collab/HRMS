using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDashboardRepository
    {

        public Task<(int totalCount, IEnumerable<DashboardMst>)> GetAll(int pageIndex, int pageSize,string fk_companyId);

        public Task<DashboardMst> GetByIdAsync(int pk_dashId);

        public Task<bool> DeleteAsync(int pk_dashId);

        public Task<bool> InsertAsync(DashboardMst dashboardMst);


        public Task<bool> UpdateAsync(DashboardMst dashboardMst);

    }

}
