using HRMSWebAPI.Models;
using static HRMSWebAPI.Models.CandidateMedicalMst;

namespace HRMSWebAPI.Repository
{
    public interface ICandidateMedicalRepository
    {
        public  Task<CandidateDetailData> GetCandidateDetailsByIdAsync(string fk_recId);



        public Task<Candidate_MedicalDetails> GetCandidate_MedicalsByIdAsync(long pk_mtrnid);
        public Task<(int totalCount, IEnumerable<Candidate_MedicalDetails>)> GetAllCandidateMedicalsAsync(int pageIndex, int pageSize, string fk_recId);
        public Task<bool> DeleteCandidateMedicalAsync(long pk_mtrnid);
        public Task<bool> InsertCandidateMedicalAsync(Candidate_MedicalDetailsDataSet medicalDataSet);
        public Task<bool> UpdateCandidateMedicalAsync(Candidate_MedicalDetailsDataSet medicalDataSet);



        public Task<CandidateReferenceDetails> GetCandidateReferenceByIdAsync(long pk_rtrnid);
        public Task<(int totalCount, IEnumerable<CandidateReferenceDetails>)> GetAllCandidateReferencesAsync(int pageIndex, int pageSize, string fk_recId);
        public Task<bool> DeleteCandidateReferenceAsync(long pk_rtrnid);
        public Task<bool> InsertCandidateReferenceAsync(CandidateReferenceDetailsDataSet reference);
        public Task<bool> UpdateCandidateReferenceAsync(CandidateReferenceDetailsDataSet reference);







    }
}
