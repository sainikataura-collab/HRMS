using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
namespace HRMSWebAPI.Repository
{
    public class LevelRepository : ILevelRepository
    {
        public async Task<bool> InsertLevelAsync(LevelMst level)
        {


            string xmlData = null;

            if (level.IsReimbursmentAllowed && level.ReimbHeads != null && level.ReimbHeads.Count > 0)
            {
                var dataMst = new ReimbHeadXml
                {
                    Heads = level.ReimbHeads
                };

                xmlData = XmlUtility.XmlSerializeToString(dataMst);
            }

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Level", level.Level, DbType.String);
            dynamicParameters.Add("@VariablePayPercent", level.VariablePayPercent, DbType.Decimal);
            dynamicParameters.Add("@IsReimbursmentAllowed", level.IsReimbursmentAllowed, DbType.Boolean);
            dynamicParameters.Add("@description", (object)level.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)level.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)level.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ReimbXml", xmlData, DbType.Xml);
            int result = DataBaseFactory.QuerySP("SAL_Level_Ins", dynamicParameters, "LevelDetails_Insert");
            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<LevelMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LevelMst>("SAL_Level_SelForGrid", dynamicParameters, "LevelDetails_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            // Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }

        //public async Task<LevelMst> GetLevelByIdAsync(string levelId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pk_levelid", (object)levelId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    return DataBaseFactory.QuerySP<LevelMst>("SAL_Level_Edit", (object)dynamicParameters, "Level Details - GetById").FirstOrDefault<LevelMst>();
        //}

        public async Task<(LevelMst Level, IEnumerable<dynamic> Heads)> GetLevelByIdAsync(string levelId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_levelid", levelId, DbType.String);

            var result = DataBaseFactory.QueryMultipleSP<LevelMst, dynamic>(
                "SAL_Level_Edit",
                dynamicParameters,
                "Level Details - GetById"
            );

            if (result == null)
                return (null, null);

            var level = result.Item1?.FirstOrDefault();
            var heads = result.Item2?.ToList();

            return (level, heads);
        }

        //public async Task<bool> UpdateLevelAsync(LevelMst level)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@@pk_levelid", (object)level.pk_levelid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@description", (object)level.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@Timestamp", (object)level.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    // Execute stored procedure for update
        //    int n = DataBaseFactory.QuerySP("SAL_Level_Upd", dynamicParameters, "Level_Detais_Update");
        //    return n > 0; // Return true if rows were affected
        //}
        public async Task<bool> UpdateLevelAsync(LevelMst level)
        {
            string xmlData = null;

            if (level.IsReimbursmentAllowed && level.ReimbHeads != null && level.ReimbHeads.Count > 0)
            {
                var dataMst = new ReimbHeadXml
                {
                    Heads = level.ReimbHeads
                };

                xmlData = XmlUtility.XmlSerializeToString(dataMst);
            }

            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_levelid", level.pk_levelid, DbType.String);
            dynamicParameters.Add("@description", level.description, DbType.String);
            dynamicParameters.Add("@Level", level.Level, DbType.String);
            dynamicParameters.Add("@VariablePayPercent", level.VariablePayPercent, DbType.Decimal);
            dynamicParameters.Add("@IsReimbursmentAllowed", level.IsReimbursmentAllowed, DbType.Boolean);
            dynamicParameters.Add("@ReimbXml", xmlData, DbType.Xml);
            dynamicParameters.Add("@fk_locid", level.fk_locid, DbType.String);
            dynamicParameters.Add("@fk_companyId", level.fk_companyId, DbType.String);
            dynamicParameters.Add("@Timestamp", level.Timestamp, DbType.Binary);

            int n = DataBaseFactory.QuerySP(
                "SAL_Level_Upd",
                dynamicParameters,
                "Level_Update"
            );

            return n > 0;
        }

        public async Task<bool> DeleteLevelMstAsync(string levelId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_levelid", (object)levelId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("SAL_Level_Del", dynamicParameters, "Level_Details_Delete");
            return n > 0; // Return true if rows were affected
        }

        public async Task<IEnumerable<dynamic>> GetReimbursementHeads(string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "SAL_Head_Sel_Reimb",
                dynamicParameters,
                "Reimb Heads - GetAll"
            );

            return result;
        }

    }
}
