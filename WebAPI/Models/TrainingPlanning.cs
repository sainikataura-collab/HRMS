namespace HRMSWebAPI.Models
{

    public class TrainingPlanningInsertRequest
    {
        public TrainingPlanning Training { get; set; }
        public List<TrainingPlanning_AudienceDetail> AudienceDetails { get; set; }
    }

    public class TrainingPlanning
     {
        public long? pk_planningId { get; set; }
        public string? TrainingTitle { get; set; }
        public string? Trainer { get; set; }
        public string? TrainerName { get; set; }
        public string? Location { get; set; }
        public int? fk_TNIId { get; set; }
        public string? Mode { get; set; }
        public string? fk_InstituteId { get; set; }
        public decimal? trnCharge { get; set; }
        public long? fk_programId { get; set; }
        public long? fk_subprogramId { get; set; }

        public string? Duration { get; set; }
        public bool? approval { get; set; }
        public  DateTime? TrainingDateTime { get; set; }
        public string? TargetAudienceType { get; set; }
        public string? ProgramName { get; set; }
        public string? SubProgramName { get; set; }
        public string? EmployeeNames { get; set; }
        public int? DepartmentCount { get; set; }
        public int RoleCount { get; set; }
        public int EmpCount { get; set; }
        public string? TNIStatus { get; set; }
        public int? pk_calendarId { get; set; }
        public DateTime? calendardate { get; set; }

    }
    public class TrainingPlanning_AudienceDetail
    {
        public long? fk_planningId { get; set; }
        public string? fk_depId { get; set; }
        public string? fk_roleId { get; set; }
        public string? fk_empId { get; set; }
        
        //empname use only for get emp
        public string? EmpName { get; set; }
    }
    }


public class attendanceDetails
{
    public long? pk_planningId { get; set; }
    public string? fk_empId { get; set; }
    public string? AttendanceStatus { get; set; }
    public string? attendanceDate { get; set; }
    public string? attendanceTime { get; set; }

}


