using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICommonRateCardRepository
    {
        Task<Result> InsertRateCardAsync(CommonRateCardModel model, string userId, string companyId);
        Task<Result> UpdateRateCardAsync(CommonRateCardModel model, string userId, string companyId);
        Task<Result> DeleteRateCardAsync(long pk_RateCardID, string companyId);
        Task<CommonRateCardModel?> GetRateCardByIdAsync(long pk_RateCardID, string companyId);
        Task<(int totalCount, IEnumerable<dynamic> list)> GetAllRateCardsAsync(int pageIndex, int pageSize, string companyId, string? searchTerm = "",string? userId = "");
        
        Task<(bool recordExists, IEnumerable<dynamic> list)> CheckRateCardExistsAsync(long clientId, int modelId, string locationId, DateTime effectiveFrom, string fhrId, string companyId, int? largeVehicleTypeId = null, int? amazonEdspVehicleTypeId = null);

    }
}
