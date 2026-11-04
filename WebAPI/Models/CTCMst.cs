namespace HRMSWebAPI.Models
{
    public class CTCMst
    {
        public long? pk_headid { get; set; }
        public string? shortdesc { get; set; }
        public string? amount { get; set; }
        public string? amount_yearly { get; set; }
    } 
    public class CTCMstGross
    {
        public string? Total_Month { get; set; }
        public string? Total_Year { get; set; }
    }
}
