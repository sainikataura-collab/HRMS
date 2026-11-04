using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IGeneralRepository
    {
        public Task<Result> IsValueAvailableAsync(string companyId, string userId, string fieldName, string fieldValue, string? generalId = null);

        public Task<Result<List<NameValue>>> GetDropdownListAsync(string fieldName, string companyId, string userId);
        public Task<Result<List<NameValue>>> GetLocationsForUserAsync(string? officeTypeId, string userId, string companyId);

        Task<Result<List<NameValue>>> Emp_GetDropdownListAsync(string fieldName, string companyId, string userId);
        public Task<Result<List<NameValue>>> GetleavetypeList(string fk_empid, string fk_companyId);
        public Task<Result<List<NameValue>>> ModuleList(string userId);


        //Added BY Raj 06 May

        public Task<ResultList<MasterGeneral>> GetCodeTypesListAsync(int pageNumber = 1, int pageSize = 10);

        public Task<ResultList<MasterGeneral>> GetListBasedOnCodeTypeAsync(string codeTypeId, int pageNumber = 1, int pageSize = 10, string fk_companyId = "");

        public Task<InsertResult> CreateMasterGeneralAsync(MasterGeneral masterGeneralObj);

        public Task<Result> UpdateMasterGeneralAsync(MasterGeneral masterGeneralObj, string fk_companyId = "");

        public Task<Result> IsValueAvailableInLSPGeneralAsync(string codeDescription, string codeTypeId, string? codeId, string fk_companyId);

        public Task<ResultById<MasterGeneral>> GetMasterGeneralByIdAsync(string codeId, string codeTypeId);

        public Task<ResultList<NameValue>> GetDdlListBasedOnCodeTypeAsync(string codeTypeId, string fk_companyId = "");

        public  Task<Result> CheckValidationPublicAsync(string fieldName, string fieldValue,string? generalId = null);

    }
}
