using HRMSWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IVendorReportRepository
    {
        Task<(int TotalCount, VendorReportSummaryDto Summary, List<VendorReportItem> Items)> GetVendorReportAsync(VendorReportFilterRequest filter, string companyId);
        Task<(int TotalCount, List<VendorWiseReportItem> Items)> GetVendorWiseReportAsync(VendorReportFilterRequest filter, string companyId);
        Task<VendorReportMasterDataDto> GetReportMasterDataAsync(string companyId);
        Task<byte[]> GenerateVendorReportExcelAsync(VendorReportFilterRequest filter, string companyId);
        Task<byte[]> GenerateVendorWiseReportExcelAsync(VendorReportFilterRequest filter, string companyId);
    }
}
