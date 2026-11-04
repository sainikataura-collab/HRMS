using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISectionRepository
    {
        public Task<bool> InsertSectionAsync(SectionMst section, string fk_locId, string fk_userId);
       public Task<(int totalCount, IEnumerable<SectionMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
       public Task<SectionMst> GetSectionByIdAsync(string sectionId);
        public Task<bool> DeleteSectionMstAsync(string sectionId);
        public Task<bool> UpdateSectionAsync(SectionMst section, string fk_locId, string fk_userId);

    }
}
