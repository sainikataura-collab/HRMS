using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;


namespace HRMSWebAPI.Repository
{
    public class TrainingTypeMasterRepository: ITrainingTypeMasterRepository
    {

        //for insert
        public async Task<bool> InsertAsync(TrainingTypeMst TrainingTypeMst)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@description", (object)TrainingTypeMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)TrainingTypeMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)TrainingTypeMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            
            int result = DataBaseFactory.QuerySP("Trn_TrainingType_Mst_Ins", dynamicParameters, "Training_Insert");

            return result > 0;
        }


        //GetAll
        public async Task<(int totalCount, IEnumerable<TrainingTypeMstGetAll>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TrainingTypeMstGetAll>("Trn_TrainingType_Mst_SelForGrid", dynamicParameters, "Trn_TrainingType_Mst_SelForGrid");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        //GetByID

        public async Task<TrainingTypeMst> GetByIdAsync(long pk_typeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_typeId", (object)pk_typeId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TrainingTypeMst>("Trn_TrainingType_Mst_Edit", (object)dynamicParameters, "Trn_TrainingType_Mst_Edit").FirstOrDefault<TrainingTypeMst>();
        }


        //For Delete
        public async Task<bool> DeleteAsync(long pk_typeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_typeId", (object)pk_typeId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("Trn_TrainingType_Mst_Del", dynamicParameters, "Trn_TrainingType_Mst_Del");

            return n > 0; // Return true if rows were affected
        }


        //For Update
        public async Task<bool> UpdateAsync(TrainingTypeMst TrainingTypeMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_typeId", (object)TrainingTypeMst.pk_typeId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)TrainingTypeMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@timestamp", (object)TrainingTypeMst.timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@remarks", (object)TrainingTypeMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)TrainingTypeMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("Trn_TrainingType_Mst_Upd", dynamicParameters, "Trn_TrainingType_Mst_Upd");

            return n > 0; // Return true if rows were affected
        }
















    }
}
