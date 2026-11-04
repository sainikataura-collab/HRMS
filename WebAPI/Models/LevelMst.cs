using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class LevelMst
    {
        public string? pk_levelid { get; set; }
        public string description { get; set; }

        // ADDED BY PP

        public string? Level { get; set; }
        public decimal? VariablePayPercent { get; set; }
        public bool IsReimbursmentAllowed { get; set; }

        public string? fk_companyId { get; set; }
        public string? fk_locid { get; set; }
        public byte[]? Timestamp { get; set; }

        public List<LevelReimbHead>? ReimbHeads { get; set; }


    }
    [XmlRoot("ReimbHeads")]
    public class ReimbHeadXml
    {
        [XmlElement("Head")]
        public List<LevelReimbHead> Heads { get; set; }
    }

    public class LevelReimbHead
    {
        public string HeadName { get; set; }
        public decimal Amount { get; set; }
    }
}
