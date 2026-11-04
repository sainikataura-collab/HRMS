using System;
using System.Collections.Generic;
using System.Xml.Serialization;

namespace HRMS.Models
{
    [XmlRoot("NewDataSet")]
    public class ClearanceDepartmentModel
    {
        [XmlElement("FFS_ClearanceDepartment_Mst")]
        public ClearanceDepartmentMst ClearanceDepartment { get; set; }

        [XmlElement("FFS_ClearanceDepartment_Trn")]
        public List<ClearanceDepartmentTrn> Transactions { get; set; }
    }

    public class ClearanceDepartmentMst
    {
        public long? pk_clsdeptId { get; set; }   // Identity column (generated in SP)
        public string? fk_deptid { get; set; }
        public string? fk_companyId { get; set; }
        public int? orderno { get; set; }
        public bool? isActive { get; set; }
        public string? remarks { get; set; }

        // Audit fields - these will be set in API before insert
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
    }

    public class ClearanceDepartmentTrn
    {
        public long? pk_deptTrnId { get; set; }   // If you want identity column reference
        public long? fk_clsdeptId { get; set; }   // FK from ClearanceDepartmentMst
        public string? description { get; set; }
        public int? orderno { get; set; }
        public bool? isActive { get; set; }
        public string? inputType { get; set; }

        // Audit fields
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
    }
}
