using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.Common;
using System.Dynamic;
using System.Reflection.Metadata;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class ExportReportRepository : IExportReportRepository
    {

        CommonFunction commonFunction = new CommonFunction();

        public async Task<IEnumerable<dynamic>> ViewAttendanceReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // 
            //if (request.ExportType == 1)
            //{
            //    dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //    return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_MonthlyAttendance_ForExportToExcel", dynamicParameters).ToList());
            //}
            if (request.ExportType == 1)


            {

                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                if (request.paginationRequired == true)
                {
                    dynamicParameters.Add("@PageIndex", request.pageIndex, DbType.Int32);

                    dynamicParameters.Add("@PageSize", request.pageSize, DbType.Int32);

                    // SP must return 2 result sets: first = total count, second = data
                    //var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                    //    "SAL_Employee_MonthlyAttendance_ForExportToExcel", dynamicParameters);

                    //if (tuple == null || tuple.Item2 == null) return [];

                    //// Prepend count row so caller can extract it
                    //var result = new List<dynamic>();
                    //result.AddRange(tuple.Item1 ?? []);   // count row(s) first
                    //result.AddRange(tuple.Item2.ToList()); // actual data
                    //return result;
                }




                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_MonthlyAttendance_ForExportToExcel", dynamicParameters).ToList());
            }

            else if (request.ExportType == 2)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_MonthlyAttendance_Sheet", dynamicParameters).ToList());
            }
            else if (request.ExportType == 3)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_MonthlyAttendance_TimeSheet", dynamicParameters).ToList());
            }
            else if (request.ExportType == 4)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_MonthlyAttendance_Geotagging", dynamicParameters).ToList());
            }
            else if (request.ExportType == 5)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("EMP_MonthlyAttendance_Details_Export", dynamicParameters).ToList());
            }

            else if (request.ExportType == 7)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_EmpDayWiseAttendance_Rpt_SelForGrid", dynamicParameters).ToList());
            }
            else if (request.ExportType == 8)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@statusType", (object)request.ExportType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_AttendanceStatus_Report", dynamicParameters).ToList());
            }

            else if (request.ExportType == 9)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@statusType", (object)request.ExportType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_AttendanceStatus_Report", dynamicParameters).ToList());
            }
            else if (request.ExportType == 10)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@statusType", (object)request.ExportType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_AttendanceStatus_Report", dynamicParameters).ToList());
            }
            else if (request.ExportType == 11)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@statusType", (object)request.ExportType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_AttendanceStatus_Report", dynamicParameters).ToList());
            }
            else if (request.ExportType == 12)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_MonthlyAttendance_ForExportToExcel", dynamicParameters).ToList());
            }
            else
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("EMP_MonthlyCanteen_Details_Export", dynamicParameters).ToList());
            }
        }


        //lic async Task<IEnumerable<dynamic>> ViewSalaryReportAsync(ReportModelRequest request)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Combine both into one XML structure
        //    var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

        //    dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    //
        //    if (request.ExportType == 2)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 1)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_BankStatement_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 3)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@ExportType", (object)"N", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 4)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@ExportType", (object)"L", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 5)
        //    {
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_PFStatement_Monthly_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 6)
        //    {
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_ESIStatement_Monthly_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 9)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_Stop_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 10)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_Pay_ForExport", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 11)
        //    {
        //        return (DataBaseFactory.QuerySP<dynamic>("VIL_LWFStatement_Export", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 12)
        //    {
        //        return (DataBaseFactory.QuerySP<dynamic>("VIL_ProftaxStatement_Export", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 13)
        //    {
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_LoanAdv_Monthly_Export", dynamicParameters).ToList());
        //    }

        //    else if (request.ExportType == 31)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 27)
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("VIL_Encashment", dynamicParameters).ToList());
        //    }
        //    else
        //    {
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_ForExport", dynamicParameters).ToList());
        //    }
        //}


        public async Task<IEnumerable<dynamic>> GetPayrollADashboardAsync(string fk_monthId, string fk_yearId, string Userid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            // var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);
            dynamicParameters.Add("@fk_monthId", (object)fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserId", (object)Userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure
            var employees = DataBaseFactory.QuerySP<dynamic>("SAL_Payroll_Dashboard_SelForGrid", dynamicParameters).ToList();

            return (employees);

        }

        //public async Task<IEnumerable<dynamic>> ViewLeaveReportAsync(ReportModelRequest request)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Combine both into one XML structure
        //    var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

        //    dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    // 
        //    if (request.ExportType == 1)
        //    {
        //        dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
        //        dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_LeaveStatusAll_Status_Excel_Rpt", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 2)
        //    {
        //        dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
        //        dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_LeaveTakenDetail_Excel", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 3)
        //    {
        //        dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fk_companyid", (object)request.fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("VIL_Leave_New", dynamicParameters).ToList());
        //    }
        //    else if (request.ExportType == 4)
        //    {
        //        dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
        //        dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_LeavePendingDetail_Excel", dynamicParameters).ToList());
        //    }
        //    else
        //    {
        //        dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_ForExport", dynamicParameters).ToList());
        //    }
        //}




        public async Task<(int totalCount, IEnumerable<dynamic>)> ViewLeaveReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            // Pagination params
            int pageIndex = request.pageIndex ?? 0;
            int pageSize = request.pageSize ?? 10;

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Helper: extract totalCount from first resultset
            static int ExtractCount(IEnumerable<dynamic>? countResult)
            {
                if (countResult == null) return 0;
                var first = countResult.FirstOrDefault();
                if (first == null) return 0;
                var dict = (IDictionary<string, object>)first;
                return dict.Values.Any() ? Convert.ToInt32(dict.Values.First()) : 0;
            }

            if (request.ExportType == 1)
            {
                // Leave Balance — SAL_LeaveStatusAll_Status_Excel_Rpt_New
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
                dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@searchTerm", (object)request.searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_LeaveStatusAll_Status_Excel_Rpt", dynamicParameters);
                if (tuple == null || tuple.Item2 == null) return (0, []);
                return (ExtractCount(tuple.Item1), tuple.Item2.ToList());
            }
            else if (request.ExportType == 2)
            {
                // Leave Taken Detail — SAL_LeaveTakenDetail_Excel_New
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@searchTerm", (object)request.searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_LeaveTakenDetail_Excel", dynamicParameters);
                if (tuple == null || tuple.Item2 == null) return (0, []);
                return (ExtractCount(tuple.Item1), tuple.Item2.ToList());
            }
            else if (request.ExportType == 3)
            {
                // Leave Month-wise Detail — VIL_Leave_New_New (dynamic pivot, no pagination)
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_companyid", (object)request.fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@searchTerm", (object)request.searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                // VIL_Leave_New_New has a dynamic pivot — no server-side pagination
                var data = DataBaseFactory.QuerySP<dynamic>("VIL_Leave_New", dynamicParameters).ToList();
                return (data.Count, data);
            }
            else if (request.ExportType == 4)
            {
                // Leave Pending for Approval — SAL_LeavePendingDetail_Excel_New
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_leaveid", (object)request.fk_leaveId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@searchTerm", (object)request.searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_LeavePendingDetail_Excel", dynamicParameters);
                if (tuple == null || tuple.Item2 == null) return (0, []);
                return (ExtractCount(tuple.Item1), tuple.Item2.ToList());
            }
            else
            {
                // SAL_Employee_ForExport_New (already has pagination built in)
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_ForExport", dynamicParameters);
                if (tuple == null || tuple.Item2 == null) return (0, []);
                return (ExtractCount(tuple.Item1), tuple.Item2.ToList());
            }
        }



        public async Task<IEnumerable<dynamic>> ViewCanteenReportlistAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            if (request.ExportType == 1)
            {
                // Combine both into one XML structure
                var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);
                dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_CanteenDaily_Excel", dynamicParameters).ToList());
            }
            else
            {
                // Combine both into one XML structure
                var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);
                dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_CanteenMonthly_Excel", dynamicParameters).ToList());
            }
        }

        public async Task<IEnumerable<dynamic>> ViewLoanReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);

            // 
            if (request.ExportType == 1)
            {
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_loanid", (object)request.fk_loanid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_LoanAdv_Status_ForExcel", dynamicParameters).ToList());
            }
            else if (request.ExportType == 2)
            {
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_loanid", (object)request.fk_loanid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_LoanAdv_Paid_ForExcel", dynamicParameters).ToList());
            }
            else if (request.ExportType == 3)
            {
                dynamicParameters.Add("@shortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_loanid", (object)request.fk_loanid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_LoanAdv_Status_ForExcelForPending", dynamicParameters).ToList());
            }
            else
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_ForExport", dynamicParameters).ToList());
            }
        }



        //
        public async Task<(int totalCount, IEnumerable<dynamic>)> ViewEmployeeReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@pageindex", (object)request.pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)request.pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);


            if (request.ExportType == 0)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }

            else
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
        }






        public async Task<(int totalCount, IEnumerable<dynamic>)> ViewSalaryReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@pageindex", (object)request.pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)request.pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);


            if (request.ExportType == 2 || request.ExportType == 35)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //  return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 100)  // Salary Payout
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@FilterBatchKey", (object)request.reportType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_SalaryPayout_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 53)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //  return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_ForExport_NavPosting", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 1)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_BankStatement_ForExport", dynamicParameters).ToList());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_BankStatement_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 3)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"N", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 4)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"L", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());

            }
            else if (request.ExportType == 5)
            {
                //return (DataBaseFactory.QuerySP<dynamic>("SAL_PFStatement_Monthly_ForExport", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_PFStatement_Monthly_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 6)
            {
                // return (DataBaseFactory.QuerySP<dynamic>("SAL_ESIStatement_Monthly_ForExport", dynamicParameters).ToList());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_ESIStatement_Monthly_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 9)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_Stop_ForExport", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_Stop_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 57)
            {

                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Arrear_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 10)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                // return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_Pay_ForExport", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_Pay_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 11)
            {
                // return (DataBaseFactory.QuerySP<dynamic>("VIL_LWFStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("VIL_LWFStatement_Export", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 12)
            {
                // return (DataBaseFactory.QuerySP<dynamic>("VIL_ProftaxStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("VIL_ProftaxStatement_Export", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 56)
            {

                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("VIL_IncentiveStatement_Export", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }

            else if (request.ExportType == 13)
            {
                // return (DataBaseFactory.QuerySP<dynamic>("SAL_LoanAdv_Monthly_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_LoanAdv_Monthly_Export", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 31)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("VIL_OTStatement_Export", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 27)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                // return (DataBaseFactory.QuerySP<dynamic>("VIL_Encashment", dynamicParameters).ToList());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("VIL_Encashment", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 50)
            {
                // Bonus Statement
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("VIL_BonusStatement_Export", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 55)
            {

                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_LTA_Export", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }

            else if (request.ExportType == 51)
            {
                // Bonus Statement
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("[SAL_Employee_MusterRoll_ForExcle]", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 52)
            {
                // Bonus Statement
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("[SAL_Employee_EqualRemuneration_ForExcle]", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 54)
            {
                // Bonus Statement
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //   dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                //return (DataBaseFactory.QuerySP<dynamic>("VIL_OTStatement_Export", dynamicParameters).ToList());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("Sal_Gratuity_Rpts", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 58)
            {
                // Salary Comparison Sheet
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("USP_Salary_Comparison_Report", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }

            else if (request.ExportType == 36)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_SalaryPFChallan_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else if (request.ExportType == 37)
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_SalaryESIChallan_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
            else
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_ForExport", dynamicParameters);

                if (tuple == null || tuple.Item2 == null) return (0, []);
                //Convert Total Count
                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

                return (totalCount, tuple?.Item2?.ToList());
            }
        }





        public async Task<(int totalCount, IEnumerable<dynamic>)> GetMusterRollForPdfAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);

            // ✅ Fixed: Declare spName before the if block
            string spName;
            if (request.ExportType == 51)
            {
                dynamicParameters.Add("@ExportType", "M");
            }

            spName = "SAL_Employee_MusterRoll_ForPDF";

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(spName, dynamicParameters);

            if (tuple == null || tuple.Item1 == null || tuple.Item2 == null)
                return (0, Enumerable.Empty<dynamic>());

            // Item1 = Total Count, Item2 = Muster Roll Data
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<(int totalCount, IEnumerable<dynamic>)> EqualRemuneration(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);

            // ✅ Fixed: Declare spName before the if block
            string spName;
            if (request.ExportType == 52)
            {
                dynamicParameters.Add("@ExportType", "A");
            }

            spName = "[SAL_Employee_EqualRemuneration_ForPDF]";

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(spName, dynamicParameters);

            if (tuple == null || tuple.Item1 == null || tuple.Item2 == null)
                return (0, Enumerable.Empty<dynamic>());

            // Item1 = Total Count, Item2 = Muster Roll Data
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }




        // adde dnew for pdf 

        //public async Task<(int totalCount, IEnumerable<dynamic>)> PDFdata(ReportModelRequest request)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Combine both into one XML structure
        //    var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

        //    dynamicParameters.Add("@pageindex", (object)request.pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@pagesize", (object)request.pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);


        //        dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //        //  return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());

        //        var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters);
        //    Console.WriteLine($"Tuple is null: {tuple == null}");
        //    Console.WriteLine($"Tuple.Item1 is null: {tuple?.Item1 == null}");
        //    Console.WriteLine($"Tuple.Item2 is null: {tuple?.Item2 == null}");

        //    if (tuple == null || tuple.Item2 == null) return (0, []);
        //        //Convert Total Count
        //        int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
        //            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

        //        return (totalCount, tuple?.Item2?.ToList());


        //    //if (request.ExportType == 2)
        //    //{
        //    //    dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    //    dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    //    //  return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters).ToList());

        //    //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_Salary_ForExport", dynamicParameters);

        //    //    if (tuple == null || tuple.Item2 == null) return (0, []);
        //    //    //Convert Total Count
        //    //    int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
        //    //        ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

        //    //    return (totalCount, tuple?.Item2?.ToList());
        //    //}
        //    //else
        //    //{
        //    //    dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


        //    //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_ForExport", dynamicParameters);

        //    //    if (tuple == null || tuple.Item2 == null) return (0, []);
        //    //    //Convert Total Count
        //    //    int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
        //    //        ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

        //    //    return (totalCount, tuple?.Item2?.ToList());
        //    //}
        //}


        // add thisin export report

        public async Task<(int totalCount, object totals, IEnumerable<dynamic>, object invoiceDetails)> ViewBillFormAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateId", (object)request.fk_stateId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyid", (object)request.fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@PageNumber", (object)request.pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PageSize", (object)request.pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>("SAL_Employee_BillGeneration_Grid", dynamicParameters);

            if (tuple == null || tuple.Item2 == null) return (0, null, [], null);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            object totals = tuple.Item3 is IEnumerable<dynamic> ctcList && ctcList.Any()
                ? (IDictionary<string, object>)ctcList.First() : null;

            object invoiceDetails = tuple.Item4 is IEnumerable<dynamic> invoiceList && invoiceList.Any()
                ? (IDictionary<string, object>)invoiceList.First() : null;

            return (totalCount, totals, tuple?.Item2?.ToList(), invoiceDetails);
        }

        public async Task<bool> SaveBillDataAsync(BillSaveRequest request)
        {
            BillEmployeeDataSet dataset = new BillEmployeeDataSet { BillEmployeeList = request.EmployeeList };
            string xmlDoc = XmlUtility.XmlSerializeToString(dataset);
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@MonthId", request.fk_monthId);
            dynamicParameters.Add("@YearId", request.fk_yearId);
            dynamicParameters.Add("@CostCenterId", request.fk_costcentreid);
            dynamicParameters.Add("@SummaryCTC", request.summaryCTC);
            dynamicParameters.Add("@SummaryBonus", request.summaryBonus);
            dynamicParameters.Add("@SummaryTADA", request.summaryTADA);
            dynamicParameters.Add("@SummaryIncentive", request.summaryIncentive);
            dynamicParameters.Add("@SummaryGratuity", request.summaryGratuity);
            dynamicParameters.Add("@SummaryTotal", request.summaryTotal);
            dynamicParameters.Add("@SummaryAgencyCharges", request.summaryAgencyCharges);
            dynamicParameters.Add("@SummarySubTotal", request.summarySubTotal);
            dynamicParameters.Add("@SummaryRecovery", request.summaryRecovery);
            dynamicParameters.Add("@SummaryFinalTotal", request.summaryFinalTotal);
            dynamicParameters.Add("@SummaryIGST", request.summaryIGST);
            dynamicParameters.Add("@SummaryCGST", request.summaryCGST);
            dynamicParameters.Add("@SummarySGST", request.summarySGST);
            dynamicParameters.Add("@SummaryGrandTotal", request.summaryGrandTotal);
            dynamicParameters.Add("@fk_companyId", request.fk_companyid);
            dynamicParameters.Add("@xmlDoc", xmlDoc, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_locid_xml", combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_deptid_xml", combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<dynamic>("SAL_BillGeneration_Ins", dynamicParameters, "BillGeneration_Insert").FirstOrDefault();

            if (result != null && result.Status == 1)
            {
                return true;
            }
            return false;
        }

        public async Task<(int totalCount, IEnumerable<dynamic>)> GetBillGenerationListAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@MonthId", request.fk_monthId);
            dynamicParameters.Add("@YearId", request.fk_yearId);
            dynamicParameters.Add("@CostCenterId", request.fk_costcentreid);
            dynamicParameters.Add("@fk_companyId", request.fk_companyid);
            dynamicParameters.Add("@PageNumber", request.pageIndex);
            dynamicParameters.Add("@PageSize", request.pageSize);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_BillGeneration_List", dynamicParameters);

            if (tuple == null || tuple.Item2 == null) return (0, Enumerable.Empty<dynamic>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<(int totalCount, IEnumerable<dynamic>)> GetBillGenerationEmployeeListAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@MonthId", request.fk_monthId);
            dynamicParameters.Add("@YearId", request.fk_yearId);
            dynamicParameters.Add("@CostCenterId", request.fk_costcentreid);
            dynamicParameters.Add("@fk_companyId", request.fk_companyid);
            dynamicParameters.Add("@PageNumber", request.pageIndex);
            dynamicParameters.Add("@PageSize", request.pageSize);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_BillGeneration_EmployeeList", dynamicParameters);

            if (tuple == null || tuple.Item2 == null) return (0, Enumerable.Empty<dynamic>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<IEnumerable<dynamic>> GetBillGenerationDetailAsync(string billId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@BillId", billId);

            var result = DataBaseFactory.QuerySP<dynamic>("SAL_BillGeneration_Detail", dynamicParameters);

            return result;
        }

        public async Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFSalaryRegisterdata(ReportModelRequest request, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);
            dynamicParameters.Add("@fk_companyId", fk_companyId);


            // 👇 Decide based on ExportType
            string spName;
            if (request.ExportType == 2)
            {
                dynamicParameters.Add("@pageindex", request.pageIndex);
                dynamicParameters.Add("@pagesize", request.pageSize);

                dynamicParameters.Add("@sortby", request.SortBy);

                dynamicParameters.Add("@ExportType", "A");
                spName = "SAL_Employee_Salary_Register";   // Salary export for PDF
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null || tuple.Item4 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item4.ToList());

                //if (tuple == null || tuple.Item2 == null || tuple.Item3 == null) return (0, [], []);

                //int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                //    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                //    : 0;

                //return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList());
            }


            else
            {
                spName = "SAL_Employee_Salary_Register";
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item3.ToList());// Normal export (Excel etc.)
            }


        }











        public async Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFSalaryRegisterdataV2(ReportModelRequest request, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);
            dynamicParameters.Add("@fk_companyId", fk_companyId);


            // 👇 Decide based on ExportType
            string spName;
            if (request.ExportType == 2)
            {
                dynamicParameters.Add("@pageindex", request.pageIndex);
                dynamicParameters.Add("@pagesize", request.pageSize);

                dynamicParameters.Add("@sortby", request.SortBy);

                dynamicParameters.Add("@ExportType", "A");
                spName = "SAL_Employee_Salary_Register_V2";   // Salay export for PDF
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null || tuple.Item4 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item4.ToList());

                //if (tuple == null || tuple.Item2 == null || tuple.Item3 == null) return (0, [], []);

                //int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                //    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                //    : 0;

                //return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList());
            }


            else
            {
                spName = "SAL_Employee_Salary_Register";
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item3.ToList());// Normal export (Excel etc.)
            }


        }

        public async Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFdata(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);

            // 👇 Decide based on ExportType
            string spName;
            if (request.ExportType == 2)
            {
                dynamicParameters.Add("@pageindex", request.pageIndex);
                dynamicParameters.Add("@pagesize", request.pageSize);

                dynamicParameters.Add("@sortby", request.SortBy);

                dynamicParameters.Add("@ExportType", "A");
                spName = "SAL_Employee_Salary_Register";   // Salary export for PDF
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList());

                //if (tuple == null || tuple.Item2 == null || tuple.Item3 == null) return (0, [], []);

                //int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                //    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                //    : 0;

                //return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList());
            }

            else if (request.ExportType == 5)
            {
                dynamicParameters.Add("@fk_companyId", request.fk_companyid);
                spName = "SAL_PFStatement_Monthly_Rpt";

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple.Item1 == null || tuple.Item2 == null || tuple.Item3 == null || tuple.Item4 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());


                // 👇 Always return count = 0

                // flatten into 2 tables
                var table1 = (tuple.Item1 ?? Enumerable.Empty<dynamic>())
                             .Concat(tuple.Item2 ?? Enumerable.Empty<dynamic>());
                var table2 = (tuple.Item3 ?? Enumerable.Empty<dynamic>())
                             .Concat(tuple.Item4 ?? Enumerable.Empty<dynamic>());

                return (0, table1.ToList(), table2.ToList());
                //return (0, tuple.Item1.ToList(), tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item4.ToList());
            }

            else if (request.ExportType == 6)
            {
                dynamicParameters.Add("@fk_companyId", request.fk_companyid);
                spName = "SAL_ESIStatement_Monthly_Rpt";

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple.Item1 == null || tuple.Item2 == null || tuple.Item3 == null || tuple.Item4 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());


                // 👇 Always return count = 0

                // flatten into 2 tables
                var table1 = (tuple.Item1 ?? Enumerable.Empty<dynamic>())
                             .Concat(tuple.Item2 ?? Enumerable.Empty<dynamic>());
                var table2 = (tuple.Item3 ?? Enumerable.Empty<dynamic>())
                             .Concat(tuple.Item4 ?? Enumerable.Empty<dynamic>());

                return (0, table1.ToList(), table2.ToList());
                //return (0, tuple.Item1.ToList(), tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item4.ToList());
            }

            else if (request.ExportType == 37)
            {
                dynamicParameters.Add("@fk_companyId", request.fk_companyid);

                // 👉 Point this at your dedicated Challan SP if/when you create one.
                //    Until then, this reuses the ESI Statement SP since the data shape matches.
                spName = "SAL_ESIStatement_Monthly_Rpt";
                // spName = "SAL_ESIChallan_Monthly_Rpt"; // <-- use this once the dedicated SP exists

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple.Item1 == null || tuple.Item2 == null || tuple.Item3 == null || tuple.Item4 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                // flatten into 2 tables — same shape GenerateESIChallan() expects:
                //   table1 (items)  = company info (row 0) + employee ESI rows (row 1+)
                //   table2 (item2)  = summary (row 0) + totalAc summary (row 1)
                var table1 = (tuple.Item1 ?? Enumerable.Empty<dynamic>())
                             .Concat(tuple.Item2 ?? Enumerable.Empty<dynamic>());
                var table2 = (tuple.Item3 ?? Enumerable.Empty<dynamic>())
                             .Concat(tuple.Item4 ?? Enumerable.Empty<dynamic>());

                return (0, table1.ToList(), table2.ToList());
            }

            else if (request.ExportType == 39)
            {
                dynamicParameters.Add("@fk_companyId", request.fk_companyid);
                spName = "SAL_PFForm10EmpStatement_Rpt";

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(spName, dynamicParameters);

                if (tuple.Item1 == null || tuple.Item2 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                // 👇 Always return count = 0
                return (0, tuple.Item1.ToList(), tuple.Item2.ToList());
            }
            else if (request.ExportType == 40)
            {
                dynamicParameters.Add("@fk_companyId", request.fk_companyid);
                spName = "SAL_PFForm5EmpStatement_Rpt";

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(spName, dynamicParameters);

                if (tuple.Item1 == null || tuple.Item2 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                // 👇 Always return count = 0
                return (0, tuple.Item1.ToList(), tuple.Item2.ToList());
            }

            //         else if (request.ExportType == 41)
            //         {
            //             dynamicParameters.Add("@fk_companyId", request.fk_companyid);
            //             spName = "SAL_PF-Form12A_Monthly_Rpt";

            //             //var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(spName, dynamicParameters);

            //             //if (tuple.Item1 == null || tuple.Item2 == null)
            //             //    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

            //             //// 👇 Always return count = 0
            //             //return (0, tuple.Item1.ToList(), tuple.Item2.ToList());


            //             var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic, dynamic, dynamic, dynamic, dynamic, dynamic>(
            //    spName, dynamicParameters
            //);

            //             // flatten into 2 tables
            //             var employees = (tuple.Item1 ?? Enumerable.Empty<dynamic>()); // company info only
            //             var company = (tuple.Item2 ?? Enumerable.Empty<dynamic>())
            //                          .Concat(tuple.Item3 ?? Enumerable.Empty<dynamic>())
            //                          .Concat(tuple.Item4 ?? Enumerable.Empty<dynamic>())
            //                          .Concat(tuple.Item5 ?? Enumerable.Empty<dynamic>())
            //                          .Concat(tuple.Item6 ?? Enumerable.Empty<dynamic>())
            //                          .Concat(tuple.Item7 ?? Enumerable.Empty<dynamic>())
            //                          .Concat(tuple.Item8 ?? Enumerable.Empty<dynamic>())
            //                          .Concat(tuple.Item9 ?? Enumerable.Empty<dynamic>());

            //             return (0, employees.ToList(), company.ToList());



            //         }


            else if (request.ExportType == 41)
            {
                dynamicParameters.Add("@fk_companyId", request.fk_companyid);
                spName = "SAL_PF-Form12A_Monthly_Rpt";

                var resultSets = DataBaseFactory.QueryMultipleSP(spName, dynamicParameters);
                var resultList = resultSets.ToList(); // force materialization

                if (resultList == null || resultList.Count == 0)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                // Map result sets
                var companyInfo = resultList.Count > 0 ? resultList[0] : Enumerable.Empty<dynamic>();
                var employees = resultList.Count > 1 ? resultList[1] : Enumerable.Empty<dynamic>();
                var summary = resultList.Count > 2 ? resultList[2] : Enumerable.Empty<dynamic>();
                var totalAc = resultList.Count > 3 ? resultList[3] : Enumerable.Empty<dynamic>();
                var pensionCount = resultList.Count > 4 ? resultList[4] : Enumerable.Empty<dynamic>();
                var totalEmp = resultList.Count > 5 ? resultList[5] : Enumerable.Empty<dynamic>();
                var companyConfig = resultList.Count > 6 ? resultList[6] : Enumerable.Empty<dynamic>();
                var newEmployee = resultList.Count > 7 ? resultList[7] : Enumerable.Empty<dynamic>();
                var leftEmployee = resultList.Count > 8 ? resultList[8] : Enumerable.Empty<dynamic>();

                // flatten into 2 tables
                var table1 = (employees ?? Enumerable.Empty<dynamic>())
                             .Concat(summary ?? Enumerable.Empty<dynamic>())
                             .Concat(totalAc ?? Enumerable.Empty<dynamic>())
                             .Concat(pensionCount ?? Enumerable.Empty<dynamic>())
                             .Concat(totalEmp ?? Enumerable.Empty<dynamic>());

                var table2 = (companyInfo ?? Enumerable.Empty<dynamic>())
                             .Concat(companyConfig ?? Enumerable.Empty<dynamic>())
                             .Concat(newEmployee ?? Enumerable.Empty<dynamic>())
                             .Concat(leftEmployee ?? Enumerable.Empty<dynamic>());

                return (0, table1.ToList(), table2.ToList());
            }

            else
            {
                spName = "SAL_Employee_ForExport";
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList());// Normal export (Excel etc.)
            }


        }

        //Salary Slip

        public async Task<IEnumerable<dynamic>> DownloadMonthlySalarySlipAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_companyId", (object)request.fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SalTransfer", (object)request.SalTransfer, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //DataBaseFactory.QuerySP<dynamic>("SAL_SalarySlip_Monthly_Rpt", dynamicParameters).ToList());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic, dynamic, dynamic, dynamic>("SAL_SalarySlip_Monthly_Rpt", dynamicParameters, "GetAll");
            var allResults = new List<dynamic>();
            allResults.AddRange(tuple.Item1 == null ? [] : tuple.Item1.ToList());
            allResults.AddRange(tuple.Item2 == null ? [] : tuple.Item2.ToList());
            allResults.AddRange(tuple.Item3 == null ? [] : tuple.Item3.ToList());
            allResults.AddRange(tuple.Item4 == null ? [] : tuple.Item4.ToList());
            allResults.AddRange(tuple.Item5 == null ? [] : tuple.Item5.ToList());

            if (tuple.Item6 != null && tuple.Item6.Any())
            {
                dynamic leaveWrapper = new ExpandoObject();
                leaveWrapper.LeaveList = tuple.Item6.ToList(); // property name = LeaveList
                allResults.Add(leaveWrapper);
            }
            allResults.AddRange(tuple.Item7 == null ? [] : tuple.Item7.ToList());

            return allResults;

        }

        public async Task<IEnumerable<dynamic>> DownloadMonthlySalarySlipforEmpAsync(string fk_empId, string fk_monthId, string fk_yearId, string fk_companyId)
        {
            var (totalCount, employees, company, head, Leavedetail) = await DownloadMonthlySalarySlipforEmpTupleAsync(fk_empId, fk_monthId, fk_yearId, fk_companyId);
            var allResults = new List<dynamic>();
            allResults.AddRange(employees ?? Enumerable.Empty<dynamic>());
            allResults.AddRange(company ?? Enumerable.Empty<dynamic>());
            allResults.AddRange(head ?? Enumerable.Empty<dynamic>());

            if (Leavedetail != null && Leavedetail.Any())
            {
                dynamic leaveWrapper = new ExpandoObject();
                leaveWrapper.LeaveList = Leavedetail.ToList(); // property name = LeaveList
                allResults.Add(leaveWrapper);
            }

            return allResults;
        }

        public async Task<(int totalCount, IEnumerable<dynamic> employees, IEnumerable<dynamic> company, IEnumerable<dynamic> head, IEnumerable<dynamic> Leavedetail)> DownloadMonthlySalarySlipforEmpTupleAsync(string fk_empId, string fk_monthId, string fk_yearId, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empId", (object)fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic, dynamic>("SAL_SalarySlip_Monthly_Rpt_Employee", dynamicParameters, "GetAll");

            if (tuple == null)
                return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            var employees = tuple.Item2 != null ? tuple.Item2.ToList() : new List<dynamic>();
            var company = tuple.Item3 != null ? tuple.Item3.ToList() : new List<dynamic>();
            var head = tuple.Item4 != null ? tuple.Item4.ToList() : new List<dynamic>();
            var Leavedetail = tuple.Item5 != null ? tuple.Item5.ToList() : new List<dynamic>();

            return (totalCount, employees, company, head, Leavedetail);
        }

        public async Task<IEnumerable<dynamic>> ViewIncomeTaxReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine multi-select filters (Location + Department) into XML
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)request.fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fromdate", (object)request.fromdate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@todate", (object)request.todate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            // Export type ke hisaab se SP call
            if (request.ExportType == 1)
            {
                return DataBaseFactory.QuerySP<dynamic>("SAL_IT_Process_Calculator_Export", dynamicParameters).ToList();
            }
            else if (request.ExportType == 2)
            {
                return DataBaseFactory.QuerySP<dynamic>("SAL_SAL_Employee_SectionDocStatus_Export", dynamicParameters).ToList();
            }
            else if (request.ExportType == 3)
            {
                return DataBaseFactory.QuerySP<dynamic>("SAL_SAL_EmployeeRent_Mst_Export", dynamicParameters).ToList();
            }
            else
            {
                dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                return (DataBaseFactory.QuerySP<dynamic>("SAL_Employee_ForExport", dynamicParameters).ToList());
            }
        }





        public async Task<IEnumerable<dynamic>> GetSalaryHeadShortDescActiveAsync()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            var result = DataBaseFactory.QuerySP<dynamic>(
                "SAL_SalaryHead_ShortDesc_Active",
                dynamicParameters
            );

            return result;
        }


        //public async Task<dynamic> GetCompanyNameAsync()
        //{
        //    // Call SP without parameters
        //    var resultList = DataBaseFactory.QuerySP<dynamic>(
        //        "GetCompanyName",
        //        null // no parameters
        //    );

        //    // Return first row
        //    return resultList.FirstOrDefault();
        //}
        public async Task<dynamic> GetCompanyNameAsync(string fk_companyid)
        {
            // Call SP without parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_companyid", (object)fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var resultList = DataBaseFactory.QuerySP<dynamic>(
                "GetCompanyName",
                dynamicParameters // no parameters
            );

            // Return first row
            return resultList.FirstOrDefault();
        }

        //added code Anjali Starts 24-01-2026



        public async Task<(int totalCount, IEnumerable<dynamic>)> ViewComplianceReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@fk_finid", request.fk_finid, DbType.String);

            // If employee filter needed
            // dynamicParameters.Add("@empcode", request.EmpCode, DbType.String);




            dynamicParameters.Add("@pageindex", (object)request.pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)request.pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //  dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);


            if (request.ExportType == 1)
            {
                dynamicParameters.Add("@ExportType", (object)"", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                // Call Compliance Stored Procedure
                var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                    "[SP_GetForm3AData_ForExcle]",
                    dynamicParameters
                );

                if (result == null || result.Item2 == null)
                    return (0, Enumerable.Empty<dynamic>());

                int totalCount = result.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : result.Item2.Count();

                return (totalCount, result.Item2.ToList());
            }

            else if (request.ExportType == 2)
            {
                // Call Compliance Stored Procedure
                var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                    "VIL_BonusRegisterC",
                    dynamicParameters
                );

                if (result == null || result.Item2 == null)
                    return (0, Enumerable.Empty<dynamic>());

                int totalCount = result.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : result.Item2.Count();

                return (totalCount, result.Item2.ToList());
            }

            else
            {
                // Call Compliance Stored Procedure
                var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                    "VIL_BonusRegisterC",
                    dynamicParameters
                );

                if (result == null || result.Item2 == null)
                    return (0, Enumerable.Empty<dynamic>());

                int totalCount = result.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : result.Item2.Count();

                return (totalCount, result.Item2.ToList());
            }

        }






        public async Task<(dynamic header, IEnumerable<dynamic> contributions)> PFForm3(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            // dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            // dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);
            dynamicParameters.Add("@fk_finid", request.fk_finid);

            string spName;
            if (request.ExportType == 1)
            {
                dynamicParameters.Add("@ExportType", "A");
            }

            spName = "SAL_Employee_Complaince_ForPDF";

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "[SP_GetForm3AData]",
                dynamicParameters,
                "GetAll"
            );

            var header = tuple.Item1?.FirstOrDefault();     // Employee + establishment
            var contributions = tuple.Item2 ?? Enumerable.Empty<dynamic>(); // Monthly data

            return (header, contributions);
        }


        //anjali code 24jan2026 ends


        public async Task<(int totalCount, IEnumerable<dynamic>)> GetOvertimeDataPdfAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);
            dynamicParameters.Add("@ExportType", "A");

            string spName = "[SAL_Employee_Overtime_ForPDF]";

            var tuple = await Task.Run(() => DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(spName, dynamicParameters));

            if (tuple == null || tuple.Item1 == null || tuple.Item2 == null)
                return (0, Enumerable.Empty<dynamic>());

            // Item1 = Total Count, Item2 = Overtime Data
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }


        public async Task<(int totalCount, IEnumerable<dynamic>)> ViewSalaryPayoutPdfAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@pageindex", (object)request.pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)request.pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@empcode", (object)request.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)request.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)request.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)request.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)request.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)request.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)request.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)request.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)request.fk_costcentreid);
            dynamicParameters.Add("@sortby", (object)request.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ExportType", (object)"A", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FilterBatchKey", (object)request.reportType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Employee_SalaryPayout_PDF", dynamicParameters);

            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }






        public async Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFSalarySlip(ReportModelRequest request, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);
            dynamicParameters.Add("@fk_companyId", fk_companyId);


            // 👇 Decide based on ExportType
            string spName;
            if (request.ExportType == 2)
            {
                dynamicParameters.Add("@pageindex", request.pageIndex);
                dynamicParameters.Add("@pagesize", request.pageSize);

                dynamicParameters.Add("@sortby", request.SortBy);

                dynamicParameters.Add("@ExportType", "A");
                spName = "SAL_Employee_Salary_Register_V2";   // Salay export for PDF
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null || tuple.Item4 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item4.ToList(), tuple.Item5 != null ? tuple.Item5.ToList() : Enumerable.Empty<dynamic>());

                //if (tuple == null || tuple.Item2 == null || tuple.Item3 == null) return (0, [], []);

                //int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                //    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                //    : 0;

                //return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList());
            }


            else
            {
                spName = "SAL_Employee_Salary_Register";
                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic, dynamic>(spName, dynamicParameters);

                if (tuple == null || tuple.Item2 == null || tuple.Item3 == null)
                    return (0, Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>(), Enumerable.Empty<dynamic>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList(), tuple.Item3.ToList(), tuple.Item3.ToList(), tuple.Item5 != null ? tuple.Item5.ToList() : Enumerable.Empty<dynamic>());// Normal export (Excel etc.)
            }


        }




    }
}
