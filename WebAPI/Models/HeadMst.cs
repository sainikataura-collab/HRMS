using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class HeadMstDataSet
    {
        [XmlElement("SAL_Head_Mst")]
        public List<HeadMst> Head { get; set; } = new List<HeadMst>(); // List for multiple entries
    }

    public class HeadMst
    {
        public string? pk_headid {  get; set; }

        [XmlElement("isPartCTC")]
        public bool? isPartCTC { get; set; }

        [XmlElement("description")]
        public string description { get; set; }

        [XmlElement("shortdesc")]
        public string shortdesc { get; set; }

        [XmlElement("importdesc")]
        public string? importdesc { get; set; }

        [XmlElement("headtype")]
        public string headtype { get; set; }

        [XmlElement("deductiontype")]
        public string? deductiontype { get; set; }

        [XmlElement("salaryorder")]
        public int? salaryorder { get; set; }

        [XmlElement("fk_headfixedid")]
        public long? fk_headfixedid { get; set; }

        [XmlElement("mapping")]
        public bool? mapping { get; set; }
   

        [XmlElement("amount")]
        public decimal? amount { get; set; }

        [XmlElement("fk_formulaid")] 
        public string? fk_formulaid { get; set; }

        [XmlElement("displayorder")]
        public int displayorder { get; set; }

        [XmlElement("orderlevel")]
        public int orderlevel { get; set; }

        [XmlElement("orderlevel_ctc")]
        public int orderlevel_ctc { get; set; }

        [XmlElement("taxable")]
        public string taxable { get; set; }

        [XmlElement("non_taxable_limit")]
        public decimal? non_taxable_limit { get; set; }

        [XmlElement("chapVItype")]
        public string? chapVItype { get; set; }

       
        [XmlElement("undersection")]
        public string? undersection { get; set; }


        [XmlElement("calcinterest")]
        public bool? calcinterest { get; set; }

        [XmlElement("interestper")]
        public decimal? interestper { get; set; }

        [XmlElement("fk_headid")]
        public long? fk_headid { get; set; }

        [XmlElement("rounding")]
        public string rounding { get; set; }

        [XmlElement("salRegShow_Flag")]
        public bool? salRegShow_Flag { get; set; }

        [XmlElement("active")]
        public bool? active { get; set; }

        [XmlElement("blocksummation")]
        public bool? blocksummation { get; set; }

        [XmlElement("pf_gross_part")]
        public bool? pf_gross_part { get; set; }

        [XmlElement("esi_groos_part")]
        public bool? esi_groos_part { get; set; }

        [XmlElement("gross_Part")]
        public bool? gross_Part { get; set; }

        [XmlElement("prsence_dep")]
        public bool prsence_dep { get; set; }

        [XmlElement("effecttype")]
        public string effecttype { get; set; }

        [XmlElement("taxablesubbill")]
        public bool taxablesubbill { get; set; }

        [XmlElement("remarks")]
        public string? remarks { get; set; }


        [XmlElement("esi_Rate_Part")]
        public bool? esi_Rate_Part { get; set; }

        [XmlElement("pf_rate_part")]
        public bool? pf_rate_part { get; set; }

        [XmlElement("isRatePart")]
        public bool? isRatePart { get; set; }

        public bool? allowImportMonthly { get; set; }

        public byte[]? Timestamp { get; set; }
    }
}
