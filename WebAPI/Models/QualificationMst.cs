namespace HRMSWebAPI.Models
{
    public class QualificationMst
    {
        public long? pk_qualiId { get; set; }
        public string? description { get; set; }
        public string? type { get; set; }
        public bool? active { get; set; }
        public string? qualification { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public string? fk_companyId { get; set; }

        public byte[]? Timestamp { get; set; }
    }
}
