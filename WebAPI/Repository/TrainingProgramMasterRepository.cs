using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class TrainingProgramMasterRepository: ITrainingProgramMasterRepository
    {
        public async Task<bool> Insert(TrainingProgramMst programMSt)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@description", (object)programMSt.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)programMSt.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)programMSt.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
          
            int result = DataBaseFactory.QuerySP("Trn_Trainingprogram_Mst_Ins", dynamicParameters, "Trn_Trainingprogram_Mst_Ins");
            return result > 0;
        }


        public async Task<(int totalCount, IEnumerable<TrainingProgramMst>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TrainingProgramMst>("Trn_Trainingprogram_Mst_SelForGrid", dynamicParameters, "Program-GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }








        public async Task<bool> Update(TrainingProgramMst programMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_programId", (object)programMst.pk_programId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)programMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)programMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)programMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)programMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("Trn_Trainingprogram_Mst_Upd", dynamicParameters, "Trn_Trainingprogram_Mst_Upd");
            return n > 0; // Return true if rows were affected
        }




        public async Task<TrainingProgramMst> GetByIdAsync(long? pk_programId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_programId", (object)pk_programId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TrainingProgramMst>("Trn_Trainingprogram_Mst_Edit", (object)dynamicParameters, "ProgramMaster Master - GetById").FirstOrDefault<TrainingProgramMst>();
        }



        public async Task<bool> DeleteAsync(long? id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_programId", (object)id, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("Trn_Trainingprogram_Mst_Del", dynamicParameters, "Delete");
            return n > 0; // Return true if rows were affected
        }
    }
}
