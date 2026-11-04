using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IExperienceDetailsRepository
    {
        public  Task<bool> InsertEmployeePrevJob(ExperienceDetails designationMst);

        public Task<(int totalCount, IEnumerable<ExperienceDetails>)> GetAll(int pageIndex, int pageSize, string fk_empid);
        public  Task<ExperienceDetails> GetById(long pk_pjobid);
        public Task<bool> DeleteExperienceAsync(string pk_pjobid);
        public  Task<bool> UpdateExperienceDetailsAsync(ExperienceDetails experienceDetails);




    }
}
