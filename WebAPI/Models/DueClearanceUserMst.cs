using System.Collections.Generic;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // =========================
    // ADMIN MODEL
    // =========================

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
        public long? pk_clsdeptId { get; set; }
        public string? fk_deptid { get; set; }
        public string? fk_companyId { get; set; }
        public string? fk_empid { get; set; }
        public int? orderno { get; set; }
        public bool? isActive { get; set; }
        public string? remarks { get; set; }

        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
    }

    public class ClearanceDepartmentTrn
    {
        public long? pk_depttrnid { get; set; }
        public long? fk_clsdeptId { get; set; }

        public string? description { get; set; }
        public int? orderno { get; set; }
        public bool? isActive { get; set; }
        public string? inputType { get; set; }

        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
    }

    // =========================
    // USER MODEL
    // =========================

    [XmlRoot("NewDataSet")]
    public class ClearanceDepartmentUserModel
    {
        [XmlElement("FFS_ClearanceDepartment_User_Mst")]
        public DueClearanceUserMst ClearanceDepartmentUser { get; set; }

        [XmlElement("FFS_ClearanceDepartment_User_Mst_Trn")]
        public List<ClearanceDepartmentUserTrn> Transactions { get; set; }
    }

    public class DueClearanceUserMst
    {
        public long? pk_deptUserId { get; set; }
        public string? fk_deptid { get; set; }
        public string? fk_companyId { get; set; }
        public string? fk_empid { get; set; }
        public string? remarks { get; set; }
        public bool? isActive { get; set; }

        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }

        // Extra fields for HOD form display
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? employeeDepartment { get; set; }
    }

    public class ClearanceDepartmentUserTrn
    {
        public long? pk_userParameterId { get; set; }
        public long? fk_deptUserId { get; set; }
        public long? fk_depttrnid { get; set; }

        public string? remarks { get; set; }
        public bool? isActive { get; set; }

        public bool? isIssued { get; set; }
        public string? assetStatus { get; set; }
        public decimal? recoveryAmount { get; set; }

        public string? assetName { get; set; }
        public string? departmentName { get; set; }
    }

    // =========================
    // VIEW MODELS
    // =========================

    public class ClearanceDepartmentUserView
    {
        public long CID { get; set; }
        public short Pk_DeptUserId { get; set; }
        public string? Department { get; set; }
        public string? EmpCode { get; set; }
        public string? EmpName { get; set; }
        public string? Remarks { get; set; }
        public string? IsActive { get; set; }
    }

    public class ClearanceDepartmentUserTransactionList
    {
        public long pk_userParameterId { get; set; }
        public long? fk_deptUserId { get; set; }
        public long? fk_depttrnid { get; set; }

        public string? Remarks { get; set; }
        public bool IsActive { get; set; }

        public long pk_depttrnId { get; set; }
        public long fk_clsdeptId { get; set; }

        public string? description { get; set; }
        public int orderno { get; set; }
        public string? inputType { get; set; }

        public string? fk_InsUserId { get; set; }
        public string? Fk_UpdUserId { get; set; }
        public string? Fk_InsDateId { get; set; }
        public string? Fk_UpdDateId { get; set; }
    }
    public class MyClearanceStatusView
    {
        public string? fk_empid { get; set; }
        public string? EmpCode { get; set; }
        public string? EmpName { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? HodName { get; set; }
        public DateTime? EDateofRelieving { get; set; }
        public string? Status { get; set; }
    }
}