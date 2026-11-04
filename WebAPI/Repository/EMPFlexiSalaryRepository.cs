using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EMPFlexiSalaryRepository : IEMPFlexiSalaryRepository
    {

        public async Task<bool> InsertEmployeeFlexiHeadBillAsync(SAL_EmployeeFlexiHeadBills_Mst flexiSalaryDataSet)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // 🔄 Convert object to XML string
            string xmlData = XmlUtility.XmlSerializeToString(flexiSalaryDataSet);
            // 📦 Add XML to parameter
            dynamicParameters.Add("@Doc", xmlData, DbType.String);
            // 🚀 Execute the stored procedure
            int result = DataBaseFactory.QuerySP("SAL_EmployeeFlexiHeadBill_Ins", dynamicParameters, "Insert_FlexiHeadBill");

            return result > 0;
        }

  

        public async Task<IEnumerable<SAL_EmployeeFlexiHeadBills_MstGetall>> GetEmployeeFlexiHeadBillsAsync(string empId, string companyId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_empid", empId, DbType.String, size: 15);
            parameters.Add("@fk_companyId", companyId, DbType.String, size: 15);

            // Execute SP using your generic QuerySP method
            var result = await DataBaseFactory.QuerySPAsync<SAL_EmployeeFlexiHeadBills_MstGetall>( "SAL_EmployeeFlexiHeadBill_SelforGrid", parameters, "FlexiSalary - GetEmployeeFlexiHeadBillsAsync"
            );
            return result ?? Enumerable.Empty<SAL_EmployeeFlexiHeadBills_MstGetall>();
        }

        public async Task<Result<List<NameValueFlexi>>> GetFlexiHeadDropdownAsync(string fk_empid, string companyId)
        {
            var result = new Result<List<NameValueFlexi>>();
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
                dynamicParameters.Add("@fk_companyId", companyId, DbType.String);

                // Call the stored procedure
                var data = DataBaseFactory.QuerySP<NameValueFlexi>(
                    "SAL_EmployeeFlexiHead_Selforddl",
                    dynamicParameters,
                    "Get Flexi Head DDL"
                );

                result.IsSuccessfull = data != null && data.Any();
                result.Message = result.IsSuccessfull ? "Flexi heads retrieved successfully." : "No record found.";
                result.Data = data?.ToList() ?? new List<NameValueFlexi>();
            }
            catch (Exception ex)
            {
                result.IsSuccessfull = false;
                result.Message = $"Error: {ex.Message}";
                result.Data = new List<NameValueFlexi>();
            }

            return result;
        }

        public async Task<FlexiBillValidationResult?> ValidateFlexiBillAsync(string empId, string headId, string billDate, decimal billAmt)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@fk_empid", empId, DbType.String, size: 15);
                parameters.Add("@fk_headid", headId, DbType.String, size: 15);
                parameters.Add("@billDate", billDate, DbType.String, size: 10);
                parameters.Add("@billAmt", billAmt, DbType.Decimal);

                var result = await DataBaseFactory.QuerySPAsync<FlexiBillValidationResult>(
                    "SAL_EmployeeFlexiHeadBill_Validate",
                    parameters,
                    "ValidateFlexiBillAsync"
                );

                return result?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                // Optional: log error
                throw new Exception("Error in ValidateFlexiBillAsync: " + ex.Message, ex);
            }
        }
        public async Task<bool> DeleteFlexiBillAsync(long pk_flexibillId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_flexibillId", pk_flexibillId, DbType.Int64);

            // Execute stored procedure for deletion
            int rowsAffected = DataBaseFactory.QuerySP("SAL_EmployeeFlexiHeadBill_Del", dynamicParameters, "Delete Flexi Bill");
            return rowsAffected > 0;
        }




    }
}
