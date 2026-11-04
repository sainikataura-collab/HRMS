using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class PerquisiteRepository:IPerquisiteRepository
    {
        //for insert 
        public async Task<bool>InsertperquisitesAsync(PerquisiteMst perquisite, string fk_locId, string fk_userId,string fk_companyId)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@description", (object)perquisite.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_Perquisite_Ins", dynamicParameters, "perquiste_Insert");

            return result > 0;
        }


        //for get all
        public async Task<(int totalCount, IEnumerable<PerquisiteMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, PerquisiteMst>("SAL_Perquisite_SelForGrid", dynamicParameters, "Perquistices_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }
        //get by id
        public async Task<PerquisiteMst>GetperquisitesByIdAsync(string perquisiteId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_perkId", (object)perquisiteId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
             return DataBaseFactory.QuerySP<PerquisiteMst>("SAL_Perquisite_Edit", (object)dynamicParameters, "perquisite Master - GetById").FirstOrDefault<PerquisiteMst>();
           
        }
        //for delete
        public async Task<bool>DeleteperquisitesAsync(string perquisiteId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_perkId", (object)perquisiteId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Perquisite_Del", dynamicParameters, "perquisite_mst_Delete");

            return n > 0; // Return true if rows were affected
        }
        //for update
        public async Task<bool> UpdatePerquisitesAsync(PerquisiteMst perquisite, string fk_locId, string fk_userId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("pk_perkId", (object)perquisite.pk_perkId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)perquisite.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)perquisite.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Perquisite_Upd", dynamicParameters, "perquiste_Mst_Update");

            return n > 0; // Return true if rows were affected
        }

    }
}
