using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class RoleRepository:IRoleRepository
    {


        public async Task<(int totalCount, IEnumerable<RoleMst>)> GetAll(int pageindex, int pagesize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, RoleMst>("UM_Role_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<RoleMst> GetByIdAsync(string pk_roleId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_roleId", (object)pk_roleId, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<RoleMst>("UM_Role_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<RoleMst>();
        }

        public async Task<bool> DeleteAsync(string pk_roleId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_roleId", (object)pk_roleId, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("UM_Role_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertAsync(RoleMst roleMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@rolename", (object)roleMst.rolename, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@mappedalias", (object)roleMst.mappedalias, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@rolelevel", (object)roleMst.rolelevel, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@remarks", (object)roleMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
           


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("UM_Role_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }


        public async Task<bool> UpdateAsync(RoleMst roleMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_roleId", (object)roleMst.pk_roleId, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@rolename", (object)roleMst.rolename, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@mappedalias", (object)roleMst.mappedalias, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@rolelevel", (object)roleMst.rolelevel, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@remarks", (object)roleMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());



            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("UM_Role_Upd", dynamicParameters, "update");

            return n > 0; // Return true if rows were affected

        }
    }
}
