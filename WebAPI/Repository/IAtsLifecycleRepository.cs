using HRMSWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public interface IAtsLifecycleRepository
    {
        Task<IEnumerable<dynamic>> GetVendorsForMappingAsync(long reqId, string companyId, string? vendorType);
        Task<IEnumerable<dynamic>> GetVendorsByLocationAsync(string companyId, string? locationId, long? reqId);
        Task<dynamic?> AssignVendorToCandidateAsync(AssignVendorToCandidateDto dto, string assignedBy, string companyId);
        Task<dynamic?> SaveVendorMappingAsync(VendorMappingDto dto, string companyId);
        Task<int> SaveBulkVendorMappingAsync(List<VendorMappingDto> dtoList, Func<string?, string> resolveCompanyId);
        Task LogEmailAuditAsync(string toAddress, string subject, string body, int status, string errorMsg);
        Task DeallocateVendorAsync(long reqId, string vendorId, string companyId);
        Task<int> DeallocateBulkVendorsAsync(List<VendorMappingDto> dtoList, Func<string?, string> resolveCompanyId);
        Task<dynamic?> GetUserVendorProfileAsync(string userId, string companyId);
        Task<IEnumerable<dynamic>> GetVendorListForPortalAsync(string companyId);
        Task<dynamic?> GetVendorPortalMetricsAsync(string vendorId, string companyId);
        Task<IEnumerable<dynamic>> GetVendorAssignedJobsAsync(string vendorId, string companyId);
        Task<IEnumerable<dynamic>> GetVendorSelectedCandidatesAsync(string vendorId, string companyId);
        Task<IEnumerable<dynamic>> GetVendorJobSubmissionsAsync(string vendorId, long reqId, string companyId);
        Task<IEnumerable<dynamic>> GetVendorAllCandidatesAsync(string vendorId, string stageFilter, string? searchQuery, string companyId);
        Task<IEnumerable<dynamic>> GetVendorPoolCandidatesAsync(string? vendorId, long? targetReqId, string? searchQuery, string poolFilter, string companyId);
        Task<dynamic?> SubmitVendorCandidateAsync(long? reqId, string vendorId, string vendorName, VendorCandidateItemDto candidate, string userId, string companyId);
        Task<dynamic?> GetJobRequisitionOwnerAsync(long? reqId);
        Task<dynamic?> AssignBenchCandidatesToJobAsync(long reqId, string? effectiveVendorId, string appIdCsv, string userId, string companyId);
        Task<dynamic?> RegisterCandidateApplicationAsync(CandidateRegistrationDto dto, string companyId);
        Task<IEnumerable<dynamic>> GetCandidatePipelineAsync(long? reqId, string stageFilter, string? searchQuery, string companyId);
        Task<dynamic?> ScheduleInterviewAsync(ScheduleInterviewDto dto, string companyId);
        Task<dynamic?> GetCandidateApplicationBriefAsync(long appId);
        Task<dynamic?> SubmitInterviewEvaluationAsync(InterviewEvaluationDto dto, string companyId);
        Task<dynamic?> SaveCandidateOnboardingDocsAsync(OnboardingDocsDto dto, string companyId);
        Task<dynamic?> VerifyCandidateDocumentsAsync(VerifyDocsDto dto, string companyId);
        Task<(dynamic? candidate, IEnumerable<dynamic> documents)> GetCandidateDocumentsAsync(long appId, string companyId);
        Task<dynamic?> UploadCandidateDocumentItemAsync(long appId, string docTypeCode, string fileName, string filePath, long fileSize, string fileType, string userId, string companyId);
        Task<dynamic?> GetCandidateDocumentFileAsync(long? docId, long? appId, string? docTypeCode, string companyId);
        Task<dynamic?> VerifyCandidateDocumentItemAsync(VerifyDocItemDto dto, string verifiedBy, string companyId);
        Task MarkCandidateDocumentViewedAsync(long? docId, long? appId, string? docTypeCode, string viewedBy);
        Task<dynamic?> SaveCandidateOnboardingDossierAsync(CandidateDossierDto dto, string userId, string companyId);
        Task<dynamic?> GenerateOfferLetterAsync(GenerateOfferDto dto, string companyId);
        Task<dynamic?> GenerateOfferLetterDetailedAsync(long appId, string companyId, string issuedBy, string designation, string department, string location, string reportingManager, DateTime? joiningDate, string probationPeriod, string noticePeriod, decimal grossCTC, decimal basicSalary, decimal hra, decimal da, decimal conveyance, decimal medicalAllowance, decimal otherAllowance, decimal pfDeduction);
        Task SaveOfferLetterPathAsync(long appId, int offerId, string relativePdfPath, string? salaryHeadsJson = null);
        Task UpdateOfferLetterEmailStatusAsync(int offerId, string emailSentTo, string relativePdfPath);
        Task<IEnumerable<dynamic>> GetOfferLetterHistoryAsync(long appId, string companyId);
        Task<dynamic?> GetOfferLetterRecordAsync(int offerId);
        Task<dynamic?> GetOfferLetterRecordByAppIdAsync(long appId);
        Task<dynamic?> HireAndTransferToEmployeeMasterAsync(HireTransferDto dto, string companyId);
        Task<dynamic?> TagCandidateAsync(TagCandidateDto dto, string companyId);
        Task<dynamic?> MoveCandidateStageAsync(MoveCandidateStageDto dto, string companyId);
        Task<dynamic?> RejectCandidateAsync(RejectCandidateDto dto, string companyId);
        Task<IEnumerable<dynamic>> GetCandidateLifecycleAuditAsync(long appId, string companyId);
        Task<IEnumerable<dynamic>> GetCandidateAuditTrailAsync(long appId, string companyId);
        Task<(dynamic? funnel, IEnumerable<dynamic> locationDemand, IEnumerable<dynamic> skillDistribution)> GetRecruitmentMISReportAsync(string companyId);
        Task<IEnumerable<dynamic>> GetCandidateOfferDetailsForVendorBatchAsync(List<long> appIds, string companyId);
        Task UpdateCandidateOfferEmailStatusBatchAsync(List<long> appIds, string vendorEmail, string sentBy);
        Task<ValidateAadhaarResultDto> ValidateAadhaarUniquenessAsync(string aadhaarNo, string? companyId, long? currentAppId);
    }
}
