namespace HRMSWebAPI.Models
{
    public class ProjectMst
    {
        public long? pk_ProjectId { get; set; }
        public string? Projectcode { get; set; }
        public string? Projectname { get; set; }
        public bool? active { get; set; }
        public string? fk_companyId { get; set; }
    }
}
