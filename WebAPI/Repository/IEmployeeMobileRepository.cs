using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeMobileRepository
    {
        public Task<IEnumerable<EmployeeMobile>> GetAllEmployeesAsync(
  string empCode, string empCodeManual,
  string empName, List<string> selectedDepartments, string selectedDesignation,
  List<string> selectedLocations, string selectedNature, string selectedCity,
  string sortBy, string userId, string empStatus);
        
            public Task<bool> UpdateEmployeeMobileAsync(List<EmployeeMobileMst> employeeMobileList, string fk_insUserID, string Fk_LocID);

    }
}
