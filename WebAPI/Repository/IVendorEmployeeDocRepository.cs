using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IVendorEmployeeDocRepository
    {
        Task<(int totalCount, IEnumerable<VendorEmpDocSummaryModel> list)> GetVendorEmpDocListForVendorAsync(
            string vendorId, string companyId, string searchTerm, int pageIndex, int pageSize);

        Task<(int totalCount, IEnumerable<VendorEmpDocSummaryModel> list)> GetVendorEmpDocListForHRAsync(
            string companyId, string vendorId, string locationId, string status, string searchTerm, int pageIndex, int pageSize);

        Task<IEnumerable<VendorEmpDocSummaryModel>> ExportVendorEmpDocListForHRAsync(
            string companyId, string vendorId, string locationId, string status, string searchTerm);

        Task<IEnumerable<VendorEmployeeDocModel>> GetDocsByEmpAndVendorAsync(string vendorId, string empId);

        Task<VendorEmpDocSaveResponse> SaveVendorEmployeeDocumentAsync(VendorEmployeeDocModel model, string userId, string companyId);

        Task<VendorEmpDocSaveResponse> UpdateDocStatusAsync(long pk_docId, string status, string? remarks, string userId);

        Task<VendorEmpDocSaveResponse> DeleteDocAsync(long pk_docId, string userId);

        Task<VendorEmployeeDocModel?> GetDocByIdAsync(long pk_docId);

        Task<string?> GetVendorIdByUserIdAsync(string userId, string companyId);

        Task<string?> GetVendorIdByEmpIdAsync(string empId);

        Task<bool> IsUserVendorAsync(string userId, string companyId);

        Task<IEnumerable<NameValue>> GetEmployeesByVendorAsync(string companyId, string? vendorId, string? searchTerm);

        Task<bool> MarkDocAsViewedAsync(long pk_docId);
    }
}
