using iTextSharp.text;

namespace HRMSWebAPI.Models
{
    public class LanguageMasterMst
    {

        public long? pk_langid {get; set;}
        public byte[]? timestamp { get; set; }


        public string? description { get; set; }
        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }
        public string? fk_companyId { get; set; }
    }
}
