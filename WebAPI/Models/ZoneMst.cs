using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class ZoneMst
    {

        public string? pk_zoneId { get; set; }  // Zone description

        [StringLength(150, ErrorMessage = "zoneDescription must be minimum 2 and  maximum 150 character  long.", MinimumLength = 2)]
        public string zoneDescription { get; set; }  // Zone description

        [StringLength(20, ErrorMessage = "zoneCode must be minimum 2 and  maximum 20 character  long.", MinimumLength = 2)]
        public string zoneCode { get; set; }  // Zone code
        public string? fk_InsuserId { get; set; }  // Inserted by User ID
        public string? fk_locId { get; set; }  // Location ID
        public string? fk_companyId { get; set; }  // Company ID
        public string ?fk_hrempid { get; set; }  // HR Employee ID (nullable)
        public string? fk_headempid { get; set; }  // Head Employee ID (nullable)
    }

}
