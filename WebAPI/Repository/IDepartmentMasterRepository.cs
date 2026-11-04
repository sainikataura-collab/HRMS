using HRMSWebAPI.Models;


namespace HRMSWebAPI.Repository

{
    public interface IDepartmentMasterRepository
    {

        public Task<bool> InsertDepartmentAsync(DepartmentMst department);
        //public Task<IEnumerable<DepartmentMst>> GetAllDepartmentsAsync(int pageIndex, int pageSize, string fk_companyId);
        // public Task<IEnumerable<DepartmentMst>> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public Task<(int totalCount, IEnumerable<DepartmentMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "");
        public Task<bool> UpdateDepartmentAsync(DepartmentMst department);

        public Task<DepartmentMst> GetDepartmentByIdAsync(string departmentId);
        public Task<bool> DeleteDepartmentMstAsync(string id);

    }
}
