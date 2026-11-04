using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITaxConfigRepository
    {
        public Task<bool> InsertTaxConfigAsync(List<TaxConfigMst> taxConfigList, string fk_insUserID, string fk_LocID);

        public Task<TaxConfigMst> GetTaxConfigByIdAsync();

        public Task<bool> UpdateTaxConfigAsync(List<TaxConfigMst> taxConfigList, string fk_updUserID, string fk_LocID);


    }
}
