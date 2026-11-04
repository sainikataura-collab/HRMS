using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IConfirmationEmailRepository
    {
        public Task<bool> InsertEmailSetting(ConfirmationEmailMst emailSetting);

        public Task<(int totalCount, IEnumerable<ConfirmationEmailMst>)> GetAll(int pageIndex, int pageSize, string companyId);

        public Task<ConfirmationEmailMst> GetById(long pk_conrequesemailtId);

        public Task<bool> UpdateEmailSetting(ConfirmationEmailMst emailSetting);

        public Task<bool> DeleteEmailSetting(long pk_conrequesemailtId);

    }
}
