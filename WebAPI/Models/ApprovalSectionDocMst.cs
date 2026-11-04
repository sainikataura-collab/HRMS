using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]

    public class ApprovalSectionDocMstDataSet
    {
        [XmlElement("SAL_Employee_SectionDocStatus_Approval")]
        public List<ApprovalSectionDocMst> ApprovalSectionDoc { get; set; }
    }

    public class FullSectionDocList
    {
        public List<ApprovalSectionDocMst> pendingSectionDocMsts { get; set; }
       public  List<ApprovalSectionDocMst> approvalSectionDocMsts { get; set; }
    }
    
    public class ApprovalSectionDocMst
    {
        public string? fk_insUserId { get; set; }
        public long? pk_docid { get; set; }

        public string? ecode { get; set; }
        public string? pk_empid { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? locname { get; set; }
        public string? designation { get; set; }
        public string? FinancialYear { get; set; }
        public string? location { get; set; }
        public string? department { get; set; }
        public string? leftstatus { get; set; }
        public string? fk_companyId { get; set; }
        public string? ename { get; set; }
        public string? fk_empid { get; set; }
        public string? secname { get; set; }
        public string? subsecname { get; set; }
        public string? fk_secid { get; set; }
        public string? fk_subsecid { get; set; }
        public string? docsub_status { get; set; }
        public decimal? docsub_Amt { get; set; }
        public string? billno { get; set; }
        public DateTime? billDate { get; set; }
        public DateTime? submitdate { get; set; }
        public string? fk_finid { get; set; }
        public string? filename { get; set; }
        public string? statusDes { get; set; }
        public string? SectionDes { get; set; }
        public string? SubSectionDes { get; set; }
        public string? contenttype { get; set; }
        public byte? attachment { get; set; }
        public int? status { get; set; }
        public bool? isApproved { get; set; }
        public bool? isActive { get; set; }
        public byte[]? Timestamp { get; set; }
        public decimal? UnderTaking_Amt { get; set; }
        public decimal? Submitted_Amt { get; set; }
        public decimal? Approved_Amt { get; set; }
        public long? MaxCode { get; set; }
        public bool? isView { get; set; }
        public string? remarks { get; set; }
        public string? fk_docid { get; set; }          // Primary for update & insert
        public long? approvalStatus { get; set; }       // New status (1, 2, 3...)

    }
}


public class EmployeeSectionDocFilterRequest
{
    public string? ecode { get; set; }
    public string? location { get; set; }
    public string? department { get; set; }
    public string? ename { get; set; }
    public string? leftstatus { get; set; }
    public string? fk_companyId { get; set; }
    public string? fk_empid { get; set; }
    public string? fk_finid { get; set; }
}