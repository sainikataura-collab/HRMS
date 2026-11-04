using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class InterviewEvaluationRepository:IInterviewEvaluationRepository
    {

        public async Task<bool> Insert(ScoringSheetXmlModel dataMst, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);


            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("Rec_Filling_ScoringSheet_ByScreeningCom_Ins", dynamicParameters, "Ins");

            return result > 0;
        }


        public async Task<bool> Update(ScoringSheetXmlModel dataMst, string fk_recId, string Fk_UserID, string Fk_LocID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            string xmlData = XmlUtility.XmlSerializeToString(dataMst);
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Fk_RecId", fk_recId, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);
            dynamicParameters.Add("@Timestamp", (object)dataMst.ScoringSheets.Timestamp, DbType.Binary);

            Console.WriteLine("Update XML:\n" + xmlData);

            int result = DataBaseFactory.QuerySP("Rec_Filling_ScoringSheet_ByScreeningCom_Upd", dynamicParameters, "Upd");
            return result > 0;
        }
        public async Task<ScoringSheetEditModel> GetById(string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_recId", fk_recId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<Filling_ScoringSheet, Candidate_Interview_ByScreeningCommittee>("Rec_Filling_ScoringSheet_ByScreeningCom_Edit", dynamicParameters, "GetAll");

            var result = new ScoringSheetEditModel();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.ScoringSheetList = tuple.Item1.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.Interviews = tuple.Item2.ToList();
            }
           

            return result;
        }

        public async Task<bool> DeleteAsync(string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Fk_RecId", (object)fk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("Rec_Filling_ScoringSheet_ByScreeningCom_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<IEnumerable<dynamic>> GetAll(string Fk_RecId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Fk_RecId", (object)Fk_RecId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<dynamic>("REC_Filling_ScoringSheet_Candidate_SelForGrid", dynamicParameters, "Get All");
        }
       public async Task<(List<NameValue>, List<NameValue>)> GetDropdown(string fk_jobId)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_jobId", fk_jobId, DbType.String, ParameterDirection.Input);

            var tuple = DataBaseFactory.QueryMultipleSP<NameValue, NameValue>(
                "REC_Shortlisted_Candidates_ByJobId_Sel",
                dynamicParameters,
                "GetDropdownList"
            );

            List<NameValue> selectedCandidates = new();
            List<NameValue> interviewers = new();

            if (tuple != null)
            {
                selectedCandidates = tuple.Item1?.ToList() ?? new List<NameValue>();
                interviewers = tuple.Item2?.ToList() ?? new List<NameValue>();
            }

            return (selectedCandidates, interviewers);
        }



        public async Task<InterviewRoundDto> GetInterviewRoundsAsync(string jobId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Pk_JobId", jobId, DbType.String);

            // QuerySP<InterviewRoundDto> returns List<InterviewRoundDto>:
            var dtoList = DataBaseFactory.QuerySP<InterviewRoundDto>(
                "REC_Open_Newjob_Edit",
                parameters,
                "Get"
            );

            // Pull out the integer (or zero if none):
            int roundCount = dtoList
                .Select(d => d.InterviewRound)
                .FirstOrDefault();

            // Build your 1…N list:
            var rounds = (roundCount > 0)
                ? Enumerable.Range(1, roundCount).ToList()
                : new List<int>();

            InterviewRoundDto obj = new InterviewRoundDto()
            {
                InterviewRoundList = rounds,
               Job_opening_date = dtoList
                .Select(d => d.Job_opening_date)
                .FirstOrDefault(),
                Job_closing_date = dtoList
                .Select(d => d.Job_closing_date)
                .FirstOrDefault(),
            };

         
            return (obj);
        }
    }

}
