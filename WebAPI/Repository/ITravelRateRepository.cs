using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITravelRateRepository
    {
        Task<bool> Insert(TravelRateMstXmlModel dataMst);

        Task<bool> UpdateTravelRateAsync(long pk_RateID, TravelRateMstXmlModel dataMst);
        Task<List<LTRN_Rate_Mst_SelforgridModel>> LTRN_Rate_Mst_Selforgrid(string pk_RateID);

        public Task<bool> DeleteAsync(long pk_RateID);

        public Task<TravelRateMst> GetByIdAsync(long pk_RateID);

    }
}
