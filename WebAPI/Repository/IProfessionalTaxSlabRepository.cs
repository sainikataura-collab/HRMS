using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IProfessionalTaxSlabRepository
    {
        public Task<bool> InsertProfessionalAsync(ProfessionalTaxSlabMst ProfessionalTaxSlabMst, string fk_userid, string fk_locid);
        public Task<(int totalCount, IEnumerable<ProfessionalTaxSlabMst>)> GetAll(int pageIndex, int pageSize, short? fk_stateid, string searchTerm = "", string fk_companyId = "");
        public Task<ProfessionalTaxSlabMst> GetProfessionalByIdAsync(long? pk_slabid);
        public Task<bool> UpdateProfessionalAsync(ProfessionalTaxSlabMst ProfessionalTaxSlabMst, string fk_userid, string fk_locid);
        public Task<bool> DeleteProfessionalAsync(long? pk_slabid);



    }
}
