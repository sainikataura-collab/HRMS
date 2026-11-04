using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICommonLocationRepository
    {
        //get all
        Task<(int totalCount, IEnumerable<CommonLocationMst>)> GetAll(int pageindex, int pagesize, string fk_companyId, string locname, string fk_officeid, string fk_cityid, string searchTerm = "");

        //get by id
        Task<CommonLocationMst> GetById(string pk_locid);

        //delete 
        Task<bool>delete(string pk_locid);

        //FOR INSERT
        public Task<bool>InsertAsync(CommonLocationMst locationMst);

        //for update
        public Task<bool> UpdateAsync(CommonLocationMst locationMst);





    }
}
