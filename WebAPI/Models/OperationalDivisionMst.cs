namespace HRMSWebAPI.Models
{
    public class OperationalDivisionMst
    {
        public string? pk_OperationalId { get; set; }
        public string OperationalCode { get; set; }
        public string OperationalDescription { get; set; }
        public string? FkInsuserId { get; set; }
        public string? FkLocId { get; set; }
        public string? FkCompanyId { get; set; }
    }
}
