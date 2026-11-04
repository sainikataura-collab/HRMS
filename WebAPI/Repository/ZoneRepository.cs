using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;



namespace HRMSWebAPI.Repository
{
    public class ZoneRepository:IZoneRepository
    {

        public async Task<bool> InsertZoneAsync(ZoneMst zone)
        
       {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@Zonedescription", (object)zone.zoneDescription, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ZoneCode", (object)zone.zoneCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_InsuserId", (object)zone.fk_InsuserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locId", (object)zone.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)zone.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_hrempid", (object)zone.fk_hrempid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_headempid", (object)zone.fk_headempid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_Zone_Mst_Ins", dynamicParameters, "Zone_Insert");

            return result > 0;
        }


        public async Task<(int totalCount, IEnumerable<ZoneMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ZoneMst>("SAL_Zone_Mst_selforgrid", dynamicParameters, "Department_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }



        public async Task<ZoneMst> GetZoneByIdAsync(string zoneId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_zoneId", (object)zoneId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ZoneMst>("SAL_Zone_Mst_Edit", (object)dynamicParameters, "Zone Master - GetById").FirstOrDefault<ZoneMst>();
        }

        public async Task<bool> DeleteZoneMstAsync(string zoneId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_zoneId", (object)zoneId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Zone_Mst_Del", dynamicParameters, "Zone_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> UpdateZoneAsync(ZoneMst zone)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_zoneId", (object)zone.pk_zoneId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Zonedescription", (object)zone.zoneDescription, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ZoneCode", (object)zone.zoneCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_InsuserId", (object)zone.fk_InsuserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locId", (object)zone.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_hrempid", (object)zone.fk_hrempid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_headempid", (object)zone.fk_headempid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Zone_Mst_Upd", dynamicParameters, "Zone_Mst_Update");

            return n > 0; // Return true if rows were affected
        }




      


    }
}
