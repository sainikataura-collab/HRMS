using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEMPFlexiSalaryRepository
    {

        Task<bool> InsertEmployeeFlexiHeadBillAsync(SAL_EmployeeFlexiHeadBills_Mst flexiSalaryDataSet);

        Task<IEnumerable<SAL_EmployeeFlexiHeadBills_MstGetall>> GetEmployeeFlexiHeadBillsAsync(string empId, string companyId);

        Task<Result<List<NameValueFlexi>>> GetFlexiHeadDropdownAsync(string fk_empid, string companyId);

        Task<FlexiBillValidationResult?> ValidateFlexiBillAsync(string empId, string headId, string billDate, decimal billAmt);

        Task<bool> DeleteFlexiBillAsync(long pk_flexibillId);




    }
}
