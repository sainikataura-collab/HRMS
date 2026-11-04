using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using SixLabors.Fonts;
using System.Data;
using System.Linq;
 

namespace HRMSWebAPI.Repository
{
    public class CostRepository : ICostRepository
    {
        public async Task<bool> InsertCostMstAsync(CostMst CostMst, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@code", (object)CostMst.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)CostMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_Cost_Centre_Mst_Ins", dynamicParameters, "CostMst_Insert");
            return n > 0; // Return true if rows were affected
        }


        public async Task<(int totalCount, IEnumerable<CostMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CostMst>("SAL_Cost_Centre_Mst_SelForGrid", dynamicParameters, "CostMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<CostMst> GetCostMstByIdAsync(long functionalId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cost_centre_id", (object)functionalId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<CostMst>("SAL_Cost_Centre_Mst_Edit", (object)dynamicParameters, "CostMst - GetById").FirstOrDefault<CostMst>();
        }


        public async Task<bool> UpdateCostMstAsync(CostMst CostMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cost_centre_id", (object)CostMst.pk_cost_centre_id, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@code", (object)CostMst.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)CostMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Cost_Centre_Mst_Upd", dynamicParameters, "CostMst_Update");

            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> DeleteCostMstAsync(long functionalId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cost_centre_id", (object)functionalId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Cost_Centre_Mst_Del", dynamicParameters, "CostMst_Delete");

            return n > 0; // Return true if rows were affected
        }

    }
}
