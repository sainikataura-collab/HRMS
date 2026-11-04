namespace HRMSWebAPI.Models
{
   
    public class CityMst
    {
        public short fk_stateid { get; set; }
        public short? pk_stateid { get; set; }
        public string? pk_cityid { get; set; }
        public string cityname { get; set; }
        public string? description { get; set; }
        public char metro { get; set; }
        public bool isMetro { get; set; }
        public string? metroName { get; set; }


        public bool PTApp { get; set; }
        public bool LWFApp { get; set; }
        public string? fk_locId { get; set; }
        public string? fk_InsuserId { get; set; }
        public string? fk_companyId { get; set; }

        public string? fk_updUserId { get; set; }
      
        public bool? isCActive { get; set; }

        public byte[]? Timestamp { get; set; }
    }

    public class UpdateAttendanceModel
    {
        public string? fk_empid { get; set; }
        public string? fromDate { get; set; }
        public string? toDate { get; set; }
        public bool IsAttendancelog { get; set; }
    }



}
