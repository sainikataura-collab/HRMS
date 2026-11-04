using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CityRepository:ICityRepository
    {
        public async Task<Result<List<NameValue>>> GetCityDropdownListbystateAsync(int fk_stateid, string fk_companyId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            // dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateid", (object)fk_stateid, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("SAL_City_SelForddlbyState", dynamicParameters, "GetDropdownList");

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count > 0,
                Message = result.ToList().Count > 0 ? "Data retrieved" : "No record",
                Data = result.ToList()
            };

            return finalResult;
        }



        public async Task<bool> InsertCityAsync(CityMst city)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_stateid", (object)city.fk_stateid, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@cityname", (object)city.cityname, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Metro", (object)city.metro, new DbType?(DbType.StringFixedLength), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PTApp", (object)city.PTApp, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@LWFApp", (object)city.LWFApp, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)city.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)city.fk_InsuserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)city.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@isCActive", (object)city.isCActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_City_Ins", dynamicParameters, "City_Insert");

            return result > 0;
        }


        public async Task<bool> UpdateCityAsync(CityMst city)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_cityid", (object)city.pk_cityid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateid", (object)city.fk_stateid, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@cityname", (object)city.cityname, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Metro", (object)city.metro, new DbType?(DbType.StringFixedLength), new ParameterDirection?(), new int?(1), new byte?(), new byte?());
            dynamicParameters.Add("@PTApp", (object)city.PTApp, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@LWFApp", (object)city.LWFApp, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)city.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)city.fk_updUserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@isCActive", (object)city.isCActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)city.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_City_Upd", dynamicParameters, "City_Update");

            return result > 0;
        }


        public async Task<CityMst> GetCityByIdAsync(string pk_cityid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cityid", (object)pk_cityid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<CityMst>("SAL_City_Edit", (object)dynamicParameters, "City Master - GetById").FirstOrDefault<CityMst>();
        }

        public async Task<(int totalCount, IEnumerable<CityMst>)> GetAll(int pageIndex, int pageSize, string fk_stateid, string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateid", (object)fk_stateid ?? "", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CityMst>("SAL_City_SelForGrid", dynamicParameters, "Department_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<bool> DeleteCityMstAsync(string pk_cityid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cityid", (object)pk_cityid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_City_Del", dynamicParameters, "City");

            return n > 0; // Return true if rows were affected
        }




        public async Task<Result<List<NameValue>>> GetCityDropdownListAsync(string fk_stateid)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            // dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_stateid", (object)fk_stateid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("SAL_CitywihtStateId_SelForddl", dynamicParameters, "GetSubsectionDropdownList");

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count > 0,
                Message = result.ToList().Count > 0 ? "Data retrieved" : "No record",
                Data = result.ToList()
            };

            return finalResult;
        }




        public async Task<bool> UpdateAttendanceAsync(UpdateAttendanceModel model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", model.fk_empid, DbType.String);

            dynamicParameters.Add("@FromDate", model.fromDate, DbType.DateTime);

            dynamicParameters.Add("@ToDate", model.toDate, DbType.DateTime);

            dynamicParameters.Add("@IsAttendancelog", model.IsAttendancelog, DbType.Boolean);

            int result = DataBaseFactory.QuerySP("SAL_UpdateAttendanceJob_Ins", dynamicParameters,
                "Update Attendance Job");

            return result > 0;
        }

        public async Task<Result<List<NameValue>>> GetLocationDropdownListbyZoneAsync(string fk_zoneId, string fk_companyId)

        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            // dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_zoneId", (object)(fk_zoneId ?? ""), new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("SAL_Location_SelForddlbyZone", dynamicParameters, "GetDropdownList");
            var dataList = result?.ToList() ?? new List<NameValue>();

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = dataList.Count > 0,
                Message = dataList.Count > 0 ? "Data retrieved" : "No record",
                Data = dataList
            };

            return finalResult;
        }


    }
}
