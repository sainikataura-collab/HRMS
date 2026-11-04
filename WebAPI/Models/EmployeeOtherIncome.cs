namespace HRMSWebAPI.Models
{
    public class EmployeeOtherIncome
    {
        
        public string? pk_incomeid { get; set; }

        public string? fk_empid { get; set; }

        public string? empname { get; set; }

        public string? empcode {  get; set;}

        public string ? date1 { get; set; }
        
        public string ? date2 { get; set; } 

        public string dated { get; set; }

        public string? fk_finid { get; set; }

        public long houseproperty { get; set; }

        public long  interest { get; set; }

        public long  anyotherincome { get; set; }

        public long anyloss {  get; set; }

        public byte[]? Timestamp { get; set; }
    }
}
