using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
   
    //    [XmlRoot("NewDataSet")]
    //    public class HeadAssignDataSet
    //{
    //        //[XmlElement("LocationList")]
    //        //public List<HeadAssignMst> headAssignMsts{ get; set; } = new List<HeadAssignMst>(); 
    //    }
        public class HeadAssign
    {
            public string? CID { get; set; }
            public string? pk_empid { get; set; }
            public string? empcode { get; set; }
            public string? manualempcode { get; set; }
            public string? empname { get; set; }
            public string? designation { get; set; }
            public string? department { get; set; }
              public string? location { get; set; }
        public string? fk_headid { get; set; }
        public string? effectivedate { get; set; }
        public string? Overwrite { get; set; }

    }


    public class HeadAssignFilterRequest
    {
        public string? EmpCode { get; set; } = "";
        public string? EmpCodeManual { get; set; } = "";
        public string? EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string? SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? SelectedNature { get; set; } = "";
        public string? SelectedCity { get; set; } = "";
        public string? SortBy { get; set; } = ""; // Default sorting column       
        public string? fk_headid { get; set; } = "";
        public string? effectivedate { get; set; } = "";
        public string? Overwrite { get; set; } = "";


    }

    [XmlRoot("LocationList")]
    public class HeadLocationLists
    {
        [XmlElement("fk_locid")]
        public List<string> Locations { get; set; }
    }

    [XmlRoot("DepartmentList")]
    public class HeadDepartmentLists
    {
        [XmlElement("fk_deptid")]
        public List<string> Departments { get; set; }
    }



}
