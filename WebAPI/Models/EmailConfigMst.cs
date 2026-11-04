namespace HRMSWebAPI.Models
{
    public class EmailConfigMst
    {
        public string? host { get; set; }
        public int? port { get; set; }
        public string? userName { get; set; }
        public string? password { get; set; }
        public bool? sslEnabled { get; set; }
        public string? fromEmailAddress { get; set; }
        public string? HREmailAddress { get; set; }
        public string? Tdsemail { get; set; }
        public string? SqlEmailProfile { get; set; }
        public string? fk_companyId { get; set; }
        public string? KRAEmailAddress { get; set; }
        public string? LeaveEmailAddress { get; set; }
    }
}
