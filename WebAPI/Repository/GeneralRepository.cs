using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class GeneralRepository : IGeneralRepository
    {


        public async Task<Result> IsValueAvailableAsync(string companyId, string userId, string fieldName, string fieldValue, string? generalId = null)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

        
            dynamicParameters.Add("@CompanyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FieldName", (object)fieldName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FieldValue", (object)fieldValue, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

          

            if (!string.IsNullOrEmpty(generalId))
            {
                dynamicParameters.Add("@GeneralId", (object)generalId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            }

            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@IsAvailable", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
          
            DataBaseFactory.QuerySP("General_IsValueAvailable", dynamicParameters);

            return new Result
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                IsAvailable = dynamicParameters.Get<bool>("@IsAvailable"),
                Message = dynamicParameters.Get<string>("@Message")
            };
        }

       

        public async Task<Result<List<NameValue>>> GetDropdownListAsync(string fieldName, string companyId,string userId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FieldName", (object)fieldName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CompanyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Output Parameters
            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());
            
            var result = await DataBaseFactory.QuerySPAsync<NameValue>("General_Ddl_GetDropdownList", dynamicParameters, "General_Ddl_GetDropdownList");

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                Message = dynamicParameters.Get<string>("@Message"),
                Data = result.ToList()
            };

            return finalResult;
        }



        //For Employee

        public async Task<Result<List<NameValue>>> Emp_GetDropdownListAsync(string fieldName, string companyId, string userId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@UserId", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@FieldName", (object)fieldName, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CompanyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Output Parameters
            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("General_Ddl_GetDropdownList_ForEmp", dynamicParameters, "General_Ddl_GetDropdownList");

            // Final Output
            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                Message = dynamicParameters.Get<string>("@Message"),
                Data = result.ToList()
            };

            return finalResult;
        }


        //

        public async Task<Result<List<NameValue>>> GetLocationsForUserAsync(string? officeTypeId, string userId, string companyId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_officetypeid", (object?)officeTypeId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute Stored Procedure
            var result = DataBaseFactory.QuerySP<LocationNameValue>("SAL_Location_Forchkbox_OnOfficetype_UserId", dynamicParameters, "SAL_Location_Forchkbox_OnOfficetype_UserId");

            List<NameValue> transformedResult = new();

            if (result != null && result.Any())
            {
                transformedResult = result.Select(r => new NameValue
                {
                    Name = r.locname,  // Rename locname to Name
                    Value = r.pk_locid // Rename pk_locid to Value
                }).ToList();
            }

            // Final Output
            return new Result<List<NameValue>>
            {
                IsSuccessfull = transformedResult.Any(),
                Message = transformedResult.Any() ? "Data retrieved successfully." : "No data found.",
                Data = transformedResult
            };
        }



        public async Task<Result<List<NameValue>>> GetleavetypeList(string fk_empid, string fk_companyId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Output Parameters

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("SAL_LeaveType_OnEmp_SelForddl", dynamicParameters, "Get leave type for emp");

            // Final Output

            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count > 0,
                Message = result.ToList().Count > 0 ? "Data retrieved" : "No record",
                Data = result.ToList()
            };


            return finalResult;
        }


        public async Task<Result<List<NameValue>>> ModuleList(string userId)
        {
            // Dynamic Parameters
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@UserID", (object)userId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Output Parameters

            var result = await DataBaseFactory.QuerySPAsync<NameValue>("UM_SP_GetUserModules", dynamicParameters, "Get module");

            // Final Output

            var finalResult = new Result<List<NameValue>>
            {
                IsSuccessfull = result.ToList().Count > 0,
                Message = result.ToList().Count > 0 ? "Data retrieved" : "No record",
                Data = result.ToList()
            };


            return finalResult;
        }



        //Added Raj 06 May 2026

        public async Task<ResultList<MasterGeneral>> GetCodeTypesListAsync(int pageNumber = 1, int pageSize = 10)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@PageNumber", (object)pageNumber, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PageSize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@TotalCount", null, new DbType?(DbType.Int32), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());


            var codeTypeList = DataBaseFactory.QuerySP<MasterGeneral>("LSP_MasterGeneral_GetAllCodeTypeList", dynamicParameters, "MasterGeneral - GetAllCodeTypeList").ToList();

            var result = new ResultList<MasterGeneral>
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                Message = dynamicParameters.Get<string>("@Message"),
                TotalCount = dynamicParameters.Get<int>("@TotalCount"),
                List = codeTypeList
            };

            return result;
        }



        public async Task<ResultList<MasterGeneral>> GetListBasedOnCodeTypeAsync(string codeTypeId, int pageNumber = 1, int pageSize = 10, string fk_companyId = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@CodeTypeId", (object)codeTypeId, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PageNumber", (object)pageNumber, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@PageSize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fk_companyId);
            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@TotalCount", null, new DbType?(DbType.Int32), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());

            var masterGeneralList = DataBaseFactory.QuerySP<MasterGeneral>("LSP_MasterGeneral_GetListBasedOnCodeType", dynamicParameters, "MasterGeneral - GetListBasedOnCodeType").ToList();

            var result = new ResultList<MasterGeneral>
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                Message = dynamicParameters.Get<string>("@Message"),
                TotalCount = dynamicParameters.Get<int>("@TotalCount"),
                List = masterGeneralList
            };

            return result;
        }


        public async Task<InsertResult> CreateMasterGeneralAsync(MasterGeneral masterGeneralObj)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@XmlGeneral", (object)XmlUtility.XmlSerializeToString((object)masterGeneralObj), new DbType?(DbType.Xml), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@GeneralId", null, new DbType?(DbType.Int64), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());

            DataBaseFactory.QuerySP("LSP_MasterGeneral_Insert", (object)dynamicParameters, "MasterGeneral_Insert");

            var result = new InsertResult()
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                Message = dynamicParameters.Get<string>("@Message"),
                Id = dynamicParameters.Get<long>("@GeneralId")
            };

            return result;
        }


        public async Task<Result> UpdateMasterGeneralAsync(MasterGeneral masterGeneralObj, string fk_companyId = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@XmlGeneral", (object)XmlUtility.XmlSerializeToString((object)masterGeneralObj), new DbType?(DbType.Xml), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);
            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());

            DataBaseFactory.QuerySP("LSP_MasterGeneral_Update", (object)dynamicParameters, "MasterGeneral_Update");

            var result = new Result()
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                Message = dynamicParameters.Get<string>("@Message")
            };

            return result;
        }


        public async Task<Result> IsValueAvailableInLSPGeneralAsync(string codeDescription, string codeTypeId, string? codeId, string fk_companyId)
        {

            if (codeId == null)
            {
                codeId = 0.ToString();
            }

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@CodeDescription", (object)codeDescription, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CodeTypeId", (object)codeTypeId, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CodeId", (object)codeId, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@CodeId", (object)codeId, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsSuccessfull", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsAvailable", null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Message", null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String);


            DataBaseFactory.QuerySP("LSP_MasterGeneral_IsValueAvailableInLSPGeneral", (object)dynamicParameters, "MasterGeneral_IsValueAvailable");

            var result = new Result()
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                IsAvailable = dynamicParameters.Get<bool>("@IsAvailable"),
                Message = dynamicParameters.Get<string>("@Message")
            };

            return result;
        }


        public async Task<ResultById<MasterGeneral>> GetMasterGeneralByIdAsync(string codeId, string codeTypeId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@CodeId", (object)codeId, DbType.Int16);
            dynamicParameters.Add("@CodeTypeId", (object)codeTypeId, DbType.Int16);

            dynamicParameters.Add("@IsSuccessfull", null, DbType.Boolean, ParameterDirection.Output);
            dynamicParameters.Add("@Message", null, DbType.String, ParameterDirection.Output, 255);

            var masterGeneral = DataBaseFactory.QuerySP<MasterGeneral>("LSP_MasterGeneral_GetById", dynamicParameters, "MasterGeneral - GetById").FirstOrDefault();

            var result = new ResultById<MasterGeneral>
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                Message = dynamicParameters.Get<string>("@Message"),
                Data = masterGeneral
            };

            return result;
        }


        public async Task<ResultList<NameValue>> GetDdlListBasedOnCodeTypeAsync(string codeTypeId, string fk_companyId = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@CodeTypeId", codeTypeId, DbType.Int16, ParameterDirection.Input);
            dynamicParameters.Add("@fk_companyId", fk_companyId, DbType.String, ParameterDirection.Input);


            var masterGeneralList = DataBaseFactory.QuerySP<NameValue>(
                "LSP_MasterGeneral_GetByIdList", dynamicParameters, "MasterGeneral - GetByIdList"
            ).ToList();

            var result = new ResultList<NameValue>
            {
                IsSuccessfull = masterGeneralList.Count > 0,
                Message = masterGeneralList.Count > 0 ? "Successfully fetched list" : "No list record found.",
                List = masterGeneralList
            };

            return result;
        }

        public async Task<Result> CheckValidationPublicAsync(
    string fieldName,
    string fieldValue,
    string? generalId = null)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add(
                "@FieldName",
                (object)fieldName,
                new DbType?(DbType.String),
                new ParameterDirection?(),
                new int?(),
                new byte?(),
                new byte?());

            dynamicParameters.Add(
                "@FieldValue",
                (object)fieldValue,
                new DbType?(DbType.String),
                new ParameterDirection?(),
                new int?(),
                new byte?(),
                new byte?());

            if (!string.IsNullOrEmpty(generalId))
            {
                dynamicParameters.Add(
                    "@GeneralId",
                    (object)generalId,
                    new DbType?(DbType.String),
                    new ParameterDirection?(),
                    new int?(),
                    new byte?(),
                    new byte?());
            }

            dynamicParameters.Add(
                "@IsSuccessfull",
                null,
                new DbType?(DbType.Boolean),
                new ParameterDirection?(ParameterDirection.Output),
                new int?(),
                new byte?(),
                new byte?());

            dynamicParameters.Add(
                "@Message",
                null,
                new DbType?(DbType.String),
                new ParameterDirection?(ParameterDirection.Output),
                new int?(255),
                new byte?(),
                new byte?());

            dynamicParameters.Add(
                "@IsAvailable",
                null,
                new DbType?(DbType.Boolean),
                new ParameterDirection?(ParameterDirection.Output),
                new int?(),
                new byte?(),
                new byte?());

            DataBaseFactory.QuerySP(
                "General_CheckValidation_Public",
                dynamicParameters);

            return new Result
            {
                IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                IsAvailable = dynamicParameters.Get<bool>("@IsAvailable"),
                Message = dynamicParameters.Get<string>("@Message")
            };
        }




    }
}
