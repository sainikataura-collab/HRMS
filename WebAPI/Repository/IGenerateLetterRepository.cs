using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IGenerateLetterRepository
    {
        Task<(bool IsSuccess, string ErrorMessage)> InsertCandidateLetterAsync(CandidateLetterDataset dataset, string fk_companyId);

        //
        Task<dynamic> UpdateLetterStatusAsync(int pk_trnid, bool status, string remark);


        Task<(int totalCount, IEnumerable<dynamic> data)>
    GetCandidateLetterGrid(int pageIndex, int pageSize, long? fk_formatid);

        public Task<bool> DeleteAsync(long pk_trnid);
        public Task<IEnumerable<dynamic>> GetHeads(string? companyId = null);

        Task<dynamic> DownloadFormatAsync(long pk_trnid);

        Task<dynamic> GetEmployeeByIdAsync(string fk_empId);

        Task<bool> PublishLetterAsync(long pk_trnid);



    }


}
