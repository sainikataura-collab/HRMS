using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    // =========================================================================
    // DTO MODELS FOR ATS LIFECYCLE (ZERO HARDCODING, 100% TYPED)
    // =========================================================================

    public class VendorMappingDto
    {
        public long ReqId { get; set; }
        public string VendorId { get; set; } = "";
        public string VendorName { get; set; } = "";
        public string? VendorType { get; set; } = "Supply Vendors"; // "TA" or "Supply Vendors"
        public int AllocatedQuota { get; set; } = 10;
        public string? CommissionTerms { get; set; }
        public bool IsActive { get; set; } = true;
        public string? AssignedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class CandidateRegistrationDto
    {
        public long? ReqId { get; set; }
        public string CandidateName { get; set; } = "";
        public string Mobile { get; set; } = "";
        public string? Email { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? FatherName { get; set; }
        public string? CurrentLocation { get; set; }
        public string? SourceType { get; set; } // Vendor / QR_Direct
        public string? VendorId { get; set; }
        public string? VendorName { get; set; }
        public string? AadhaarNo { get; set; }
        public string? CreatedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class ScheduleInterviewDto
    {
        public long AppId { get; set; }
        public string? InterviewerId { get; set; }
        public string InterviewerName { get; set; } = "";
        public DateTime InterviewDate { get; set; }
        public string? InterviewRound { get; set; }
        public string? Remarks { get; set; }
        public string? ScheduledBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class InterviewEvaluationDto
    {
        public long AppId { get; set; }
        public string SkillClassification { get; set; } = "Semi-Skilled"; // Unskilled / Semi-Skilled / Skilled / Highly Skilled
        public string Decision { get; set; } = "Selected"; // Selected / Rejected / Hold
        public string? Remarks { get; set; }
        public int Score { get; set; } = 80;
        public string? EvaluatorName { get; set; }
        public string? InterviewerName { get; set; }
        public string? InterviewerPhone { get; set; }
        public string? CompanyId { get; set; }
    }

    public class OnboardingDocsDto
    {
        public long AppId { get; set; }
        public string AadhaarNo { get; set; } = "";
        public string? AadhaarDocPath { get; set; }
        public string? PanNo { get; set; }
        public string? PanDocPath { get; set; }
        public string? BankAccNo { get; set; }
        public string? BankIfsc { get; set; }
        public string? BankName { get; set; }
        public string? PhotoDocPath { get; set; }
        public string? ResumeDocPath { get; set; }
        public string? SubmittedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class VerifyDocsDto
    {
        public long AppId { get; set; }
        public bool IsApproved { get; set; }
        public string? Remarks { get; set; }
        public string? VerifiedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class GenerateOfferDto
    {
        public long AppId { get; set; }
        public decimal OfferedCTC { get; set; }
        public DateTime ExpectedJoiningDate { get; set; }
        public string? IssuedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    // ── Extended DTO for full CTC breakup + bulk offer letter ──────────
    public class IssueOfferLetterDto
    {
        public List<long> AppIds { get; set; } = new();
        public string? CompanyId { get; set; }
        public string? IssuedBy { get; set; }
        // Position overrides (applied to all if not per-candidate)
        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? ReportingManager { get; set; }
        public string? JoiningDate { get; set; } // yyyy-MM-dd
        public string? ProbationPeriod { get; set; } = "90 Days";
        public string? NoticePeriod { get; set; } = "30 Days";
        // CTC (annual, common template — candidate can override)
        public decimal GrossCTC { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal HRA { get; set; }
        public decimal DA { get; set; }
        public decimal Conveyance { get; set; }
        public decimal MedicalAllowance { get; set; }
        public decimal OtherAllowance { get; set; }
        public decimal PfDeduction { get; set; }
        // Dynamic company salary heads filled in CTC table
        public List<OfferSalaryHeadDto>? SalaryHeads { get; set; } = new();
        // Per-candidate overrides (optional — if absent, common values above used)
        public List<PerCandidateOfferOverrideDto> PerCandidateOverrides { get; set; } = new();
    }

    public class OfferSalaryHeadDto
    {
        public int HeadId { get; set; }
        public string? HeadName { get; set; }
        public decimal AnnualAmount { get; set; }
        public decimal MonthlyAmount { get; set; }
    }

    public class PerCandidateOfferOverrideDto
    {
        public long AppId { get; set; }
        public decimal GrossCTC { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal HRA { get; set; }
        public decimal DA { get; set; }
        public decimal Conveyance { get; set; }
        public decimal MedicalAllowance { get; set; }
        public decimal OtherAllowance { get; set; }
        public decimal PfDeduction { get; set; }
        public string? Designation { get; set; }
        public string? JoiningDate { get; set; }
    }

    public class HireTransferDto
    {
        public long AppId { get; set; }
        public string? HiredBy { get; set; }
        public string? CompanyId { get; set; }
        public string? CandidateName { get; set; }
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? Gender { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public string? AadhaarNo { get; set; }
        public string? PanNo { get; set; }
        public string? BankAccNo { get; set; }
        public string? BankIfsc { get; set; }
        public string? BankName { get; set; }
        public string? UanNo { get; set; }
        public string? EsicNo { get; set; }
        public string? NomineeName { get; set; }
        public string? NomineeRelation { get; set; }
        public string? NomineeContact { get; set; }
        public string? CategoryId { get; set; }
        public string? ReligionId { get; set; }
        public string? NatureId { get; set; }
        public string? DepartmentId { get; set; }
        public string? DesignationId { get; set; }
        public string? LocationId { get; set; }
        public long? CostCenterId { get; set; }
    }

    public class TagCandidateDto
    {
        public long AppId { get; set; }
        public long? ReqId { get; set; }
        public string? SkillClassification { get; set; } = "Semi-Skilled";
        public string? CandidateTags { get; set; }
        public bool IsDiversityHiring { get; set; } = false;
        public string? AssignedReviewer { get; set; }
        public string? Remarks { get; set; }
        public string? TaggedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class MoveCandidateStageDto
    {
        public long AppId { get; set; }
        public string TargetStage { get; set; } = "";
        public string? Remarks { get; set; }
        public string? MovedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class RejectCandidateDto
    {
        public long AppId { get; set; }
        public string RejectionReason { get; set; } = "";
        public string Remarks { get; set; } = "";
        public string? CooloffPolicy { get; set; } = "90_Days";
        public bool NotifyCandidate { get; set; } = true;
        public string? RejectedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class VerifyDocItemDto
    {
        public long AppId { get; set; }
        public string DocTypeCode { get; set; } = "";
        public string Status { get; set; } = "Approved"; // 'Approved' or 'Rejected'
        public string? RejectionRemarks { get; set; }
        public string? VerifiedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class MarkDocViewedDto
    {
        public long? DocId { get; set; }
        public long? AppId { get; set; }
        public string? DocTypeCode { get; set; }
        public string? ViewedBy { get; set; }
    }

    public class CandidateDossierDto
    {
        public long AppId { get; set; }
        public string? AadhaarNo { get; set; }
        public string? PanNo { get; set; }
        public string? BankAccNo { get; set; }
        public string? BankIfsc { get; set; }
        public string? BankName { get; set; }
        public string? NomineeName { get; set; }
        public string? NomineeRelation { get; set; }
        public string? NomineeDOB { get; set; }
        public string? NomineeContact { get; set; }
        public string? UanNo { get; set; }
        public string? EsicNo { get; set; }
        public string? CandidateName { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? FatherName { get; set; }
        public string? Religion { get; set; }
        public string? ReligionId { get; set; }
        public string? CompanyId { get; set; }
    }

    public class VendorCandidateItemDto
    {
        public string CandidateName { get; set; } = "";
        public string Mobile { get; set; } = "";
        public string? Email { get; set; }
        public string? Gender { get; set; } = "Male";
        public DateTime? DateOfBirth { get; set; }
        public string? FatherName { get; set; }
        public string? AadhaarNo { get; set; }
        public string? ResumeDocPath { get; set; }
        public string? Religion { get; set; }
        public string? ReligionId { get; set; }
    }

    public class SubmitVendorCandidateBatchDto
    {
        public long? ReqId { get; set; }
        public string VendorId { get; set; } = "";
        public string VendorName { get; set; } = "";
        public List<VendorCandidateItemDto> Candidates { get; set; } = new();
        public string? SubmittedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class AssignBenchCandidatesBatchDto
    {
        public long ReqId { get; set; }
        public string VendorId { get; set; } = "";
        public List<long> AppIds { get; set; } = new();
        public string? AssignedBy { get; set; }
        public string? CompanyId { get; set; }
    }

    public class AssignVendorToCandidateDto
    {
        public long AppId { get; set; }
        public string VendorId { get; set; } = "";
        public string? VendorName { get; set; }
        public string? AssignedBy { get; set; }
        public string? Remarks { get; set; }
        public string? CompanyId { get; set; }
    }

    public class SendVendorJobEmailDto
    {
        public long ReqId { get; set; }
        public string? MrfCode { get; set; }
        public string? JobTitle { get; set; }
        public string? Location { get; set; }
        public string? Department { get; set; }
        public int Openings { get; set; } = 1;
        public string? ExperienceRange { get; set; }
        public string? CtcRange { get; set; }
        public string? ChannelType { get; set; } = "Supply Vendors";
        public string? Subject { get; set; }
        public string? CustomRemarks { get; set; }
        public string? CompanyId { get; set; }
        public List<VendorEmailRecipientDto>? LockedVendorEmails { get; set; } = new();
        public List<string>? AdditionalEmails { get; set; } = new();
    }

    public class VendorEmailRecipientDto
    {
        public string? VendorId { get; set; }
        public string? VendorCode { get; set; }
        public string? VendorName { get; set; }
        public string? Email { get; set; }
    }

    public class SendVendorOfferEmailBatchDto
    {
        public List<long> AppIds { get; set; } = new();
        public string? CompanyId { get; set; }
        public string? SentBy { get; set; }
        public string? FilterVendorId { get; set; }
    }

    public class VendorOfferEmailBatchResultDto
    {
        public bool Success { get; set; }
        public int TotalVendors { get; set; }
        public int TotalCandidates { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<VendorOfferEmailGroupSummaryDto> VendorSummaries { get; set; } = new();
    }

    public class VendorOfferEmailGroupSummaryDto
    {
        public string VendorId { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public string VendorEmail { get; set; } = string.Empty;
        public int CandidateCount { get; set; }
        public List<string> CandidateNames { get; set; } = new();
        public bool EmailSent { get; set; }
        public string StatusMessage { get; set; } = string.Empty;
    }

    public class ValidateAadhaarRequestDto
    {
        public string AadhaarNo { get; set; } = string.Empty;
        public string? CompanyId { get; set; }
        public long? CurrentAppId { get; set; }
    }

    public class ValidateAadhaarResultDto
    {
        public bool IsSuccess { get; set; }
        public bool IsDuplicate { get; set; }
        public bool CanProceed { get; set; }
        public string DuplicateType { get; set; } = "NONE"; // NONE, EMPLOYEE, ACTIVE_PIPELINE, TALENT_BENCH, BLACKLISTED, INVALID_FORMAT
        public string Message { get; set; } = string.Empty;
        public string? ExistingName { get; set; }
        public string? ExistingIdentifier { get; set; } // EmpCode or ApplicationNo
        public string? ExistingStage { get; set; }
        public string? ExistingMrf { get; set; }
        public string? ExistingVendor { get; set; }
        public long? ExistingAppId { get; set; }
    }
}

