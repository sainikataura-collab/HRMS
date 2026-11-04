using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class Employee
    {
        public string CID { get; set; }
        public string pk_empid { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string Desig { get; set; }
        public string Depart { get; set; }
        public string? locationName { get; set; }
        public string? clientName { get; set; }
        public string? vendorName { get; set; }
    }


    public class EmployeeFilterRequest
    {
        public string EmpCode { get; set; } = "";
        public string EmpCodeManual { get; set; } = "";
        public string EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string SelectedNature { get; set; } = "";
        public string SelectedCity { get; set; } = "";
        public string SortBy { get; set; } = ""; // Default sorting column       
        public string EmpStatus { get; set; } = "";

        public string? fk_costcentreid { get; set; } = "";
        public string? Search { get; set; } = "";
        public int PageNo { get; set; } = 1;
        public int PageSize { get; set; } = 100;
        public string statFilter { get; set; } = ""; // New filter property
    }

    [XmlRoot("LocationList")]
    public class LocationList
    {
        [XmlElement("fk_locid")]
        public List<string> Locations { get; set; }
    }

    [XmlRoot("DepartmentList")]
    public class DepartmentList
    {
        [XmlElement("fk_deptid")]
        public List<string> Departments { get; set; }
    }


    //Image Upload

    [XmlRoot("NewDataSet")]
    public class EmployeeImageRequest
    {
        [XmlElement("HR_Employee_Image_Mst")]
        public EmployeeImageItem Items { get; set; }
    }

    public class EmployeeImageItem
    {
        [Required]
        [XmlElement("fk_empid")]
        public string FkEmpId { get; set; }
        [Required]
        [XmlElement("imagetype")]
        public string ImageType { get; set; }
        [Required]
        [XmlElement("dated")]
        public string Dated { get; set; } // You can keep it as string for custom formatting
        [Required]
        [XmlElement("description")]
        public string Description { get; set; }

        public string? Filename { get; set; }
        public int? pk_imageid { get; set; }
    }

    public class EmployeeImageMeta
    {

        public EmployeeImageRequest? Items { get; set; }
        public string? Filename { get; set; }
        public string? ContentType { get; set; }
        public IFormFile FileBytes { get; set; }
    }

    //code added
    public class MarkEmployeeAttendance
    {
        public string? FkEmpId { get; set; }
        public string? AttenType { get; set; }
        public string? Latitude { get; set; }
        public string? Longitude { get; set; }
        public string? LocAddress { get; set; }
        public string? FilePath { get; set; }
        public string? IsOutOfRange { get; set; }
        public string? Distance { get; set; }

        public IFormFile? AttendanceImageFile { get; set; }
    }



}
