using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class CandidateMstDataset
    {
        [XmlElement("HR_Format_Mst")]
        public CandidateMst Candidates { get; set; }
    }
    public class CandidateMst
    {
        public long? pk_formatid { get; set; }
        public string? fk_empid { get; set; }
        public string? fk_locid { get; set; }
        public string? location { get; set; }
        public string? fk_deptid { get; set; }
        public string? fk_desgid { get; set; }
        public string? designation { get; set; }
        public string? fk_cityid { get; set; }
        public string? fk_emphrid { get; set; }
        public string? name { get; set; }
        public string? nname { get; set; }
        public string? contactno { get; set; }
        public string? pinno { get; set; }
        public string? address { get; set; }
        public string? joiningdate { get; set; } // Store as string for XML serialization
        public decimal? ctc { get; set; }
        public  string? ctcinword { get; set; }
    }
}
