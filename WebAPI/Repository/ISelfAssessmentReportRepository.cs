namespace HRMSWebAPI.Repository
{
    public interface ISelfAssessmentReportRepository
    {


      
        Task<(int totalCount, IEnumerable<dynamic>)> GetAllSelfAssessment(int pageIndex, int pageSize, string? searchTerm);
    }
}
