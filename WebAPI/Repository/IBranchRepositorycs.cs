using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IBranchRepositorycs
    {

        Task<(int totalCount, IEnumerable<dynamic>)> GetAllAsync(int pageIndex, int pageSize, string fk_userId, string fk_companyId);

        Task<bool> InsertBranchAsync(List<BranchMst> branchList, string fk_companyId);

        Task<bool> DeleteBranchAsync(long pk_branchId);

        Task<BranchMst> GetBranchByIdAsync(long pk_branchId);

        Task<bool> UpdateBranchAsync(List<BranchMst> branchList);
    }
}
