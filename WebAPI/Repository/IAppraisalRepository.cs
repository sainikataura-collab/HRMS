using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IAppraisalRepository
    {
      Task<bool> InsertAppraisalAsync(AppraisalMst model);

       Task<(int totalCount, IEnumerable<AppraisalMstView>)> GetAllAppraisalsAsync(int pageIndex, int pageSize);

        Task<AppraisalMstView> GetAppraisalByIdAsync(long appraisalId);

        Task<bool> UpdateAppraisalAsync(AppraisalMst appraisal);

        Task<bool> DeleteAppraisalAsync(long appId);


    } 
}
