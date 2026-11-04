namespace HRMSWebAPI.Models
{
    public class GeneratePermanentTokenRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        public string? LocationId { get; set; } = "1";
        public string? FinancialYearId { get; set; } = "1";
    }

    public class EmployeeSalarySlipDownloadRequest
    {
        public string EmpCode { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
    }
}

