namespace HRMSWebAPI.Models
{
    public class SeparationRequestMst
    {
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 6;
        public string? SearchTerm { get; set; }
        public int TotalCount { get; set; }
        public long PkSepRequestId { get; set; }

        public string? fk_empid { get; set; }

        public string? fk_finid { get; set; }

        public DateTime resignationDate { get; set; }

        public string? reason { get; set; }

        public string? remarks { get; set; }

        public DateTime expectedLWD { get; set; }

        public decimal noticePeriod { get; set; }

        public bool isNoticePeriodServed { get; set; }

        public int status { get; set; }


        public string? ApprovalRemarks { get; set; }

        public string? ApprovedBy { get; set; }

        public DateTime? ApprovedDate { get; set; }

        public string? empcode { get; set; }

        public string? empname { get; set; }

        public bool IsSuccessfull { get; set; }

        public string Message { get; set; } = string.Empty;

        public string? EmployeeCode { get; set; }

        public string? EmployeeName { get; set; }

        public string? Department { get; set; }

        public string? Designation { get; set; }

        public string? ReportingHOD { get; set; }

        public DateTime? DateOfJoining { get; set; }

        public string? NoticeServed { get; set; }

        public string? ApprovalStatus { get; set; }

        public string? WithdrawalRemarks { get; set; }

        public string? CompanyName { get; set; }

        public string? CompanyAddress { get; set; }

        public string? ExitInterviewStatus { get; set; }
        public string? DueClearanceStatus { get; set; }
        public string? NoDueDeclarationStatus { get; set; }
        public string? ContractorName { get; set; }
        public string? fk_deptid { get; set; }
        public string? fk_desgid { get; set; }
        public string? fk_locid { get; set; }
        public long? fk_costcentreid { get; set; }

    }
}
