using Dapper;
using HRMSWebAPI.Helper;
using System.Data;
using HRMSWebAPI.Models;
using static Dapper.SqlMapper;
using static HRMSWebAPI.Models.ImportExcle;
using System.Globalization;
using iTextSharp.text.pdf.parser.clipper;
namespace HRMSWebAPI.Repository
{
    public class ImportExcleRepository : IImportExcleRepository
    {

        CommonFunction commonFunction = new CommonFunction();

        public async Task<IEnumerable<dynamic>> LeaveTakenuploadexcel(Excel_leavetakenUploadRequest request, string fk_userId, string fk_locid, string fk_companyid)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }


            p.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_companyid", (object)fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<dynamic>("SAL_LeavesTaken_Import", p, "SAL_LeavesTaken_Import");
            return result;
        }



        public async Task<IEnumerable<ExcelUploadModelResponse>> BulkInsertGeneric(ExcelUploadRequest request, string fk_userId, string fk_locid, string fk_companyid)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }


            p.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_companyid", (object)fk_companyid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<ExcelUploadModelResponse>("SAL_Employee_Import", p, "SAL_Employee_Import");
            return result;
        }



        //Attendance Export/Emport

        public async Task<(int MarkedCount, int NotMarkedCount, exportAttendanceModel result)>
   GetAttendanceAsync(
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
   string FkYearId,
   string fk_classid,
      string fk_costcentreid)

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
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, exportAttendance, dynamic, exportAttendance>(
                "SAL_EmpAttendance_ForExportImport_SelForGrid", dynamicParameters, "GetAll");

            var result = new exportAttendanceModel();

            int MarkedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int LockedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;




            result.MarkedCount = MarkedCount;
            result.NotMarkedCount = LockedCount;


            result.Attendancemarked = tuple.Item2?.ToList();
            result.AttendanceNotmarked = tuple.Item4?.ToList();



            return (MarkedCount, LockedCount, result);
        }

        //for day wise
        public async Task<(int MarkedCount, int NotMarkedCount, exportAttendanceModeldaywise result)>
 GetdaywiseAttendanceAsync(
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
 string FkYearId,
 string fk_classid,
 string fk_costcentreid)

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
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, exportAttendanceDaywise>(
                "SAL_EmpDayWiseAttendance_ForExportImport_SelForGrid", dynamicParameters, "GetAll");

            var result = new exportAttendanceModeldaywise();

            int MarkedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int LockedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;




            result.MarkedCount = MarkedCount;
            result.NotMarkedCount = LockedCount;


            //result.Attendancemarked = tuple.Item2?.ToList();
            result.Attendancemarked = tuple.Item2 is IEnumerable<dynamic> markedRows
? markedRows.ToList()
: new List<dynamic>();
            //result.AttendanceNotmarked = tuple.Item4?.ToList();


            result.AttendanceNotmarked = tuple.Item4?.ToList();



            return (MarkedCount, LockedCount, result);
        }
        // for  day wise attendance

        //for day wise
        public async Task<(int MarkedCount, int NotMarkedCount, exportAttendanceModeldaywise result)>
 GetdaywiseAttendanceAsync(
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
 string FkYearId,
 string fk_classid)

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
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, exportAttendanceDaywise>(
                "SAL_EmpDayWiseAttendance_ForExportImport_SelForGrid", dynamicParameters, "GetAll");

            var result = new exportAttendanceModeldaywise();

            int MarkedCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;


            int LockedCount = tuple.Item3 is IEnumerable<dynamic> list5 && list5.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)list5.First()).Values.First())
               : 0;




            result.MarkedCount = MarkedCount;
            result.NotMarkedCount = LockedCount;


            //result.Attendancemarked = tuple.Item2?.ToList();
               result.Attendancemarked = tuple.Item2 is IEnumerable<dynamic> markedRows
