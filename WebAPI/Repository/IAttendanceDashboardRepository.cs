using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IAttendanceDashboardRepository
    {
        Task<AttendanceDashboardOverviewResponse> GetKPIsAndTrendsAsync(AttendanceDashboardFilterRequest request, string companyId, string userId);
        Task<AttendanceDashboardGridResponse> GetEmployeeGridAsync(AttendanceDashboardFilterRequest request, string companyId, string userId);
        Task<List<EmployeeOccurrenceItem>> GetEmployeeOccurrencesAsync(string empCode, string empId, int monthId, int yearId, string statusFilter);
        Task<byte[]> ExportToExcelWithImagesAsync(AttendanceDashboardFilterRequest request, string companyId, string userId, string uploadFolder);
    }
}
