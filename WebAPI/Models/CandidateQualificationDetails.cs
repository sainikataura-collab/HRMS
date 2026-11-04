using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class CandidateQualificationDetailsDataSet
    {
        [XmlElement("REC_CandidateQualification_Details")]
        public CandidateQualificationDetails qualificationDetails { get; set; }
    }

    public class CandidateQualificationDetails
    {
        public long? pk_cqualid { get; set; }

        [XmlElement("fk_recId")]
        [StringLength(15, ErrorMessage = "fk_recId must be between 1 and 15 characters.", MinimumLength = 1)]
        public string? fk_recId { get; set; }

        [XmlElement("fk_qualiId")]
        public long? fk_qualiId { get; set; }

        [XmlElement("fk_subjectid")]
        public long? fk_subjectid { get; set; }

        [XmlElement("fk_insid")]
        public long? fk_insid { get; set; }

        [XmlElement("qualification")]
        [StringLength(100, ErrorMessage = "qualification must be between 1 and 100 characters.", MinimumLength = 1)]
        public string qualification { get; set; }

        [XmlElement("subject")]
        public string subject { get; set; }

        [XmlElement("institute")]
        public string institute { get; set; }

        [XmlElement("passyear")]
        public int? passyear { get; set; }

        [XmlElement("marks")]
        public decimal? marks { get; set; }

        [StringLength(25, ErrorMessage = "division must be between 1 and 25 characters.", MinimumLength = 1)]
        [XmlElement("division")]
        public string division { get; set; }

        [XmlElement("documentupload")]
        public string? documentupload { get; set; }

        [XmlIgnore]
        public IFormFile? UploadFile { get; set; }

        public string? candidatename { get; set; }
        public byte[]? Timestamp { get; set; }
    }
}