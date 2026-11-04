using HRMSWebAPI.Controllers;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IHrPolicyRepositoy
    {
      
        public Task<(int totalCount, IEnumerable<HrPolicyMst>)> GetAllFileDownloads(string fk_empid, string filetype, string fk_companyId);

    }
}
