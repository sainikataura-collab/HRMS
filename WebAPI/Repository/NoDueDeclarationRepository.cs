using Dapper;
using HRBook_WebAPI.Models;
using HRMSWebAPI.Helper;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class NoDueDeclarationRepository : INoDueDeclarationRepository
    {
        public async Task<bool> InsertNoDueDeclarationAsync(NoDueDeclarationMst noDueDeclarationMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", noDueDeclarationMst.fk_empid, DbType.String);
            dynamicParameters.Add("@noSalaryAdvance", noDueDeclarationMst.noSalaryAdvance, DbType.Boolean);
            dynamicParameters.Add("@noLoan", noDueDeclarationMst.noLoan, DbType.Boolean);
            dynamicParameters.Add("@noReimbursement", noDueDeclarationMst.noReimbursement, DbType.Boolean);
            dynamicParameters.Add("@noCompanyProperty", noDueDeclarationMst.noCompanyProperty, DbType.Boolean);
            dynamicParameters.Add("@declarationDate", noDueDeclarationMst.declarationDate, DbType.Date);
            dynamicParameters.Add("@agreeDeclaration", noDueDeclarationMst.agreeDeclaration, DbType.Boolean);
            dynamicParameters.Add("@noDueStatus", 2, DbType.Int32);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "Emp_NoDueDeclaration_Ins",
                dynamicParameters,
                "NoDueDeclaration_Insert"
            );

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");
            if (isSuccess)
            {
                try
                {
                    using (var connection = DataBaseFactory.ConnString())
                    {
                        var pk = await connection.QueryFirstOrDefaultAsync<long?>(
                            "SELECT TOP 1 pk_noDueDeclarationId FROM FFS_NoDueDeclaration_Mst WHERE fk_empid = @fk_empid ORDER BY pk_noDueDeclarationId DESC",
                            new { fk_empid = noDueDeclarationMst.fk_empid });
                        if (pk.HasValue)
                        {
                            await connection.ExecuteAsync("dbo.Emp_NoDueDeclaration_Email", new { pk_noDueDeclarationId = pk.Value }, commandType: CommandType.StoredProcedure);
                        }
                    }
                }
                catch (Exception)
                {
                }
            }

            return isSuccess;
        }

        public async Task<(int totalCount, IEnumerable<NoDueDeclarationMst>)> GetAll(
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

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, NoDueDeclarationMst>(
                "Emp_NoDueDeclaration_SelForGrid",
                dynamicParameters,
                "NoDueDeclaration_GetAll"
            );

            if (tuple == null || tuple.Item2 == null)
            {
                return (0, new List<NoDueDeclarationMst>());
            }

            int totalCount = 0;

            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                totalCount = Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First());
            }

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<NoDueDeclarationMst> GetNoDueDeclarationByIdAsync(int pk_noDueDeclarationId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_noDueDeclarationId", pk_noDueDeclarationId, DbType.Int32);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            return DataBaseFactory.QuerySP<NoDueDeclarationMst>(
                "Emp_NoDueDeclaration_SelById",
                dynamicParameters,
                "NoDueDeclaration_GetById"
            ).FirstOrDefault();
        }

        public async Task<NoDueDeclarationMst> GetEmpDetailsAsync(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            return DataBaseFactory.QuerySP<NoDueDeclarationMst>(
                "Emp_NoDueDeclaration_GetEmpDetails",
                dynamicParameters,
                "NoDueDeclaration_GetEmpDetails"
            ).FirstOrDefault();
        }

        public async Task<bool> UpdateNoDueDeclarationAsync(NoDueDeclarationMst noDueDeclarationMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_noDueDeclarationId", noDueDeclarationMst.pk_noDueDeclarationId, DbType.Int32);
            dynamicParameters.Add("@noSalaryAdvance", noDueDeclarationMst.noSalaryAdvance, DbType.Boolean);
            dynamicParameters.Add("@noLoan", noDueDeclarationMst.noLoan, DbType.Boolean);
            dynamicParameters.Add("@noReimbursement", noDueDeclarationMst.noReimbursement, DbType.Boolean);
            dynamicParameters.Add("@noCompanyProperty", noDueDeclarationMst.noCompanyProperty, DbType.Boolean);
            dynamicParameters.Add("@declarationDate", noDueDeclarationMst.declarationDate, DbType.Date);
            dynamicParameters.Add("@agreeDeclaration", noDueDeclarationMst.agreeDeclaration, DbType.Boolean);
            dynamicParameters.Add("@noDueStatus", 2, DbType.Int32);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "Emp_NoDueDeclaration_Upd",
                dynamicParameters,
                "NoDueDeclaration_Update"
            );

            return dynamicParameters.Get<bool>("@IsSuccessfull");
        }

        public async Task<bool> DeleteNoDueDeclarationAsync(int pk_noDueDeclarationId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_noDueDeclarationId", pk_noDueDeclarationId, DbType.Int32);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "Emp_NoDueDeclaration_Del",
                dynamicParameters,
                "NoDueDeclaration_Delete"
            );

            return dynamicParameters.Get<bool>("@IsSuccessfull");
        }
        public async Task<NoDueDeclarationMst> GetNoDueDeclarationReportAsync(int pk_noDueDeclarationId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_noDueDeclarationId", pk_noDueDeclarationId, DbType.Int32);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            return DataBaseFactory.QuerySP<NoDueDeclarationMst>(
                "Emp_NoDueDeclaration_Report",
                dynamicParameters,
                "NoDueDeclaration_Report"
            ).FirstOrDefault();
        }

        public async Task<(int totalCount, IEnumerable<NoDueDeclarationMst>)> GetAdminHodNoDueDeclarationsAsync(
    string empId,
    bool isAdmin,
    int pageIndex,
    int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_empid", empId, DbType.String);
            dynamicParameters.Add("@IsAdmin", isAdmin, DbType.Boolean);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, NoDueDeclarationMst>(
                "Emp_NoDueDeclaration_AdminHod_SelForGrid",
                dynamicParameters,
                "NoDueDeclaration_AdminHod_GetAll"
            );

            bool isSuccess = dynamicParameters.Get<bool>("@IsSuccessfull");

            if (!isSuccess || tuple == null || tuple.Item2 == null)
            {
                return (0, new List<NoDueDeclarationMst>());
            }

            int totalCount = 0;

            if (tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any())
            {
                totalCount = Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First());
            }

            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<NoDueDeclarationMst> GetAdminHodNoDueDeclarationByIdAsync(
    int pk_noDueDeclarationId,
    string empId,
    bool isAdmin)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_noDueDeclarationId", pk_noDueDeclarationId, DbType.Int32);
            dynamicParameters.Add("@fk_empid", empId, DbType.String);
            dynamicParameters.Add("@IsAdmin", isAdmin, DbType.Boolean);

            dynamicParameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            dynamicParameters.Add("@Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

            return DataBaseFactory.QuerySP<NoDueDeclarationMst>(
                "Emp_NoDueDeclaration_AdminHod_GetById",
                dynamicParameters,
                "NoDueDeclaration_AdminHod_GetById"
            ).FirstOrDefault();
        }
    }
}