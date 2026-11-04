namespace HRMSWebAPI.Models
{
    public class DeductionSlabMst
    {
        public string? pk_slabid { get; set; }
        public string PersonType { get; set; }
        public short Sno { get; set; }
        public decimal LowerLimit { get; set; }
        public decimal UpperLimit { get; set; }
        public decimal Tax_Percent { get; set; }
        public string TaxRegime { get; set; }
        public byte[]? Timestamp { get; set; }
    }
}
