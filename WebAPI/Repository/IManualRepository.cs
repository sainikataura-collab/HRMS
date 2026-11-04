using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IManualRepository
    {
        Task<Result<List<ManualMst>>> GetAllAsync(string fk_empid, string fk_monthId, string fk_yearId, string flag);
        Task<ManualMst> GetInOutByIdAsync(string pk_inoutid);
        Task<bool> UpdateInOutAsync(ManualMst manualMst);
    }
}
