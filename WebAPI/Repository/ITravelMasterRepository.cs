using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITravelMasterRepository
    {
        public Task<bool>CreateAsync(TravelMasterMstmodel model);
       
        Task<List<TravelMasterMstView>> GetAllAsync(long pk_classTvlId);
        Task<TravelMasterMst> GetById(long pk_classTvlId);

        public Task<bool> DeleteAsync(long pk_classTvlId);

        public Task<bool> UpdateTravelMstAsync(TravelMasterMstmodel model);

        
    }
}
