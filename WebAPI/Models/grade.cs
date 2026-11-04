using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class grade
    {


        public string? pk_classid { get; set; }
        [StringLength(15)]
        public string classname { get; set; }
        [StringLength(50, ErrorMessage = "class description must be minimum 2 and  maximum 50 character  long.", MinimumLength = 2)]
        public string NoticePeriod { get; set; }
        [StringLength(5)]

        public string? Fk_LocID { get; set; }

        public string? fk_companyId { get; set; }
        [StringLength(15)]
        public string? Fk_UserID { get; set; }
        public bool ? isActive { get; set; }
        public string ? fk_insUserID { get; set; }
        [StringLength(15)]

        public string ?fk_updUserID { get; set; }
        [StringLength(15)]

        public string? fk_insDateID { get; set; }
        [StringLength(15)]

        public string? fk_updDateID { get; set; }
        [StringLength(15)]
        public byte[]?Timestamp { get; set; }
        
        
        public int ? orderno { get;set; }

       
    }
}
