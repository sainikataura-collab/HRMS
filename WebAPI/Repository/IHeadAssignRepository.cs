using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IHeadAssignRepository
    {
        Task<(int totalCount, IEnumerable<HeadAssign>)> GetAllEmployeesAsync(
    int pageIndex, int pageSize, string empCode, string empCodeManual,
    string empName, List<string> selectedDepartments, string selectedDesignation,
    List<string> selectedLocations, string selectedNature, string selectedCity,
    string sortBy);

        Task<bool> UpdateHeadAssignAsync(
            string fk_headid,
            string effectivedate,
            string empCode,
            string empCodeManual,
            string empName,
            List<string> selectedDepartments,
            string selectedDesignation,
            List<string> selectedLocations,
            string selectedNature,
            string selectedCity,
            string fk_insUserID,
            string Overwrite,
            string Fk_LocID);
    }
}
