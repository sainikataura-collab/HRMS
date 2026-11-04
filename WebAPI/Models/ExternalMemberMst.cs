namespace HRMSWebAPI.Models
{
    public class ExternalMemberMst
    {
        public string? pk_exMemberId { get; set; }
        public string? member_name { get; set; }
        public string? designation { get; set; }
        public string? department { get; set; }
        public string? address { get; set; }
        public string? phone { get; set; }
        public string? mobile { get; set; }
        public string? email { get; set; }
        public string? remarks { get; set; }
       
        public byte[]? Timestamp { get; set; }
        public string? fk_companyId { get; set; }

        public string? Fk_UserID { get; set; }

        public string? Fk_LocID { get; set; }

    }


}
