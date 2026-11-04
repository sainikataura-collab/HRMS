using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
using System.Xml.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HRMSWebAPI.Repository
{
    public class HolidayRepository: IHolidayRepository
    {
        public async Task<bool> InsertHolidayAsync(List<HolidayMst> holidayMstList,string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            HolidayMstDataSet dataset = new HolidayMstDataSet { Holiday = holidayMstList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

           

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_Holiday_Ins", dynamicParameters, "Holiday_Insert");

            return result > 0;
        }

        //public async Task<(int totalCount, IEnumerable<HolidayMst>)> GetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_yearid", (object)fk_yearid , new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
        //    dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


        //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, IEnumerable<HolidayMst>>("SAL_Holiday_SelForGrid", dynamicParameters, "HolidayMst_GetAll");
        //    if (tuple == null || tuple.Item2 == null)
        //        return (0, new List<HolidayMst>());

        //    // Extract totalCount safely
        //    int totalCount = 0;
        //    if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
        //    {
        //        var firstItem = totalList.First() as IDictionary<string, object>;
        //        if (firstItem != null && firstItem.Values.Any())
        //        {
        //            totalCount = Convert.ToInt32(firstItem.Values.First());
        //        }
        //    }

        //    //return (totalCount, tuple.Item2.Any() ? tuple.Item2: new List<HolidayMst>());
        //    var list = tuple.Item2?.ToList() ?? new List<HolidayMst>();
        //    return (totalCount, list);
        //}


        public async Task<(int totalCount, IEnumerable<HolidayMst>)> GetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearid", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HolidayMst>("SAL_Holiday_SelForGrid", dynamicParameters, "HolidayMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        //public async Task<(int totalCount, IEnumerable<HolidayMst>)> GetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_yearid", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
        //    dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


        //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HolidayMst>(
        //        "SAL_Holiday_SelForGrid", dynamicParameters, "HolidayMst_GetAll"
        //    );

        //    if (tuple == null || tuple.Item2 == null)
        //        return (0, new List<HolidayMst>());

        //    int totalCount = 0;
        //    if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
        //    {
        //        var firstItem = totalList.First() as IDictionary<string, object>;
        //        if (firstItem != null && firstItem.Values.Any())
        //        {
        //            totalCount = Convert.ToInt32(firstItem.Values.First());
        //        }
        //    }

        //    return (totalCount, tuple.Item2);
        //}


        public async Task<HolidayMst> GetHolidayByIdAsync(string pk_holidayid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<HolidayMst>("SAL_Holiday_Edit", (object)dynamicParameters, "Holiday Master - GetById").FirstOrDefault<HolidayMst>();
        }


        public async Task<bool> UpdateHolidayAsync(HolidayMst HolidayMst, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)HolidayMst.pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearid", (object)HolidayMst.fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@locid", (object)HolidayMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Holidaytype", (object)HolidayMst.holidaytype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Dated", (object)HolidayMst.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsNH", (object)HolidayMst.IsNH, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsWorkingDay", (object)HolidayMst.IsWorkingDay, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());



            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Holiday_Upd", dynamicParameters, "Holiday_Mst_Update");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteHolidayAsync(string pk_holidayid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Holiday_Del", dynamicParameters, "Holiday_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }
        // for working day master

        public async Task<bool> InsertWorkingDayMasterAsync(List<SAL_Holidays_Mst_WorkingDayMst> Holidays_Mst_WorkingDayList, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            SAL_Holidays_Mst_WorkingDayMstDataSet dataset = new SAL_Holidays_Mst_WorkingDayMstDataSet { WorkingDay = Holidays_Mst_WorkingDayList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_WorkingDay_Ins", dynamicParameters, "Holiday_Insert");

            return result > 0;
        }

        
        public async Task<(int totalCount, IEnumerable<SAL_Holidays_Mst_WorkingDayMst>)> WorkingDayMasterGetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearid", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, SAL_Holidays_Mst_WorkingDayMst>("SAL_WorkingDay_SelForGrid", dynamicParameters, "HolidayMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        


        public async Task<SAL_Holidays_Mst_WorkingDayMst> GetWorkingDayMasterByIdAsync(string pk_holidayid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<SAL_Holidays_Mst_WorkingDayMst>("SAL_WorkingDay_Edit", (object)dynamicParameters, "Holiday Master - GetById").FirstOrDefault<SAL_Holidays_Mst_WorkingDayMst>();
        }


        public async Task<bool> UpdateWorkingDayMasterAsync(SAL_Holidays_Mst_WorkingDayMst Holidays_Mst_WorkingDayMst, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)Holidays_Mst_WorkingDayMst.pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearid", (object)Holidays_Mst_WorkingDayMst.fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@locid", (object)Holidays_Mst_WorkingDayMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Holidaytype", (object)Holidays_Mst_WorkingDayMst.holidaytype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Dated", (object)Holidays_Mst_WorkingDayMst.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsNH", (object)Holidays_Mst_WorkingDayMst.IsNH, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsWorkingDay", (object)Holidays_Mst_WorkingDayMst.IsWorkingDay, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)Holidays_Mst_WorkingDayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());



            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_WorkingDay_Upd", dynamicParameters, "Holiday_Mst_Update");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteWorkingDayMasterAsync(string pk_holidayid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_WorkingDay_Del", dynamicParameters, "SAL_WorkingDay_Del");

            return n > 0; // Return true if rows were affected
        }


    }
}
