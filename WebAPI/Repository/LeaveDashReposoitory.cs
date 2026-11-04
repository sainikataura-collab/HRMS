using Dapper;
using HRMSWebAPI.Helper;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class LeaveDashReposoitory :  ILeaveDashReposoitory
    {




        //public async Task<dynamic> GetLeaveDashboardAsync(int month, int year, string empId)
        //{
        //    DynamicParameters parameters = new DynamicParameters();
        //    parameters.Add("@Month", month, DbType.Int32);
        //    parameters.Add("@Year", year, DbType.Int32);
        //    parameters.Add("@EmpId", empId, DbType.String);

        //    using (var connection = DataBaseFactory.ConnString())
        //    {
        //        using (var multi = await connection.QueryMultipleAsync(
        //            "dbo.leave_dashboard",
        //            parameters,
        //            commandType: CommandType.StoredProcedure))
        //        {
        //            // SP returns 2 result sets: 1st -> Leave Summary, 2nd -> Trend
        //            var leaveSummary = (await multi.ReadAsync<dynamic>()).ToList();
        //            var leaveTrend = (await multi.ReadAsync<dynamic>()).ToList();
        //            var ELCLAL = (await multi.ReadAsync<dynamic>()).ToList();

        //            return new
        //            {
        //                LeaveSummary = leaveSummary,
        //                LeaveTrend = leaveTrend,
        //                ELCLAL = ELCLAL

        //            };
        //        }
        //    }
        //}


        public async Task<dynamic> GetLeaveDashboardAsync(int month, int year, string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Month", month, DbType.Int32);
            parameters.Add("@Year", year, DbType.Int32);
            parameters.Add("@EmpId", empId, DbType.String);

            using (var connection = DataBaseFactory.ConnString())
            {
                using (var multi = await connection.QueryMultipleAsync(
                    "dbo.leave_dashboard",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    // SP returns 3 result sets: 
                    // 1 -> LeaveSummary (Approved/Pending/Rejected)
                    // 2 -> LeaveTrend (if required)
                    // 3 -> ELCLAL (leave balances CL/EL/etc.)
                    var leaveSummary = (await multi.ReadAsync<dynamic>()).ToList();
                    var leaveTrend = (await multi.ReadAsync<dynamic>()).ToList();
                    var monthly = (await multi.ReadAsync<dynamic>()).ToList();
                    var elclal = (await multi.ReadAsync<dynamic>()).ToList();

                    return new
                    {
                        LeaveSummary = leaveSummary,
                        LeaveTrend = leaveTrend,
                        Monthly = monthly,
                        ELCLAL = elclal
                        
                    };
                }
            }
        }

        public async Task<dynamic> GetUserDashboardAsync(int month, int year, string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Month", month, DbType.Int32);
            parameters.Add("@Year", year, DbType.Int32);
            parameters.Add("@Fk_UserId", empId, DbType.String);

            // Use same pattern as your example
            var result = DataBaseFactory.QuerySP<dynamic>(
                "User_Dashboard",
                parameters,
                "[User_Dashboard] Details"
            ).FirstOrDefault();

            return result;
        }


        public async Task<dynamic> GetHRDashboardAsync(int month, int year, string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Month", month, DbType.Int32);
            parameters.Add("@Year", year, DbType.Int32);
            parameters.Add("@Fk_UserId", empId, DbType.String);

            // Use same pattern as your example
            var result = DataBaseFactory.QuerySP<dynamic>(
                "HR_Dashboard",
                parameters,
                "[HR_Dashboard] Details"
            ).FirstOrDefault();

            return result;
        }
        public async Task<dynamic> GetTaskboxDashboard(int month, int year)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Month", month, DbType.Int32);
            parameters.Add("@Year", year, DbType.Int32);


            // Use same pattern as your example
            var result = DataBaseFactory.QuerySP<dynamic>(
                "Taskbox_Dashboard",
                parameters,
                "[Taskbox_Dashboard] Details"
            ).FirstOrDefault();

            return result;
        }

        public async Task<dynamic> GetEmpmanagementDashboard(int month, int year, string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Month", month);
            parameters.Add("@Year", year);
            parameters.Add("@Fk_UserId", empId);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "EmployeeManagement_Dashboard",
                parameters
            );

            var result = new
            {
                Summary = tuple?.Item2?.FirstOrDefault(),
                Employees = tuple?.Item1?.ToList()

            };

            return result;
        }

        public async Task<dynamic> GetAttendanceDashboard(int month, int year, string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_monthId", month);
            parameters.Add("@fk_yearId", year);
            parameters.Add("@Fk_UserId", empId);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "Attendance_Dashboard",
                parameters
            );

            var result = new
            {
                Summary = tuple?.Item1?.FirstOrDefault(),
                leave = tuple?.Item2?.ToList()

            };

            return result;
        }

        public async Task<dynamic> GetleaveDashboard(int month, int year, string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_monthId", month);
            parameters.Add("@fk_yearId", year);
            parameters.Add("@Fk_UserId", empId);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>(
                "AdminLeave_Dashboard",
                parameters
            );

            var result = new
            {
                Summary = tuple?.Item1?.FirstOrDefault(),
                leave = tuple?.Item2?.ToList(),
                leavebalance = tuple?.Item3?.ToList()

            };

            return result;
        }


    }
}
