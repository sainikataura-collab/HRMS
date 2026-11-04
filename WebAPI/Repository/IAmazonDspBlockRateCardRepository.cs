using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IAmazonDspBlockRateCardRepository
    {
        Task<AmazonDspBlockRateCardResponseModel> InsertAsync(AmazonDspBlockRateCardModel model, string userId, string companyId);
        Task<AmazonDspBlockRateCardResponseModel> UpdateAsync(AmazonDspBlockRateCardModel model, string userId, string companyId);
        Task<AmazonDspBlockRateCardResponseModel> DeleteAsync(long id);
        Task<AmazonDspBlockRateCardModel?> GetByIdAsync(long id);
        Task<(int totalCount, IEnumerable<AmazonDspBlockRateCardModel> list)> GetListAsync(int pageIndex, int pageSize, string companyId, string searchTerm, string? userId = "");

        Task<List<BlockRateCardUploadRowModel>> UploadBlockRateCardExcelAsync(IFormFile file, string? companyId = null, string? userId = null);
        Task<(int totalCount, IEnumerable<BlockRateCardUploadFileItemModel> list)> GetExcelUploadListAsync(string? companyId, string? searchTerm, int pageIndex = 1, int pageSize = 10);
        Task<BlockRateCardUploadFileItemModel?> GetExcelUploadFileByIdAsync(int id);

    }
}
