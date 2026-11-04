using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class SkipAttributeRepository:ISkipAttributeRepository
    {

        //get All
        public async Task<(int totalCount, IEnumerable<SkipAttributeMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, SkipAttributeMst>("SKP_Attribute_Mst_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<SkipAttributeMst> GetByIdAsync(string pk_attributeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_attributeId", (object)pk_attributeId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<SkipAttributeMst>("SKP_Attribute_Mst_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<SkipAttributeMst>();
        }

        public async Task<bool> DeleteAsync(string pk_attributeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_attributeId", (object)pk_attributeId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SKP_Attribute_Mst_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertAsync(SkipAttributeMst SkipAttributeMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)SkipAttributeMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@orderNo", (object)SkipAttributeMst.orderNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@isActive", (object)SkipAttributeMst.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
           dynamicParameters.Add("@fk_companyId", (object)SkipAttributeMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)SkipAttributeMst.fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)SkipAttributeMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SKP_Attribute_Mst_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }


        public async Task<bool> UpdateAsync(SkipAttributeMst SkipAttributeMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_attributeId", (object)SkipAttributeMst.pk_attributeId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@description", (object)SkipAttributeMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@orderNo", (object)SkipAttributeMst.orderNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@isActive", (object)SkipAttributeMst.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)SkipAttributeMst.fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)SkipAttributeMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SKP_Attribute_Mst_Upd", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }

    }
}
