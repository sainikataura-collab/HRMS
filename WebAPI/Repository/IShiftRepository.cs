using HRMSWebAPI.Models;


namespace HRMSWebAPI.Repository
{
    public interface IShiftRepository
    {
        public Task<bool> InsertShiftMstAsync(ShiftMst shifts);
       // public  Task<bool> UpdateShiftMstAsync(ShiftMst shiftmst, List<ShiftMst> shifts);
        public Task<bool> UpdateShiftMstAsync(ShiftMst shiftmst);
        public  Task<ShiftMst> GetShiftByIdAsync(string shiftId);
        public Task<(int totalCount, IEnumerable<ShiftMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public Task<bool> DeleteZoneMstAsync(long pk_zoneId);


    }
}
