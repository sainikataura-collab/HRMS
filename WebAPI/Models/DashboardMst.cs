using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class DashboardMst
    {

        public long? pk_dashId { get; set; }
        public string? description { get; set; }
        public string? dated { get; set; }
        public bool? active { get; set; }

        public string? activeAlias { get; set; }
        public string? remarks { get; set; }
        public byte[]? Timestamp { get; set; }

        public string? fk_userid { get; set; }

        public string? fk_companyId { get; set; }
       
        public string? fk_locid { get; set; }
    }
}
