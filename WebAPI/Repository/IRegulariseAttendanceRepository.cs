using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRegulariseAttendanceRepository
    {

        Task<(dynamic Summary, List<dynamic> Logs)> EMPAttendanceDashNew(string Month, string Year, string EmpId);
        public Task<ModelResponse> InsertCDOAsync(CDORequestList data);
       Task<bool> InsertRegulariseAttendanceAsync(RegulariseAttendanceMstDataSet data);

        Task<(bool isSuccess, string message)> DeleteAttendanceRegularisationAsync(long pk_inoutid);

        Task<IEnumerable<dynamic>> GetAllRegulariseAttendanceByEmpAsync(string fk_empid,int? month, int? year);
        Task<Result<List<RegularisationDateddl>>> GetRegularisationDateDropdownAsync(string empId, string? flag);

        Task<Result<List<AttendanceInOutRegularisationGetTime>>> GetInOutTimeByInoutIdAsync(string empId, long pk_inoutid);


        Task<EMP_Attendance_DetailsMain> EMPAttendanceDetails(string Month, string Year, string EmpId);
        Task<Result<List<NameValue>>> GetEmployeeNameDropdownList(string EmpId);

        Task<List<EMPAttendanceDash>> EMPAttendanceDash(string Month, string Year, string EmpId);



    }
}
