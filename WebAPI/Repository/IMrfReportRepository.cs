using HRMSWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IMrfReportRepository
    {
        Task<VendorReportMasterDataDto> GetReportMasterDataAsync(string companyId);
        Task<(int TotalCount, MrfReportSummaryDto Summary, List<MrfReportItem> Items)> GetMrfReportAsync(MrfReportFilterRequest filter, string companyId);
        Task<byte[]> GenerateMrfReportExcelAsync(MrfReportFilterRequest filter, string companyId);
    }
}
