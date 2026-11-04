using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class AccountMst
    {
        public string? pk_account_id { get; set; }

        [Required(ErrorMessage = "Code is required.")]
        [StringLength(50, ErrorMessage = "Code must be between 2 and 50 characters long.", MinimumLength = 2)]
        public string code { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name must be between 3 and 100 characters long.", MinimumLength = 3)]
        public string name { get; set; }

    }
}
