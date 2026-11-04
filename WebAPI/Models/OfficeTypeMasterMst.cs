using iTextSharp.text.pdf.qrcode;

namespace HRMSWebAPI.Models
{
    public class OfficeTypeMasterMst
    {

        public string? pk_offtypeid { get; set; }
        public string? code { get; set; }
        public string? description { get; set; }

        public string? emailhod { get; set; }

        public string? emailhr {  get; set; }

        public string? fk_companyId { get; set; }


        public string? OfficeTypeID { get; set; }

        public string? OfficeName { get; set; }
        
        public byte[]? timestamp { get; set; }


    }
}
