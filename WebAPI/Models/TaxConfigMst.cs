using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]

    public class TaxConfigMstDataSet
    {
        [XmlElement("SAL_Tax_Config")]
        public List<TaxConfigMst> TaxConfigMst { get; set; }
    }
    public class TaxConfigMst
    {
        public decimal? SchargeQAmtLimit { get; set; }
        public decimal? SChargePer { get; set; }
        public decimal? CessChargePer { get; set; }
        public decimal? Max80DedLimit { get; set; }
        public short? Max_Child { get; set; }
        public decimal? CEA_QLimit { get; set; }
        public decimal? seniorcitizionage { get; set; }
        public decimal? HraExemptMetroPer { get; set; }
        public decimal? HraExemptNonMetroPer { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }
        public string? DocStatus { get; set; }
        public string? DocumentSubmissionDate { get; set; }
    }
}
