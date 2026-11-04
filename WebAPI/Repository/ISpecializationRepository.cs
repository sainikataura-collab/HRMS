using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISpecializationRepository
    {
        public Task<bool> InsertSpecializationMst(SpecializationMst specializationMst);
        public Task<(int totalCount, IEnumerable<SpecializationMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId);

        public Task<SpecializationMst> GetSpecializationById(string specializationId);

        public Task<bool> UpdateSpecialization(SpecializationMst specialization);

        public Task<bool> DeleteSpecialization(string specializationId);
    }
}
