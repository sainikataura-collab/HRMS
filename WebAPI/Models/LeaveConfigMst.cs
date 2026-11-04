using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]

    public class LeaveConfigMstDataSet
    {
        [XmlElement("SAL_LeaveConfig")]
        public List<LeaveConfigMst> LeaveConfigMst { get; set; }
    }
    public class LeaveConfigMst
    {
        public short? nholiday_priority { get; set; }
        public short? woff_priority { get; set; }
        public short? club_priority { get; set; }
        public short? cover_priority { get; set; }
        public string? jdate_propationate { get; set; }
        public short? Attdays { get; set; }
        public string? fk_monthId { get; set; }
        public string? fk_yearId { get; set; }
        public string? fk_companyId { get; set; }
        public bool? IsLockedForApply { get; set; }
        public bool? IsLockedForApproval { get; set; }
        public string? shortLeaveHour { get; set; }
    }
}
