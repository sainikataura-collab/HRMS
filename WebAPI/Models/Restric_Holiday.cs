using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class Re_HolidayMstDataSet
    {
        [XmlElement("SAL_RestrictedHolidays_Mst")]
        // public HolidayMst Holiday { get; set; }
        public List<Restric_Holiday> Re_Holiday { get; set; } = new List<Restric_Holiday>(); // List for multiple entries

    }
    public class Restric_Holiday
    {
        public string? pk_holidayid { get; set; }

        [XmlElement("fk_yearid")]

        public long? fk_yearid { get; set; }  // fk_yearid

        [XmlElement("fk_locid")]
        public string? fk_locid { get; set; }


        [XmlElement("dated")]

        public string dated { get; set; }  // dated

        [StringLength(100, ErrorMessage = "Holiday must be minimum 2 and  maximum 100 character  long.", MinimumLength = 2)]

        [XmlElement("holidaytype")]

        public string holidaytype { get; set; }

        [XmlElement("IsNH")]

        public bool? IsNH { get; set; }  // IsNH

        public string? IsNHName { get; set; }

        public string? datedString { get; set; }

        public string? locname { get; set; }
        public byte[]? Timestamp { get; set; }

    }
}
