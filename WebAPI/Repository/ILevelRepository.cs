using HRMSWebAPI.Models;
namespace HRMSWebAPI.Repository
{
    public interface ILevelRepository
    {
        public Task<bool> InsertLevelAsync(LevelMst level);

        public Task<(int totalCount, IEnumerable<LevelMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<(LevelMst Level, IEnumerable<dynamic> Heads)> GetLevelByIdAsync(string levelId);

        public Task<bool> UpdateLevelAsync(LevelMst level);

        public  Task<bool> DeleteLevelMstAsync(string levelId);

        Task<IEnumerable<dynamic>> GetReimbursementHeads(string companyId);
    }
}
