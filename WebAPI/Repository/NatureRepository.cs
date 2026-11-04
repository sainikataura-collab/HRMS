using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class NatureRepository : INatureRepository
    {
        public async Task<bool> InsertNatureMstAsync(NatureMst NatureMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@Nature", (object)NatureMst.Nature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)NatureMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)NatureMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)NatureMst.fk_CompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_Nature_Ins", dynamicParameters, "NatureMst_Insert");

            return n > 0; // Return true if rows were affected
        }
        
        public async Task<(int totalCount, IEnumerable<NatureMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, NatureMst>("SAL_Nature_SelForGrid", dynamicParameters, "NatureMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<NatureMst> GetNatureByIdAsync(string natureId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_natureid", (object)natureId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<NatureMst>("SAL_Nature_Edit", (object)dynamicParameters, "Nature Master - GetById").FirstOrDefault<NatureMst>();
        }

        public async Task<bool> UpdateNatureMstAsync(NatureMst NatureMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_natureid", (object)NatureMst.pk_natureid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Nature", (object)NatureMst.Nature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)NatureMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)NatureMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Timestamp", (object)NatureMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());



            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Nature_Upd", dynamicParameters, "Nature_Mst_Update");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteNatureMstAsync(string natureId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_natureid", (object)natureId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Nature_Del", dynamicParameters, "Nature_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }

    }
}
