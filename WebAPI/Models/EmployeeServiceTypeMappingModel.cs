using System;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [Serializable]
    [XmlRoot("ServiceTypeMapping")]
    public class EmployeeServiceTypeMappingModel
    {
        public long pk_servicetypeid { get; set; } = 0;
        public string ServiceType { get; set; } = string.Empty;
        public string? ServiceTypeName { get; set; } = string.Empty;
        public bool ESI { get; set; } = false;
        public bool PF { get; set; } = false;
        public bool LWF { get; set; } = false;
        public bool PT { get; set; } = false;
        public string? fk_CompanyID { get; set; } = string.Empty;
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public bool? IsActive { get; set; } = true;
        public bool? IsDeleted { get; set; } = false;
    }

    [Serializable]
    [XmlRoot("NewDataSet")]
    public class EmployeeServiceTypeMappingDataSet
    {
        [XmlElement("ServiceTypeMapping")]
        public EmployeeServiceTypeMappingModel ServiceTypeMapping { get; set; }
    }

    public class ServiceTypeMappingFilterDto
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; } = "";
    }

    public class ServiceTypeMappingSpResult
    {
        public int IsSuccess { get; set; }
        public string? Message { get; set; }
        public long pk_recId { get; set; }
    }
}
