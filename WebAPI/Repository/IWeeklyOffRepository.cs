using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IWeeklyOffRepository
    {
        public Task<bool> InsertWeeklyOffAsync(List<WeeklyOffMst> weeklyOffMstList, string fk_insUserID, string fk_LocID, string fk_companyId);

        public Task<(int totalCount, IEnumerable<WeeklyOffMst>)> GetAllWeeklyOff(int pageIndex, int pageSize, string fk_companyId);

        public Task<WeeklyOffMst> GetWeeklyOffByIdAsync(string pk_woffid);

        public Task<bool> UpdateWeeklyOffAsync(List<WeeklyOffMst> weeklyOffMstList, string fk_updUserID, string fk_LocID, string fk_companyId);

        public  Task<bool> DeleteWeeklyOffAsync(string pk_woffid);




    }
}
