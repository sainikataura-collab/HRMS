using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class EmployeeRepository : IEmployeeRepository
    {

        CommonFunction commonFunction = new CommonFunction();

        public async Task<(int totalCount, IEnumerable<Employee>)> GetAllEmployeesAsync(
        int pageIndex, int pageSize, string empCode, string empCodeManual,
        string empName, List<string> selectedDepartments, string selectedDesignation,
        List<string> selectedLocations, string selectedNature, string selectedCity,
        string sortBy, string userId, string empStatus)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Convert selectedDepartments and selectedLocations into XML format
            var locationXml = XmlUtility.XmlSerializeToString(new LocationList { Locations = selectedLocations });
            var departmentXml = XmlUtility.XmlSerializeToString(new DepartmentList { Departments = selectedDepartments });

            // Combine both into one XML structure
            var combinedXml = $"<NewDataSet>{locationXml}{departmentXml}</NewDataSet>";

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

            // Call the stored procedure
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, Employee>("SAL_Employee_SelForGrid_v1", dynamicParameters, "Employee_GetAll");

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

        public async Task<IEnumerable<NameValue>> GetEmployeesForDropdownAsync(
            string empCode,
            string empCodeManual,
            string empName,
            List<string> selectedDepartments,
            string selectedDesignation,
            List<string> selectedLocations,
            string selectedNature,
            string selectedCity,
            string sortBy,
            string userId,
            string empStatus)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Convert selectedDepartments and selectedLocations into XML format
            //var locationXml = XmlUtility.XmlSerializeToString(new LocationList { Locations = selectedLocations });
            //var departmentXml = XmlUtility.XmlSerializeToString(new DepartmentList { Departments = selectedDepartments });

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);
            // Combine both into one XML structure
            //var combinedXml = $"<NewDataSet>{locationXml}{departmentXml}</NewDataSet>";


            // Adding parameters
            dynamicParameters.Add("@empcode", empCode, DbType.String);
            dynamicParameters.Add("@empcodemanual", empCodeManual, DbType.String);
            dynamicParameters.Add("@empname", empName, DbType.String);
            dynamicParameters.Add("@xmlDoc", combinedXml, DbType.String);
            dynamicParameters.Add("@fk_designationid", selectedDesignation, DbType.String);
            dynamicParameters.Add("@fk_nature", selectedNature, DbType.String);
            dynamicParameters.Add("@fk_cityid", selectedCity, DbType.String);
            dynamicParameters.Add("@shortby", sortBy, DbType.String);
            dynamicParameters.Add("@fk_userid", userId, DbType.String);
            dynamicParameters.Add("@EmpStatus", empStatus, DbType.String);

            // Call the stored procedure
            var employees = DataBaseFactory.QuerySP<NameValue>("SAL_Employee_SelForGrid_Ddl_v1", dynamicParameters, "Employee_GetDropdown");

            return employees?.ToList() ?? new List<NameValue>();
        }


        public async Task<int> ImageUploadAsync(EmployeeImageMeta employee)
        {

            string xmlData = XmlUtility.XmlSerializeToString(employee.Items);

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Filename", (object)employee.Filename, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@ContentType", (object)employee.ContentType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FileBytes", (object)employee.FileBytes, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Call the stored procedure
            int Response = DataBaseFactory.QuerySP("HR_Employee_Image_Ins", dynamicParameters, "Employee_Image_Ins");

            return Response;
        }


        public Task<dynamic> GetEmployeeProfileViewAsync(string empId)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_Empid", empId, DbType.String, ParameterDirection.Input);

            // Execute using the existing DataBaseFactory Tuple approach but with dynamic models
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic, dynamic, dynamic>(
                "SAL_Employee_View",
                dynamicParameters,
                "Employee_ProfileView"
            );

            if (tuple != null)
            {
                var basicInfo = tuple.Item1?.FirstOrDefault();
                var otherInfo = tuple.Item2?.FirstOrDefault();
                var updationInfo = tuple.Item3?.FirstOrDefault();
                var qualificationDetails = tuple.Item4?.ToList();
                var salaryHistory = tuple.Item5?.ToList();
                var imageResult = tuple.Item6?.FirstOrDefault();

                string imageFileName = null;
                if (imageResult != null)
                {
                    try { imageFileName = imageResult.filename; } catch { }
                }

                return Task.FromResult<dynamic>(new
                {
                    basicInfo = basicInfo,
                    otherInfo = otherInfo,
                    updationInfo = updationInfo,
                    qualificationDetails = qualificationDetails,
                    salaryHistory = salaryHistory,
                    imageFileName = imageFileName
                });
            }

            return Task.FromResult<dynamic>(null);
        }


        public async Task<(int totalCount, IEnumerable<EmployeeImageItem>)> GetEmployee_ImageAsync(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Adding parameters
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Call the stored procedure
            var employees = DataBaseFactory.QueryMultipleSP<dynamic, EmployeeImageItem>("HR_EmployeeImage_SelForGrid", dynamicParameters, "Employee_Image_Mst_Img_View_SelForGrid");

            //return employees?.ToList() ?? new List<EmployeeImageItem>();
            if (employees == null || employees.Item2 == null)
                return (0, new List<EmployeeImageItem>());

            // Extract totalCount safely
            int totalCount = 0;
            if (employees.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                }
            }

            return (totalCount, employees.Item2?.ToList() ?? new List<EmployeeImageItem>());

        }

        public async Task<bool> Del_Employee_ImageAsync(string imgId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Adding parameters
            dynamicParameters.Add("@pk_imageid", (object)imgId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int result = DataBaseFactory.QuerySP("HR_Employee_Image_Mst_Delete", dynamicParameters, "Employee_Image_Mst_Delete");

            return result > 0;

        }


        //add code 23 june
        //public async Task<(bool IsSuccessful, string ErrorMessage)> InsertEmployeeAttendance(MarkEmployeeAttendance attendance)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    dynamicParameters.Add("@fk_empId", (object)attendance.FkEmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());
        //    dynamicParameters.Add("@attenType", (object)attendance.AttenType, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());
        //    dynamicParameters.Add("@latitude", (object)attendance.Latitude, new DbType?(DbType.String), new ParameterDirection?(), new int?(20), new byte?(), new byte?());
        //    dynamicParameters.Add("@longitude", (object)attendance.Longitude, new DbType?(DbType.String), new ParameterDirection?(), new int?(20), new byte?(), new byte?());
        //    dynamicParameters.Add("@locAddress", (object)attendance.LocAddress, new DbType?(DbType.String), new ParameterDirection?(), null, new byte?(), new byte?());
        //    dynamicParameters.Add("@filePath", (object)attendance.FilePath, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
        //    dynamicParameters.Add("@IsOutOfRange", (object)attendance.IsOutOfRange, new DbType?(DbType.Boolean), new ParameterDirection?(), null, new byte?(), new byte?());
        //    dynamicParameters.Add("@Distance", (object)attendance.Distance, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());

        //    var result = DataBaseFactory.QuerySP<dynamic>("SAL_ApplyAttendance_Mst_InsforMobile", dynamicParameters, "Insert Employee Attendance").FirstOrDefault();

        //    bool isSuccessful = result?.IsSuccessfully ?? false;
        //    string errorMessage = result?.ErrorMessage ?? string.Empty;

        //    return (isSuccessful, errorMessage);
        //}


        public async Task<(bool IsSuccessful, string ErrorMessage)> InsertEmployeeAttendance(MarkEmployeeAttendance attendance)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            bool isOutOfRange = attendance?.IsOutOfRange == "1" ? true : false;

            dynamicParameters.Add("@fk_empId", (object)attendance.FkEmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());
            dynamicParameters.Add("@attenType", (object)attendance.AttenType, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());
            dynamicParameters.Add("@latitude", (object)attendance.Latitude, new DbType?(DbType.String), new ParameterDirection?(), new int?(20), new byte?(), new byte?());
            dynamicParameters.Add("@longitude", (object)attendance.Longitude, new DbType?(DbType.String), new ParameterDirection?(), new int?(20), new byte?(), new byte?());
            dynamicParameters.Add("@locAddress", (object)attendance.LocAddress, new DbType?(DbType.String), new ParameterDirection?(), null, new byte?(), new byte?());
            dynamicParameters.Add("@filePath", (object)attendance.FilePath, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@IsOutOfRange", (object)isOutOfRange, new DbType?(DbType.Boolean), new ParameterDirection?(), null, new byte?(), new byte?());
            dynamicParameters.Add("@Distance", (object)attendance.Distance, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<dynamic>("SAL_ApplyAttendance_Mst_InsforMobile", dynamicParameters, "Insert Employee Attendance").FirstOrDefault();

            bool isSuccessful = result?.IsSuccessfully ?? false;
            string errorMessage = result?.ErrorMessage ?? string.Empty;

            return (isSuccessful, errorMessage);
        }


        public async Task<dynamic> GetEmployeeInfoForAttendanceMarkAsync(string empId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", (object)empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("GetEmployeeInfoForAttendanceMark", dynamicParameters, "GetEmployeeInfoForAttendanceMark");

            var empInfo = result.Item1?.FirstOrDefault(); // first result: geofence and mobile attendance
            var locations = result.Item2?.ToList();       // second result: list of locations

            var response = new
            {
                IsMobileAttendanceAllowed = empInfo?.IsMobileAttendanceAllowed == 1,
                isGeoFence = empInfo?.geofence == "1" ? true : false,
                isMultiLocationAllowed = locations != null && locations.Count > 1, // >1 means multiple
                Locations = locations?.Select(loc => new
                {
                    latitude = loc.latitude,
                    longitude = loc.longitude,
                    distance = loc.distance,
                    markAttendance = loc.MarkAttendance
                }).ToList()
            };

            return response;
        }

        public async Task<IEnumerable<NameValue>> GetEmployeesForDropdownAsyncfor50(
   string empCode,
   string empCodeManual,
   string empName,
   List<string> selectedDepartments,
   string selectedDesignation,
   List<string> selectedLocations,
   string selectedNature,
   string selectedCity,
   string sortBy,
   string userId,
   string empStatus,
   string search,
   int pageNo,
   int pageSize
   )
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Convert selectedDepartments and selectedLocations into XML format
            //var locationXml = XmlUtility.XmlSerializeToString(new LocationList { Locations = selectedLocations });
            //var departmentXml = XmlUtility.XmlSerializeToString(new DepartmentList { Departments = selectedDepartments });

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);
            // Combine both into one XML structure
            //var combinedXml = $"<NewDataSet>{locationXml}{departmentXml}</NewDataSet>";


            // Adding parameters
            dynamicParameters.Add("@empcode", empCode, DbType.String);
            dynamicParameters.Add("@empcodemanual", empCodeManual, DbType.String);
            dynamicParameters.Add("@empname", empName, DbType.String);
            dynamicParameters.Add("@xmlDoc", combinedXml, DbType.String);
            dynamicParameters.Add("@fk_designationid", selectedDesignation, DbType.String);
            dynamicParameters.Add("@fk_nature", selectedNature, DbType.String);
            dynamicParameters.Add("@fk_cityid", selectedCity, DbType.String);
            dynamicParameters.Add("@shortby", sortBy, DbType.String);
            dynamicParameters.Add("@fk_userid", userId, DbType.String);
            dynamicParameters.Add("@EmpStatus", empStatus, DbType.String);
            dynamicParameters.Add("@Search", search, DbType.String);
            dynamicParameters.Add("@PageNo", pageNo, DbType.Int32);
            dynamicParameters.Add("@PageSize", pageSize, DbType.Int32);

            // Call the stored procedure
            var employees = DataBaseFactory.QuerySP<NameValue>("SAL_Employee_SelForGrid_Ddl_v1for50", dynamicParameters, "Employee_GetDropdown");

            return employees?.ToList() ?? new List<NameValue>();
        }

    }
}
