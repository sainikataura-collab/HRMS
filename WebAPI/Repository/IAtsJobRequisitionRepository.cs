using HRMSWebAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IAtsJobRequisitionRepository
    {
        Task<(IEnumerable<dynamic> departments, IEnumerable<dynamic> locations, IEnumerable<dynamic> designations, IEnumerable<dynamic> employees, dynamic? defaultLocation)> GetRequisitionMasterDataAsync(string? userId, string? loginName, string? companyId);
        Task<IEnumerable<dynamic>> GetJobRequisitionsAsync(string? status, string? priority, string? locationId, string? departmentId, string? searchQuery, int pageIndex, int pageSize, string? companyId, string? roleScope, string? scopedUserId, string? scopedLocationId);
        Task<dynamic?> ResolveUserNameAsync(string userId, string? companyId);
        Task<dynamic?> SaveJobRequisitionAsync(object spParams);
        Task<dynamic?> GetJobRequisitionByIdAsync(long reqId, string? companyId);
        Task<dynamic?> UpdateJobRequisitionAsync(object spParams);
        Task<dynamic?> GetMyApprovalLevelAsync(string userId, string userRole, string? companyId);
        Task<(IEnumerable<dynamic> pending, dynamic? stats)> GetPendingApprovalsAsync(string userId, string userRole, string? companyId, int? approvalLevel);
        Task<dynamic?> ApproveRequisitionAsync(long reqId, int approvalLevel, string approverId, string approverName, string? approverRole, string remarks, string? companyId);
        Task<dynamic?> RejectRequisitionAsync(long reqId, int approvalLevel, string approverId, string approverName, string? approverRole, string remarks, string? companyId);
        Task<(IEnumerable<dynamic> history, dynamic? requisition)> GetApprovalHistoryAsync(long reqId, string? companyId);
        Task<dynamic?> UpdateLocationManpowerBufferAsync(string locationId, int baseDemand, decimal bufferPercent, string? modifiedBy);
        Task<IEnumerable<dynamic>> GetLocationManpowerListAsync(string? companyId);
        Task<(dynamic? location, IEnumerable<dynamic> jobs, IEnumerable<dynamic> vendors)> GetPublicLocationJobsAndVendorsAsync(string locationId, string? companyId);
        Task<dynamic?> CheckCandidateAadhaarStatusAsync(string aadhaarNo, string? companyId);
        Task<dynamic?> SubmitWalkInCandidateAsync(string candidateName, string mobileNumber, string? aadharNo, string? vendorId, string? vendorName, string? jobId, string? jobTitle, string? locationId, string? companyId);
        Task<IEnumerable<dynamic>> GetPipelineStageConfigAsync(string companyId);
        Task<dynamic?> UpsertPipelineStageConfigAsync(string companyId, string stageCode, string stageLabel, string? stageIcon, string? stageColor, int stageOrder, bool isEnabled, string modifiedBy);
    }
}
