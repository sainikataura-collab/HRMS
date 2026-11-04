
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    public class SalaryLockUnlockMst
    {
        public string? CID { get; set; }
        public string? pk_empid { get; set; }
        public string? empcode { get; set; }
        public string? manualempcode { get; set; }
        public string? empname { get; set; }
        public string? designation { get; set; }
        public string? department { get; set; }
        public string? location { get; set; }
        public string shortby { get; set; }
        public string fk_monthId { get; set; }
        public string fk_yearId { get; set; }

        public string? fk_costcentreid { get; set; } = "";

    }


    public class SalaryLockUnlockRequest
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
        public string? fk_monthId { get; set; } = "";
        public string? fk_yearId { get; set; } = "";
        public string? fk_costcentreid { get; set; } = "";
        //public string? Overwrite { get; set; } = "";
        //public int PageIndex1 { get; set; }
        //public int PageSize1 { get; set; }

        //public int PageIndex2 { get; set; }
        //public int PageSize2 { get; set; }



    }

    public class salarylockunlockModel
    {
        public List<SalaryLockUnlockMst> salarylocked { get; set; }
        public List<SalaryLockUnlockMst> salaryunlock { get; set; }
  

        public int? salarylockedcount { get; set; }
        public int? salaryunlockcount { get; set; }
    }

  
    [XmlRoot("LocationList")]
    public class SalaryLocationList
    {
        [XmlElement("fk_locid")]
        public List<string> Locations { get; set; }
    }

    [XmlRoot("DepartmentList")]
    public class SalaryDepartmentList
    {
        [XmlElement("fk_deptid")]
        public List<string> Departments { get; set; }
    }

    // SALARY APPROVE
    public class SalaryApprovedMst
    {
        public string? CID { get; set; }
        public string? pk_empid { get; set; }
        public string? empcode { get; set; }
        public string? manualempcode { get; set; }
        public string? empname { get; set; }
        public string? designation { get; set; }
        public string? department { get; set; }
        public string? location { get; set; }
        public string shortby { get; set; }
        public string fk_monthId { get; set; }
        public string fk_yearId { get; set; }

        public string? fk_costcentreid { get; set; } = "";

    }


    public class SalaryApprovedRequest
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
        public string? fk_monthId { get; set; } = "";
        public string? fk_yearId { get; set; } = "";
        public string? fk_costcentreid { get; set; } = "";
        public string? ContractorName { get; set; } 

        //public string? Overwrite { get; set; } = "";
        //public int PageIndex1 { get; set; }
        //public int PageSize1 { get; set; }

        //public int PageIndex2 { get; set; }
        //public int PageSize2 { get; set; }



    }

    public class salaryApprovedModel
    {
        public List<SalaryApprovedMst> salaryApproved { get; set; }
        public List<SalaryApprovedMst> salaryDisapproved { get; set; }


        public int? salaryApprovedcount { get; set; }
        public int? salaryDisapprovedcount { get; set; }
    }


}
