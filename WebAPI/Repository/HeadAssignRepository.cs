using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using iTextSharp.text;
using System.Data;
using System.Drawing.Printing;
using System.Globalization;

namespace HRMSWebAPI.Repository
{
    public class HeadAssignRepository :IHeadAssignRepository
    {
        CommonFunction commonFunction = new CommonFunction();
        public async Task<(int totalCount, IEnumerable<HeadAssign>)> GetAllEmployeesAsync(int pageIndex, int pageSize, string empCode, string empCodeManual, string empName, List<string> selectedDepartments, string selectedDesignation,List<string> selectedLocations, string selectedNature, string selectedCity,string sortBy)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
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

            // Execute stored procedure
            //    var employees = DataBaseFactory.QuerySP<HeadAssign>("SAL_SelEmployee_HeadAssign_SelforGrid", dynamicParameters).ToList();

            //return (employees);



            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, HeadAssign>("SAL_SelEmployee_HeadAssign_SelforGrid", dynamicParameters, "HeadAssign_SelforGrid");
            if (tuple == null || tuple.Item2 == null)
                return (0, new List<HeadAssign>());

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

            return (totalCount, tuple.Item2?.ToList() ?? new List<HeadAssign>());
        }

        public async Task<bool> UpdateHeadAssignAsync(
            string fk_headid , 
            string effectivedate, 
            string empCode, 
            string empCodeManual, 
            string empName, 
            List<string> selectedDepartments, 
            string selectedDesignation, 
            List<string> selectedLocations, 
            string selectedNature, 
            string selectedCity,
            string Overwrite,
            string fk_insUserID,
             
            string Fk_LocID)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@fk_headid", (object)fk_headid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@effectivedate ", (object)effectivedate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Overwrite", (object)Overwrite, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            //dynamicParameters.Add("@Timestamp", (object)HolidayMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());



            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Employee_Head_Assign", dynamicParameters, "Employee_Head_Assign");

            return n > 0; // Return true if rows were affected
        }


    }
}

    