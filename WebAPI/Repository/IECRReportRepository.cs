using System.Data;
using System.Threading.Tasks;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IECRReportRepository
    {
        Task<(DataTable Header, DataTable Details)> GetECRReportDataAsync(ReportModelRequest request);
    }
}
