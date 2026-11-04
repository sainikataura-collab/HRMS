using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class RegulariseAttendanceMstDataSet
    {
        [XmlElement("SAL_Attendance_InOut_Regularisation")]
        public RegulariseAttendanceMst RegulariseAttendanceMst { get; set; } = new RegulariseAttendanceMst();
    }
    public class RegulariseAttendanceMst
    {
        public long? pk_inoutid { get; set; }
        public long? fk_inoutid { get; set; }
        public string? fk_empid { get; set; }
        public string? dated { get; set; }
        public string? attenDate { get; set; }
        public string? remarks { get; set; }
        public string? intime { get; set; }
        public string? outtime { get; set; }
        public string? description { get; set; }
        public int? status { get; set; }
        public string? fk_HODempid { get; set; }
        public string? HODRemarks { get; set; }
        public int? HODstatus { get; set; }
        public bool? isApprovedbyHOD { get; set; }
        public bool? isDisapprovedbyHOD { get; set; }
        public bool? isDisapproved { get; set; }
    }

    // cdo request
    [XmlRoot("NewDataSet")]
    public class CDORequestList
    {
        [XmlElement("SAL_Attendance_CDO")]
        public CDORequest CDORequest { get; set; } = new CDORequest();
        
    }

    public class CDORequest
    {
        public long? pk_inoutid { get; set; }
        public long? fk_inoutid { get; set; }
        public string? fk_empid { get; set; }     // Employee ID
        public DateTime? attenDate { get; set; }    // CDO dat
        public decimal? cdoHours { get; set; }      // Number of hours
        public string? remarks { get; set; }        // Remarks
    }


    public class RegularisationDateddl
    {
        public string? pk_inoutid { get; set; }
        public string? description { get; set; }
        public string? daydescription { get; set; }
    }
    public class AttendanceInOutRegularisationGetTime
    {
        public string? InHours { get; set; }
        public string? InMinutes { get; set; }
        public string? OutHours { get; set; }
        public string? OutMinutes { get; set; }
        public string? Type { get; set; }
    }


    //shiv

    public class EMP_Attendance_DetailsMain
    {

       public List<EMP_Attendance_Details> AttenList { get; set; }
       public  EMP_Attendance_Consolidate Atten { get; set; }
    }
    public class EMP_Attendance_Consolidate
    {
        public decimal? Present { get; set; }
        public decimal? Absent { get; set; }
        public decimal? Late { get; set; }
        public decimal? Leave { get; set; }
        public decimal? MPunch { get; set; }
        public decimal? WeekOff { get; set; }
        public decimal? Holiday { get; set; }
        public string? WrkHours { get; set; }
        public string? OTHours { get; set; }
        public decimal? ODCount { get; set; }
        public decimal? ShortLeave { get; set; }
        public decimal? CDO { get; set; }
    }

    public class EMP_Attendance_Details
    {

        public int CID { get; set; }
        public string PkEmpId { get; set; }
        public string EmpCode { get; set; }
        public string ManualEmpCode { get; set; }
        public string EmpName { get; set; }
        public string LocName { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }
        public string PkInOutId { get; set; }
        public string Dated { get; set; }
        public string? InTime { get; set; }
        public string? OutTime { get; set; }
        public string DayStatus { get; set; }
        public string WorkHour { get; set; } // Or TimeSpan if storing as time
        public string DayDescription { get; set; }
        public string LateCount { get; set; }
        public string ViewDated { get; set; }
        public string LateComing { get; set; }

        public bool IsOnLeave { get; set; }
        public int Days { get; set; }
        public string OTHour { get; set; } // Or TimeSpan
        public string ShowLotLong { get; set; }
        public string FkEmpId { get; set; }

        public string OTlapsed { get; set; }   // no longer nullable
        public string shortleaveLapsed { get; set; }
        public string LatecomingLapsed { get; set; }

    }
    public class EMPAttendanceDash
    {

        public int CID { get; set; }
        public string PkEmpId { get; set; }
        public string EmpCode { get; set; }
        public string ManualEmpCode { get; set; }
        public string EmpName { get; set; }
        public string LocName { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }
        public string PkInOutId { get; set; }
        public string Dated { get; set; }
        public string? InTime { get; set; }
        public string? OutTime { get; set; }
        public string DayStatus { get; set; }
        public string WorkHour { get; set; } // Or TimeSpan if storing as time
        public string DayDescription { get; set; }
        public string LateCount { get; set; }
        public string ViewDated { get; set; }
        public string LateComing { get; set; }

        public bool IsOnLeave { get; set; }
        public int Days { get; set; }
        public string OTHour { get; set; } // Or TimeSpan
        public string ShowLotLong { get; set; }
        public string FkEmpId { get; set; }


    }

}
