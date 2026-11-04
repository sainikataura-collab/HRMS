using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ILeaveEncashmentRepository
    {
        //for get all
        public Task<(int totalCount, IEnumerable<LeaveEncashmentMst>)> GetAll(int pageIndex, int pageSize, string fk_empid);


        //get by id
        public Task<LeaveEncashmentMst> GetByIdAsync(string pk_encashid);

        //delete
        public Task<bool> Delete(string pk_encashid);


        //insert 
        public Task<bool> InsertAsync(LeaveEncashmentDetail detail,decimal amount_N, string Fk_LocID, string Fk_UserID);
        //update
        public Task<bool>Update(string pk_encashid,LeaveEncashmentDetail detail, decimal amount_N, string Fk_LocID, string Fk_UserID);

        //for the balance leave
        public Task<LeaveEncashmentMst> balanceleave(string fk_empid,decimal Fk_leaveid);

        //calculate ammount

        public Task<decimal> calculatedAmmount(calculateAmmount model);



    }
}
