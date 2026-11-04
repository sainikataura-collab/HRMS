using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class JobReportFilterRequest
    {
        public string? CompanyId { get; set; } = "";
        public string? LocationId { get; set; } = "";
        public string? Department { get; set; } = "";
        public string? WorkflowStatus { get; set; } = "";
        public string? VendorCode { get; set; } = "";
        public string? Month { get; set; } = "";
        public string? Year { get; set; } = "";
        public string? FromDate { get; set; } = "";
        public string? ToDate { get; set; } = "";
        public string? SearchTerm { get; set; } = "";
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 10;
    }

    public class JobReportItem
    {
        public long ReqId { get; set; }
        public string? ReqCode { get; set; }
        public string? JobTitle { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? LocationId { get; set; }
        public string? Month { get; set; }
        public string? Year { get; set; }
        public string? MonthYear { get; set; }
        public int TargetPositions { get; set; }
        public string? WorkflowStatus { get; set; }
        public int CurrentApprovalLevel { get; set; }
        public string? VendorNames { get; set; } = "Direct / Walk-In";
        public int VendorCount { get; set; } = 0;
        public string? L1ApproverId { get; set; }
        public string? L1ApproverName { get; set; }
        public string? L1Action { get; set; }
        public DateTime? L1ActionDate { get; set; }
        public string? L1Remarks { get; set; }
        public string? L2ApproverId { get; set; }
        public string? L2ApproverName { get; set; }
        public string? L2Action { get; set; }
        public DateTime? L2ActionDate { get; set; }
        public string? L2Remarks { get; set; }
        public string? L3ApproverId { get; set; }
        public string? L3ApproverName { get; set; }
        public string? L3Action { get; set; }
        public DateTime? L3ActionDate { get; set; }
        public string? L3Remarks { get; set; }
        public DateTime? HiringOpenedDate { get; set; }
        public string? RejectedByLevel { get; set; }
        public string? RejectedByName { get; set; }
        public DateTime? RejectedByDate { get; set; }
        public string? RejectionRemarks { get; set; }
        public int ProfilesSubmitted { get; set; }
        public int Screened { get; set; }
        public int Interviewed { get; set; }
        public int Offered { get; set; }
        public int Joined { get; set; }
        public int Rejected { get; set; }
        public int PendingPositions { get; set; }
        public decimal FulfillmentPct { get; set; }
        public int AvgTatDays { get; set; }
    }

    public class JobReportSummaryDto
    {
        public int TotalJobs { get; set; }
        public int TotalPositions { get; set; }
        public int TotalInWorkflow { get; set; }
        public int TotalActive { get; set; }
        public int TotalProfilesSubmitted { get; set; }
        public int TotalJoined { get; set; }
        public int TotalPendingPositions { get; set; }
        public decimal OverallFulfillmentRate { get; set; }
    }
}
