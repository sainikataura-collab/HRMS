namespace HRMSWebAPI.Models
{
    public class NewsPaperMst
    {
        public string? pk_newspaperId { get; set; }
        public string? newspaperName { get; set; }
        public string? contactperson1 { get; set; }
        public string? contactno1 { get; set; }
        public string? contactperson2 { get; set; }
        public string? contactno2 { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public string? fk_companyId { get; set; }

        public byte[]? Timestamp { get; set; }
    }
}
