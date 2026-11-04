using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class QualificationRepository : IQualificationRepository
    {
        public async Task<bool> InsertQualificationMst(QualificationMst qualificationMst)
        {
            // Create DynamicParameters for the stored procedure
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", qualificationMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@qualification", qualificationMst.qualification, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@type", qualificationMst.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", qualificationMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", qualificationMst.fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", qualificationMst.fk_insDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", qualificationMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute the stored procedure
            int rowsAffected = DataBaseFactory.QuerySP("HR_Qualification_Ins", dynamicParameters, "Qualification_Insert");

            // Return true if rows were affected
            return rowsAffected > 0;
        }

        public async Task<(int totalCount, IEnumerable<QualificationMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fkCompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, QualificationMst>("HR_Qualification_SelForGrid", dynamicParameters, "QualificationMst_GetAll");

            if (tuple == null || tuple.Item2 == null) return (0, new List<QualificationMst>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<QualificationMst> GetQualificationById(long qualiId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_qualiId", (object)qualiId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<QualificationMst>("HR_Qualification_Edit", dynamicParameters, "HR_Qualification_Edit").FirstOrDefault();
        }

        public async Task<bool> UpdateQualification(QualificationMst qualification)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_qualiId", (object)qualification.pk_qualiId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)qualification.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@qualification", (object)qualification.qualification, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@type", (object)qualification.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", qualification.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)qualification.fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)qualification.fk_updDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)qualification.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)qualification.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int rowsAffected = DataBaseFactory.QuerySP("HR_Qualification_Upd", dynamicParameters, "Qualification_Update");
            return rowsAffected > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteQualification(long qualiId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_qualiId", (object)qualiId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = await DataBaseFactory.QuerySPAsync("HR_Qualification_Del", dynamicParameters, "Qualification_Delete");
            return n > 0; // Return true if rows were affected
        }


    }
}
