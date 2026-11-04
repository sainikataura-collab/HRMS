using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public interface IEmp_LeaveRequestRepository

    {
        // added by pp
        Task<dynamic> ApproveOrRejectAttendance(long pk_inoutid, int approvalOrder);
        Task<dynamic> ApproveOrRejectShortLeave(string pk_shortLeaveId, int approvalOrder);

        Task<ModelResponse> InsertLeaveTypeAsync(SAL_Leave_Apply sAL_Leave_Apply, List<SAL_Leave_Apply_Details> sAL_Leave_Apply_Details);
        Task<(int totalCount, IEnumerable<dynamic>)> GetAllEmp_LeaveReqAsync(
            int pageIndex, int pageSize, string decryptedUserId, string? fk_finid,
    string? status, int? month, int? year);
        Task<Emp_leaveTakenLeaveBalance> GetLeaveBalance(string fk_empid, long fk_leaveid);
        Task<(List<LeaveDates>, Datefrom, LeaveTypeDetail)> EmpLeavesOnDates(string fk_empid, long fk_leaveid, DateTime datefrom, DateTime dateto);
        Task<(int totalCount, IEnumerable<dynamic>)> GetAllEmp_LeaveDetailsAsync(
          int pageIndex, int pageSize, string decryptedUserId, string? fk_finid, int? month, int? year);
        Task<List<dynamic>> GetViewLeaveBalance(string fk_empid);
        Task<string> leavetypebalancevalidation(string fk_empId, string fk_leaveId, long tobeapply);

        //OD Request

        Task<List<dynamic>> GetAll_ApprovalCompOffAsync(string EmpId);
        Task<List<dynamic>> GetAll_Approval_ShortLeaveAsync(string EmpId);
        Task<LeaveInsertResponse> InsertODLeaveAsync(LeaveModule sAL_Leave_Apply);

        //Approve Regularization

        Task<IEnumerable<dynamic>> GetAll(string fk_empid);
        Task<dynamic> GetById(string pk_inoutid);
        Task<LeaveInsertResponse> approveRegularizationAsync(AttendanceRegularizationApproval regularizationApproval);

        //Shiv

        Task<ModelResponse> Insert_ApprovalLeaveAsync(LeaveApprovalModel model, string fk_approvedby);
        Task<ModelResponse> Insert_shortLeaveReqMstAsync(LeaveModule model);
        Task<List<ShortLeaveModel>> GetAll_shortLeaveReqMstAsync(string EmpId, int? month, int? year);
        Task<ShortLeaveViewModel> ApplyShortLeaveByIdAsync(string pk_shortLeaveId);
        Task<List<ApprovalShortLeaveModel>> GetAll_ApprovalShortLeaveAsync(string EmpId);
        Task<bool> Insert_ApprovalshortLeaveReqMstAsync(ShortLeaveApprovalModel model);
        Task<List<LeaveApprovalOdModel>> ApprovalLeaveAsync(string fk_approvedby);
        Task<List<LeaveApprovedModelList>> LeaveApprovedModelListAsync(string fk_approvedby);
        Task<string> ValidateLeaveTakenDateNew(string fk_empid, long fk_leaveid, DateTime datefrom, DateTime dateto);
        public Task<(bool isSuccess, string message)> DeleteLeaveAsync(string pk_leaveappid);
        public Task<(bool isSuccess, string message)> DeleteShortLeaveAsync(string pk_shortLeaveId);


        // for admin ADDED BY PP 
        Task<List<dynamic>> GetAll_AdminApprovalAsync();


        Task<List<dynamic>> GetApprovedLeavesAsync(int? fk_leaveId, string fk_empid, DateTime? fromDate, DateTime? toDate);

        public Task<(bool isSuccess, string message)> RejectLeaveAsync(string requestType, string requestId);
    }


}