? markedRows.ToList()
: new List<dynamic>();
       //result.AttendanceNotmarked = tuple.Item4?.ToList();


            result.AttendanceNotmarked = tuple.Item4?.ToList();



            return (MarkedCount, LockedCount, result);
        }
        // for  day wise attendance

        public async Task<IEnumerable<dynamic>> GetAttendancedaywiseForExportAsync(
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
string fk_classid, string fk_costcentreid,
int templateType = 1)

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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int finalTemplateType = templateType <= 0 ? 1 : templateType;
            dynamicParameters.Add("@TemplateType", (object)finalTemplateType, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
     "SAL_EmpdaywiseAttendance_ForExport", dynamicParameters, "GetAll");

            return result;
        }




        // end
        // day wise import


        public async Task<IEnumerable<dynamic>> SAL_EmpdaywiseAttendance_ForImport(AttendanceDaywiseImportRequest request, string fk_userId, string fk_locid, string FkMonthId,
string FkYearId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            //int result = DataBaseFactory.QuerySP("SAL_EmpdaywiseAttendance_Import", p, "SAL_EmpdaywiseAttendance_Import");
            //return result > 0;
            var result = DataBaseFactory.QuerySP<dynamic>("SAL_EmpdaywiseAttendance_Import", p,
    "GetAll");

            return result;
        }





        //end


        public async Task<IEnumerable<dynamic>> GetAttendanceForExportAsync(
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
string fk_classid, string fk_costcentreid)

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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
     "SAL_EmpAttendance_ForExport", dynamicParameters, "GetAll");

            return result;
        }





        public async Task<bool> Importattendance(AttendanceImportRequest request, string fk_userId, string fk_locid, string FkMonthId,
  string FkYearId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_monthId", (object)FkMonthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_yearId", (object)FkYearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_EmpAttendance_Head_Import", p, "SAL_EmpAttendance_Head_Import");
            return result > 0;
        }








        //=====

        public async Task<(int totalCount, IEnumerable<dynamic>)> ExportImportSalaryHeadAsync(
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
string fk_classid,
string fk_costcentreid)
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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_EmpHeadExportImport_SelForGrid", dynamicParameters, "Department_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<(int totalCount, IEnumerable<dynamic>)> ExportImportLeaveList(
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
string fk_classid,
 string fk_costcentreid,
 string empStatus

 )
        {

            if (string.IsNullOrEmpty(empStatus))
                empStatus = "N";

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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empStatus", (object)empStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_EmpHeadExportImport_SelForGrid", dynamicParameters, "Department_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }










        public async Task<IEnumerable<dynamic>> SalaryHeadExportAsync(
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string fk_classid,
string fk_companyId,
string headtype,
string fk_costcentreid

)


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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@headtype", (object)headtype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
     "SAL_Head_Export", dynamicParameters, "GetAll");

            return result;
        }




        //public async Task<bool> ImportSalaryHead(List<Dictionary<string, string>> employees, string fk_userId, string fk_locid,string EffectiveDate)
        //{
        //    var p = new DynamicParameters();
        //    string xmlData = ExcelHelper.XmlSerializeToString(employees);
        //    if (xmlData.StartsWith("<?xml"))
        //    {
        //        int index = xmlData.IndexOf("?>");
        //        if (index != -1)
        //        {
        //            xmlData = xmlData.Substring(index + 2).Trim();
        //        }
        //    }

        //    p.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    p.Add("@EffectiveDate", (object)EffectiveDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    p.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    p.Add("@fk_userId", (object)fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    int result = DataBaseFactory.QuerySP("SAL_Head_Import_Upd", p, "SAL_Head_Import_Upd");
        //    return result > 0;
        //}

    

        public async Task<bool> ImportSalaryHead(string xmlData, string fk_userId, string fk_locid, string EffectiveDate)
        {
            var p = new DynamicParameters();

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", xmlData, DbType.String);
            p.Add("@EffectiveDate", EffectiveDate, DbType.String);
            p.Add("@fk_locid", fk_locid, DbType.String);
            p.Add("@fk_userId", fk_userId, DbType.String);

            int result = DataBaseFactory.QuerySP("SAL_Head_Import_Upd", p, "SAL_Head_Import_Upd");
            return result != 0 || result == -1;
        }

        // added new 
        public async Task<(dynamic Summary, IEnumerable<dynamic> Details)> CompareSalaryHeadImportAsync(string xmlData, string fk_userId, string fk_locid, string EffectiveDate)
        {
            var p = new DynamicParameters();

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", xmlData, DbType.String);
            p.Add("@EffectiveDate", EffectiveDate, DbType.String);
            p.Add("@fk_locid", fk_locid, DbType.String);
            p.Add("@fk_userId", fk_userId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("USP_Salary_Head_Import_Compare", p);
            var summary = tuple?.Item1?.FirstOrDefault();
            var details = tuple?.Item2?.ToList() ?? new List<dynamic>();

            return (summary, details);
        }


        public async Task<List<string>> ValidateEmpCodesAsync(List<string> empCodes, string companyId, string userId)
        {
            if (empCodes == null || !empCodes.Any())
                return new List<string>();

            using var conn = DataBaseFactory.ConnString();

            // If companyId is empty, fetch it from UM_Users_Mst
            if (string.IsNullOrWhiteSpace(companyId) && !string.IsNullOrWhiteSpace(userId))
            {
                companyId = await conn.ExecuteScalarAsync<string>(
                    "SELECT ISNULL(fk_companyId, '') FROM UM_Users_Mst WHERE pk_userId = @userId",
                    new { userId }
                ) ?? "";
            }

            var validCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var distinctEmpCodes = empCodes.Where(c => !string.IsNullOrWhiteSpace(c)).Select(c => c.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList();

            // Process in batches of 1000 to prevent SQL parameter limit errors
            var batches = distinctEmpCodes.Chunk(1000);
            foreach (var batch in batches)
            {
                string query;
                object param;
                if (!string.IsNullOrWhiteSpace(companyId))
                {
                    query = "SELECT DISTINCT empcode FROM SAL_Employee_Mst WHERE empcode IN @batch AND fk_companyId = @companyId";
                    param = new { batch, companyId };
                }
                else
                {
                    query = "SELECT DISTINCT empcode FROM SAL_Employee_Mst WHERE empcode IN @batch";
                    param = new { batch };
                }

                var found = await conn.QueryAsync<string>(query, param);
                foreach (var code in found)
                {
                    if (!string.IsNullOrWhiteSpace(code))
                    {
                        validCodes.Add(code.Trim());
                    }
                }
            }

            var invalidCodes = distinctEmpCodes
                .Where(code => !validCodes.Contains(code))
                .ToList();

            return invalidCodes;
        }





        public async Task<(int totalCount, IEnumerable<dynamic>)> ExportImportEmployeeOtherDetailAsync(
int pageIndex, int pageSize, string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string fk_classid,
string fk_costcentreid,
string empStatus, string company_id
)
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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empStatus", (object)empStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@company_id", (object)company_id, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_EmpOtherDetailExport_SelForGrid", dynamicParameters, "SAL_EmpOtherDetailExport_SelForGrid");

            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }
        public async Task<List<dynamic>> ImportEmployeeOtherDetailAsync(EmployeeImportRequest request, string fk_locid, string fk_userid)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            p.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<dynamic>("SAL_Employee_OtherDetails_Import_Upd", p, "SAL_Employee_OtherDetails_Import_Upd");
            return result != null ? result.ToList() : new List<dynamic>();
        }


        // Export Import Other Head

        public async Task<(int totalCount, IEnumerable<dynamic>)> ExportImportSalaryOtherHeadAsync(
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
string fk_classid,
  string fk_costcentreid)
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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_EmpHeadExportImport_Other_SelForGrid", dynamicParameters, "Department_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any() ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }







        public async Task<IEnumerable<dynamic>> SalaryOtherHeadExportAsync(
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string fk_classid,
string fk_companyId,
string headtype,
string fk_costcentreid,

List<string>? heads,
string EffectiveDate

)
        {

            string headsCsv = (heads != null && heads.Any())
    ? string.Join(",", heads)
    : string.Empty;
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@empcode", (object)empCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empname", (object)empName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_nature", (object)selectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_cityid", (object)selectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@headtype", (object)headtype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@heads", (object)headsCsv, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@EffectiveDate", (object)EffectiveDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<dynamic>("SAL_Other_Head_Export", dynamicParameters, "GetAll");

            return result;
        }




     
        public async Task<bool> ImportSalaryOtherHead(string xmlData, string fk_userId, string fk_locid, string EffectiveDate)
        {
            var p = new DynamicParameters();

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", xmlData, DbType.String);
            p.Add("@EffectiveDate", EffectiveDate, DbType.String);
            p.Add("@fk_locid", fk_locid, DbType.String);
            p.Add("@fk_userId", fk_userId, DbType.String);

            int result = DataBaseFactory.QuerySP("SAL_Other_Head_Import_Upd", p, "SAL_Other_Head_Import_Upd");
            return result != 0 || result == -1;
        }







        public async Task<(dynamic Summary, IEnumerable<dynamic> Details)> CompareSalaryOtherHeadImportAsync(string xmlData, string fk_userId, string fk_locid, string EffectiveDate)
        {
            var p = new DynamicParameters();

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", xmlData, DbType.String);
            p.Add("@EffectiveDate", EffectiveDate, DbType.String);
            p.Add("@fk_locid", fk_locid, DbType.String);
            p.Add("@fk_userId", fk_userId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("USP_Salary_OtherHead_Import_Compare", p);
            var summary = tuple?.Item1?.FirstOrDefault();
            var details = tuple?.Item2?.ToList() ?? new List<dynamic>();

            return (summary, details);
        }


        public async Task<IEnumerable<dynamic>> ExporImportLeavetAsync(
       string empCode,
       string empCodeManual,
       string empName,
       List<string> selectedDepartments,
       string selectedDesignation,
       List<string> selectedLocations,
       string selectedNature,
       string selectedCity,
       string sortBy,
       string fk_classid,
       long fk_leaveid,
       string fk_costcentreid,
        string empStatus
   )
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            // Only add parameters that exist in the stored procedure
            dynamicParameters.Add("@empcode", empCode, DbType.String);
            dynamicParameters.Add("@empcodemanual", empCodeManual, DbType.String);
            dynamicParameters.Add("@empname", empName, DbType.String);
            dynamicParameters.Add("@xmlDoc", combinedXml, DbType.String);
            dynamicParameters.Add("@fk_designationid", selectedDesignation, DbType.String);
            dynamicParameters.Add("@fk_nature", selectedNature, DbType.String);
            dynamicParameters.Add("@fk_cityid", selectedCity, DbType.String);
            dynamicParameters.Add("@fk_classid", fk_classid, DbType.String);
            dynamicParameters.Add("@sortby", sortBy, DbType.String);
            dynamicParameters.Add("@fk_leaveid", fk_leaveid, DbType.Int64); // Note: SP expects bigint
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empStatus", (object)empStatus, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var result = await DataBaseFactory.QuerySPAsync<dynamic>("SAL_Leave_Export", dynamicParameters, "GetAll");
            return result;
        }

        public async Task<bool> ImportIncentiveHead(string xmlData, string fk_userId, string fk_locid, string EffectiveDate)
        {
            var p = new DynamicParameters();

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", xmlData, DbType.String);
            p.Add("@EffectiveDate", EffectiveDate, DbType.String);
            p.Add("@fk_locid", fk_locid, DbType.String);
            p.Add("@fk_userId", fk_userId, DbType.String);

            int result = DataBaseFactory.QuerySP("SAL_IncentiveHead_Import_Upd", p, "ImportIncentiveHead");
            return result > 0;
        }



        public async Task<(int totalCount, IEnumerable<dynamic>)> ExportImportIncentive(
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
string fk_classid,
string fk_costcentreid)
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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("SAL_IncentiveExportImport_SelForGrid", dynamicParameters, "SAL_IncentiveExportImport_SelForGrid");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<IEnumerable<dynamic>> exportincentive(
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string fk_classid,
string fk_companyId,
string headtype,
string fk_costcentreid

)


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
            dynamicParameters.Add("@sortBy", (object)sortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@headtype", (object)headtype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_classid", (object)fk_classid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_costcentreid", (object)fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            var result = await DataBaseFactory.QuerySPAsync<dynamic>(
     "SAL_Incentive_Export", dynamicParameters, "GetAll");

            return result;
        }
        public async Task<List<dynamic>> ExportImportLeave(ExpImpLeaverequest request, string fk_locid, string fk_userid, string EffectiveDate)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);

            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                {
                    xmlData = xmlData.Substring(index + 2).Trim();
                }
            }

            p.Add("@xmlDoc", xmlData, DbType.String);
            p.Add("@fk_locid", fk_locid, DbType.String);
            p.Add("@fk_userid", fk_userid, DbType.String);
            p.Add("@EffectiveDate", EffectiveDate, DbType.String);




            using (var connection = DataBaseFactory.ConnString())
            {
                var result = await connection.QueryAsync("SAL_Leave_Import_Upd", p, commandType: CommandType.StoredProcedure);
                return result.ToList();
            }
        }





        public async Task<(int TotalCount, IEnumerable<dynamic> Data)> GetCDOListAsync(ImportExcle.CdoReportRequestModel req)
        {
            var combinedXml = commonFunction.GetRecords(req.SelectedLocations, req.SelectedDepartments);

            var dp = new DynamicParameters();

            dp.Add("@pageindex1", (object)req.PageIndex1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@pagesize1", (object)req.PageSize1, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dp.Add("@empcode", (object)req.EmpCode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@empcodemanual", (object)req.EmpCodeManual, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@empname", (object)req.EmpName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@xmlDoc", (object)combinedXml, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@fk_designationid", (object)req.SelectedDesignation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@fk_nature", (object)req.SelectedNature, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@fk_cityid", (object)req.SelectedCity, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@sortBy", (object)req.SortBy, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@fk_monthid", (object)req.fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@fk_yearid", (object)req.fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dp.Add("@fk_costcentreid", (object)req.fk_costcentreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>(
                "SAL_CDOReport_SelForGrid", dp, "GetAll");

            int totalCount = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;

            IEnumerable<dynamic> data = tuple.Item2 ?? Enumerable.Empty<dynamic>();

            return (totalCount, data);
        }


        public async Task<dynamic> ImportCDOAsync(
              CDOImportRequest request,
              int fk_monthId,
              int fk_yearId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml"))
            {
                int index = xmlData.IndexOf("?>");
                if (index != -1)
                    xmlData = xmlData.Substring(index + 2).Trim();
            }

            p.Add("@xmlDoc", xmlData, DbType.String);
            p.Add("@fk_monthId", fk_monthId.ToString(), DbType.String);
            p.Add("@fk_yearId", fk_yearId.ToString(), DbType.String);

            using var multi = await DataBaseFactory.ConnString().QueryMultipleAsync(
                "SAL_CDO_Manual_Import", p,
                commandType: CommandType.StoredProcedure);

            //  First result set — detail rows (Inserted / Updated / Invalid)
            var detailRows = (await multi.ReadAsync<CDOImportResultDetail>()).ToList();

            //  Second result set — summary
            var summary = await multi.ReadFirstOrDefaultAsync<dynamic>();

            return new
            {
                Status = (string)summary.Status,
                Message = (string)summary.Message,
                RowsUpdated = (int)summary.RowsUpdated,
                RowsInserted = (int)summary.RowsInserted,
                InvalidCount = (int)summary.InvalidCount,
                RowsAffected = (int)summary.RowsAffected,
                Details = detailRows   // ← Inserted + Updated + Invalid rows
            };
        }



        // --- Master Data Import Implementations -------------------------------
        public async Task<List<dynamic>> ImportCityMaster(CityImportRequest request, string fk_userId, string fk_locid, string fk_companyId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml")) { int idx = xmlData.IndexOf("?>"); if (idx != -1) xmlData = xmlData.Substring(idx + 2).Trim(); }
            p.Add("@xmlDoc", xmlData, System.Data.DbType.String);
            p.Add("@fk_companyId", fk_companyId, System.Data.DbType.String);
            p.Add("@fk_locid", fk_locid, System.Data.DbType.String);
            p.Add("@fk_userId", fk_userId, System.Data.DbType.String);
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryAsync("SAL_CityMaster_Import", p, commandType: System.Data.CommandType.StoredProcedure);
            return result.ToList();
        }

        public async Task<List<dynamic>> ImportDesignationMaster(DesignationImportRequest request, string fk_userId, string fk_locid, string fk_companyId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml")) { int idx = xmlData.IndexOf("?>"); if (idx != -1) xmlData = xmlData.Substring(idx + 2).Trim(); }
            p.Add("@xmlDoc", xmlData, System.Data.DbType.String);
            p.Add("@fk_companyId", fk_companyId, System.Data.DbType.String);
            p.Add("@fk_locid", fk_locid, System.Data.DbType.String);
            p.Add("@fk_userId", fk_userId, System.Data.DbType.String);
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryAsync("SAL_DesignationMaster_Import", p, commandType: System.Data.CommandType.StoredProcedure);
            return result.ToList();
        }

        public async Task<List<dynamic>> ImportDepartmentMaster(DepartmentImportRequest request, string fk_userId, string fk_locid, string fk_companyId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml")) { int idx = xmlData.IndexOf("?>"); if (idx != -1) xmlData = xmlData.Substring(idx + 2).Trim(); }
            p.Add("@xmlDoc", xmlData, System.Data.DbType.String);
            p.Add("@fk_companyId", fk_companyId, System.Data.DbType.String);
            p.Add("@fk_locid", fk_locid, System.Data.DbType.String);
            p.Add("@fk_userId", fk_userId, System.Data.DbType.String);
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryAsync("SAL_DepartmentMaster_Import", p, commandType: System.Data.CommandType.StoredProcedure);
            return result.ToList();
        }

        public async Task<List<dynamic>> ImportLocationMaster(LocationImportRequest request, string fk_userId, string fk_locid, string fk_companyId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml")) { int idx = xmlData.IndexOf("?>"); if (idx != -1) xmlData = xmlData.Substring(idx + 2).Trim(); }
            p.Add("@xmlDoc", xmlData, System.Data.DbType.String);
            p.Add("@fk_companyId", fk_companyId, System.Data.DbType.String);
            p.Add("@fk_locid", fk_locid, System.Data.DbType.String);
            p.Add("@fk_userId", fk_userId, System.Data.DbType.String);
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryAsync("SAL_LocationMaster_Import", p, commandType: System.Data.CommandType.StoredProcedure);
            return result.ToList();
        }


        //Added 06 May Raj

        public async Task<List<dynamic>> ImportClientMaster(ClientImportRequest request, string fk_userId, string fk_locid, string fk_companyId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml")) { int idx = xmlData.IndexOf("?>"); if (idx != -1) xmlData = xmlData.Substring(idx + 2).Trim(); }
            p.Add("@xmlDoc", xmlData, System.Data.DbType.String);
            p.Add("@fk_companyId", fk_companyId, System.Data.DbType.String);
            p.Add("@fk_locid", fk_locid, System.Data.DbType.String);
            p.Add("@fk_userId", fk_userId, System.Data.DbType.String);
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryAsync("SAL_ClientMaster_Import", p, commandType: System.Data.CommandType.StoredProcedure);
            return result.ToList();
        }

        public async Task<List<dynamic>> ImportOutletMaster(OutletImportRequest request, string fk_userId, string fk_locid, string fk_companyId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml")) { int idx = xmlData.IndexOf("?>"); if (idx != -1) xmlData = xmlData.Substring(idx + 2).Trim(); }
            p.Add("@xmlDoc", xmlData, System.Data.DbType.String);
            p.Add("@fk_companyId", fk_companyId, System.Data.DbType.String);
            p.Add("@fk_locid", fk_locid, System.Data.DbType.String);
            p.Add("@fk_userId", fk_userId, System.Data.DbType.String);
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryAsync("SAL_DealerOutletMaster_Import", p, commandType: System.Data.CommandType.StoredProcedure);
            return result.ToList();
        }

        public async Task<List<dynamic>> ImportBranchMaster(BranchImportRequest request, string fk_userId, string fk_locid, string fk_companyId)
        {
            var p = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(request);
            if (xmlData.StartsWith("<?xml")) { int idx = xmlData.IndexOf("?>"); if (idx != -1) xmlData = xmlData.Substring(idx + 2).Trim(); }
            p.Add("@xmlDoc", xmlData, System.Data.DbType.String);
            p.Add("@fk_companyId", fk_companyId, System.Data.DbType.String);
            p.Add("@fk_locid", fk_locid, System.Data.DbType.String);
            p.Add("@fk_userId", fk_userId, System.Data.DbType.String);
            using var conn = DataBaseFactory.ConnString();
            var result = await conn.QueryAsync("SAL_Branch_Master_Import", p, commandType: System.Data.CommandType.StoredProcedure);
            return result.ToList();
        }










    }


}