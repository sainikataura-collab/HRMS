using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IleaveAssignmentRepository
    {
        Task<ModelResponse> LeaveAssignmentValidateAsync(long? leaveId, string empId);
        Task<EmpdetailMst> GetEmployeeLeaveDetailsAsync(string pkEmpId);
        Task<LeaveAssignmentMst> LeaveAssignmentAsync(long leaveId,string empId);

        //for insert leave
        public Task<bool> InsertEmployeeLeaveAsync(List<LeaveDetailMst> leaveDetailMstList, string Fk_UserID, string Fk_LocID);
        //for get all leave

        public Task<(int totalCount, IEnumerable<LeaveDetailMst>)> GetAll(int pageIndex, int pageSize, string employeeId);

        //get by id
       Task<LeaveDetailMst> GetLeaveAssignmentByIdAsync(string assignId);
        //delete
        Task<bool> DeleteLeaveAssignment(string pk_assignid);

        //update
        Task<bool> UpdateLeaveAssignmentAsync(LeaveDetailMst leaveDetailMstList,string fk_userID, string fk_locID);



    }
}
