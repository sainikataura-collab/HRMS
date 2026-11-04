using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class StopSalaryRepository : IStopSalaryRepository
    {

        CommonFunction commonFunction = new CommonFunction();

        public async Task<StopSalaryProcessModel> GetStopSalaryAsync(
            string empCode,
            string empCodeManual,
            string empName,
            List<string> selectedDepartments,
            string selectedDesignation,
            List<string> selectedLocations,
            string selectedNature,
            string selectedCity,
            string sortBy,
            string FkMonthId,
            string FkYearId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);
            dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@shortby", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<ListofEmployeeForstopsalary, ListofEmployeeForstopsalary>(
              "SAL_SalaryStop_SelForGrid", dynamicParameters, "GetAll");

            var result = new StopSalaryProcessModel
            {
                ProcessSalary = tuple.Item1?.ToList(),
                StoppedSalary = tuple.Item2?.ToList(),

                //StoppedSalaryCount = tuple.Item2?.Count() ?? 0,
                //NotStoppedSalaryCount = tuple.Item3?.Count() ?? 0
            };

            return result;
        }





        public async Task<bool> StopSalaryAsync(List<EmpListItem> empList, string fk_monthId, string fk_yearId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap in XML structure
            var dataset = new EmpListDataSet { EmpList = empList };

            // Serialize to XML string
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters to Dapper
            dynamicParameters.Add("@xmlDoc", (object)xmlData, DbType.String);
            dynamicParameters.Add("@fk_monthId", (object)fk_monthId, DbType.String);
            dynamicParameters.Add("@fk_yearId", (object)fk_yearId, DbType.String);

            // Log XML for debug (optional)
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_Salary_Stop", dynamicParameters, "StopSalary");

            return result > 0;
        } 
        
        public async Task<bool> UnStopSalaryAsync(List<EmpListItem> empList, string fk_monthId, string fk_yearId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap in XML structure
            var dataset = new EmpListDataSet { EmpList = empList };

            // Serialize to XML string
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters to Dapper
            dynamicParameters.Add("@xmlDoc", (object)xmlData, DbType.String);
            dynamicParameters.Add("@fk_monthId", (object)fk_monthId, DbType.String);
            dynamicParameters.Add("@fk_yearId", (object)fk_yearId, DbType.String);

            // Log XML for debug (optional)
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_Salary_UnStop", dynamicParameters, "StopSalary");

            return result > 0;
        }



        public async Task<bool> PayStopSalaryAsync(List<EmpListItem> empList, string fk_monthId, string fk_yearId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap in XML structure
            var dataset = new EmpListDataSet { EmpList = empList };

            // Serialize to XML string
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters to Dapper
            dynamicParameters.Add("@xmlDoc", (object)xmlData, DbType.String);
            dynamicParameters.Add("@fk_monthId", (object)fk_monthId, DbType.String);
            dynamicParameters.Add("@fk_yearId", (object)fk_yearId, DbType.String);
            dynamicParameters.Add("@Paydate", (object)fk_yearId, DbType.String);

            // Log XML for debug (optional)
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_Salary_Pay", dynamicParameters, "PayStopSalary");

            return result > 0;
        }



        public async Task<PayStopSalaryProcessModel> GetSalaryPaidAsync(
           string empCode,
           string empCodeManual,
           string empName,
           List<string> selectedDepartments,
           string selectedDesignation,
           List<string> selectedLocations,
           string selectedNature,
           string selectedCity,
           string sortBy,
           string FkMonthId,
           string FkYearId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);
            dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@shortby", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<ListofEmployeeForstopsalary, ListofEmployeeForstopsalary>(
              "SAL_SalaryPaid_SelForGrid", dynamicParameters, "GetAll");

            var result = new PayStopSalaryProcessModel
            {
                StoppedSalary = tuple.Item1?.ToList(),
                PaidSalary = tuple.Item2?.ToList(),
                

                //StoppedSalaryCount = tuple.Item2?.Count() ?? 0,
                //NotStoppedSalaryCount = tuple.Item3?.Count() ?? 0
            };

            return result;
        }





        public async Task<(int totalCount, List<ListofEmployeeForstopsalary> result)>
        GetSalaryStopPaidAsync(
            int pageIndex, int pageSize,
            string empCode,
            string empCodeManual,
            string empName,
            List<string> selectedDepartments,
            string selectedDesignation,
            List<string> selectedLocations,
            string selectedNature,
            string selectedCity,
            string sortBy,
            string FkMonthId,
            string FkYearId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@empcode", empCode, DbType.String);
            dynamicParameters.Add("@empcodemanual", empCodeManual, DbType.String);
            dynamicParameters.Add("@empname", empName, DbType.String);
            dynamicParameters.Add("@xmlDoc", combinedXml, DbType.String);
            dynamicParameters.Add("@fk_designationid", selectedDesignation, DbType.String);
            dynamicParameters.Add("@fk_nature", selectedNature, DbType.String);
            dynamicParameters.Add("@fk_cityid", selectedCity, DbType.String);
            dynamicParameters.Add("@shortby", sortBy, DbType.String);
            dynamicParameters.Add("@fk_monthId", FkMonthId, DbType.String);
            dynamicParameters.Add("@fk_yearId", FkYearId, DbType.String);

            // Call your SP and fetch multiple result sets
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ListofEmployeeForstopsalary>(
                "SAL_SalaryStopPaid_SelForGrid", dynamicParameters, "LeaveType_GetAll"
            );


            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());

            //if (tuple == null || tuple.Item1 == null)
            //    return (0, new List<PayStopSalaryProcessModel>());

            //int totalCount = 0;
            //if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            //{
            //    totalCount = Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First());
            //}

            //return (totalCount, tuple.Item2?.ToList() ?? new List<PayStopSalaryProcessModel>());
        }

    }
}
