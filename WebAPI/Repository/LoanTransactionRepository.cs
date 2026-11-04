using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Xml.Linq;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace HRMSWebAPI.Repository
{
    public class LoanTransactionRepository : ILoanTransactionRepository
    {
        public async Task<bool> InsertLoanTransactionAsync(List<LoanTransactionMst> loanTransactionMstList,List<LoanTransactionDetails> loanTransactionDetailsList,string fk_insUserID,string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in dataset structure
            LoanTransactionMstDataSet dataset = new LoanTransactionMstDataSet
            {
                LoanTransactionMst = loanTransactionMstList,
                LoanTransactionDetails = loanTransactionDetailsList
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@Doc", xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_LoanAdv_Tran_Ins", dynamicParameters, "LoanTransaction_Insert");

            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<LoanTransactionMst>)> GetAllLoanTransactionAsync(int pageIndex, int pageSize, string fk_empid, string company_id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@company_id", (object)company_id, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LoanTransactionMst>(
                "SAL_LoanAdv_Tran_SelForGrid",
                dynamicParameters,
                "LoanTransaction_GetAll"
            );

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<LoanTransactionMst>());

            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }

            return (totalCount, tuple.Item2?.ToList() ?? new List<LoanTransactionMst>());
        }

        public async Task<LoanTransactionMstResult> GetLoanTransactionByIdAsync(string pk_lid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Lid", (object)pk_lid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //var RES = DataBaseFactory.QuerySP<LoanTransactionMst>("SAL_LoanAdv_Tran_Edit",(object)dynamicParameters,"LoanTransaction Master - GetById").FirstOrDefault<LoanTransactionMst>();

            var tuple = DataBaseFactory.QueryMultipleSP<LoanTransactionMst, LoanTransactionDetails>("SAL_LoanAdv_Tran_Edit", dynamicParameters, "GetAll");

            var result = new LoanTransactionMstResult();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.LoanTransactionMst = tuple.Item1.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.LoanTransactionDetails = tuple.Item2.FirstOrDefault();
            }
            return result;
        }

        public async Task<bool> UpdateLoanTransactionAsync(
     string pk_lid,
     List<LoanTransactionMst> loanTransactionMstList,
     List<LoanTransactionDetails> loanTransactionDetailsList,
     string fk_updUserID,
     string fk_LocID,
     byte[] timestamp)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in dataset structure
            LoanTransactionMstDataSet dataset = new LoanTransactionMstDataSet
            {
                LoanTransactionMst = loanTransactionMstList,
                LoanTransactionDetails = loanTransactionDetailsList
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@Pk_Lid", pk_lid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log for debugging
            Console.WriteLine("Generated XML for Update:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_LoanAdv_Tran_Upd", dynamicParameters, "LoanTransaction_Update");

            return result > 0;
        }


        public async Task<bool> DeleteLoanTransactionAsync(string pk_lid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters with exact structure, using all required default values
            dynamicParameters.Add("@Pk_Lid", (object)pk_lid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_LoanAdv_Tran_Del",dynamicParameters,"LoanTransaction_Delete");

            return result > 0; // Return true if rows were affected
        }





    }
}
