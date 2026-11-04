using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class LeaveDetailDataSet
    {
        [XmlElement("SAL_EmployeeLeave_Details")]
        public List<LeaveDetailMst> LeaveDetails { get; set; } = new List<LeaveDetailMst>();
    }

    public class LeaveDetailMst
    {
        [XmlElement("pk_assignid")]
        public string? pk_assignid { get; set; }

        [XmlElement("leavetype")]
        public string? leavetype { get; set; }

        [XmlElement("fk_empid")]
        public string? fk_empid { get; set; }

        [XmlElement("fk_leaveid")]
        public long? fk_leaveid { get; set; }

        [XmlElement("currentyearleaves")]
        public decimal currentyearleaves { get; set; }

        [XmlElement("totalleavesearned")]
        public decimal totalleavesearned { get; set; }

        [XmlElement("leaveavailed")]
        public decimal leaveavailed { get; set; }

        public byte[]? Timestamp { get; set; }
    }
    //for emp details
        public class EmpdetailMst
        {

            public string pk_empid { get; set; }
            public string dept { get; set; }

            public string designation { get; set; }

            public string empcode { get; set; }
            public string empname { get; set; }
        }
    //for leave assign
    public class LeaveAssignmentMst
    {
        public string? fk_empid { get; set; }
        public long? fk_leaveid { get; set; }
        //  public string ? fk_natureid { get; set; }

        public decimal? maxperyear { get; set; }

        public decimal? availperyear { get; set; }


    }


}
