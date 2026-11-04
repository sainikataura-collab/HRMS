using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IZoneRepository
    {
        public Task<bool> InsertZoneAsync(ZoneMst zone);
        public Task<(int totalCount, IEnumerable<ZoneMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public Task<ZoneMst> GetZoneByIdAsync(string zoneId);
        public  Task<bool> DeleteZoneMstAsync(string zoneId);
        public Task<bool> UpdateZoneAsync(ZoneMst zone);


    }
}
