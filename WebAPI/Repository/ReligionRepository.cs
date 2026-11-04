using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.ComponentModel.Design;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class ReligionRepository : IReligionRepository
    {
        public async Task<bool> InsertReligionMst(RegligionMst RegligionMaster)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Religion", (object)RegligionMaster.Religiontype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)RegligionMaster.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)RegligionMaster.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_CompanyId", (object)RegligionMaster.Fk_CompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_Religion_Ins", dynamicParameters, "RegligionMaster_Insert");
            return n > 0; // Return true if rows were affected
        }

        public async Task<(int totalCount, IEnumerable<RegligionMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, RegligionMst>("SAL_Religion_SelForGrid", dynamicParameters, "RegligionMaster_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0 , []);
            // Convert TotalCount
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<RegligionMst> GetRegligionMasterById(string Pk_religionid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_religionid", (object)Pk_religionid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<RegligionMst>("SAL_Religion_Edit", (object)dynamicParameters, "Bank Master - GetById").FirstOrDefault<RegligionMst>();
        }

        public async Task<bool> UpdateRegligionMaster(RegligionMst RegligionMaster)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_religionid",(object)RegligionMaster.Pk_religionid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Religion",(object)RegligionMaster.Religiontype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID",(object)RegligionMaster.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID",(object)RegligionMaster.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp",(object)RegligionMaster.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Religion_Upd", dynamicParameters, "RegligionMaster_Update");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteRegligionMaster(string Pk_religionid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_religionid", (object)Pk_religionid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("SAL_Religion_Del", dynamicParameters, "RegligionMaster_Delete");
            return n > 0; // Return true if rows were affected
        }

    }
}
