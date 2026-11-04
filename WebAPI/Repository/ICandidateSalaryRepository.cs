using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICandidateSalaryRepository
    {
        Task<(int totalCount, IEnumerable<CandidateSalary>)> GetAll(int pageIndex, int pageSize);
        Task<bool> Delete(string pk_recId);
        Task<bool> Insert(CandidateSalaryDataSet dataset, string Fk_UserID, string Fk_LocID);
        Task<bool> Update(CandidateSalaryDataSet dataset, string Fk_UserID, string Fk_LocID);

        Task<Result<List<NameValue>>> GetCandidateNameSerch(string candidatename, string fk_companyId);

        //Task<(Candidate_Detail, Candidate_SalaryHead, Candidate_SalaryHead, int, int)> GetCandidateDetailsById(string pk_recId);
        Task<(Candidate_Detail, List<Candidate_SalaryHead>, List<Candidate_SalaryHead>, int, int)> GetCandidateDetailsById(string pk_recId);








    }
}
