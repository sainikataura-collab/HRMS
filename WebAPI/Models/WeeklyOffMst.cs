using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
namespace HRMSWebAPI.Models
{

    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]
    public class WeeklyOffMstDataSet
    {
        [XmlElement("SAL_WeeklyOff_Mst")]
        public List<WeeklyOffMst> WeeklyOff { get; set; }
    }

    public class WeeklyOffMst
    {
        public string? pk_woffid { get; set; }
        public string fk_locid { get; set; }
        public string? location { get; set; }
        public string sun { get; set; }
        public string mon { get; set; }
        public string tue { get; set; }
        public string wed { get; set; }
        public string thur { get; set; }
        public string fri { get; set; }
        public string sat { get; set; }
        public string? fk_insuserid { get; set; }
        public string? fk_upduserid { get; set; }
        public string? fk_insdateid { get; set; }
        public string? fk_upddateid { get; set; }
        public byte[]? Timestamp { get; set; }
    }
}
