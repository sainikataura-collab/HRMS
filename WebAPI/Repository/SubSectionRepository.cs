using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
namespace HRMSWebAPI.Repository
{
    public class SubSectionRepository : ISubSectionRepository
    {

        public async Task<bool> InsertSubSectionAsync(SubSectionMst subsection, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)subsection.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_secid", (object)subsection.fk_secid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@maxlimit", (object)subsection.maxlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)subsection.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)subsection.fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_SubSections_Ins", dynamicParameters, "SubSection_Insert");
            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<SubSectionMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, SubSectionMst>("SAL_SubSections_SelForGrid", dynamicParameters, "SubSection_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<SubSectionMst> GetSubSectionByIdAsync(string subSectionId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_subsecid", (object)subSectionId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<SubSectionMst>("SAL_SubSections_Edit", (object)dynamicParameters, "SubSection Master - GetById").FirstOrDefault<SubSectionMst>();
        }


        public async Task<bool> UpdateSubSectionAsync(SubSectionMst subsection, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_subsecid", (object)subsection.pk_subsecid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)subsection.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_secid", (object)subsection.fk_secid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@maxlimit", (object)subsection.maxlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)subsection.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)subsection.fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
              dynamicParameters.Add("@Timestamp", (object)subsection.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_SubSections_Upd", dynamicParameters, "SubSection_Mst_Update");
            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteSubSectionAsync(string subSectionId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_subsecid", (object)subSectionId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("SAL_SubSections_Del", dynamicParameters, "SubSection_Mst_Delete");
            return n > 0; // Return true if rows were affected
        }


    }
}
