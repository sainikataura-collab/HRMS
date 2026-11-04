using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
using System.Xml.Linq;

namespace HRMSWebAPI.Repository
{
    public class leaveAssignmentRepository: IleaveAssignmentRepository
    {
        public async Task<ModelResponse> LeaveAssignmentValidateAsync(long? leaveId, string empId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_leaveid", (object)leaveId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            return DataBaseFactory.QuerySP<ModelResponse>("SAL_Employee_LeaveAssign_Validate", (object)dynamicParameters, "SAL_Employee_LeaveAssign_Validate").FirstOrDefault<ModelResponse>();
        }
        public async Task<EmpdetailMst> GetEmployeeLeaveDetailsAsync(string pk_Empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)pk_Empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           
            return DataBaseFactory.QuerySP<EmpdetailMst>("SAL_Employee_LeaveAssign_EmpDetail", (object)dynamicParameters, "leave  Master - GetById").FirstOrDefault<EmpdetailMst>();
        }
        public async Task<LeaveAssignmentMst> LeaveAssignmentAsync(long leaveId, string empId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_leaveid", (object)leaveId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            return DataBaseFactory.QuerySP<LeaveAssignmentMst>("SAL_Employee_LeaveAssign_Curleave", (object)dynamicParameters, "leave  Master - GetById").FirstOrDefault<LeaveAssignmentMst>();
        }

        //leave insert
        public async Task<bool> InsertEmployeeLeaveAsync(List<LeaveDetailMst> leaveDetailMstList, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            LeaveDetailDataSet dataset = new LeaveDetailDataSet { LeaveDetails = leaveDetailMstList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_Employee_LeaveAssign_Ins", dynamicParameters, "SAL_Employee_LeaveAssign_Ins");

            return result > 0;
        }

        //leave get all
        public async Task<(int totalCount, IEnumerable<LeaveDetailMst>)> GetAll(int pageIndex, int pageSize, string employeeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)employeeId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

           
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LeaveDetailMst>("SAL_Employee_LeaveAssign_SelForGrid", dynamicParameters, "leavemst_GetAll");
            if (tuple == null || tuple.Item2 == null)
                return (0, new List<LeaveDetailMst>());

            // Extract totalCount safely
            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }

            return (totalCount, tuple.Item2?.ToList() ?? new List<LeaveDetailMst>());
        }

        //get by id

        public async Task<LeaveDetailMst> GetLeaveAssignmentByIdAsync(string assignId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Assignid", (object)assignId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<LeaveDetailMst>("SAL_Employee_LeaveAssign_Edit", (object)dynamicParameters, "Holiday Master - GetById").FirstOrDefault<LeaveDetailMst>();
        }
        //delete
        public async Task<bool> DeleteLeaveAssignment(string pk_assignid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Assignid", (object)pk_assignid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Employee_LeaveAssign_Del", dynamicParameters, "leavedetail_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }

        //update
        public async Task<bool> UpdateLeaveAssignmentAsync(LeaveDetailMst leaveDetailMstList,string fk_userID, string fk_locID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Assignid", (object)leaveDetailMstList.pk_assignid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", GenerateLeaveDetailsXml(leaveDetailMstList), DbType.String);
            dynamicParameters.Add("@Fk_UserID", fk_userID, DbType.String);
            dynamicParameters.Add("@Fk_LocID", (object)fk_locID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)leaveDetailMstList.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());

            // Execute stored procedure for update
               int n = DataBaseFactory.QuerySP("SAL_Employee_LeaveAssign_Upd", dynamicParameters, "leavedetail_Mst_Update");

            return n > 0; // Return true if rows were affected
        }
        // Helper function to generate XML
        private string GenerateLeaveDetailsXml(LeaveDetailMst leaveDetailMst)
        {
            XElement xml = new XElement("NewDataSet",
                new XElement("SAL_EmployeeLeave_Details",
                    new XElement("fk_empid", leaveDetailMst.fk_empid),
                    new XElement("fk_leaveid", leaveDetailMst.fk_leaveid),
                    new XElement("currentyearleaves", leaveDetailMst.currentyearleaves),
                    new XElement("totalleavesearned", leaveDetailMst.totalleavesearned),
                    new XElement("leaveavailed", leaveDetailMst.leaveavailed)
                )
            );

            return xml.ToString();
        }


    }

}
