using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITrainingRatingRepository
    {
       Task<(int totalCount, IEnumerable<TrainingRatingMstView>)> GetAll(int pageindex, int pagesize);

        Task<TrainingRatingMstView> GetByIdAsync(int pk_ratingId);

        Task<bool> DeleteAsync(int pk_ratingId);

        Task<bool> InsertAsync(TrainingRatingMst TrainingRatingMst);

        Task<bool> UpdateAsync(TrainingRatingMst TrainingRatingMst);

    }
}
