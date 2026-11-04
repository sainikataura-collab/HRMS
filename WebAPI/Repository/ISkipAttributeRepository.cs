using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISkipAttributeRepository
    {

        public Task<(int totalCount, IEnumerable<SkipAttributeMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<SkipAttributeMst> GetByIdAsync(string pk_attributeId);

        public Task<bool> DeleteAsync(string pk_attributeId);

        public Task<bool> InsertAsync(SkipAttributeMst skipAttributeMst);


        public Task<bool> UpdateAsync(SkipAttributeMst skipAttributeMst);
    }
}
