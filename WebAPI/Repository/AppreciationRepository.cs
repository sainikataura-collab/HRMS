using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class AppreciationRepository : IAppreciationRepository
    {
        public async Task<bool> InsertEmployeeAppreciation(AppreciationMst appreciation)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)appreciation.fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@incidentDate", (object)appreciation.incidentDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@incidentDetails", (object)appreciation.incidentDetails, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empApreid", (object)appreciation.fk_empApreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@type", (object)appreciation.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(1), new byte?(), new byte?());
            dynamicParameters.Add("@Filename", (object)appreciation.attachment, new DbType?(DbType.String), new ParameterDirection?(), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@FileContentType", (object)appreciation.FileContentType, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)appreciation.fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locId", (object)appreciation.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());

            // Execute stored procedure
            int n = DataBaseFactory.QuerySP("HR_Employee_Appreciation_Mst_Ins", dynamicParameters, "Insert Employee Appreciation");
                return n > 0; // Return true if rows were affected
        }

        public async Task<(int totalCount, IEnumerable<AppreciationMst>)> GetAll(int pageIndex, int pageSize, string companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, AppreciationMst>(
                "HR_Employee_Appreciation_Mst_selforgrid", dynamicParameters, "Appreciation - GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<AppreciationMst>());

            // Convert TotalCount
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2?.ToList());
        }

        public async Task<AppreciationMst> GetById(long pk_appreciationId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_appreciationId", (object)pk_appreciationId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<AppreciationMst>("HR_Employee_Appreciation_Mst_Edit", dynamicParameters, "Get Appreciation By ID").FirstOrDefault<AppreciationMst>();
        }

        public async Task<bool> UpdateAppreciation(AppreciationMst appreciation)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_appreciationId", (object)appreciation.pk_appreciationId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)appreciation.fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@incidentDate", (object)appreciation.incidentDate, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@incidentDetails", (object)appreciation.incidentDetails, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empApreid", (object)appreciation.fk_empApreid, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@type", (object)appreciation.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(1), new byte?(), new byte?());
            dynamicParameters.Add("@Filename", (object)appreciation.attachment, new DbType?(DbType.String), new ParameterDirection?(), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@FileContentType", (object)appreciation.FileContentType, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userId", (object)appreciation.fk_userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locId", (object)appreciation.fk_locId, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("HR_Employee_Appreciation_Mst_Upd", dynamicParameters, "Update Appreciation");
            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteAppreciation(long pk_appreciationId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_appreciationId", (object)pk_appreciationId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure for delete
            int n = DataBaseFactory.QuerySP("HR_Employee_Appreciation_Mst_Del", dynamicParameters, "Delete Appreciation");
            return n > 0; // Return true if rows were affected
        }
    }
}
