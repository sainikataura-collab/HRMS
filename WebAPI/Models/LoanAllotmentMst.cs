using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
namespace HRMSWebAPI.Models
{

    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]
    public class LoanAllotmentMstDataSet
    {
        [XmlElement("SAL_LoanAllotment_Mst")]
        public List<LoanAllotmentMst> LoanAllotment { get; set; }
    }
    public class LoanAllotmentMst
    {
        public string? pk_allotid { get; set; }
        public string? fk_empid { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? orderno { get; set; }
        public string? dated { get; set; }
        public string? allotdated { get; set; }
        public decimal? requisitionAmt { get; set; }
        public decimal? allotAmt { get; set; }
        public string? remarks { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }

    }
}
