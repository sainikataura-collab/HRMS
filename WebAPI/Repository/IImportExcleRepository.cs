using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static HRMSWebAPI.Models.ImportExcle;


namespace HRMSWebAPI.Repository
{
    public interface IImportExcleRepository
    {


        Task<(int totalCount, IEnumerable<dynamic>)> ExportImportLeaveList(
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
);



        Task<IEnumerable<dynamic>> LeaveTakenuploadexcel(Excel_leavetakenUploadRequest xmlData, string fk_companyid, string fk_locid, string fk_userId);
        Task<IEnumerable<ExcelUploadModelResponse>> BulkInsertGeneric(ExcelUploadRequest xmlData, string fk_companyid, string fk_locid, string fk_userId);
        Task<(int MarkedCount, int NotMarkedCount, exportAttendanceModel result)>
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
string fk_classid, string fk_costcentreid);

        //for day wise
        public Task<(int MarkedCount, int NotMarkedCount, exportAttendanceModeldaywise result)>
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
 string fk_classid, string fk_costcentreid);
        // for daywise
        Task<IEnumerable<dynamic>> GetAttendancedaywiseForExportAsync(
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
 string fk_costcentreid,
 int templateType = 1);
        // for day wise
        Task<IEnumerable<dynamic>> SAL_EmpdaywiseAttendance_ForImport(AttendanceDaywiseImportRequest request, string fk_userId, string fk_locid, string FkMonthId,
string FkYearId);

        Task<IEnumerable<dynamic>> GetAttendanceForExportAsync(
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
string fk_classid, string fk_costcentreid
);


        Task<bool> Importattendance(AttendanceImportRequest request, string fk_userId, string fk_locid, string FkMonthId,
  string FkYearId);

        Task<(int totalCount, IEnumerable<dynamic>)> ExportImportSalaryHeadAsync(
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
    string fk_costcentreid);


        Task<IEnumerable<dynamic>> SalaryHeadExportAsync(
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

  );

        //Task<bool> ImportSalaryHead(List<Dictionary<string, string>> employees, string fk_userId, string fk_locid, string EffectiveDate);
        
        Task<bool> ImportSalaryHead(string xmlData, string fk_userId, string fk_locid, string EffectiveDate);



        Task<List<dynamic>> ImportEmployeeOtherDetailAsync(EmployeeImportRequest request, string fk_locid, string fk_userid);


        Task<(int totalCount, IEnumerable<dynamic>)> ExportImportEmployeeOtherDetailAsync(
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
string fk_costcentreid, string empStatus, string company_id);



        //Salary Other Head Section


        Task<(int totalCount, IEnumerable<dynamic>)> ExportImportSalaryOtherHeadAsync(
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
string fk_costcentreid);




        public Task<IEnumerable<dynamic>> SalaryOtherHeadExportAsync(
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

);

     
        Task<bool> ImportSalaryOtherHead(string xmlData, string fk_userId, string fk_locid, string EffectiveDate);
        Task<(int totalCount, IEnumerable<dynamic>)> ExportImportIncentive(
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
string fk_costcentreid);


        Task<IEnumerable<dynamic>> exportincentive(
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

  );

        Task<bool> ImportIncentiveHead(string xmlData, string fk_userId, string fk_locid, string EffectiveDate);


        Task<IEnumerable<dynamic>> ExporImportLeavetAsync(
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
);

        Task<List<dynamic>> ExportImportLeave(ExpImpLeaverequest request, string fk_locid, string fk_userid, string EffectiveDate);


        Task<(int TotalCount, IEnumerable<dynamic> Data)> GetCDOListAsync(ImportExcle.CdoReportRequestModel req);


        Task<dynamic> ImportCDOAsync(CDOImportRequest request, int fk_monthId, int fk_yearId);

        Task<List<dynamic>> ImportCityMaster(CityImportRequest request, string fk_userId, string fk_locid, string fk_companyId);
        Task<List<dynamic>> ImportDesignationMaster(DesignationImportRequest request, string fk_userId, string fk_locid, string fk_companyId);
        Task<List<dynamic>> ImportDepartmentMaster(DepartmentImportRequest request, string fk_userId, string fk_locid, string fk_companyId);
        Task<List<dynamic>> ImportLocationMaster(LocationImportRequest request, string fk_userId, string fk_locid, string fk_companyId);

        //Added 06 May 2026

        Task<List<dynamic>> ImportClientMaster(ClientImportRequest request, string fk_userId, string fk_locid, string fk_companyId);
        Task<List<dynamic>> ImportOutletMaster(OutletImportRequest request, string fk_userId, string fk_locid, string fk_companyId);

        Task<List<dynamic>> ImportBranchMaster(BranchImportRequest request, string fk_userId, string fk_locid, string fk_companyId);


        Task<List<string>> ValidateEmpCodesAsync(List<string> empCodes, string companyId, string userId);

        Task<(dynamic Summary, IEnumerable<dynamic> Details)> CompareSalaryHeadImportAsync(string xmlData, string fk_userId, string fk_locid, string EffectiveDate);

        Task<(dynamic Summary, IEnumerable<dynamic> Details)> CompareSalaryOtherHeadImportAsync(string xmlData, string fk_userId, string fk_locid, string EffectiveDate);








    }





}