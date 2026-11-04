using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISalaryLockUnlockRepository
    {
        Task<(int salarylockedcount, int salaryunlockcount, salarylockunlockModel result)>
    GetsalarylockAsync(
    int pageIndex1, int pageSize1,
    int pageIndex2, int pageSize2,
    string empCode,
    string empCodeManual,
    string empName,
    List<string> selectedDepartments,
    string selectedDesignation,
    List<string> selectedLocations,
    string selectedNature,
    string selectedCity,
    string sortBy,
    string FkMonthId,
    string FkYearId,
    string fk_costcentreid
            );


        Task<bool> UpdateForSalaryUnLockAsync(string fk_insUserID, string Fk_LocID, SalaryLockUnlockRequest request);
        Task<bool> UpdateForSalaryLockAsync(string fk_insUserID, string Fk_LocID, string fk_companyId, SalaryLockUnlockRequest request);
        //salary approved

        //     Task<(int salaryApprovedcount, int salaryDisapprovecount, salaryApprovedModel result)>
        //GetsalaryApprovedList(
        //int pageIndex1, int pageSize1,
        //int pageIndex2, int pageSize2,
        //string empCode,
        //string empCodeManual,
        //string empName,
        //List<string> selectedDepartments,
        //string selectedDesignation,
        //List<string> selectedLocations,
        //string selectedNature,
        //string selectedCity,
        //string sortBy,
        //string FkMonthId,
        //string FkYearId,
        //string fk_costcentreid
        //        );
        public Task<(int disapprovedCount, int approvedCount,
               List<dynamic> disapprovedList, List<dynamic> approvedList)>
    GetsalaryApprovedList(
    int pageIndex1, int pageSize1,
    int pageIndex2, int pageSize2,
    string empCode,
    string empCodeManual,
    string empName,
    List<string> selectedDepartments,
    string selectedDesignation,
    List<string> selectedLocations,
    string selectedNature,
    string selectedCity,
    string sortBy,
    string fkMonthId,
    string fkYearId,
    string fkCostCentreId
    );



        Task<bool> DisapproveSalaryEmplyeelist(string fk_insUserID, string Fk_LocID, SalaryApprovedRequest request);

        Task<bool> approveSalaryEmplyeelist(string fk_insUserID, string Fk_LocID, string fk_companyId, SalaryApprovedRequest request);

    }
}
