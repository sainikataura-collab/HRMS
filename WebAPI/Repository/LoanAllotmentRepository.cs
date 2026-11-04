using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Xml.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace HRMSWebAPI.Repository
{
    public class LoanAllotmentRepository : ILoanAllotmentRepository
    {
        public async Task<bool> InsertLoanAllotmentAsync(List<LoanAllotmentMst> loanAllotmentMstList, string fk_insUserID, string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            LoanAllotmentMstDataSet dataset = new LoanAllotmentMstDataSet { LoanAllotment = loanAllotmentMstList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            // Add parameters
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_LoanAllotment_Ins", dynamicParameters, "LoanAllotment_Insert");

            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<LoanAllotmentMst>)> GetAllLoanAllotment(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LoanAllotmentMst>("SAL_LoanAllotment_SelForGrid", dynamicParameters, "LoanAllotment_GetAll");
            if (tuple == null || tuple.Item2 == null)
                return (0, new List<LoanAllotmentMst>());

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

            return (totalCount, tuple.Item2?.ToList() ?? new List<LoanAllotmentMst>());
        }


        public async Task<LoanAllotmentMst> GetLoanAllotmentByIdAsync(string pk_allotid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_allotid", (object)pk_allotid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var RES= DataBaseFactory.QuerySP<LoanAllotmentMst>("SAL_LoanAllotment_Edit", (object)dynamicParameters, "LoanAllotment Master - GetById").FirstOrDefault<LoanAllotmentMst>();
            Console.WriteLine(RES);
            return RES;
        }

        public async Task<bool> UpdateLoanAllotmentAsync(List<LoanAllotmentMst> loanAllotmentMstList, string fk_updUserID, string fk_LocID, string pk_allotid, byte[] timestamp)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            LoanAllotmentMstDataSet dataset = new LoanAllotmentMstDataSet { LoanAllotment = loanAllotmentMstList };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@pk_allotid", (object)pk_allotid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            Console.WriteLine("Generated XML:\n" + xmlData);

            int result =  DataBaseFactory.QuerySP("SAL_LoanAllotment_Upd", dynamicParameters, "LoanAllotment_Update");
            return result > 0;
        }

        public async Task<bool> DeleteLoanAllotmentAsync(string pk_allotid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_allotid", (object)pk_allotid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = await DataBaseFactory.QuerySPAsync("SAL_LoanAllotment_Del", dynamicParameters, "LoanAllotment_Delete");

            return result > 0; // Return true if rows were affected
        }






    }
}
