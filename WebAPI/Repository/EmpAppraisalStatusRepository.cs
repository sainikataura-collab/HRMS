using Dapper;
using HRMSWebAPI.Helper;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmpAppraisalStatusRepository:IEmpAppraisalStatusRepository
    {

        public async Task<(int TotalRecords, IEnumerable<dynamic> Records)> GetStatusAsync(
    int pageIndex,
    int pageSize,
    string? searchTerm)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@PageIndex", pageIndex, DbType.Int32);
            parameters.Add("@PageSize", pageSize, DbType.Int32);
            parameters.Add("@searchTerm", searchTerm, DbType.String);

            var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "App_Emp_Appraisal_Status_Rpt",
                parameters,
                "GetReportAsync"
            );

            if (result == null || result.Item2 == null)
                return (0, []);

            int totalCount = result.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, result.Item2.ToList());
        }


        public async Task<(int TotalRecords, IEnumerable<dynamic> Records)> GetStatusPdfAsync(string empcode)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@empcode", empcode, DbType.String);

            var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "App_Emp_Appraisal_Status_Rptpdf",
                parameters,
                "GetStatusPdfAsync"
            );

            if (result == null || result.Item1 == null)
                return (0, []);

            var records = result.Item1.ToList();
            int totalCount = records.Count;

            return (totalCount, records);
        }


    }
}
