using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class SelectedCandidatesRepository : ISelectedCandidatesRepository
    {
        public async Task<bool> UpdateFinalSelectionStatus(SelectedCandidatesMstDataSet Data)
        {
            // Create DynamicParameters for the stored procedure
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Convert the data to XML string
            string xmlData = XmlUtility.XmlSerializeToString(Data);
            dynamicParameters.Add("@Doc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Data.Candidates[0].Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", Data.Candidates[0].Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute the stored procedure
            int rowsAffected = DataBaseFactory.QuerySP("REC_Final_Selection_Status_Upd", dynamicParameters, "FinalSelectionStatus_Update");
            // Return true if rows were affected
            return rowsAffected > 0;
        }

        public async Task<(List<FinalSelectedCandidatesData>, SelectedCandidateData)> GetFinalSelectedCandidatesByJobId(string fk_jobid)
        {
            // Setup parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_jobid", fk_jobid, DbType.String);

            // Call the stored procedure and get multiple result sets
            var tuple = DataBaseFactory.QueryMultipleSP<FinalSelectedCandidatesData, SelectedCandidateData>(
                "REC_Final_Selection_Status_SelForGrid",
                dynamicParameters,
                "FinalSelectedCandidates_Result"
            );
            // Declare the result containers
            List<FinalSelectedCandidatesData> selectedCandidatesList = new List<FinalSelectedCandidatesData>();
            SelectedCandidateData selectedCandidateMeta = null;
            // Populate results if data is available
            if (tuple != null)
            {
                if (tuple.Item1 != null)
                {
                    selectedCandidatesList = tuple.Item1.ToList();
                }

                if (tuple.Item2 != null)
                {
                    selectedCandidateMeta = tuple.Item2.FirstOrDefault();
                }
            }
            // Return both lists as a tuple
            return (selectedCandidatesList, selectedCandidateMeta);
        }


    }
}
