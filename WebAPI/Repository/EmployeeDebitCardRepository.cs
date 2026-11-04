using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmployeeDebitCardRepository: IEmployeeDebitCardRepository
    {
        CommonFunction commonFunction = new CommonFunction();
        public async Task<IEnumerable<EmployeeDebitCard>> GetAllEmployeesAsync(
  string empCode, string empCodeManual,
  string empName, List<string> selectedDepartments, string selectedDesignation,
  List<string> selectedLocations, string selectedNature, string selectedCity,
  string sortBy, string userId, string empStatus)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@shortby", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EmpStatus", (object)empStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure
            var employees = DataBaseFactory.QuerySP<EmployeeDebitCard>("SAL_EmployeeForDebitCard_SelForGrid", dynamicParameters).ToList();

            return (employees);

        }
        public async Task<bool> UpdateEmployeeDebitCardAsync(List<EmployeeDebitCardMst> employeeDebitCardList, string fk_insUserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            EmployeeDebitCardMstDataSet dataset = new EmployeeDebitCardMstDataSet { Employees = employeeDebitCardList };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_EmployeeForDebitCard_Upd", dynamicParameters, "SAL_EmployeeForDebitCard_Upd");

            return result > 0;
        }

    }
}