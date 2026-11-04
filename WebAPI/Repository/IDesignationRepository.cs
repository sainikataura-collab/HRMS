using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDesignationRepository
    {

        //public Task<bool> InsertDesignationAsync(DesignationMst designationMst);
        public Task<bool> InsertDesignationMstAsync(DesignationMst designationMst);
        // public Task<IEnumerable<DesignationMst>> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public Task<(int totalCount, IEnumerable<DesignationMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "");


        public Task<DesignationMst> GetDesignationByIdAsync(string desigId);

        public  Task<bool> DeleteDesignationMstAsync(string id);
        public Task<bool> UpdateDesignationMstAsync(DesignationMst designationMst);

    }



}



