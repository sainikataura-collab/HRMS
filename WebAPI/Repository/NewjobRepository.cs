using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Newtonsoft.Json;
using System.Data;
using System.Linq;
using static iTextSharp.text.pdf.AcroFields;

namespace HRMSWebAPI.Repository
{
    public class NewjobRepository : INewjobRepository
    {
        public async Task<bool> InsertDocumentAsync(NewjobMstDataSet NewjobMstDataSet, string Fk_LocID, string fk_userid, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            string xmlData = XmlUtility.XmlSerializeToString(NewjobMstDataSet);

            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@AppFilename", NewjobMstDataSet.NewjobMst.AppFilename ?? "", DbType.String);
            dynamicParameters.Add("@AppContentType", NewjobMstDataSet.NewjobMst.Appcontenttype ?? "", DbType.String);
            dynamicParameters.Add("@JobFilename", NewjobMstDataSet.NewjobMst.JobFilename ?? "", DbType.String);
            dynamicParameters.Add("@JobContentType", NewjobMstDataSet.NewjobMst.Jobcontenttype ?? "", DbType.String);
            dynamicParameters.Add("@fk_locid", Fk_LocID, DbType.String);
            dynamicParameters.Add("@fk_userid", fk_userid, DbType.String);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            int result = DataBaseFactory.QuerySP("REC_Open_Newjob_Ins", dynamicParameters, "Open_Newjob_Ins");
            return result > 0;
        }



        public async Task<(int totalCount, IEnumerable<NewjobMst>)> GetAllOpenJobsAsync(int pageIndex, int pageSize, string companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, NewjobMst>(
                "REC_Open_Newjob_SelForGrid", dynamicParameters, "Open Job - GetAll");

            if (tuple == null || tuple.Item2 == null)
                return (0, new List<NewjobMst>());

            // Convert TotalCount
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                : 0;

            return (totalCount, tuple.Item2?.ToList());
        }

        //public async Task<Result> GetOpenNewJobByIdAsync(string jobId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@Pk_JobId", (object)jobId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());

        //    return DataBaseFactory.QuerySP<Result>("REC_Open_Newjob_Edit", dynamicParameters, "Get Open New Job By ID")
        //        .FirstOrDefault<Result>();
        //}

        public async Task<NewjobResult> GetOpenNewJobByIdAsync(string jobId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_JobId", jobId, DbType.String);
            var tuple = DataBaseFactory.QueryMultipleSP<NewjobMst, NewjobQualification, NewjobSpecialization, NewjobInterviewPanel>("REC_Open_Newjob_Edit", dynamicParameters, "GetAll");

            var result = new NewjobResult();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.NewjobMst = tuple.Item1.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.NewjobQualification = tuple.Item2.ToList();
            }
            if (tuple != null && tuple?.Item3 != null)
            {
                result.NewjobSpecialization = tuple.Item3.ToList();
            }

            if (tuple != null && tuple?.Item4 != null)
            {
                result.NewjobInterviewPanel = tuple.Item4.ToList();
            }

            return result;
        }

        public async Task<bool> UpdateNewJobAsync(NewjobMstDataSet newjobMstDataSet)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            // Serialize the dataset to XML
            string xmlData = XmlUtility.XmlSerializeToString(newjobMstDataSet);

            // Add parameters for the stored procedure
            dynamicParameters.Add("@pk_JobId", (object)newjobMstDataSet.NewjobMst.pk_JobId, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@AppFilename", (object)newjobMstDataSet.NewjobMst.AppFilename, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@AppContentType", (object)newjobMstDataSet.NewjobMst.Appcontenttype, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
           // dynamicParameters.Add("@AppAttachment", (object)newjobMstDataSet.NewjobMst.Appattachment, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@UpdAppChange", (object)newjobMstDataSet.NewjobMst.UpdAppChange, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@JobFilename", (object)newjobMstDataSet.NewjobMst.JobFilename, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@JobContentType", (object)newjobMstDataSet.NewjobMst.Jobcontenttype, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            //dynamicParameters.Add("@JobAttachment", (object)newjobMstDataSet.NewjobMst.Jobattachment, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@UpdJobChange", (object)newjobMstDataSet.NewjobMst.UpdJobChange, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)newjobMstDataSet.NewjobMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)newjobMstDataSet.NewjobMst.fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(100), new byte?(), new byte?());

            // Log the generated XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute the stored procedure
            int result = DataBaseFactory.QuerySP("REC_Open_Newjob_Upd", dynamicParameters, "NewJob_Update");
            return result > 0;
        }

        public async Task<bool> DeleteOpenNewJobAsync(string jobId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_JobId", (object)jobId, new DbType?(DbType.String), new ParameterDirection?(), new int?(15), new byte?(), new byte?());

            // Execute stored procedure for delete
            int result = DataBaseFactory.QuerySP("REC_Open_Newjob_Del", dynamicParameters, "Delete Open New Job");
            return result > 0; // Return true if rows were affected
        }



    }
}
