using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.Common;

namespace HRMSWebAPI.Repository
{
    public class ExitInterviewRepository : IExitInterviewRepository
    {
        public async Task<bool> InsertExitInterviewAsync(ExitInterviewMst model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@r_betterCareer", model.r_betterCareer, DbType.Boolean);
            dynamicParameters.Add("@r_higherSalary", model.r_higherSalary, DbType.Boolean);
            dynamicParameters.Add("@r_relocation", model.r_relocation, DbType.Boolean);
            dynamicParameters.Add("@r_personal", model.r_personal, DbType.Boolean);
            dynamicParameters.Add("@r_health", model.r_health, DbType.Boolean);
            dynamicParameters.Add("@r_education", model.r_education, DbType.Boolean);
            dynamicParameters.Add("@r_workEnv", model.r_workEnv, DbType.Boolean);
            dynamicParameters.Add("@r_managerial", model.r_managerial, DbType.Boolean);
            dynamicParameters.Add("@r_jobDissatisfaction", model.r_jobDissatisfaction, DbType.Boolean);
            dynamicParameters.Add("@r_workLife", model.r_workLife, DbType.Boolean);
            dynamicParameters.Add("@r_companyPolicies", model.r_companyPolicies, DbType.Boolean);
            dynamicParameters.Add("@r_retirement", model.r_retirement, DbType.Boolean);
            dynamicParameters.Add("@r_other", model.r_other, DbType.Boolean);
            dynamicParameters.Add("@r_otherText", model.r_otherText, DbType.String);

            dynamicParameters.Add("@q1_jobRole", model.q1_jobRole, DbType.String);
            dynamicParameters.Add("@q1_comments", model.q1_comments, DbType.String);
            dynamicParameters.Add("@q2_manager", model.q2_manager, DbType.String);
            dynamicParameters.Add("@q2_comments", model.q2_comments, DbType.String);
            dynamicParameters.Add("@q3_workEnv", model.q3_workEnv, DbType.String);
            dynamicParameters.Add("@q3_comments", model.q3_comments, DbType.String);
            dynamicParameters.Add("@q4_salary", model.q4_salary, DbType.String);
            dynamicParameters.Add("@q4_comments", model.q4_comments, DbType.String);
            dynamicParameters.Add("@q5_policies", model.q5_policies, DbType.String);
            dynamicParameters.Add("@q5_comments", model.q5_comments, DbType.String);
            dynamicParameters.Add("@q6_training", model.q6_training, DbType.String);
            dynamicParameters.Add("@q6_comments", model.q6_comments, DbType.String);
            dynamicParameters.Add("@q7_teamIssues", model.q7_teamIssues, DbType.String);
            dynamicParameters.Add("@q7_comments", model.q7_comments, DbType.String);
            dynamicParameters.Add("@q8_liked", model.q8_liked, DbType.String);
            dynamicParameters.Add("@q9_improvements", model.q9_improvements, DbType.String);
            dynamicParameters.Add("@q10_recommend", model.q10_recommend, DbType.String);
            dynamicParameters.Add("@q10_reason", model.q10_reason, DbType.String);

            dynamicParameters.Add("@active", model.active, DbType.Boolean);
            dynamicParameters.Add("@fk_empid", model.fk_empid, DbType.String);
            dynamicParameters.Add("@fk_finid", model.fk_finid, DbType.String);
            dynamicParameters.Add("@fk_insUserID", model.fk_insUserID, DbType.String);
            dynamicParameters.Add("@fk_insDateID", model.fk_insDateID, DbType.String);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP("Emp_ExitInterview_Ins", dynamicParameters, "InsertExitInterview");

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");
            if (isSuccess)
            {
                try
                {
                    using (var connection = DataBaseFactory.ConnString())
                    {
                        var pk = await connection.QueryFirstOrDefaultAsync<long?>(
                            "SELECT TOP 1 pk_exitInterviewId FROM FFS_ExitInterview_Mst WHERE fk_empid = @fk_empid ORDER BY pk_exitInterviewId DESC",
                            new { fk_empid = model.fk_empid });
                        if (pk.HasValue)
                        {
                            await connection.ExecuteAsync("dbo.Emp_ExitInterview_Email", new { pk_exitInterviewId = pk.Value }, commandType: CommandType.StoredProcedure);
                        }
                    }
                }
                catch (Exception)
                {
                }
            }

            return isSuccess;
        }

