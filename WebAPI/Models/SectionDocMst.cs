using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class SectionDocMstDataSet
    {
        [XmlElement("SAL_Employee_SectionDocStatus")]
        public SectionDocMst section { get; set; }
    }

    public class SectionDocMst
    {
        

        public string? pk_docid {  get; set; }

        [XmlElement("fk_empid")]
        public string? fk_empid { get; set; }

        [XmlElement("fk_secid")]
        public string? fk_secid { get; set; }

        [XmlElement("fk_subsecid")]
        public string? fk_subsecid { get; set;}

        [XmlElement("docsub_status")]
        public string? docsub_status { get; set; }

        [XmlElement("docsub_Amt")]
        public long? docsub_Amt { get; set; }

        [XmlElement("billno")]
        public string? billno { get; set; }

        [XmlElement("billdate")]
        public string? billdate { get;set; }

        [XmlElement("submitdate")]
        public string? submitdate { get;set; }

        [XmlElement("fk_finid")]
        public string? fk_finid { get; set; }

        [XmlElement("remarks")]
        public string? remarks { get; set; }

        [XmlElement("filename")]
        public string? filename { get; set; }

        [XmlIgnore]
        [IgnoreDataMember]
        [JsonIgnore]
        public IFormFile? Ifilename { get; set; }
        public string? contenttype { get; set; }
       
        public byte[]? attachment { get; set; }

       public decimal? UnderTaking_Amt { get; set; } 

        public decimal? Submitted_Amt { get; set; }

        public decimal? Approved_Amt { get;set; }

        public string? secname { get; set; }

        public string? subsecname { get; set; }

        public int? status { get; set; }
        public bool? isApproved { get; set; }
        public bool? isActive { get; set; }
       
        public byte[]? Timestamp { get; set; }

    }
}
