using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class DemographicRepository : IDemographicRepository
    {

        CommonFunction commonFunction = new CommonFunction();
        public async Task<(int totalCount, IEnumerable<Employee>)> GetAllDemographic(
    int pageIndex, int pageSize, string empCode, string empCodeManual,
    string empName, List<string> selectedDepartments, string selectedDesignation,
    List<string> selectedLocations, string selectedNature, string selectedCity,
    string sortBy, string userId, string empStatus, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Call the stored procedure
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, Employee>("SAL_Employee_Demographic_SelForGrid", dynamicParameters, "Employee_GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<Employee>());

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

            return (totalCount, tuple.Item2?.ToList() ?? new List<Employee>());
        }


        //public async Task<DemographicMst> GetDemographicByIdAsync(string fk_empid)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    return DataBaseFactory.QuerySP<DemographicMst>("SAL_Employee_Demographic_Edit", (object)dynamicParameters, " Demographic Master - GetById").FirstOrDefault<DemographicMst>();
        //}

        public async Task<DemographicMst> GetDemographicByIdAsync(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<DemographicMst, DemographicMstFamily>("SAL_Employee_Demographic_Edit", dynamicParameters,"LeaveType_GetById");

            DemographicMst demographicMst = null;
            List<DemographicMstFamily> demographicMstFamilyList = [];

            if (tuple != null || tuple.Item1 != null)
            {
                demographicMst = tuple.Item1.FirstOrDefault();
            }
           
            if (tuple != null && tuple.Item2 != null && demographicMst != null)

            {
                    demographicMst.FamilyMembers= tuple.Item2.ToList();
            }

            return (demographicMst);
        }







        //public async Task<bool> UpdateDemographicAsync(List<DemographicMst> demographicMstList, string fk_updUserID, string fk_LocID)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Wrap the model in the required dataset structure
        //    DemographicMstDataSet dataset = new DemographicMstDataSet { Demographic = demographicMstList};

        //    // Serialize to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(dataset);

        //    // Add parameters
        //    dynamicParameters.Add("@fk_empid", (object)demographicMstList[0].fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_userid", (object)fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_locid", (object)fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    // Log XML for debugging
        //    Console.WriteLine("Generated XML:\n" + xmlData);

        //    // Execute stored procedure
        //    int result = await DataBaseFactory.QuerySPAsync("SAL_Employee_Demographic_Upd", dynamicParameters, "Demographic_Update");

        //    return result > 0;
        //}


        //     public async Task<bool> UpdateDemographicAsync(List<DemographicMst> demographicMstList,string fk_updUserID,
        //string fk_LocID)
        //     {
        //         DynamicParameters dynamicParameters = new DynamicParameters();

        //         // Wrap the models in the required dataset structure
        //         DemographicMstDataSet dataset = new DemographicMstDataSet
        //         {
        //             Demographic = demographicMstList,
        //              // Include family details
        //         };

        //         // Serialize to XML
        //         string xmlData = XmlUtility.XmlSerializeToString(dataset);

        //         // Add parameters
        //         dynamicParameters.Add("@fk_empid", demographicMstList[0].fk_empid, DbType.String);
        //         dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
        //         dynamicParameters.Add("@fk_userid", fk_updUserID, DbType.String);
        //         dynamicParameters.Add("@fk_locid", fk_LocID, DbType.String);

        //         // Log XML for debugging
        //         Console.WriteLine("Generated XML:\n" + xmlData);

        //         // Execute stored procedure
        //         int result = await DataBaseFactory.QuerySPAsync("SAL_Employee_Demographic_Upd", dynamicParameters, "Demographic_Update");

        //         return result > 0;
        //     }

        public async Task<bool> UpdateDemographicAsync(List<DemographicMst> demographicMstList, List<DemographicMstFamily> familyList, string fk_updUserID, string fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the models in the required dataset structure
            DemographicMstDataSet dataset = new DemographicMstDataSet
            {
                Demographic = demographicMstList, // Assuming only one employee detail
                FamilyMembers = familyList   
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);


            // Add parameters
            dynamicParameters.Add("@fk_empid", demographicMstList[0].fk_empid, DbType.String);
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_userid", fk_updUserID, DbType.String);
            dynamicParameters.Add("@fk_locid", fk_LocID, DbType.String);

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_Employee_Demographic_Upd", dynamicParameters, "Demographic_Update");

            return result > 0;
        }



    }

}
