using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class HrLetterRepository:IHrLetterRepository
    {
        //public async Task<(int totalCount, IEnumerable<HrLetterMst>)> GetAllFileDownload(string fk_empid, string filetype, string fk_companyId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
        //    dynamicParameters.Add("@filetype", filetype, DbType.String);
        //    dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

        //    //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HrPolicyMst>("HR_AllFileDownload_SelForRepeater", dynamicParameters, "GetAll");
        //    //    if (tuple == null || tuple.Item2 == null) return (0, []);
        //    //    //Convert Total Count
        //    //    int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
        //    //        ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

        //    // return (totalCount, tuple?.Item2?.ToList());
        //    var result = await Task.Run(() =>
        //       DataBaseFactory.QuerySP<HrLetterMst>(
        //    "HR_AllFileDownload_SelForRepeater",
        //    dynamicParameters,
        //    "GetAllFileDownloads"
        //));

        //    return (result.Count(), result);

        //}

        // ✅ CHANGED: Simplified signature and procedure call
        public async Task<IEnumerable<HrLetterMst>> GetEmployeeHRLetters(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);

            // ✅ CHANGED: Call new procedure HR_Format_SelForEmployeeRepeater
            var result = await Task.Run(() =>
                DataBaseFactory.QuerySP<HrLetterMst>(
                    "HR_Format_SelForEmployeeLetter",  // ✅ NEW PROCEDURE
                    dynamicParameters,
                    "GetEmployeeHRLetters"
                ));

            return result ?? Enumerable.Empty<HrLetterMst>();
        }

    }
}
