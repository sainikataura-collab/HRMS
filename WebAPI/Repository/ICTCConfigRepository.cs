using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICTCConfigRepository
    {
        Task<bool> InsertCTCConfigAsync(CTCConfigSaveRequest request, string userId, string locId, string companyId);
        Task<(int totalCount, IEnumerable<CTCConfigMst>)> GetAll(int pageIndex, int pageSize, string companyId, string searchTerm = "");
        Task<CTCConfigMst> GetCTCConfigByIdAsync(string configId, string companyId);
        Task<bool> UpdateCTCConfigAsync(CTCConfigSaveRequest request, string userId, string locId);
        Task<bool> DeleteCTCConfigAsync(long configId);
        Task<IEnumerable<CTCConfigComponent>> GetHeadsByType(string companyId);
    }
}
