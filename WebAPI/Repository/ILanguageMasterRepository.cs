
    using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Repository
{
    public interface ILanguageMasterRepository
    {
        public Task<bool> InsertLanguageMasterMstAsync(LanguageMasterMst LanguageMasterMst);
       
        public Task<(int totalCount, IEnumerable<LanguageMasterMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public Task<LanguageMasterMst> GetLanguageMasterByIdAsync(long pk_langid);
        public Task<bool> UpdateLanguageMasterAsync(LanguageMasterMst LanguageMasterMst);
        public Task<bool> DeleteLanguageMasterMstAsync(long pk_langid);
    }
}
