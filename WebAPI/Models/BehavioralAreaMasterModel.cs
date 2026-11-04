namespace HRMSWebAPI.Models
{
    public class BehavioralAreaMasterModel
    {
        public string? pk_behaveid { get; set; }
        public string Description { get; set; }         // @description varchar(255)
        public decimal Weightage { get; set; }          // @weightage numeric(8,2)
        public int OrderBy { get; set; }                // @orderby int
        public bool IsActive { get; set; }                // @active bit
        public string remark { get; set; }              // @remarks varchar(255)
    }

    public class BehavioralAreaMasterModelList
    {
        public string pk_behaveid { get; set; }
        public string description { get; set; }
        public string weightage { get; set; }
        public string orderby { get; set; }
        public string active { get; set; }
        public string remarks { get; set; }
    }
    public class BehavioralAreaMasterModelBYID
    {
        public string pk_behaveid { get; set; }
        public string description { get; set; }
        public string weightage { get; set; }
        public string orderby { get; set; }
        public bool active { get; set; }
        public string remarks { get; set; }
    }

    public class BehavioralAreaMasterUpdModel
    {
        public long pk_behaveid { get; set; }
        public string description { get; set; }
        public decimal weightage { get; set; }
        public int orderby { get; set; }
        public bool active { get; set; }
        public string remarks { get; set; }
    }


}

