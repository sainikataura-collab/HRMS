using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeDebitCardRepository
    {

        public  Task<IEnumerable<EmployeeDebitCard>> GetAllEmployeesAsync(
   string empCode, string empCodeManual,
   string empName, List<string> selectedDepartments, string selectedDesignation,
   List<string> selectedLocations, string selectedNature, string selectedCity,
   string sortBy, string userId, string empStatus);

        public Task<bool> UpdateEmployeeDebitCardAsync(List<EmployeeDebitCardMst> employeeDebitCardList, string fk_insUserID, string Fk_LocID);

    }
}
