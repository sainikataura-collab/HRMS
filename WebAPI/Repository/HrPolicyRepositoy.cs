using Dapper;
using HRMSWebAPI.Controllers;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class HrPolicyRepositoy:IHrPolicyRepositoy
    { 
        public async Task<(int totalCount, IEnumerable<HrPolicyMst>)> GetAllFileDownloads(string fk_empid, string filetype, string fk_companyId)
        {
              DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@filetype", filetype, DbType.String);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HrPolicyMst>("HR_AllFileDownload_SelForRepeater", dynamicParameters, "GetAll");
            //    if (tuple == null || tuple.Item2 == null) return (0, []);
            //    //Convert Total Count
            //    int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
            //        ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            // return (totalCount, tuple?.Item2?.ToList());
            var result = await Task.Run(() =>
               DataBaseFactory.QuerySP<HrPolicyMst>(
            "HR_AllFileDownload_SelForRepeater",
            dynamicParameters,
            "GetAllFileDownloads"
        ));

            return (result.Count(), result);

        }



    }
}
