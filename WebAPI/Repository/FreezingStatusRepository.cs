using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class FreezingStatusRepository : IFreezingStatusRepository
    {
        public async Task<bool> UpdateFreezingFinalStatus(FreezingFinalStatusDataSet Data)
        {
            // Create DynamicParameters for the stored procedure
            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(Data);
            dynamicParameters.Add("@Doc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Data.Candidates[0].Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", Data.Candidates[0].Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute the stored procedure
            int rowsAffected = DataBaseFactory.QuerySP("REC_Freezing_FinalStatus_Upd", dynamicParameters, "FreezingFinalStatus_Insert");
            // Return true if rows were affected
            return rowsAffected > 0;
        }

        public async Task<(List<FinalStatusFreezingData>, FreezingdateData)> GetFreezingFinalStatusByJobId(string fk_jobid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_jobid", fk_jobid, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<FinalStatusFreezingData, FreezingdateData>(
                "REC_Freezing_FinalStatus_SelForGrid",
                dynamicParameters,
                "REC_Freezing_FinalStatus_SelForGrid_Result"
            );

            List<FinalStatusFreezingData> FinalStatusList = new List<FinalStatusFreezingData>();
            FreezingdateData FreezingdateData = null;

            if (tuple != null)
            {
                if (tuple.Item1 != null)
                {
                    FinalStatusList = tuple.Item1.ToList();
                }

                if (tuple.Item2 != null)
                {
                    FreezingdateData = tuple.Item2.FirstOrDefault();
                }
            }

            return (FinalStatusList, FreezingdateData);
        }


    }
}
