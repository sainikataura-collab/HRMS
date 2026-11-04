using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDemographicRepository
    {
        public Task<(int totalCount, IEnumerable<Employee>)> GetAllDemographic(
          int pageIndex, int pageSize, string empCode, string empCodeManual,
            string empName, List<string> selectedDepartments, string selectedDesignation,
            List<string> selectedLocations, string selectedNature, string selectedCity,
            string sortBy, string userId, string empStatus, string searchTerm = "");

        public Task<DemographicMst> GetDemographicByIdAsync(string fk_empid);

        //public Task<bool> UpdateDemographicAsync(List<DemographicMst> demographicMstList, List<DemographicMstFamily> familyMstList, string fk_updUserID, string fk_LocID);

        public Task<bool> UpdateDemographicAsync(List<DemographicMst> demographicMstList, List<DemographicMstFamily> familyList, string fk_updUserID, string fk_LocID); 


  //      public Task<bool> UpdateDemographicAsync(List<DemographicMst> demographicMstList, string fk_updUserID,
  //string fk_LocID);
    }
}
