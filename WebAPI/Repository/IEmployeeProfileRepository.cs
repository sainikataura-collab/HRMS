using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeProfileRepository
    {
       Task<EmployeeFullProfileResponse> GetEmployeeFullProfileByIdAsync(string empId);

    }
}
