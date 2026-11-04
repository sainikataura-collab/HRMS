using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IShiftRosterRepository
    {
        Task<(int totalCount, IEnumerable<ShiftRosterModel>)> GetAllAsync(int pageIndex, int pageSize, string searchTerm, string companyId);
        Task<ShiftRosterModel?> GetByIdAsync(long rosterId, string companyId);
        Task<Result> InsertAsync(ShiftRosterModel model, string companyId, string userId);
        Task<Result> UpdateAsync(ShiftRosterModel model, string companyId, string userId);
        Task<Result> DeleteAsync(long rosterId, string companyId, string userId);
        Task<IEnumerable<ShiftRosterBulkResultItem>> BulkValidateAndInsertAsync(List<ShiftRosterBulkItem> items, string companyId, string userId);
        Task<IEnumerable<NameValue>> GetEmployeesByCompanyAsync(string companyId);
    }
}
