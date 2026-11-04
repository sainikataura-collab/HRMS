using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class TravelMasterRepository : ITravelMasterRepository
    {


        public async Task<bool> CreateAsync(TravelMasterMstmodel model)
        {

            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters dynamicParameters = new DynamicParameters();
           // dynamicParameters.Add("@pk_classTvlId", (object)model.TravelMasterMst.pk_classTvlId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
         dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Call the stored procedure
            int n = DataBaseFactory.QuerySP("LTRN_Class_Mst_Ins", dynamicParameters, "LTRN_Class_Mst_Insert");

            return n > 0;
        }
       

        public async Task<List<TravelMasterMstView>> GetAllAsync(long pk_classTvlId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_classTvlId", (object)pk_classTvlId, DbType.String);

            var result = DataBaseFactory.QuerySP<TravelMasterMstView>(
                "LTRN_Class_Mst_Selforgrid",
                dynamicParameters,
                "Selected all");

            return await Task.FromResult(result.ToList());
        }


        public async Task<TravelMasterMst> GetById(long pk_classTvlId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_classTvlId", (object)pk_classTvlId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TravelMasterMst>("LTRN_Class_Mst_Edit", (object)dynamicParameters,
                "GetById").FirstOrDefault<TravelMasterMst>();
        }




        public async Task<bool> DeleteAsync(long pk_classTvlId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_classTvlId", (object)pk_classTvlId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("LTRN_Class_Mst_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> UpdateTravelMstAsync(TravelMasterMstmodel model)
        {
            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_classTvlId", (object)model.TravelMasterMst.pk_classTvlId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("LTRN_Class_Mst_Upd", dynamicParameters, "Functional_Mst_Update");

            return n > 0; // Return true if rows were affected
        }
    }
}
