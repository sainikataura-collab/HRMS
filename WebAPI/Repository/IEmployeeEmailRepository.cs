using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeEmailRepository
    {
        public Task<IEnumerable<EmployeeEmail>> GetAllEmployeesAsync(
 string empCode, string empCodeManual,
 string empName, List<string> selectedDepartments, string selectedDesignation,
 List<string> selectedLocations, string selectedNature, string selectedCity,
 string sortBy, string userId, string empStatus);

        public Task<bool> UpdateEmployeeEmailAsync(List<EmployeeEmailMst> employeeEmailList, string fk_insUserID, string Fk_LocID);

    }
}
