using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Org.BouncyCastle.Ocsp;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class RecruitModeRepository : IRecruitModeRepository
    {

        public async Task<bool> InsertAsync(RecruitModeMst recruitModeMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)recruitModeMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@type", (object)recruitModeMst.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@isActive", (object)recruitModeMst.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@name", (object)recruitModeMst.name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)recruitModeMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)recruitModeMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_RecruitmentMode_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }

        public async Task<bool> UpdateAsync(RecruitModeMst recruitModeMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recmodeid", (object)recruitModeMst.pk_recmodeid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@description", (object)recruitModeMst.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@type", (object)recruitModeMst.type, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@isActive", (object)recruitModeMst.isActive, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@name", (object)recruitModeMst.name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)recruitModeMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?());

            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("SAL_RecruitmentMode_Upd", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }

        public async Task<(int totalCount, IEnumerable<RecruitModeMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, RecruitModeMst>("SAL_RecruitmentMode_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<RecruitModeMst> GetByIdAsync(string pk_recmodeid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recmodeid", (object)pk_recmodeid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<RecruitModeMst>("SAL_RecruitmentMode_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<RecruitModeMst>();
        }
        public async Task<bool> DeleteAsync(string pk_recmodeid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recmodeid", (object)pk_recmodeid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_RecruitmentMode_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }


        //shiv


        public async Task<(dynamic summary, List<dynamic> KRAEvaluation, List<dynamic> BehavioralAttributes)> GetEmployeeAttendanceByEmpIdYearAsync(string empId, string year)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_empId", empId);
            parameters.Add("@yearId", year);
            var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>("GetEmployeeAppraisalInfo", parameters, "GetAll");
            dynamic empinfo = result.Item1?.FirstOrDefault();
            List<dynamic> KRAEvaluation = result.Item2?.ToList();
            List<dynamic> BehavioralAttributes = result.Item3?.ToList();

            return (empinfo, KRAEvaluation, BehavioralAttributes);
        }



        public async Task<Result<List<NameValue>>> GetAppraisalDropdownList()
        {
            DynamicParameters parameters = new DynamicParameters();
            var result = new Result<List<NameValue>>();

            try
            {
                // Use dynamic to allow manual mapping
                var data = DataBaseFactory.QuerySP<dynamic>("App_Appraisal_SelForddl", parameters, "App_Appraisal_SelForddl");

                var mappedData = data
                    .Select(x => new NameValue
                    {
                        Name = x.description?.ToString(),
                        Value = x.pk_appId?.ToString()
                    }).ToList();

                result.IsSuccessfull = mappedData.Any();
                result.Message = result.IsSuccessfull ? "Data retrieved" : "No record found";
                result.Data = mappedData;
            }
            catch (Exception ex)
            {
                result.IsSuccessfull = false;
                result.Message = $"Error: {ex.Message}";
                result.Data = new List<NameValue>();
            }

            return result;
        }



        public async Task<bool> InsertAppraisalAsync(AppraisalMain header, List<KRA> kraList, List<Behavioral> behavioralList, string fk_userid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            AppraisalDataSet dataset = new AppraisalDataSet
            {
                Main = header,
                KRAList = kraList,
                BehavioralList = behavioralList
            };
            string xmlData = XmlUtility.XmlSerializeToString(dataset);
            // Add parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_userid", fk_userid, DbType.String);  
            int result = DataBaseFactory.QuerySP("SAL_Appraisal_Insert", dynamicParameters, "SAL_Appraisal_Insert");
            return result > 0;
        }


        //get
        public async Task<List<AppraisalSummaryModel>> GetAllAppraisalsAsync(string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@repManagerEmpId", empId);
            var result = DataBaseFactory.QuerySP<AppraisalSummaryModel>("SAL_Appraisal_GetAll", parameters, "SAL_Appraisal_GetAll");
            return result.ToList();
        }

        //hod


        public async Task<List<AppraisalSummaryModel>> GetAllAppraisalsHodAsync(string empId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@hodEmpId", empId);
            var result = DataBaseFactory.QuerySP<AppraisalSummaryModel>("SAL_Appraisal_GetForHOD", parameters, "SAL_Appraisal_GetAll");
            return result.ToList();
        }

        //getBYId

        public async Task<(dynamic summary, List<dynamic> KRAEvaluation, List<dynamic> BehavioralAttributes)> GetByIdAppraisalDetailsAsync(string empId,int fk_yearId)
        {
            DynamicParameters parameters = new DynamicParameters();     
            parameters.Add("@fk_empId", empId);
            parameters.Add("@fk_yearId", fk_yearId);
            var result = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic>("SAL_Appraisal_GetByEmpId", parameters, "GetAll");
            dynamic empinfo = result.Item1?.FirstOrDefault();
            List<dynamic> KRAEvaluation = result.Item2?.ToList();
            List<dynamic> BehavioralAttributes = result.Item3?.ToList();

            return (empinfo, KRAEvaluation, BehavioralAttributes);
        }



        public async Task<bool> CheckAppraisalDuplicateAsync(string empId, short appId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@fk_empId", empId);
            parameters.Add("@fk_appId", appId);

            var result =  DataBaseFactory.QuerySP<dynamic>(
                "SAL_Appraisal_CheckDuplicate", parameters, "SAL_Appraisal_CheckDuplicate");

            var first = result?.FirstOrDefault();

            // Assuming your SP returns column name "isDuplicate" or "Count"
            if (first != null)
            {
                int count = Convert.ToInt32(first.IsDuplicate ?? 0);
                return count > 0;
            }

            return false;
        }



    }
}
