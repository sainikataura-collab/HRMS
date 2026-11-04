namespace HRMSWebAPI.Models
{
    public class SpecializationMst
    {
        public string? pk_specializationId { get; set; }
        public string? description { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public string? fk_companyId { get; set; }
        public string? type { get; set; }
        public string? name { get; set; }
        public bool? isActive { get; set; }
        public string? isActivestatus { get; set; }

        

        public byte[]? Timestamp { get; set; }
    }
}
