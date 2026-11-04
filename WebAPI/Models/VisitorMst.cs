namespace HRMSWebAPI.Models
{
    public class VisitorMst
    {
        public long VisitorId { get; set; }
        public string? VisitorName { get; set; }
        public string? VisitorMobileNo { get; set; }
        public string? VisitorEmail { get; set; }
        public string? VisitorAddress { get; set; }
        public string? WhomtoMeet { get; set; }
        public string? WhomtoMeetCode { get; set; }
        public string? VisitPurpose { get; set; }
        public string? CarriedItems { get; set; }
        public string? PhotoName { get; set; }
        public string? Signature { get; set; }
        public string? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsApproved { get; set; }
        public string? ApprovalRemarks { get; set; }
        public string? ApprovalBy { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public bool? IsRejected { get; set; }
        public DateTime? OutTime { get; set; }
    
    }
}
