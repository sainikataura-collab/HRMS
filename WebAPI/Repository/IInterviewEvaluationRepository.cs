using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IInterviewEvaluationRepository
    {
        Task<bool> Insert(ScoringSheetXmlModel dataMst, string Fk_UserID, string Fk_LocID);
        Task<bool> Update(ScoringSheetXmlModel dataMst, string fk_recId, string Fk_UserID, string Fk_LocID);

        Task<ScoringSheetEditModel> GetById(string fk_recId);

        public Task<bool> DeleteAsync(string fk_recId);

        Task<IEnumerable<dynamic>> GetAll(string Fk_RecId);

       
        Task<(List<NameValue>, List<NameValue>)> GetDropdown(string fk_jobId);

       
        Task<InterviewRoundDto> GetInterviewRoundsAsync(string jobId);


    }
}
