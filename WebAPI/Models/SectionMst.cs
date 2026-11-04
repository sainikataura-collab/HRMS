using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class SectionMst
    {
         [StringLength(15)]
        public string?pk_secid { get; set; }

        [StringLength(100)]
        public string description { get; set; }

        [StringLength(15)]
        public string code { get; set; }
       public bool partof { get; set; }
        public string? partofStatus { get; set; }

        public decimal  maxlimit { get; set; }
         public bool active { get; set; }
        public string? activeStatus { get; set; }
        public bool? isNPS { get; set; }
       
        public byte[]? Timestamp { get; set; }




    }
}
