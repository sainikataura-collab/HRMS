using HRMSWebAPI.Models;
namespace HRMSWebAPI.Repository
{
    public interface ISubSectionRepository
    {
        public  Task<bool> InsertSubSectionAsync(SubSectionMst subsection, string Fk_LocID);

        public Task<(int totalCount, IEnumerable<SubSectionMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<SubSectionMst> GetSubSectionByIdAsync(string subSectionId);

        public  Task<bool> UpdateSubSectionAsync(SubSectionMst subsection, string Fk_LocID);

        public Task<bool> DeleteSubSectionAsync(string subSectionId);
    }
}
