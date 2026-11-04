using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class InterviewEvaluationMst
    {
        public string? fk_recId { get; set; }
        public string? interview_round { get; set; }  // Roman numerals like 'I', 'II', etc.
        public string? personalityremarks { get; set; }
        public string? personality { get; set; }       // 'Excellent', 'Very Good', etc.
        public string? interview_remarks { get; set; }

    }

    [XmlRoot("NewDataSet")]
    public class ScoringSheetXmlModel
    {
        [XmlElement("REC_Filling_ScoringSheet")]
        public Filling_ScoringSheet ScoringSheets { get; set; }

        [XmlElement("REC_Candidate_Interview_ByScreeningCommittee")]
        public List<Candidate_Interview_ByScreeningCommittee> Interviews { get; set; }
    }

    public class Filling_ScoringSheet
    {
       


        public string? fk_recId { get; set; }

        public  string? fk_jobId { get; set; }
        public string? fk_screening_committeeId { get; set; }
        public string? interview_status { get; set; }
        public string? interview_remarks { get; set; }
        public string? personality { get; set; }
        public string? personalityremarks { get; set; }
        public long? interview_round { get; set; }

        public byte[]?Timestamp { get; set; }

//for only edit
        public string? candidate_name { get; set; }

    }

    public class Candidate_Interview_ByScreeningCommittee
    {
        public string? fk_recId { get; set; }
        public string? fk_empid { get; set; }
    }
    public class ScoringSheetEditModel
    {
        public Filling_ScoringSheet ScoringSheetList { get; set; }
        public List<Candidate_Interview_ByScreeningCommittee> Interviews { get; set; }
    }


  

    public class InterviewRoundDto
    {

        public List<int> InterviewRoundList { get; set; }
        public int InterviewRound { get; set; }

        public string Job_opening_date { get; set; }

        public string Job_closing_date { get; set; }
    }


}
