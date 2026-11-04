using HRMSWebAPI.Models;
namespace HRMSWebAPI.Repository
{
    public interface IEmpWeekOffRepository
    {
        public Task<bool> InsertEmpWeeklyOffAsync(List<EmpWeekOffMst> empWeekOffMstList, string fk_insUserID, string fk_LocID);

        public Task<(int totalCount, IEnumerable<EmpWeekOffMst>)> GetAllEmpWeeklyOff(int pageIndex, int pageSize, string fk_LocID);

        public Task<EmpWeekOffMst> GetEmpWeeklyOffByIdAsync(string pk_empwoffid);

        public Task<bool> UpdateEmpWeeklyOffAsync(List<EmpWeekOffMst> empWeekOffMstList, string fk_updUserID, string fk_LocID);
        public Task<bool> DeleteEmpWeeklyOffAsync(string pk_empwoffid);




    }
}
