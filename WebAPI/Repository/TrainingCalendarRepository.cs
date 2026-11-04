using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using static HRMSWebAPI.Repository.TrainingCalendarRepository;

namespace HRMSWebAPI.Repository
{
    public class TrainingCalendarRepository : ITrainingCalendarRepository
    {

        public async Task<bool> InsertTrainingCalendarAsync(TrainingCalendar training)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@fk_programId", training.fk_programId, DbType.Int32);
            parameters.Add("@fk_TNIId", training.fk_TNIId, DbType.Int32);
            parameters.Add("@fk_subprogramId", training.fk_subprogramId, DbType.Int32);
            parameters.Add("@fk_planningId", training.fk_planningId, DbType.String);
            parameters.Add("@trainingDateTime", training.trainingDateTime, DbType.DateTime);

            parameters.Add("@trainer", training.trainer, DbType.String);
            parameters.Add("@mode", training.mode, DbType.String);
            parameters.Add("@location", training.location, DbType.String);
            parameters.Add("@@status", training.status, DbType.String);
            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("TrainingCalendar_Insert", parameters, "TrainingCalendar_Insert");
            return result > 0;
        }

        public async Task<TrainingPlanning> GetByIdAsyncforCalendar(long planningId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@PlanningId", (object)planningId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TrainingPlanning>("TRN_TrainingPlanning_GetByIdForCalender", (object)dynamicParameters, "TRN_TrainingPlanning_GetByIdForCalender - GetById").FirstOrDefault<TrainingPlanning>();
        }

        public IEnumerable<getAdminCalendarList> GetAdminCalendarList()
        {
            var result = DataBaseFactory.QuerySP<getAdminCalendarList>(
                "TRN_TrainingCalendar_AdminList",
                null,  // no parameters
                "TRN_TrainingCalendar_AdminList - GetAll"
            );
            return result?.ToList() ?? new List<getAdminCalendarList>();
        }


        public IEnumerable<getAdminCalendarList> GetAll(string empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", empid, DbType.String, ParameterDirection.Input);
            var result = DataBaseFactory.QuerySP<getAdminCalendarList>("Get_EmployeeCalendar", dynamicParameters, "TRN_Get_EmployeeCalendar - GetAll");
            return result?.ToList() ?? new List<getAdminCalendarList>();
        }

        public async Task<ModelResponse> InsertTrainingAttendanceAsync(TrainingAttendanceDto attendance)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_planningId", attendance.pk_planningId, DbType.Int32);
            parameters.Add("@fk_empId", attendance.fk_empId, DbType.String);
            parameters.Add("@adminId", attendance.adminId, DbType.String);
            parameters.Add("@attendanceDate", attendance.attendanceDate, DbType.DateTime);
                parameters.Add("@attendanceStatus", attendance.attendanceStatus, DbType.String);
            parameters.Add("@remarks", attendance.remarks, DbType.String);

