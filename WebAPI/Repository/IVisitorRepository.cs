using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IVisitorRepository
    {
        Task<(int totalCount, IEnumerable<VisitorMst>)> GetAllVisitorsAsync(int pageIndex, int pageSize);

    }

}