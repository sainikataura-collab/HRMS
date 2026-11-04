using System.Text.Json.Serialization;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class EmployeeRentDetailDataSet
    {


        [XmlElement("SAL_EmployeeRent_Details")]
        public List<EmployeeRentDetail> RentDetailMst { get; set; } = new List<EmployeeRentDetail>();

        [XmlElement("SAL_EmployeeRent_Mst")]
        public EmployeeRentMst RentMst { get; set; }

    }
    public class EmployeeRentDetail
    {

        [XmlElement("pk_emprentid")]
        public string? pk_emprentid { get; set; }

        [XmlElement("fk_rentId")]
        public string? fk_rentId { get; set; }

        [XmlElement("fk_monthId")]
        public string? fk_monthId { get; set; }

        [XmlElement("fk_yearId")]
        public string? fk_yearId { get; set; }

        [XmlElement("rentamount")]
        public decimal? rentamount { get; set; }

        [XmlElement("remarks")]
        public string? remarks { get; set; }

        [XmlElement("dated")]
        public string? dated { get; set; }

        [XmlElement("isActive")]
        public bool? isActive { get; set; }
    }

    //for list request
    public class EmployeeRentDetailResult
    {
        public EmployeeRentMst EmployeeRentMst { get; set; }
        public EmpdetailMst empdetailMst { get; set; }
        public List<EmployeeRentDetail> EmployeeRentDetail { get; set; }
    }
    public class EmployeeRentMst
    {

        [XmlElement("pk_rentId")]
        public int? pk_rentId { get; set; }

        [XmlElement("fk_empid")]
        public string? fk_empid { get; set; }

        [XmlElement("fk_finid")]
        public string? fk_finid { get; set; }
        [XmlElement("dated")]
        public string? dated { get; set; }

        [XmlElement("status")]
        public string? status { get; set; }
        [XmlElement("docsub_status")]
        public string? docsub_status { get; set; }

        [XmlElement("totalAmount")]
        public decimal? totalAmount { get; set; }
        [XmlElement("rentdetailtype")]
        public string? rentdetailtype { get; set; }

        [XmlElement("isActive")]
        public bool? isActive { get; set; }

        [JsonIgnore]
        public byte[]? Timestamp { get; set; }

        public string? finDescription { get; set; }

        public bool? isView { get; set; }



    }



    public class EmployeeAttendanceModel
    {
        public List<Employees> NotMarkedAttendance { get; set; }
        public List<Employees> MarkedAttendance { get; set; }
        public List<Employees> LockedAttendance { get; set; }

        public int NotMarkedAttendanceCount { get; set; }
        public int MarkedAttendanceCount { get; set; }
        public int LockedAttendanceCount { get; set; }
    }

    public class Employees
    {
        public long CID { get; set; }                // bigint
        public string PkEmpId { get; set; }          // varchar(15)
        public string EmpCode { get; set; }          // varchar(25)
        public string ManualEmpCode { get; set; }    // varchar(25)
        public string EmpName { get; set; }          // varchar(255)
        public string Location { get; set; }         // varchar(255)
        public string Department { get; set; }       // varchar(100)
        public string Designation { get; set; }      // varchar(100)

        public string FkLocId { get; set; }          // varchar(15)
        public string FkDeptId { get; set; }         // varchar(15)
        public string FkDesgId { get; set; }         // varchar(15)
        public string FkNatureId { get; set; }       // varchar(15)
        public string FkCityId { get; set; }         // varchar(15)

        public int TotalDays { get; set; }
        public int Present { get; set; }
        public decimal LWP { get; set; } // Leave Without Pay
        public int Holidays { get; set; } // National Holidays

        //new column added 
        public decimal OTWorked { get; set; }
        public decimal OTPaid { get; set; }
        public decimal CDOAdjustment { get; set; }
        public decimal OTLapsed { get; set; }
        //new column added  end 
        public decimal OTHrs { get; set; } // OT Hours
        public int WOff { get; set; } // Weekly Off
        public decimal PaidDays { get; set; }


    }

    [XmlRoot("NewDataSet")]
    public class EmpAttendanceRequestModel
    {
        public int PageIndex1 { get; set; }
        public int PageSize1 { get; set; }

        public int PageIndex2 { get; set; }
        public int PageSize2 { get; set; }

        public int PageIndex3 { get; set; }
        public int PageSize3 { get; set; }
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

        public string fk_costcentreid { get; set; } = "";
        public DateTime? fromDate { get; set; }
        public DateTime? toDate { get; set; }
    }

    public class EmpAttendancePostModel
    {

        public string EmpCode { get; set; } = "";
        public string EmpCodeManual { get; set; } = "";
        public string? EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string? SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? SelectedNature { get; set; } = "";
        public string? SelectedCity { get; set; } = "";
        public string? SortBy { get; set; } = ""; // Default sorting column       
        public string? EmpStatus { get; set; } = "";
        public string? FkMonthId { get; set; }
        public string? FkYearId { get; set; }
        public string? Fk_FinId { get; set; }
        public string? Fk_CompanyId { get; set; }
        public string? fk_costcentreid { get; set; } = "";
    }




    //auto salary process 
    public class autosalaryprocessModel
    {
        public List<ListofEmployee> SalaryProcessed { get; set; }
        public List<ListofEmployee> SalaryLock { get; set; }
        public List<ListofEmployee> SalaryNotProcessed { get; set; }

        public int SalaryProcessedCount { get; set; }
        public int SalaryLockCount { get; set; }
        public int SalaryNotProcessedCount { get; set; }
    }

    public class ListofEmployee
    {
        public long CID { get; set; }                // bigint

      
        public string PkEmpId { get; set; }          // varchar(15)
        public string EmpCode { get; set; }          // varchar(25)
        public string ManualEmpCode { get; set; }    // varchar(25)
        public string EmpName { get; set; }          // varchar(255)
        public string Location { get; set; }         // varchar(255)
        public string Department { get; set; }       // varchar(100)
        public string Designation { get; set; }      // varchar(100)

        public string? FkLocId { get; set; }          // varchar(15)
        public string? FkDeptId { get; set; }         // varchar(15)
        public string? FkDesgId { get; set; }         // varchar(15)
        public string? FkNatureId { get; set; }       // varchar(15)
        public string? FkCityId { get; set; }         // varchar(15)
        public string? TotalDeductions { get; set; }         // varchar(15)
        public string? GrossTotal { get; set; }         // varchar(15)
        public string? NetPay { get; set; }         // varchar(15)
        public decimal? esi { get; set; }
        public decimal? esi_emr { get; set; }
        public decimal? inhand { get; set; }
        public decimal? ctc { get; set; }

        //public int TotalDays { get; set; }
        //public int Present { get; set; }
        //public int LWP { get; set; } // Leave Without Pay
        //public int Holidays { get; set; } // National Holidays
        //public decimal OTHrs { get; set; } // OT Hours
        //public int WOff { get; set; } // Weekly Off
        public decimal? PaidDays { get; set; }
    }



    public class AutoSalaryProcessPostModel
    {

        public string EmpCode { get; set; } = "";
        public string EmpCodeManual { get; set; } = "";
        public string? EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string? SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? SelectedNature { get; set; } = "";
        public string? SelectedCity { get; set; } = "";
        public string? SortBy { get; set; } = ""; // Default sorting column       
        public string? EmpStatus { get; set; } = "";
        public string? FkMonthId { get; set; }
        public string? FkYearId { get; set; }
        public string? Fk_FinId { get; set; }
        public string? Fk_CompanyId { get; set; }
        public string? fk_costcentreid { get; set; }
        public string? fromdate { get; set; }
        public string? todate { get; set; }
        public string? selectedempcode { get; set; } = "";


    }




    // Arrear process 
    public class arrearProcessModel
    {
        public List<ListofEmployeeForArrear> ArrearProcessed { get; set; }
        public List<ListofEmployeeForArrear> ArrearUnProcessed { get; set; }

        public int ArrearProcessedCount { get; set; }

        public int ArrearUnProcessedCount { get; set; }
    }

    public class ListofEmployeeForArrear
    {
        public long CID { get; set; }
        public string PkEmpId { get; set; }
        public string EmpCode { get; set; }
        public string ManualEmpCode { get; set; }
        public string EmpName { get; set; }
        public string Location { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }

    }

    public class ArrearProcessPostModel
    {

        public string EmpCode { get; set; } = "";
        public string EmpCodeManual { get; set; } = "";
        public string? EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string? SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? SelectedNature { get; set; } = "";
        public string? SelectedCity { get; set; } = "";
        public string? SortBy { get; set; } = ""; // Default sorting column       
        public string? EmpStatus { get; set; } = "";
        public string? FkMonthId { get; set; }
        public string? FkYearId { get; set; }
        public string? Fk_FinId { get; set; }
        public string? Fk_CompanyId { get; set; }

        public string? Fromdate { get; set; }
        public string? Todate { get; set; }
        public string? Tdays { get; set; }
    }

    [XmlRoot("NewDataSet")]
    public class EmpArrearProccessRequestModel
    {
        public int PageIndex1 { get; set; }
        public int PageSize1 { get; set; }

        public int PageIndex2 { get; set; }
        public int PageSize2 { get; set; }


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
        public string? Type { get; set; }



    }


    //ITProcess

    [XmlRoot("NewDataSet")]
    public class ITProcessRequestModel
    {
        public int PageIndex1 { get; set; }
        public int PageSize1 { get; set; }

        public int PageIndex2 { get; set; }
        public int PageSize2 { get; set; }

        public int PageIndex3 { get; set; }
        public int PageSize3 { get; set; }
        public string EmpCode { get; set; } = "";
        public string EmpCodeManual { get; set; } = "";
        public string EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string SelectedNature { get; set; } = "";
        public string SelectedCity { get; set; } = "";
        public string SortBy { get; set; } = ""; // Default sorting column       
        public string FkMonthId { get; set; }
        public string FkYearId { get; set; }
    }


    public class ITProcessModel
    {
        public List<ITProcessEmployees> UnProcessedList { get; set; }
        public List<ITProcessEmployees> ProcessedList { get; set; }
        public List<ITProcessEmployees> LockedList { get; set; }

        public int unProcessedCount { get; set; }
        public int ProcessedCount { get; set; }
        public int LockedCount { get; set; }
    }

    public class ITProcessEmployees
    {
        public long CID { get; set; }                // bigint
        public string PkEmpId { get; set; }          // varchar(15)
        public string EmpCode { get; set; }          // varchar(25)
        public string ManualEmpCode { get; set; }    // varchar(25)
        public string EmpName { get; set; }          // varchar(255)
        public string Location { get; set; }         // varchar(255)
        public string Department { get; set; }       // varchar(100)
        public string Designation { get; set; }      // varchar(100)
        public string IT { get; set; }      // varchar(100)

    }



    public class ITProcessePostModel
    {

        public string EmpCode { get; set; } = "";
        public string EmpCodeManual { get; set; } = "";
        public string? EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string? SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? SelectedNature { get; set; } = "";
        public string? SelectedCity { get; set; } = "";
        public string? SortBy { get; set; } = ""; // Default sorting column       
        public string? EmpStatus { get; set; } = "";
        public string? FkMonthId { get; set; }
        public string? FkYearId { get; set; }
        public string? Fk_FinId { get; set; }
        public string? Fk_CompanyId { get; set; }
        public string? DocStatus { get; set; }
        public string? Process { get; set; }


    }


    //Lock IT
    public class LockITModel
    {
        public List<ITProcessEmployees> ITNotLockList { get; set; }
        public List<ITProcessEmployees> ITLockList { get; set; }
        public List<ITProcessEmployees> ITLocked_NotProcessedList { get; set; }

        public int ITNotLockCount { get; set; }
        public int ITLockCount { get; set; }
        public int ITLocked_NotProcessedCount { get; set; }
    }


    //Attandance InOt shift

    [XmlRoot("NewDataSet")]
    public class AttendanceDetailsinoutForAll
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
        public string FkMonthId { get; set; }
        public string FkYearId { get; set; }
        public string? fk_costcentreid { get; set; }
        public string fk_classid { get; set; } = "";

    }

    //added by pp
    public class AttendanceUpdateModel
    {
        public string? EmpCode { get; set; }
        public string? Dated { get; set; }
        public string? InTime { get; set; }
        public string? OutTime { get; set; }
        public string? WorkHour { get; set; }
        public string? ShiftName { get; set; }
        public string? DayStatus { get; set; }
        public string? OutTimeDate { get; set; }
        public string? OThour { get; set; }
        public bool IsLeave { get; set; }
        public bool IsHalfday { get; set; }
        public int LeaveId { get; set; }
        public string pk_empid { get; set; }
        //public bool? OTlapsed { get; set; }

        //public bool? shortleaveLapsed { get; set; }

        //public bool? LatecomingLapsed { get; set; }


        //added by pp 12-09-2025
        public int OTlapsed { get; set; }
        public int shortleaveLapsed { get; set; }
        public int LatecomingLapsed { get; set; }
        public int ShiftActualTime { get; set; }
        public string OTLapsedHours { get; set; }
        public string TotalOTHour { get; set; }
        public string Remark { get; set; }


        public int onlyot { get; set; }
    }



    public class ShiftTimeModel
    {
        public string StartHrs { get; set; }      // e.g. "08"
        public string StartMinute { get; set; }   // e.g. "30"
        public string EndHrs { get; set; }        // e.g. "17"
        public string EndMinute { get; set; }     // e.g. "00"
        public string ShiftHour { get; set; }     // e.g. "08:30"
    }


    public class AttendanceStatusDDLModel
    {
        public string DayStatus { get; set; }
        public bool IsLeave { get; set; }
        public bool IsHalfday { get; set; }
        public long LeaveId { get; set; }
    }





}