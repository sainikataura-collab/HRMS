using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class ManualIncomeTaxMst
    {
        public string? pk_empid { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string? fk_locid { get; set; }
        public string? fk_deptid { get; set; }
        public string? fk_desgid { get; set; }
        public string? fk_natureid { get; set; }
        public string? fk_cityid { get; set; }
        public string? Location { get; set; }
        public string? department { get; set; }
        public string? designation { get; set; }
        public string? nature { get; set; }
        public string? cityname { get; set; }
        public string? doj { get; set; }
        public string? pk_salid { get; set; }
        public decimal? IT { get; set; }
        public decimal? CsurCharge { get; set; }
        public decimal? ECessCharge { get; set; } 
        public decimal? OtherSCharge { get; set; }
    }

    public class ManualIncomeTaxMstRequest
    {

        public string? empcode { get; set; } = "";
        public string? empcodemanual { get; set; } = "";
        public string? empname { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? selectedDesignation { get; set; } = "";
        public string? selectedNature { get; set; } = "";
        public string? selectedCity { get; set; } = "";
        public string sortBy { get; set; } = "";
        public string fk_monthId { get; set; } = "";
        public string fk_yearId { get; set; } = "";
    }

    
    
}
