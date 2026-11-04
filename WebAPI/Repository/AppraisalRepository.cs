using Dapper;
using DocumentFormat.OpenXml.EMMA;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class AppraisalRepository: IAppraisalRepository
    {
        public async Task<bool> InsertAppraisalAsync(AppraisalMst model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)model.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)model.fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@dated", (object)model.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)model.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?()); // ✅ Active field added
            dynamicParameters.Add("@remarks", (object)model.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)model.fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?()); // Assuming insert user ID
            dynamicParameters.Add("@fk_locid", (object)model.fk_insDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());  // Assuming location ID in fk_insDateID

            int result = DataBaseFactory.QuerySP("SAL_Appraisal_Ins", dynamicParameters, "InsertAppraisal");
            return result > 0;
        }


        public async Task<(int totalCount, IEnumerable<AppraisalMstView>)> GetAllAppraisalsAsync(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, AppraisalMstView>("SAL_Appraisal_SelForGrid", dynamicParameters, "Appraisal_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;
            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<AppraisalMstView> GetAppraisalByIdAsync(long appraisalId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_appId", (object)appraisalId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory
                .QuerySP<AppraisalMstView>("SAL_Appraisal_Edit", dynamicParameters, "Appraisal - GetById")
                .FirstOrDefault();
        }


        public async Task<bool> UpdateAppraisalAsync(AppraisalMst appraisal)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_appId", (object)appraisal.pk_appId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)appraisal.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_finid", (object)appraisal.fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@dated", (object)appraisal.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)appraisal.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?()); // ✅ Active field added
            dynamicParameters.Add("@remarks", (object)appraisal.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)appraisal.fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)appraisal.fk_updDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Appraisal_Upd", dynamicParameters, "Appraisal_Update");
            return n > 0;
        }

        public async Task<bool> DeleteAppraisalAsync(long appId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_appId", (object)appId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("SAL_Appraisal_Del", dynamicParameters, "Appraisal_Delete");
            return n > 0; // Return true if rows were affected
        }




    }
}
