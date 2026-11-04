using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class LeaveTypeRepository:ILeaveTypeRepository
    {

        public async Task<(int totalCount, IEnumerable<LeavetypeMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LeavetypeMst>("SAL_LeaveType_SelForGrid", dynamicParameters, "LeaveType_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<bool> InsertLeaveTypeAsync(LeavetypeMst leaveTypeMaster, List<LeaveTypeDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in the required dataset structure
            LeaveTypeMstDataSet dataset = new LeaveTypeMstDataSet
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
            int result = DataBaseFactory.QuerySP("SAL_LeaveType_Ins", dynamicParameters, "LeaveType_Insert");

            return result > 0;
        }


    

        public async Task<bool> updateLeaveTypeAsync(LeavetypeMst leaveTypeMaster, List<LeaveTypeDetails> leaveTypeDetailsList, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in the required dataset structure
            LeaveTypeMstDataSet dataset = new LeaveTypeMstDataSet
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
            int result = DataBaseFactory.QuerySP("SAL_LeaveType_Upd", dynamicParameters, "LeaveType_Insert");

            return result > 0;
        }




        //public async Task<bool> UpdateLeave(LeaveTypeMstDataSet leaveTypeList, string Fk_UserID, string Fk_LocID)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Serialize LeaveTypeMstDataSet to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(leaveTypeList);

        //    // Add parameters

        //    dynamicParameters.Add("@Pk_leaveid", (object)leaveTypeList.LeaveTypeMaster.pk_leaveid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    dynamicParameters.Add("@Timestamp", (object)leaveTypeList.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    // Log XML for debugging
        //    Console.WriteLine("Generated XML:\n" + xmlData);
        //    // Execute stored procedure
        //    int result = DataBaseFactory.QuerySP("SAL_LeaveType_Upd", dynamicParameters, "SAL_LeaveType_Upd");

        //    return result > 0;
        //}







        //public async Task<(LeavetypeMst, LeaveTypeDetails)> GetLeaveTypeById(long pk_leaveid)
        //{
        //    var dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@Pk_leaveid", pk_leaveid, DbType.Int64, ParameterDirection.Input);

        //    var tuple = DataBaseFactory.QueryMultipleSP<LeavetypeMst, LeaveTypeDetails>(
        //        "SAL_LeaveType_Edit",  // Stored Procedure Name
        //        dynamicParameters,
        //        "LeaveType_GetById"    // Connection Name
        //    );

        //    LeavetypeMst leaveType = null;
        //   List<LeaveTypeDetails> leaveDetails = [];

        //    if (tuple != null || tuple.Item1 != null)
        //    {
        //        leaveType = tuple.Item1.FirstOrDefault();
        //    }
        //    if (tuple != null || tuple.Item2 != null)
        //    {
        //        leaveDetails = tuple.Item2.ToList();
        //    }



        //    return (leaveType, leaveDetails);
        //}

        public async Task<(LeavetypeMst, List<LeaveTypeDetails>)> GetLeaveTypeById(long pk_leaveid,string? fk_natureid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_leaveid", pk_leaveid, DbType.Int64, ParameterDirection.Input);
            dynamicParameters.Add("@fk_natureid", fk_natureid, DbType.String, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<LeavetypeMst, LeaveTypeDetails>(
                "SAL_LeaveType_Edit",  // Stored Procedure Name
                dynamicParameters,
                "LeaveType_GetById"    // Connection Name
            );

            LeavetypeMst leaveType = null;
            List<LeaveTypeDetails> leaveDetails = new List<LeaveTypeDetails>(); // Initialize properly

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


        //public async Task<LeaveDetails> GetLeaveTypeByIdAsync(long fk_leaveid, string fk_empid)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@fk_leaveid", fk_leaveid, DbType.Int64, ParameterDirection.Input);

        //    dynamicParameters.Add("@fk_empid", fk_empid, DbType.String, ParameterDirection.Input);
        //    return DataBaseFactory.QuerySP<LeaveDetails>("SAL_Leavetype_Details_Edit", (object)dynamicParameters, "Zone Master - GetById").FirstOrDefault<LeaveDetails>();
        //}


        public async Task<bool> Delete(long pk_leaveid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_leaveid", (object)pk_leaveid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_LeaveType_Del", dynamicParameters, "SAL_LeaveType_Del");   
            return n > 0; // Return true if rows were affected
        }















    }
}
