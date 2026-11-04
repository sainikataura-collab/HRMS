using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICTCRepository
    {
      Task<(List<CTCMst>, List<CTCMstGross>)> GetEmployeeCTCDetailAsync(string empId, string companyId);

        Task<(int totalCount, List<dynamic>, List<dynamic>)> GetAllEmployeeCTCDetailAsync(string empCode, string empCodeManual,
string empName, List<string> selectedDepartments, string selectedDesignation,
List<string> selectedLocations, string selectedNature, string selectedCity,
string sortBy, string userId, string empStatus, string fk_costcentreid, string companyId,
int pageIndex = 0, int pageSize = 10);

    }
}
