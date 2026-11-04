using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class LodgingBoardingRepository:ILodgingBoardingRepository
    {
        public async Task<bool> Insert(LodgingBoardingXmlModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            // Serialize the complete dataMst object (contains RentMst + RentDetailMst)
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);



            // Add parameters
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           
            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("LTRN_LodgingBoarding_Mst_Ins", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> Update(int pk_lodgingboardingId,LodgingBoardingXmlModel dataMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            // Serialize the complete dataMst object (contains RentMst + RentDetailMst)
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);



            // Add parameters
            dynamicParameters.Add("@pk_lodgingboardingId", pk_lodgingboardingId, DbType.Int64);
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("LTRN_LodgingBoarding_Mst_Upd", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<LodgingBoardingMst> GetByIdAsync(int pk_lodgingboardingId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_lodgingboardingId", (object)pk_lodgingboardingId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<LodgingBoardingMst>("LTRN_LodgingBoarding_Mst_Edit", (object)dynamicParameters, "Master - GetById").FirstOrDefault<LodgingBoardingMst>();
        }

        public async Task<bool> DeleteAsync(int pk_lodgingboardingId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_lodgingboardingId", (object)pk_lodgingboardingId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("LTRN_LodgingBoarding_Mst_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<List<LodgingBoardingMstGrid>> GetLodgingBoardingForGrid(int pk_lodgingboardingId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_lodgingboardingId", (object)pk_lodgingboardingId, DbType.Int64);

            var result = DataBaseFactory.QuerySP<LodgingBoardingMstGrid>(
                "LTRN_LodgingBoarding_Mst_Selforgrid",
                dynamicParameters,
                "Master - LodgingBoarding grid");

            return await Task.FromResult(result.ToList());
        }

    }
}
