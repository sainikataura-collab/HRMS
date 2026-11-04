using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
  
    public interface ILocalTravelRepository
    {
        Task<bool> CreateAsync(LocalTravelMst model);
        Task<List<LocalTravelGet>> GetAll(string fk_empid);
        Task<ResponseIdMst> GetByIdAsync(long pk_localtravelId);
        Task<(bool isSuccess, string message)> DeleteAsync(long pk_localtravelId);
        // Task<bool> UpdateLocalTravelMstAsync(LocalTravelMst model);
        Task<bool> UpdateLocalTravelMstAsync(LocalTravelMst model);
        Task<bool> SubmitLocalTravel(string fk_empid);

    }


}
