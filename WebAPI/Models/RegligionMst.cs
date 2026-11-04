using System.ComponentModel.DataAnnotations;
namespace HRMSWebAPI.Models
{
    public class RegligionMst
    {
        public string? Pk_religionid { get; set; }
        public string Religiontype { get; set; }
        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }
        public string?Fk_CompanyId { get; set; }
        public byte[]? Timestamp { get; set; }


    }
}
