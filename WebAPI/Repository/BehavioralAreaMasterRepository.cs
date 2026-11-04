using Dapper;
using DocumentFormat.OpenXml.Wordprocessing;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
namespace HRMSWebAPI.Repository
{
    public class BehavioralAreaMasterRepository : IBehavioralAreaMasterRepository
    {
        public async Task<bool> InsertBehavioralAreaMasterAsync(BehavioralAreaMasterModel model, string fk_userid, string fk_locid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@description", (object)model.Description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@weightage", (object)model.Weightage, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@orderby", (object)model.OrderBy, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)model.IsActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)model.remark, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("APP_BehavioralArea_Ins", dynamicParameters, "APP_BehavioralArea_Ins");
            return result > 0;
        }


        //Get All code
        public async Task<(int totalCount, IEnumerable<BehavioralAreaMasterModelList>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, BehavioralAreaMasterModelList>("APP_BehavioralArea_SelForGrid", dynamicParameters, "APP_BehavioralArea_SelForGrid");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                            ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }





        //GetById
        public async Task<BehavioralAreaMasterModelBYID> GetBehavioralByIdAsync(long pk_behaveid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_behaveid", (object)pk_behaveid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<BehavioralAreaMasterModelBYID>("APP_BehavioralArea_Edit", (object)dynamicParameters, "APP_BehavioralArea_Edit").FirstOrDefault<BehavioralAreaMasterModelBYID>();
        }




        //Update
        public async Task<bool> UpdateBehavioralAsync(BehavioralAreaMasterModel model, string fk_userid, string fk_locid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)model.Description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@weightage", (object)model.Weightage, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@orderby", (object)model.OrderBy, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)model.IsActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)model.remark, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pk_behaveid", (object)model.pk_behaveid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("APP_BehavioralArea_Upd", dynamicParameters, "APP_BehavioralArea_Upd");

            return n > 0; // Return true if rows were affected
        }










        //Delete Code Code
        public async Task<bool> DeleteBehavioralAreaMasterAsync(long pk_behaveid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_behaveid", (object)pk_behaveid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("APP_BehavioralArea_Del", dynamicParameters, "APP_BehavioralArea_Del");

            return n > 0; // Return true if rows were affected
        }
































    }
}
