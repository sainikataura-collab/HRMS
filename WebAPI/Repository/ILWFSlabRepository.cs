using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILWFSlabRepository
    {
        public Task<LWF_SlabMst> GetById(long pk_slabid);
        public  Task<bool> Delete(long pk_slabid);

        public Task<bool> InsertLWFSlabAsync(LWF_SlabMst lwfSlab);
        public Task<bool> UpdateLWFSlabAsync(LWF_SlabMst lwfSlab);
        public Task<(int totalCount, IEnumerable<LWF_SlabMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, short? fk_stateid, string searchTerm = "");

    }
}
