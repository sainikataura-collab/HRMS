using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static HRMSWebAPI.Models.FlexibillApproval;

namespace HRMSWebAPI.Repository
{
    public class FlexibillRepository: IFlexibillRepository
    {

      
        public async Task<FlexiBillProcessModel> GetFlexiBillsAsync(
        string empCode,
        List<string> selectedDepartments,
        List<string> SelectedLocations,      
        string empName,
        string leftStatus,
        string fkCompanyId,
        string fkEmpId,
        string fkFinId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@ecode", empCode, DbType.String);
            dynamicParameters.Add("@location", SelectedLocations[0], DbType.String);
            dynamicParameters.Add("@department", selectedDepartments[0], DbType.String);
            dynamicParameters.Add("@ename", empName, DbType.String);
            dynamicParameters.Add("@leftstatus", leftStatus, DbType.String);
            dynamicParameters.Add("@fk_companyId", fkCompanyId, DbType.String);
            dynamicParameters.Add("@fk_empid", fkEmpId, DbType.String);
            dynamicParameters.Add("@fk_finid", fkFinId, DbType.String);
            var tuple = DataBaseFactory.QueryMultipleSP<FlexiBillModel,FlexiBillModel>(
                "SAL_Employee_SearchForFlexiBill_ForGrid", dynamicParameters, "GetAll");

            var result = new FlexiBillProcessModel
            {
                PendingBills = tuple.Item1?.ToList() ?? new List<FlexiBillModel>(),
                ApprovedBills = tuple.Item2?.ToList() ?? new List<FlexiBillModel>()
            };

            return result;
        }



        public async Task<bool> InsertApprovalAsync(ApprovalRootDataSet approvalDataSet)
        {
            DynamicParameters parameters = new DynamicParameters();

            // Convert object to XML string
            string xmlData = XmlUtility.XmlSerializeToString(approvalDataSet);
            parameters.Add("@Doc", xmlData, DbType.String);
            // Execute the stored procedure
            int result = DataBaseFactory.QuerySP("SAL_EmployeeFlexiHeadBills_Mst_Approval_Ins", parameters, "SAL_EmployeeFlexiHeadBills_Mst_Approval_Ins");
            return result > 0;
        }

        public async Task<GetByIdModel> GetByIdAsync(long? flexiheadnillId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_flexibillId", (object)flexiheadnillId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<GetByIdModel>("SAL_FlexiHeadBill_View_ById", (object)dynamicParameters, "FlexiHeadBill_View_ById - GetById").FirstOrDefault<GetByIdModel>();
        }


    }
}
