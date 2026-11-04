using System.ComponentModel.DataAnnotations;


namespace HRMSWebAPI.Models
{
    public class DepartmentMst
    {

        //[StringLength(50, ErrorMessage = "department must be minimum 3 and  maximum 50 character  long.", MinimumLength = 1)]
        //public string? Department { get; set;}

        public string? Pk_DeptId { get; set; }
        
       
        public bool? active { get; set; }
        
        public string ?Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }

        public string? fk_companyId { get; set; }


        public string? fk_depHodid { get; set; }

        [StringLength(50, ErrorMessage = "description must be minimum 3 and  maximum 50 character  long.", MinimumLength = 1)]
        public string description { get; set; }
        public string? activeAlias { get; set; }
        public byte[]? Timestamp { get; set; }


        public string? deptcode { get; set; }
    }


  

}




