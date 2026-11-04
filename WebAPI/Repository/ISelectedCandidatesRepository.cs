using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISelectedCandidatesRepository
    {
        public  Task<bool> UpdateFinalSelectionStatus(SelectedCandidatesMstDataSet Data);

        public Task<(List<FinalSelectedCandidatesData>, SelectedCandidateData)> GetFinalSelectedCandidatesByJobId(string fk_jobid);


    }
}
