using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IHolidayRepository
    {
        public Task<bool> InsertHolidayAsync(List<HolidayMst> holidayMstList, string fk_insUserID, string Fk_LocID, string fk_companyId);

        public Task<(int totalCount, IEnumerable<HolidayMst>)> GetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId);

        public Task<HolidayMst> GetHolidayByIdAsync(string pk_holidayid);

        public Task<bool> DeleteHolidayAsync(string pk_holidayid);

        public Task<bool> UpdateHolidayAsync(HolidayMst HolidayMst, string fk_insUserID, string Fk_LocID, string fk_companyId);


        //for Working day master
        public Task<bool> InsertWorkingDayMasterAsync(List<SAL_Holidays_Mst_WorkingDayMst> Holidays_Mst_WorkingDayList, string fk_insUserID, string Fk_LocID, string fk_companyId);

        public Task<(int totalCount, IEnumerable<SAL_Holidays_Mst_WorkingDayMst>)> WorkingDayMasterGetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId);

        public Task<SAL_Holidays_Mst_WorkingDayMst> GetWorkingDayMasterByIdAsync(string pk_holidayid);

        public Task<bool> DeleteWorkingDayMasterAsync(string pk_holidayid);

        public Task<bool> UpdateWorkingDayMasterAsync(SAL_Holidays_Mst_WorkingDayMst Holidays_Mst_WorkingDayMst, string fk_insUserID, string Fk_LocID, string fk_companyId);

    }

}
