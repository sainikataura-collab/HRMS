using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class VisitorRepository : IVisitorRepository
    {
        public async Task<(int totalCount, IEnumerable<VisitorMst>)> GetAllVisitorsAsync(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, VisitorMst>(
                "VST_Visitor_Mst_SelForGrid",
                dynamicParameters,
                "Visitor_GetAll"
            );

            if (tuple == null || tuple.Item2 == null)
                return (0, []);

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }

    }
}
