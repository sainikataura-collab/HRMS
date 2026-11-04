using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class TaxDeductorRepository : ITaxDeductorRepository
    {
        public async Task<bool> InsertTaxDeductorAsync(List<TaxDeductorMst> taxDeductorList, string fk_insUserID, string fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            TaxDeductorMstDataSet dataset = new TaxDeductorMstDataSet { TaxDeductor = taxDeductorList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            // Add parameters exactly as in your original code
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);
            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_TaxDeductor_Ins", dynamicParameters, "TaxDeductor_Insert");
            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<TaxDeductorMst>)> GetAllTaxDeductorsAsync(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters matching the given stored procedure
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure using QueryMultipleSP
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TaxDeductorMst>("SAL_TaxDeductor_SelForGrid", dynamicParameters, "TaxDeductor_GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<TaxDeductorMst>());

            // Extract totalCount safely - keeping the original logic
            int totalCount = 0;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }
            return (totalCount, tuple.Item2?.ToList() ?? new List<TaxDeductorMst>());
        }

        public async Task<TaxDeductorMst> GetTaxDeductorByIdAsync(string pk_dedid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_dedid", (object)pk_dedid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure and fetch result
            var result = await DataBaseFactory.QuerySPAsync<TaxDeductorMst>("SAL_TaxDeductor_Edit", (object)dynamicParameters, "TaxDeductor Master - GetById");

            return result.FirstOrDefault();
        }

        public async Task<bool> UpdateTaxDeductorAsync(List<TaxDeductorMst> taxDeductorMstList, string fk_updUserID, string fk_LocID, string pk_dedid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            TaxDeductorMstDataSet dataset = new TaxDeductorMstDataSet { TaxDeductor = taxDeductorMstList};

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@pk_dedid", (object)pk_dedid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            Console.WriteLine("Generated XML:\n" + xmlData);

            int result = await DataBaseFactory.QuerySPAsync("SAL_TaxDeductor_Upd", dynamicParameters, "TaxDeductor_Update");
            return result > 0;
        }

        public async Task<bool> DeleteTaxDeductorAsync(string pk_dedid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_dedid", (object)pk_dedid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = await DataBaseFactory.QuerySPAsync("SAL_TaxDeductor_Del", dynamicParameters, "TaxDeductor_Delete");
            return n > 0;
        }



    }
}
