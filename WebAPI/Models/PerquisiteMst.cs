using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class PerquisiteMst
    {
        [StringLength(15)]
        public string? pk_perkId { get; set; }

        [StringLength(100)]
        public string description { get; set; }


        public bool active { get; set; }

        public byte[]? Timestamp { get; set; }

    }
}
