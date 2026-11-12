using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class AtsLifecycleRepository : IAtsLifecycleRepository
    {
        public async Task<IEnumerable<dynamic>> GetVendorsForMappingAsync(long reqId, string companyId, string? vendorType)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorsForRequisitionMapping",
                new { ReqId = reqId, CompanyId = companyId, VendorType = vendorType },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetVendorsByLocationAsync(string companyId, string? locationId, long? reqId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorsByCompanyAndLocation",
                new { CompanyId = companyId, LocationId = locationId, ReqId = reqId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> AssignVendorToCandidateAsync(AssignVendorToCandidateDto dto, string assignedBy, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_AssignVendorToCandidate",
                new
                {
                    AppId = dto.AppId,
                    VendorId = dto.VendorId,
                    VendorName = dto.VendorName,
                    AssignedBy = assignedBy,
                    CompanyId = companyId,
                    Remarks = dto.Remarks
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> SaveVendorMappingAsync(VendorMappingDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_SaveVendorRequisitionMapping",
                new
                {
                    ReqId = dto.ReqId,
                    VendorId = dto.VendorId,
                    VendorName = dto.VendorName,
                    VendorType = !string.IsNullOrWhiteSpace(dto.VendorType) ? dto.VendorType : "Supply Vendors",
                    AllocatedQuota = dto.AllocatedQuota > 0 ? dto.AllocatedQuota : 10,
                    CommissionTerms = dto.CommissionTerms ?? "Standard",
                    IsActive = dto.IsActive,
                    AssignedBy = dto.AssignedBy ?? "Site HR",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> SaveBulkVendorMappingAsync(List<VendorMappingDto> dtoList, Func<string?, string> resolveCompanyId)
        {
            using var conn = DataBaseFactory.ConnString();
            int successCount = 0;

            foreach (var dto in dtoList)
            {
                var scopedCompanyId = resolveCompanyId(dto.CompanyId);
                await conn.ExecuteAsync(
                    "dbo.usp_REC_SaveVendorRequisitionMapping",
                    new
                    {
                        ReqId = dto.ReqId,
                        VendorId = dto.VendorId,
                        VendorName = dto.VendorName,
                        VendorType = !string.IsNullOrWhiteSpace(dto.VendorType) ? dto.VendorType : "Supply Vendors",
                        AllocatedQuota = dto.AllocatedQuota > 0 ? dto.AllocatedQuota : 10,
                        CommissionTerms = dto.CommissionTerms ?? (dto.VendorType == "TA" ? "In-house TA Direct" : "Standard (8.33%)"),
                        IsActive = dto.IsActive,
                        AssignedBy = dto.AssignedBy ?? "Administrator",
                        CompanyId = scopedCompanyId
                    },
                    commandType: CommandType.StoredProcedure);
                successCount++;
            }

            return successCount;
        }

        public async Task LogEmailAuditAsync(string toAddress, string subject, string body, int status, string errorMsg)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@TOAddress", toAddress);
                p.Add("@TOSubject", subject);
                p.Add("@MailBody", body);
                p.Add("@status", status);
                p.Add("@ErrorMsg", errorMsg ?? string.Empty);
                DataBaseFactory.QuerySP("SAL_Email_Log_Ins", p, "Audit");
            }
            catch
            {
                // Non-blocking email audit logging
            }
        }

        public async Task DeallocateVendorAsync(long reqId, string vendorId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            await conn.ExecuteAsync(
                "dbo.usp_REC_DeallocateVendorRequisitionMapping",
                new { ReqId = reqId, VendorId = vendorId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> DeallocateBulkVendorsAsync(List<VendorMappingDto> dtoList, Func<string?, string> resolveCompanyId)
        {
            using var conn = DataBaseFactory.ConnString();
            int successCount = 0;

            foreach (var dto in dtoList)
            {
                var scopedCompanyId = resolveCompanyId(dto.CompanyId);
                await conn.ExecuteAsync(
                    "dbo.usp_REC_DeallocateVendorRequisitionMapping",
                    new { ReqId = dto.ReqId, VendorId = dto.VendorId, CompanyId = scopedCompanyId },
                    commandType: CommandType.StoredProcedure);
                successCount++;
            }

            return successCount;
        }

        public async Task<dynamic?> GetUserVendorProfileAsync(string userId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_UM_GetUserVendorProfile",
                new { UserId = userId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetVendorListForPortalAsync(string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorListForPortal",
                new { CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GetVendorPortalMetricsAsync(string vendorId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_GetVendorPortalMetrics",
                new { VendorId = vendorId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetVendorAssignedJobsAsync(string vendorId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorAssignedJobs",
                new { VendorId = vendorId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetVendorSelectedCandidatesAsync(string vendorId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorSelectedCandidates",
                new { VendorId = vendorId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetVendorJobSubmissionsAsync(string vendorId, long reqId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorJobSubmissions",
                new { VendorId = vendorId, ReqId = reqId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetVendorAllCandidatesAsync(string vendorId, string stageFilter, string? searchQuery, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorAllCandidates",
                new
                {
                    VendorId = vendorId,
                    CompanyId = companyId,
                    StageFilter = stageFilter ?? "ALL",
                    SearchQuery = searchQuery
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetVendorPoolCandidatesAsync(string? vendorId, long? targetReqId, string? searchQuery, string poolFilter, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetVendorPoolCandidates",
                new
                {
                    VendorId = vendorId,
                    CompanyId = companyId,
                    TargetReqId = targetReqId,
                    SearchQuery = searchQuery,
                    PoolFilter = poolFilter ?? "ALL"
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> SubmitVendorCandidateAsync(long? reqId, string vendorId, string vendorName, VendorCandidateItemDto candidate, string userId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_SubmitVendorCandidate",
                new
                {
                    ReqId = reqId,
                    VendorId = vendorId,
                    VendorName = vendorName,
                    CandidateName = candidate.CandidateName.Trim(),
                    Mobile = candidate.Mobile.Trim(),
                    Email = candidate.Email?.Trim(),
                    Gender = candidate.Gender ?? "Male",
                    Religion = candidate.Religion?.Trim(),
                    ReligionId = candidate.ReligionId,
                    DateOfBirth = candidate.DateOfBirth,
                    FatherName = candidate.FatherName?.Trim(),
                    AadhaarNo = candidate.AadhaarNo?.Trim(),
                    ResumeDocPath = candidate.ResumeDocPath,
                    SubmittedBy = userId,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GetJobRequisitionOwnerAsync(long? reqId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT SubmittedById, MrfCode FROM dbo.REC_Job_Requisitions WHERE ReqId = @ReqId",
                new { ReqId = reqId });
        }

        public async Task<dynamic?> AssignBenchCandidatesToJobAsync(long reqId, string? effectiveVendorId, string appIdCsv, string userId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_AssignBenchCandidatesToJob",
                new
                {
                    ReqId = reqId,
                    VendorId = effectiveVendorId,
                    AppIdList = appIdCsv,
                    AssignedBy = userId,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> RegisterCandidateApplicationAsync(CandidateRegistrationDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_RegisterCandidateApplication",
                new
                {
                    ReqId = dto.ReqId,
                    CandidateName = dto.CandidateName,
                    Mobile = dto.Mobile,
                    Email = dto.Email,
                    Gender = dto.Gender ?? "Male",
                    DateOfBirth = dto.DateOfBirth,
                    FatherName = dto.FatherName,
                    CurrentLocation = dto.CurrentLocation,
                    SourceType = dto.SourceType ?? "Vendor",
                    VendorId = dto.VendorId,
                    VendorName = dto.VendorName,
                    AadhaarNo = dto.AadhaarNo,
                    CreatedBy = dto.CreatedBy ?? "Recruiter",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetCandidatePipelineAsync(long? reqId, string stageFilter, string? searchQuery, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetCandidatePipelineRoster",
                new
                {
                    CompanyId = companyId,
                    ReqId = reqId,
                    StageFilter = stageFilter ?? "ALL",
                    SearchQuery = searchQuery
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> ScheduleInterviewAsync(ScheduleInterviewDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_ScheduleCandidateInterview",
                new
                {
                    AppId = dto.AppId,
                    InterviewerId = dto.InterviewerId ?? "",
                    InterviewerName = dto.InterviewerName,
                    InterviewDate = dto.InterviewDate,
                    InterviewRound = dto.InterviewRound ?? "Technical & Operations",
                    Remarks = dto.Remarks,
                    ScheduledBy = dto.ScheduledBy ?? "Site HR",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GetCandidateApplicationBriefAsync(long appId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT fk_vendorId, CandidateName, MrfCode FROM dbo.REC_Candidate_Applications WHERE pk_appId = @AppId",
                new { AppId = appId });
        }

        public async Task<dynamic?> SubmitInterviewEvaluationAsync(InterviewEvaluationDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_SubmitInterviewEvaluation",
                new
                {
                    AppId = dto.AppId,
                    SkillClassification = dto.SkillClassification ?? "Semi-Skilled",
                    Decision = dto.Decision,
                    Remarks = dto.Remarks ?? "Interview completed.",
                    Score = dto.Score > 0 ? dto.Score : 80,
                    EvaluatorName = dto.EvaluatorName ?? "Interviewer",
                    CompanyId = companyId,
                    InterviewerName = dto.InterviewerName ?? dto.EvaluatorName ?? "Interviewer",
                    InterviewerPhone = dto.InterviewerPhone
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> SaveCandidateOnboardingDocsAsync(OnboardingDocsDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_SaveCandidateOnboardingDocs",
                new
                {
                    AppId = dto.AppId,
                    AadhaarNo = dto.AadhaarNo,
                    AadhaarDocPath = dto.AadhaarDocPath,
                    PanNo = dto.PanNo,
                    PanDocPath = dto.PanDocPath,
                    BankAccNo = dto.BankAccNo,
                    BankIfsc = dto.BankIfsc,
                    BankName = dto.BankName,
                    PhotoDocPath = dto.PhotoDocPath,
                    ResumeDocPath = dto.ResumeDocPath,
                    SubmittedBy = dto.SubmittedBy ?? "Candidate/Vendor",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> VerifyCandidateDocumentsAsync(VerifyDocsDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_VerifyCandidateDocuments",
                new
                {
                    AppId = dto.AppId,
                    IsApproved = dto.IsApproved,
                    Remarks = dto.Remarks,
                    VerifiedBy = dto.VerifiedBy ?? "Site HR",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<(dynamic? candidate, IEnumerable<dynamic> documents)> GetCandidateDocumentsAsync(long appId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_REC_GetCandidateDocuments",
                new { AppId = appId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            var candidate = await multi.ReadFirstOrDefaultAsync<dynamic>();
            var documents = await multi.ReadAsync<dynamic>();
            return (candidate, documents);
        }

        public async Task<dynamic?> UploadCandidateDocumentItemAsync(long appId, string docTypeCode, string fileName, string filePath, long fileSize, string fileType, string userId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_UploadCandidateDocumentItem",
                new
                {
                    AppId = appId,
                    DocTypeCode = docTypeCode,
                    FileName = fileName,
                    FilePath = filePath,
                    FileSize = fileSize,
                    FileType = fileType,
                    UploadedBy = userId,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GetCandidateDocumentFileAsync(long? docId, long? appId, string? docTypeCode, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_GetCandidateDocumentFile",
                new
                {
                    DocId = docId.HasValue && docId.Value > 0 ? docId.Value : (long?)null,
                    AppId = appId.HasValue && appId.Value > 0 ? appId.Value : (long?)null,
                    DocTypeCode = !string.IsNullOrEmpty(docTypeCode) ? docTypeCode : null,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> VerifyCandidateDocumentItemAsync(VerifyDocItemDto dto, string verifiedBy, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_VerifyCandidateDocumentItem",
                new
                {
                    AppId = dto.AppId,
                    DocTypeCode = dto.DocTypeCode,
                    Status = dto.Status,
                    RejectionRemarks = dto.RejectionRemarks,
                    VerifiedBy = verifiedBy,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task MarkCandidateDocumentViewedAsync(long? docId, long? appId, string? docTypeCode, string viewedBy)
        {
            using var conn = DataBaseFactory.ConnString();
            await conn.ExecuteAsync(
                "dbo.usp_REC_MarkCandidateDocViewed",
                new
                {
                    DocId = docId,
                    AppId = appId,
                    DocTypeCode = docTypeCode,
                    ViewedBy = viewedBy ?? "HR Admin"
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> SaveCandidateOnboardingDossierAsync(CandidateDossierDto dto, string userId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_SaveCandidateOnboardingDossier",
                new
                {
                    AppId = dto.AppId,
                    AadhaarNo = dto.AadhaarNo,
                    PanNo = dto.PanNo,
                    BankAccNo = dto.BankAccNo,
                    BankIfsc = dto.BankIfsc,
                    BankName = dto.BankName,
                    NomineeName = dto.NomineeName,
                    NomineeRelation = dto.NomineeRelation,
                    NomineeDOB = dto.NomineeDOB,
                    NomineeContact = dto.NomineeContact,
                    UanNo = dto.UanNo,
                    EsicNo = dto.EsicNo,
                    CandidateName = dto.CandidateName,
                    Mobile = dto.Mobile,
                    Email = dto.Email,
                    Gender = dto.Gender,
                    DateOfBirth = dto.DateOfBirth,
                    FatherName = dto.FatherName,
                    Religion = dto.Religion?.Trim(),
                    ReligionId = dto.ReligionId,
                    SubmittedBy = userId,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GenerateOfferLetterAsync(GenerateOfferDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_GenerateOfferLetter",
                new
                {
                    AppId = dto.AppId,
                    OfferedCTC = dto.OfferedCTC,
                    ExpectedJoiningDate = dto.ExpectedJoiningDate,
                    IssuedBy = dto.IssuedBy ?? "Corporate HR",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GenerateOfferLetterDetailedAsync(
            long appId,
            string companyId,
            string issuedBy,
            string designation,
            string department,
            string location,
            string reportingManager,
            DateTime? joiningDate,
            string probationPeriod,
            string noticePeriod,
            decimal grossCTC,
            decimal basicSalary,
            decimal hra,
            decimal da,
            decimal conveyance,
            decimal medicalAllowance,
            decimal otherAllowance,
            decimal pfDeduction)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_GenerateOfferLetter",
                new
                {
                    AppId = appId,
                    CompanyId = companyId,
                    IssuedBy = issuedBy,
                    Designation = designation,
                    Department = department,
                    Location = location,
                    ReportingManager = reportingManager,
                    JoiningDate = joiningDate,
                    ProbationPeriod = probationPeriod,
                    NoticePeriod = noticePeriod,
                    GrossCTC = grossCTC,
                    BasicSalary = basicSalary,
                    HRA = hra,
                    DA = da,
                    Conveyance = conveyance,
                    MedicalAllowance = medicalAllowance,
                    OtherAllowance = otherAllowance,
                    PfDeduction = pfDeduction
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task SaveOfferLetterPathAsync(long appId, int offerId, string relativePdfPath, string? salaryHeadsJson = null)
        {
            using var conn = DataBaseFactory.ConnString();
            await conn.ExecuteAsync(
                "dbo.usp_REC_SaveOfferLetterPath",
                new { AppId = appId, OfferId = offerId, PdfFilePath = relativePdfPath, SalaryHeadsJson = salaryHeadsJson },
                commandType: CommandType.StoredProcedure);
        }

        public async Task UpdateOfferLetterEmailStatusAsync(int offerId, string emailSentTo, string relativePdfPath)
        {
            using var conn = DataBaseFactory.ConnString();
            await conn.ExecuteAsync(
                "dbo.USP_REC_UpdateOfferLetterEmailStatus",
                new { OfferId = offerId, EmailSentTo = emailSentTo, PdfFilePath = relativePdfPath },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetOfferLetterHistoryAsync(long appId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.USP_REC_GetOfferLetterHistory",
                new { AppId = appId, CompanyId = companyId ?? "" },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> GetOfferLetterRecordAsync(int offerId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT pdfFilePath, candidateName, salaryHeadsJson FROM dbo.REC_OfferLetters WHERE pk_offerId = @OfferId",
                new { OfferId = offerId });
        }

        public async Task<dynamic?> GetOfferLetterRecordByAppIdAsync(long appId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT COALESCE(NULLIF((SELECT TOP 1 pdfFilePath FROM dbo.REC_OfferLetters WHERE fk_appId = @AppId AND isActive = 1 ORDER BY pk_offerId DESC), ''),
                                 NULLIF(OfferLetterDocPath, '')) AS pdfFilePath,
                         (SELECT TOP 1 salaryHeadsJson FROM dbo.REC_OfferLetters WHERE fk_appId = @AppId AND isActive = 1 ORDER BY pk_offerId DESC) AS salaryHeadsJson,
                         CandidateName
                  FROM dbo.REC_Candidate_Applications WHERE pk_appId = @AppId",
                new { AppId = appId });
        }

        public async Task<dynamic?> HireAndTransferToEmployeeMasterAsync(HireTransferDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_HireAndTransferToEmployeeMaster",
                new
                {
                    AppId = dto.AppId,
                    HiredBy = dto.HiredBy ?? "Site HR",
                    CompanyId = companyId,
                    CandidateName = dto.CandidateName,
                    FatherName = dto.FatherName,
                    MotherName = dto.MotherName,
                    Gender = dto.Gender,
                    DateOfBirth = dto.DateOfBirth,
                    Mobile = dto.Mobile,
                    Email = dto.Email,
                    AadhaarNo = dto.AadhaarNo,
                    PanNo = dto.PanNo,
                    BankAccNo = dto.BankAccNo,
                    BankIfsc = dto.BankIfsc,
                    BankName = dto.BankName,
                    UanNo = dto.UanNo,
                    EsicNo = dto.EsicNo,
                    NomineeName = dto.NomineeName,
                    NomineeRelation = dto.NomineeRelation,
                    NomineeContact = dto.NomineeContact,
                    CategoryId = dto.CategoryId,
                    ReligionId = dto.ReligionId,
                    NatureId = dto.NatureId,
                    DepartmentId = dto.DepartmentId,
                    DesignationId = dto.DesignationId,
                    LocationId = dto.LocationId,
                    CostCenterId = dto.CostCenterId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> TagCandidateAsync(TagCandidateDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_TagCandidate",
                new
                {
                    AppId = dto.AppId,
                    ReqId = dto.ReqId,
                    SkillClassification = dto.SkillClassification ?? "Semi-Skilled",
                    CandidateTags = dto.CandidateTags,
                    IsDiversityHiring = dto.IsDiversityHiring,
                    AssignedReviewer = dto.AssignedReviewer,
                    Remarks = dto.Remarks,
                    TaggedBy = dto.TaggedBy ?? "Recruiter",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> MoveCandidateStageAsync(MoveCandidateStageDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_MoveCandidateStage",
                new
                {
                    AppId = dto.AppId,
                    TargetStage = dto.TargetStage,
                    Remarks = dto.Remarks,
                    MovedBy = dto.MovedBy ?? "Recruiter",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<dynamic?> RejectCandidateAsync(RejectCandidateDto dto, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryFirstOrDefaultAsync<dynamic>(
                "dbo.usp_REC_RejectCandidate",
                new
                {
                    AppId = dto.AppId,
                    RejectionReason = dto.RejectionReason,
                    Remarks = dto.Remarks,
                    CooloffPolicy = dto.CooloffPolicy ?? "90_Days",
                    NotifyCandidate = dto.NotifyCandidate,
                    RejectedBy = dto.RejectedBy ?? "Recruiter",
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetCandidateLifecycleAuditAsync(long appId, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            return await conn.QueryAsync<dynamic>(
                "dbo.usp_REC_GetCandidateLifecycleAudit",
                new { AppId = appId, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<dynamic>> GetCandidateAuditTrailAsync(long appId, string companyId)
        {
            return await GetCandidateLifecycleAuditAsync(appId, companyId);
        }

        public async Task<(dynamic? funnel, IEnumerable<dynamic> locationDemand, IEnumerable<dynamic> skillDistribution)> GetRecruitmentMISReportAsync(string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            using var multi = await conn.QueryMultipleAsync(
                "dbo.usp_REC_GetRecruitmentMISReport",
                new { CompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            var funnel = await multi.ReadFirstOrDefaultAsync<dynamic>();
            var locationDemand = await multi.ReadAsync<dynamic>();
            var skillDistribution = await multi.ReadAsync<dynamic>();

            return (funnel, locationDemand, skillDistribution);
        }

        public async Task<IEnumerable<dynamic>> GetCandidateOfferDetailsForVendorBatchAsync(List<long> appIds, string companyId)
        {
            using var conn = DataBaseFactory.ConnString();
            var sql = @"
                SELECT 
                    ca.pk_appId               AS appId,
                    ca.ApplicationNo          AS applicationNo,
                    ca.CandidateName          AS candidateName,
                    ca.Designation            AS designation,
                    ca.Department             AS department,
                    ca.ExpectedJoiningDate    AS expectedJoiningDate,
                    ca.OfferedCTC             AS offeredCTC,
                    COALESCE(
                        NULLIF(ca.OfferPdfPath, ''),
                        NULLIF(ca.OfferLetterDocPath, ''),
                        (SELECT TOP 1 pdfFilePath FROM dbo.REC_OfferLetters WHERE fk_appId = ca.pk_appId AND isActive = 1 ORDER BY pk_offerId DESC)
                    )                         AS offerPdfPath,
                    ISNULL(ca.IsOfferEmailSent, 0) AS isOfferEmailSent,
                    ca.OfferEmailSentDate     AS offerEmailSentDate,
                    ca.OfferEmailSentTo       AS offerEmailSentTo,
                    ca.fk_vendorId            AS vendorId,
                    COALESCE(
                        NULLIF(cd.Vendor_Name, ''), 
                        NULLIF(ca.VendorName, ''), 
                        NULLIF(cd.candidate_name, ''),
                        CASE WHEN ca.fk_vendorId IS NOT NULL AND ca.fk_vendorId <> '' THEN ca.fk_vendorId ELSE 'Direct' END
                    )                         AS vendorName,
                    COALESCE(NULLIF(cd.EmailID, ''), NULLIF(cd.email, '')) AS vendorEmail,
                    COALESCE(ca.CompanyId, ca.fk_companyId) AS companyId
                FROM dbo.REC_Candidate_Applications ca WITH (NOLOCK)
                LEFT JOIN dbo.REC_Candidate_Details cd WITH (NOLOCK) 
                       ON (cd.pk_recId = ca.fk_vendorId OR cd.Vendor_Code = ca.fk_vendorId)
                      AND cd.IsVendor = 1
                WHERE (ca.CompanyId = @CompanyId OR ca.fk_companyId = @CompanyId OR @CompanyId = '' OR @CompanyId = '0')
                  AND (@AppIdsCount = 0 OR ca.pk_appId IN @AppIds)
                  AND (ca.Stage IN ('Offer_Issued', 'Offer_Letter') OR ca.Stage LIKE '%Offer%');
            ";

            return await conn.QueryAsync<dynamic>(
                sql,
                new
                {
                    CompanyId = companyId ?? "",
                    AppIds = appIds,
                    AppIdsCount = appIds != null ? appIds.Count : 0
                });
        }

        public async Task UpdateCandidateOfferEmailStatusBatchAsync(List<long> appIds, string vendorEmail, string sentBy)
        {
            if (appIds == null || appIds.Count == 0) return;
            using var conn = DataBaseFactory.ConnString();
            await conn.ExecuteAsync(
                "dbo.usp_REC_UpdateOfferEmailTracking",
                new
                {
                    AppIdsCsv = string.Join(",", appIds),
                    VendorEmail = vendorEmail,
                    SentBy = sentBy ?? "HR Staffing Portal"
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<ValidateAadhaarResultDto> ValidateAadhaarUniquenessAsync(string aadhaarNo, string? companyId, long? currentAppId)
        {
            using var conn = DataBaseFactory.ConnString();
            var res = await conn.QueryFirstOrDefaultAsync<ValidateAadhaarResultDto>(
                "dbo.usp_REC_ValidateAadhaarCard",
                new
                {
                    AadhaarNo = aadhaarNo,
                    CompanyId = companyId ?? "",
                    CurrentAppId = currentAppId
                },
                commandType: CommandType.StoredProcedure);

            return res ?? new ValidateAadhaarResultDto
            {
                IsSuccess = false,
                IsDuplicate = false,
                CanProceed = false,
                DuplicateType = "ERROR",
                Message = "Unable to verify Aadhaar number at this time."
            };
        }
    }
}

