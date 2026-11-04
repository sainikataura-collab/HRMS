using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IleaveAccrualRepository
    {
        Task<listResult> GetAll(leaveAccrualRequest filter);

        public Task<bool> delete(NewDataSet emplistreqData);

        public Task<bool> Insert(NewDataSet emplistreqData);

    }
}
