using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]

    public class ScheduleIntervieDataSet
    {
        [XmlElement("REC_Interview_Schedule")]
        public List<ScheduleInterviewInsData> ScheduleInterviewInsData { get; set; } = new List<ScheduleInterviewInsData>();


    }
   
    public class ScheduleInterviewMst
    {
        public string? fk_recId { get; set; }
        public string? interview_date { get; set; }
        public string? interview_time { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }


      
    }

    public class ScheduleInterviewInsData
    {

        public string? fk_recId { get; set; }

        [XmlIgnore]
        public string? fk_jobid { get; set; }

        [XmlIgnore]
        public string? Fk_UserID { get; set; }
        [XmlIgnore]
        public string? Fk_LocID { get; set; }
        public string? interview_date { get; set; }
        public string? interview_time { get; set; }
        //public string? fk_insUserID { get; set; }
        //public string? fk_updUserID { get; set; }
        //public string? fk_insDateId { get; set; }
        //public string? fk_updDateID { get; set; }
    }

    public class ScheduleInterviewGetData
    {
        public string? pk_recId { get; set; }
        public string? fk_jobId { get; set; }
        public string? candidate_name { get; set; }
        public string? father_name { get; set; }
        public string? dateofbirth { get; set; }
        public string? corresAddress { get; set; }
        public string? filename { get; set; }
        public string? phone { get; set; }
        public string? mobile { get; set; }
        public string? email { get; set; }
        public string? interview_date { get; set; }
        public string? interview_time { get; set; }
        public string? Htime { get; set; }
        public string? Mtime { get; set; }
      
    }

    public class dateData
    {
        public string? fk_jobId { get; set; }
        public string? Job_opening_date { get; set; }
        public string? Job_closing_date { get; set; }
        public string? No_of_post { get; set; }

    }






}