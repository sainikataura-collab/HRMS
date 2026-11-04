using System.Security.Cryptography;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class ReimDocStatusMstDataSet 
    {
        [XmlElement("SAL_Employee_ReimDocStatus")]
        
  
          public List<ReimDocStatusMst> ReimdocStatus { get; set; } = new List<ReimDocStatusMst>(); // List for multiple entries

    }
    public class ReimDocStatusMst
    {

        [XmlElement("fk_empid")]
        public string? fk_empid { get; set; }

        [XmlElement("fk_headid")]
        public long fk_headid { get; set; }
        [XmlElement("docsub_status")]
        public string? docsub_status { get; set; }

        [XmlElement("docsub_Amt")]
        public decimal? docsub_Amt { get; set; }

        [XmlElement("billno")]
        public string billno { get; set; }

        [XmlElement("billdate")]
        public string billdate { get; set; } 

        [XmlElement("submitdate")]
        public string submitdate { get; set; } 

        [XmlElement("fk_finid")]
        public string? fk_finid { get; set; }

        [XmlElement("remarks")]
        public string? remarks { get; set; }

        public byte[]? Timestamp { get; set; }

        public long? CID { get; set; } 

       public string? pk_docid { get; set; }

       public string? reimburesetype { get; set; }



   




    }
}
