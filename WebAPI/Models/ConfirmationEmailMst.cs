namespace HRMSWebAPI.Models
{
    public class ConfirmationEmailMst
    {
        public long? pk_conrequesemailtId { get; set; }
        public int? orderno { get; set; }
        public long? days { get; set; }
        public string? fk_companyId { get; set; }
        public string? ordernodes { get; set; }

    }
}
