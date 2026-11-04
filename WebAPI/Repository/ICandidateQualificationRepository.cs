using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICandidateQualificationRepository
    {
        Task<bool> InsertCandidateQualification(CandidateQualificationDetails qualificationDetails);
        Task<(int totalCount, IEnumerable<CandidateQualificationDetails>)> GetAll(int pageIndex, int pageSize, string fk_recId);
        Task<CandidateQualificationDetails> GetById(long pk_cqualid);
        Task<bool> DeleteCandidateQualificationAsync(long pk_cqualid);
        Task<bool> UpdateCandidateQualification(CandidateQualificationDetails qualificationDetails);
    }
}