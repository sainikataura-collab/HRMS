using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmployeeKRAPLIRepository:IEmployeeKRAPLIRepository
    {

        CommonFunction commonFunction = new CommonFunction();
        public async Task<IEnumerable<EmployeeKRAPLIMst>> GetAll(KRAPLIRequest filter)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(filter.SelectedLocations, filter.SelectedDepartments);


            dynamicParameters.Add("@empcode", (object)filter.EmpCode ?? "");
            dynamicParameters.Add("@empcodemanual", (object)filter.EmpCodeManual ?? "");
            dynamicParameters.Add("@empname", (object)filter.EmpName ?? "");
            dynamicParameters.Add("@xmlDoc", (object)combinedXml);
            dynamicParameters.Add("@fk_designationid", (object)filter.SelectedDesignation ?? "");
            dynamicParameters.Add("@fk_nature", (object)filter.SelectedNature ?? "");
            dynamicParameters.Add("@fk_cityid", (object)filter.SelectedCity ?? "");
            dynamicParameters.Add("@shortby", (object)filter.SortBy ?? "");
            dynamicParameters.Add("@fk_userid", (object)filter.fk_userid ?? "");

            dynamicParameters.Add("@EmpStatus", (object)filter.EmpStatus ?? "");


            var result = DataBaseFactory.QuerySP<EmployeeKRAPLIMst>("SAL_EmployeeForKRAPLI_SelForGrid", dynamicParameters, "GetAll");
            //Console.WriteLine("fghgjg",result);
            return result;

        }


        public async Task<bool> UpdateEmployeeKraPliAsync(EmployeeKraPliXmlModel model, string Fk_UserID, string Fk_LocID)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Serialize the model to XML string
                string xmlData = XmlUtility.XmlSerializeToString(model);

                // Debugging XML output (optional)
                Console.WriteLine("Generated XML for Update:\n" + xmlData);

                // Add parameters required by the stored procedure
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
                dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);

                // Call the stored procedure
                int result = DataBaseFactory.QuerySP("SAL_EmployeeForKRAPLI_Upd", dynamicParameters, "Upd");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during KRA/PLI Update: " + ex.Message);
                return false;
            }
        }


    }

}
