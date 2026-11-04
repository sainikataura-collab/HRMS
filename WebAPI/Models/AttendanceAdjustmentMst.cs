using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class AttendanceAdjustmentXmlModel
    {
        [XmlElement("SAL_Attendance_Details")]
        public List<AttendanceAdjustmentMst> AttendanceDetail { get; set; }
    }

    public class EmployeeDetailResult
    {
        public List<ProcessedMst> ProcessedMst { get; set; }
        public List<AttendanceAdjustmentMst> AttendanceAdjustmentMst { get; set; }

        public int ProcessedMstCount {  get; set; }

        public int AttendanceAdjustmentMstCount { get; set; }



    }

    public class ProcessedMst
    {

        public string CID { get; set; }

        public string designation { get; set; }
        public string pk_empid { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string location { get; set; }
        public string Department { get; set; }
    }
    public class AttendanceAdjustmentMst
    {
        public long? pk_attenid { get; set; }
        public string? fk_empid { get; set; }

        public string? empcode { get; set; }

        public string? empname { get; set; }
        public short? fk_monthId { get; set; }
        public short? fk_yearId { get; set; }
        public string? fk_finid { get; set; }
        public decimal? fulldays { get; set; }
        public decimal? totdays { get; set; }
        public decimal? present { get; set; }
        public decimal? sl { get; set; }
        public decimal? lwp { get; set; }
        public decimal? nh { get; set; }
        public decimal? DoubleNH { get; set; }
        public decimal? woff { get; set; }
        public decimal? OTHrs { get; set; }
        public decimal? LateHrs { get; set; }
        public decimal? PresentBeforeIncrement { get; set; }
        public decimal? PresentAfterIncrement { get; set; }
        public decimal? paiddays { get; set; }
        public decimal? SPADays { get; set; }           // Checked = Nullable
        public decimal? IT { get; set; }
        public decimal? CsurCharge { get; set; }
        public decimal? ECessCharge { get; set; }
        public bool? processed { get; set; }
        public decimal? EarnedLeave { get; set; }       // Checked = Nullable
      
        public byte[]? Timestamp { get; set; }
        public bool? OTprocessed { get; set; }          // Checked = Nullable
        public decimal? incentiveDays { get; set; }

        public decimal? lunch { get; set; }
        public decimal? tranded { get; set; }


    }

    public class EmpAttendanceAdjRequest
    {
        public int pageIndex { get; set; } = 0;
        public int pageSize { get; set; } = 10;

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

        public string? fk_costcentreid { get; set; } = "";




    }

}
