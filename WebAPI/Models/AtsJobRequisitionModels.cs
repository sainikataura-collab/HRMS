using System;

namespace HRMSWebAPI.Models
{
    // =========================================================================
    // DTO MODELS FOR ATS JOB REQUISITION
    // =========================================================================

    public class ApprovalActionDto
    {
        public long ReqId { get; set; }
        public int ApprovalLevel { get; set; } // 1, 2, or 3
        public string ApproverId { get; set; } = "";
        public string ApproverName { get; set; } = "";
        public string? ApproverRole { get; set; }
        public string Remarks { get; set; } = "";
    }

    public class LocationBufferUpdateDto
    {
        public string LocationId { get; set; } = "";
        public int BaseDemand { get; set; }
        public decimal BufferPercent { get; set; }
        public string? ModifiedBy { get; set; }
    }

    public class PipelineStageConfigDto
    {
        public string? CompanyId { get; set; }
        public string StageCode { get; set; } = "";
        public string StageLabel { get; set; } = "";
        public string? StageIcon { get; set; }
        public string? StageColor { get; set; }
        public int StageOrder { get; set; } = 1;
        public bool IsEnabled { get; set; } = true;
        public string? ModifiedBy { get; set; }
    }

    public class WalkInCandidateDto
    {
        public string CandidateName { get; set; } = "";
        public string MobileNumber { get; set; } = "";
        public string? AadhaarNo { get; set; }
        public string? VendorId { get; set; }
        public string? VendorName { get; set; }
        public string? JobId { get; set; }
        public string? JobTitle { get; set; }
        public string? LocationId { get; set; }
        public string? CompanyId { get; set; }
    }
}
