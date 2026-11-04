using HRMSWebAPI.Models;
using static HRMSWebAPI.Models.ImportExcle;

namespace HRMSWebAPI.Repository
{
    public interface IFNFRepository
    {
        public Task<(int TotalCount1, int TotalCount2, IEnumerable<dynamic> PendingData, IEnumerable<dynamic> ProcessedData)> fnflist(
           int pageIndex1, int pageSize1,
           int pageIndex2, int pageSize2,
           string empCode,
           string empCodeManual,
           string empName,
           List<string> selectedDepartments,
           string selectedDesignation,
           List<string> selectedLocations,
           string selectedNature,
           string selectedCity,
           string sortBy,
           string fkUserId,
           string empStatus,
           string searchTerm1,
            string searchTerm2);



        //aryan

        Task<dynamic> GetFullAndFinalSettlementData(string empId);

        Task<byte[]> DownloadPdf(string empId);

        Task<FnfSettlementMst?> GetFnfSettlementDetailAsync(string pk_empid);

        Task<bool> InsertFnfSettlementAsync(FnfSettlementMst fnfSettlementMst);

        Task<FnfSettlementMst?> GetFnfSettlementViewAsync(string fk_empid);

        Task<(int totalCount, IEnumerable<dynamic>)> ViewFnfReportAsync(ReportModelRequest request);
    }



   
    }
