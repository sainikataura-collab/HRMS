using HRMSWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface ILocationReportRepository
    {
        Task<VendorReportMasterDataDto> GetReportMasterDataAsync(string companyId);
        Task<(int TotalCount, LocationReportSummaryDto Summary, List<LocationReportItem> Items)> GetLocationReportAsync(LocationReportFilterRequest filter, string companyId);
        Task<(int TotalCount, List<LocationWiseJobItem> Items)> GetLocationWiseJobsReportAsync(LocationReportFilterRequest filter, string companyId);
        Task<byte[]> GenerateLocationReportExcelAsync(LocationReportFilterRequest filter, string companyId);
        Task<byte[]> GenerateLocationWiseJobsReportExcelAsync(LocationReportFilterRequest filter, string companyId);
    }
}
