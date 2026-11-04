using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICandidateMasterRepository
    {

        Task<(int totalCount, IEnumerable<CandidateMasterMst>)> GetAll(int pageindex, int pagesize, string fk_companyId, string searchTerm = "");

        Task<Response> GetById(string pk_recId);

        Task<bool> DeleteAsync(string pk_recId);

        //  public Task<bool> InsertAsync(CandidateXmlModel Model, string fk_locid, string fk_userid, string fk_companyId);


        public Task<bool> InsertAsync(Mst1 Model, string fk_locid, string fk_userid, string fk_companyId);

        public Task<bool> Update(Mst1 Model,string pk_recId, string fk_locid, string fk_userid);



        Task<IEnumerable<dynamic>> GetbyEmialorMobile(string EmailOrMobile);

        Task<bool> UpdateOnboardingStatusInitiated(string pk_recId);

    }
}
