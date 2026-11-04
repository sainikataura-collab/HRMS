using Dapper;
using HRMSWebAPI.Helper;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ExitDashboardRepository : IExitDashboardRepository
    {
        public async Task<dynamic> GetExitDashboardAsync(int month, int year)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Month", month, DbType.Int32);
            parameters.Add("@Year", year, DbType.Int32);

            using (var connection = DataBaseFactory.ConnString())
            {
                using (var multi = await connection.QueryMultipleAsync(
                    "dbo.Emp_ExitDashboard_Sel",
                    parameters,
                    commandType: CommandType.StoredProcedure))
                {
                    var summary = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
                    var processOverview = (await multi.ReadAsync<dynamic>()).ToList();
                    var recentExitList = (await multi.ReadAsync<dynamic>()).ToList();
                    var latestTimeline = (await multi.ReadAsync<dynamic>()).ToList();
                    var attentionList = (await multi.ReadAsync<dynamic>()).ToList();
                    var exitReasonSummary = (await multi.ReadAsync<dynamic>()).ToList();

                    return new
                    {
                        totalExit = summary?.TotalExit ?? 0,
                        completed = summary?.Completed ?? 0,
                        inProgress = summary?.InProgress ?? 0,
                        noticePeriod = summary?.NoticePeriod ?? 0,
                        processOverview,
                        recentExitList,
                        latestTimeline,
                        attentionList,
                        exitReasonSummary
                    };
                }
            }
        }
    }
}
