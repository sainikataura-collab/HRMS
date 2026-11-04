using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICardAppreciatorRepository
    {
        public Task<(int totalCount, IEnumerable<CardAppreciatorMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId);

        public Task<CardAppreciatorMst> GetByIdAsync(int pk_crdauthId);

        public Task<bool> DeleteAsync(int pk_crdauthId);

        public Task<bool> InsertAsync(CardAppreciatorMst CardAppreciatorMst);


        public Task<bool> UpdateAsync(CardAppreciatorMst CardAppreciatorMst);
    }
}
