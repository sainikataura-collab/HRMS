using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class AttendanceAdjustmentRepository:IAttendanceAdjustmentRepository
    {
        CommonFunction commonFunction = new CommonFunction();
        public async Task<(int totalCount, EmployeeDetailResult)> GetAll(int pageIndex, int pageSize, int pageIndex1, int pageSize1, EmpAttendanceAdjRequest filter)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(filter.SelectedLocations, filter.SelectedDepartments);

            dynamicParameters.Add("@pageindex", (object)pageIndex);
            dynamicParameters.Add("@pagesize", (object)pageSize);
            dynamicParameters.Add("@pageindex1", (object)pageIndex1);
            dynamicParameters.Add("@pagesize1", (object)pageSize1);
            dynamicParameters.Add("@empcode", (object)filter.empcode ?? "");
            dynamicParameters.Add("@empcodemanual", (object)filter.empcodemanual ?? "");
            dynamicParameters.Add("@empname", (object)filter.empname ?? "");
            dynamicParameters.Add("@xmlDoc", (object)combinedXml);
            dynamicParameters.Add("@fk_designationid", (object)filter.selectedDesignation ?? "");
            dynamicParameters.Add("@fk_nature", (object)filter.selectedNature ?? "");
            dynamicParameters.Add("@fk_cityid", (object)filter.selectedCity ?? "");
            dynamicParameters.Add("@shortby", (object)filter.sortBy ?? "");
            dynamicParameters.Add("@fk_monthId", (object)filter.fk_monthId ?? "");
            dynamicParameters.Add("@fk_yearId", (object)filter.fk_yearId ?? "");
            dynamicParameters.Add("@fk_costcentreid", (object)filter.fk_costcentreid ?? "");


            // Assuming DataBaseFactory.QueryMultipleSP executes the stored procedure and returns the tuple with two results
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ProcessedMst, dynamic, AttendanceAdjustmentMst>("SAL_EmpAttendance_Adj_SelForGrid", dynamicParameters, "GetAll");
            var result = new EmployeeDetailResult();


            //var countRow1 = tuple.Item1?.FirstOrDefault();
            //if (countRow1 != null && countRow1 != null)
            //{
            //    result.ProcessedMstCount = Convert.ToInt32(countRow1);
            //}


            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            if (tuple != null && tuple?.Item2 != null)
            {
                result.ProcessedMst = tuple.Item2.ToList();

            }

            int totalCountAdj = tuple.Item3 is IEnumerable<dynamic> totalListadj && totalListadj.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalListadj.First()).Values.First()) : 0;


            if (tuple != null && tuple?.Item4 != null)
            {
                result.AttendanceAdjustmentMst = tuple.Item4.ToList();
            }
            result.AttendanceAdjustmentMstCount = totalCountAdj;


            return (totalCount, result);

            // return result;

        }

        public async Task<bool>UpdateAttendanceAdjustmentAsync(AttendanceAdjustmentXmlModel model, string Fk_UserID, string Fk_LocID)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

              

                // Serialize the whole dataset (includes RentMst, RentDetailMst, and optionally Landlord detail)
                string xmlData = XmlUtility.XmlSerializeToString(model);

                // Debugging XML output (optional)
                Console.WriteLine("Generated XML for Update:\n" + xmlData);

                // Add parameters as required by the stored procedure
                
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
                dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);

                // Call the UPDATE stored procedure
                int result = DataBaseFactory.QuerySP("SAL_EmpAttendance_Adj_Upd", dynamicParameters, "Upd");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during Update: " + ex.Message);
                return false;
            }
        }




    }
}
