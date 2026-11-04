using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ScreeningAppRepository: IScreeningAppRepository
    {



        public async Task<(List<ScreenedApplicationGetData>, jobdata,int)> GetScreeningAppById(string fk_jobid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_jobid", (object)fk_jobid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<ScreenedApplicationGetData, jobdata>("REC_Screening_App_SelForGrid",dynamicParameters,"REC_Screening_App_SelForGrid");

            List<ScreenedApplicationGetData> CandidateDetails = new List<ScreenedApplicationGetData>(); // Initialize properly
           
            jobdata jobdata = null;
            if (tuple != null)
            {
                if (tuple.Item1 != null)
                {
                    CandidateDetails = tuple.Item1.ToList();
                    //int candidateCount = CandidateDetails.Count;
                }
                if (tuple.Item2 != null)
                {
                    jobdata = tuple.Item2.FirstOrDefault();  // Fetch all leave details
                }
            }
            int candidateCount = CandidateDetails.Count;

            return (CandidateDetails, jobdata, candidateCount);
        }




        public async Task<bool> Update(ScreeningAppGenNode screeningAppGenNode, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            
            string xmlData = XmlUtility.XmlSerializeToString(screeningAppGenNode);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            //dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("REC_Screening_App_Accepted_Rejected_Upd", dynamicParameters, "Screening_App");

            return result > 0;
        }
    }
}
