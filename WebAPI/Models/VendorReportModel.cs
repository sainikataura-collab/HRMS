using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class VendorReportFilterRequest
    {
        public string? CompanyId { get; set; } = "";
        public string? VendorCode { get; set; } = "";
        public string? Location { get; set; } = "";
        public string? Status { get; set; } = "";
        public string? Month { get; set; } = "";
        public string? Year { get; set; } = "";
        public string? Department { get; set; } = "";
        public string? FromDate { get; set; } = "";
        public string? ToDate { get; set; } = "";
        public string? SearchTerm { get; set; } = "";
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 10;
    }

    public class VendorReportItem
    {
        public string? VendorId { get; set; }
        public string? VendorCode { get; set; }
        public string? VendorName { get; set; }
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Month { get; set; }
        public string? Year { get; set; }
        public string? MonthYear { get; set; }
        public int ActiveJobsAssigned { get; set; }
        public int TotalSubmitted { get; set; }
        public int Shortlisted { get; set; }
        public int Interviewed { get; set; }
        public int Selected { get; set; }
        public int Joined { get; set; }
        public int Rejected { get; set; }
        public decimal ConversionRate { get; set; }
        public int AvgTatDays { get; set; }
        public string? Status { get; set; }
    }

    public class VendorReportSummaryDto
    {
        public int TotalVendors { get; set; }
        public int TotalProfilesSubmitted { get; set; }
        public int TotalShortlisted { get; set; }
        public int TotalJoined { get; set; }
        public decimal OverallConversionRate { get; set; }
    }

    public class VendorWiseReportItem
    {
        public string? VendorId { get; set; }
        public string? VendorCode { get; set; }
        public string? VendorName { get; set; }
        public string? ReqCode { get; set; }
        public string? JobTitle { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? Month { get; set; }
        public string? Year { get; set; }
        public string? MonthYear { get; set; }
        public int TargetPositions { get; set; }
        public int ProfilesShared { get; set; }
        public int Screened { get; set; }
        public int Interviewed { get; set; }
        public int Offered { get; set; }
        public int Joined { get; set; }
        public int Rejected { get; set; }
        public decimal VendorSharePct { get; set; }
        public int AvgTatDays { get; set; }
        public string? Status { get; set; }
    }

    public class DropdownItemDto
    {
        public string? Value { get; set; }
        public string? Label { get; set; }
        public string? Code { get; set; }
    }

    public class VendorReportMasterDataDto
    {
        public List<DropdownItemDto> Vendors { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Locations { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Departments { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Jobs { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Statuses { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Years { get; set; } = new List<DropdownItemDto>();
        public List<DropdownItemDto> Months { get; set; } = new List<DropdownItemDto>();
    }
}
