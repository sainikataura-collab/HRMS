namespace HRMSWebAPI.Models
{
    public class ProfessionalTaxSlabMst
    {
        public string? pk_slabid { get; set; }
        public string? gender { get; set; }
        public string? state { get; set; }
        public short fk_stateid { get; set; }
        public short sno { get; set; }
        public decimal lowerlimit { get; set; }
        public decimal upperlimit { get; set; }
        public decimal tax_percent { get; set; }

        public byte[]? Timestamp { get; set; }

        public decimal? Jan_Amt { get; set; }
        public decimal? Feb_Amt { get; set; }
        public decimal? Mar_Amt { get; set; }

        public decimal? Apr_Amt { get; set; }
        public decimal? May_Amt { get; set; }
        public decimal? Jun_Amt { get; set; }
        public decimal? Jul_Amt { get; set; }
        public decimal? Aug_Amt { get; set; }
        public decimal? Sep_Amt { get; set; }
        public decimal? Oct_Amt { get; set; }
        public decimal? Nov_Amt { get; set; }
        public decimal? Dec_Amt { get; set; }







    }
}
