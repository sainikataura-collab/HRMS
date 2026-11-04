using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISeparationRequestRepository
    {

        public Task<(bool IsSuccess, string Message)> InsertSeparationRequest(SeparationRequestMst model);

        Task<(int totalCount, IEnumerable<SeparationRequestMst>)> GetAll(string empId,int pageIndex, int pageSize);

        Task<SeparationRequestMst> GetById(long pk_seprequestId);

        Task<bool> UpdateSeparationRequest(SeparationRequestMst model);

        Task<bool> DeleteSeparationRequest(long pk_seprequestId);

        Task<(bool IsSuccess, string Message)> ApproveResignation(SeparationRequestMst model);

        Task<(int totalCount, IEnumerable<SeparationRequestMst>)>GetApprovalList(string hodId);

        Task<int> GetNoticePeriod(string empId);
        Task<SeparationRequestMst> GetReport(long pkSepRequestId);

        Task<(bool IsSuccess, string Message)> WithdrawResignation(SeparationRequestMst model);
        Task<(int totalCount, IEnumerable<SeparationRequestMst>)> GetAdminList(int pageIndex, int pageSize, string searchTerm);
        Task<(int totalCount, IEnumerable<SeparationRequestMst>)> GetAdminReportList(int pageIndex, int pageSize, string searchTerm);
        Task<(int totalCount, IEnumerable<dynamic>)> GetAdminExitReportList(int pageIndex, int pageSize, string searchTerm);

        Task<SeparationRequestMst> GetLetterData(long id);

        Task<byte[]> DownloadRelievingLetter(long id);

        Task<byte[]> DownloadExperienceLetter(long id);

        Task<(SeparationRequestAdminCount Data, bool IsSuccess, string Message)> GetDashboardCount();


    }
}
