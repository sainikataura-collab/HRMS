using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ITrainingInstituteRepository
    {

        public Task<bool> InsertAsync(TrainingInstituteMst trainingInstitute);

       public Task<(int totalCount, IEnumerable<getall>)> GetAll(int pageindex, int pagesize);

       public Task<TrainingInstituteMst> GetByIdAsync(long pk_instituteId);

       public Task<bool> DeleteMstAsync(long pk_instituteId);
       public Task<bool> UpdateAsync(TrainingInstituteMst trainingInstitute);

    }
}
