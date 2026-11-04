using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
using static HRMSWebAPI.Models.CandidateMedicalMst;

namespace HRMSWebAPI.Repository
{
    public class CandidateMedicalRepository : ICandidateMedicalRepository
    {
        public async Task<CandidateDetailData> GetCandidateDetailsByIdAsync(string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_recId", (object)fk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<CandidateDetailData>("REC_Candidate_Details_ForRefMed", (object)dynamicParameters, "Candidate Detail - GetById").FirstOrDefault<CandidateDetailData>();
        }

        public async Task<Candidate_MedicalDetails> GetCandidate_MedicalsByIdAsync(long pk_mtrnid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_mtrnid", (object)pk_mtrnid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<Candidate_MedicalDetails>("REC_Candidate_Medical_Edit", (object)dynamicParameters, "Candidate_Medical - GetById").FirstOrDefault<Candidate_MedicalDetails>();
        }


        public async Task<(int totalCount, IEnumerable<Candidate_MedicalDetails>)> GetAllCandidateMedicalsAsync(int pageIndex, int pageSize, string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_recId", (object)fk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, Candidate_MedicalDetails>("REC_Candidate_Medical_SelForGrid", dynamicParameters, "Candidate_MedicalDetails_GetAll");

            if (tuple == null || tuple.Item2 == null) return (0, []);

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                             ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<bool> DeleteCandidateMedicalAsync(long pk_mtrnid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("pk_mtrnid", (object)pk_mtrnid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_Candidate_Medical_Del", dynamicParameters, "CandidateMedical_Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertCandidateMedicalAsync(Candidate_MedicalDetailsDataSet medicalDataSet)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            string xmlData = XmlUtility.XmlSerializeToString(medicalDataSet); // Serialize to XML
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            int result = DataBaseFactory.QuerySP("REC_Candidate_Medical_Ins", dynamicParameters, "Candidate_Medical_Insert");

            return result > 0;
        }

        public async Task<bool> UpdateCandidateMedicalAsync(Candidate_MedicalDetailsDataSet medicalDataSet)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Serialize the dataset to XML
            string xmlData = XmlUtility.XmlSerializeToString(medicalDataSet);

            // Extract first record for pk_mtrnid (as SP updates by one primary key
            // Add parameters in your preferred format
            dynamicParameters.Add("@pk_mtrnid", (object)medicalDataSet.Candidate_MedicalDetails.pk_mtrnid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // Log the generated XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute the stored procedure
            int result = DataBaseFactory.QuerySP("REC_Candidate_Medical_Upd", dynamicParameters, "Candidate_Medical_Update");

            return result > 0;
        }







        public async Task<CandidateReferenceDetails> GetCandidateReferenceByIdAsync(long pk_rtrnid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_rtrnid", (object)pk_rtrnid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<CandidateReferenceDetails>("REC_Candidate_Reference_Edit", (object)dynamicParameters, "Candidate_Medical - GetById").FirstOrDefault<CandidateReferenceDetails>();
        }

        public async Task<(int totalCount, IEnumerable<CandidateReferenceDetails>)> GetAllCandidateReferencesAsync(int pageIndex, int pageSize, string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_recId", (object)fk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CandidateReferenceDetails>("REC_Candidate_Reference_SelForGrid", dynamicParameters, "Candidate_Reference_GetAll");

            if (tuple == null || tuple.Item2 == null) return (0, []);

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                             ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<bool> DeleteCandidateReferenceAsync(long pk_rtrnid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("pk_rtrnid", (object)pk_rtrnid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_Candidate_Reference_Del", dynamicParameters, "CandidateReference_Delete");

            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> InsertCandidateReferenceAsync(CandidateReferenceDetailsDataSet reference)
        {
            
            string xmlData = XmlUtility.XmlSerializeToString(reference);
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(int.MaxValue), new byte?(), new byte?());
            dynamicParameters.Add("@Filename", (object)reference.CandidateReferenceDetails.attachment, new DbType?(DbType.String), new ParameterDirection?(), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@FileContentType", (object)reference.CandidateReferenceDetails.FileContentType, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());

            // Execute stored procedure
            int n = DataBaseFactory.QuerySP("REC_Candidate_Reference_Ins", dynamicParameters, "Insert Candidate Reference");
            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> UpdateCandidateReferenceAsync(CandidateReferenceDetailsDataSet reference)
        {
            // XML serialize the dataset
            string xmlData = XmlUtility.XmlSerializeToString(reference);

            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_rtrnid", (object)reference.CandidateReferenceDetails.pk_rtrnid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(int.MaxValue), new byte?(), new byte?());
            dynamicParameters.Add("@Filename", (object)reference.CandidateReferenceDetails.attachment, new DbType?(DbType.String), new ParameterDirection?(), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@FileContentType", (object)reference.CandidateReferenceDetails.FileContentType, new DbType?(DbType.String), new ParameterDirection?(), new int?(50), new byte?(), new byte?());

            // Execute stored procedure
            int n = DataBaseFactory.QuerySP("REC_Candidate_Reference_Upd", dynamicParameters, "Update Candidate Reference");

            return n > 0; // Return true if update successful
        }










    }
}
