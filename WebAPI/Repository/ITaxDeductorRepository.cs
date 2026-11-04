using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITaxDeductorRepository
    {
        public Task<bool> InsertTaxDeductorAsync(List<TaxDeductorMst> taxDeductorList, string fk_insUserID, string fk_LocID, string fk_companyId);

        public Task<(int totalCount, IEnumerable<TaxDeductorMst>)> GetAllTaxDeductorsAsync(int pageIndex, int pageSize, string fk_companyId);

        public Task<TaxDeductorMst> GetTaxDeductorByIdAsync(string pk_dedid);

        public Task<bool> UpdateTaxDeductorAsync(List<TaxDeductorMst> taxDeductorMstList, string fk_updUserID, string fk_LocID, string pk_dedid);

        public Task<bool> DeleteTaxDeductorAsync(string pk_dedid);


    }
}
