using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{


    public interface ICityRepository
    {

        Task<Result<List<NameValue>>> GetCityDropdownListbystateAsync(int fk_stateid, string fk_companyId);
        Task<Result<List<NameValue>>> GetCityDropdownListAsync(string fk_stateid);
        public Task<bool> InsertCityAsync(CityMst city);
        public Task<CityMst> GetCityByIdAsync(string pk_cityid);
        public Task<bool> UpdateCityAsync(CityMst city);
        public Task<bool> DeleteCityMstAsync(string pk_cityid);
        public Task<(int totalCount, IEnumerable<CityMst>)> GetAll(int pageIndex, int pageSize, string fk_stateid, string fk_companyId, string searchTerm = "");
        public Task<bool> UpdateAttendanceAsync(UpdateAttendanceModel model);
        Task<Result<List<NameValue>>> GetLocationDropdownListbyZoneAsync(string fk_zoneId, string fk_companyId);



    }
}
