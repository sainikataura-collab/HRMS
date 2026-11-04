using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILeaveTypeRepository
    {
        public Task<bool> InsertLeaveTypeAsync(LeavetypeMst leaveTypeMaster, List<LeaveTypeDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID, string fk_companyId);

        //public Task<bool> InsertLeaveTypeAsync(LeaveTypeMstDataSet leaveTypeList, string Fk_UserID, string Fk_LocID, string fk_companyId);
        //public Task<bool> UpdateLeave(LeaveTypeMstDataSet leaveTypeList, string Fk_UserID, string Fk_LocID);
        public Task<(int totalCount, IEnumerable<LeavetypeMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        //Task<(LeavetypeMst, LeaveTypeDetails)> GetLeaveTypeById(long pk_leaveid);
        //public  Task<(LeavetypeMst, List<LeaveTypeDetails>)> GetLeaveTypeById(long pk_leaveid);

        public Task<bool> updateLeaveTypeAsync(LeavetypeMst leaveTypeMaster, List<LeaveTypeDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID);
        public  Task<(LeavetypeMst, List<LeaveTypeDetails>)> GetLeaveTypeById(long pk_leaveid, string? fk_natureid);

        //public Task<LeaveDetails> GetLeaveTypeByIdAsync(long fk_leaveid, string fk_empid);

        public Task<bool> Delete(long pk_leaveid);



        //Task<bool> InsertLeaveTypeAsync(LeaveTypeMstDataSet leaveDataSet, List<LeavetypeMst> leaveTypeMaster, List<LeaveTypeDetails> leaveTypeDetails, string Fk_UserID, string Fk_LocID, string fk_companyId);


    }
}
