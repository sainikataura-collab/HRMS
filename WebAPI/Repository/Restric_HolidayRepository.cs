using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class Restric_HolidayRepository:IRestric_HolidayRepository
    {
        //for display all
        public async Task<(int totalCount, IEnumerable<Restric_Holiday>)> GetAll(int pageIndex, int pageSize, long? fk_yearid, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearid", (object)fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, Restric_Holiday>("SAL_RestrictedHolidays_Mst_SelForGrid", dynamicParameters, "ResHolidayMst_GetAll");
            if (tuple == null || tuple.Item2 == null)
                return (0, new List<Restric_Holiday>());

            // Extract totalCount safely
            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }

            return (totalCount, tuple.Item2?.ToList() ?? new List<Restric_Holiday>());
        }
        //display by id
        public async Task<Restric_Holiday> GetRes_HolidayByIdAsync(string pk_holidayid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<Restric_Holiday>("SAL_RestrictedHolidays_Mst_Edit", (object)dynamicParameters, "Holiday Master - GetById").FirstOrDefault<Restric_Holiday>();
        }



        //for insert
        public async Task<bool> InsertRes_HolidayAsync(List<Restric_Holiday> re_HolidayMstList, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            Re_HolidayMstDataSet dataset = new Re_HolidayMstDataSet { Re_Holiday = re_HolidayMstList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_RestrictedHolidays_Mst_Ins", dynamicParameters, "Re_Holiday_Insert");

            return result > 0;
        }
        //for delete 
        public async Task<bool>DeleteRes_HolidayAsync(string pk_holidayid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_RestrictedHolidays_Mst_Del", dynamicParameters, "Holiday_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }
        //for update 

        public async Task<bool> UpdateRes_HolidayAsync(Restric_Holiday Res_HolidayMst, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_holidayid", (object)Res_HolidayMst.pk_holidayid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearid", (object)Res_HolidayMst.fk_yearid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@locid", (object)Res_HolidayMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Holidaytype", (object)Res_HolidayMst.holidaytype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Dated", (object)Res_HolidayMst.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsNH", (object)Res_HolidayMst.IsNH, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Timestamp", (object)Res_HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());



            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_RestrictedHolidays_Mst_Upd", dynamicParameters, "Holiday_Mst_Update");

            return n > 0; // Return true if rows were affected
        }


    }
}
