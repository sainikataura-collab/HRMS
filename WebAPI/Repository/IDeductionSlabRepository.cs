using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDeductionSlabRepository
    {
        public Task<bool> InsertDeductionSlabAsync(DeductionSlabMst DeductionSlabMst, string fk_userid, string fk_locid, string fk_companyId);
        public Task<(int totalCount, IEnumerable<DeductionSlabMst>)> GetAll(int pageIndex, int pageSize, string? PersonType, string fk_companyId);
        public Task<DeductionSlabMst> GetDeductionSlabByIdAsync(long? pk_slabid);
        public Task<bool> UpdateDeductionSlabAsync(DeductionSlabMst DeductionSlabMst, string fk_userid, string fk_locid,string fk_companyId);
        public Task<bool> DeleteDeductionSlabAsync(long? pk_slabid);
    }
}
