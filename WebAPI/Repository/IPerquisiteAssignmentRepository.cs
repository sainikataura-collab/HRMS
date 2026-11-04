using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IPerquisiteAssignmentRepository
    {

        //for get all
        public Task<(int totalCount, IEnumerable<PerquisiteAssignment>)> GetAll(int pageIndex, int pageSize, string fk_empid);
        //get by id
        public Task<PerquisiteAssignment>GetperquisiteAssignmentByIdAsync(string pk_perktrnId);
        //delete
        public Task<bool> DeleteperquisiteAssignmentAsync(string pk_perktrnId);

        //insert 
        public Task<bool> InsertperquisiteAssignmentAsync(PerquisiteAssignment perquisite, string fk_locId, string fk_userId,string fk_empid,string fk_perkId);
        //for update

        public Task<bool> UpdatePerquisiteAssignmentAsync(PerquisiteAssignment PerquisiteAssignmentMst, string fk_locId, string fk_userId, string fk_empid, string fk_perkId);







    }
}
