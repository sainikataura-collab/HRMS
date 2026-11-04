using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IManPowerApproveRepository
    {
        Task<bool> InsertJobRequisitionApprovalAsync(ManPowerApproveMstApprovalDataSet approvalDataSet);

       Task<ManPowerApproveMstDataSet?> GetAllManpowerApprovalAsync(string fk_empid);

    }
}
