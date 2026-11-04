namespace HRMSWebAPI.Models
{



    public class EventInsertRequest
    {
        public EventMst Event { get; set; }
        public List<DeptDetail> departmentDetails { get; set; }
        public List<locDetail> locationDetails { get; set; }
    }
    public class EventMst
    {
        public int? pk_eventId { get; set; }
        public string? eventName { get; set; }
        public DateTime? eventDate { get; set; }
        public string? eventVenue { get; set; }
        public bool isActive { get; set; }
        public string? isActiveAlias { get; set; }
        public string? fk_locId { get; set; }
        public string? Fk_UserID { get; set; }
        public string? locationName { get; set; }

    }

    public class DeptDetail
    {
        public string? fk_deptId { get; set; }
        public int? fk_eventId { get; set; }
    }
    public class locDetail
    {
        public string? fk_locId { get; set; }
        public int? fk_eventId { get; set; }
    }

    //EventDashboard for employee

    public class EventDashboardModel
    {
        public int UpcomingEvents { get; set; }
        public int TodayBirthdays { get; set; }
        public int UpcomingBirthdays { get; set; }
        public int TodayAnniversary { get; set; }
        public int TotalEvents { get; set; }

        public List<EmployeeBirthdayModel> TodayBirthdayList { get; set; }
        public List<EmployeeBirthdayModel> UpcomingBirthdayList { get; set; }
        public List<EventListModel> UpcomingEventList { get; set; }
    }

    public class EmployeeBirthdayModel
    {
        public string EmpCode { get; set; }
        public string pk_empid { get; set; }
        public string EmpName { get; set; }
        public string DeptName { get; set; }
        public string BirthDate { get; set; }
        public string Type { get; set; }
    }
    public class AnniversariesModel
    {
        public string EmpCode { get; set; }
        public string pk_empid { get; set; }
        public string EmpName { get; set; }
        public string DeptName { get; set; }
        public string AnniversaryDate { get; set; }
        public string AnniversaryYear { get; set; }
        public string Type { get; set; }
    }

    public class EventListModel
    {
        public int pk_eventId { get; set; }
        public string eventName { get; set; }
        public string eventDate { get; set; }
        public string eventVenue { get; set; }
        public bool isActive { get; set; }
        public string Type { get; set; }
    }

    public class RecentActivityModel
    {
        public int pk_eventId { get; set; }
        public string eventName { get; set; }
        public DateTime eventDate { get; set; }
        public string eventVenue { get; set; }
        public string ActivityStatus { get; set; }
        public string ActivityText { get; set; }
    }

}
