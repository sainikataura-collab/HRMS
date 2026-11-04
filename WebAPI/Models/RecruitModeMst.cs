using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class RecruitModeMst
    {

        public string? pk_recmodeid { get; set; }
        public string? type { get; set; }
        public string? name { get; set; }
        public bool? isActive { get; set; }
        public string? description { get; set; }
        public byte[]? Timestamp { get; set; }
        public string? fk_companyId { get; set; }
        public string? fk_locid { get; set; }
    }




    public class AppraisalMain
    {
        public string SelectedEmployee { get; set; }
        public int? pk_appempId { get; set; }
        public long SelectedYear { get; set; }
        public decimal FinalKraScore { get; set; }
        public decimal BehavioralScore { get; set; }
        public decimal FinalWeightedScore { get; set; }
        public string? ManagerComment { get; set; }
        public string? EmployeeComment { get; set; }
        public int Status { get; set; } // 👈 Add this line
    }

    public class KRA
    {
        public string Description { get; set; }
        public string Target { get; set; }
        public decimal? Achievement { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Rating { get; set; }
    }

    public class Behavioral
    {
        public string Name { get; set; }
        public decimal Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class AppraisalDataSet
    {
        public AppraisalMain Main { get; set; }
        public List<KRA> KRAList { get; set; }
        public List<Behavioral> BehavioralList { get; set; }
    }


    //get

    public class AppraisalSummaryModel
    {
        public int yearId { get; set; }
        public string pk_empid { get; set; }
        public string EmployeeName { get; set; }
        public string AppraisalYear { get; set; }
        public decimal FinalKRAScore { get; set; }
        public decimal BehavioralScore { get; set; }
        public decimal FinalWeightedScore { get; set; }
        public DateTime Dated { get; set; }
        public int Status { get; set; } // 👈 Add this line
        public string StatusText { get; set; } // 👈 Add this line
    }



}
