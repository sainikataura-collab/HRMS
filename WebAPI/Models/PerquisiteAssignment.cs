using System.Security.Cryptography;

namespace HRMSWebAPI.Models
{
    public class PerquisiteAssignment
    {
 
       public decimal? CID { get; set; }

        public string? pk_perktrnId { get; set; }

        public string? fk_empid { get; set; }

        public string? fk_perkId { get; set; }

        public string? description { get; set; }

        public string? trndate { get; set; }

        public decimal? totvalue { get; set; }

        public decimal? amtreceived { get; set; }


        public decimal? taxableamt { get; set; }

        public byte[]? Timestamp { get; set; }

        public string? empname { get; set; }

        public string? empcode { get; set; }

    }
}
