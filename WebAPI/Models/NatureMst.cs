using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class NatureMst
    {
        [StringLength(15, ErrorMessage = "Nature must be minimum 2 and  maximum 15 character  long.", MinimumLength = 2)]

        public string Nature { get; set; }
        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }
        public string? fk_CompanyId { get; set; }
        public string? pk_natureid { get; set; }
        public byte[]? Timestamp { get; set; }
    }
}
