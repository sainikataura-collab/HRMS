
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IQualificationDetailsRepository
    {

        public  Task<bool> InsertEmpQuali(QualificationDetails qualificationMst);
        public  Task<(int totalCount, IEnumerable<QualificationDetails>)> GetAll(int pageIndex, int pageSize, string fk_empid);
        public  Task<QualificationDetails> GetById(string pk_empqualid);
        public Task<bool> DeleteQualifiacationAsync(string pk_empqualid);
        public  Task<bool> UpdateQualificationDetails(QualificationDetails experienceDetails);



    }
}
