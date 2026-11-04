using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IFreezingStatusRepository
    {
        public Task<bool> UpdateFreezingFinalStatus(FreezingFinalStatusDataSet Data);

        public Task<(List<FinalStatusFreezingData>, FreezingdateData)> GetFreezingFinalStatusByJobId(string fk_jobid);
    }
}
