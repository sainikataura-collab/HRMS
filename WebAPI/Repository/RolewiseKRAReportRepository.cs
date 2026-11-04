using Dapper;
using DocumentFormat.OpenXml.EMMA;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class RolewiseKRAReportRepository:IRolewiseKRAReportRepository
    {

        public async Task<(int totalCount, IEnumerable<dynamic>)> GetAll(int pageIndex, int pageSize, string? RoleId, string? searchTerm)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            //dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@RoleId", (object)RoleId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_Rolewise_Report", dynamicParameters, "SAL_Rolewise_Report");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }




    }
}
