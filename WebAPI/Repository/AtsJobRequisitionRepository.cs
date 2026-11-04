using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class AtsJobRequisitionRepository : IAtsJobRequisitionRepository
    {
        public async Task<(IEnumerable<dynamic> departments, IEnumerable<dynamic> locations, IEnumerable<dynamic> designations, IEnumerable<dynamic> employees, dynamic? defaultLocation)> GetRequisitionMasterDataAsync(string? userId, string? loginName, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_REC_GetRequisitionMasterData",
                new { UserId = userId, LoginName = loginName, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            var depts = await multi.ReadAsync<dynamic>();
            var locs = await multi.ReadAsync<dynamic>();
            var desigs = await multi.ReadAsync<dynamic>();
            var emps = await multi.ReadAsync<dynamic>();
            var defaultLoc = await multi.ReadFirstOrDefaultAsync<dynamic>();

            return (depts, locs, desigs, emps, defaultLoc);
        }

        public async Task<IEnumerable<dynamic>> GetJobRequisitionsAsync(
            string? status,
            string? priority,
            string? locationId,
            string? departmentId,
            string? searchQuery,
            int pageIndex,
            int pageSize,
            string? companyId,
            string? roleScope,
            string? scopedUserId,
            string? scopedLocationId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetJobRequisitions",
                new
                {
                    Status = status,
                    Priority = priority,
                    LocationId = locationId,
                    DepartmentId = departmentId,
                    SearchQuery = searchQuery,
                    PageIndex = pageIndex,
                    PageSize = pageSize,
                    CompanyId = companyId,
                    RoleScope = roleScope,
                    ScopedUserId = scopedUserId,
                    ScopedLocationId = scopedLocationId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> ResolveUserNameAsync(string userId, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_UM_ResolveUserName",
                new { UserId = userId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> SaveJobRequisitionAsync(object spParams)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_SaveJobRequisition",
                spParams,
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GetJobRequisitionByIdAsync(long reqId, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_GetJobRequisitionById",
                new { ReqId = reqId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> UpdateJobRequisitionAsync(object spParams)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_UpdateJobRequisition",
                spParams,
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GetMyApprovalLevelAsync(string userId, string userRole, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_GetMyApprovalLevel",
                new { UserId = userId, UserRole = userRole, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<(IEnumerable<dynamic> pending, dynamic? stats)> GetPendingApprovalsAsync(string userId, string userRole, string? companyId, int? approvalLevel)
        {
            using var conn = DataBaseFactory.ConnString();
            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_REC_GetPendingApprovals",
                new { UserId = userId, UserRole = userRole, CompanyId = companyId, ApprovalLevel = approvalLevel },
                commandType: CommandType.StoredProcedure);

            var pending = await multi.ReadAsync<dynamic>();
            var stats = await multi.ReadFirstOrDefaultAsync<dynamic>();

            return (pending, stats);
        }

        public async Task<dynamic?> ApproveRequisitionAsync(long reqId, int approvalLevel, string approverId, string approverName, string? approverRole, string remarks, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_ApproveRequisition",
                new
                {
                    ReqId = reqId,
                    ApprovalLevel = approvalLevel,
                    ApproverId = approverId,
                    ApproverName = approverName,
                    ApproverRole = approverRole,
                    Remarks = remarks,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> RejectRequisitionAsync(long reqId, int approvalLevel, string approverId, string approverName, string? approverRole, string remarks, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_RejectRequisition",
                new
                {
                    ReqId = reqId,
                    ApprovalLevel = approvalLevel,
                    ApproverId = approverId,
                    ApproverName = approverName,
                    ApproverRole = approverRole,
                    Remarks = remarks,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<(IEnumerable<dynamic> history, dynamic? requisition)> GetApprovalHistoryAsync(long reqId, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_REC_GetApprovalHistory",
                new { ReqId = reqId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            var history = await multi.ReadAsync<dynamic>();
            var requisition = await multi.ReadFirstOrDefaultAsync<dynamic>();

            return (history, requisition);
        }

        public async Task<dynamic?> UpdateLocationManpowerBufferAsync(string locationId, int baseDemand, decimal bufferPercent, string? modifiedBy)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.Location_Update_Manpower_Buffer",
                new
                {
                    pk_locid = locationId,
                    BaseDemand = baseDemand,
                    BufferPercent = bufferPercent,
                    ModifiedBy = modifiedBy
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetLocationManpowerListAsync(string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetLocationManpowerList",
                new { CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<(dynamic? location, IEnumerable<dynamic> jobs, IEnumerable<dynamic> vendors)> GetPublicLocationJobsAndVendorsAsync(string locationId, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_REC_GetPublicLocationJobsAndVendors",
                new { LocationId = locationId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            var location = await multi.ReadFirstOrDefaultAsync<dynamic>();
            var jobs = await multi.ReadAsync<dynamic>();
            var vendors = await multi.ReadAsync<dynamic>();

            return (location, jobs, vendors);
        }

        public async Task<dynamic?> CheckCandidateAadhaarStatusAsync(string aadhaarNo, string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_CheckCandidateAadhaarStatus",
                new { AadhaarNo = aadhaarNo, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> SubmitWalkInCandidateAsync(
            string candidateName,
            string mobileNumber,
            string? aadharNo,
            string? vendorId,
            string? vendorName,
            string? jobId,
            string? jobTitle,
            string? locationId,
            string? companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_SubmitWalkInCandidate",
                new
                {
                    CandidateName = candidateName,
                    MobileNumber = mobileNumber,
                    AadhaarNo = aadharNo,
                    VendorId = vendorId,
                    VendorName = vendorName,
                    JobId = jobId,
                    JobTitle = jobTitle,
                    LocationId = locationId,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetPipelineStageConfigAsync(string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetPipelineStageConfig",
                new { CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> UpsertPipelineStageConfigAsync(
            string companyId,
            string stageCode,
            string stageLabel,
            string? stageIcon,
            string? stageColor,
            int stageOrder,
            bool isEnabled,
            string modifiedBy)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_UpsertPipelineStageConfig",
                new
                {
                    CompanyId = companyId,
                    StageCode = stageCode,
                    StageLabel = stageLabel,
                    StageIcon = stageIcon,
                    StageColor = stageColor,
                    StageOrder = stageOrder,
                    IsEnabled = isEnabled,
                    ModifiedBy = modifiedBy
                },
                commandType: CommandType.StoredProcedure);
        }
    }
}
