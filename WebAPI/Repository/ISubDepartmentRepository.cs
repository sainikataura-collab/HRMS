using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISubDepartmentRepository
    {
        public Task<bool> InsertSubDepartmentAsync(SubDepartmentMst subDepartmentMst);
        public Task<(int totalCount, IEnumerable<SubDepartmentforGetData>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public  Task<bool> UpdateSubDepartmentAsync(SubDepartmentMst subDepartmentMst);
        public  Task<SubDepartmentMst> GetSubDepartmentByIdAsync(string subdepartmentId);

        public  Task<bool> DeleteSubDepartmentMstAsync(string subdepartmentId);

    }
}
