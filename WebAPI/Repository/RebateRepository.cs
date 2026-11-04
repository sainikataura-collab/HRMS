using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Org.BouncyCastle.Ocsp;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class RebateRepository:IRebateRepository
    {

        public async Task<List<RebateModal>> rebatedocumentDetails(string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<RebateModal>("ESS_Employee_SectionDocStatus_SelForGrid", dynamicParameters, "Employee_SectionDocStatus Details").ToList();
            return result;

        }

        public async Task<Result<List<dynamic>>> sectionDropdownAsync()
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            var result = DataBaseFactory.QuerySP<dynamic>("SAL_Sections_SelForddl_ESS", dynamicParameters, "Sections_SelForddl_ESS");
            var finalResult = new Result<List<dynamic>>
            {
                Data = result.ToList()
            };

            return finalResult;
        }
        public async Task<Result<List<dynamic>>> subsectionDropdownAsync(string pk_secid)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_secid", (object)pk_secid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<dynamic>("SAL_SubSections_SelForddl_ESS", dynamicParameters, "SubSections_SelForddl_ESS");
            var finalResult = new Result<List<dynamic>>
            {
                Data = result.ToList()
            };

            return finalResult;
        }

        public async Task<rebateresponse> InsertRebateDoc(RebateDocStatus rebateDocStatus)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var dataset = new RebateDocStatus
            {

                pk_docid = rebateDocStatus.pk_docid,
                fk_empid = rebateDocStatus.fk_empid,
                fk_secid = rebateDocStatus.fk_secid,
                fk_subsecid = rebateDocStatus.fk_subsecid,
                fk_finid = rebateDocStatus.fk_finid,
                docsub_status = rebateDocStatus.docsub_status,
                docsub_Amt = rebateDocStatus.docsub_Amt,
                billno = rebateDocStatus.billno,
                billdate = rebateDocStatus.billdate,
                remarks = rebateDocStatus.remarks,
                contenttype = rebateDocStatus.contenttype,
                //pk_inoutid = rebateDocStatus.status,
                filename = rebateDocStatus.attachment,
                isApproved = rebateDocStatus.isApproved,
                //isActive = rebateDocStatus.isActive
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Prepare parameters
            dynamicParameters.Add("@XmlDoc", xmlData, DbType.String, ParameterDirection.Input);
            var result = DataBaseFactory.QuerySP<rebateresponse>("EMP_Employee_SectionDocStatus_Ins_New", dynamicParameters, "Employee_SectionDocStatus_Ins_New");

            return result?.FirstOrDefault() ?? new rebateresponse { IsSuccessfull = false };
        }


        public async Task<dynamic> GetById(string pk_docid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_docid", (object)@pk_docid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<dynamic>("SAL_Employee_SectionDocStatus_Edit_New", (object)dynamicParameters, "Employee_SectionDocStatus_Edit_New").FirstOrDefault<dynamic>();
        }


        public async Task<rebateresponse> UpdateRebateDoc(RebateDocStatus rebateDocStatus)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var dataset = new RebateDocStatus
            {

                pk_docid = rebateDocStatus.pk_docid,
                fk_empid = rebateDocStatus.fk_empid,
                fk_secid = rebateDocStatus.fk_secid,
                fk_subsecid = rebateDocStatus.fk_subsecid,
                fk_finid = rebateDocStatus.fk_finid,
                docsub_status = rebateDocStatus.docsub_status,
                docsub_Amt = rebateDocStatus.docsub_Amt,
                billno = rebateDocStatus.billno,
                billdate = rebateDocStatus.billdate,
                remarks = rebateDocStatus.remarks,
                contenttype = rebateDocStatus.contenttype,
                //pk_inoutid = rebateDocStatus.status,
                filename = rebateDocStatus.attachment,
                isApproved = rebateDocStatus.isApproved,
                //isActive = rebateDocStatus.isActive
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Prepare parameters
            dynamicParameters.Add("@XmlDoc", xmlData, DbType.String, ParameterDirection.Input);
            var result = DataBaseFactory.QuerySP<rebateresponse>("EMP_Employee_SectionDocStatus_Upd_New", dynamicParameters, "Employee_SectionDocStatus_Upd_New");

            return result?.FirstOrDefault() ?? new rebateresponse { IsSuccessfull = false };
        }

        //----------------------Tax Computation

        public async Task<List<Taxcomputationresponse>> TaxComputationDetails(string fk_empid,string fk_finid,string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_companyid", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<Taxcomputationresponse>("SAL_IT_Process_Calculator", dynamicParameters, "IT_Process_Calculator Details").ToList();
            return result;

        }

        public async Task<List<dynamic>> getfinancalyear(string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<dynamic>("SAL_Financial_Year_Date", dynamicParameters, "Financial_Year_Date").ToList();
            //var finalResult = new Result<List<dynamic>>
            //{
            //    Data = result.ToList()
            //};
            return result;

        }
        public async Task<(List<dynamic>, List<dynamic>)> GetHeadListAsync(string fk_empid,string pk_headId,string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pk_headId", (object)pk_headId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_HeadList", dynamicParameters, "SAL_Employee_HeadList"  );

            List<dynamic> headdetaillist = new List<dynamic>();
            List<dynamic> headAmountlist = new List<dynamic>();

            if (tuple != null && tuple.Item1 != null)
            {
                headdetaillist = tuple.Item1.ToList(); // Get all rows from first set
            }
            if (tuple != null && tuple.Item2 != null)
            {
                headAmountlist = tuple.Item2.ToList(); // Get all rows from second set
            }


            return (headdetaillist, headAmountlist);
        }

        public async Task<(IEnumerable<dynamic> AmountList, IEnumerable<dynamic> EmployeeList)> GetEmp_Salary_PaySlipAsync(string fk_empid, string fk_monthid, string fk_yearid, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthid", (object)fk_monthid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearid", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fk_companyId);
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Salary_Master_PaySlip", dynamicParameters, "Emp_Salary_Master_PaySlip");

            var amountList = tuple?.Item1?.ToList() ?? new List<dynamic>();
            var employeeList = tuple?.Item2?.ToList() ?? new List<dynamic>();

            return (amountList, employeeList);

        }

        public async Task<(IEnumerable<dynamic>List1, IEnumerable<dynamic>List2)> GetConsolidatedSalaryAsync(string fk_empid,string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Salary_Master_ConsolidatedSalary", dynamicParameters, "Salary_Master_ConsolidatedSalary");

            var List1 = tuple?.Item1?.ToList() ?? new List<dynamic>();
            var List2 = tuple?.Item2?.ToList() ?? new List<dynamic>();

            return (List1, List2);

        }


        public async Task<IEnumerable<dynamic>> GetGetSalarySlipAsync(string fk_empid, string fk_monthid, string fk_yearid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)fk_monthid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic>("EMP_GetSalarySlip", dynamicParameters, "EMP_GetSalarySlip").ToList();

           // var amountList = tuple?.Item1?.ToList() ?? new List<dynamic>();
           // var employeeList = tuple?.Item2?.ToList() ?? new List<dynamic>();

            return (tuple);

        }
    }
}
