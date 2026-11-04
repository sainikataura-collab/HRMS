using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace HRMSWebAPI.Repository
{
    public class CandidateRepository:ICandidateRepository
    {

        public async Task<bool> InsertCandidateAsync(CandidateMst candidateList, string fk_companyId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap the candidate object in the dataset wrapper
                CandidateMstDataset dataset = new CandidateMstDataset
                {
                    Candidates = candidateList
                };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

                var result = DataBaseFactory.QuerySP("HR_Candidate_Ins", dynamicParameters);
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Error: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> UpdateCandidateAsync(long? pk_formatid, CandidateMst candidate)
        {
            try
            {
                var dynamicParameters = new DynamicParameters();

                // Wrap the candidate object in the dataset wrapper
                var dataset = new CandidateMstDataset
                {
                    Candidates = candidate
                };

                // Serialize the dataset to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters for stored procedure
                dynamicParameters.Add("@pk_formatid", pk_formatid, DbType.Int64);
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
              
                var result = DataBaseFactory.QuerySP("HR_Candidate_Upd", dynamicParameters);
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Update Error: " + ex.Message);
                return false;
            }
        }



        //get All
        public async Task<(int totalCount, IEnumerable<CandidateMst>)>GetAll(int pageindex, int pagesize, string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CandidateMst>("HR_Candidate_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<CandidateMst> GetByIdAsync(long pk_formatid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_formatid", (object)pk_formatid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<CandidateMst>("HR_Candidate_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<CandidateMst>();
        }

        public async Task<bool> DeleteAsync(long pk_formatid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_formatid", (object)pk_formatid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_Candidate_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }
        public async Task<CandidateKeyValidationDto> GetCandidateByKey(string candidateKey)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@candidateKey", candidateKey, DbType.String);

            var result = DataBaseFactory.QuerySP<CandidateKeyValidationDto>(
                "REC_Candidate_GetByKey",
                dynamicParameters,
                "Candidate_GetByKey").FirstOrDefault();

            return result;
        }
    }

}
