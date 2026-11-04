using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{


    [XmlRoot("NewDataSet")]
    public class LeavesTransactionDataSet
    {
        [XmlElement("SAL_LeavesTaken_Mst")]
        public SAL_LeavesTaken_Mst LeavesTakenMasters { get; set; }

        [XmlElement("SAL_LeavesTaken_Details")]
        public List<SAL_LeavesTaken_Details> LeaveTakenDetails { get; set; }

        public byte[]? Timestamp { get; set; }

    }

    // use for insert and approve pending leave
    public class SAL_LeavesTaken_Mst
    {

        public string? fk_empid { get; set; }
        public string? pk_leavetakenid { get; set; }
        public long? fk_leaveappid { get; set; }

        public string? fk_finid { get; set; }

        public long fk_leaveid { get; set; }

        public string fromdate { get; set; }

        public string todate { get; set; }

        public decimal leavetaken { get; set; }

        public string? remarks { get; set; }


        public bool? isLateComing { get; set; }
        public string? Fk_UserID { get; set; }
        public string? Fk_LocID { get; set; }

    }


    public class SAL_LeavesTaken_Details
    {
        public int sno { get; set; }

        public long? fk_leaveid { get; set; }

        [XmlElement("dated")]
        public string dated { get; set; }

        [XmlElement("clubcase")]
        public string clubcase { get; set; }

        [XmlElement("covercase")]
        public string covercase { get; set; }

        [XmlElement("ishalfday")]
        public bool IsHalfDay { get; set; }

        [XmlElement("remarks")]
        public string? Remarks { get; set; }

        [XmlElement("halfdaystatus")]
        public string? HalfDayStatus { get; set; }

        [XmlElement("halfdayclub")]
        public string? HalfDayClub { get; set; }
    }


    public class EmployeeLeaveApprovalModel
    {
        public LeaveApply leaveApply { get; set; }
        public List<LeaveApplyDetails> LeaveApplyDetails { get; set; }
        public SAL_LeavesTaken_Mst LeavesTakenMst { get; set; }
        public List<SAL_LeavesTaken_Details> LeavesTakenDetails { get; set; }
        public EmployeeLeaveApprovedByDetails EmployeeLeaveApprovedByDetails { get; set; }
        public EmployeeLeaveDetails EmployeeLeaveDetails { get; set; }
    }


    public class LeaveApply
    {
        public long? Pk_LeaveappId { get; set; }
        public string? Fk_Empid { get; set; }
        public string? Fk_Finid { get; set; }
        public string? Fk_Leaveid { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? TotDays { get; set; }
        public string? Remarks { get; set; }
        public string? Status { get; set; }
    }

    public class LeaveApplyDetails
    {
        public long? Fk_LeaveappId { get; set; }
        public int? Sno { get; set; }
        public string? Fk_Leaveid { get; set; }
        public DateTime? Dated { get; set; }
        public string? ClubCase { get; set; }
        public string? CoverCase { get; set; }
        public bool? IsHalfDay { get; set; }
        public string? Remarks { get; set; }
        public string? HalfDayStatus { get; set; }
    }






    public class EmployeeLeaveApprovedByDetails
    {
        public string? Fk_Empid { get; set; }
        public int? OrderNo { get; set; }
        public string? Fk_ApprovedById { get; set; }
    }

    public class EmployeeLeaveDetails
    {
        public string? Fk_Empid { get; set; }
        public string? Fk_Leaveid { get; set; }
        public decimal? LeaveAvailed { get; set; }
    }


    //end


    //get data data update

    public class EmpDetailsModelGetDataforUpd
    {

        public string fk_empid { get; set; }
        public string pk_Empid { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string fathername { get; set; }
        // public string locname { get; set; }
        public string fk_deptid { get; set; }
        public string fk_desgid { get; set; }


    }

    public class EmplLeaveDetailGetDataforUpd
    {
        public string fk_leavetakenid { get; set; }
        public int CID { get; set; }   //sno
        public string fk_leaveid { get; set; }
        public string leavetype { get; set; }
        public string clubcase { get; set; }
        public string covercase { get; set; }
        public bool ishalfday { get; set; }
        public string Remarks { get; set; }
        public string halfdaystatus { get; set; }
        public string dates { get; set; }
        public string weeklyoff { get; set; }
        public string weeklyoffId { get; set; } //pk_leaveid
        public string halfdayclub { get; set; }
        public bool isenabled { get; set; }
        public bool ischecked { get; set; }   //ishalfday
        public string halpdaystatus { get; set; } // typo in SP: halfdaystatus
    }

    //end






    //for get data in form

    public class EmployeeDetailsModel
    {
        public string fk_empid { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string fathername { get; set; }
        public string locname { get; set; }
        public string dept { get; set; }
        public string designation { get; set; }


    }
    public class EmployeeLeaveDetailsModel
    {
        public string pk_assignid { get; set; }
        //public int fk_leaveId { get; set; }
        public string leavetype { get; set; }
        public string shortdesc { get; set; }
        public decimal currentyearleaves { get; set; }
        public decimal totalleavesearned { get; set; }
        public decimal totalleave { get; set; }   //currentyearleaves + totalleavesearned
        public decimal leaveavailed { get; set; }
        public decimal latecoming { get; set; }
        public decimal balleave { get; set; } //currentyearleaves + totalleavesearned - leaveavailed
    }

    //end




    // for get EmpLeavesOnDates

    public class LeaveDates
    {

        public long CID { get; set; } // Identity column
        public string dates { get; set; }
        public int weekoff { get; set; }
        public int nholiday { get; set; }
        public int lwp { get; set; }
        public int leaveid { get; set; }
        public bool club_nh { get; set; }
        public bool cover_nh { get; set; }
        public bool club_woff { get; set; }
        public bool cover_woff { get; set; }
        public int ishalfday { get; set; }
        public string IsWeekHoliday { get; set; }
        public bool isenabled { get; set; }
        public bool ischecked { get; set; }
        public string halpdaystatus { get; set; }
        public string LeaveType { get; set; }
        public string totDays { get; set; }

    }


    public class LeaveTypeDetail
    {
        public int MaxPerYear { get; set; }
        public int LeaveLimitPerInstance { get; set; }
        public int Cavailed { get; set; }
        public bool IsMedicalLeave { get; set; }
        public int MinimumMedicalDays { get; set; }
        public bool IsCertificateMandatory { get; set; }
    }
    public class Datefrom
    {
        public int TOffDay { get; set; }
        public int DDiff { get; set; }
        public string dtfrom_org { get; set; }
        public string dtto_org { get; set; }
    }

    //

    // get  LeavesTaken list base on empid

    public class LeaveTakenDetails
    {
        public string pk_leavetakenid { get; set; }
        public string fk_empid { get; set; }
        public string leavetype { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
        public decimal leavetaken { get; set; }
        public string dated { get; set; }
        public string isView { get; set; }
        public string status { get; set; }
        public string fromtime { get; set; }
        public string totime { get; set; }
        public decimal totalhour { get; set; }
    }

    public class leaveTakenLeaveBalance
    {
        //public string fk_empid { get; set; }
        //public long fk_leaveid { get; set; }
        public decimal currentyearleaves { get; set; }
        public decimal totalleavesearned { get; set; }
        public decimal Totalleavebal { get; set; }



    }


    public class PendingLeaveResult
    {
        public List<PendingLeave> Leaves { get; set; }
        public string viewpnl { get; set; }
    }

    public class PendingLeave
    {
        public int pk_leaveappid { get; set; }
        public string empcode { get; set; }
        public string empname { get; set; }
        public string locname { get; set; }
        public string shortdesc { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
        public decimal totdays { get; set; }
        public string status { get; set; }
    }
    public class ViewPanelResult
    {
        public string viewpnl { get; set; }
    }





    ///---OD Request
    ///


    [XmlRoot("LeaveModule")]
    public class LeaveModule
    {

        public string? fromtime { get; set; }      // add
        public string? totime { get; set; }        //add
        public string? totalhour { get; set; }     //add

        public string? pk_leaveappid { get; set; }
        public string? pk_applycompoffId { get; set; }
        public string? pk_shortLeaveId { get; set; }

        public string? fk_leaveid { get; set; }
        public string? fk_empid { get; set; }
        public string? fk_finid { get; set; }

        public string? fromdate { get; set; } // Use string to keep format "dd/MM/yyyy"
        public string? todate { get; set; }
        public decimal? totdays { get; set; }

        public string? Reason { get; set; }
        public string? contactno { get; set; }
        public string? contactduringleave { get; set; }
        public string? intime { get; set; }
        public string? outtime { get; set; }
        public string? totalhours { get; set; }

        public decimal? LeaveBalance { get; set; }
        public decimal? currentyearleaves { get; set; }
        public decimal? totalleavesearned { get; set; }
        public decimal? totalleave { get; set; }
        public decimal? leaveavailed { get; set; }
        public decimal? BalanceLeave { get; set; }
        public string? Remarks { get; set; }
        public string? shortLeavedate { get; set; }

        [XmlArrayItem("LeaveModuleTrn")]
        public List<LeaveModuleTrn>? LeaveDetail { get; set; }
    }

    public class LeaveModuleTrn
    {
        public string? dates { get; set; } // Keep as string for format "dd"
        public string? LeaveType { get; set; }
        public bool ishalfday { get; set; }
        public bool ishalfdayDes { get; set; }

        public int? sno { get; set; }
        public string? leaveid { get; set; }

        public string? Remarks { get; set; }
        public string? halfdaystatus { get; set; }
    }

    public class LeaveInsertResponse
    {
        public string DocumentId { get; set; }
        public string DocumentNo { get; set; }
        public bool IsSuccessfull { get; set; }
    }


    //Approve Regularization


    [XmlRoot("SAL_Attendance_Regularize_Mst")]
    public class AttendanceRegularizationApproval
    {

        public int RegularizeId { get; set; }

        public long? pk_inoutid { get; set; }
        public DateTime Dated { get; set; }
        public int RegularizedStatus { get; set; }
        public string? pk_empId { get; set; }

        public bool IsApproved { get; set; }

        [Required]
        public int ApprovalStatus { get; set; }
        [Required]
        public string? ApprovalRemarks { get; set; }

        public bool IsDisapproved { get; set; }
    }




    //Shiv



    //short leave model
    //public class LeaveModule
    //{
    //    public string? fk_empid { get; set; }
    //    public string intime { get; set; }
    //    public string outtime { get; set; }

    //    public string? totdays { get; set; }
    //    public string? totalhours { get; set; }
    //    public string? Remarks { get; set; }

    //    public string? shortLeavedate { get; set; }
    //}


    public class ShortLeaveApprovalModel
    {
        public string? fk_empid { get; set; }
        public long pk_shortLeaveId { get; set; }
        public string? ApprovalStatus { get; set; }
        public string? ApprovalRemarks { get; set; }
    }



    public class ShortLeaveModel
    {
        public int pk_shortLeaveId { get; set; }
        public string dated { get; set; }

        public string? shortLeavedate { get; set; }
        public string? intime { get; set; }

        public string? outtime { get; set; }
        public string? totalhours { get; set; }

        public string? remarks { get; set; }

        public string? status { get; set; }        // e.g., "23:59"

    }


    public class ShortLeaveViewModel
    {
        public int pk_shortLeaveId { get; set; }
        public string LeaveDate { get; set; }
        public string FromHours { get; set; }
        public string FromMinute { get; set; }
        public string ToHours { get; set; }
        public string ToMinute { get; set; }
        public string Remarks { get; set; }
        public string InTime { get; set; }     // formatted e.g. "18:50"
        public string OutTime { get; set; }    // formatted e.g. "22:48"
        public string ShortLeaveDate { get; set; }
        public string TotalHours { get; set; } // formatted e.g. "03:58"
    }


    public class ApprovalShortLeaveModel
    {
        public int pk_shortLeaveId { get; set; }
        public string dated { get; set; }             // Request Date
        public string leavedate { get; set; }         // Leave Date
        public string fromtime { get; set; }          // Time From
        public string totime { get; set; }            // Time To
        public string totalhours { get; set; }        // Total Hours
        public string Remarks { get; set; }

        public string ApprovalRemarks { get; set; }
        public string Status { get; set; }
        public string empcode { get; set; }
        public string empname { get; set; }
        public string intime { get; set; }
        public string outtime { get; set; }
        public string shortLeavedate { get; set; }
    }


    //ApprovalLeaveOd
    public class LeaveApprovalOdModel
    {

        public string? pk_leaveappid { get; set; }
        public string? fk_empid { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? dated { get; set; }
        public string? shortdesc { get; set; }
        public string? fromdate { get; set; }
        public string? todate { get; set; }
        public string? totdays { get; set; }
        public string? Reason { get; set; }
        public string? filename { get; set; }
        public string? LeaveBalance { get; set; }


    }



    public class LeaveApprovedModelList
    {
        public string fk_leaveappid { get; set; }
        public string fk_empid { get; set; }
        public string empcode { get; set; }
        public string empname { get; set; }
        public string dated { get; set; }
        public string shortdesc { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
        public string totdays { get; set; }
        public string reason { get; set; }
        public string filename { get; set; }
        public string leaveBalance { get; set; }
        public string approvedDate { get; set; }
        public string approvedRemarks { get; set; }
        public string approvedStatus { get; set; }
    }


    public class LeaveApprovalModel
    {
        public string? fk_leaveappid { get; set; }
        public List<string> fk_leaveappids { get; set; }
        public string? fk_approvedby { get; set; }
        public string? status { get; set; }
        public string? remarks { get; set; }
    }


}
