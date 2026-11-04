using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class SalaryDashboardRepository : ISalaryDashboardRepository
    {


        //public async Task<dynamic> EMPSalaryDetails(string Month, string Year, string EmpId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_monthId", (object)Month, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_yearId", (object)Year, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    var result = DataBaseFactory.QuerySP<dynamic>("usp_GetSalaryDashboard", dynamicParameters, "EMP_Salary Details");
        //    return result;

        //}


        public async Task<(dynamic SalaryOverview, dynamic AnnualTrend)> EMPSalaryDetails(string Month, string Year, string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", EmpId, DbType.String);
            dynamicParameters.Add("@fk_monthId", Month, DbType.Int32);
            dynamicParameters.Add("@fk_yearId", Year, DbType.Int32);

            using (var connection = DataBaseFactory.ConnString()) // however you create your DB connection
            {
                using (var multi = await connection.QueryMultipleAsync(
                    "[SAL_GetSalaryDashboard]",
                    dynamicParameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var salaryOverview = await multi.ReadFirstOrDefaultAsync<dynamic>();
                    var annualTrend = await multi.ReadFirstOrDefaultAsync<dynamic>();

                    return (salaryOverview, annualTrend);
                }
            }
        }




    }
}
