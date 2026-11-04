using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Repository
{
    public interface IUploadFileHistoryRepository
    {
        Task<long> SaveUploadHistoryAsync(IFormFile file, string fileType, string entryBy, string companyId, string? resultDataJson = null);
        Task<(int totalCount, IEnumerable<UploadFileHistoryModel> list)> GetUploadHistoryListAsync(string fileType, string companyId, string entryBy, int pageIndex, int pageSize);
        Task<(byte[] fileBytes, string fileName, string contentType)?> GetFileBytesByIdAsync(long id, string companyId);
    }
}
