using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICustomerRateCardRepository
    {
        Task<Result> InsertRateCardAsync(CustomerRateCardMasterDTO model, string userId, string companyId);
        Task<Result> UpdateRateCardAsync(CustomerRateCardMasterDTO model, string userId, string companyId);
        Task<CustomerRateCardMasterDTO?> GetRateCardByIdAsync(int rateCardId, string companyId);
        Task<(int totalCount, IEnumerable<dynamic> list)> GetAllRateCardsAsync(int pageIndex, int pageSize, string companyId, string? searchTerm = "");
        Task<Result> DeleteRateCardAsync(int rateCardId, string companyId, string deleteBy);
        Task<IEnumerable<dynamic>> GetEarningHeadsAsync(string companyId);
        Task<List<Dictionary<string, object>>> UploadCustomerRateCardExcelAsync(IFormFile file, string companyId, string userId);
        Task<MinimumWageResponseDTO?> GetMinimumWageByLocationAndCategoryAsync(string locationId, string categoryId, string companyId);
        Task<List<NameValue>> GetLocationsByCustomerAsync(long customerId, string companyId);
    }
}
