using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    //public class payrolldashoardrequest
    //{
    //    public string? fk_monthId { get; set; } = "";
    //    public string? fk_yearId { get; set; } = "";

    //}

    public class payrolldashoardrequest
    {
        public string? fk_monthId { get; set; } = "";
        public string? fk_yearId { get; set; } = "";

        public string? month { get; set; } = "";
        public string? year { get; set; } = "";

    }
    //public class ReportModelRequest
    //{
    //    public string? EmpCode { get; set; } = "";
    //    public string? EmpCodeManual { get; set; } = "";
    //    public string? EmpName { get; set; } = "";
    //    public List<string> SelectedDepartments { get; set; } = new List<string>();
    //    public string? SelectedDesignation { get; set; } = "";
    //    public List<string> SelectedLocations { get; set; } = new List<string>();
    //    public string? SelectedNature { get; set; } = "";
    //    public string? SelectedCity { get; set; } = "";
    //    public string? SortBy { get; set; } = ""; // Default sorting column       
    //    public string? fk_monthId { get; set; } = "";
    //    public string? fk_yearId { get; set; } = "";
    //    public string? reportType { get; set; } = "";
    //    public string? EmpStatus { get; set; } = "";
    //    public int? ExportType { get; set; } = 0;
    //    public string? fk_leaveId { get; set; } = "";
    //    public string? fk_headId { get; set; } = "";
    //    public string? fromdate { get; set; } = "";
    //    public string? todate { get; set; } = "";
    //    public string? fk_companyid { get; set; } = "";
    //    public string? fk_loanid { get; set; } = "";
    //    public int? pageIndex { get; set; }
    //    public int? pageSize { get; set; }

    //}

    public class ReportModelRequest
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
        public string? ReportName { get; set; }
        public string? reportType { get; set; } = "";
        public string? EmpStatus { get; set; } = "";
        public int? ExportType { get; set; } = 0;
        public string? fk_leaveId { get; set; } = "";
        public string? fk_headId { get; set; } = "";
        public string? fromdate { get; set; } = "";
        public string? todate { get; set; } = "";
        public string? fk_companyid { get; set; } = "";
        public string? fk_loanid { get; set; } = "";
        public string? SalTransfer { get; set; } = "";
        public int? pageIndex { get; set; }
        public int? pageSize { get; set; }

        public string? @fk_finid { get; set; } = "";
        public bool? paginationRequired { get; set; } = false;


        public string? searchTerm { get; set; }

        public string? fk_stateId { get; set; } = "";

    }




    [XmlRoot("LocationList")]
    public class LocationLists
    {
        [XmlElement("fk_locid")]
        public List<string> Locations { get; set; }
    }

    [XmlRoot("DepartmentList")]
    public class DepartmentLists
    {
        [XmlElement("fk_deptid")]
        public List<string> Departments { get; set; }
    }



}
