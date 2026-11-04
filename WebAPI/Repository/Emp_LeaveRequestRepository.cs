using Dapper;
using DocumentFormat.OpenXml.Office2010.Excel;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class Emp_LeaveRequestRepository : IEmp_LeaveRequestRepository
    {
        // added by pp
        public async Task<dynamic> ApproveOrRejectAttendance(long pk_inoutid, int approvalOrder)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@pk_inoutid", pk_inoutid, DbType.Int64);
            parameters.Add("@approvalOrder", approvalOrder, DbType.Int32);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "SAL_Attendance_InOut_Regularisation_ApproveReject_Admin",
                parameters,
                "SAL_Attendance_InOut_Regularisation_ApproveReject_Admin"
            ).FirstOrDefault();

            return result ?? new { IsSuccess = 0, Message = "No response from procedure." };
        }

        public async Task<dynamic> ApproveOrRejectShortLeave(string pk_shortLeaveId, int approvalOrder)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_shortLeaveId", pk_shortLeaveId, DbType.String);
            dynamicParameters.Add("@approvalOrder", approvalOrder, DbType.Int32);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "SAL_ApplyShortLeave_Approve",
                dynamicParameters,
                "ShortLeave_Approve"
            ).FirstOrDefault();

            return result ?? new { IsSuccess = 0, Message = "No response from stored procedure." };
        }




        //public async Task<bool> InsertEmp_LeaveReqMstAsync(Emp_LeaverRequestModel model, string attSource)
        //{
        //{

        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Wrap the model in the required dataset structure

        //    // Serialize to XML
        //  //  string xmlData = XmlUtility.XmlSerializeToString(dataset);
        //    string xmlData = XmlUtility.XmlSerializeToString(model);

        //    // Add parameters
        //    dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@attSource", (object)attSource, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@rvalue", dbType: DbType.String, direction: ParameterDirection.Output, size: 50);
        //    // Log XML for debugging
        //    Console.WriteLine("Generated XML:\n" + xmlData);

        //    // Execute stored procedure
        //    int result = DataBaseFactory.QuerySP("SAL_LeaveApply_Ins", dynamicParameters, "LeaveApply_Ins");

        //    return result > 0;

        //}

        public async Task<ModelResponse> InsertLeaveTypeAsync(SAL_Leave_Apply sAL_Leave_Apply, List<SAL_Leave_Apply_Details> sAL_Leave_Apply_Details)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in the required dataset structure
            Emp_LeaverRequestModel dataset = new Emp_LeaverRequestModel

            {
                attSource = "W",
                sAL_Leave_Apply = sAL_Leave_Apply,
                sAL_Leave_Apply_Details = sAL_Leave_Apply_Details
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@attSource", (object)dataset.attSource, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure
            // int result = DataBaseFactory.QuerySP("SAL_LeaveApply_Ins", dynamicParameters, "LeaveApply_Ins");
            return DataBaseFactory.QuerySP<ModelResponse>("SAL_LeaveApply_Ins", (object)dynamicParameters, "SAL_LeaveApply_Ins").FirstOrDefault<ModelResponse>();
        }


        public async Task<Emp_leaveTakenLeaveBalance> GetLeaveBalance(string fk_empid, long fk_leaveid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_leaveid", (object)fk_leaveid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<Emp_leaveTakenLeaveBalance>("SAL_LeavesTaken_LeaveBalance_V1", (object)dynamicParameters, "Designation Master - GetById").FirstOrDefault<Emp_leaveTakenLeaveBalance>();
        }
        public async Task<List<dynamic>> GetViewLeaveBalance(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<dynamic>("SAL_EmployeeLeave_Details_Balance", (object)dynamicParameters, "EmployeeLeave_Details_Balance").ToList<dynamic>();
        }


        //chnages
        public async Task<List<dynamic>> GetAll_ApprovalCompOffAsync(string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<dynamic>("[SAL_ApplyCompOff_Mst_Approval_SelforgridNew]", dynamicParameters, "[SAL_ApplyCompOff_Mst_Approval_SelforgridNew] Details").ToList();
            return result;
        }

        public async Task<List<dynamic>> GetAll_Approval_ShortLeaveAsync(string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<dynamic>("SAL_ApplyShortLeave_Mst_Approval_SelforgridNew2", dynamicParameters, "ApplyShortLeave Details").ToList();
            return result;
        }
        public async Task<(List<LeaveDates>, Datefrom, LeaveTypeDetail)> EmpLeavesOnDates(string fk_empid, long fk_leaveid, DateTime datefrom, DateTime dateto)
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
                employeeDetails = tuple.Item3?.FirstOrDefault(); ;
            }

            return (leaveDetails, leaveMaster, employeeDetails);
        }




        public async Task<(int totalCount, IEnumerable<dynamic>)> GetAllEmp_LeaveReqAsync(
            int pageIndex, int pageSize, string decryptedUserId, string? fk_finid,
    string? status, int? month, int? year)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();



            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)decryptedUserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@status", status);
            dynamicParameters.Add("@month", month);
            dynamicParameters.Add("@year", year);

            // Call the stored procedure
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_LeaveApply_SelForGrid", dynamicParameters, "LeaveApply_SelForGrid");
            // Return (0, empty list) if result is null

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<dynamic>());
            // Get totalCount from the first result set
            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }


            // Return total count and actual data list
            return (totalCount, tuple.Item2.ToList());
        }


        public async Task<(int totalCount, IEnumerable<dynamic>)> GetAllEmp_LeaveDetailsAsync(
          int pageIndex, int pageSize, string decryptedUserId, string? fk_finid, int? month, int? year)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();



            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)decryptedUserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@month", month);
            dynamicParameters.Add("@year", year);

            // Call the stored procedure
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>("SAL_LeaveApply_Detail", dynamicParameters, "LeaveApply_SelForGrid");
            // Return (0, empty list) if result is null

            if (tuple == null || tuple.Item1 == null)
                return (0, new List<dynamic>());
            // Get totalCount from the first result set
            int totalCount = 0;
            if (tuple.Item2 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }
            //if (tuple == null || tuple.Item3 == null)
            //    return (0, new List<dynamic>());

            // Return total count and actual data list
            return (totalCount, tuple.Item1.ToList());
        }


        //OD Request

        public async Task<LeaveInsertResponse> InsertODLeaveAsync(LeaveModule sAL_Leave_Apply)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap the data in a container model matching expected XML root
                var dataset = new LeaveModule
                {

                    fk_empid = sAL_Leave_Apply.fk_empid,
                    fk_finid = sAL_Leave_Apply.fk_finid,
                    fk_leaveid = sAL_Leave_Apply.fk_leaveid,
                    fromdate = sAL_Leave_Apply.fromdate,
                    todate = sAL_Leave_Apply.todate,
                    totdays = sAL_Leave_Apply.totdays,
                    Reason = sAL_Leave_Apply.Reason,
                    contactno = sAL_Leave_Apply.contactno,
                    contactduringleave = sAL_Leave_Apply.contactduringleave,
                    intime = sAL_Leave_Apply.intime,
                    outtime = sAL_Leave_Apply.outtime,
                    totalhours = sAL_Leave_Apply.totalhours,
                    fromtime = sAL_Leave_Apply.fromtime,
                    totime = sAL_Leave_Apply.totime,
                    totalhour = sAL_Leave_Apply.totalhour,

                    LeaveBalance = null,
                    currentyearleaves = 0,
                    totalleavesearned = 0,
                    totalleave = 0,
                    leaveavailed = 0,
                    BalanceLeave = 0,
                    LeaveDetail = sAL_Leave_Apply.LeaveDetail.Select(x => new LeaveModuleTrn
                    {
                        leaveid = x.leaveid,
                        dates = x.dates,
                        ishalfday = x.ishalfday,
                        halfdaystatus = x.halfdaystatus,
                        sno = x.sno,
                        Remarks = x.Remarks
                    }).ToList()
                };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Prepare parameters
                dynamicParameters.Add("@XmlLeave", xmlData, DbType.String, ParameterDirection.Input);

                // Call the stored procedure
                var result = DataBaseFactory.QuerySP<LeaveInsertResponse>("SAL_LeaveApply_forOD_Ins", dynamicParameters, "LeaveApply_forOD_Ins");

                return result?.FirstOrDefault() ?? new LeaveInsertResponse { IsSuccessfull = false };
            }
            catch (Exception ex)
            {
                // Optionally log exception here
                throw new Exception("Error inserting OD leave request.", ex);
            }
        }


        //Approve Regularization

        public async Task<IEnumerable<dynamic>> GetAll(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var res = DataBaseFactory.QuerySP<dynamic>("SAL_Attendance_InOut_Regularisation_Approve_Selforgrid", dynamicParameters, "Attendance_InOut_Regularisation_Approve").ToList();

            return (res);

        }

        public async Task<dynamic> GetById(string pk_inoutid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_inoutid", (object)pk_inoutid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<dynamic>("SAL_Attendance_InOut_Regularisation_Edit", (object)dynamicParameters, "Attendance_InOut_Regularisation").FirstOrDefault<dynamic>();
        }


        public async Task<LeaveInsertResponse> approveRegularizationAsync(AttendanceRegularizationApproval regularizationApproval)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap the data in a container model matching expected XML root
                var dataset = new AttendanceRegularizationApproval
                {

                    IsDisapproved = regularizationApproval.IsDisapproved,
                    ApprovalRemarks = regularizationApproval.ApprovalRemarks,
                    ApprovalStatus = regularizationApproval.ApprovalStatus,
                    IsApproved = regularizationApproval.IsApproved,
                    pk_empId = regularizationApproval.pk_empId,
                    Dated = regularizationApproval.Dated,
                    pk_inoutid = regularizationApproval.pk_inoutid,
                    RegularizeId = regularizationApproval.RegularizeId,
                    RegularizedStatus = regularizationApproval.RegularizedStatus

                };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Prepare parameters
                dynamicParameters.Add("@XmlDoc", xmlData, DbType.String, ParameterDirection.Input);

                // Call the stored procedure
                var result = DataBaseFactory.QuerySP<LeaveInsertResponse>("SAL_Attendance_InOut_Regularisation_Approve_InsNew", dynamicParameters, "Attendance_InOut_Regularisation_Approve_InsNew");

                return result?.FirstOrDefault() ?? new LeaveInsertResponse { IsSuccessfull = false };
            }
            catch (Exception ex)
            {
                // Optionally log exception here
                throw new Exception("Error inserting OD leave request.", ex);
            }
        }


        //shiv

        public async Task<ModelResponse> Insert_shortLeaveReqMstAsync(LeaveModule model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(model);
            dynamicParameters.Add("@XmlLeave", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //  int result = DataBaseFactory.QuerySP("SAL_ApplyShortLeave_Mst_InsNew", dynamicParameters, "shortLeaveApply_Ins");

            return DataBaseFactory.QuerySP<ModelResponse>("SAL_ApplyShortLeave_Mst_InsNew", (object)dynamicParameters, "SAL_ApplyShortLeave_Mst_InsNew").FirstOrDefault<ModelResponse>();
        }

        public async Task<List<ShortLeaveModel>> GetAll_shortLeaveReqMstAsync(string EmpId, int? month, int? year)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@month", month);
            dynamicParameters.Add("@year", year);
            var result = DataBaseFactory.QuerySP<ShortLeaveModel>("SAL_ApplyShortLeave_Mst_Selforgrid", dynamicParameters, "ApplyShortLeave Details").ToList();
            return result;
        }




        public async Task<ShortLeaveViewModel> ApplyShortLeaveByIdAsync(string pk_shortLeaveId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_shortLeaveId", (object)pk_shortLeaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ShortLeaveViewModel>("SAL_ApplyShortLeave_Mst_Edit", (object)dynamicParameters, "ApplyShortLeave - GetById").FirstOrDefault<ShortLeaveViewModel>();
        }

        //short Leave end

        //approval
        public async Task<List<ApprovalShortLeaveModel>> GetAll_ApprovalShortLeaveAsync(string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<ApprovalShortLeaveModel>("SAL_ApplyShortLeave_Mst_Approval_SelforgridNew", dynamicParameters, "ApplyShortLeave Details").ToList();
            return result;
        }

        public async Task<bool> Insert_ApprovalshortLeaveReqMstAsync(ShortLeaveApprovalModel model)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(model);
            dynamicParameters.Add("@XmlLeave", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int result = DataBaseFactory.QuerySP("SAL_ApplyShortLeave_Mst_Approval_InsNew", dynamicParameters, "shortLeaveApply_Ins");
            return result > 0;

        }

        //ApprovalLeaveOd

        public async Task<List<LeaveApprovalOdModel>> ApprovalLeaveAsync(string fk_approvedby)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_approvedby", (object)fk_approvedby, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<LeaveApprovalOdModel>("SAL_Employee_LeaveApprove_SelForddl_New", dynamicParameters, "ApplyShortLeave - GetById").ToList();
            return result;
        }

        public async Task<List<LeaveApprovedModelList>> LeaveApprovedModelListAsync(string fk_approvedby)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_approvedby", (object)fk_approvedby, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP<LeaveApprovedModelList>("SAL_Employee_LeaveApproved_SelForGrid", dynamicParameters, "ApplyShortLeave - GetById").ToList();
            return result;
        }


        public async Task<ModelResponse> Insert_ApprovalLeaveAsync(LeaveApprovalModel model, string fk_approvedby)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_leaveappid", (object)model.fk_leaveappid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_approvedby", (object)fk_approvedby, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@status", (object)model.status, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)model.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ModelResponse>("SAL_LeaveApprove_Ins_New", dynamicParameters, "LeaveApprove_Ins_New").FirstOrDefault<ModelResponse>();
        }


        //balance validation
        public async Task<string> leavetypebalancevalidation(string fk_empId, string fk_leaveId, long tobeapply)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", (object)fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_leaveId", (object)fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@tobeapply", (object)tobeapply, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var resultval = DataBaseFactory.QuerySP<dynamic>("SAL_LeaveApply_validate", dynamicParameters, "LeaveApply_validate").FirstOrDefault();

            return resultval.rValue?.ToString();

        }


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
                "Validate_LeaveTaken_DateNew",
                dynamicParameters,
                "Validate_LeaveTaken_DateNew"
            ).FirstOrDefault();

            // Extract the 3 result sets
            return tuple?.ErrorMessage;

        }


        public async Task<(bool isSuccess, string message)> DeleteLeaveAsync(string pk_leaveappid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_leaveappid", pk_leaveappid, DbType.String);

            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                "SAL_LeaveApply_Del",
                dynamicParameters,
                "Leave_Delete"
            );

            var row = result.FirstOrDefault();
            if (row != null)
            {
                return (row.IsSuccess == 1, row.Message);
            }

            return (false, "Unexpected error occurred.");
        }


        public async Task<(bool isSuccess, string message)> DeleteShortLeaveAsync(string pk_shortLeaveId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_shortLeaveId", pk_shortLeaveId, DbType.String);

            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                "SAL_ApplyShortLeave_Mst_Del",
                dynamicParameters,
                "Leave_Delete"   // alias/group name for logging/tracing
            );

            var row = result.FirstOrDefault();
            if (row != null)
            {
                return (row.IsSuccess == 1, row.Message);
            }

            return (false, "Unexpected error occurred.");
        }
        //

        // for admin ADDED BY PP 
        public async Task<List<dynamic>> GetAll_AdminApprovalAsync()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var result = DataBaseFactory.QuerySP<dynamic>(
                "[SAL_Attendance_InOut_Regularisation_List_Admin]",
                dynamicParameters,
                "[SAL_Attendance_InOut_Regularisation_List_Admin] Details"
            ).ToList();

            return result;
        }

        // For Approved Leaves - ADDED BY PP
        public async Task<List<dynamic>> GetApprovedLeavesAsync(int? fk_leaveId, string fk_empid, DateTime? fromDate, DateTime? toDate)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // parameters must match your stored procedure
            dynamicParameters.Add("@fk_leaveId", fk_leaveId);
            dynamicParameters.Add("@fk_empid", fk_empid);
            dynamicParameters.Add("@fromDate", fromDate);
            dynamicParameters.Add("@toDate", toDate);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "[SAL_ViewApproveleave]",     // your SP name
                dynamicParameters,
                "[SAL_ViewApproveleave] Result"   // just a label for logging/debugging
            ).ToList();

            return result;
        }



        public async Task<(bool isSuccess, string message)> RejectLeaveAsync(string requestType, string requestId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RequestType", requestType, DbType.String);
            dynamicParameters.Add("@RequestId", requestId, DbType.String);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "SP_leaveReject_General",
                dynamicParameters,
                "Leave_Reject"   // alias/group name for logging/tracing
            );

            var row = result.FirstOrDefault();
            if (row != null)
            {
                return (row.IsSuccess == 1, row.Message);
            }

            return (false, "Unexpected error occurred.");
        }


    }
}