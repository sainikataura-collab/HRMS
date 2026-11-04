using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICandidateRepository
    {
        Task<bool> InsertCandidateAsync(CandidateMst candidateList, string fk_companyId);
        Task<bool> UpdateCandidateAsync(long? pk_formatid, CandidateMst candidate);

        public Task<(int totalCount, IEnumerable<CandidateMst>)> GetAll(int pageindex, int pagesize, string fk_companyId, string searchTerm = "");

        public Task<CandidateMst> GetByIdAsync(long pk_formatid);

        public Task<bool> DeleteAsync(long pk_formatid);

        Task<CandidateKeyValidationDto> GetCandidateByKey(string candidateKey); //added code




    }
}
