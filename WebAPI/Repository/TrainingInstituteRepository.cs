using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class TrainingInstituteRepository:ITrainingInstituteRepository
    {
        public async Task<bool> InsertAsync(TrainingInstituteMst trainingInstitute)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@description", (object)trainingInstitute.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@type", (object)trainingInstitute.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)trainingInstitute.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)trainingInstitute.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("Trn_TrainingInstitute_Mst_Ins", dynamicParameters, "Insert");

            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<getall>)> GetAll(int pageindex, int pagesize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
          
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, getall>("Trn_TrainingInstitute_Mst_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<TrainingInstituteMst> GetByIdAsync(long pk_instituteId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_instituteId", (object)pk_instituteId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TrainingInstituteMst>("Trn_TrainingInstitute_Mst_Edit", (object)dynamicParameters, "section Master - GetById").FirstOrDefault<TrainingInstituteMst>();
        }

        public async Task<bool> DeleteMstAsync(long pk_instituteId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_instituteId", (object)pk_instituteId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("Trn_TrainingInstitute_Mst_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> UpdateAsync(TrainingInstituteMst trainingInstitute)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_instituteId", (object)trainingInstitute.pk_instituteId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)trainingInstitute.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@type", (object)trainingInstitute.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)trainingInstitute.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)trainingInstitute.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@timestamp", (object)trainingInstitute.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("Trn_TrainingInstitute_Mst_Upd", dynamicParameters, "Update");

            return n > 0; // Return true if rows were affected
        }

    }
}
