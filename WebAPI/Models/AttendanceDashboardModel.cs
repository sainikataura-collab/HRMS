using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class AttendanceDashboardFilterRequest
    {
        public string? Fk_DepartmentId { get; set; } = "";
        public string? Fk_LocationId { get; set; } = "";
        public int Fk_MonthId { get; set; } = 0;
        public int Fk_YearId { get; set; } = 0;
        public string? SelectedDate { get; set; } = "";
        public string? StatusFilter { get; set; } = "";
        public int DayFilter { get; set; } = 0;
        public string? SearchTerm { get; set; } = "";
        public int PageNo { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class AttendanceDashboardKPIModel
    {
        public int TotalEmployees { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int LateCount { get; set; }
        public int HalfDayCount { get; set; }
        public int OnLeaveCount { get; set; }
        public decimal AvgAttendancePercent { get; set; }
        public int TotalPresentDays { get; set; }
        public int TotalAbsentDays { get; set; }
        public int TotalLateDays { get; set; }
        public int TotalHalfDays { get; set; }
        public int TotalLeaveDays { get; set; }
    }

    public class MonthlySummaryBreakdownModel
    {
        public decimal PresentDays { get; set; }
        public decimal AbsentDays { get; set; }
        public decimal LateDays { get; set; }
        public decimal LeaveDays { get; set; }
        public decimal HalfDays { get; set; }
    }

    public class DailyAttendanceTrendModel
    {
        public int Day { get; set; }
        public string? Date { get; set; }
        public int Present { get; set; }
        public int Absent { get; set; }
        public int Late { get; set; }
        public int HalfDay { get; set; }
        public int Leave { get; set; }
    }

    public class LiveHighlightItem
    {
        public string? EmpCode { get; set; }
        public string? EmpName { get; set; }
        public string? Department { get; set; }
        public string? Type { get; set; } // "Late", "Leave", "HalfDay", "Absent", "Present"
        public string? Details { get; set; }
        public string? InTime { get; set; }
        public string? OutTime { get; set; }
        public string? LateComing { get; set; }
        public string? ImageUrl { get; set; }
        public string? DatedStr { get; set; }
        public string? AttenDate { get; set; }
        public string? DayDescription { get; set; }
        public string? DayStatus { get; set; }
    }

    public class AttendanceDashboardOverviewResponse
    {
        public AttendanceDashboardKPIModel KPIs { get; set; } = new();
        public MonthlySummaryBreakdownModel MonthlySummary { get; set; } = new();
        public List<LiveHighlightItem> LiveHighlights { get; set; } = new();
        public List<DailyAttendanceTrendModel> Trends { get; set; } = new();
    }

    public class EmployeeAttendanceGridItem
    {
        public string? Pk_empid { get; set; }
        public string? Empcode { get; set; }
        public string? Empname { get; set; }
        public string? Department { get; set; }
        public decimal Present { get; set; }
        public decimal Absent { get; set; }
        public decimal Late { get; set; }
        public decimal Leave { get; set; }
        public decimal Halfday { get; set; }
        public string? HalfDayDates { get; set; }
        public string? LateDates { get; set; }
        public string? LeaveDates { get; set; }
        public decimal Lwp { get; set; }
        public decimal Wo { get; set; }
        public decimal Holiday { get; set; }
        public decimal Cl { get; set; }
        public decimal Sl { get; set; }
        public decimal Pl { get; set; }
        public int Nj { get; set; }
        public int Left { get; set; }
        public decimal Paiddays { get; set; }
        public string? Intime { get; set; }
        public string? Outtime { get; set; }
        public string? Workhour { get; set; }
        public string? Daystatus { get; set; }
        public string? Daydescription { get; set; }
        public string? LateComing { get; set; }
        public string? PunchImageUrl { get; set; }
        public string? LocAddress { get; set; }
        public string? Latitude { get; set; }
        public string? Longitude { get; set; }
        public string? PunchSource { get; set; }

        public string? PunchInImageUrl { get; set; }
        public string? PunchInLocAddress { get; set; }
        public string? PunchInLatitude { get; set; }
        public string? PunchInLongitude { get; set; }
        public string? PunchInTime { get; set; }

        public string? PunchOutImageUrl { get; set; }
        public string? PunchOutLocAddress { get; set; }
        public string? PunchOutLatitude { get; set; }
        public string? PunchOutLongitude { get; set; }
        public string? PunchOutTime { get; set; }
    }

    public class AttendanceDashboardGridResponse
    {
        public int TotalRecords { get; set; }
        public List<EmployeeAttendanceGridItem> Records { get; set; } = new();
    }

    public class EmployeeOccurrenceItem
    {
        public long Pk_inoutId { get; set; }
        public string? Fk_empid { get; set; }
        public string? Empcode { get; set; }
        public string? Empname { get; set; }
        public string? Department { get; set; }
        public string? DateIso { get; set; }
        public string? FormattedDate { get; set; }
        public string? Weekday { get; set; }
        public string? DayStatus { get; set; }
        public string? DayDescription { get; set; }
        public string? LateComing { get; set; }
        public string? Intime { get; set; }
        public string? Outtime { get; set; }
        public string? Workhour { get; set; }
        public string? PunchInImageUrl { get; set; }
        public string? PunchInLocAddress { get; set; }
        public string? PunchInLatitude { get; set; }
        public string? PunchInLongitude { get; set; }
        public string? PunchInTime { get; set; }
        public string? PunchOutImageUrl { get; set; }
        public string? PunchOutLocAddress { get; set; }
        public string? PunchOutLatitude { get; set; }
        public string? PunchOutLongitude { get; set; }
        public string? PunchOutTime { get; set; }
        public string? PunchSource { get; set; }
    }

    public class AttendanceOccurrencePdfRequest
    {
        public string? EmpCode { get; set; }
        public string? EmpId { get; set; }
        public string? EmpName { get; set; }
        public string? Department { get; set; }
        public int MonthId { get; set; }
        public int YearId { get; set; }
        public string? MonthName { get; set; }
        public string? StatusFilter { get; set; }
        public List<EmployeeOccurrenceItem>? Items { get; set; }
    }
}
