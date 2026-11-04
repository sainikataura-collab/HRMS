using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface ITNIRepository
    {
        //Task<bool> InsertTNIAsync(TNIRequest tniRequest);
        Task<bool> InsertTNIAsync(TNIRequest tniRequest, List<TNIRequestLine> Details);

        Task<bool> TakeTNIActionAsync(TNIActionRequest req);
        Task<(int totalCount, IEnumerable<TNIListRow>)> GetTNIAdminListAsync(TNIListFilter filter);
        //Task<IEnumerable<TNIRequest>> GetApprovedTNIAsync();
        //Task<IEnumerable<TNIRequest>> GetApprovedTNIAsync(int? subProgramId = null);
        Task<IEnumerable<TNIRequest>> GetApprovedTNIAsync(int? subProgramId = null, int? TNIId = null);
        Task<Result<List<NameValue>>> GetsubProgDropdownList(string fk_deptid, string userId, string companyId);

        Task<(int totalCount, IEnumerable<TNIListRow>)> GetAll(int pageIndex, int pageSize,string empid);
        Task<TrainingCalendarEmployeeView> GetEmpView(string empid, long programId, long subProgramId);
        Task<Result<List<NameValue>>> GetTNIsubProgDropdownList(string fk_programid, string userId, string companyId);

        //Task<object> CheckPlanningAllowedAsync(int tniId, int programId, int subProgramId);


    }
}
