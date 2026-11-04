using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRolewiseKRAReportRepository
    {

        Task<(int totalCount, IEnumerable<dynamic>)> GetAll(int pageIndex, int pageSize, string? RoleId, string? searchTerm);





    }
}
