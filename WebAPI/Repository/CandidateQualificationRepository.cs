using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CandidateQualificationRepository : ICandidateQualificationRepository
    {
        public async Task<bool> InsertCandidateQualification(CandidateQualificationDetails qualificationDetails)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            CandidateQualificationDetailsDataSet dataset = new CandidateQualificationDetailsDataSet
            {
                qualificationDetails = qualificationDetails
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP(
                "REC_CandidateQualif_Ins",
                dynamicParameters,
                "CandidateQualification_Insert"
            );

            return result > 0;
        }

        public async Task<(int totalCount, IEnumerable<CandidateQualificationDetails>)> GetAll(
    int pageIndex, int pageSize, string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_recId", fk_recId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CandidateQualificationDetails>(
                "REC_CandidateQualif_SelForGrid",
                dynamicParameters,
                "CandidateQualification_GetAll"
            );

            if (tuple == null || tuple.Item2 == null) return (0, new List<CandidateQualificationDetails>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<CandidateQualificationDetails> GetById(long pk_cqualid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cqualid", pk_cqualid, DbType.Int64);

            return DataBaseFactory.QuerySP<CandidateQualificationDetails>(
                "REC_CandidateQualif_Edit",
                dynamicParameters,
                "CandidateQualification_GetById"
            ).FirstOrDefault();
        }

        public async Task<bool> DeleteCandidateQualificationAsync(long pk_cqualid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cqualid", pk_cqualid, DbType.Int64);

            int n = DataBaseFactory.QuerySP(
                "REC_CandidateQualif_Del",
                dynamicParameters,
                "CandidateQualification_Delete"
            );

            return n > 0;
        }

        public async Task<bool> UpdateCandidateQualification(CandidateQualificationDetails qualificationDetails)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            CandidateQualificationDetailsDataSet dataset = new CandidateQualificationDetailsDataSet
            {
                qualificationDetails = qualificationDetails
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@pk_cqualid", qualificationDetails.pk_cqualid, DbType.Int64);
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Timestamp", qualificationDetails.Timestamp, DbType.Binary);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP(
                "REC_CandidateQualif_Upd",
                dynamicParameters,
                "CandidateQualification_Update"
            );

            return result > 0;
        }
    }
}