namespace HRMSWebAPI.Models
{
    public class OrganizationChartMst
    {
        public string? pk_empid { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? department { get; set; }
    }


     public class Organizationdata
    {
      public List<OrganizationChartMst> Head { get; set; }
      public List<OrganizationChartMst> Manager { get; set; }
      public List<OrganizationChartMst> Team { get; set; }
    }
}
