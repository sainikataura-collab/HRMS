namespace HRMSWebAPI.Models
{
    public class CommonLocationMst
    {

        public string? pk_locid { get; set; }
        public string? locname { get; set; }
        public int? fk_officeid { get; set; }
        public string? office { get; set; }
        public string? fk_locid { get; set; }
        public string? location { get; set; }
        public string? locationAlias { get; set; }
        public bool? loginallow { get; set; }

        public string? loginallowAlias { get; set; }

        public string? statename { get; set; } //added
        public string? cityname { get; set; }

        public string? locationCode { get; set; } 
        public string? amUsername { get; set; }
        public string? rmUsername { get; set; }
        public string? areaManagerEmail { get; set; }
        public string? regionalManagerEmail { get; set; }



        public string? code { get; set; }
        public string? address { get; set; }
        public string? fk_cityid { get; set; }

        public int? fk_stateid { get; set; } //added
        public string? email { get; set; }
        public string? phone { get; set; }
        public string? fax { get; set; }
        public string? remarks { get; set; }
       public bool? dailyAttAllow { get; set; }
        public bool? dailyAttAllowEmp { get; set; }
        public string? bonusbasedon { get; set; }
        public string? fk_ContactempId { get; set; }
        public string? fk_UserId { get; set; }
       
        public byte[]? Timestamp { get; set; }
        public string? fk_companyId { get; set; }
        public string? attendanceSource { get; set; }
        public bool? isActive { get; set; }
        public string? ERPCode { get; set; }
        public string? latitude { get; set; }
        public string? longitude { get; set; }
        public string? locationType { get; set; }
        public string? fk_areaId { get; set; }
        public string? fk_zoneId { get; set; }
        public string? machineID { get; set; }
        public string? distance { get; set; }


    }
}
