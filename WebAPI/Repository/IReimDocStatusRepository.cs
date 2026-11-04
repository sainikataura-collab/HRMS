using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IReimDocStatusRepository
    {
       
        // for insert 
        public Task<bool> InsertReimDocStatus(List<ReimDocStatusMst> reimDocStatusMst, string fk_locid, string fk_userid);
        public Task<(int totalCount, IEnumerable<ReimDocStatusMst>)> GetAll(int pageindex, int pagesize, string fk_empid);
        //get by id
        public Task<ReimDocStatusMst> GetReimDocstatusById(string pk_docid);
        //delete
        public Task<bool> DeleteDocStatus(string pk_docid);
       
        // for update
        public Task<bool> UpdateReimDocStatus(string pk_docid,ReimDocStatusMst reimDocStatusMst, string fk_locid, string fk_userid);




    }

}



