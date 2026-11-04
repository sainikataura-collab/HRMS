using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeKRAPLIRepository
    {
       Task<IEnumerable<EmployeeKRAPLIMst>> GetAll(KRAPLIRequest filter);

        Task<bool> UpdateEmployeeKraPliAsync(EmployeeKraPliXmlModel model, string Fk_UserID, string Fk_LocID);
    }
}
