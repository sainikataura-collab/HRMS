using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class LeaveEncashmentXmlModel
    {
        [XmlElement("SAL_LeaveEncashment_Details")]
        public LeaveEncashmentDetail Detail { get; set; }
    }

    [XmlRoot("NewDataSet")]
    public class calculateAmmountXmlModel
    {
        [XmlElement("SAL_LeaveEncashment_Details")]
        public calculateAmmount Ammount { get; set; }
    }
    public class LeaveEncashmentMst
    {
        public string? pk_encashid { get; set; }
        public string? fk_empid { get; set; }

        public string? empcode { get; set; }

        public string? empname { get; set; }
        public short? fk_monthid { get; set; }
        public short? fk_yearid { get; set; }
        public long? fk_leaveid { get; set; }
        public string? dated { get; set; }

        public decimal? openingball { get; set; }
        public decimal? earnedleave { get; set; }
        public decimal? takenleave { get; set; }
        public decimal? balleave { get; set; }
        public decimal? rateamount { get; set; }
        public decimal? totleaveencash { get; set; }
        public decimal? encash_amt { get; set; }
        public decimal? payable_amt { get; set; }

        public decimal? PFGross { get; set; }
        public decimal? PensionWages { get; set; }
        public decimal? PF { get; set; }
        public decimal? Ac1 { get; set; }
        public decimal? Ac10 { get; set; }
        public decimal? Ac2 { get; set; }
        public decimal? Ac21 { get; set; }
        public decimal? Ac22 { get; set; }

        public string? remarks { get; set; }

        public string? monthname { get; set; }       // from Month_Mst.descriptiion
        public string? yearname { get; set; }        // from Year_Mst.description
        public string? leavetype { get; set; }       // from SAL_LeaveType_Mst.shortdesc

    }
    public class LeaveEncashmentDetail
    {
        [XmlElement("fk_empid")]
        public string fk_empid { get; set; }

        [XmlElement("fk_monthid")]
        public int fk_monthid { get; set; }

        [XmlElement("fk_yearid")]
        public int fk_yearid { get; set; }

        [XmlElement("fk_leaveid")]
        public long fk_leaveid { get; set; }

        [XmlElement("dated")]
        public string dated { get; set; } // Use string for easier formatting like "yyyy-MM-dd"

        [XmlElement("balleave")]
        public decimal balleave { get; set; }

        [XmlElement("totleaveencash")]
        public decimal totleaveencash { get; set; }

        [XmlElement("remarks")]
        public string remarks { get; set; }


        [XmlElement("pk_encashid")]
        public string? pk_encashid { get; set; }
        public decimal amount_N { get; set; }

        public byte[]? Timestamp { get; set; }
    }

    public class calculateAmmount
    {


        [XmlElement("fk_empid")]
        public string fk_empid { get; set; }

        [XmlElement("fk_monthid")]
        public int fk_monthid { get; set; }

        [XmlElement("fk_yearid")]
        public int fk_yearid { get; set; }
       
    }

    public class ResultAmount
    {
        public decimal amount { get; set; }
    }


}


