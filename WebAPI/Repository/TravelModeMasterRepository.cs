using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;
using static HRMSWebAPI.Models.TravelModeMasterModel;


namespace HRMSWebAPI.Repository
{
    public class TravelModeMasterRepository: ITravelModeMasterRepository
    {
        public async Task<bool> TravelmodeInsert(TravelModeMasterModel trvlmodel)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            TrvlModemasterModelrequest request = new TrvlModemasterModelrequest { travel = new List<TravelModeMasterModel> { trvlmodel } };

            string xmlData = XmlUtility.XmlSerializeToString(request);

            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("LTRN_TravelMode_Mst_Ins", dynamicParameters, "LTRN_TravelMode_Mst_Ins");
            return n > 0;


        }



        public async Task<List<TrvlModemasterModelGetAll>> LTRN_TravelMode_Mst_Selforgrid(string pk_travelmodeID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_travelmodeID", (object)pk_travelmodeID, DbType.String);

            var result = DataBaseFactory.QuerySP<TrvlModemasterModelGetAll>(
                "LTRN_TravelMode_Mst_Selforgrid",
                dynamicParameters,
                "LTRN_TravelMode_Mst_Selforgrid");

            return await Task.FromResult(result.ToList());
        }


        public async Task<bool> DeleteAsync(long pk_travelmodeID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_travelmodeID", (object)pk_travelmodeID, DbType.Int64);

            int result = DataBaseFactory.QuerySP("LTRN_TravelMode_Mst_Del", dynamicParameters, "Delete");

            return result > 0; // Return true if rows were affected
        }


        public async Task<TravelModeMasterModel> GetByIdAsync(long pk_travelmodeID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_travelmodeID", (object)pk_travelmodeID, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TravelModeMasterModel>("[LTRN_TravelMode_Mst_Edit]", (object)dynamicParameters, "Master - GetById").FirstOrDefault<TravelModeMasterModel>();
        }

        public async Task<bool> UpdateTravelRateAsync(long pk_travelmodeID, TrvlModelUpd dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            // Serialize the complete dataMst object (contains RentMst + RentDetailMst)
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);



            // Add parameters
            dynamicParameters.Add("@pk_travelmodeID", pk_travelmodeID, DbType.Int64);
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            
           Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("LTRN_TravelMode_Mst_Upd", dynamicParameters, "upd");

            return result > 0;
        }


    }
}
