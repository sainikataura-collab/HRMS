namespace HRMSWebAPI.Models
{
    public class SubSectionMst
    {
        public string? pk_subsecid { get; set; }
        public string? fk_secid { get; set; }
        public string description { get; set; }
        public string? section { get; set; }
        public string? code { get; set; }
        public decimal maxlimit { get; set; }
        public bool? active { get; set; }
        public bool? isPF { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }

    }
}
