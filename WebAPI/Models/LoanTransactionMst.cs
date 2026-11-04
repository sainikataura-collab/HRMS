using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]
    public class LoanTransactionMstDataSet
    {
        [XmlElement("SAL_LoanTransaction_Mst")]
        public List<LoanTransactionMst> LoanTransactionMst { get; set; }

        [XmlElement("SAL_LoanTransaction_Details")]
        public List<LoanTransactionDetails> LoanTransactionDetails { get; set; }
    }
    public class LoanTransactionMst
    {
        public string? pk_lid { get; set; }
        public string? loancode { get; set; }
        public string? loantype { get; set; }
        public string? fk_headid { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public decimal? lamount { get; set; }
        public decimal? balAmount { get; set; }
        public long? noOfInstalments { get; set; }
        public decimal? InstalmentAmount { get; set; }
        public short? leftInstalments { get; set; }
        public string? fk_allotid { get; set; }
        public string? ldated { get; set; }
        public string? orderno { get; set; }
        public string? fk_empid { get; set; }
        public string? remarks { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }
    }

    public class LoanTransactionDetails
    {
        public string? fk_lid { get; set; }
        public string? fk_headid { get; set; }
        public decimal? lamount { get; set; }
        public decimal? balAmount { get; set; }
        public long? noOfInstalments { get; set; }
        public decimal? InstalmentAmount { get; set; }
        public short? leftInstalments { get; set; }
        public string? description { get; set; }
        public string? shortdesc { get; set; }
        public string? headtype { get; set; }
        public string? deductiontype { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_updDateID { get; set; }
    }

    public class LoanTransactionMstResult
    {
        public LoanTransactionMst LoanTransactionMst { get; set; }
        public LoanTransactionDetails LoanTransactionDetails { get; set; }
    }


}
