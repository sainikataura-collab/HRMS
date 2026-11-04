using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class CompOffApprovalMstDataSet
    {
        [XmlElement("SAL_EmployeeLeave_Details")]
        public CompOffApprovalMst CompOffApprovalMst { get; set; } = new CompOffApprovalMst();
    }

    public class CompOffApprovalMst
    {
        public string? dated { get; set; }             // Request Date
        public string? compoffdate { get; set; }         // Leave Date
        public string? compoffdays { get; set; }         // Leave Date
        public string? fromtime { get; set; }          // Time From
        public string? totime { get; set; }            // Time To
        public string? totalhours { get; set; }        // Total Hours
        public string? totdays { get; set; }        // Total Hours
        public string? Reason { get; set; }        // Total Hours
        public string? Remarks { get; set; }
        public string? Status { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? intime { get; set; }
        public string? outtime { get; set; }
        public string? shortLeavedate { get; set; }
        public string? fk_empid { get; set; }
        public long? pk_applycompoffId { get; set; }
        public int? ApprovalStatus { get; set; } // e.g., 2 for Approved
        public string? ApprovalRemarks { get; set; }
    }

    public class LeaveModuleMst
    {
        public string? fk_empid { get; set; }
        public long? pk_applycompoffId { get; set; }
        public string? ApprovalStatus { get; set; }
        public string? ApprovalRemarks { get; set; }
    }

}
