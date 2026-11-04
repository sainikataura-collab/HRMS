using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IApprovalSectionDocRepository 
    {
        public  Task<FullSectionDocList> GetEmployeeSearchForSectionDoc(
        string ecode,
        string location,
        string department,
        string ename,
        string leftstatus,
        string fk_companyId,
        string fk_empid,
        string fk_finid);

        public Task<bool> InsertApprovalSectionDocAsync(List<ApprovalSectionDocMst> approvalList);

    }
}
