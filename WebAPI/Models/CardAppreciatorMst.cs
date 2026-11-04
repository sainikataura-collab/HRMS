namespace HRMSWebAPI.Models
{
    public class CardAppreciatorMst
    {
        public long? pk_crdauthId { get; set; }
        public string? fk_companyId { get; set; }

        public string? Fk_LocID { get; set; }

        public string? Fk_UserID { get; set; }
        public string? fk_empid { get; set; }

        public string? empcode { get; set; }

        public string? empanme { get; set; }
        public bool? isABCD { get; set; }
        public string? isABCDAlias { get; set; }
        public bool? isShabash { get; set; }
        public string? isShabashAlias { get; set; }
        public bool? isWelldone { get; set; }
        public string? isWelldoneAlias { get; set; }
    }
}
