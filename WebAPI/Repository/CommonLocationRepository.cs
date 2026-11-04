using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CommonLocationRepository:ICommonLocationRepository
    {

        public async Task<(int totalCount, IEnumerable<CommonLocationMst>)> GetAll(int pageindex, int pagesize, string fk_companyId, string locname, string fk_officeid, string fk_cityid, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageindex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pagesize, DbType.Int32);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);
            dynamicParameters.Add("@locname", locname, DbType.String);
            dynamicParameters.Add("@fk_officeid", fk_officeid, DbType.String);
            dynamicParameters.Add("@fk_cityid", fk_cityid, DbType.String);
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CommonLocationMst>("Comm_Location_SelForGrid", dynamicParameters, "GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, []);

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }
        //get by id
        public async Task<CommonLocationMst> GetById(string pk_locid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_locid", pk_locid, DbType.String);
            return DataBaseFactory.QuerySP<CommonLocationMst>("Comm_Location_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<CommonLocationMst>();


        }
        //for delete

        public async Task<bool> delete(string pk_locid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_locid", (object)pk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("Comm_Location_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }
        //for insert
        public async Task<bool> InsertAsync(CommonLocationMst locationMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@locname", locationMst.locname, DbType.String);
            dynamicParameters.Add("@fk_officeid", locationMst.fk_officeid, DbType.Int32);
            dynamicParameters.Add("@loginallow", locationMst.loginallow, DbType.Boolean);
            dynamicParameters.Add("@fk_plocid", locationMst.fk_locid, DbType.String);
            dynamicParameters.Add("@fk_stateid", locationMst.fk_stateid, DbType.Int32);
            dynamicParameters.Add("@fk_cityid", locationMst.fk_cityid, DbType.String);
            dynamicParameters.Add("@phone", locationMst.phone, DbType.String);
            dynamicParameters.Add("@fax", locationMst.fax, DbType.String);
            dynamicParameters.Add("@email", locationMst.email, DbType.String);
            dynamicParameters.Add("@address", locationMst.address, DbType.String);
            dynamicParameters.Add("@bonusbasedon", locationMst.bonusbasedon, DbType.String);
            dynamicParameters.Add("@dailyAttAllow", locationMst.dailyAttAllow, DbType.Boolean);
            dynamicParameters.Add("@dailyAttAllowEmp", locationMst.dailyAttAllowEmp, DbType.Boolean);
            dynamicParameters.Add("@remarks", locationMst.remarks, DbType.String);
            dynamicParameters.Add("@fk_UserId", locationMst.fk_UserId, DbType.String);
            dynamicParameters.Add("@fk_LocId", locationMst.fk_locid, DbType.String);
            dynamicParameters.Add("@fk_ContactempId", locationMst.fk_ContactempId, DbType.String);
            dynamicParameters.Add("@fk_companyId", locationMst.fk_companyId, DbType.String);
            dynamicParameters.Add("@attendanceSource", locationMst.attendanceSource, DbType.String);
            dynamicParameters.Add("@isActive", locationMst.isActive, DbType.Boolean);
            dynamicParameters.Add("@fk_areaId", locationMst.fk_areaId, DbType.String);
            dynamicParameters.Add("@latitude", locationMst.latitude, DbType.String);
            dynamicParameters.Add("@longitude", locationMst.longitude, DbType.String);
            dynamicParameters.Add("@fk_zoneId", locationMst.fk_zoneId, DbType.String);
            dynamicParameters.Add("@distance", locationMst.distance, DbType.String);
            dynamicParameters.Add("@machineID", locationMst.machineID, DbType.String);
            dynamicParameters.Add("@locationCode", locationMst.locationCode, DbType.String);
            dynamicParameters.Add("@amUsername", locationMst.amUsername, DbType.String);
            dynamicParameters.Add("@rmUsername", locationMst.rmUsername, DbType.String);
            dynamicParameters.Add("@areaManagerEmail", locationMst.areaManagerEmail, DbType.String);
            dynamicParameters.Add("@regionalManagerEmail", locationMst.regionalManagerEmail, DbType.String);
            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Comm_Location_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }
        // for update
        public async Task<bool> UpdateAsync(CommonLocationMst locationMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_locid", locationMst.pk_locid, DbType.String);
            dynamicParameters.Add("@locname", locationMst.locname, DbType.String);
            dynamicParameters.Add("@fk_officeid", locationMst.fk_officeid, DbType.Int32);
            dynamicParameters.Add("@loginallow", locationMst.loginallow, DbType.Boolean);
            dynamicParameters.Add("@fk_plocid", locationMst.fk_locid, DbType.String);
            dynamicParameters.Add("@fk_stateid", locationMst.fk_stateid, DbType.Int32);
            dynamicParameters.Add("@fk_cityid", locationMst.fk_cityid, DbType.String);
            dynamicParameters.Add("@phone", locationMst.phone, DbType.String);
            dynamicParameters.Add("@fax", locationMst.fax, DbType.String);
            dynamicParameters.Add("@email", locationMst.email, DbType.String);
            dynamicParameters.Add("@address", locationMst.address, DbType.String);
            dynamicParameters.Add("@bonusbasedon", locationMst.bonusbasedon, DbType.String);
            dynamicParameters.Add("@dailyAttAllow", locationMst.dailyAttAllow, DbType.Boolean);
            dynamicParameters.Add("@dailyAttAllowEmp", locationMst.dailyAttAllowEmp, DbType.Boolean);
            dynamicParameters.Add("@remarks", locationMst.remarks, DbType.String);
            dynamicParameters.Add("@fk_UserId", locationMst.fk_UserId, DbType.String);
            dynamicParameters.Add("@fk_LocId", locationMst.fk_locid, DbType.String);
            dynamicParameters.Add("@fk_ContactempId", locationMst.fk_ContactempId, DbType.String);
            //   dynamicParameters.Add("@fk_companyId", locationMst.fk_companyId, DbType.String);
            dynamicParameters.Add("@attendanceSource", locationMst.attendanceSource, DbType.String);
            dynamicParameters.Add("@isActive", locationMst.isActive, DbType.Boolean);
            dynamicParameters.Add("@fk_areaId", locationMst.fk_areaId, DbType.String);
            dynamicParameters.Add("@latitude", locationMst.latitude, DbType.String);
            dynamicParameters.Add("@longitude", locationMst.longitude, DbType.String);
            dynamicParameters.Add("@fk_zoneId", locationMst.fk_zoneId, DbType.String);
            dynamicParameters.Add("@distance", locationMst.distance, DbType.String);
            dynamicParameters.Add("@machineID", locationMst.machineID, DbType.String);
            dynamicParameters.Add("@Timestamp", locationMst.Timestamp, DbType.Binary);
            dynamicParameters.Add("@locationCode", locationMst.locationCode, DbType.String);
            dynamicParameters.Add("@amUsername", locationMst.amUsername, DbType.String);
            dynamicParameters.Add("@rmUsername", locationMst.rmUsername, DbType.String);
            dynamicParameters.Add("@areaManagerEmail", locationMst.areaManagerEmail, DbType.String);
            dynamicParameters.Add("@regionalManagerEmail", locationMst.regionalManagerEmail, DbType.String);




            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Comm_Location_Upd", dynamicParameters, "update");

            return n > 0; // Return true if rows were affected

        }

    }
}
