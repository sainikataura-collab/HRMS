using HRMSWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface ICandidateReportRepository
    {
        Task<CandidateReportMasterDataDto> GetReportMasterDataAsync(string companyId);
        Task<(int TotalCount, CandidateReportSummaryDto Summary, List<CandidateReportItem> Items)> GetCandidateReportAsync(CandidateReportFilterRequest filter, string companyId);
        Task<byte[]> GenerateCandidateReportExcelAsync(CandidateReportFilterRequest filter, string companyId);
    }
}
