using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IExitInterviewRepository
    {
        Task<bool> InsertExitInterviewAsync(ExitInterviewMst model);

        Task<(int totalCount, IEnumerable<ExitInterviewMst>)> GetAllExitInterviewsAsync(
    int pageIndex,
    int pageSize,
    string fk_empid
);

        Task<ExitInterviewMst> GetExitInterviewByIdAsync(long exitInterviewId, string fk_empid);

        Task<bool> UpdateExitInterviewAsync(ExitInterviewMst model);

        Task<bool> DeleteExitInterviewAsync(long exitInterviewId);

        Task<(int totalCount, IEnumerable<ExitInterviewMst>)> GetAdminHodExitInterviewsAsync(
            string empId,
            bool isAdmin,
            int pageIndex,
            int pageSize);

        Task<ExitInterviewMst> GetAdminHodExitInterviewByEmpIdAsync(
            string viewEmpId,
            string empId,
            bool isAdmin);

        Task<(int totalCount, IEnumerable<ExitInterviewMst>)> GetAllAdminHodExitInterviewsAsync( int pageIndex, int pageSize, string fk_empid, bool isAdmin);

        Task<ExitInterviewMst> GetAdminHodExitInterviewByIdAsync( long pk_exitInterviewId, string fk_empid, bool isAdmin);

        Task<ExitInterviewMst?> GetExitInterviewReportAsync(long exitInterviewId);


    }
}