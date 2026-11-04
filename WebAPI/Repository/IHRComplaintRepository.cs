using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IHRComplaintRepository
    {
        Task<bool> InsertEmployeeComplaint(HRComplaintMst complaint);
        Task<(int totalCount, IEnumerable<HRComplaintMst>)> GetAll(int pageIndex, int pageSize);
        Task<HRComplaintMst> GetById(long pk_complaintId);
        Task<bool> UpdateEmployeeComplaint(HRComplaintMst complaint);
        Task<bool> DeleteEmployeeComplaint(string pk_complaintId);
    }
}
