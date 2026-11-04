using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class CategoryMst
    {
        public string? Pk_Catid { get; set; }

        [StringLength(50, ErrorMessage = "Category must be minimum 2 and  maximum 50 character  long.", MinimumLength = 2)]

        public string Category { get; set; }
        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }
        public string? fk_companyId { get; set; }

        public byte[]? Timestamp { get; set; }
    }
}
