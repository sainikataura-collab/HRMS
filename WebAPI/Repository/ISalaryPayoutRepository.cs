using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISalaryPayoutRepository
    {
        Task<(
            int pendingCount,
            int paidOutCount,
            List<dynamic> pendingList,
            List<dynamic> paidOutList,
            List<dynamic> batchList)>
        GetSalaryPayoutListAsync(
            string empCode, string empCodeManual, string empName,
            List<string> selectedDepartments, string selectedDesignation,
            List<string> selectedLocations, string selectedNature,
            string selectedCity, string sortBy,
            string fkMonthId, string fkYearId, string fkCostCentreId,
            string? filterBatchKey = null,
            int pendingPageIndex = 0, int pendingPageSize = 10,
            int paidOutPageIndex = 0, int paidOutPageSize = 10,
            string pendingSearchTerm = "", string paidOutSearchTerm = "");

        Task<(bool success, string batchKey, int affectedRows, int batchId)>
        ProcessSalaryPayoutAsync(
            string fkInsUserId, string fkLocId, string fkCompanyId,
            SalaryPayoutRequest request);

        Task<(bool success, int affectedRows)>
        ProcessSalaryUnPayoutAsync(
            string fkInsUserId,
            SalaryUnPayoutRequest request);
    }
}
