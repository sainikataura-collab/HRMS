using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class HolidayMstDataSet
    {
        [XmlElement("SAL_Holidays_Mst")]
        // public HolidayMst Holiday { get; set; }
        public List<HolidayMst> Holiday { get; set; } = new List<HolidayMst>(); // List for multiple entries

    }
    public class HolidayMst
    {

        public string? pk_holidayid { get; set; }

        [XmlElement("fk_yearid")]

        public long? fk_yearid { get; set; }  // fk_yearid

        [XmlElement("fk_locid")]
        public string? fk_locid { get; set; }
        public string? locname  { get; set; }


        [XmlElement("dated")]

        public string dated { get; set; }  // dated


        [StringLength(100, ErrorMessage = "Holiday must be minimum 2 and  maximum 100 character  long.", MinimumLength = 2)]

        [XmlElement("holidaytype")]

        public string holidaytype { get; set; }

        [XmlElement("IsNH")]

        public bool? IsNH { get; set; }  // IsNH

        public string? IsNHName { get; set; }

        public string? datedString  { get; set; }

        public byte[]? Timestamp { get; set; }

        [XmlElement("IsWorkingDay")]
        public bool? IsWorkingDay { get; set; }   //adding new 

        public string? IsWorkingDayName { get; set; } //adding new 

    }

    [XmlRoot("NewDataSet")]
    public class SAL_Holidays_Mst_WorkingDayMstDataSet
    {
        [XmlElement("SAL_Holidays_Mst_WorkingDay")]
        // public HolidayMst Holiday { get; set; }
        public List<SAL_Holidays_Mst_WorkingDayMst> WorkingDay{ get; set; } = new List<SAL_Holidays_Mst_WorkingDayMst>(); // List for multiple entries

    }

    public class SAL_Holidays_Mst_WorkingDayMst
    {

        public string? pk_holidayid { get; set; }

        [XmlElement("fk_yearid")]

        public long? fk_yearid { get; set; }  // fk_yearid

        [XmlElement("fk_locid")]
        public string? fk_locid { get; set; }
        public string? locname { get; set; }


        [XmlElement("dated")]

        public string dated { get; set; }  // dated


        [StringLength(100, ErrorMessage = "Holiday must be minimum 2 and  maximum 100 character  long.", MinimumLength = 2)]

        [XmlElement("holidaytype")]

        public string holidaytype { get; set; }

        [XmlElement("IsNH")]

        public bool? IsNH { get; set; }  // IsNH

        public string? IsNHName { get; set; }

        public string? datedString { get; set; }

        public byte[]? Timestamp { get; set; }

        [XmlElement("IsWorkingDay")]
        public bool? IsWorkingDay { get; set; }   //adding new 

        public string? IsWorkingDayName { get; set; } //adding new 

    }

}