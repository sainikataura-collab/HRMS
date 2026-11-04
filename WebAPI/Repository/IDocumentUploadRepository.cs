using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IDocumentUploadRepository
    {
        Task<bool> InsertDocumentAsync(DocumentUpldRoot documentUpldRoot, string fk_insUserID, string Fk_LocID, string fk_companyId);
        //Task<bool> UpdateDocumentAsync(DocumentUpldRoot documentUpldRoot, string fk_locid, string fk_userid);
        Task<bool> UpdateDocumentAsync(DocumentUpldRoot documentUpldRoot, string fk_userid, string fk_locid);

         Task<(int totalCount, IEnumerable<Upload_getAll>)> GetAll(int pageIndex, int pageSize, string? fk_companyId);
        Task<(Upload_Documents?, List<Upload_trn>)> GetById(long pk_uploadId);
        Task<bool> DeleteAsync(long pk_uploadId);



    }
}
