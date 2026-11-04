using HRMSWebAPI.Models;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IRequestLogRepository
    {
        Task LogRequestAsync(RequestLog requestLog);
    }
}
