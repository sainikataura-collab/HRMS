using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class TrainingPlanningRepository : ITrainingPlanningRepository
    {

        public async Task<(int totalCount, IEnumerable<TrainingPlanning>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TrainingPlanning>("TrainingPlanning_GetAll", dynamicParameters, "TrainingPlanning");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<(TrainingPlanning, List<TrainingPlanning_AudienceDetail>)> GetTrainingPlanningByIdAsync(long planningId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@PlanningId", planningId, DbType.Int64, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<TrainingPlanning, TrainingPlanning_AudienceDetail>( "TrainingPlanning_GetById", dynamicParameters,"TrainingPlanning_GetById");

            TrainingPlanning planningHeader = null;

            List<TrainingPlanning_AudienceDetail> audienceDetails = new();

            if (tuple != null && tuple.Item1 != null)
            {
                planningHeader = tuple.Item1.FirstOrDefault();
            }

            if (tuple != null && tuple.Item2 != null && planningHeader != null)
            {
                audienceDetails = tuple.Item2.ToList();
            }

            return (planningHeader, audienceDetails);
        }



        public async Task<bool> InsertTrainingPlanningAsync(TrainingPlanning training, List<TrainingPlanning_AudienceDetail> audienceDetails)
        {
            DynamicParameters parameters = new DynamicParameters();

            string xmlData = XmlUtility.XmlSerializeToString(audienceDetails);
            parameters.Add("@Trainer", training.Trainer, DbType.String);
            parameters.Add("@trainername", training.TrainerName, DbType.String);
            //parameters.Add("@fk_TNIId", training.fk_TNIId, DbType.Int32);
            parameters.Add("@fk_programId", training.fk_programId, DbType.Int32);
            parameters.Add("@fk_subprogramId", training.fk_subprogramId, DbType.Int32);
            parameters.Add("@Mode", training.Mode, DbType.String);
            parameters.Add("@TrainingDateTime", training.TrainingDateTime, DbType.DateTime);
            parameters.Add("@Duration", training.Duration, DbType.String);
            parameters.Add("@Location", training.Location, DbType.String);
            parameters.Add("@fk_InstituteId", training.fk_InstituteId, DbType.String);
            parameters.Add("@trnCharge", training.trnCharge, DbType.Decimal);
            parameters.Add("@TargetAudienceType", training.TargetAudienceType, DbType.String);
            parameters.Add("@TrainingXML", xmlData, DbType.String);
            parameters.Add("@Approval", training.approval, DbType.Boolean);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("TrainingPlanning_Insert", parameters, "TrainingPlanning_Insert");

            return result > 0;
        }

        public async Task<bool> UpdateTrainingPlanningAsync(TrainingPlanning training, List<TrainingPlanning_AudienceDetail> audienceDetails)
        {
            DynamicParameters parameters = new DynamicParameters();

            // Convert audience list to XML
            string xmlData = XmlUtility.XmlSerializeToString(audienceDetails);

            parameters.Add("@PlanningId", training.pk_planningId, DbType.Int64);
            parameters.Add("@TrainingTitle", training.TrainingTitle, DbType.String);
            parameters.Add("@Trainer", training.Trainer, DbType.String);
            parameters.Add("@TrainingDateTime", training.TrainingDateTime, DbType.DateTime);
            parameters.Add("@Duration", training.Duration, DbType.String);
            parameters.Add("@Location", training.Location, DbType.String);
            parameters.Add("@fk_InstituteId", training.fk_InstituteId, DbType.String);
            parameters.Add("@TargetAudienceType", training.TargetAudienceType, DbType.String);
            parameters.Add("@Approval", training.approval, DbType.Boolean);
            parameters.Add("@TrainingXML", xmlData, DbType.Xml);
            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("TrainingPlanning_Update", parameters, "TrainingPlanning_Update");
            return result > 0;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@PlanningId", (object)id, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("TrainingPlanning_Delete", dynamicParameters, "TrainingPlanning_Delete");

            return n > 0; // Return true if rows were affected
        }


        public async Task<(TrainingPlanning, List<TrainingPlanning_AudienceDetail>)> GetTrainingPlanEmpView(int programid, int subprogramid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@programId", programid, DbType.Int32, ParameterDirection.Input);
            dynamicParameters.Add("@subprogramId", subprogramid, DbType.String, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<TrainingPlanning, TrainingPlanning_AudienceDetail>("TrainingPlanning_GetPlannedEmployees", dynamicParameters, "TRN_Training_Attendance_View");

            TrainingPlanning programs = null;

            List<TrainingPlanning_AudienceDetail> plannedEmployee = new();

            if (tuple != null && tuple.Item1 != null)
            {
                programs = tuple.Item1.FirstOrDefault();
            }

            if (tuple != null && tuple.Item2 != null && plannedEmployee != null)
            {
                plannedEmployee = tuple.Item2.ToList();
            }

            return (programs, plannedEmployee);
        }




        public async Task<(TrainingPlanning, List<attendanceDetails>)> GetTrainingAttendance(string pk_empid,int programid,int subprogramid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empId", pk_empid, DbType.String, ParameterDirection.Input);
            dynamicParameters.Add("@fk_programId ", programid, DbType.Int32, ParameterDirection.Input);
            dynamicParameters.Add("@fk_subprogramId", subprogramid, DbType.Int32, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<TrainingPlanning, attendanceDetails>("TRN_TrainingAttendance_NotMarkedForAdmin", dynamicParameters, "TRN_TrainingAttendance_NotMarkedForAdmin");

            TrainingPlanning programs = null;

            List<attendanceDetails> EmpAttandance = new();

            if (tuple != null && tuple.Item1 != null)
            {
                programs = tuple.Item1.FirstOrDefault();
            }

            if (tuple != null && tuple.Item2 != null && EmpAttandance != null)
            {
                EmpAttandance = tuple.Item2.ToList();
            }

            return (programs, EmpAttandance);
        }

        // get completed programs for feedback
        public async Task<Result<List<NameValue>>> GetCompletedProgramsDropdownList(string userID )
        {
            var result = new Result<List<NameValue>>();
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_empId", userID, DbType.String);

                // If your QuerySP is not async, remove async/await
                var data = DataBaseFactory.QuerySP<NameValue>("TRN_GetCompleted_TrainingPrograms", dynamicParameters, "[TRN_GetCompleted_TrainingPrograms]");

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





    }
}
