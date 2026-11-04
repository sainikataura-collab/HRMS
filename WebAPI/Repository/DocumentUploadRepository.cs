using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.Common;
using System.Xml.Linq;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class DocumentUploadRepository: IDocumentUploadRepository
    {


        //public async Task<bool> InsertDocumentAsync(DocumentUpldRoot documentUpldRoot, string fk_insUserID, string Fk_LocID, string fk_companyId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Serialize to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(documentUpldRoot);

        //    // Add parameters
        //    dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@AppFilename", (object)documentUpldRoot.Upload_Documents.filename?.FileName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@AppContentType", (object)documentUpldRoot.Upload_Documents.contenttype, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_locid", (object)Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_userid", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

        //    // Execute stored procedure
        //    int result = DataBaseFactory.QuerySP("HR_Uploaddocument_Ins", dynamicParameters, "HR_Uploaddocument_Ins");

        //    return result > 0;
        //}

        public async Task<bool> InsertDocumentAsync(DocumentUpldRoot documentUpldRoot, string fk_insUserID, string Fk_LocID, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            string xmlData = XmlUtility.XmlSerializeToString(documentUpldRoot);

            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

            dynamicParameters.Add("@AppFilename", documentUpldRoot.Upload_Documents.SavedFileName ?? "", DbType.String);
            dynamicParameters.Add("@AppContentType", documentUpldRoot.Upload_Documents.contenttype ?? "", DbType.String);
            dynamicParameters.Add("@fk_locid", Fk_LocID, DbType.String);
            dynamicParameters.Add("@fk_userid", fk_insUserID, DbType.String);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);

            int result = DataBaseFactory.QuerySP("HR_Uploaddocument_Ins", dynamicParameters, "HR_Uploaddocument_Ins");
            return result > 0;
        }

        public async Task<bool> UpdateDocumentAsync(DocumentUpldRoot documentUpldRoot, string fk_userid, string fk_locid)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                string xmlData = XmlUtility.XmlSerializeToString(documentUpldRoot);
                dynamicParameters.Add("@pk_uploadId", documentUpldRoot.pk_uploadId);
                dynamicParameters.Add("@xmlDoc", xmlData);
                dynamicParameters.Add("@AppFilename", documentUpldRoot.Upload_Documents.SavedFileName ?? null);  // filename saved to disk
                dynamicParameters.Add("@AppContentType", documentUpldRoot.Upload_Documents.contenttype ?? "application/octet-stream");
                dynamicParameters.Add("@UpdAppChange", documentUpldRoot.UpdAppChange);
                dynamicParameters.Add("@fk_locid", fk_locid);
                dynamicParameters.Add("@fk_userid", fk_userid);
                dynamicParameters.Add("@Timestamp", (object)documentUpldRoot.Timestamp, DbType.Binary); // Assuming timestamp is stored as byte[]
                int result = DataBaseFactory.QuerySP("HR_Uploaddocument_Upd", dynamicParameters, "HR_Uploaddocument_Upd");
                return result > 0;

            }
            catch (Exception ex)
            {
                // Optionally log the error
                throw new Exception("Error updating document", ex);
            }
        }


        public async Task<(int totalCount, IEnumerable<Upload_getAll>)> GetAll(int pageIndex, int pageSize, string? fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, Upload_getAll>("HR_Uploaddocument_SelForGrid", dynamicParameters, "HR_Uploaddocument_SelForGrid");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }


        public async Task<(Upload_Documents?, List<Upload_trn>)> GetById(long pk_uploadId)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_uploadId", pk_uploadId, DbType.Int64, ParameterDirection.Input);

            // Use the stored procedure name and parameters
            var tuple = DataBaseFactory.QueryMultipleSP<Upload_Documents, Upload_trn>(
                "HR_Uploaddocument_Edit",  
                dynamicParameters,
                "HR_Uploaddocument_Edit"                 
            );

            // Extract the 3 result sets
            //GetbyidModelTempMassage TempMessage = null;
            //GetbyidModelMassage SalaryMessage= null;
            Upload_Documents DocumenteData = new();
            List<Upload_trn> DepartmentList = new();

            if (tuple != null)
            {
                DocumenteData = tuple.Item1?.FirstOrDefault();
                DepartmentList = tuple.Item2?.ToList();

            }

            return (DocumenteData, DepartmentList);
        }


        public async Task<bool> DeleteAsync(long pk_uploadId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_uploadId", (object)pk_uploadId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_Uploaddocument_Del", dynamicParameters, "HR_Uploaddocument_Del");
            return n > 0; // Return true if rows were affected
        }



    }
}
