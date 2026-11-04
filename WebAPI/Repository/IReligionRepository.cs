using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IReligionRepository
    {
        public Task<bool> InsertReligionMst(RegligionMst RegligionMaster);

        public  Task<(int totalCount, IEnumerable<RegligionMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        //public Task<IEnumerable<RegligionMaster>> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<RegligionMst> GetRegligionMasterById(string Pk_religionid);

        public Task<bool> UpdateRegligionMaster(RegligionMst RegligionMaster);

        public Task<bool> DeleteRegligionMaster(string Pk_religionid);



    }
}
