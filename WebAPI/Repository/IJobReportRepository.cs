using HRMSWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IJobReportRepository
    {
        Task<VendorReportMasterDataDto> GetReportMasterDataAsync(string companyId);
        Task<(int TotalCount, JobReportSummaryDto Summary, List<JobReportItem> Items)> GetJobReportAsync(JobReportFilterRequest filter, string companyId);
        Task<byte[]> GenerateJobReportExcelAsync(JobReportFilterRequest filter, string companyId);
    }
}
