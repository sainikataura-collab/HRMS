using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{


    [XmlRoot("NewDataSet")]
    public class EmployeeDetailRoot
    {
        [XmlElement("SAL_Attendance_Details")]
        public List<AttendanceAdjustmentMst> AttendanceDetail { get; set; }
    }

    public class StopSalaryProcessModel
    {
        //public int NotStoppedSalaryCount { get; set; }
        //public int StoppedSalaryCount { get; set; }
        public List<ListofEmployeeForstopsalary> ProcessSalary { get; set; }
        public List<ListofEmployeeForstopsalary> StoppedSalary { get; set; }
    } 
    
    public class PayStopSalaryProcessModel
    {
        public List<ListofEmployeeForstopsalary> PaidSalary { get; set; }
        public List<ListofEmployeeForstopsalary> StoppedSalary { get; set; }
    }

    public class EmployeeDetail
    {
        public string empcode { get; set; }
        public string empcodemanual { get; set; }
        public string empname { get; set; }
        public string department { get; set; }
        public string designation { get; set; }
        public string Location { get; set; }
        public string paiddays { get; set; }
        public string otHr { get; set; }
        public string salarysatatus { get; set; }

    }

   



    [XmlRoot("NewDataSet")]
    public class EmpProccessRequestModel
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
        public string FkMonthId { get; set; }
        public string FkYearId { get; set; }
    }


    [XmlRoot("NewDataSet")]
    public class SalaryPaidStopProccessRequest
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }

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
        public string FkMonthId { get; set; }
        public string FkYearId { get; set; }
    }




    public class ListofEmployeeForstopsalary
    {
        public string empcode { get; set; }
        public string pk_empid { get; set; }
        public string empcodemanual { get; set; }
        public string empname { get; set; }
        public string department { get; set; }
        public string designation { get; set; }
        public string Location { get; set; }
        public string paiddays { get; set; }
        public string otHr { get; set; }
    
        

    }


    // stop salary 

    public class EmpListItem
    {
        public string fk_empid { get; set; }
      

    }




    [XmlRoot("NewDataSet")]
    public class EmpListDataSet
    {
        [XmlElement("EmpList")]
        public List<EmpListItem> EmpList { get; set; }
        public string fk_monthId { get; set; }
        public string fk_yearId { get; set; }
        public string? Paydate { get; set; }
    }






}
