using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.Common;
using static HRMSWebAPI.Models.CompanyConfigMst;

namespace HRMSWebAPI.Repository
{
    public class CompanyConfigRepository: ICompanyConfigRepository
    {

        //for get all
        public async Task<(int totalCount, IEnumerable<CompanyConfigResult>)> GetAll(int pageIndex, int pageSize, string Fk_UserID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, DbType.String); // assuming fk_empid is for user ID

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CompanyConfigResult>("SAL_CompanyConfig_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }
        // for the insert
        public async Task<bool> InsertCompanyConfigAsync(CompanyConfigXmlModel model, string Fk_UserID, string Fk_LocID)
        {
            try
            {
                // Serialize the CompanyConfigXmlModel to XML
                string xmlData = XmlUtility.XmlSerializeToString(model);

                // Set up the parameters for the stored procedure
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@Doc", xmlData, DbType.String);
                dynamicParameters.Add("@Fk_UserID",(object)Fk_UserID, DbType.String); // assuming fk_empid is for user ID
                dynamicParameters.Add("@Fk_LocID",(object)Fk_LocID, DbType.String); // assuming regno is for location ID

                // Call stored procedure
                var result = DataBaseFactory.QuerySP("SAL_CompanyConfig_Ins", dynamicParameters);

                // If result is greater than 0, insertion was successful
                return result > 0;
            }
            catch (Exception ex)
            {
                // Log exception
                Console.WriteLine("Insert Error: " + ex.Message);
                return false;
            }
        }

        public async Task<GetByIdResult> GetSectionByIdAsync(string pk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_companyId", (object)pk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            // return DataBaseFactory.QuerySP<GetByIdResult>("SAL_CompanyConfig_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<GetByIdResult>();



            //var tuple = DataBaseFactory.QueryMultipleSP<SAL_Company_Config, Common_Client_Details>("SAL_CompanyConfig_Edit", dynamicParameters, "GetAll");
            //added code LR
            var tuple = DataBaseFactory.QueryMultipleSP<SAL_Company_Config, Common_Client_Details, SAL_Company_Config_OTGrossHead, SAL_Company_Config_OtherRateHead>("SAL_CompanyConfig_Edit", dynamicParameters, "GetById");


            var result = new GetByIdResult();
            if (tuple != null && tuple?.Item1 != null)
            {
                result.SAL_Company_Config = tuple.Item1.FirstOrDefault();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.Common_Client_Details = tuple.Item2.FirstOrDefault();
            }
            //added code LR starts
            if (tuple != null && tuple?.Item3 != null)
            {
                result.OTGrossHeadList = tuple.Item3.ToList();
            }
            if (tuple != null && tuple?.Item4 != null)
            {
                result.OtherRateHeadList = tuple.Item4.ToList();
            }
            //added code LR ends


            return result;
        }


        public async Task<bool>UpdateCompanyConfig(CompanyConfigXmlModel model, string Fk_UserID, string Fk_LocID, string pk_companyId)
        {
            try
            {
                // Serialize the CompanyConfigXmlModel to XML
                string xmlData = XmlUtility.XmlSerializeToString(model);

                // Set up the parameters for the stored procedure
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_companyId", (object)pk_companyId, DbType.String);
                dynamicParameters.Add("@Doc", xmlData, DbType.String);
                dynamicParameters.Add("@Fk_UserID", (object)Fk_UserID, DbType.String); // assuming fk_empid is for user ID
                dynamicParameters.Add("@Fk_LocID", (object)Fk_LocID, DbType.String); // assuming regno is for location ID

                // Call stored procedure
                var result = DataBaseFactory.QuerySP("SAL_CompanyConfig_Upd", dynamicParameters);

                // If result is greater than 0, update was successful
                return result > 0;
            }
            catch (Exception ex)
            {
                // Log exception
                Console.WriteLine("Update Error: " + ex.Message);
                return false;
            }
        }

        public async Task<bool> UploadCompanyLogo(CompanyLogoUploadModel model)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                dynamicParameters.Add("@CompanyId", model.CompanyId, DbType.String);

                dynamicParameters.Add("@LogoName", model.LogoName, DbType.String);

                var result = DataBaseFactory.QuerySP("SAL_CompanyLogo_Ins", dynamicParameters);

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "Upload Logo Error : "
                    + ex.Message);

                return false;
            }
        }


        public async Task<bool> UploadCompanyStamp(CompanyStampUploadModel model)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                dynamicParameters.Add("@CompanyId", model.CompanyId, DbType.String);
                dynamicParameters.Add("@StampName", model.StampName, DbType.String);

                var result = DataBaseFactory.QuerySP("SAL_CompanyStamp_Ins", dynamicParameters);

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Upload Stamp Error : " + ex.Message);
                return false;
            }
        }

        public async Task<IsLMVendorExpenseResult> GetIsLMVendorExpenseAsync(string pk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add(
                "@pk_companyId",
                (object)pk_companyId,
                new DbType?(DbType.String),
                new ParameterDirection?(),
                new int?(),
                new byte?(),
                new byte?()
            );

            var result = DataBaseFactory
                .QuerySP<IsLMVendorExpenseResult>(
                    "SAL_ISLMVendorExpense",
                    (object)dynamicParameters,
                    "GetById"
                )
                .FirstOrDefault<IsLMVendorExpenseResult>();

            return result;
        }





    }
}
