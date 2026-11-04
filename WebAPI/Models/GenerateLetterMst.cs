using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class GenerateLetterMst
    {
    }

    [XmlRoot("NewDataSet")]
    public class CandidateLetterDataset
    {
        [XmlElement("HR_Format_Mst")]
        public HR_Format_Mst Candidates { get; set; }

        [XmlElement("HR_Format_Trn")]
        public HR_Format_Trn FormatTrn { get; set; }

        [XmlElement("HR_Format_Head")]
        public List<HR_Format_Head> FormatHeads { get; set; }
    }

    public class HR_Format_Head
    {
        public long? fk_headid { get; set; }
        public decimal? annualamount { get; set; }
        public decimal? amount { get; set; }
    }

    public class HR_Format_Trn
    {
      //  public long? fk_empid { get; set; }
       // public long? fk_formatid { get; set; }
        public string? formattype { get; set; }
        public string? refno { get; set; }
        public string? dated { get; set; }
        public string? eperiod { get; set; }
        public string? fk_pdesgid { get; set; }
        public decimal? newctc { get; set; }
        public string? effectivedate { get; set; }
        public string? fk_empcooid { get; set; }
        public string? confirmdate { get; set; }
        public string? resigndate { get; set; }
        public string? relievedate { get; set; }
        public string? trandate { get; set; }
        public string? fk_tran_tolocid { get; set; }
        public string? description { get; set; }
        public decimal? IncrementAmount { get; set; }
        public decimal? PerMonthSalary { get; set; }
        public string? PLI { get; set; }
        public string? fk_Offerdesgid { get; set; }
        public string? fk_Offergrade { get; set; }
        public string? fk_Offerempid { get; set; }
        public string? offergender { get; set; }
        public string? fk_Offercostcentreid { get; set; }
        public string? comments1 { get; set; }
        public string? comments2 { get; set; }
        public string? comments3 { get; set; }
        public string? comments4 { get; set; }
        public string? fk_vendorid { get; set; }
        public string? vendorname { get; set; }
    }


  
   
    public class HR_Format_Mst
    {
       // public long? pk_formatid { get; set; }
        public string? fk_empid { get; set; }
        public string? fk_locid { get; set; }
        public string? location { get; set; }
        public string? fk_deptid { get; set; }
        public string? fk_desgid { get; set; }
        public string? designation { get; set; }
        public string? fk_cityid { get; set; }
        public string? fk_emphrid { get; set; }
        public string? fk_vendorid { get; set; }
        public string? vendorname { get; set; }
        public string? name { get; set; }
        public string? nname { get; set; }
        public string? contactno { get; set; }
        public string? pinno { get; set; }
        public string? address { get; set; }
        public string? joiningdate { get; set; } // Store as string for XML serialization
        public decimal? ctc { get; set; }
        public string? ctcinword { get; set; }
        public bool? StatusId { get; set; }//Anjali
        public string? SenderName { get; set; } //Raj

    }

}
