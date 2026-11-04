using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class ConfirmationEmailRepository : IConfirmationEmailRepository
    {

        public async Task<bool> InsertEmailSetting(ConfirmationEmailMst emailSetting)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@orderno", (object)emailSetting.orderno, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@days", (object)emailSetting.days, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)emailSetting.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure
            int n = DataBaseFactory.QuerySP("HR_Employee_Confirmation_Request_EmailSetting_Ins", dynamicParameters, "Insert Email Setting");
            return n > 0; // Return true if rows were affected
        }

        // Get Email Settings for Grid
        public async Task<(int totalCount, IEnumerable<ConfirmationEmailMst>)> GetAll(int pageIndex, int pageSize, string companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple =DataBaseFactory.QueryMultipleSP<dynamic, ConfirmationEmailMst>(
                "HR_Employee_Confirmation_Request_EmailSetting_SelForGrid", dynamicParameters, "Email Setting - GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<ConfirmationEmailMst>());

            // Convert TotalCount
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2?.ToList());
        }

        // Get Email Setting by ID
        public async Task<ConfirmationEmailMst> GetById(long pk_conrequesemailtId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_conrequesemailtId", (object)pk_conrequesemailtId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ConfirmationEmailMst>("HR_Employee_Confirmation_Request_EmailSetting_Edit", dynamicParameters, "Get Email Setting By ID").FirstOrDefault<ConfirmationEmailMst>();
        }

        // Update Email Setting
        public async Task<bool> UpdateEmailSetting(ConfirmationEmailMst emailSetting)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_conrequesemailtId", (object)emailSetting.pk_conrequesemailtId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@orderno", (object)emailSetting.orderno, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@days", (object)emailSetting.days, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("HR_Employee_Confirmation_Request_EmailSetting_Upd", dynamicParameters, "Update Email Setting");
            return n > 0; // Return true if rows were affected
        }

        // Delete Email Setting
        public async Task<bool> DeleteEmailSetting(long pk_conrequesemailtId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_conrequesemailtId", (object)pk_conrequesemailtId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for delete
            int n = DataBaseFactory.QuerySP("HR_Employee_Confirmation_Request_EmailSetting_Del", dynamicParameters, "Delete Email Setting");
            return n > 0; // Return true if rows were affected
        }

    }
}

