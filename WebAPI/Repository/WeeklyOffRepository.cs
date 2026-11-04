using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Xml.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace HRMSWebAPI.Repository
{
    public class WeeklyOffRepository : IWeeklyOffRepository
    {
        public async Task<bool> InsertWeeklyOffAsync(List<WeeklyOffMst> weeklyOffMstList, string fk_insUserID, string fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Wrap the model in the required dataset structure
            WeeklyOffMstDataSet dataset = new WeeklyOffMstDataSet { WeeklyOff = weeklyOffMstList };
            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);
            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_WeekOff_Mst_Ins", dynamicParameters, "WeeklyOff_Insert");
            return result > 0;
        }
        public async Task<(int totalCount, IEnumerable<WeeklyOffMst>)> GetAllWeeklyOff(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, WeeklyOffMst>("SAL_WeeklyOff_SelForGrid", dynamicParameters, "WeeklyOffMst_GetAll");
            if (tuple == null || tuple.Item2 == null)
                return (0, new List<WeeklyOffMst>());
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
            return (totalCount, tuple.Item2?.ToList() ?? new List<WeeklyOffMst>());
        }

        public async Task<WeeklyOffMst> GetWeeklyOffByIdAsync(string pk_woffid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_woffid", (object)pk_woffid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<WeeklyOffMst>("SAL_WeeklyOff_Edit", (object)dynamicParameters, "WeeklyOff Master - GetById").FirstOrDefault<WeeklyOffMst>();
        }


        public async Task<bool> UpdateWeeklyOffAsync(List<WeeklyOffMst> weeklyOffMstList, string fk_updUserID, string fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Wrap the model in the required dataset structure
            WeeklyOffMstDataSet dataset = new WeeklyOffMstDataSet { WeeklyOff = weeklyOffMstList };
            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            // Add parameters
            dynamicParameters.Add("@pk_woffid", (object)weeklyOffMstList[0].pk_woffid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);
            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_WeekOff_Mst_Upd", dynamicParameters, "WeeklyOff_Update");
            return result > 0;
        }

        public async Task<bool> DeleteWeeklyOffAsync(string pk_woffid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_woffid", (object)pk_woffid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_WeekOff_Mst_Del", dynamicParameters, "WeeklyOff_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }



    }
}
