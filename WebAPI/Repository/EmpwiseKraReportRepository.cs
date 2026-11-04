using Dapper;
using HRMSWebAPI.Helper;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmpwiseKraReportRepository:IEmpwiseKraReportRepository
    {


        public async Task<(int TotalRecords, IEnumerable<dynamic> Records)> GetKRAReportAsync(
       string? fk_empId,
       int pageIndex,
       int pageSize,
       string? searchTerm)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@fk_empId", fk_empId, DbType.String);
            parameters.Add("@PageIndex", pageIndex, DbType.Int32);
            parameters.Add("@PageSize", pageSize, DbType.Int32);
            parameters.Add("@searchTerm", searchTerm, DbType.String);

            var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "App_Draft_KRA_Employeewise_Rpt",
                parameters,
                "GetKRAReportAsync"
            );

            if (result == null || result.Item2 == null)
                return (0, []);

            int totalCount = result.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, result.Item2.ToList());
        }
    }

}
