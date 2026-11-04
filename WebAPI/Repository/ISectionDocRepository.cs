using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ISectionDocRepository
    {
        //get all
        public Task<(int totalCount, IEnumerable<SectionDocMst>)> GetAll(int pageindex, int pagesize, string fk_empid, string fk_finid);

        //get by id

        public Task<SectionDocMst> GetBYId(string pk_docid);

        //for delete 

        public Task<bool> Delete(string pk_docid);

        // for insert 
        
        Task<bool> Insert(SectionDocMst section);


        // for update
        public Task<bool> Update(string pk_docid, SectionDocMst section);


        public Task<Result<List<NameValue>>> GetSubsectionDropdownListAsync(string pk_secid, string companyId, string userId);

    }



}
