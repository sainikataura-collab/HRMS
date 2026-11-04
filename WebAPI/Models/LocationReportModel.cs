using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class LocationReportFilterRequest
    {
        public string? CompanyId { get; set; } = "";
        public string? LocationId { get; set; } = "";
        public string? Location { get; set; } = "";
        public string? Department { get; set; } = "";
        public string? Status { get; set; } = "";
        public string? Month { get; set; } = "";
        public string? Year { get; set; } = "";
        public string? FromDate { get; set; } = "";
        public string? ToDate { get; set; } = "";
        public string? SearchTerm { get; set; } = "";
        public string? VendorCode { get; set; } = "";
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 10;
    }

    public class LocationReportItem
    {
        public string? LocationId { get; set; }
        public string? LocationCode { get; set; }
        public string? LocationName { get; set; }
        public string? Month { get; set; }
        public string? Year { get; set; }
        public string? MonthYear { get; set; }
        public int TotalOpeningJobs { get; set; }
        public int TotalPositions { get; set; }
        public int TotalSubmitted { get; set; }
        public int Shortlisted { get; set; }
        public int Interviewed { get; set; }
        public int Selected { get; set; }
        public int Joined { get; set; }
        public int Rejected { get; set; }
        public int OpenPositions { get; set; }
        public decimal FulfillmentRate { get; set; }
        public int AvgTatDays { get; set; }
        public string? Status { get; set; }
    }

    public class LocationReportSummaryDto
    {
        public int TotalLocations { get; set; }
        public int TotalOpeningJobs { get; set; }
        public int TotalPositions { get; set; }
        public int TotalProfilesSubmitted { get; set; }
        public int TotalJoined { get; set; }
        public int TotalOpenPositions { get; set; }
        public decimal OverallFulfillmentRate { get; set; }
    }

    public class LocationWiseJobItem
    {
        public string? LocationId { get; set; }
        public string? LocationCode { get; set; }
        public string? LocationName { get; set; }
        public string? ReqId { get; set; }
        public string? ReqCode { get; set; }
        public string? JobTitle { get; set; }
        public string? Department { get; set; }
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
        public int PendingPositions { get; set; }
        public decimal FulfillmentPct { get; set; }
        public int AvgTatDays { get; set; }
        public string? Status { get; set; }
    }
}
