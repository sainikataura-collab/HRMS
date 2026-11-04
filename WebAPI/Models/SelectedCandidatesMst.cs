using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class SelectedCandidatesMstDataSet
    {
        [XmlElement("finalselectedcandidate")]
        public List<SelectedCandidatesMst> Candidates { get; set; } = new List<SelectedCandidatesMst>();
    }
    public class SelectedCandidatesMst
    {
        [XmlIgnore]
        public string? Fk_UserID { get; set; }
        [XmlIgnore]
        public string? Fk_LocID { get; set; }
        public string? fk_jobid { get; set; }
        public string? pk_recId { get; set; }
        public bool? final_selection_status { get; set; }
        public string? remarks { get; set; }
    }
    public class FinalSelectedCandidatesData
    {
        public string? pk_recId { get; set; }
        public string? qualification_marks { get; set; }
        public string? experience_marks { get; set; }
        public string? written_marks { get; set; }
        public bool interview_marks { get; set; }
        public string? marks { get; set; }
        public string? totexperience { get; set; }
        public string? candidate_name { get; set; }
        public string? father_name { get; set; }
        public string? dateofbirth { get; set; }
        public string? corresAddress { get; set; }
        public string? filename { get; set; }
        public string? phone { get; set; }
        public string? mobile { get; set; }
        public string? email { get; set; }
        public string? remarks { get; set; }
        public bool? final_selection_status { get; set; }
    }

    public class SelectedCandidateData
    {
        public string? fk_jobId { get; set; }
        public string? Job_opening_date { get; set; }
        public string? Job_closing_date { get; set; }
        public string? No_of_post { get; set; }

    }
}
