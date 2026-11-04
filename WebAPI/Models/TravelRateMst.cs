using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class TravelRateMstXmlModel
    {
        [XmlElement("LTRN_Rate_Mst")]
        public List<TravelRateMst> TravelRateMst { get; set; }
    }

    public class TravelRateMst
    {
        [XmlElement("pk_RateID")]
        public long pk_RateID { get; set; }
        [XmlElement("fk_travelmodeId")]
        public long fk_travelmodeId { get; set; }

        [XmlElement("rate")]
        public string? rate { get; set; }

      

        [XmlElement("effectivedate")]
        public string effectivedate { get; set; }

        [XmlElement("remarks")]
        public string? remarks { get; set; }

        [XmlElement("isActive")]
        public bool? isActive { get; set; }

    }

    public class LTRN_Rate_Mst_SelforgridModel
    {
        public string pk_RateID { get; set; }
        public string travelmode { get; set; }
        public decimal rate { get; set; }
        public string effectivedate { get; set; } // e.g., '13 Jan 2025'
        public string remarks { get; set; }
        public string isActive { get; set; } // 'Yes' or 'No'
    }

}
