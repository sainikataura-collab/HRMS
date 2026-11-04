using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface INewsPaperRepository
    {
        public Task<bool> InsertNewsPaperMst(NewsPaperMst newsPaperMst);

        public Task<(int totalCount, IEnumerable<NewsPaperMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId);

        public Task<NewsPaperMst> GetNewsPaperById(string newspaperId);

        public Task<bool> UpdateNewsPaper(NewsPaperMst newsPaper);

        public Task<bool> DeleteNewsPaper(string newspaperId);





    }
}
