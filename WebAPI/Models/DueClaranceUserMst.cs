using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]

        public class ClearanceDepartmentUserModel_previous
    {
            [XmlElement("FFS_ClearanceDepartment_User_Mst")]
            public DueClaranceUserMst_previous ClearanceDepartmentUser { get; set; }

            [XmlElement("FFS_ClearanceDepartment_User_Mst_Trn")]
            public List<ClearanceDepartmentUserTrn_previous> Transactions { get; set; }
        }

        public class DueClaranceUserMst_previous
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
        }

        public class ClearanceDepartmentUserTrn_previous
    {
            public long? pk_userParameterId { get; set; }
            public long? fk_deptUserId { get; set; }
            public long? fk_depttrnid { get; set; }
            public string remarks { get; set; }
            public bool isActive { get; set; }
    }

    //// View model (for API responses)
    public class ClearanceDepartmentUserView_previous
    {
        //public long pk_deptUserId { get; set; }
        //public string fk_deptid { get; set; }
        //public string fk_companyId { get; set; }
        //public string fk_empid { get; set; }
        //public string remarks { get; set; }
        //public string isActive { get; set; }

        public long CID { get; set; }
        public short Pk_DeptUserId { get; set; }
        public string Department { get; set; }
        public string EmpCode { get; set; }
        public string EmpName { get; set; }
        public string Remarks { get; set; }
        public string IsActive { get; set; }
    }

    public class ClearanceDepartmentUserTransactionList_previous
    {
        public long pk_userParameterId { get; set; }
        public long? fk_deptUserId { get; set; }
        public long? fk_depttrnId { get; set; }
        public string? Remarks { get; set; }
        public bool IsActive { get; set; }

        // From FFS_ClearanceDepartment_Trn
        public long pk_depttrnId { get; set; }
        public long fk_clsdeptId { get; set; }
        public string? description { get; set; }
        public int orderno { get; set; }
       // public bool isActive { get; set; }
        public string? inputType { get; set; }
        public string? fk_InsUserId { get; set; }
        public string? Fk_UpdUserId { get; set; }
        public string? Fk_InsDateId { get; set; }
        public string? Fk_UpdDateId { get; set; }
    }

}





