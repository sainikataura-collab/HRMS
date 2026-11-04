using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Repository
{
    public interface IStopSalaryRepository
    {

        public Task<StopSalaryProcessModel> GetStopSalaryAsync(
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
            string FkYearId);




        public  Task<(int totalCount, List<ListofEmployeeForstopsalary> result)> GetSalaryStopPaidAsync(
            int pageIndex, int pageSize,
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
            string FkYearId);

        public Task<PayStopSalaryProcessModel> GetSalaryPaidAsync(
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
            string FkYearId);

        public Task<bool> StopSalaryAsync(List<EmpListItem> empList, string fk_monthId, string fk_yearId);
        public  Task<bool> UnStopSalaryAsync(List<EmpListItem> empList, string fk_monthId, string fk_yearId);


        public Task<bool> PayStopSalaryAsync(List<EmpListItem> empList, string fk_monthId, string fk_yearId);



    }


}

