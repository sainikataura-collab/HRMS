using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface INewjobRepository
    {

        public Task<bool> InsertDocumentAsync(NewjobMstDataSet NewjobMstDataSet, string Fk_LocID, string fk_userid, string fk_companyId);

        public Task<(int totalCount, IEnumerable<NewjobMst>)> GetAllOpenJobsAsync(int pageIndex, int pageSize, string companyId);

        public Task<NewjobResult> GetOpenNewJobByIdAsync(string jobId);

        public Task<bool> DeleteOpenNewJobAsync(string jobId);

        public Task<bool> UpdateNewJobAsync(NewjobMstDataSet newjobMstDataSet);



    }
}
