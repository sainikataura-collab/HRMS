using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITrainingTypeMasterRepository
    {

        Task<bool> InsertAsync(TrainingTypeMst TrainingTypeMst);
        Task<(int totalCount, IEnumerable<TrainingTypeMstGetAll>)> GetAll(int pageIndex, int pageSize);
        Task<TrainingTypeMst> GetByIdAsync(long pk_typeId);
        Task<bool> DeleteAsync(long pk_typeId);
        Task<bool> UpdateAsync(TrainingTypeMst TrainingTypeMst);




        }
}
