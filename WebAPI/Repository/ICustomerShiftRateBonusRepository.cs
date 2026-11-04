using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICustomerShiftRateBonusRepository
    {
        Task<Result> InsertAsync(CustomerShiftRateBonusModel model, string userId, string locationId, string companyId);
        Task<Result> BulkInsertAsync(List<CustomerShiftRateBonusModel> list, string userId, string locationId, string companyId);
        Task<Result> UpdateAsync(CustomerShiftRateBonusModel model, string userId, string locationId, string companyId);
        Task<Result> DeleteAsync(long id, string userId, string companyId);
        Task<CustomerShiftRateBonusModel?> GetByIdAsync(long id, string companyId);
        Task<(int totalCount, IEnumerable<CustomerShiftRateBonusModel> list)> GetListAsync(CustomerShiftRateBonusFilterDto filter, string companyId);
        Task<IEnumerable<CustomerShiftRateBonusDropdownItem>> GetLocationsByClientAsync(string clientId, string companyId);
        Task<IEnumerable<CustomerShiftRateBonusDropdownItem>> GetClientsByLocationAsync(string locationId, string companyId);
    }
}
