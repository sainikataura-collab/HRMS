using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILocationRepository
    {
        void EnsureTableExists();
        LocationRecord AddLocation(LocationUpdateDto dto);
        IEnumerable<LocationRecord> GetHistory(string? userId = null, int limit = 100);
        LocationStats GetStats();
        void ClearStore();
    }
}
