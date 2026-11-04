using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITrainingProgramMasterRepository
    {


        Task<bool> Insert(TrainingProgramMst programMSt);
        Task<(int totalCount, IEnumerable<TrainingProgramMst>)> GetAll(int pageIndex, int pageSize);

        Task<bool> Update(TrainingProgramMst programMst);
        Task<TrainingProgramMst> GetByIdAsync(long? pk_programId);
        Task<bool> DeleteAsync(long? id);


    }
}
