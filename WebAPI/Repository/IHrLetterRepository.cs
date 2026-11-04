using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IHrLetterRepository
    {
        Task<IEnumerable<HrLetterMst>> GetEmployeeHRLetters(string fk_empid);

     //   public Task<(int totalCount, IEnumerable<HrLetterMst>)> GetAllFileDownload(string fk_empid, string filetype, string fk_companyId);

    }
}
