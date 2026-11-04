using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Org.BouncyCastle.Asn1.Ocsp;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmployeeRentDetailRepository : IEmployeeRentDetailRepository
    {

        CommonFunction commonFunction = new CommonFunction();

        // add this in rent detail repo

        public async Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
GetAutoIncentiveprocessAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
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
string FkYearId,
string fk_costcentreid,
string EmpStatus,
DateTime? fromDate,
DateTime? toDate
)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fromDate", (object)fromDate, new DbType?(DbType.Date), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@toDate", (object)toDate, new DbType?(DbType.Date), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EmpStatus", (object)EmpStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ListofEmployee, dynamic, ListofEmployee, dynamic, ListofEmployee>(
                "SAL_Incetive_SelForGrid", dynamicParameters, "SAL_Incetive_SelForGrid");

            var result = new autosalaryprocessModel();

            int SalaryNotProcessedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int SalaryProcessedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;

            int SalaryLockCount = tuple.Item5 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;



            result.SalaryNotProcessedCount = SalaryNotProcessedCount;
            result.SalaryProcessedCount = SalaryProcessedCount;
            result.SalaryLockCount = SalaryLockCount;

            result.SalaryNotProcessed = tuple.Item2?.ToList();
            result.SalaryProcessed = tuple.Item4?.ToList();
            result.SalaryLock = tuple.Item6?.ToList();


            return (SalaryNotProcessedCount, SalaryProcessedCount, SalaryLockCount, result);
        }




        public async Task<bool> InsertAutoIncentiveProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid1", dataMst.fk_costcentreid);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);
            dynamicParameters.Add("@fromDate", dataMst.fromdate);
            dynamicParameters.Add("@toDate", dataMst.todate);
            dynamicParameters.Add("@EmpStatus", dataMst.EmpStatus);

            int result = DataBaseFactory.QuerySP("SAL_Incetive_Process", dynamicParameters, "SAL_Bonus_Process");

            return result > 0;
        }


        public async Task<bool> DeleteIncentiveProcessAsync(AutoSalaryProcessPostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid", dataMst.fk_costcentreid);
            dynamicParameters.Add("@EmpStatus", dataMst.EmpStatus);
            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_Incetive_UnProcess", dynamicParameters, "SAL_Incetive_UnProcess");

            return result > 0;
        }




        //for get all
        public async Task<(int totalCount, IEnumerable<EmployeeRentMst>)> GetAll(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            //dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EmployeeRentMst>("SAL_Employee_Rent_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<EmployeeRentDetailResult> GetById(string fk_empid, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@fk_finid", fk_finid, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<EmpdetailMst, EmployeeRentDetail, EmployeeRentMst>("SAL_Employee_Rent_Edit", dynamicParameters, "GetAll");

            var result = new EmployeeRentDetailResult();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.empdetailMst = tuple.Item1.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.EmployeeRentDetail = tuple.Item2.ToList();
            }
            if (tuple != null && tuple?.Item3 != null)
            {
                result.EmployeeRentMst = tuple.Item3.FirstOrDefault();
            }

            return result; // return just one EmployeeRentDetail
        }
        //for insert


        public async Task<bool> Insert(EmployeeRentDetailDataSet dataMst, string fk_locId, string fk_userId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            // Serialize the complete dataMst object (contains RentMst + RentDetailMst)
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);



            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locId", (object)fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_Employee_Rent_Ins", dynamicParameters, "Ins");

            return result > 0;
        }

        public async Task<bool> Update(int pk_rentId, EmployeeRentDetailDataSet dataMst, string fk_locId, string fk_userId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Ensure RentMst has the primary key set
                if (dataMst?.RentMst != null)
                {
                    dataMst.RentMst.pk_rentId = pk_rentId;
                }

                // Serialize the whole dataset (includes RentMst, RentDetailMst, and optionally Landlord detail)
                string xmlData = XmlUtility.XmlSerializeToString(dataMst);

                // Debugging XML output (optional)
                Console.WriteLine("Generated XML for Update:\n" + xmlData);

                // Add parameters as required by the stored procedure
                dynamicParameters.Add("@pk_rentId", pk_rentId, DbType.Int64);
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@fk_locid", fk_locId, DbType.String);
                dynamicParameters.Add("@fk_userid", fk_userId, DbType.String);

                // Call the UPDATE stored procedure
                int result = DataBaseFactory.QuerySP("SAL_Employee_Rent_Upd", dynamicParameters, "Upd");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during Update: " + ex.Message);
                return false;
            }
        }


        //for delete

        public async Task<EmployeeRentDetailResult> delete(string fk_empid, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@fk_finid", fk_finid, DbType.String);

            //var tuple = DataBaseFactory.QueryMultipleSP<EmpdetailMst, EmployeeRentDetail, EmployeeRentMst>("SAL_Employee_Rent_Del", dynamicParameters, "Delete");

            //var result = new EmployeeRentDetailResult();
            //if (tuple != null && tuple?.Item1 != null)
            //{
            //    result.empdetailMst = tuple.Item1.FirstOrDefault();
            //}
            //if (tuple != null && tuple?.Item2 != null)    
            //{
            //    result.EmployeeRentDetail = tuple.Item2.ToList();
            //}
            //if (tuple != null && tuple?.Item3 != null)
            //{
            //    result.EmployeeRentMst = tuple.Item3.FirstOrDefault();
            //}

            //return result; // return just one EmployeeRentDetail


            int n = DataBaseFactory.QuerySP("SAL_Employee_Rent_Del", dynamicParameters, "Delete");
            var result = new EmployeeRentDetailResult();
            return result;
        }




        public async Task<Result<List<NameValue>>> GetMonthDropdownList(string EmpId, string companyId, string userId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            // dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EmpId", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // dynamicParameters.Add("@CompanyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Output Parameters
            //  dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            // dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("Common_Month_SELFORDDL", dynamicParameters, "GetMonthDropdownList");

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count > 0,
                Message = result.ToList().Count > 0 ? "Data retrieved" : "No record",
                Data = result.ToList()
            };

            return finalResult;
        }






        //monthly Attendance
        public async Task<(int notMarkedCount, int markedCount, int lockedCount, EmployeeAttendanceModel result)>
    GetEmployeeAttendanceAsync(
    int pageIndex1, int pageSize1,
    int pageIndex2, int pageSize2,
    int pageIndex3, int pageSize3,
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
    string FkYearId,
    string fk_costcentreid
)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, Employees, dynamic, Employees, dynamic, Employees>(
                "SAL_EmpAttendance_SelForGrid", dynamicParameters, "GetAll");

            var result = new EmployeeAttendanceModel();

            int notMarkedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;

            int markedCount = tuple.Item3 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;

            int lockedCount = tuple.Item5 is IEnumerable<dynamic> list5 && list5.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
                : 0;

            result.NotMarkedAttendanceCount = notMarkedCount;
            result.MarkedAttendanceCount = markedCount;
            result.LockedAttendanceCount = lockedCount;

            result.NotMarkedAttendance = tuple.Item2?.ToList();
            result.MarkedAttendance = tuple.Item4?.ToList();
            result.LockedAttendance = tuple.Item6?.ToList();

            return (notMarkedCount, markedCount, lockedCount, result);
        }



        public async Task<bool> InsertEmployeeAttendanceAsync(EmpAttendancePostModel dataMst, string fk_locId, string fk_userId, string fk_companyId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_finid", fk_finid);
            dynamicParameters.Add("@fk_companyId", fk_companyId);
            dynamicParameters.Add("@fk_costcentreid", dataMst.fk_costcentreid);
            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);

            int result = DataBaseFactory.QuerySP("SAL_EmpAttendance_Ins", dynamicParameters, "Ins");

            return result > 0;
        }



        public async Task<bool> DeleteEmployeeAttendanceAsync(EmpAttendancePostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid", dataMst.fk_costcentreid);

            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_EmpAttendance_Del", dynamicParameters, "Ins");

            return result > 0;
        }



        //auto salary process



        public async Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
        GetAutosalaryprocessAsync(
        int pageIndex1, int pageSize1,
        int pageIndex2, int pageSize2,
        int pageIndex3, int pageSize3,
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
        string FkYearId,
        string fk_costcentreid

        )
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ListofEmployee, dynamic, ListofEmployee, dynamic, ListofEmployee>(
                "SAL_Salary_SelForGrid", dynamicParameters, "GetAll");

            var result = new autosalaryprocessModel();

            int SalaryNotProcessedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int SalaryProcessedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;

            int SalaryLockCount = tuple.Item5 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;



            result.SalaryNotProcessedCount = SalaryNotProcessedCount;
            result.SalaryProcessedCount = SalaryProcessedCount;
            result.SalaryLockCount = SalaryLockCount;

            result.SalaryNotProcessed = tuple.Item2?.ToList();
            result.SalaryProcessed = tuple.Item4?.ToList();
            result.SalaryLock = tuple.Item6?.ToList();


            return (SalaryNotProcessedCount, SalaryProcessedCount, SalaryLockCount, result);
        }



        public async Task<bool> InsertAutoSalaryProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_finid", fk_finid);
            dynamicParameters.Add("@fk_costcentreid1", dataMst.fk_costcentreid);

            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);
            dynamicParameters.Add("@selectedempcode", dataMst.selectedempcode);

            int result = DataBaseFactory.QuerySP("SAL_Salary_Process", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> DeleteSalaryProcessAsync(AutoSalaryProcessPostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid", dataMst.fk_costcentreid);
            dynamicParameters.Add("@selectedempcode", dataMst.selectedempcode);

            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_Salary_UnProcess", dynamicParameters, "Ins");

            return result > 0;
        }

        //auto salary process



        public async Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
        GetAutobonusprocessAsync(
        int pageIndex1, int pageSize1,
        int pageIndex2, int pageSize2,
        int pageIndex3, int pageSize3,
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
        string FkYearId,
        string fk_costcentreid,
        DateTime? fromDate,
        DateTime? toDate,
        string EmpStatus
        )
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fromDate", (object)fromDate, new DbType?(DbType.Date), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@toDate", (object)toDate, new DbType?(DbType.Date), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EmpStatus", (object)EmpStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ListofEmployee, dynamic, ListofEmployee, dynamic, ListofEmployee>(
                "SAL_Bonus_SelForGrid", dynamicParameters, "SAL_Bonus_SelForGrid");

            var result = new autosalaryprocessModel();

            int SalaryNotProcessedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int SalaryProcessedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;

            int SalaryLockCount = tuple.Item5 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;



            result.SalaryNotProcessedCount = SalaryNotProcessedCount;
            result.SalaryProcessedCount = SalaryProcessedCount;
            result.SalaryLockCount = SalaryLockCount;

            result.SalaryNotProcessed = tuple.Item2?.ToList();
            result.SalaryProcessed = tuple.Item4?.ToList();
            result.SalaryLock = tuple.Item6?.ToList();


            return (SalaryNotProcessedCount, SalaryProcessedCount, SalaryLockCount, result);
        }



        public async Task<bool> InsertAutoBonusProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid1", dataMst.fk_costcentreid);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);
            dynamicParameters.Add("@fromDate", dataMst.fromdate);
            dynamicParameters.Add("@toDate", dataMst.todate);
            dynamicParameters.Add("@EmpStatus", dataMst.EmpStatus);

            int result = DataBaseFactory.QuerySP("SAL_Bonus_Process", dynamicParameters, "SAL_Bonus_Process");

            return result > 0;
        }


        public async Task<bool> DeleteBonusProcessAsync(AutoSalaryProcessPostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid", dataMst.fk_costcentreid);
            dynamicParameters.Add("@EmpStatus", dataMst.EmpStatus);
            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_Bonus_UnProcess", dynamicParameters, "SAL_Bonus_UnProcess");

            return result > 0;
        }



        //Arrear Process


        public async Task<(int ArrearUnProcessedCount, int ArrearProcessedCount, arrearProcessModel result)>
GetArrearprocessAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
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
string FkYearId, string Type)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Type", (object)Type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ListofEmployeeForArrear, dynamic, ListofEmployeeForArrear>(
                "SAL_Arrear_SelForGrid", dynamicParameters, "GetAll");

            var result = new arrearProcessModel();

            int arrearUnProcessedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int arrearProcessedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;




            result.ArrearUnProcessedCount = arrearUnProcessedCount;
            result.ArrearProcessedCount = arrearProcessedCount;


            result.ArrearUnProcessed = tuple.Item2?.ToList();
            result.ArrearProcessed = tuple.Item4?.ToList();



            return (arrearUnProcessedCount, arrearProcessedCount, result);
        }



        public async Task<bool> InsertArrearProcessAsync(ArrearProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_finid", fk_finid);
            dynamicParameters.Add("@Fromdate", dataMst.Fromdate);
            dynamicParameters.Add("@Todate", dataMst.Todate);
            dynamicParameters.Add("@Tdays", dataMst.Tdays);
            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);

            int result = DataBaseFactory.QuerySP("SAL_Arrear_Process", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> ArrearUnProcessAsync(ArrearProcessPostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);


            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_Arrear_UnProcess", dynamicParameters, "Ins");

            return result > 0;
        }


        //ITProcess



        public async Task<(int UnprocessedCount, int ProcessedCount, int LockedCount, ITProcessModel result)>
GetITProcessedDataAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
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

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ITProcessEmployees, dynamic, ITProcessEmployees, dynamic, ITProcessEmployees>(
                "SAL_IT_SelForGrid", dynamicParameters, "GetAll");

            var result = new ITProcessModel();

            int unProcessedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int ProcessedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;

            int LockedCount = tuple.Item5 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;



            result.unProcessedCount = unProcessedCount;
            result.ProcessedCount = ProcessedCount;
            result.LockedCount = LockedCount;

            result.UnProcessedList = tuple.Item2?.ToList();
            result.ProcessedList = tuple.Item4?.ToList();
            result.LockedList = tuple.Item6?.ToList();


            return (unProcessedCount, ProcessedCount, LockedCount, result);
        }


        public async Task<bool> InsertITProcessAsync(ITProcessePostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_finid", fk_finid);
            dynamicParameters.Add("@ReimDocStatus", dataMst.DocStatus);
            dynamicParameters.Add("@Process", dataMst.Process == "\0" ? "1" : dataMst.Process);


            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);

            int result = DataBaseFactory.QuerySP("SAL_IT_Process_Main", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> ITUnProcessAsync(ITProcessePostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);


            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_IT_UnProcess", dynamicParameters, "Ins");

            return result > 0;
        }


        //Lock Income Tax

        public async Task<(int ITNotLockedCount, int ITLockedCount, int ITLocked_ITNotProcessed, LockITModel result)>
GetLockITAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
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

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ITProcessEmployees, dynamic, ITProcessEmployees, dynamic, ITProcessEmployees>(
                "SAL_ITLocked_SelForGrid", dynamicParameters, "GetAll");

            var result = new LockITModel();

            int iTNotLockedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int iTLockedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;

            int iTLocked_ITNotProcessed = tuple.Item5 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;



            result.ITNotLockCount = iTNotLockedCount;
            result.ITLockCount = iTLockedCount;
            result.ITLocked_NotProcessedCount = iTLocked_ITNotProcessed;

            result.ITNotLockList = tuple.Item2?.ToList();
            result.ITLockList = tuple.Item4?.ToList();
            result.ITLocked_NotProcessedList = tuple.Item6?.ToList();


            return (iTNotLockedCount, iTLockedCount, iTLocked_ITNotProcessed, result);
        }





        public async Task<bool> InsertITLockAsync(ITProcessePostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_finid", fk_finid);
            dynamicParameters.Add("@ReimDocStatus", dataMst.DocStatus);
            dynamicParameters.Add("@Process", dataMst.Process == "\0" ? "1" : dataMst.Process);


            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);

            int result = DataBaseFactory.QuerySP("SAL_ITLocked_Process_Main", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> ITLockAsync(ITProcessePostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);


            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_ITLocked_UnProcess", dynamicParameters, "Ins");

            return result > 0;
        }

        // FOr Attendance InOut SHift


        public async Task<(int totalCount, IEnumerable<dynamic>, string)> AttendanceDetailsinoutForAll(
 int pageindex,
 int pagesize,
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
string FkYearId,
string fk_costcentreid

)


        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);


            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>(
            "EMP_Attendance_Details_inoutForAll", dynamicParameters, "GetAll");

            if (tuple == null || tuple.Item2 == null) return (0, [], "");
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            string cycleType = tuple.Item3 is IEnumerable<dynamic> cycleList && cycleList.Any()
                ? Convert.ToString(((IDictionary<string, object>)cycleList.First()).Values.First()) : "";

            return (totalCount, tuple?.Item2?.ToList(), cycleType);
        }


        //here i have to add

        //added by pp 12-09-2025
        public async Task<Result> UpdateAttendanceAsync(AttendanceUpdateModel model, string fk_finid, string userId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();



            dynamicParameters.Add("@userId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pk_empid", (object)model.pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EmpCode", (object)model.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Dated", (object)model.Dated, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@InTime", (object)model.InTime, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OutTime", (object)model.OutTime, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@WorkHour", (object)model.WorkHour, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ShiftName", (object)model.ShiftName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@DayStatus", (object)model.DayStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OutTimeDate", (object)model.OutTimeDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OThour", (object)model.OThour, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OTlapsed", (object)model.OTlapsed, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@shortleaveLapsed", (object)model.shortleaveLapsed, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@LatecomingLapsed", (object)model.LatecomingLapsed, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsLeave ", (object)model.IsLeave, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsHalfday", (object)model.IsHalfday, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@LeaveId ", (object)model.LeaveId, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ShiftActualTime", (object)model.ShiftActualTime, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@OTLapsedHours", (object)model.OTLapsedHours, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@TotalOTHour", (object)model.TotalOTHour, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@onlyot", (object)model.onlyot, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            dynamicParameters.Add("@Remark", (object)model.Remark, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<Result>("Usp_SAL_Attendance_InOut_Update", dynamicParameters, "Upd").FirstOrDefault();

            return result;
        }



        public async Task<IEnumerable<ShiftTimeModel>> ShiftMstGetByNameAsync(long pk_shiftId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters required by the SP
            dynamicParameters.Add("@pk_shiftId", pk_shiftId);

            var result = await DataBaseFactory.QuerySPAsync<ShiftTimeModel>("[SAL_ShiftMst_GetByName]", dynamicParameters, "Upd");

            return result;
        }



        public async Task<IEnumerable<AttendanceStatusDDLModel>> GetAttendanceStatusForDDLAsync(string empId = null)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@EmpId", empId);
            var result = await DataBaseFactory.QuerySPAsync<AttendanceStatusDDLModel>("SAL_Attendance_Status_SelForDLL", dynamicParameters, "HRMS_Demo");
            return result;
        }


        // Reimbursentment

        public async Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
GetAutosalaryprocessReimAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
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
string FkYearId,
string fk_costcentreid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ListofEmployee, dynamic, ListofEmployee, dynamic, ListofEmployee>(
                "SAL_Salary_SelForGrid_Reim", dynamicParameters, "GetAll");

            var result = new autosalaryprocessModel();

            int SalaryNotProcessedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int SalaryProcessedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;

            int SalaryLockCount = tuple.Item5 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;



            result.SalaryNotProcessedCount = SalaryNotProcessedCount;
            result.SalaryProcessedCount = SalaryProcessedCount;
            result.SalaryLockCount = SalaryLockCount;

            result.SalaryNotProcessed = tuple.Item2?.ToList();
            result.SalaryProcessed = tuple.Item4?.ToList();
            result.SalaryLock = tuple.Item6?.ToList();


            return (SalaryNotProcessedCount, SalaryProcessedCount, SalaryLockCount, result);
        }



        public async Task<bool> InsertAutoSalaryProcessReimAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_finid", fk_finid);
            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);
            dynamicParameters.Add("@fk_cost_centre_id", dataMst.fk_costcentreid);

            int result = DataBaseFactory.QuerySP("SAL_Salary_Process_Reim", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> DeleteSalaryProcessReimAsync(AutoSalaryProcessPostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_cost_centre_id", dataMst.fk_costcentreid);


            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_Salary_UnProcess_Reim", dynamicParameters, "Ins");

            return result > 0;
        }

        public async Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
GetAutoLTAprocessAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
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
string FkYearId,
string fk_costcentreid,
DateTime? fromDate,
DateTime? toDate,
string EmpStatus
)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize1", (object)pageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@pageindex2", (object)pageIndex2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize2", (object)pageSize2, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pageindex3", (object)pageIndex3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize3", (object)pageSize3, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fromDate", (object)fromDate, new DbType?(DbType.Date), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@toDate", (object)toDate, new DbType?(DbType.Date), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EmpStatus", (object)EmpStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ListofEmployee, dynamic, ListofEmployee, dynamic, ListofEmployee>(
                "SAL_LTA_SelForGrid", dynamicParameters, "SAL_LTA_SelForGrid");

            var result = new autosalaryprocessModel();

            int SalaryNotProcessedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int SalaryProcessedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;

            int SalaryLockCount = tuple.Item5 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;



            result.SalaryNotProcessedCount = SalaryNotProcessedCount;
            result.SalaryProcessedCount = SalaryProcessedCount;
            result.SalaryLockCount = SalaryLockCount;

            result.SalaryNotProcessed = tuple.Item2?.ToList();
            result.SalaryProcessed = tuple.Item4?.ToList();
            result.SalaryLock = tuple.Item6?.ToList();


            return (SalaryNotProcessedCount, SalaryProcessedCount, SalaryLockCount, result);
        }



        public async Task<bool> InsertAutoLTAProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid1", dataMst.fk_costcentreid);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_locid", fk_locId);
            dynamicParameters.Add("@fk_userID", fk_userId);
            dynamicParameters.Add("@fromDate", dataMst.fromdate);
            dynamicParameters.Add("@toDate", dataMst.todate);
            dynamicParameters.Add("@EmpStatus", dataMst.EmpStatus);

            int result = DataBaseFactory.QuerySP("SAL_LTA_Process", dynamicParameters, "SAL_LTA_Process");

            return result > 0;
        }


        public async Task<bool> DeleteLTAProcessAsync(AutoSalaryProcessPostModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the complete object

            var combinedXml = commonFunction.GetRecords(dataMst.SelectedLocations, dataMst.SelectedDepartments);
            // Required SP params from model
            dynamicParameters.Add("@empcode", dataMst.EmpCode);
            dynamicParameters.Add("@empcodemanual", dataMst.EmpCodeManual);
            dynamicParameters.Add("@empname", dataMst.EmpName);
            dynamicParameters.Add("@fk_designationid", dataMst.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", dataMst.SelectedNature);
            dynamicParameters.Add("@fk_cityid", dataMst.SelectedCity);
            dynamicParameters.Add("@fk_monthId", dataMst.FkMonthId);
            dynamicParameters.Add("@fk_yearId", dataMst.FkYearId);
            dynamicParameters.Add("@fk_costcentreid", dataMst.fk_costcentreid);
            dynamicParameters.Add("@EmpStatus", dataMst.EmpStatus);
            // XML and other parameters
            dynamicParameters.Add("@xmlDoc", combinedXml);

            int result = DataBaseFactory.QuerySP("SAL_LTA_UnProcess", dynamicParameters, "SAL_LTA_UnProcess");

            return result > 0;
        }



    }


}