using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class EmployeeKRAPLIMst
    {
       
        public string? pk_empid { get; set; }
        public string? empcode { get; set; }
        public string? manualempcode { get; set; }
        public string? empname { get; set; }
        public string? Desig { get; set; }
        public string? Depart { get; set; }
        public bool? isKRA { get; set; }

        public decimal? KRA { get; set; }

        public decimal? PLI { get; set; }






    }
    public class KRAPLIRequest
    {

        public string? EmpCode { get; set; } = "";
        public string? EmpCodeManual { get; set; } = "";
        public string? EmpName { get; set; } = "";
        public List<string>SelectedDepartments { get; set; } = new List<string>();
        public string? SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? SelectedNature { get; set; } = "";
        public string? SelectedCity { get; set; } = "";
        public string? SortBy { get; set; } = ""; // Default sorting column
        
        public string? fk_userid { get; set; }
        public string? EmpStatus { get; set; } = "";



    }


    public class EmployeeKraPliModel
    {
        public string fk_empid { get; set; }
        public bool isKRA { get; set; }
        public decimal KRA { get; set; }
        public decimal PLI { get; set; }
    }

    [XmlRoot("NewDataSet")]
    public class EmployeeKraPliXmlModel
    {
        [XmlElement("EmpList")]
        public List<EmployeeKraPliModel> EmpList { get; set; }
        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }
    }



}
