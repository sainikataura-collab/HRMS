using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRestric_HolidayRepository
    {
          // for insert 
            public Task<bool> InsertRes_HolidayAsync(List<Restric_Holiday> res_HolidayMstList, string fk_insUserID, string Fk_LocID, string fk_companyId);
        // for display
        public Task<(int totalCount, IEnumerable<Restric_Holiday>)> GetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId);
        // for display by  id
       public Task<Restric_Holiday> GetRes_HolidayByIdAsync(string pk_holidayid);
        // for delete
        public Task<bool> DeleteRes_HolidayAsync(string pk_holidayid);
        // for update
        public Task<bool> UpdateRes_HolidayAsync(Restric_Holiday ResHolidayMst, string fk_insUserID, string Fk_LocID, string fk_companyId);


       

    }
}
