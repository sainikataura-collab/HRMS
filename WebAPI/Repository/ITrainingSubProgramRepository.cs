using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public interface ITrainingSubProgramRepository
    {


        Task<bool> Insertsubprogram(TrainingSubProgramMst programMSt);
        Task<(int totalCount, IEnumerable<TrainingSubProgramMst>)> GetAllsubprogram(int pageIndex, int pageSize);


        Task<bool> UpdateSubprogram(TrainingSubProgramMst programMst);

        Task<TrainingSubProgramMst> GetByIdSubprogram(long? pk_programId);

        Task<bool> DeleteAsync(long? id, string? UserId);










    }
}
