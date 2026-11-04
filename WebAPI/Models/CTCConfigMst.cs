using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // Wrapper for XML serialization
    [XmlRoot("NewDataSet")]
    public class CTCConfigDataSet
    {
        [XmlElement("SAL_CTCConfig")]
        public List<CTCConfigMst> Config { get; set; } = new List<CTCConfigMst>();

        [XmlElement("SAL_CTCConfigComponent")]
        public List<CTCConfigComponent> Components { get; set; } = new List<CTCConfigComponent>();
    }

    public class CTCConfigMst
    {
        public long? pk_ctcConfigId { get; set; }

        [XmlElement("effectiveFrom")]
        public string? effectiveFrom { get; set; }

        [XmlElement("configName")]
        public string? configName { get; set; }

        [XmlElement("fk_locationIds")]
        public string? fk_locationIds { get; set; }  // CSV of location IDs

        [XmlElement("fk_departmentIds")]
        public string? fk_departmentIds { get; set; }  // CSV of department IDs

        [XmlElement("fk_categoryIds")]
        public string? fk_categoryIds { get; set; }  // CSV of category IDs

        [XmlElement("fk_gradeIds")]
        public string? fk_gradeIds { get; set; }  // CSV of grade IDs

        [XmlElement("ctcType")]
        public string? ctcType { get; set; }  // 'A' for Annual CTC

        [XmlElement("description")]
        public string? description { get; set; }

        public string? fk_companyId { get; set; }
        public string? createdBy { get; set; }
        public string? createdOn { get; set; }
        public string? modifiedBy { get; set; }
        public string? modifiedOn { get; set; }
        public byte[]? Timestamp { get; set; }

        // Navigation - components list (not serialized to XML for header)
        [XmlIgnore]
        public List<CTCConfigComponent>? components { get; set; }

        // For display in grid
        public string? locationNames { get; set; }
        public string? departmentNames { get; set; }
        public string? categoryNames { get; set; }
        public string? gradeNames { get; set; }
    }

    public class CTCConfigComponent
    {
        public long? pk_ctcCompId { get; set; }
        public long? fk_ctcConfigId { get; set; }

        [XmlElement("fk_headId")]
        public long? fk_headId { get; set; }

        [XmlElement("headName")]
        public string? headName { get; set; }

        [XmlElement("headType")]
        public string? headType { get; set; }  // E=Earning, R=Reimbursement, D=Deduction

        [XmlElement("componentType")]
        public string? componentType { get; set; }  // Earning/Reimbursement/Deduction

        [XmlElement("calculationType")]
        public string? calculationType { get; set; }  // PercentageOfCTC, PercentageOfHead, FixedAmount, BalanceAmount, AsPerSlab

        [XmlElement("calcHeadId")]
        public long? calcHeadId { get; set; }  // Head ID when calculationType = PercentageOfHead

        [XmlElement("calcHeadName")]
        public string? calcHeadName { get; set; }

        [XmlElement("value")]
        public decimal? value { get; set; }

        [XmlElement("percentOfCTC")]
        public decimal? percentOfCTC { get; set; }

        [XmlElement("taxTreatment")]
        public string? taxTreatment { get; set; }  // Taxable / Tax Exempted

        [XmlElement("considerForPF")]
        public bool? considerForPF { get; set; }

        [XmlElement("isActive")]
        public bool? isActive { get; set; }

        [XmlElement("sortOrder")]
        public int? sortOrder { get; set; }
    }

    // Request model for saving CTC Config with components
    public class CTCConfigSaveRequest
    {
        public CTCConfigMst? config { get; set; }
        public List<CTCConfigComponent>? components { get; set; }
    }
}
