using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class KRARepository : IKRARepository
    {


        public async Task<bool> InsertRolewiseKRAAsync(KRARequest kRARequest)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RoleId", (object)kRARequest.RoleId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SrNo", (object)kRARequest.SrNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@KPA", (object)kRARequest.KPA, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@KRA", (object)kRARequest.KRA, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@KPI", (object)kRARequest.KPI, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@userid", (object)kRARequest.UserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@TargetValue", (object)kRARequest.TargetValue, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Weightage", (object)kRARequest.Weightage, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@AttachmentPath", (object)kRARequest.AttachmentPath, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsActive", (object)kRARequest.IsActive, new DbType?(DbType.Byte), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            //dynamicParameters.Add("@Message", (object)kRARequest.Message, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            //dynamicParameters.Add("@Isuccessful", (object)kRARequest.Isuccessful, new DbType?(DbType.Byte), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_KRA_Rolewise_Trn_Ins", dynamicParameters, "KRA_Rolewise_trn_Ins");
            return result > 0;
        }



        public async Task<bool> InsertEmployeewiseKRAAsync(KRARequest kRARequest)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", (object)kRARequest.fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SrNo", (object)kRARequest.SrNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@KPA", (object)kRARequest.KPA, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@KRA", (object)kRARequest.KRA, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@KPI", (object)kRARequest.KPI, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@userid", (object)kRARequest.UserId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@TargetValue", (object)kRARequest.TargetValue, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Weightage", (object)kRARequest.Weightage, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@AttachmentPath", (object)kRARequest.AttachmentPath, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsActive", (object)kRARequest.IsActive, new DbType?(DbType.Byte), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int result = DataBaseFactory.QuerySP("SAL_KRA_Employeewise_Ins", dynamicParameters, "KRA_Employeewise_Ins");
            return result > 0;
        }


        public async Task<bool> Del_RolewiseKRA_Async(int roleId, long SrNo)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Adding parameters
            dynamicParameters.Add("@RoleId", (object)roleId, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SrNo", (object)SrNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_KRA_Rolewise_Trn_Del", dynamicParameters, "KRA_Rolewise_Trn_Del");

            return result > 0;

        }







        public async Task<List<KRAList>> GetRolewiseByIdAsync(string roleId, long SrNo)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RoleId", (object)roleId, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SrNo", (object)SrNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            return DataBaseFactory.QuerySP<KRAList>("SAL_Rolewise_GetById", (object)dynamicParameters, "Rolewise - GetById").ToList();
        }


        public async Task<IEnumerable<KRAList>> GetRolewise_list_Async()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var rolewiselist = DataBaseFactory.QuerySP<KRAList>("SAL_Rolewise_SelfforGrid", dynamicParameters, "Rolewise_SelfforGrid");
            return rolewiselist;

        }



        //---         Empwise KRA

        public async Task<List<KRAList>> GetEmpwiseByIdAsync(string fk_empId, long SrNo)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", (object)fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SrNo", (object)SrNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<KRAList>("SAL_Empwise_GetById", (object)dynamicParameters, "Empwise - GetById").ToList();
        }



        public async Task<IEnumerable<KRAList>> GetEmpwise_list_Async()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            var rolewiselist = DataBaseFactory.QuerySP<KRAList>("SAL_EmpWiseKRA_SelfforGrid", dynamicParameters, "Empwise_SelfforGrid");
            return rolewiselist;

        }
        public async Task<bool> Del_Employeewise_KRA_Async(string fk_empId, long SrNo)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Adding parameters
            dynamicParameters.Add("@fk_empId", (object)fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SrNo", (object)SrNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_KRA_Employeewise_Del", dynamicParameters, "KRA_Employeewise_Del");

            return result > 0;

        }



        public async Task<bool> Insert_Self_Assesment_Multiple(List<kraSelfAss> kraList)
        {
            var dataset = new RootDataSet
            {
                Self_Asse_KRA = kraList
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            var parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.Xml);

            var result = DataBaseFactory.QuerySP("KRA_Self_Assessment_Ins", parameters);
            return result > 0;
        }


        public async Task<bool> Update_Self_Assessment_Multiple(List<kraSelfAss> kraList)
        {
            var dataset = new RootDataSet
            {
                Self_Asse_KRA = kraList
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            var parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.Xml);
            var result = DataBaseFactory.QuerySP("KRA_Self_Assessment_Upd", parameters);
            return result > 0;
        }





        //Upd Report Managere

        public async Task<bool> Update_RM_Assessment_Multiple(List<UpdModel> kraList)
        {
            var dataset = new updRootDataSet
            {
                RM_Asse = kraList
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            var parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.Xml);
            parameters.Add("@fk_empAppById", (object)kraList[0].fk_empAppById, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP("KRA_Assessment_Approval_RMInsUpd", parameters);
            return result > 0;
        }

        public async Task<bool> Update_HOD_Assessment_Multiple(List<HODUpddel> kraList)
        {
            var dataset = new HODRootDataSet
            {
                HOD_Asse = kraList
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            var parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.Xml);
            parameters.Add("@fk_empAppById", (object)kraList[0].fk_empAppById, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            var result = DataBaseFactory.QuerySP("KRA_Assessment_Approval_HODInsUpd", parameters);
            return result > 0;
        }





        public async Task<bool> Insert_Role_Assesment_Multiple(List<Self_Assesment_KRA> kraList)
        {
            var dataset = new RoleDataSet
            {
                Role_Asse_KRA = kraList
            };

            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            var parameters = new DynamicParameters();
            parameters.Add("@Doc", xmlData, DbType.String);

            var result = DataBaseFactory.QuerySP("App_KRA_Rolewise_Assessment_Draft_Ins", parameters);
            return result > 0;
        }


        public async Task<List<KRA_Get_Assesment_data>> GetEmp_Self_Assess_ByIdAsync(string fk_empId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", (object)fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<KRA_Get_Assesment_data>("KRA_Data_GetByEmpId_ForAssessment", (object)dynamicParameters, "Empwise - GetById").ToList();
        }

        public async Task<List<KRA_Get_Assesment_data>> GetAssessmnet_ByIdAsync(string kraId, long fk_kraperiodId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_kraassId", (object)kraId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<KRA_Get_Assesment_data>("App_Draft_KRA_Assessment_Edit", (object)dynamicParameters, "Empwise - GetById").ToList();
        }









        public async Task<List<KRA_Get_Assesment_data>> GetRM_Assess_ByIdAsync(long kraAssid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@kraAssid", (object)kraAssid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<KRA_Get_Assesment_data>("KRA_Data_GetByEmpId_ForRMAssessment", (object)dynamicParameters, "Empwise - GetById").ToList();
        }




        public async Task<List<KRA_Get_Assesment_data>> GetRole_Assess_ByIdAsync(int RoleId)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@RoleId", (object)RoleId, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<KRA_Get_Assesment_data>("KRA_Data_GetByRoleId_ForAssessment", (object)dynamicParameters, "Empwise - GetById").ToList();
        }



        public async Task<List<KRA_Get_Assesment_data>> GetRMAssessmnet_ByIdAsync(string fk_empid, long fk_kraperiodId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@kraPeriodId", (object)fk_kraperiodId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            return DataBaseFactory.QuerySP<KRA_Get_Assesment_data>("KRA_Data_GetByEmpId_ForRMAssessment", (object)dynamicParameters, "Empwise - GetById").ToList();
        }
        public async Task<List<KRA_Get_Assesment_data>> GetHODAssessmnet_ByIdAsync(string fk_empid, long fk_kraperiodId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@kraPeriodId", (object)fk_kraperiodId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            return DataBaseFactory.QuerySP<KRA_Get_Assesment_data>("KRA_Data_GetByEmpId_ForHODAssessment", (object)dynamicParameters, "Empwise - GetById").ToList();
        }






        //public async Task<(List<KRA_Get_Assesment_data>, List<KRA_Get_Self_Assesment_data>)> GetAssessmnet_ByIdAsync(string kraId)
        //{
        //    var dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@fk_KRAId", kraId, DbType.Int64, ParameterDirection.Input);

        //    // Use the stored procedure name and parameters
        //    var tuple = DataBaseFactory.QueryMultipleSP<KRA_Get_Assesment_data, KRA_Get_Self_Assesment_data>(
        //        "App_Draft_KRA_Assessment_Edit",
        //        dynamicParameters,
        //        "Assessment_Edit"
        //    );

        //    // Extract the 3 result sets
        //    //GetbyidModelTempMassage TempMessage = null;
        //    //GetbyidModelMassage SalaryMessage= null;
        //    List<KRA_Get_Self_Assesment_data> KRAList = new();
        //    List<KRA_Get_Assesment_data> AssessmentList = new();


        //    if (tuple != null)
        //    {
        //        AssessmentList = tuple.Item1?.ToList();
        //        KRAList = tuple.Item2?.ToList();

        //    }

        //    return (AssessmentList, KRAList);
        //}





        public async Task<(int totalCount, IEnumerable<getlistforRM>)> GetAllRMList(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, getlistforRM>("APP_Draft_KRA_RMAssessment_SelForGrid", dynamicParameters, "getALL");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<(int totalCount, IEnumerable<getlistforSelf>)> GetAllSelfList(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, getlistforSelf>("APP_Draft_KRA_SelfAssessment_SelForGrid", dynamicParameters, "getALL");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }
        public async Task<(int totalCount, IEnumerable<getlistforHOD>)> GetAllHODList(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, getlistforHOD>("APP_Draft_KRA_HODAssessment_SelForGrid", dynamicParameters, "getALL");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        //RoleWise Assessment
        public async Task<(int totalCount, IEnumerable<RoleAssessmentList>)> GetAll_Role_AssessmentList(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, RoleAssessmentList>("APP_Draft_KRA_Role_SelfAssessment_SelForGrid", dynamicParameters, "getALL");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }



        // KRA Periord DropDown

        public async Task<Result<List<NameValue>>> GetPeriodDropdownList()
        {
            var result = new Result<List<NameValue>>();
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                // If your QuerySP is not async, remove async/await
                var data = DataBaseFactory.QuerySP<NameValue>("KRA_Period_SelForddl", dynamicParameters, "KRA_Period_SelForddl");

                result.IsSuccessfull = data != null && data.Any();
                result.Message = result.IsSuccessfull ? "Data retrieved" : "No record found";
                result.Data = data.ToList();
            }
            catch (Exception ex)
            {
                result.IsSuccessfull = false;
                result.Message = $"Error: {ex.Message}";
                result.Data = new List<NameValue>();
            }

            return result;
        }


        public async Task<List<KRAList>> GetEmployeeKRAIdAsync(string fk_empId, long? SrNo)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", (object)fk_empId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SrNo", (object)SrNo, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<KRAList>("SAL_Empwise_GetById", (object)dynamicParameters, "Empwise - GetById").ToList();
        }



        // Check Duplicacy

        public async Task<Result<string>> ValidateKRAPeriodAsync(string empId, int kraperiodId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@fk_empid", empId);
            parameters.Add("@fk_kraperiodId", kraperiodId);

            parameters.Add("@IsSuccessfull", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            parameters.Add("@IsAvailable", dbType: DbType.Boolean, direction: ParameterDirection.Output);
            parameters.Add("@Message", dbType: DbType.String, size: 300, direction: ParameterDirection.Output);

            // SP call
            DataBaseFactory.QuerySP("KRA_Validate_Period_For_Employee", parameters);

            var result = new Result<string>
            {
                IsSuccessfull = parameters.Get<bool>("@IsSuccessfull"),
                Message = parameters.Get<string>("@Message"),
                Data = parameters.Get<bool>("@IsAvailable") ? "Available" : "Exists"
            };

            return result;
        }



    }
}