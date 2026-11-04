using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IVendorLiteRepository
    {
        Task<VendorLiteResponseModel> InsertVendorLiteAsync(VendorLiteModel model, string userId, string companyId, string locationId);
        Task<VendorLiteResponseModel> UpdateVendorLiteAsync(VendorLiteModel model, string userId, string companyId);
        Task<VendorLiteModel?> GetVendorLiteByIdAsync(string pk_recId);
        Task<(int totalCount, IEnumerable<VendorLiteModel> vendors)> GetAllVendorLiteAsync(int pageIndex, int pageSize, string companyId, string searchTerm);
        Task<VendorLiteResponseModel> SaveVendorDocumentAsync(VendorDocumentModel doc, string userId, string companyId);
        Task<IEnumerable<VendorDocumentModel>> GetVendorDocumentsByVendorIdAsync(string vendorId);
        Task<VendorLiteResponseModel> DeleteVendorDocumentAsync(long pk_docId, string userId);
        Task<VendorDocumentModel?> GetVendorDocumentByIdAsync(long pk_docId);
        Task<bool> UploadVendorLogoAsync(string vendorId, string logoName);
    }
}
