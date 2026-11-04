namespace HRMSWebAPI.Models
{
    public class ExitInterviewMst
    {
        public long? pk_exitInterviewId { get; set; }
        public long? pk_seprequestId { get; set; }

        public string? fk_empid { get; set; }
        public string? fk_finid { get; set; }

        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? department { get; set; }
        public string? hodName { get; set; }
        public string? designation { get; set; }

        public DateTime? resignationDate { get; set; }
        public DateTime? expectedLastWorkingDate { get; set; }
        public string? reason { get; set; }
        public decimal? noticePeriod { get; set; }
        public bool? noticePeriodServed { get; set; }
        public string? status { get; set; }
        public bool? isExitForm { get; set; }

        public bool? r_betterCareer { get; set; }
        public bool? r_higherSalary { get; set; }
        public bool? r_relocation { get; set; }
        public bool? r_personal { get; set; }
        public bool? r_health { get; set; }
        public bool? r_education { get; set; }
        public bool? r_workEnv { get; set; }
        public bool? r_managerial { get; set; }
        public bool? r_jobDissatisfaction { get; set; }
        public bool? r_workLife { get; set; }
        public bool? r_companyPolicies { get; set; }
        public bool? r_retirement { get; set; }
        public bool? r_other { get; set; }
        public string? r_otherText { get; set; }

        public string? q1_jobRole { get; set; }
        public string? q1_comments { get; set; }
        public string? q2_manager { get; set; }
        public string? q2_comments { get; set; }
        public string? q3_workEnv { get; set; }
        public string? q3_comments { get; set; }
        public string? q4_salary { get; set; }
        public string? q4_comments { get; set; }
        public string? q5_policies { get; set; }
        public string? q5_comments { get; set; }
        public string? q6_training { get; set; }
        public string? q6_comments { get; set; }
        public string? q7_teamIssues { get; set; }
        public string? q7_comments { get; set; }
        public string? q8_liked { get; set; }
        public string? q9_improvements { get; set; }
        public string? q10_recommend { get; set; }
        public string? q10_reason { get; set; }

        public bool? active { get; set; }

        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }

        public DateTime? insDate { get; set; }
        public DateTime? updDate { get; set; }
        public int? interviewStatus { get; set; }
        public string? interviewStatusText { get; set; }
    }
}