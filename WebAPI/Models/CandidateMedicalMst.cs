using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using System.Xml.Serialization;
using static HRMSWebAPI.Models.CandidateMedicalMst;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class CandidateReferenceDetailsDataSet
    {
        [XmlElement("REC_Candidate_Reference_Trn")]
        public CandidateReferenceDetails CandidateReferenceDetails { get; set; }

    }

    [XmlRoot("NewDataSet")]
    public class Candidate_MedicalDetailsDataSet
    {
        [XmlElement("REC_Candidate_Medical_Trn")]
        public Candidate_MedicalDetails Candidate_MedicalDetails { get; set; }
    }



    public class CandidateMedicalMst
    {
        public class CandidateReferenceDetails
        {

            [XmlIgnore]
            public long? pk_rtrnid { get; set; }
            public string? fk_recId { get; set; }
            public string? refname { get; set; }
            public string? compname { get; set; }
            public string? designation { get; set; }
            public string? email { get; set; }
            public string? phone { get; set; }
            public string? mobile { get; set; }
            public string? address { get; set; }
            public string? filename { get; set; }
            public string? contenttype { get; set; }
            public string? FileContentType { get; set; }
            public string? attachment { get; set; }

            [XmlIgnore]
            [IgnoreDataMember]
            [JsonIgnore]
            public IFormFile? filepath { get; set; }


        }

        public class Candidate_MedicalDetails
        {
            [XmlIgnore]
            public long? pk_mtrnid { get; set; }
            public string? fk_recId { get; set; }
            public string? description { get; set; }
            public string? dated { get; set; }
            public string? report { get; set; }
        }

        public class CandidateDetailData
        {
            public string? pk_recId { get; set; }
            public string? fk_jobId { get; set; }
            public string? candidate_name { get; set; }
            public string? father_name { get; set; }
            public string? gender { get; set; }
            public string? phone { get; set; }
            public string? mobile { get; set; }
            public string? email { get; set; }
            public string? dateofbirth { get; set; }
            public string? corresAddress { get; set; }
            public string? corresContactNo { get; set; }
            public string? permanentAddress { get; set; }
            public string? permanentContactNo { get; set; }
        }
    }
}
