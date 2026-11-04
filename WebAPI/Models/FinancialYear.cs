using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Security.Cryptography;
using System;

namespace HRMSWebAPI.Models
{
    public class FinancialYear 
    {
       
         public string? pk_finid { get; set; }
        public DateTime? date1 { get; set; }
        public DateTime? date2 { get; set; }
        public byte[]? Timestamp { get; set; }

        public string? Fk_UserID { get; set; }
          public string? Fk_LocID { get; set; }
    }
    public class FinancialyearGetAll
    {

      public long CID  { get; set; }
      public string pk_finid { get; set; }
    public string? date2 { get; set; }
    public string? date1 { get; set; }
    public string? active { get; set; }
    public string? curfyear { get; set; }
    public string? fyear { get; set; }

    }


}
