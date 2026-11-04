using HRMSWebAPI.Models;
using static HRMSWebAPI.Models.TravelModeMasterModel;

namespace HRMSWebAPI.Repository
{
    public interface ITravelModeMasterRepository
    {
        Task<bool> TravelmodeInsert(TravelModeMasterModel trvlmodel);
        Task<List<TrvlModemasterModelGetAll>> LTRN_TravelMode_Mst_Selforgrid(string pk_travelmodeID);
        Task<bool> DeleteAsync(long pk_travelmodeID);
        Task<TravelModeMasterModel> GetByIdAsync(long pk_travelmodeID);

        Task<bool> UpdateTravelRateAsync(long pk_travelmodeID, TrvlModelUpd dataMst);
    }
}
