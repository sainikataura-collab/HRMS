

using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class EmployeeMstRepository : IEmployeeMstRepository
    {
        CommonFunction commonFunction = new CommonFunction();

        public async Task<InsertEmployeeResult> InsertEmployeeAsync(EmployeeMstDataSet employeeList, EmployeeMst employee, EmployeeOtherDetails employeeOther, string Fk_UserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            EmployeeMstDataSet dataset = new EmployeeMstDataSet
            {
                Employee = employee,
                EmployeeOther = employeeOther

            };
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            var result = DataBaseFactory.QuerySP<InsertEmployeeResult>("SAL_EmployeeMst_Ins", dynamicParameters);

            return result.FirstOrDefault();
        }

        //public async Task<(int totalCount, IEnumerable<EmployeeMaster>)> GetAllEmployeesAsync(
        //int pageIndex, int pageSize, string empCode, string empCodeManual,
        //string empName, List<string> selectedDepartments, string selectedDesignation,
        //List<string> selectedLocations, string selectedNature, string selectedCity,
        //string sortBy, string userId, string empStatus, string fk_costcentreid, string? searchTerm)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Combine both into one XML structure
        //    var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);
        //    dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@shortby", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_userid", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@EmpStatus", (object)empStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());



        //    var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EmployeeMaster>("SAL_Employee_SelForGrid", dynamicParameters, "Employee_GetAll");

        //    if (tuple == null || tuple.Item2 == null)
        //        return (0, new List<EmployeeMaster>());

        //    // Extract totalCount safely
        //    int totalCount = 0;
        //    if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
        //    {
        //        var firstItem = totalList.First() as IDictionary<string, object>;
        //        if (firstItem != null && firstItem.Values.Any())
        //        {
        //            totalCount = Convert.ToInt32(firstItem.Values.First());
        //        }
        //    }

        //    return (totalCount, tuple.Item2?.ToList() ?? new List<EmployeeMaster>());
        //}



        public async Task<(int totalCount, IEnumerable<EmployeeMaster>, object counts)> GetAllEmployeesAsync(
  int pageIndex, int pageSize, string empCode, string empCodeManual,
  string empName, List<string> selectedDepartments, string selectedDesignation,
  List<string> selectedLocations, string selectedNature, string selectedCity,
  string sortBy, string userId, string empStatus, string fk_costcentreid, string? searchTerm, string statFilter)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Combine both into one XML structure
            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
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
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@statFilter", (object)statFilter, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, EmployeeMaster>("SAL_Employee_SelForGrid", dynamicParameters, "Employee_GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<EmployeeMaster>(), null);

            // Extract totalCount safely
            int totalCount = 0;
            object counts = null;
            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                var firstItem = totalList.First() as IDictionary<string, object>;
                if (firstItem != null && firstItem.Values.Any())
                {
                    totalCount = Convert.ToInt32(firstItem.Values.First());
                    if (firstItem.ContainsKey("BankFilled"))
                    {
                        counts = new
                        {
                            TotalCount = Convert.ToInt32(firstItem["TotalCount"]),
                            BankNotFilled = Convert.ToInt32(firstItem["BankNotFilled"]),
                            BankFilled = Convert.ToInt32(firstItem["BankFilled"]),
                            PANNotFilled = Convert.ToInt32(firstItem["PANNotFilled"]),
                            PANFilled = Convert.ToInt32(firstItem["PANFilled"]),
                            AadharNotFilled = Convert.ToInt32(firstItem["AadharNotFilled"]),
                            AadharFilled = Convert.ToInt32(firstItem["AadharFilled"]),
                            MobNotFilled = Convert.ToInt32(firstItem["MobNotFilled"]),
                            MobFilled = Convert.ToInt32(firstItem["MobFilled"]),
                            UANNotFilled = Convert.ToInt32(firstItem["UANNotFilled"]),
                            UANFilled = Convert.ToInt32(firstItem["UANFilled"]),
                            ESINotFilled = Convert.ToInt32(firstItem["ESINotFilled"]),
                            ESIFilled = Convert.ToInt32(firstItem["ESIFilled"])
                        };
                    }
                }
            }

            return (totalCount, tuple.Item2?.ToList() ?? new List<EmployeeMaster>(), counts);
        }



        public async Task<(EmployeeMst, EmployeeOtherDetails)> GetEmployeeByIdAsync(string pk_empid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empid", (object)pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<EmployeeMst, EmployeeOtherDetails>(
                "SAL_EmployeeMst_Edit",
                dynamicParameters,
                "LeaveType_GetById"
            );

            var employeeMst = tuple?.Item1?.FirstOrDefault();
            var employeeOtherDetails = tuple?.Item2?.FirstOrDefault();

            return (employeeMst, employeeOtherDetails);
        }

        public async Task<bool> UpdateEmployeeAsync(EmployeeMstDataSet employeeList, EmployeeMst employee, EmployeeOtherDetails employeeOther, string Fk_UserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            EmployeeMstDataSet dataset = new EmployeeMstDataSet
            {
                Employee = employee,
                EmployeeOther = employeeOther

            };
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@pk_empid", employee.pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            //Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_EmployeeMst_Upd", dynamicParameters, "SAL_EmployeeMst_Upd");

            return result > 0;
        }

        //----------EmployeeAttendance------------

        //public async Task<EmployeeAttendanceMst> GetEmployeeAttendanceByIdAsync(string pk_empid)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pk_empid", (object)pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    return DataBaseFactory.QuerySP<EmployeeAttendanceMst>("SAL_EmployeeAttendance_Edit", (object)dynamicParameters, "EmployeeAttendanceMst - GetById").FirstOrDefault<EmployeeAttendanceMst>();
        //}

        public async Task<(EmployeeAttendanceMst, List<EmployeeShiftIns>, List<AttendanceLocation>)> GetEmployeeAttendanceByIdAsync(string fk_empid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empid", fk_empid, DbType.String, ParameterDirection.Input);

            // Use the stored procedure name and parameters
            var tuple = DataBaseFactory.QueryMultipleSP<EmployeeAttendanceMst, EmployeeShiftIns, AttendanceLocation>(
                "SAL_EmployeeAttendance_Edit",
                dynamicParameters,
                "SAL_EmployeeAttendance_Edit"
            );

            // Extract the 3 result sets
            //GetbyidModelTempMassage TempMessage = null;
            //GetbyidModelMassage SalaryMessage= null;
            EmployeeAttendanceMst EmpShift = new();
            List<EmployeeShiftIns> ShiftDateWise = new();
            List<AttendanceLocation> attendanceLocations = new();


            if (tuple != null)
            {
                EmpShift = tuple.Item1?.FirstOrDefault();
                ShiftDateWise = tuple.Item2?.ToList();
                attendanceLocations = tuple.Item3?.ToList();

            }

            return (EmpShift, ShiftDateWise, attendanceLocations);
        }


        public async Task<bool> UpdateEmployeeAttendanceAsync(EmployeeAttendanceMst employeeAttendanceMst, string Fk_UserID, string Fk_LocID, string fk_companyId)
        {
            // Serialize attendancelocation list to XML
            var locationWrapper = new EmployeeAttendanceDataSet
            {
                AttendanceLocations = employeeAttendanceMst.attendancelocation.Select(loc => new AttendanceLocation
                {
                    fk_empid = employeeAttendanceMst.pk_empid,
                    attendancelocation = loc
                }).ToList()
            };

            string locationXml = XmlUtility.XmlSerializeToString(locationWrapper);

            // Prepare parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empid", employeeAttendanceMst.pk_empid, DbType.String);
            dynamicParameters.Add("@AttendanceXML", locationXml, DbType.String);
            dynamicParameters.Add("@Intime", employeeAttendanceMst.Intime, DbType.String);
            dynamicParameters.Add("@Outtime", employeeAttendanceMst.Outtime, DbType.String);
            dynamicParameters.Add("@Gracetime", employeeAttendanceMst.Gracetime, DbType.String);
            dynamicParameters.Add("@geofence", employeeAttendanceMst.geofence, DbType.String);
            dynamicParameters.Add("@attendanceSource", employeeAttendanceMst.attendanceSource, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);
            dynamicParameters.Add("@fk_shiftId", employeeAttendanceMst.fk_shiftId, DbType.String);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);
            dynamicParameters.Add("@OTApp", employeeAttendanceMst.OTApp, DbType.String);

            // Call SP
            int result = DataBaseFactory.QuerySP("SAL_EmployeeAttendance_Upd", dynamicParameters, "SAL_EmployeeAttendance_Upd");
            return result > 0;
        }
        //  -----EmployeeotherDetails----

        public async Task<EmployeeOtherDetailsMst> GetEmployeeOtherDetailsAsync(string pk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empid", (object)pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<EmployeeOtherDetailsMst>("SAL_EmployeeOtherDetails_Edit", (object)dynamicParameters, "EmployeeOtherDetailsMst - GetById").FirstOrDefault<EmployeeOtherDetailsMst>();
        }

        public async Task<bool> UpdateEmployeeOtherDetailsAsync(EmployeeOtherDetailsMst employeeOtherDetailsMst, string Fk_UserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empid", employeeOtherDetailsMst.pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pf_app", employeeOtherDetailsMst.pf_app, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@esi_app", employeeOtherDetailsMst.esi_app, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pffixedamount", employeeOtherDetailsMst.pffixedamount, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@inESICycle", employeeOtherDetailsMst.inESICycle, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@proftax_app", employeeOtherDetailsMst.proftax_app, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@volpf_app", employeeOtherDetailsMst.volpf_app, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@volpfTypeAmt", employeeOtherDetailsMst.volpfTypeAmt, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@isreverse", employeeOtherDetailsMst.isreverse, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pfmaxlimit_app", employeeOtherDetailsMst.pfmaxlimit_app, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@volpfType", employeeOtherDetailsMst.volpfType, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@esiZone", employeeOtherDetailsMst.esiZone, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@esino", employeeOtherDetailsMst.esino, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pfno", employeeOtherDetailsMst.pfno, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@uanNo", employeeOtherDetailsMst.uanNo, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@policy_app", employeeOtherDetailsMst.policy_app, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@policyNo", employeeOtherDetailsMst.policyNo, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@policyDate", employeeOtherDetailsMst.policyDate, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@policy_amount", employeeOtherDetailsMst.policy_amount, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@policyTillValid", employeeOtherDetailsMst.policyTillValid, new DbType?(DbType.DateTime), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@policyImagePath", employeeOtherDetailsMst.policyImagePath, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@NomineeName", employeeOtherDetailsMst.NomineeName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@NomineeRelation", employeeOtherDetailsMst.NomineeRelation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@NomineeMobileNo", employeeOtherDetailsMst.NomineeMobileNo, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@LWFApp", employeeOtherDetailsMst.lwfapplicable, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int result = DataBaseFactory.QuerySP("SAL_EmployeeOtherDetails_Update", dynamicParameters, "SAL_EmployeeOtherDetails_Update");
            return result > 0;
        }

        //------------------EmployeeHead------------

        public async Task<(List<SalHeadAmountResponse>, List<SalHeadAmountResponse>)> GetSalHeadAmountAsync(SalHeadAmountRequest request, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters
            dynamicParameters.Add("@basedon", request.BasedOn, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@amount", request.Amount, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@locid", request.LocId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_gradeid", request.FkGradeId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pf_app", request.PfApp, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@esi_app", request.EsiApp, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@effectivedate", request.EffectiveDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empId", (object)request.fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<SalHeadAmountResponse, SalHeadAmountResponse>(
                "SAL_Head_Amount_SelForGrid",  // Stored Procedure Name
                dynamicParameters,
                "SAL_Head_Amount_SelForGrid"    // Connection Name
            );

            List<SalHeadAmountResponse> salHeadAmountResponseList1 = new List<SalHeadAmountResponse>();
            List<SalHeadAmountResponse> salHeadAmountResponseList2 = new List<SalHeadAmountResponse>();

            if (tuple != null && tuple.Item1 != null)
            {
                salHeadAmountResponseList1 = tuple.Item1.ToList(); // Get all rows from first set
            }
            if (tuple != null && tuple.Item2 != null)
            {
                salHeadAmountResponseList2 = tuple.Item2.ToList(); // Get all rows from second set
            }


            return (salHeadAmountResponseList1, salHeadAmountResponseList2);
        }

        //public async Task<EmployeeHeadMstDataSet> GetEmployeeHeadDetailsAsync(string pk_empid)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pk_empid", (object)pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


        //    return DataBaseFactory.QuerySP<EmployeeHeadMstDataSet>("SAL_EmployeeheadDetails_Edit", (object)dynamicParameters, "EmployeeHeadDetailsEdit - GetById").FirstOrDefault<EmployeeHeadMstDataSet>();

        //}
        public async Task<(EmployeeHeadMst, List<EmployeeHeadDetails>, List<EmployeeHeadDetails>)> GetEmployeeHeadDetailsAsync(string pk_empid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empid", (object)pk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<EmployeeHeadMst, EmployeeHeadDetails, EmployeeHeadDetails>(
                "SAL_EmployeeheadDetails_Edit",
                dynamicParameters,
                "LeaveType_GetById"
            );

            // var employeeMst = tuple?.Item1?.FirstOrDefault();
            var employeeHeadMst = tuple?.Item1?.FirstOrDefault();
            List<EmployeeHeadDetails> employeeHeadDetails1 = new List<EmployeeHeadDetails>();
            List<EmployeeHeadDetails> employeeHeadDetails2 = new List<EmployeeHeadDetails>();

            if (tuple != null && tuple.Item2 != null)
            {
                employeeHeadDetails1 = tuple.Item2.ToList(); // Get all rows from first set
            }
            if (tuple != null && tuple.Item3 != null)
            {
                employeeHeadDetails2 = tuple.Item3.ToList(); // Get all rows from second set
            }

            return (employeeHeadMst, employeeHeadDetails1, employeeHeadDetails2);
        }

        public async Task<bool> UpdateEmployeeHeadDetailsAsync(
    EmployeeHeadMstDataSet employeeHeadMstDataSet,
    List<EmployeeHeadDetails> employeeHeadDetails, EmployeeHeadMst employeeHeadMst,
    string Fk_UserID,
    string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            EmployeeHeadMstDataSet dataset = new EmployeeHeadMstDataSet
            {
                Employeehead = new List<EmployeeHeadDetails>(employeeHeadDetails)
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            dynamicParameters.Add("@pk_empid", employeeHeadMst.pk_empid, DbType.String);
            dynamicParameters.Add("@XmlData", xmlData, DbType.String);
            dynamicParameters.Add("@ctc", employeeHeadMst.ctc, DbType.Decimal);
            dynamicParameters.Add("@VariableCTCAmount", employeeHeadMst.VariableCTCAmount, DbType.Decimal);
            dynamicParameters.Add("@basedon", employeeHeadMst.basedon, DbType.String);
            dynamicParameters.Add("@fk_locid", employeeHeadMst.LocId, DbType.String);
            dynamicParameters.Add("@fk_classid", employeeHeadMst.FkGradeId, DbType.String);
            dynamicParameters.Add("@JoiningBonus", employeeHeadMst.JoiningBonus, DbType.Decimal);
            dynamicParameters.Add("@RetentionBonus", employeeHeadMst.RetentionBonus, DbType.Decimal);
            dynamicParameters.Add("@ESOPS", employeeHeadMst.ESOPS, DbType.Decimal);
            dynamicParameters.Add("@RetentionFrequency", employeeHeadMst.RetentionFrequency, DbType.String);
            dynamicParameters.Add("@amount", employeeHeadMst.amount, DbType.Decimal);
            dynamicParameters.Add("@FixedIncomeTax", employeeHeadMst.FixedIncomeTax, DbType.Decimal);

            dynamicParameters.Add("@glposting", employeeHeadMst.glposting, DbType.String);
            // Assuming you want to use the first element's effect date; handle empty list scenario.
            dynamicParameters.Add("@effectdate", employeeHeadDetails.Any() ? employeeHeadDetails[0].effectdate : (object)DBNull.Value, DbType.DateTime);

            dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            int result = DataBaseFactory.QuerySP("SAL_EmployeeheadDetails_Upd", dynamicParameters, "SAL_EmployeeheadDetails_Upd");

            return result > 0;
        }



        //---------------Sub Department Details------------------


        public async Task<Result<List<NameValue>>> GetSubDeptDropdownList(string fk_deptid, string userId, string companyId)
        {
            var result = new Result<List<NameValue>>();
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_deptid", fk_deptid, DbType.String);

                // If your QuerySP is not async, remove async/await
                var data = DataBaseFactory.QuerySP<NameValue>("Sal_SubDepartment_Selforddl", dynamicParameters, "Sal_SubDepartment_Selforddl");

                result.IsSuccessfull = data != null && data.Any();
                result.Message = result.IsSuccessfull ? "Data retrieved" : "No record found";
                result.Data = data.ToList();
            }
            catch (Exception ex)
            {
                result.IsSuccessfull = false;
                result.Message = $"Error: {ex.Message}";
                result.Data = new List<NameValue>();
            }

            return result;
        }




        //-------------------- Employee Shhift Date Details Insert-------------------------

        public async Task<bool> InsertEmpShift(List<EmployeeShiftIns> employeeShiftIns)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            EmployeeMstDataSet dataset = new EmployeeMstDataSet { employeeShiftIns = employeeShiftIns };
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            dynamicParameters.Add("@ShiftDataXML", xmlData, DbType.String);
            int result = DataBaseFactory.QuerySP("SAL_Employee_Shift_Ins", dynamicParameters, "SAL_Employee_Shift_Ins");
            return result > 0;
        }

        public async Task<bool> UpdateEmpShift(List<EmployeeShiftIns> employeeShiftIns)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            EmployeeMstDataSet dataset = new EmployeeMstDataSet { employeeShiftIns = employeeShiftIns };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            dynamicParameters.Add("@fk_empid", employeeShiftIns[0].fk_empid, DbType.String);
            dynamicParameters.Add("@ShiftDataXML", xmlData, DbType.String);
            int result = DataBaseFactory.QuerySP("SAL_Employee_Shift_Upd", dynamicParameters, "SAL_Employee_Shift_Upd");
            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<EmployeeAuditLogDTO>)> GetTabAuditLogsAsync(string documentId, string documentName, int pageIndex, int pageSize, string? entryBy = null, string? fieldName = null)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@DocumentId", documentId, DbType.String);
            dynamicParameters.Add("@DocumentName", documentName, DbType.String);
            dynamicParameters.Add("@PageIndex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@PageSize", pageSize, DbType.Int32);
            dynamicParameters.Add("@EntryBy", entryBy, DbType.String);
            dynamicParameters.Add("@FieldName", fieldName, DbType.String);

            var list = DataBaseFactory.QuerySP<EmployeeAuditLogDTO>("SAL_Employee_AuditLog_GetByTab", dynamicParameters).ToList();
            int totalCount = list.FirstOrDefault()?.TotalCount ?? 0;
            return (totalCount, list);
        }

    }
}