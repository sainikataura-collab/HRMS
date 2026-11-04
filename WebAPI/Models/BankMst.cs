using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{

    public class BankMst
    {
        public string? Pk_BankId { get; set; }

        [StringLength(255, ErrorMessage = "BankName must be minimum 3 and  maximum 255 character  long.", MinimumLength = 3)]
        public string BankName { get; set; }

        //[StringLength(25, ErrorMessage = "AccountNo must be minimum 9 and  maximum 25 character  long.", MinimumLength = 9)]
        public string? AccountNo { get; set; }

        //[StringLength(25, ErrorMessage = "AccountNo must be minimum 9 and  maximum 25 character  long.", MinimumLength = 9)]
        public string? MICRCode { get; set; }

        public string? Address { get; set; }

        public string? ContactPerson1 { get; set; }

        [MobileAnnotation]
        public string? ContactNo1 { get; set; }

        public string? ContactPerson2 { get; set; }

        [MobileAnnotation]
        public string? ContactNo2 { get; set; }

        public string? Remarks { get; set; }
        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }
        public string? Fk_CompanyId { get; set; }

        public byte[]? Timestamp { get; set; }

        public string? IFSC_Prefix { get; set; }

        public int? BankAccount_Min { get; set; }
        public int? BankAccount_Max { get; set; }
    }

}





