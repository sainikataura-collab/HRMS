using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class RegulariseAttendanceRepository : IRegulariseAttendanceRepository
    {

        public async Task<(dynamic Summary, List<dynamic> Logs)> EMPAttendanceDashNew(string Month, string Year, string EmpId)
        {
            using (var connection = DataBaseFactory.ConnString())
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_empid", EmpId, DbType.String);
                dynamicParameters.Add("@fk_monthId", Month, DbType.String);
                dynamicParameters.Add("@fk_yearId", Year, DbType.String);

                using (var multi = await connection.QueryMultipleAsync(
                    "EMP_Attendance_Dash",
                    dynamicParameters,
                    commandType: CommandType.StoredProcedure
                ))
                {
                    // First result set: Attendance Summary
                    var summary = multi.ReadFirstOrDefault();

                    // Second result set: Recent Logs
                    var logs = multi.Read().ToList();

                    return (summary, logs);
                }
            }
        }

        public async Task<ModelResponse> InsertCDOAsync(CDORequestList data)
        {
            string xmlData = XmlUtility.XmlSerializeToString(data);  // Convert model to XML
             
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.String);


            var result = DataBaseFactory.QuerySP<ModelResponse>(
                        "SAL_Attendance_CDO_Ins",
                        parameters,
                        "SAL_Attendance_CDO_Ins"
                    ).FirstOrDefault<ModelResponse>();

            return result; // returns true if at least 1 row inserted
        }

        public async Task<bool> InsertRegulariseAttendanceAsync(RegulariseAttendanceMstDataSet data)
        {
            data.RegulariseAttendanceMst.fk_inoutid =Convert.ToInt64( data.RegulariseAttendanceMst.attenDate);
            data.RegulariseAttendanceMst.status = 1;
            // Step 1: Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(data);
            // Step 2: Prepare Dynamic Parameters
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.String);
            // Step 3: Call Stored Procedure
            int rowsAffected = await Task.Run(() =>
                DataBaseFactory.QuerySP("SAL_Attendance_InOut_Regularisation_Ins", parameters, "InsertRegulariseAttendance"));
            // Step 4: Return Status
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<dynamic>> GetAllRegulariseAttendanceByEmpAsync(string fk_empid, int? month, int? year)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_empid", fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            parameters.Add("@month", month);
            parameters.Add("@year", year);
            var result = await Task.Run(() => DataBaseFactory.QuerySP<dynamic>("SAL_Attendance_InOut_Regularisation_Selforgrid", parameters, "Get_RegulariseAttendanceList"));
            return result ?? new List<dynamic>();
        }

        public async Task<(bool isSuccess, string message)> DeleteAttendanceRegularisationAsync(long pk_inoutid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_inoutid", pk_inoutid, DbType.Int64);

            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
                "SAL_Attendance_InOut_Regularisation_Del",
                dynamicParameters,
                "AttendanceRegularisation_Delete" // category/logging key
            );

            var row = result.FirstOrDefault();
            if (row != null)
            {
                return (row.IsSuccess == 1, row.Message);
            }

            return (false, "Unexpected error occurred while deleting attendance regularisation.");
        }


        public async Task<Result<List<RegularisationDateddl>>> GetRegularisationDateDropdownAsync(string empId, string? flag)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@flag", (object)flag, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Output Parameters
            //dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            //dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<RegularisationDateddl>("EMP_RegularisationDate_SelForddl", dynamicParameters, "EMP_RegularisationDate_SelForddl");
            // Final Output
            var finalResult = new Result<List<RegularisationDateddl>>
            {
                //IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                //Message = dynamicParameters.Get<string>("@Message"),
                Data = result.ToList()
            };

            return finalResult;
        }

        public async Task<Result<List<AttendanceInOutRegularisationGetTime>>> GetInOutTimeByInoutIdAsync(string empId, long pk_inoutid)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pk_inoutid", (object)pk_inoutid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Stored procedure call
            var result = DataBaseFactory.QuerySP<AttendanceInOutRegularisationGetTime>("SAL_Attendance_InOut_Regularisation_GetTime", dynamicParameters, "SAL_Attendance_InOut_Regularisation_GetTime");
            // Final Output
            var finalResult = new Result<List<AttendanceInOutRegularisationGetTime>>
            {
                Data = result.ToList()
            };

            return finalResult;
        }


        //shiv


        public async Task<EMP_Attendance_DetailsMain> EMPAttendanceDetails(string Month, string Year, string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)Month, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)Year, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<EMP_Attendance_Consolidate, EMP_Attendance_Details>("EMP_Attendance_Details_New1", dynamicParameters, "EMP_Attendance_Details_New1");
            //Convert Total Count
            EMP_Attendance_DetailsMain obj = new EMP_Attendance_DetailsMain();

            if(tuple.Item1 != null)
                obj.Atten = tuple?.Item1.FirstOrDefault<EMP_Attendance_Consolidate>();

            if (tuple.Item2 != null)
                obj.AttenList = tuple?.Item2.ToList<EMP_Attendance_Details>();

            return obj;
        }


        public async Task<Result<List<NameValue>>> GetEmployeeNameDropdownList(string EmpId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = await DataBaseFactory.QuerySPAsync<NameValue>("SAL_Employee_SelForddl_Reportees", dynamicParameters, "SAL_Employee_SelForddl_Reportees]");
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count > 0,
                Message = result.ToList().Count > 0 ? "Data retrieved" : "No record",
                Data = result.ToList()
            };

            return finalResult;
        }

        public async Task<List<EMPAttendanceDash>> EMPAttendanceDash(string Month, string Year, string EmpId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)EmpId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)Month, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)Year, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<EMPAttendanceDash>("EMP_Attendance_Details_Dash", dynamicParameters, "EMP_Attendance_Details_Dash").ToList();
            return result;

        }

    }
}
