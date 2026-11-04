using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IRebateRepository
    {
        Task<List<RebateModal>> rebatedocumentDetails(string EmpId);
        Task<Result<List<dynamic>>> sectionDropdownAsync();
        Task<Result<List<dynamic>>> subsectionDropdownAsync(string pk_secid);
        Task<rebateresponse> InsertRebateDoc(RebateDocStatus rebateDocStatus);
        Task<dynamic> GetById(string pk_docid);
        Task<rebateresponse> UpdateRebateDoc(RebateDocStatus rebateDocStatus);


        ///-------------Tax Computation

        Task<List<Taxcomputationresponse>> TaxComputationDetails(string fk_empid, string fk_finid, string fk_companyId);
        Task<List<dynamic>> getfinancalyear(string fk_finid);
        Task<(List<dynamic>, List<dynamic>)> GetHeadListAsync(string fk_empid, string pk_headId, string fk_finid);
        Task<(IEnumerable<dynamic> AmountList, IEnumerable<dynamic> EmployeeList)> GetEmp_Salary_PaySlipAsync(string fk_empid, string fk_monthid, string fk_yearid, string fk_companyId);
        Task<(IEnumerable<dynamic> List1, IEnumerable<dynamic> List2)> GetConsolidatedSalaryAsync(string fk_empid, string fk_finid);

        Task<IEnumerable<dynamic>> GetGetSalarySlipAsync(string fk_empid, string fk_monthid, string fk_yearid);
    }
}
