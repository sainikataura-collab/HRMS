using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IBehavioralAreaMasterRepository
    {

        Task<bool> InsertBehavioralAreaMasterAsync(BehavioralAreaMasterModel BehavioralAreaMasterModel, string fk_userid, string fk_locid);



        Task<(int totalCount, IEnumerable<BehavioralAreaMasterModelList>)> GetAll(int pageIndex, int pageSize);



        Task<BehavioralAreaMasterModelBYID> GetBehavioralByIdAsync(long pk_behaveid);
        Task<bool> UpdateBehavioralAsync(BehavioralAreaMasterModel model, string fk_userid, string fk_locid);



        Task<bool> DeleteBehavioralAreaMasterAsync(long pk_behaveid);











    }
}
