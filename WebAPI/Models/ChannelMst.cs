//namespace HRMSWebAPI.Models
//{
//    public class ChannelMst
//    {
//    }
//}

using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class ChannelMst
    {
        public string? Pk_ChannelId { get; set; }

        [Required(ErrorMessage = "Channel Code is required.")]
        [StringLength(50, ErrorMessage = "Channel Code must be maximum 50 characters long.")]
        public string ChannelCode { get; set; }

        [Required(ErrorMessage = "Channel Name is required.")]
        [StringLength(100, ErrorMessage = "Channel Name must be minimum 3 and maximum 100 characters long.", MinimumLength = 3)]
        public string ChannelName { get; set; }

        [StringLength(100, ErrorMessage = "Company Name must be maximum 100 characters long.")]
        public string CompanyName { get; set; }

        [StringLength(100, ErrorMessage = "Contact Person must be maximum 100 characters long.")]
        public string? ContactPerson { get; set; }

        [StringLength(20, ErrorMessage = "Contact No must be maximum 20 characters long.")]
        [MobileAnnotation]
        public string? ContactNo { get; set; }

        [StringLength(100, ErrorMessage = "Email Id must be maximum 100 characters long.")]
        [EmailAddress(ErrorMessage = "Invalid Email Address.")]
        public string? EmailId { get; set; }

        [StringLength(255, ErrorMessage = "Address must be maximum 255 characters long.")]
        public string? Address { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }
        public string? Fk_CompanyId { get; set; }
        public string? Fk_InsUserID { get; set; }
        public string? Fk_UpdUserID { get; set; }
        public string? Fk_InsDateId { get; set; }
        public string? Fk_UpdDateID { get; set; }
        public string UserId { get; set; }
        public string Password { get; set; }

        public string City { get; set; }

        public string Location { get; set; }
        
        public string OfficeType { get; set; }
        public short? pk_stateid { get; set; }
        public short fk_stateid { get; set; }

       // public string? fk_companyId { get; set; }




    }
}