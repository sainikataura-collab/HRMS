using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IQualificationRepository
    {
       public Task<bool> InsertQualificationMst(QualificationMst qualificationMst);
      public  Task<(int totalCount, IEnumerable<QualificationMst>)> GetAll(int pageIndex, int pageSize, string fkCompanyId);
      public  Task<QualificationMst> GetQualificationById(long qualiId);
     public   Task<bool> UpdateQualification(QualificationMst qualification);
     public   Task<bool> DeleteQualification(long qualiId);
    }
}
