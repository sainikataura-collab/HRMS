using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]
    public class TaxDeductorMstDataSet
    {
        [XmlElement("SAL_TaxDeductor_Mst")]
        public List<TaxDeductorMst>TaxDeductor { get; set; }
    }
    public class TaxDeductorMst
    {
        public string? pk_dedId { get; set; }
        public string? FYear { get; set; }
        public string? fk_finid { get; set; }
        public string? name_dd { get; set; }
        public string? branch_dd { get; set; }
        public string? add1_dd { get; set; }
        public string? add2_dd { get; set; }
        public string? add3_dd { get; set; }
        public string? add4_dd { get; set; }
        public string? add5_dd { get; set; }
        public string? state_dd { get; set; }
        public string? statecode_dd { get; set; }
        public string? pin_dd { get; set; }
        public string? email_dd { get; set; }
        public string? stdcode_dd { get; set; }
        public string? phone_dd { get; set; }
        public string? changadd_dd { get; set; }
        public string? fax_dd { get; set; }
        public string? name_rp { get; set; }
        public string? desig_rp { get; set; }
        public string? fathername_rp { get; set; }
        public string? sex_rp { get; set; }
        public string? add1_rp { get; set; }
        public string? add2_rp { get; set; }
        public string? add3_rp { get; set; }
        public string? add4_rp { get; set; }
        public string? add5_rp { get; set; }
        public string? state_rp { get; set; }
        public string? statecode_rp { get; set; }
        public string? pin_rp { get; set; }
        public string? email_rp { get; set; }
        public string? stdcode_rp { get; set; }
        public string? phone_rp { get; set; }
        public string? changadd_rp { get; set; }
        public string? fax_rp { get; set; }
        public string? pan { get; set; }
        public string? tan { get; set; }
        public string? sfyear { get; set; }
        public string? efyear { get; set; }
        public string? sayear { get; set; }
        public string? eayear { get; set; }
        public string? deductorType { get; set; }
        public string? existingTdsAccess { get; set; }
        public string? retunrtype { get; set; }
        public string? approved { get; set; }
        public string? officercode { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public string? fk_companyId { get; set; }


    }
}
