
using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
   

    [XmlRoot("NewDataSet")]
    public class ExperienceDetailsDataSet
    {
        [XmlElement("SAL_EmployeePreviousJob_Details")]
        public ExperienceDetails experienceDetails { get; set; }
    }

    public class ExperienceDetails
    {

        [XmlElement("fk_empid")]
        [StringLength(15, ErrorMessage = "fk_empid must be between 1 and 15 characters.", MinimumLength = 1)]
        public string? fk_empid { get; set; }

        [XmlElement("compname")]
        [StringLength(100, ErrorMessage = "compname must be between 1 and 100 characters.", MinimumLength = 1)]
        public string? compname { get; set; }

        [XmlElement("designation")]
        [StringLength(100, ErrorMessage = "designation must be between 1 and 100 characters.", MinimumLength = 1)]
        public string? designation { get; set; }

        [XmlElement("department")]
        [StringLength(100, ErrorMessage = "department must be between 1 and 100 characters.", MinimumLength = 1)]
        public string? department { get; set; }

        [XmlElement("fromdate")]
        public string? fromdate { get; set; }

        [XmlElement("todate")]
        public string? todate { get; set; }

        [XmlElement("documentupload")]
        public string? documentupload { get; set; }

        [XmlIgnore]
        public IFormFile? UploadFile { get; set; }

        [XmlElement("ctc")]
        public decimal? ctc { get; set; }

        [XmlElement("profile")]
        [StringLength(500, ErrorMessage = "Profile must be between 1 and 500 characters.", MinimumLength = 1)]
        public string? profile { get; set; }

        [XmlElement("leavingreason")]
        [StringLength(255, ErrorMessage = "Leaving reason must be between 1 and 255 characters.", MinimumLength = 1)]
        public string? leavingreason { get; set; }
        public long? pk_pjobid { get; set; }

       public string? empname { get; set; }
        public string? empcode { get; set; }
        public byte[]? Timestamp { get; set; }


    }




}



