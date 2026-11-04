using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmailConfigRepository
    {
        public Task<bool> InsertEmailConfigAsync(EmailConfigMst config);

        public Task<EmailConfigMst> GetEmailConfigAsync();

        public Task<bool> UpdateEmailConfigAsync(EmailConfigMst config);



    }
}
