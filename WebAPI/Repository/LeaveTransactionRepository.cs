using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HRMSWebAPI.Repository
{
    public class LeaveTransactionRepository : ILeaveTransactionRepository
    {









        //get LeaveTaken List  base on emp

        public async Task<(int totalCount, IEnumerable<LeaveTakenDetails>)> GetAllLeaveTaken(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LeaveTakenDetails>("SAL_LeavesTaken_SelForGrid", dynamicParameters, "LeaveTakenDetails_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<leaveTakenLeaveBalance> GetLeaveBalance(string fk_empid, long fk_leaveid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)@fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_leaveid", (object)@fk_leaveid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<leaveTakenLeaveBalance>("SAL_LeavesTaken_LeaveBalance", (object)dynamicParameters, "Designation Master - GetById").FirstOrDefault<leaveTakenLeaveBalance>();


        }





        // get employeedata base on empid
        public async Task<(EmployeeDetailsModel, List<EmployeeLeaveDetailsModel>)> GetEmployeeLeaveDetails(string fk_empid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String, ParameterDirection.Input);

            // Use the stored procedure name and the parameters
            var tuple = DataBaseFactory.QueryMultipleSP<EmployeeDetailsModel, EmployeeLeaveDetailsModel>(
                "SAL_Employee_Details_ForLeavesTaken",  // Stored Procedure Name
                dynamicParameters,
                "LeaveTaken_GetData"    // Connection Name
            );

            EmployeeDetailsModel employeeDetails = null;
            List<EmployeeLeaveDetailsModel> leaveDetails = new List<EmployeeLeaveDetailsModel>();

            if (tuple != null)
            {
                if (tuple.Item1 != null)
                {
                    employeeDetails = tuple.Item1.FirstOrDefault();
                }

                if (tuple.Item2 != null)
                {
                    leaveDetails = tuple.Item2.ToList();  // Fetch all leave details
                }
            }

            return (employeeDetails, leaveDetails);
        }

        // delete data
        public async Task<bool> Delete(string pk_leavetakenid, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_leavetakenid", (object)pk_leavetakenid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_LeavesTaken_Del", dynamicParameters, "SAL_LeavesTaken_Del");
            return n > 0; // Return true if rows were affected
        }

        //end




        // get by id


        public async Task<(EmpDetailsModelGetDataforUpd, SAL_LeavesTaken_Mst, List<EmplLeaveDetailGetDataforUpd>)> GetById(string pk_LeavetakenId)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_LeavetakenId", pk_LeavetakenId, DbType.String, ParameterDirection.Input);

            // Use the stored procedure name and parameters
            var tuple = DataBaseFactory.QueryMultipleSP<EmpDetailsModelGetDataforUpd, SAL_LeavesTaken_Mst, EmplLeaveDetailGetDataforUpd>(
                "SAL_LeavesTaken_Edit",  // Stored Procedure Name
                dynamicParameters,
                "LeaveTaken_GetDataByID"                    // Connection Name
            );

            // Extract the 3 result sets
            EmpDetailsModelGetDataforUpd employeeDetails = null;
            SAL_LeavesTaken_Mst leaveMaster = null;
            List<EmplLeaveDetailGetDataforUpd> leaveDetails = new();

            if (tuple != null)
            {
                employeeDetails = tuple.Item1?.FirstOrDefault();
                leaveMaster = tuple.Item2?.FirstOrDefault();
                leaveDetails = tuple.Item3?.ToList();
            }

            return (employeeDetails, leaveMaster, leaveDetails);
        }



        //ENd



        // GetDate


        public async Task<(List<LeaveDates> ,Datefrom, LeaveTypeDetail)> EmpLeavesOnDates(string fk_empid, long fk_leaveid,DateTime datefrom,DateTime dateto)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String, ParameterDirection.Input);
            dynamicParameters.Add("@fk_leaveid", fk_leaveid, DbType.Int64, ParameterDirection.Input);
            dynamicParameters.Add("@datefrom", datefrom, DbType.DateTime, ParameterDirection.Input);
            dynamicParameters.Add("@dateto", dateto, DbType.DateTime, ParameterDirection.Input);
            

            // Use the stored procedure name and parameters
            var tuple = DataBaseFactory.QueryMultipleSP<LeaveDates, Datefrom, LeaveTypeDetail>(
                "SAL_LeavesTaken_Details_EmpLeavesOnDates",  // Stored Procedure Name
                dynamicParameters,
                "LeaveTaken_GetDataByID"                    // Connection Name
            );

            // Extract the 3 result sets
            List<LeaveDates> leaveDetails = new();
            Datefrom leaveMaster = null;
            LeaveTypeDetail employeeDetails = null;
           
           

            if (tuple != null)
            {
                leaveDetails = tuple.Item1?.ToList();
                leaveMaster = tuple.Item2?.FirstOrDefault();
                employeeDetails = tuple.Item3?.FirstOrDefault();;
            }

            return (leaveDetails, leaveMaster, employeeDetails);
        }



        //End


        public async Task<string> ValidateLeaveTakenDateNew(string fk_empid, long fk_leaveid, DateTime datefrom, DateTime dateto)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String, ParameterDirection.Input);
            dynamicParameters.Add("@fk_leaveid", fk_leaveid.ToString(), DbType.String, ParameterDirection.Input);
            dynamicParameters.Add("@datefrom", datefrom, DbType.DateTime, ParameterDirection.Input);
            dynamicParameters.Add("@dateto", dateto, DbType.DateTime, ParameterDirection.Input);
            dynamicParameters.Add("@totdays", null, DbType.Decimal, ParameterDirection.Input);
            

            // Use the stored procedure name and parameters
            var tuple = DataBaseFactory.QuerySP<dynamic>(
                "Validate_LeaveTaken_DateNew",  // Stored Procedure Name
                dynamicParameters,
                "Validate_LeaveTaken_DateNew"                    // Connection Name
            ).FirstOrDefault();

            // Extract the 3 result sets
            return tuple?.ErrorMessage;






            
        }





        // insert LeaveTransactionData

        public async Task<ModelResponse> InsertLeaveTypeAsync(SAL_LeavesTaken_Mst leaveTakenMst, List<SAL_LeavesTaken_Details> leaveTakenDetailsList, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
           
            // Wrap the models in the required dataset structure
            LeavesTransactionDataSet dataset = new LeavesTransactionDataSet
            {
                LeavesTakenMasters = leaveTakenMst,
                LeaveTakenDetails = leaveTakenDetailsList
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            //dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure
            return DataBaseFactory.QuerySP<ModelResponse>("SAL_LeavesTaken_Ins", dynamicParameters, "LeaveType_Insert").FirstOrDefault<ModelResponse>();
        }


        //update


        public async Task<bool> UpdateLeaveTakenAsync(SAL_LeavesTaken_Mst leaveTakenMst, List<SAL_LeavesTaken_Details> leaveTakenDetailsList, string fkUserID, string fkLocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap data in dataset model
            LeavesTransactionDataSet dataset = new LeavesTransactionDataSet
            {
                LeavesTakenMasters = leaveTakenMst,
                LeaveTakenDetails = leaveTakenDetailsList
            };

            // Serialize dataset to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@Pk_LeavetakenId", (object)leaveTakenMst.pk_leavetakenid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", fkUserID);
            dynamicParameters.Add("@Fk_LocID", fkLocID);
            dynamicParameters.Add("@Timestamp", (object)dataset.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute the stored procedure
            int result = DataBaseFactory.QuerySP("SAL_LeavesTaken_Upd", dynamicParameters, "LeaveTaken_Update");

            return result > 0;
        }








        //public async Task<bool> InsertLeaveTakenAsync(LeavesTransactionDataSet leavesTakenDataSet, string Fk_UserID, string Fk_LocID)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Serialize the dataset to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(leavesTakenDataSet);

        //    // Add parameters to DynamicParameters object
        //    dynamicParameters.Add("@Doc", (object)xmlData, DbType.String);
        //    dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, DbType.String);
        //    dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, DbType.String);


        //    // Execute the stored procedure
        //    int result =  DataBaseFactory.QuerySP("SAL_LeavesTaken_Ins", dynamicParameters, "LeaveTaken_Insert");

        //    return result > 0;
        //}




        public async Task<PendingLeaveResult> GetPendingLeave(string userId, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@UserId", userId);
            dynamicParameters.Add("@fk_companyId", fk_companyId);

            var result = DataBaseFactory.QueryMultipleSP<PendingLeave, ViewPanelResult>(
                "SAL_Employee_PendingLeave_Selforgrid",
                dynamicParameters,
                "Leave_Pending_GetAll"
            );

            var pendingLeaves = result.Item1;
            var viewPanelData = result.Item2;


            string viewpnl = viewPanelData != null && viewPanelData.Any()
                 ? viewPanelData.First().viewpnl
                 : "N";

            return new PendingLeaveResult
            {
                Leaves = pendingLeaves?.ToList() ?? new List<PendingLeave>(),
                viewpnl = viewpnl
            };
        }

        public async Task<ModelResponse> approvePendingLeave(long pk_leaveappid, string fkUserID, string fkLocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_LeaveappId", (object)pk_leaveappid, dbType: new DbType?(DbType.Int64), direction: new ParameterDirection?(), size: new int?(), precision: new byte?(), scale: new byte?());
            return DataBaseFactory.QuerySP<ModelResponse>("SAL_Employee_PendingLeave_Approval", dynamicParameters, "LeaveTaken_Update").FirstOrDefault<ModelResponse>();
        }

        public async Task<ModelResponse> DeleteLeavePendingMstAsync(long Pk_LeaveappId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_LeaveappId", (object)Pk_LeaveappId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            return DataBaseFactory.QuerySP<ModelResponse>("SAL_Employee_PendingLeave_Delete", dynamicParameters, "SAL_Employee_PendingLeave_Delete").FirstOrDefault<ModelResponse>();
        }
    }
}
