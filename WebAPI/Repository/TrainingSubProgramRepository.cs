using Dapper;
using DocumentFormat.OpenXml.Wordprocessing;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Org.BouncyCastle.Bcpg;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class TrainingSubProgramRepository: ITrainingSubProgramRepository
    {

        public async Task<bool> Insertsubprogram(TrainingSubProgramMst programMSt)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_programId", (object)programMSt.fk_programId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@subProgramName", (object)programMSt.subProgramName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@isActive", (object)programMSt.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@createdBy", (object)programMSt.UserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("Trn_SubProgramMaster_Mst_Ins", dynamicParameters, "Trn_SubProgramMaster_Mst_Ins");
            return result > 0;
        }




        public async Task<(int totalCount, IEnumerable<TrainingSubProgramMst>)> GetAllsubprogram(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TrainingSubProgramMst>("Trn_Training_SubProgramMaster_GetAll", dynamicParameters, "Program-GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }








        public async Task<bool> UpdateSubprogram(TrainingSubProgramMst programMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_subProgramId", (object)programMst.pk_subProgramId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_programId", (object)programMst.fk_programId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@subProgramName", (object)programMst.subProgramName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           
            dynamicParameters.Add("@isActive", (object)programMst.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@modifiedBy", (object)programMst.UserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("Trn_SubProgram_Mst_Upd", dynamicParameters, "Trn_Traininsubgprogram_Mst_Upd");

            return n > 0; // Return true if rows were affected
        }


        public async Task<TrainingSubProgramMst> GetByIdSubprogram(long? pk_programId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_subProgramId", (object)pk_programId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TrainingSubProgramMst>("Trn_SubProgramMaster_Mst_Edit", (object)dynamicParameters, "SubProgramMaster Master - GetById").FirstOrDefault<TrainingSubProgramMst>();
        }



        public async Task<bool> DeleteAsync(long? id, string? UserId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_subProgramId", (object)id, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@userId", (object)UserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("Trn_Training_SubProgramMaster_Delete", dynamicParameters, "Trn_SubProgramMaster_Mst_Edit");
            return n > 0;
        }


    }
}
