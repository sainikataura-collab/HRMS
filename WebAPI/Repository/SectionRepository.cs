using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class SectionRepository: ISectionRepository
    {
        //for insert
        public async Task<bool> InsertSectionAsync(SectionMst section, string fk_locId,string fk_userId)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@description", (object)section.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@code", (object)section.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@maxlimit", (object)section.maxlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)section.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@part", (object)section.partof, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            
            int result = DataBaseFactory.QuerySP("SAL_Sections_Ins", dynamicParameters, "section_Insert");

            return result > 0;
        }

        //for get all
        public async Task<(int totalCount, IEnumerable<SectionMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, SectionMst>("SAL_Sections_SelForGrid", dynamicParameters, "Section_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<SectionMst> GetSectionByIdAsync(string sectionId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_secid", (object)sectionId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<SectionMst>("SAL_Sections_Edit", (object)dynamicParameters, "section Master - GetById").FirstOrDefault<SectionMst>();
        }
        //for delete
        public async Task<bool> DeleteSectionMstAsync(string sectionId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_secid", (object)sectionId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Sections_Del", dynamicParameters, "section_mst_Delete");

            return n > 0; // Return true if rows were affected
        }
        //for update
        public async Task<bool> UpdateSectionAsync(SectionMst section, string fk_locId, string fk_userId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
           
            dynamicParameters.Add("@pk_secid", (object)section.pk_secid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)section.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@code", (object)section.code, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@maxlimit", (object)section.maxlimit, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)section.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@part", (object)section.partof, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)section.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Sections_Upd", dynamicParameters, "Section_Mst_Update");

            return n > 0; // Return true if rows were affected
        }

    }
}
