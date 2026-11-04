using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{


    [XmlRoot("NewDataSet")]
    public class QualificationDetailsDataSet
    {
        [XmlElement("SAL_EmployeeQualification_Details")]
        public QualificationDetails qualificationDetails { get; set; }
    }

    public class QualificationDetails
    {

        [XmlElement("fk_empid")]
        [StringLength(15, ErrorMessage = "fk_empid must be between 1 and 15 characters.", MinimumLength = 1)]
        public string fk_empid { get; set; }

        [XmlElement("fk_qualiId")]
        public long? fk_qualiId { get; set; }

        [XmlElement("fk_subjectid")]
        public long? fk_subjectid { get; set; }

        [XmlElement("fk_insid")]
        public long? fk_insid { get; set; }

        [XmlElement("qualification")]
        [StringLength(100, ErrorMessage = "qualification must be between 1 and 100 characters.", MinimumLength = 1)]
        public string? qualification { get; set; }

        [XmlElement("subject")]
        public string? subject { get; set; }

        [XmlElement("institute")]
        public string? institute { get; set; }

        [XmlElement("passyear")]
        public int? passyear { get; set; }
        [XmlElement("marks")]
        public decimal? marks { get; set; }
        [StringLength(25, ErrorMessage = "division must be between 1 and 25 characters.", MinimumLength = 1)]
        [XmlElement("division")]
        public string? division { get; set; }

        [XmlElement("documentupload")]
        public string? documentupload { get; set; }

        [XmlIgnore]
        public IFormFile? UploadFile { get; set; }
        public string? pk_empqualid { get; set; }

        public string? empname { get; set; }
        public string? empcode { get; set; }
        public string? locname { get; set; }
        public string? designation { get; set; }
        public string? department { get; set; }
        public byte[]? Timestamp { get; set; }


    }

}






