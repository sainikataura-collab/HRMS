using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class BranchDataSet
    {
        [XmlElement("SAL_Branch_Mst")]
        public List<BranchMst> SAL_Branch_Mst { get; set; }
    }
    public class BranchMst
    {
        public string? fk_branchhead_empid { get; set; }

        public long? pk_branchId { get; set; }
        public string? BranchName { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? fk_cityid { get; set; }
        public int? fk_stateid { get; set; }
        public long? fk_zoneId { get; set; }
        public string? fk_companyId { get; set; }
    }
}
