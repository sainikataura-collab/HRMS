using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IleaveTypeClientRepository
    {

        public Task<bool> InsertLeaveTypeAsync(LeavetypeClientMst leaveTypeMaster, List<LeaveTypeClientDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID, string fk_companyId);

        public Task<(int totalCount, IEnumerable<LeavetypeClientMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string? fk_costcentreid = "");
      
        public Task<bool> updateLeaveTypeAsync(LeavetypeClientMst leaveTypeMaster, List<LeaveTypeClientDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID);
        public Task<(LeavetypeClientMst, List<LeaveTypeClientDetails>)> GetLeaveTypeById(long pk_leaveid, string? fk_natureid);

        public Task<bool> Delete(long pk_leaveid);


        Task<Result<List<NameValue>>> LeaveTypeClientWiseAsync(string? fk_costcentreid, string fk_companyId);




    }
}
