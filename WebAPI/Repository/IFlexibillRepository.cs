using Dapper;
using HRMSWebAPI.Helper;
using System.Data;
using static HRMSWebAPI.Models.FlexibillApproval;

namespace HRMSWebAPI.Repository
{
    public interface IFlexibillRepository
    {


        Task<FlexiBillProcessModel> GetFlexiBillsAsync(
          string empCode,
          List<string> selectedDepartments,
          List<string> SelectedLocations,       
          string empName,
          string leftStatus,
          string fkCompanyId,
          string fkEmpId,
          string? fkFinId);

        Task<bool> InsertApprovalAsync(ApprovalRootDataSet approvalDataSet);
        Task<GetByIdModel> GetByIdAsync(long? flexiheadnillId);

    }
}
