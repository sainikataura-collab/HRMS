using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class TrainingRatingRepository : ITrainingRatingRepository
    {
        public async Task<(int totalCount, IEnumerable<TrainingRatingMstView>)> GetAll(int pageindex, int pagesize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TrainingRatingMstView>("Trn_TrainingRating_Mst_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<TrainingRatingMstView> GetByIdAsync(int pk_ratingId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ratingId", (object)pk_ratingId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TrainingRatingMstView>("Trn_TrainingRating_Mst_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<TrainingRatingMstView>();
        }

        public async Task<bool> DeleteAsync(int pk_ratingId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ratingId", (object)pk_ratingId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("Trn_TrainingRating_Mst_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertAsync(TrainingRatingMst TrainingRatingMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)TrainingRatingMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@active", (object)TrainingRatingMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@remarks", (object)TrainingRatingMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Trn_TrainingRating_Mst_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> UpdateAsync(TrainingRatingMst TrainingRatingMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ratingId", (object)TrainingRatingMst.pk_ratingId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@description", (object)TrainingRatingMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@active", (object)TrainingRatingMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@remarks", (object)TrainingRatingMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("Trn_TrainingRating_Mst_Upd", dynamicParameters, "update");

            return n > 0; // Return true if rows were affected

        }


    }
    }