            // Query first row returned from SP
            var result = DataBaseFactory.QuerySP<ModelResponse>(
                "TRN_Mark_Training_Attendance_Daily",parameters,"TRN_Mark_Training_Attendance_Daily").FirstOrDefault();
            return result ?? new ModelResponse
            {
                IsSuccess = false,
                Message = "No response from procedure."
            };
        }



        //
        public async Task<string> CheckTodayAttendanceAsync(int calendarId, string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_calendarId", calendarId, DbType.Int32);
            parameters.Add("@fk_empId", empId, DbType.String);

            // Calls the stored procedure that checks today's attendance
            var result = DataBaseFactory.QuerySP<string>("TRN_Traning_Check_Today_Attendance", (object)parameters, "TRN_Traning_Check_Today_Attendance - Check").FirstOrDefault();
            return result;
        }


        // for employee attandance view
        public async Task<(TrainingAttendanceEmployeeInfo, List<TrainingAttendanceDetail>)> GetTrainingAttendanceView(int pk_planningId, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_planningId", pk_planningId, DbType.Int32, ParameterDirection.Input);
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<TrainingAttendanceEmployeeInfo, TrainingAttendanceDetail>("TRN_Training_Attendance_View", dynamicParameters, "TRN_Training_Attendance_View");

            TrainingAttendanceEmployeeInfo employeeinfo = null;

            List<TrainingAttendanceDetail> empAttendetails = new();

            if (tuple != null && tuple.Item1 != null)
            {
                employeeinfo = tuple.Item1.FirstOrDefault();
            }

            if (tuple != null && tuple.Item2 != null && employeeinfo != null)
            {
                empAttendetails = tuple.Item2.ToList();
            }

            return (employeeinfo, empAttendetails);
        }


        //Meterial
        public async Task<bool> InsertMaterialAsync(TrainingMaterial material)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_planningId", material.fk_planningId, DbType.Int32);
            parameters.Add("@materialType", material.materialType, DbType.String);
            parameters.Add("@materialTitle", material.materialTitle, DbType.String);
            parameters.Add("@materialPath", material.materialPath, DbType.String);
            parameters.Add("@materialUrl", material.materialUrl, DbType.String);
            parameters.Add("@description", material.description, DbType.String);
            parameters.Add("@fileSize", material.fileSize, DbType.String);
            parameters.Add("@isActive", material.isActive, DbType.Boolean);
            parameters.Add("@isMandatory", material.isMandatory, DbType.Boolean);
            parameters.Add("@uploadedBy", material.uploadedBy, DbType.String);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("TRN_TrainingMaterial_Ins", parameters, "TRN_TrainingMaterial_Ins");

            return result > 0;


        }

        public async Task<(int totalCount, IEnumerable<TrainingMaterial>)> GetAll(
        int pageIndex,
        int pageSize,
        int? fk_planningId = null,
        string? materialType = null,
        bool? isActive = null)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageIndex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pageSize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_planningId", fk_planningId, DbType.Int32);
            dynamicParameters.Add("@materialType", materialType, DbType.String);
            dynamicParameters.Add("@isActive", isActive, DbType.Boolean);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TrainingMaterial>("TRN_TrainingMaterial_GetAll",dynamicParameters,"TRN_TrainingMaterial_GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, Enumerable.Empty<TrainingMaterial>());

            // Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<TrainingMaterial?> GetById(int materialId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@materialId", materialId, DbType.Int32);

            var result = DataBaseFactory.QuerySP<TrainingMaterial>("TRN_TrainingMaterial_GetById",parameters,"TRN_TrainingMaterial_GetById");

            return result?.FirstOrDefault();
        }

        public async Task<bool> UpdateMaterialAsync(TrainingMaterial material)
        {
                 DynamicParameters parameters = new DynamicParameters();

                parameters.Add("@pk_materialId", material.pk_materialId);
              
                parameters.Add("@fk_planningId", material.fk_planningId);
                parameters.Add("@materialType", material.materialType);
                parameters.Add("@materialTitle", material.materialTitle);
                parameters.Add("@materialUrl", material.materialUrl);
                parameters.Add("@description", material.description);
                parameters.Add("@isActive", material.isActive);
                parameters.Add("@isMandatory", material.isMandatory);
                parameters.Add("@materialPath", material.materialPath);
                parameters.Add("@uploadedBy", material.uploadedBy);
                parameters.Add("@fileSize", material.fileSize);
                // Execute stored procedure
                int result = DataBaseFactory.QuerySP("TRN_TrainingMaterial_Update", parameters, "TRN_TrainingMaterial_Update");
                return result > 0;

        }


        // feedback
      
          public async Task<bool> InsertTrainingFeedbackAsync(TrainingFeedback feedback)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in XML dataset format
            TrainingFeedbackDataSet dataset = new TrainingFeedbackDataSet { Feedback = feedback };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            

            // Execute SP
            int result = DataBaseFactory.QuerySP("Trn_TrainingFeedback_Trn_Ins", dynamicParameters, "TrainingFeedback_Insert");

            return result > 0;
        }








    }



}
