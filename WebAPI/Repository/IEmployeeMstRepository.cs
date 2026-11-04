//using HRMSWebAPI.Models;

//namespace HRMSWebAPI.Repository
//{
//    public interface IEmployeeMstRepository
//    {
//        public Task<InsertEmployeeResult> InsertEmployeeAsync(EmployeeMstDataSet employeeList, EmployeeMst employee, EmployeeOtherDetails employeeOther, string Fk_UserID, string Fk_LocID, string fk_companyId);



//        public Task<bool> UpdateEmployeeAttendanceAsync(EmployeeAttendanceMst employeeAttendanceMst, string Fk_UserID, string Fk_LocID, string fk_companyId);

//        public Task<(int totalCount, IEnumerable<EmployeeMaster>)> GetAllEmployeesAsync(
//   int pageIndex, int pageSize, string empCode, string empCodeManual,
//   string empName, List<string> selectedDepartments, string selectedDesignation,
//   List<string> selectedLocations, string selectedNature, string selectedCity,
//   string sortBy, string userId, string empStatus);

//        public Task<(EmployeeMst, EmployeeOtherDetails)> GetEmployeeByIdAsync(string pk_empid);

//        public Task<bool> UpdateEmployeeAsync(EmployeeMstDataSet employeeList, EmployeeMst employee, EmployeeOtherDetails employeeOther,string Fk_UserID, string Fk_LocID, string fk_companyId);

//        public Task<EmployeeOtherDetailsMst> GetEmployeeOtherDetailsAsync(string pk_empid);
//        public Task<(EmployeeHeadMst, List<EmployeeHeadDetails>, List<EmployeeHeadDetails>)> GetEmployeeHeadDetailsAsync(string pk_empid);

//        public Task<bool> UpdateEmployeeOtherDetailsAsync(EmployeeOtherDetailsMst employeeOtherDetailsMst, string Fk_UserID, string Fk_LocID, string fk_companyId);
//        public Task<(List<SalHeadAmountResponse>, List<SalHeadAmountResponse>)> GetSalHeadAmountAsync(SalHeadAmountRequest request, string fk_companyId);

//        public  Task<bool> UpdateEmployeeHeadDetailsAsync(
//     EmployeeHeadMstDataSet employeeHeadMstDataSet,
//     List<EmployeeHeadDetails> employeeHeadDetails, EmployeeHeadMst employeeHeadMst,
//     string Fk_UserID,
//     string fk_companyId);




//        //---------subdept----------------------

//        public Task<Result<List<NameValue>>> GetSubDeptDropdownList(string fk_deptid, string userId, string companyId);


//        Task<(EmployeeAttendanceMst, List<EmployeeShiftIns>, List<AttendanceLocation>)> GetEmployeeAttendanceByIdAsync(string fk_empid);
//        //-----Employee Shift--------------

//        //public Task<bool> InsertEmpShift(EmployeeShiftIns employeeShiftIns);
//        public Task<bool> InsertEmpShift(List<EmployeeShiftIns> employeeShiftIns);
//        public Task<bool> UpdateEmpShift(List<EmployeeShiftIns> employeeShiftIns);






//    }
//}


using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeMstRepository
    {
        public Task<InsertEmployeeResult> InsertEmployeeAsync(EmployeeMstDataSet employeeList, EmployeeMst employee, EmployeeOtherDetails employeeOther, string Fk_UserID, string Fk_LocID, string fk_companyId);

        //public Task<bool> InsertEmployeeMstAsync(EmployeeMst employeeMst, string Fk_UserID, string Fk_LocID, string fk_companyId);
        //public Task<EmployeeAttendanceMst> GetEmployeeAttendanceByIdAsync(string pk_empid);
        // Task<(EmployeeAttendanceMst, List<EmployeeShiftIns>)> GetEmployeeAttendanceByIdAsync(string fk_empid);
        Task<(EmployeeAttendanceMst, List<EmployeeShiftIns>, List<AttendanceLocation>)> GetEmployeeAttendanceByIdAsync(string fk_empid);




        public Task<bool> UpdateEmployeeAttendanceAsync(EmployeeAttendanceMst employeeAttendanceMst, string Fk_UserID, string Fk_LocID, string fk_companyId);

        //     public Task<(int totalCount, IEnumerable<EmployeeMaster>)> GetAllEmployeesAsync(
        //int pageIndex, int pageSize, string empCode, string empCodeManual,
        //string empName, List<string> selectedDepartments, string selectedDesignation,
        //List<string> selectedLocations, string selectedNature, string selectedCity,
        //string sortBy, string userId, string empStatus,string fk_costcentreid);

        // replace this     

        Task<(int totalCount, IEnumerable<EmployeeMaster>, object counts)> GetAllEmployeesAsync(
     int pageIndex, int pageSize, string empCode, string empCodeManual,
     string empName, List<string> selectedDepartments, string selectedDesignation,
     List<string> selectedLocations, string selectedNature, string selectedCity,
     string sortBy, string userId, string empStatus, string fk_costcentreid, string? searchTerm, string statFilter);


        public Task<(EmployeeMst, EmployeeOtherDetails)> GetEmployeeByIdAsync(string pk_empid);

        public Task<bool> UpdateEmployeeAsync(EmployeeMstDataSet employeeList, EmployeeMst employee, EmployeeOtherDetails employeeOther, string Fk_UserID, string Fk_LocID, string fk_companyId);

        public Task<EmployeeOtherDetailsMst> GetEmployeeOtherDetailsAsync(string pk_empid);
        public Task<(EmployeeHeadMst, List<EmployeeHeadDetails>, List<EmployeeHeadDetails>)> GetEmployeeHeadDetailsAsync(string pk_empid);

        public Task<bool> UpdateEmployeeOtherDetailsAsync(EmployeeOtherDetailsMst employeeOtherDetailsMst, string Fk_UserID, string Fk_LocID, string fk_companyId);
        public Task<(List<SalHeadAmountResponse>, List<SalHeadAmountResponse>)> GetSalHeadAmountAsync(SalHeadAmountRequest request, string fk_companyId);

        public Task<bool> UpdateEmployeeHeadDetailsAsync(
     EmployeeHeadMstDataSet employeeHeadMstDataSet,
     List<EmployeeHeadDetails> employeeHeadDetails, EmployeeHeadMst employeeHeadMst,
     string Fk_UserID,
     string fk_companyId);




        //---------subdept----------------------

        public Task<Result<List<NameValue>>> GetSubDeptDropdownList(string fk_deptid, string userId, string companyId);


        //-----Employee Shift--------------

        //public Task<bool> InsertEmpShift(EmployeeShiftIns employeeShiftIns);
        public Task<bool> InsertEmpShift(List<EmployeeShiftIns> employeeShiftIns);
        public Task<bool> UpdateEmpShift(List<EmployeeShiftIns> employeeShiftIns);

        Task<(int totalCount, IEnumerable<EmployeeAuditLogDTO>)> GetTabAuditLogsAsync(string documentId, string documentName, int pageIndex, int pageSize, string? entryBy = null, string? fieldName = null);





    }
}