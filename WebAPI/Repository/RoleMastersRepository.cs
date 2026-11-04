using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class RoleMastersRepository:IRoleMastersRepository
    {
        public async Task<(int totalCount, IEnumerable<RoleMastersMst>)> GetAll(int pageindex, int pagesize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, RoleMastersMst>("Role_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<RoleMastersMst> GetByIdAsync(int RoleId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RoleId", (object)RoleId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<RoleMastersMst>("Role_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<RoleMastersMst>();
        }

        public async Task<bool> DeleteAsync(int RoleId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RoleId", (object)RoleId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("Role_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertAsync(RoleMastersMst roleMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RoleName", (object)roleMst.RoleName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Description", (object)roleMst.Description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@IsActive", (object)roleMst.IsActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());



            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Role_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }


        public async Task<bool> UpdateAsync(RoleMastersMst roleMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RoleId", (object)roleMst.RoleId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@RoleName", (object)roleMst.RoleName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Description", (object)roleMst.Description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@IsActive", (object)roleMst.IsActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Role_Upd", dynamicParameters, "update");

            return n > 0; // Return true if rows were affected

        }

    }
}
