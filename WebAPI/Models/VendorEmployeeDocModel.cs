using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("VendorEmployeeDocModel")]
    public class VendorEmployeeDocModel
    {
        [XmlElement("pk_docId")]
        public long pk_docId { get; set; }

        [XmlElement("fk_vendorId")]
        public string? fk_vendorId { get; set; }

        [XmlElement("fk_empId")]
        public string? fk_empId { get; set; }

        [XmlElement("DocTypeCodeId")]
        public int DocTypeCodeId { get; set; }

        [XmlElement("DocTypeName")]
        public string? DocTypeName { get; set; }

        [XmlElement("OriginalFileName")]
        public string? OriginalFileName { get; set; }

        [XmlElement("SavedFileName")]
        public string? SavedFileName { get; set; }

        [XmlElement("FilePath")]
        public string? FilePath { get; set; }

        [XmlElement("FileSize")]
        public long? FileSize { get; set; }

        [XmlElement("MimeType")]
        public string? MimeType { get; set; }

        [XmlElement("VerificationStatus")]
        public string? VerificationStatus { get; set; }

        [XmlElement("RejectionRemarks")]
        public string? RejectionRemarks { get; set; }

        [XmlElement("ApprovedBy")]
        public string? ApprovedBy { get; set; }

        [XmlElement("ApprovedDate")]
        public DateTime? ApprovedDate { get; set; }

        [XmlElement("UploadedBy")]
        public string? UploadedBy { get; set; }

        [XmlElement("UploadedDate")]
        public DateTime? UploadedDate { get; set; }

        [XmlElement("IsActive")]
        public bool? IsActive { get; set; }

        [XmlElement("fk_companyId")]
        public string? fk_companyId { get; set; }

        [XmlElement("isViewed")]
        public bool isViewed { get; set; } = false;

        // Additional view fields populated in SP queries
        [XmlIgnore] public string? ApprovedByName { get; set; }
        [XmlIgnore] public string? EmpName { get; set; }
        [XmlIgnore] public string? EmpCode { get; set; }
        [XmlIgnore] public string? Vendor_Name { get; set; }
        [XmlIgnore] public string? Vendor_Code { get; set; }
        [XmlIgnore] public string? LocationName { get; set; }
    }

    public class VendorEmpDocSummaryModel
    {
        public string? pk_empid { get; set; }
        public string? fk_empId { get; set; }
        public string? fk_vendorId { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? Vendor_Name { get; set; }
        public string? Vendor_Code { get; set; }
        public string? LocationName { get; set; }
        public int TotalDocs { get; set; }
        public int ApprovedDocs { get; set; }
        public int RejectedDocs { get; set; }
        public int PendingDocs { get; set; }
        public string? DocumentNames { get; set; }
        public string? PendingDocNames { get; set; }
        public string? ApprovedDocNames { get; set; }
        public string? RejectedDocNames { get; set; }
        public int RequiredDocs { get; set; }
        public int IsFullyUploaded { get; set; }
        public int MissingDocsCount { get; set; }
        public string? DocProgress { get; set; } // e.g. "0/4", "3/4"
        public string? Status { get; set; }      // "Pending", "Approved", "Rejected"
        public int TotalCount { get; set; }
    }

    public class VendorEmpDocApprovalRequest
    {
        public long pk_docId { get; set; }
        public string Status { get; set; } = string.Empty; // "Approved" or "Rejected"
        public string? RejectionRemarks { get; set; }
    }

    public class VendorEmpDocSaveResponse
    {
        public bool IsSuccessfully { get; set; }
        public string? IsMessage { get; set; }
        public long? pk_docId { get; set; }
    }
}
