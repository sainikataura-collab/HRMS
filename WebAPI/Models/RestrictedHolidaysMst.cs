namespace HRMSWebAPI.Models
{
    public class RestrictedHolidaysMst
    {
        public string fk_yearid {get; set;}
        public string fk_empid { get; set; }
        public string dated { get; set; }
        public string holidaytype { get; set; }
        public string Day_Name { get; set; }

        public string IsWorkingDay { get; set; }




    }
}
