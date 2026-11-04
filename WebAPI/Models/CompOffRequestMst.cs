using System.Xml;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    
    public class CompOffRequestMstDataSet
    {
        [XmlElement("SAL_ApplyCompOff_Leave_Mst")]
        public CompOffRequestMst CompOffRequestMst { get; set; } = new CompOffRequestMst();
    }
    public class CompOffRequestMst
    {
        public long? pk_applycompoffId { get; set; }
        public string? fk_empid { get; set; }
        public long? fk_leaveId { get; set; }
        public string? dated { get; set; }
        public string? compoffdate { get; set; }
        public string? fromhours { get; set; }
        public string? fromminute { get; set; }
        public string? tohours { get; set; }
        public string? tominute { get; set; }
        public string? totalhours { get; set; }
        public string? compoffdays { get; set; }
        public string? reason { get; set; }
        public string? Remarks { get; set; }
        public bool? isActive { get; set; }
        public bool? status { get; set; }
        public bool? isApproved { get; set; }
        public bool? isDisapproved { get; set; }
        public string? intime { get; set; }
        public string? outtime { get; set; }
        public string? totdays { get; set; }
        public string? email { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }

    }

    public class  CompOffRequestSelforGrid
    {
        public long? pk_applycompoffId { get; set; }
        public string? dated { get; set; }
        public string? compoffdate { get; set; }
        public string? intime { get; set; }
        public string? outtime { get; set; }
        public string? totalhours { get; set; }
        public string? compoffdays { get; set; }
        public string? reason { get; set; }
        public string? status { get; set; }
        public string? totdays { get; set; }
        public string? Remarks { get; set; }
        public string? email { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
    }
}
