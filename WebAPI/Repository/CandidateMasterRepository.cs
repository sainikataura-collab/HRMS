using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CandidateMasterRepository : ICandidateMasterRepository
    {
        public async Task<(int totalCount, IEnumerable<CandidateMasterMst>)> GetAll(int pageindex, int pagesize, string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@searchTerm", (object)searchTerm, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CandidateMasterMst>("REC_Candidate_SelForGridNew", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<bool> DeleteAsync(string pk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recId", (object)pk_recId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_Candidate_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<Response> GetById(string pk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_recId", pk_recId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<Mst1, Mst2, Mst3, Mst4>("REC_Candidate_Edit", dynamicParameters, "GetAll");

            var result = new Response();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.Mst1 = tuple.Item1.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.Mst2 = tuple.Item2.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item3 != null)
            {
                result.Mst3 = tuple.Item3.FirstOrDefault();
            }

            if (tuple != null && tuple?.Item4 != null)
            {
                result.Mst4 = tuple.Item4.FirstOrDefault();
            }

            return result;
        }


        public async Task<bool> InsertAsync(Mst1 Model, string fk_locid, string fk_userid, string fk_companyId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                //Serialize the model to XML
                //string xmlData = XmlUtility.XmlSerializeToString(model);

                CandidateXmlModel dataset = new CandidateXmlModel { Mst1 = Model };

                string xmlData = XmlUtility.XmlSerializeToString(dataset);



                // Add required parameters
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@fk_locid", fk_locid, DbType.String);
                dynamicParameters.Add("@fk_userid", fk_userid, DbType.String);
                dynamicParameters.Add("@fk_companyid", fk_companyId, DbType.String);

                //  Add file attachment parameters from Mst1


                dynamicParameters.Add("@Filename", Model.filename, DbType.String);
                dynamicParameters.Add("@FileContentType", Model.contenttype, DbType.String);
                dynamicParameters.Add("@FileAttachment", Model.attachment, DbType.Binary);

                //Add picture attachment parameters
                dynamicParameters.Add("@PicFilename", Model.picturename, DbType.String);
                dynamicParameters.Add("@PicContentType", Model.picturetype, DbType.String);
                dynamicParameters.Add("@PicAttachment", Model.pictureattachment, DbType.Binary);

                // Call the stored procedure
                var result = DataBaseFactory.QuerySP("REC_Candidate_Ins", dynamicParameters);

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Candidate Error: " + ex.Message);
                return false;
            }
        }





        public async Task<bool> Update(Mst1 Model, string pk_recId, string fk_locid, string fk_userid)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                CandidateXmlModel dataset = new CandidateXmlModel { Mst1 = Model };

                string xmlData = XmlUtility.XmlSerializeToString(dataset);



                // Add required parameters
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@pk_recId", pk_recId, DbType.String);
                dynamicParameters.Add("@fk_locid", fk_locid, DbType.String);
                dynamicParameters.Add("@fk_userid", fk_userid, DbType.String);
                dynamicParameters.Add("@Timestamp", Model.Timestamp, DbType.Binary);

                //  Add file attachment parameters from Mst1


                dynamicParameters.Add("@Filename", Model.filename, DbType.String);
                dynamicParameters.Add("@FileContentType", Model.contenttype, DbType.String);
                dynamicParameters.Add("@FileAttachment", Model.attachment, DbType.Binary);
                dynamicParameters.Add("@UpdFileChange", Model.UpdFileChange, DbType.String);

                //Add picture attachment parameters
                dynamicParameters.Add("@PicFilename", Model.picturename, DbType.String);
                dynamicParameters.Add("@PicContentType", Model.picturetype, DbType.String);
                dynamicParameters.Add("@PicAttachment", Model.pictureattachment, DbType.Binary);
                dynamicParameters.Add("@UpdPicChange", Model.UpdPicChange, DbType.String);

                // Call the stored procedure
                var result = DataBaseFactory.QuerySP("REC_Candidate_Upd", dynamicParameters);

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Candidate Error: " + ex.Message);
                return false;
            }
        }

        public async Task<IEnumerable<dynamic>> GetbyEmialorMobile(string EmailOrMobile)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@EmailOrMobile", (object)EmailOrMobile, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<dynamic>("REC_GetCandidateStatusByEmailOrMobile", dynamicParameters, "BY mob or email");
        }

        //added code

        //7dec
        public async Task<bool> UpdateOnboardingStatusInitiated(string pk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Add parameters
            dynamicParameters.Add("@pk_recId", pk_recId, DbType.String);
            dynamicParameters.Add("@Status", "Initiated", DbType.String);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync(
                "REC_Candidate_UpdateOnboardingStatus",
                dynamicParameters,
                "Update_Onboarding_Status_Initiated"
            );

            return true;
        }

    }


}