        public async Task<(int totalCount, IEnumerable<ExitInterviewMst>)> GetAllExitInterviewsAsync(
     int pageIndex,
     int pageSize,
     string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ExitInterviewMst>(
                "Emp_ExitInterview_SelForGrid",
                dynamicParameters,
                "ExitInterview_GetAll");

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            if (!isSuccess || tuple == null || tuple.Item2 == null)
                return (0, []);

            int totalCount =
                tuple.Item1 is IEnumerable<dynamic> totalList &&
                totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<ExitInterviewMst> GetExitInterviewByIdAsync(long exitInterviewId, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_exitInterviewId", exitInterviewId, DbType.Int64);
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var result = DataBaseFactory.QuerySP<ExitInterviewMst>(
                "Emp_ExitInterview_Edit",
                dynamicParameters,
                "ExitInterview_GetById").FirstOrDefault();

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            return isSuccess ? result : null;
        }

        public async Task<bool> UpdateExitInterviewAsync(ExitInterviewMst model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_exitInterviewId", model.pk_exitInterviewId, DbType.Int64);

            dynamicParameters.Add("@r_betterCareer", model.r_betterCareer, DbType.Boolean);
            dynamicParameters.Add("@r_higherSalary", model.r_higherSalary, DbType.Boolean);
            dynamicParameters.Add("@r_relocation", model.r_relocation, DbType.Boolean);
            dynamicParameters.Add("@r_personal", model.r_personal, DbType.Boolean);
            dynamicParameters.Add("@r_health", model.r_health, DbType.Boolean);
            dynamicParameters.Add("@r_education", model.r_education, DbType.Boolean);
            dynamicParameters.Add("@r_workEnv", model.r_workEnv, DbType.Boolean);
            dynamicParameters.Add("@r_managerial", model.r_managerial, DbType.Boolean);
            dynamicParameters.Add("@r_jobDissatisfaction", model.r_jobDissatisfaction, DbType.Boolean);
            dynamicParameters.Add("@r_workLife", model.r_workLife, DbType.Boolean);
            dynamicParameters.Add("@r_companyPolicies", model.r_companyPolicies, DbType.Boolean);
            dynamicParameters.Add("@r_retirement", model.r_retirement, DbType.Boolean);
            dynamicParameters.Add("@r_other", model.r_other, DbType.Boolean);
            dynamicParameters.Add("@r_otherText", model.r_otherText, DbType.String);

            dynamicParameters.Add("@q1_jobRole", model.q1_jobRole, DbType.String);
            dynamicParameters.Add("@q1_comments", model.q1_comments, DbType.String);
            dynamicParameters.Add("@q2_manager", model.q2_manager, DbType.String);
            dynamicParameters.Add("@q2_comments", model.q2_comments, DbType.String);
            dynamicParameters.Add("@q3_workEnv", model.q3_workEnv, DbType.String);
            dynamicParameters.Add("@q3_comments", model.q3_comments, DbType.String);
            dynamicParameters.Add("@q4_salary", model.q4_salary, DbType.String);
            dynamicParameters.Add("@q4_comments", model.q4_comments, DbType.String);
            dynamicParameters.Add("@q5_policies", model.q5_policies, DbType.String);
            dynamicParameters.Add("@q5_comments", model.q5_comments, DbType.String);
            dynamicParameters.Add("@q6_training", model.q6_training, DbType.String);
            dynamicParameters.Add("@q6_comments", model.q6_comments, DbType.String);
            dynamicParameters.Add("@q7_teamIssues", model.q7_teamIssues, DbType.String);
            dynamicParameters.Add("@q7_comments", model.q7_comments, DbType.String);
            dynamicParameters.Add("@q8_liked", model.q8_liked, DbType.String);
            dynamicParameters.Add("@q9_improvements", model.q9_improvements, DbType.String);
            dynamicParameters.Add("@q10_recommend", model.q10_recommend, DbType.String);
            dynamicParameters.Add("@q10_reason", model.q10_reason, DbType.String);

            dynamicParameters.Add("@active", model.active, DbType.Boolean);
            dynamicParameters.Add("@fk_empid", model.fk_empid, DbType.String);
            dynamicParameters.Add("@fk_finid", model.fk_finid, DbType.String);
            dynamicParameters.Add("@fk_updUserID", model.fk_updUserID, DbType.String);
            dynamicParameters.Add("@fk_updDateID", model.fk_updDateID, DbType.String);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP("Emp_ExitInterview_Upd", dynamicParameters, "ExitInterview_Update");

            return dynamicParameters.Get<bool>("@IsSuccessfull");
        }

        public async Task<bool> DeleteExitInterviewAsync(long exitInterviewId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_exitInterviewId", exitInterviewId, DbType.Int64);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP("Emp_ExitInterview_Del", dynamicParameters, "ExitInterview_Delete");

            return dynamicParameters.Get<bool>("@IsSuccessfull");
        }

        public async Task<(int totalCount, IEnumerable<ExitInterviewMst>)> GetAdminHodExitInterviewsAsync(
    string empId,
    bool isAdmin,
    int pageIndex,
    int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", empId, DbType.String);
            dynamicParameters.Add("@IsAdmin", isAdmin, DbType.Boolean);
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ExitInterviewMst>(
                "Emp_ExitInterview_AdminHod_SelForGrid",
                dynamicParameters,
                "ExitInterview_AdminHod_GetAll");

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            if (!isSuccess || tuple == null || tuple.Item2 == null)
                return (0, []);

            int totalCount =
                tuple.Item1 is IEnumerable<dynamic> totalList &&
                totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<ExitInterviewMst> GetAdminHodExitInterviewByEmpIdAsync(
            string viewEmpId,
            string empId,
            bool isAdmin)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@viewEmpId", viewEmpId, DbType.String);
            dynamicParameters.Add("@fk_empid", empId, DbType.String);
            dynamicParameters.Add("@IsAdmin", isAdmin, DbType.Boolean);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var result = DataBaseFactory.QuerySP<ExitInterviewMst>(
                "Emp_ExitInterview_AdminHod_GetByEmpId",
                dynamicParameters,
                "ExitInterview_AdminHod_GetByEmpId")
                .FirstOrDefault();

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            if (isSuccess && result != null && result.pk_exitInterviewId.HasValue)
            {
                try
                {
                    using (var connection = DataBaseFactory.ConnString())
                    {
                        await connection.ExecuteAsync(
                            "UPDATE FFS_ExitInterview_Mst SET interviewStatus = 1 WHERE pk_exitInterviewId = @pk_id AND ISNULL(interviewStatus, 0) = 0",
                            new { pk_id = result.pk_exitInterviewId.Value });

                        string reviewerName = await connection.QueryFirstOrDefaultAsync<string>(
                            "SELECT empname FROM SAL_Employee_Mst WHERE pk_empid = @empid",
                            new { empid = empId }) ?? "HR Admin";

                        await connection.ExecuteAsync(
                            "dbo.Emp_ExitInterviewReview_Email",
                            new { pk_exitInterviewId = result.pk_exitInterviewId.Value, reviewerName = reviewerName },
                            commandType: CommandType.StoredProcedure);
                    }
                }
                catch (Exception)
                {
                }
            }

            return isSuccess ? result : null;
        }

        public async Task<(int totalCount, IEnumerable<ExitInterviewMst>)> GetAllAdminHodExitInterviewsAsync(
    int pageIndex,
    int pageSize,
    string fk_empid,
    bool isAdmin)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@IsAdmin", isAdmin, DbType.Boolean);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ExitInterviewMst>(
                "Emp_ExitInterview_AdminHod_SelForGrid",
                dynamicParameters,
                "ExitInterview_AdminHod_GetAll");

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            if (!isSuccess || tuple == null || tuple.Item2 == null)
                return (0, []);

