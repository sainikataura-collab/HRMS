using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeOtherIncomeRepository
    {
        //get all
        public Task<(int totalCount, IEnumerable<EmployeeOtherIncome>)> GetAll(int pageindex, int pagesize, string fk_finid);
        //get by id 
        public Task<EmployeeOtherIncome> GetBYId(string pk_incomeid);

        //delete
        public Task<bool> Delete(string pk_incomeid);

        //for insert
        //public Task<bool> Insert(EmployeeOtherIncome Employee, string Fk_UserID, string Fk_LocID, string fk_empid, string fk_finid);
        public  Task<Result> Insert(EmployeeOtherIncome Employee, string Fk_UserID, string Fk_LocID, string fk_empid, string fk_finid);
        //for update
        public Task<bool> Update(EmployeeOtherIncome Employee, string Fk_UserID, string Fk_LocID, string fk_empid, string fk_finid);


    }
}
