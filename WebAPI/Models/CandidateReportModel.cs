using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class CandidateReportFilterRequest
    {
        public string? CompanyId { get; set; } = "";
        public string? JobId { get; set; } = "";
        public string? LocationId { get; set; } = "";
        public string? Department { get; set; } = "";
        public string? Source { get; set; } = "";
        public string? Status { get; set; } = "";
        public string? Month { get; set; } = "";
        public string? Year { get; set; } = "";
        public string? FromDate { get; set; } = "";
        public string? ToDate { get; set; } = "";
        public string? SearchTerm { get; set; } = "";
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 10;
    }

    public class CandidateReportSummaryDto
    {
        public int TotalCandidates { get; set; }
        public int TotalScreened { get; set; }
        public int TotalInterviewed { get; set; }
        public int TotalOffered { get; set; }
        public int TotalJoined { get; set; }
        public int TotalRejected { get; set; }
        public decimal ConversionRate { get; set; }
    }

    public class CandidateReportMasterDataDto
    {
        public List<DropdownItemDto> Vendors { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Locations { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Departments { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Jobs { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Sources { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Statuses { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Years { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Months { get; set; } = new List<DropdownItemDto>();
    }

    public class CandidateReportItem
    {
        public string? PkRecId { get; set; }
        public string? CandidateName { get; set; }
        public string? Email { get; set; }
        public string? Mobile { get; set; }
        public string? Gender { get; set; }
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? CurrentCtc { get; set; }
        public string? ExpectedCtc { get; set; }
        public string? NoticePeriod { get; set; }
        public string? KeySkills { get; set; }
        public string? Address { get; set; }
        public string? Source { get; set; }
        public string? VendorCode { get; set; }
        public string? JobId { get; set; }
        public string? MrfCode { get; set; }
        public string? JobTitle { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? DisplayStatus { get; set; }
        public string? RawStatus { get; set; }
        public DateTime? AppliedDate { get; set; }
        public string? Month { get; set; }
        public string? Year { get; set; }
        public string? MonthYear { get; set; }
        public bool ShortlistStatus { get; set; }
        public long InterviewRound { get; set; }
        public bool FinalSelectionStatus { get; set; }
        public bool IsOnboardingDone { get; set; }
        public DateTime? OnboardCompletionDate { get; set; }
    }
}
