using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class ScheduleInterviewRepository : IScheduleInterviewRepository
    {

        public async Task<bool> InsertScheduleInterview(ScheduleIntervieDataSet Data)
        {
            // Create DynamicParameters for the stored procedure
             DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(Data);

            dynamicParameters.Add("@Doc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_jobid", Data.ScheduleInterviewInsData[0].fk_jobid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", Data.ScheduleInterviewInsData[0].Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", Data.ScheduleInterviewInsData[0].Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Execute the stored procedure
            int rowsAffected =  DataBaseFactory.QuerySP("REC_Schedule_Interview_Ins", dynamicParameters, "ScheduleInterview_Insert");
            // Return true if rows were affected
            return rowsAffected > 0;
        }





        public async Task<(List<ScheduleInterviewGetData>,dateData) > GetScheduleInterviewById(string fk_jobid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_jobid", fk_jobid, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<ScheduleInterviewGetData, dateData>("REC_Schedule_Interview_SelForGrid", dynamicParameters, "REC_Screening_App_SelForGrid");

            List<ScheduleInterviewGetData> CandidateDetails = new List<ScheduleInterviewGetData>(); // Initialize properly

                dateData dateData = null;
                if (tuple != null)
                {
                    if (tuple.Item1 != null)
                    {
                        CandidateDetails = tuple.Item1.ToList();
                        //int candidateCount = CandidateDetails.Count;
                    }
                    if (tuple.Item2 != null)
                    {
                        dateData = tuple.Item2.FirstOrDefault();  // Fetch all leave details
                    }
                }
                 return (CandidateDetails, dateData);
        }



    




    }
}
