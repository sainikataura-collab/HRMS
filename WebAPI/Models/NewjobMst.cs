using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class NewjobMstDataSet
    {
        [XmlElement("REC_Open_Newjob")]
        public NewjobMst NewjobMst { get; set; }

        [XmlElement("REC_Open_Newjob_Qualification")]
        public List<NewjobQualification> NewjobQualification { get; set; } = new List<NewjobQualification>();

        [XmlElement("REC_Open_Newjob_Specialization")]
        public List<NewjobSpecialization> NewjobSpecialization { get; set; } = new List<NewjobSpecialization>();

        [XmlElement("REC_Open_Newjob_InterviewPanel")]
        public List<NewjobInterviewPanel> NewjobInterviewPanel { get; set; } = new List<NewjobInterviewPanel>();
    }
  

    public class NewjobMst
    {
      
        public string? pk_JobId { get; set; }
        public long? fk_reqid { get; set; }
        public long? MaxNo { get; set; }
        public string? fk_finid { get; set; }
        public string? Notification_no { get; set; }
        public string? Job_title { get; set; }
        public string? fk_desgid { get; set; }
        public string? designation { get; set; }
        public string? forlocation { get; set; }
        public short? No_of_post { get; set; }
        public string? Job_opening_date { get; set; }
        public string? Job_closing_date { get; set; }
        public decimal? Experience_From { get; set; }
        public decimal? Experience_To { get; set; }
        public decimal? Age_From { get; set; }
        public decimal? Age_To { get; set; }
        public decimal? CTC_From { get; set; }
        public decimal? CTC_To { get; set; }
        public string? Remarks { get; set; }
        public string? fk_deptId { get; set; }
        public long? fk_cost_centre_id { get; set; }
        public string? Application_form_path { get; set; }
        public string? Job_details_path { get; set; }
        public bool? job_closed { get; set; }
        public long? interviewround { get; set; }
        public string? fk_locid { get; set; }
        public string? forRequirement { get; set; }
        public string? remarksCaused { get; set; }
        public decimal? tatDays { get; set; }
        public string? jobResponsibilities { get; set; }
        public string? Appcontenttype { get; set; }
        public string? AppFilename { get; set; }
        public string? UpdAppChange { get; set; }
        public string? Jobcontenttype { get; set; }
        public string? JobFilename { get; set; }
        public string? UpdJobChange { get; set; }
        public string? fk_userid { get; set; }
        public string? fk_companyId { get; set; }
        public string? Appattachment { get; set; }
        [XmlIgnore]
        public IFormFile? Appfilepath { get; set; }
        public string? Jobattachment { get; set; }
        [XmlIgnore]
        public IFormFile? Jobfilepath { get; set; }
    }
    public class NewjobQualification
    {
        public string? fk_JobId { get; set; }
        public long? fk_qualiId { get; set; }
    }

    public class NewjobSpecialization
    {
        public string? fk_JobId { get; set; }
        public string? fk_specializationId { get; set; }
    } 
    public class NewjobInterviewPanel
    {
        public string? fk_JobId { get; set; }
        public string? fk_empId { get; set; }
    }

    public class NewjobResult
    {
        public NewjobMst NewjobMst { get; set; }

        public List<NewjobQualification> NewjobQualification { get; set; }

        public List<NewjobSpecialization> NewjobSpecialization { get; set; }

        public List<NewjobInterviewPanel> NewjobInterviewPanel { get; set; }
    }
}
