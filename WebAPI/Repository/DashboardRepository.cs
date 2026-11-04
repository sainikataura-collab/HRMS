using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class DashboardRepository:IDashboardRepository
    {
        //get All
        public async Task<(int totalCount, IEnumerable<DashboardMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, DashboardMst>("HR_Dashboard_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<DashboardMst> GetByIdAsync(int pk_dashId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_dashId", (object)pk_dashId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<DashboardMst>("HR_Dashboard_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<DashboardMst>();
        }

        public async Task<bool> DeleteAsync(int pk_dashId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_dashId", (object)pk_dashId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_Dashboard_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertAsync(DashboardMst DashboardMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)DashboardMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@dated", (object)DashboardMst.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@active", (object)DashboardMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@remarks", (object)DashboardMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)DashboardMst.fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)DashboardMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
             dynamicParameters.Add("@fk_companyId", (object)DashboardMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("HR_Dashboard_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }


        public async Task<bool> UpdateAsync(DashboardMst DashboardMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_dashId", (object)DashboardMst.pk_dashId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@description", (object)DashboardMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@dated", (object)DashboardMst.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@active", (object)DashboardMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@remarks", (object)DashboardMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)DashboardMst.fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)DashboardMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@timestamp", (object)DashboardMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("HR_Dashboard_Upd", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }

    }
}
