using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Org.BouncyCastle.Asn1.Ocsp;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class leaveTypeClientRepository:IleaveTypeClientRepository
    {

        public async Task<(int totalCount, IEnumerable<LeavetypeClientMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string? fk_costcentreid = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LeavetypeClientMst>("SAL_LeaveTypeClient_SelForGrid", dynamicParameters, "LeaveTypeClient_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<bool> InsertLeaveTypeAsync(LeavetypeClientMst leaveTypeMaster, List<LeaveTypeClientDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in the required dataset structure
            LeavetypeClientMstDataSet dataset = new LeavetypeClientMstDataSet
            {
                LeaveTypeMaster = leaveTypeMaster,
                LeaveTypeDetails = leaveTypeDetailsList
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            //dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_LeaveTypeClient_Ins", dynamicParameters, "LeaveType_Insert");

            return result > 0;
        }




        public async Task<bool> updateLeaveTypeAsync(LeavetypeClientMst leaveTypeMaster, List<LeaveTypeClientDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in the required dataset structure
            LeavetypeClientMstDataSet dataset = new LeavetypeClientMstDataSet
            {
                LeaveTypeMaster = leaveTypeMaster,
                LeaveTypeDetails = leaveTypeDetailsList
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            dynamicParameters.Add("@Pk_leaveid", (object)leaveTypeMaster.pk_leaveid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            //dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)dataset.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_LeaveTypeClient_Upd", dynamicParameters, "LeaveType_Insert");

            return result > 0;
        }




        public async Task<(LeavetypeClientMst, List<LeaveTypeClientDetails>)> GetLeaveTypeById(long pk_leaveid, string? fk_natureid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_leaveid", pk_leaveid, DbType.Int64, ParameterDirection.Input);
            dynamicParameters.Add("@fk_natureid", fk_natureid, DbType.String, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<LeavetypeClientMst, LeaveTypeClientDetails>(
                "SAL_LeaveTypeClient_Edit",  // Stored Procedure Name
                dynamicParameters,
                "LeaveType_GetById"    // Connection Name
            );

            LeavetypeClientMst leaveType = null;
            List<LeaveTypeClientDetails> leaveDetails = new List<LeaveTypeClientDetails>(); // Initialize properly

            if (tuple != null)
            {
                if (tuple.Item1 != null)
                {
                    leaveType = tuple.Item1.FirstOrDefault();
                }
                if (tuple.Item2 != null)
                {
                    leaveDetails = tuple.Item2.ToList();  // Fetch all leave details
                }
            }

            return (leaveType, leaveDetails);
        }




        //get LeaveType Details 


      

        public async Task<bool> Delete(long pk_leaveid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_leaveid", (object)pk_leaveid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_LeaveTypeClient_Del", dynamicParameters, "SAL_LeaveType_Del");
            return n > 0; // Return true if rows were affected
        }


        public async Task<Result<List<NameValue>>> LeaveTypeClientWiseAsync(string? fk_costcentreid, string fk_companyId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            // dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("SAL_LeaveType_SelForddlbyClient", dynamicParameters, "GetDropdownList");

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count > 0,
                Message = result.ToList().Count > 0 ? "Data retrieved" : "No record",
                Data = result.ToList()
            };

            return finalResult;
        }








    }
}
