namespace HRMSWebAPI.Models
{
    public class AppraisalMst
    {
        public long? pk_appId { get; set; }
        public string? fk_finid { get; set; }           
        public string? FYear { get; set; }           
        public string? description { get; set; }
        public string? dated { get; set; }
        public bool? active { get; set; }
        public string? remarks { get; set; }
        public string? fk_insUserID { get; set; }      
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }
        //public string? active { get; set; }
    }

    public class AppraisalMstView
    {
        public long? pk_appId { get; set; }
        public string? fk_finid { get; set; }
        public string? FYear { get; set; }
        public string? description { get; set; }
        public string? dated { get; set; }
        //public bool? Active { get; set; }
        public string? remarks { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }
        public string? active { get; set; }
    }
}
