using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Xml.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace HRMSWebAPI.Repository
{
    public class EmpWeekOffRepository : IEmpWeekOffRepository
    {
        public async Task<bool> InsertEmpWeeklyOffAsync(List<EmpWeekOffMst> empWeekOffMstList, string fk_insUserID, string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Wrap the model in the required dataset structure
            EmpWeekOffMstDataSet dataset = new EmpWeekOffMstDataSet { EmpWeekOff = empWeekOffMstList };
            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            // Add parameters exactly as in your original code
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locId", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);
            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_EmployeeWeekOff_Mst_Ins", dynamicParameters, "EmployeeWeeklyOff_Insert");
            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<EmpWeekOffMst>)> GetAllEmpWeeklyOff(int pageIndex, int pageSize, string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Add parameters matching your original style and specified requirements
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure using QueryMultipleSP
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EmpWeekOffMst>("SAL_EmployeeWeeklyOff_SelForGrid", dynamicParameters,"EmployeeWeeklyOff_GetAll");
            if (tuple == null || tuple.Item2 == null)
                return (0, new List<EmpWeekOffMst>());
            // Extract totalCount safely - keeping your original logic
            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }
            return (totalCount, tuple.Item2?.ToList() ?? new List<EmpWeekOffMst>());
        }

        public async Task<EmpWeekOffMst> GetEmpWeeklyOffByIdAsync(string pk_empwoffid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_woffid", (object)pk_empwoffid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Corrected async implementation
            var result = await DataBaseFactory.QuerySPAsync<EmpWeekOffMst>("SAL_EmployeeWeeklyOff_Edit", (object)dynamicParameters,"EmployeeWeeklyOff Master - GetById");
            return result.FirstOrDefault();
        }


        public async Task<bool> UpdateEmpWeeklyOffAsync(List<EmpWeekOffMst> empWeekOffMstList, string fk_updUserID, string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Wrap the model in the required dataset structure
            EmpWeekOffMstDataSet dataset = new EmpWeekOffMstDataSet { EmpWeekOff = empWeekOffMstList };
            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            // Add parameters (only the 3 specified)
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_userid", (object)fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_locid", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);
            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_EmployeeWeekOff_Mst_Ins", dynamicParameters,"EmployeeWeeklyOff_Update");

            return result > 0;
        }

        public async Task<bool> DeleteEmpWeeklyOffAsync(string pk_empwoffid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_woffid",(object)pk_empwoffid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Using QuerySPAsync for async operation
            int n = await DataBaseFactory.QuerySPAsync("SAL_EmployeeWeekOff_Mst_Del", dynamicParameters,"EmployeeWeeklyOff_Mst_Delete");
            return n > 0; // Return true if rows were affected
        }





    }
}
