
    using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Linq;
namespace HRMSWebAPI.Repository
{
    public class LanguageMasterRepository : ILanguageMasterRepository
    {

        // Insert master

        public async Task<bool> InsertLanguageMasterMstAsync(LanguageMasterMst LanguageMasterMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@description", (object)LanguageMasterMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)LanguageMasterMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)LanguageMasterMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)LanguageMasterMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("HR_Language_Ins", dynamicParameters, "LanguageMasterMst_Insert");
            return n > 0; // Return true if rows were affected
        }



      

        public async Task<(int totalCount, IEnumerable<LanguageMasterMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LanguageMasterMst>("HR_Language_SelForGrid", dynamicParameters, "Language Master_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }



        public async Task<LanguageMasterMst> GetLanguageMasterByIdAsync(long pk_langid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_langid", (object)pk_langid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<LanguageMasterMst>("HR_Language_Edit", (object)dynamicParameters, "Language Master - GetById").FirstOrDefault<LanguageMasterMst>();
        }


        public async Task<bool> UpdateLanguageMasterAsync(LanguageMasterMst LanguageMasterMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_langid", (object)LanguageMasterMst.pk_langid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)LanguageMasterMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)LanguageMasterMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID ", (object)LanguageMasterMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@timestamp", (object)LanguageMasterMst.timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("HR_Language_Upd", dynamicParameters, "Language_Master_Update");

            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> DeleteLanguageMasterMstAsync(long pk_langid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_langid", (object)pk_langid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_Language_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }


    }
}
