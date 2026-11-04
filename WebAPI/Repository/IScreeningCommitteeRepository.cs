using HRMSWebAPI.Models;
using System.Xml.Serialization;

namespace HRMSWebAPI.Repository
{
    public interface IScreeningCommitteeRepository
    {
        Task<bool> Insert(ScreeningCommitteeXmlModel dataMst, string Fk_UserID, string Fk_LocID);
        Task<bool> Update(ScreeningCommitteeXmlModel dataMst,string Pk_Screening_CommitteeId, string Fk_UserID, string Fk_LocID);

        Task<(int totalCount, IEnumerable<ScreeningCommittee>)> GetAll(int pageindex, int pagesize);

        Task<ScreeningCommitteeMst> GetById(string Pk_Screening_CommitteeId);

        public Task<bool> DeleteAsync(string Pk_Screening_CommitteeId);

    }
}
