
using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;


namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class ManualMstDataSet
    {
        [XmlElement("EMP_Attendance_Details")]
        public ManualMst manualMst { get; set; }
    }
    public class ManualMst
        {
            public long? CID { get; set; }
            public string? pk_empid { get; set; }
        public string? fk_empid { get; set; }
        public string? fk_monthId { get; set; }
        public string? fk_yearId { get; set; }
        public string? flag { get; set; }
        public string? empcode { get; set; }
            public string? manualempcode { get; set; }
            public string? empname { get; set; }
            public string? locname { get; set; }
            public string? department { get; set; }
            public string? designation { get; set; }
            public string? pk_inoutid { get; set; }
            public string? dated { get; set; }
            public string? intime { get; set; }
        public string? inDate { get; set; }
        public string? outDate { get; set; }
        public string? outtime { get; set; }
            public string? daystatus { get; set; }
            public string? workhour { get; set; }
            public string? OThour { get; set; }
            public string? latecount { get; set; }
            public string? LateComing { get; set; }
            public string? Short { get; set; }
            public string? ShiftName { get; set; }
            public string? intimedate { get; set; }
            public string? outtimedate { get; set; }
            public string? lunchout { get; set; }
            public string? lunchin { get; set; }
            public string? earlyarrival { get; set; }
            public string? lessduetolunch { get; set; }
            public string? losstime { get; set; }
            public bool? IsLeave { get; set; }
            public string? pk_inoutid1 { get; set; }
            public string? pk_inoutid2 { get; set; }
        }

    public class leavecount
    {
        
        public int totalleavetaken { get; set; }
    }
    }