            int totalCount =
                tuple.Item1 is IEnumerable<dynamic> totalList &&
                totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<ExitInterviewMst> GetAdminHodExitInterviewByIdAsync(
            long pk_exitInterviewId,
            string fk_empid,
            bool isAdmin)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_interview_id", pk_exitInterviewId, DbType.Int64);
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);
            dynamicParameters.Add("@IsAdmin", isAdmin, DbType.Boolean);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var result = DataBaseFactory.QuerySP<ExitInterviewMst>(
                "Emp_ExitInterview_AdminHod_GetById",
                dynamicParameters,
                "ExitInterview_AdminHod_GetById").FirstOrDefault();

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            if (isSuccess && result != null && result.pk_exitInterviewId.HasValue)
            {
                try
                {
                    using (var connection = DataBaseFactory.ConnString())
                    {
                        await connection.ExecuteAsync(
                            "UPDATE FFS_ExitInterview_Mst SET interviewStatus = 1 WHERE pk_exitInterviewId = @pk_id AND ISNULL(interviewStatus, 0) = 0",
                            new { pk_id = result.pk_exitInterviewId.Value });

                        string reviewerName = await connection.QueryFirstOrDefaultAsync<string>(
                            "SELECT empname FROM SAL_Employee_Mst WHERE pk_empid = @empid",
                            new { empid = fk_empid }) ?? "HR Admin";

                        await connection.ExecuteAsync(
                            "dbo.Emp_ExitInterviewReview_Email",
                            new { pk_exitInterviewId = result.pk_exitInterviewId.Value, reviewerName = reviewerName },
                            commandType: CommandType.StoredProcedure);
                    }
                }
                catch (Exception)
                {
                }
            }

            return isSuccess ? result : null;
        }

        public async Task<ExitInterviewMst?> GetExitInterviewReportAsync(long exitInterviewId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_exitInterviewId", exitInterviewId, DbType.Int64);
            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var result = DataBaseFactory.QuerySP<ExitInterviewMst>(
                "Emp_ExitInterview_Report",
                dynamicParameters,
                "ExitInterview_Report"
            ).FirstOrDefault();

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            return isSuccess ? result : null;
        }
    }
}