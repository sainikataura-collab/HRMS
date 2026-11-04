using HRMSWebAPI.Models;
using static HRMSWebAPI.Models.CompanyConfigMst;

namespace HRMSWebAPI.Repository
{
    public interface ICompanyConfigRepository
    {
        public Task<(int totalCount, IEnumerable<CompanyConfigResult>)> GetAll(int pageIndex, int pageSize, string Fk_UserID);


        public Task<bool>InsertCompanyConfigAsync(CompanyConfigXmlModel model, string Fk_UserID, string Fk_LocID);

        public Task<GetByIdResult> GetSectionByIdAsync(string pk_companyId);


        public Task<bool>UpdateCompanyConfig(CompanyConfigXmlModel model, string Fk_UserID, string Fk_LocID,string pk_companyId);

        public Task<bool> UploadCompanyLogo(CompanyLogoUploadModel model);

        public Task<bool> UploadCompanyStamp(CompanyStampUploadModel model);

        public Task<IsLMVendorExpenseResult> GetIsLMVendorExpenseAsync(string pk_companyId);

    }
}
