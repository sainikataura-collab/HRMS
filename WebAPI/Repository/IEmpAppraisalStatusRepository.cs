namespace HRMSWebAPI.Repository
{
    public interface IEmpAppraisalStatusRepository
    {

        Task<(int TotalRecords, IEnumerable<dynamic> Records)> GetStatusAsync(
           int pageIndex,
            int pageSize,
            string? searchTerm
        );


        Task<(int TotalRecords, IEnumerable<dynamic> Records)> GetStatusPdfAsync(
       string empcode
     );
    }
}
