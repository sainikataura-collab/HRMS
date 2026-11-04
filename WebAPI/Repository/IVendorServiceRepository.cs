using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IVendorServiceRepository
    {
        Task<(int totalCount, IEnumerable<VendorServiceModel> list)> GetVendorServiceListAsync(VendorServiceFilterDto filter, string companyId);
        Task<VendorServiceModel?> GetVendorServiceByIdAsync(long id, string companyId);
        Task<Result> InsertVendorServiceAsync(VendorServiceModel model, string userId, string locationId, string companyId);
        Task<Result> UpdateVendorServiceAsync(VendorServiceModel model, string userId, string locationId, string companyId);
        Task<Result> DeleteVendorServiceAsync(long id, string userId, string companyId);
        Task<IEnumerable<VendorServiceDropdownItem>> GetVendorsDropdownAsync(string companyId);
        Task<IEnumerable<VendorServiceDropdownItem>> GetLocationsDropdownAsync(string companyId);
        Task<IEnumerable<VendorServiceDropdownItem>> GetClientsDropdownAsync(string companyId);
        Task<IEnumerable<VendorServiceDropdownItem>> GetLocationsByVendorAsync(string vendorId, string companyId);
        Task<IEnumerable<VendorServiceDropdownItem>> GetClientsByLocationAsync(string locationIds, string companyId);
        Task<VendorServiceUploadSummaryResult> UploadExcelAsync(IFormFile file, string companyId, string userId);
    }
}
