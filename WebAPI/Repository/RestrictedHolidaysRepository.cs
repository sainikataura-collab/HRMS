
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class RestrictedHolidaysRepository : IRestrictedHolidaysRepository
       
    {
        public async Task<IEnumerable<RestrictedHolidaysMst>> GetAll(string? fk_yearid , string? fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_yearid", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var res = DataBaseFactory.QuerySP<RestrictedHolidaysMst>("SAL_RestrictedHolidays_GridList", dynamicParameters, "RestrictedHolidaysMst_GetAll").ToList();

            return (res);
          
        }

        //For Gazatted

        public async Task<IEnumerable<RestrictedHolidaysMst>> GetAllGazatted(string? fk_yearid, string? fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_yearid", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var res = DataBaseFactory.QuerySP<RestrictedHolidaysMst>("SAL_Holiday_GridList", dynamicParameters, "Holiday_GridList_GetAll").ToList();

            return (res);

        }



        //public async Task<(int totalCount, IEnumerable<RestrictedHolidaysMst>)> GetAll(string? fk_yearid = null, string? fk_empid = null)
        //    {
        //        DynamicParameters dynamicParameters = new DynamicParameters();
        //        dynamicParameters.Add("@fk_yearid", fk_yearid ?? "");
        //        dynamicParameters.Add("@fk_empid", fk_empid ?? "");

        //        // Assume you have a helper that wraps Dapper's Query
        //        var result = await DataBaseFactory.QueryAsync<RestrictedHolidaysMst>(
        //            "SAL_RestrictedHolidays_GridList",
        //            dynamicParameters,
        //            commandType: CommandType.StoredProcedure
        //        );

        //        return (result.Count(), result);
        //    }



    }
}
