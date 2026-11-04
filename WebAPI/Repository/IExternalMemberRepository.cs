using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IExternalMemberRepository
    {

        public Task<(int totalCount, IEnumerable<ExternalMemberMst>)> GetAll(int pageIndex, int pageSize);

        public Task<ExternalMemberMst> GetByIdAsync(string Pk_ExMemberId);

        public Task<bool> DeleteAsync(string Pk_ExMemberId);

        public Task<bool> InsertAsync(ExternalMemberMst ExternalMemberMst);

        public Task<bool> UpdateAsync(ExternalMemberMst ExternalMemberMst);


    }
}
