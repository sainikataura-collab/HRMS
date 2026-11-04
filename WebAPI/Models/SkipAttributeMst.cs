namespace HRMSWebAPI.Models
{
    public class SkipAttributeMst
    {

        public string? pk_attributeId { get; set; }
        public string? fk_companyId { get; set; }

        public string? fk_userid { get;set; }

        public string? fk_locid { get; set; }
        public string? description { get; set; }
        public long? orderNo { get; set; }
        public bool? isActive { get; set; }
        public string? isActiveAlias { get; set; }

    }
}
