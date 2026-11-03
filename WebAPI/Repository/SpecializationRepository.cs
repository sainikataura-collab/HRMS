using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class SpecializationRepository : ISpecializationRepository
    {
        public async Task<bool> InsertSpecializationMst(SpecializationMst specializationMst)
        {
            // Create DynamicParameters for the stored procedure
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", specializationMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@type", specializationMst.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@name", specializationMst.name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@isActive",specializationMst.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", specializationMst.fk_insUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", specializationMst.fk_insDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", specializationMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute the stored procedure
            int rowsAffected =  DataBaseFactory.QuerySP("REC_Specialization_Ins", dynamicParameters, "Specialization_Insert");
            // Return true if rows were affected
            return rowsAffected > 0;
        }

        public async Task<(int totalCount, IEnumerable<SpecializationMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fkCompanyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var tuple =  DataBaseFactory.QueryMultipleSP<dynamic, SpecializationMst>("REC_Specialization_SelForGrid", dynamicParameters, "SpecializationMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, new List<SpecializationMst>());
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;
            return (totalCount, tuple.Item2.ToList());
        }

        public async Task<SpecializationMst> GetSpecializationById(string specializationId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_specializationId", (object)specializationId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<SpecializationMst>("REC_Specialization_Edit", dynamicParameters, "REC_Specialization_Edit").FirstOrDefault();
        }

        public async Task<bool> UpdateSpecialization(SpecializationMst specialization)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_specializationId", (object)specialization.pk_specializationId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)specialization.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@type", (object)specialization.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@name", (object)specialization.name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@isActive",specialization.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)specialization.fk_updUserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)specialization.fk_updDateID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)specialization.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("REC_Specialization_Upd", dynamicParameters, "Specialization_Update");
            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteSpecialization(string specializationId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_specializationId", (object)specializationId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = await DataBaseFactory.QuerySPAsync("REC_Specialization_Del", dynamicParameters, "Specialization_Delete");
            return n > 0; // Return true if rows were affected
        }

    }
}
