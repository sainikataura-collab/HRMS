using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeRepository
    {
        public Task<(int totalCount, IEnumerable<Employee>)> GetAllEmployeesAsync(
    int pageIndex, int pageSize, string empCode, string empCodeManual,
    string empName, List<string> selectedDepartments, string selectedDesignation,
    List<string> selectedLocations, string selectedNature, string selectedCity,
    string sortBy, string userId, string empStatus);


        public Task<IEnumerable<NameValue>> GetEmployeesForDropdownAsync(
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string userId,
string empStatus);




        //Imgae Upload

        Task<int> ImageUploadAsync(EmployeeImageMeta employeeImageMeta);
        Task<(int totalCount, IEnumerable<EmployeeImageItem>)> GetEmployee_ImageAsync(int pageIndex, int pageSize);
        Task<bool> Del_Employee_ImageAsync(string imgId);



        // Add code on 23 june
        Task<dynamic> GetEmployeeInfoForAttendanceMarkAsync(string empId);

        Task<(bool IsSuccessful, string ErrorMessage)> InsertEmployeeAttendance(MarkEmployeeAttendance attendance);


        Task<dynamic> GetEmployeeProfileViewAsync(string empId);

        public Task<IEnumerable<NameValue>> GetEmployeesForDropdownAsyncfor50(
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string userId,
string empStatus,
string search,
int pageNo,
int pageSize);

    }
}
