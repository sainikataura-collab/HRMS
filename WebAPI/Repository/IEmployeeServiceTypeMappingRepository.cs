using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeServiceTypeMappingRepository
    {
        Task<Result> InsertAsync(EmployeeServiceTypeMappingModel model, string userId, string companyId);
        Task<Result> UpdateAsync(EmployeeServiceTypeMappingModel model, string userId, string companyId);
        Task<EmployeeServiceTypeMappingModel?> GetByIdAsync(long id, string companyId);
        Task<(int totalCount, IEnumerable<EmployeeServiceTypeMappingModel> list)> GetListAsync(ServiceTypeMappingFilterDto filter, string companyId);
    }
}
