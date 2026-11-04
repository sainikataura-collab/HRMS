using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IManualIncomeTaxRepository
    {
        public Task<IEnumerable<ManualIncomeTaxMst>> GetAllManualITaxAsync(ManualIncomeTaxMstRequest filter);

        //public Task<bool> UpdateManualIncomeTaxAsync(ManualIncomeTaxMst manualTax);

        public  Task<bool> UpdateManualIncomeTaxAsync(List<ManualIncomeTaxMst> manualTaxList, string fk_locid, string fk_userID);
    }
}
