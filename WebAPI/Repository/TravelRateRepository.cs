using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class TravelRateRepository:ITravelRateRepository
    {

        public async Task<bool> Insert(TravelRateMstXmlModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            // Serialize the complete dataMst object (contains RentMst + RentDetailMst)
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);



            // Add parameters
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("LTRN_Rate_Mst_Ins", dynamicParameters, "Ins");

            return result > 0;
        }

        public async Task<List<LTRN_Rate_Mst_SelforgridModel>> LTRN_Rate_Mst_Selforgrid(string pk_RateID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_RateID", (object)pk_RateID, DbType.String);

            var result = DataBaseFactory.QuerySP<LTRN_Rate_Mst_SelforgridModel>(
                "LTRN_Rate_Mst_Selforgrid",
                dynamicParameters,
                "Maste grid");

            return await Task.FromResult(result.ToList());
        }
        public async Task<bool> DeleteAsync(long pk_RateID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_RateID", (object)pk_RateID, DbType.Int64);

            int result = DataBaseFactory.QuerySP("LTRN_Rate_Mst_Del", dynamicParameters, "Delete");

            return result > 0; // Return true if rows were affected
        }
        public async Task<TravelRateMst> GetByIdAsync(long pk_RateID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_RateID", (object)pk_RateID, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TravelRateMst>("LTRN_Rate_Mst_Edit", (object)dynamicParameters, "Master - GetById").FirstOrDefault<TravelRateMst>();
        }

        public async Task<bool> UpdateTravelRateAsync(long pk_RateID, TravelRateMstXmlModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            // Serialize the complete dataMst object (contains RentMst + RentDetailMst)
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);



            // Add parameters
            dynamicParameters.Add("@pk_RateID", pk_RateID, DbType.Int64);
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("LTRN_Rate_Mst_Upd", dynamicParameters, "upd");

            return result > 0;
        }



    }
}
