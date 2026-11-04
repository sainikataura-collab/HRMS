using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class TaxConfigRepository : ITaxConfigRepository
    {
        public async Task<bool> InsertTaxConfigAsync(List<TaxConfigMst> taxConfigList, string fk_insUserID, string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Wrap the model in the required dataset structure
            TaxConfigMstDataSet dataset = new TaxConfigMstDataSet { TaxConfigMst = taxConfigList };
            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters exactly as in your original code
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);
            // Execute stored procedure
            int result =DataBaseFactory.QuerySP("SAL_TaxConfig_Ins", dynamicParameters, "TaxConfig_Insert");
            return result > 0;
        }

        public async Task<TaxConfigMst> GetTaxConfigByIdAsync()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var result = DataBaseFactory.QuerySP<TaxConfigMst>(
                "SAL_TaxConfig_Edit",
                dynamicParameters,
                "TaxConfig - GetById");

            return result.FirstOrDefault();
        }

        public async Task<bool> UpdateTaxConfigAsync(List<TaxConfigMst> taxConfigList, string fk_updUserID, string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Wrap the model in the required dataset structure
            TaxConfigMstDataSet dataset = new TaxConfigMstDataSet { TaxConfigMst = taxConfigList };
            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters as per SP definition
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_TaxConfig_Upd", dynamicParameters, "TaxConfig_Update");

            return result > 0;
        }


    }
}
