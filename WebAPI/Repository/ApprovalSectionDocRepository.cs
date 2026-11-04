using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ApprovalSectionDocRepository : IApprovalSectionDocRepository
    {
        public async Task<FullSectionDocList> GetEmployeeSearchForSectionDoc(
            string ecode,
            string location,
            string department,
            string ename,
            string leftstatus,
            string fk_companyId,
            string fk_empid,
            string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@ecode", (object)ecode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@location", (object)location, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@department", (object)department, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ename", (object)ename, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@leftstatus", (object)leftstatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Call the stored procedure
            var tuple = DataBaseFactory.QueryMultipleSP<ApprovalSectionDocMst, ApprovalSectionDocMst>("SAL_Employee_SearchForSectionDoc_ForGrid", dynamicParameters, "Employee_SearchForSectionDoc");
            List<ApprovalSectionDocMst> pendingSectionDocMsts = [];
            List<ApprovalSectionDocMst> approvalSectionDocMsts = [];


            if (tuple != null && tuple.Item1 != null)
            {
                pendingSectionDocMsts = tuple.Item1.ToList();
            }

            if (tuple != null && tuple.Item2 != null)
            {
                approvalSectionDocMsts = tuple.Item2.ToList();
            }

            FullSectionDocList list = new FullSectionDocList();
            list.pendingSectionDocMsts = pendingSectionDocMsts;
            list.approvalSectionDocMsts = approvalSectionDocMsts;

            return list;
           
        }
        public async Task<bool> InsertApprovalSectionDocAsync(List<ApprovalSectionDocMst> approvalList)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Step 1: Wrap in XML dataset
            ApprovalSectionDocMstDataSet dataset = new ApprovalSectionDocMstDataSet
            {
                ApprovalSectionDoc = approvalList
            };

            // Step 2: Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Step 3: Add XML as parameter
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Step 4: Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Step 5: Call SP using Dapper
            int result = await DataBaseFactory.QuerySPAsync("SAL_Employee_SectionDocStatus_Approval_Ins", dynamicParameters,"Insert_ApprovalSectionDoc");

            // Step 6: Return true if insert/update success
            return result > 0;
        }




    }
}
