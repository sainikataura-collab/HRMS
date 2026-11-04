using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IHeadRepository
    {
        public Task<bool> InsertHeadAsync(HeadMst headMst, string fk_insUserID, string Fk_LocID, string fk_companyId);

        public Task<(int totalCount, IEnumerable<HeadMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "");
        public Task<HeadMst> GetHeadByIdAsync(string pk_headid);
        public Task<bool> DeleteHeadAsync(long pk_headid);

        public Task<bool> UpdateHeadAsync(HeadMst headMst, string fk_insUserID, string Fk_LocID);




    }
}
