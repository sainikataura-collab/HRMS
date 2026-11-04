using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IReminderSetupRepository
    {

        Task<bool> Insert(ReminderSetupXmlModel dataMst);
    }
}
