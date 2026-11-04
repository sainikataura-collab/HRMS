using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILeaveTransactionRepository
    {

        public Task<(int totalCount, IEnumerable<LeaveTakenDetails>)> GetAllLeaveTaken(int pageIndex, int pageSize, string fk_empid);

        public Task<(EmployeeDetailsModel, List<EmployeeLeaveDetailsModel>)> GetEmployeeLeaveDetails(string fk_empid);
        public Task<leaveTakenLeaveBalance> GetLeaveBalance(string fk_empid, long fk_leaveid);


        public Task<PendingLeaveResult> GetPendingLeave(string userId, string fk_companyId);


        public Task<ModelResponse> InsertLeaveTypeAsync(SAL_LeavesTaken_Mst leaveTakenMst, List<SAL_LeavesTaken_Details> leaveTakenDetailsList, string Fk_UserID, string Fk_LocID);
        public Task<bool> UpdateLeaveTakenAsync(SAL_LeavesTaken_Mst leaveTakenMst, List<SAL_LeavesTaken_Details> leaveTakenDetailsList, string fkUserID, string fkLocID);




        public Task<(EmpDetailsModelGetDataforUpd, SAL_LeavesTaken_Mst, List<EmplLeaveDetailGetDataforUpd>)> GetById(string pk_LeavetakenId);

        public Task<bool> Delete(string pk_leavetakenid, string Fk_UserID, string Fk_LocID);

        public Task<(List<LeaveDates>, Datefrom, LeaveTypeDetail)> EmpLeavesOnDates(string fk_empid, long fk_leaveid, DateTime datefrom, DateTime dateto);




        public Task<ModelResponse> approvePendingLeave(long pk_leaveappid, string fkUserID, string fkLocID);
        public Task<ModelResponse> DeleteLeavePendingMstAsync(long Pk_LeaveappId);

        public Task<string> ValidateLeaveTakenDateNew(string fk_empid, long fk_leaveid, DateTime datefrom, DateTime dateto);




    }
}
