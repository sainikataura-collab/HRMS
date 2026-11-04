using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IManpowerRepository
    {
       Task<bool> InsertManpowerAsync(ManpowerMstDataSet manpowerMstDataSet, string fk_empid);
        Task<(int totalCount, IEnumerable<ManpowerRequisitionGridModel>)> GetAllManpowerRequestsAsync(int pageIndex, int pageSize, string fk_empid);
        public Task<ManpowerMstDataSet?> GetManpowerByIdAsync(long pk_reqid, string fk_empid);
        Task<bool> UpdateManpowerAsync(long pk_reqid, ManpowerMstDataSet manpowerMstDataSet, string fk_empid);
        Task<bool> DeleteManpowerAsync(long pk_reqid);
    }
}
