using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILodgingBoardingRepository
    {
        Task<bool> Insert(LodgingBoardingXmlModel dataMst);
        Task<bool> Update(int pk_lodgingboardingId, LodgingBoardingXmlModel dataMst);

        public Task<LodgingBoardingMst> GetByIdAsync(int pk_lodgingboardingId);
        public Task<bool> DeleteAsync(int pk_lodgingboardingId);

        Task<List<LodgingBoardingMstGrid>>GetLodgingBoardingForGrid(int pk_lodgingboardingId);

    }
}
