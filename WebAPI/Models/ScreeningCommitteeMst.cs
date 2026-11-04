using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class ScreeningCommitteeMst
    {
      
            public ScreeningCommittee ScreeningCommittee { get; set; }
           
            public List<ScreeningCommitteeMember> ScreeningCommitteeMember { get; set; }
       

    }

    [XmlRoot(ElementName = "NewDataSet")]
    public class ScreeningCommitteeXmlModel
    {
        [XmlElement("REC_Screening_Committee")]
        public ScreeningCommittee ScreeningCommittee { get; set; }

        [XmlElement("REC_Screening_Committee_Members")]
        public List<ScreeningCommitteeMember> ScreeningCommitteeMembers { get; set; }
    }

    public class ScreeningCommittee
    {
        public string? pk_screening_committeeId { get; set; }
        public string? fk_jobId { get; set; }
        public string? remarks { get; set; }

        public byte[]? Timestamp { get; set; }

        public long? CID { get; set; }
        public string? Notification_no { get; set; }
        public string? Job_title { get; set; }
    }

    public class ScreeningCommitteeMember
    {
        public string? fk_empid { get; set; }

        public string? fk_screening_committeeId { get; set; }
       public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? department { get; set; }
        public string? designation { get; set; }
    }

    


}
