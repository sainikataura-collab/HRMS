using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICategoryRepository
    {

        public Task<bool> InsertCategoryMstAsync(CategoryMst CategoryMst);
        public Task<(int totalCount, IEnumerable<CategoryMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        public Task<CategoryMst> GetCategoryByIdAsync(string Pk_Catid);
        public Task<bool> UpdateCategoryMstAsync(CategoryMst CategoryMst);
        public Task<bool> DeleteCategoryMstAsync(string categoryId);




    }
}
