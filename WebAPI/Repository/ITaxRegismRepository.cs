using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITaxRegismRepository
    {

        Task<bool> UpdateRegismMstAsync(string pk_empid, string TaxRegime);
    }
}
