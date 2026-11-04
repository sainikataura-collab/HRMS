namespace HRMSWebAPI.Repository
{
    public interface IEmpwiseKraReportRepository
    {

        Task<(int TotalRecords, IEnumerable<dynamic> Records)> GetKRAReportAsync(
      string? fk_empId,
      int pageIndex,
      int pageSize,
      string? searchTerm
  );
    }
}
