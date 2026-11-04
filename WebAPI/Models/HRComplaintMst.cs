namespace HRMSWebAPI.Models
{
    public class HRComplaintMst
    {
        public string? pk_complaintId { get; set; }

        public long? CID { get; set; }
        public string? fk_empid { get; set; }
        public string? empname { get; set; }
        public string? ComplaintDate { get; set; }
        public string? complaintDetails { get; set; }
        public string? fk_empRaisedid { get; set; }
        public string? commentWhomPerson { get; set; }
        public string? commentRaisedPerson { get; set; }
        public string? commentFReporting { get; set; }
        public string? commentSReporting { get; set; }
        public string? commentHOD { get; set; }
        public string? commentManager { get; set; }
        public string? commentGMHR { get; set; }
        public string? commentManagement { get; set; }
        public string? FinalDecision { get; set; }
        public string? fk_InsuserId { get; set; }
        public string? fk_UpduserId { get; set; }
        public string? fk_InsdateId { get; set; }
        public string? fk_UpddateId { get; set; }
        public string? EmpCode { get; set; }
        public string? detailsInc { get; set; }
        public string? raisdComp { get; set; }
        public string? CommPersion { get; set; }
        public string? CommPersonRaised { get; set; }
        public string? CommfirstReport { get; set; }
        public string? CommSecoundReport  { get; set; }
        public string? CommHOD { get; set; }
        public string? CommManager { get; set; }
        public string? CommGMHR { get; set; }
        public string? CommManagemant { get; set; }
        public string? FinalDesion { get; set; }
        public string? fk_userId { get; set; }
        public string? fk_locId { get; set; }
    }
}
