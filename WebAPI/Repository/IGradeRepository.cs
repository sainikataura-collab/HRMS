using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IGradeRepository
    {
        //FOR INSERT
        public Task<bool> InsertGradeAsync(grade grade);
        //FOR DISPLAY ALL
        public Task<(int totalCount, IEnumerable<grade>)> GetAll(int pageIndex, int pageSize, string fk_companyId);
        //FOR DISPLAY BY ID
        public Task<grade> GetGradeByIdAsync(string gradeId);
        //FOR DELETE
        public Task<bool> DeleteGradeAsync(string id);
        //FOR UPDATE
        public Task<bool> UpdateGradeAsync(grade grade);

    }
}
