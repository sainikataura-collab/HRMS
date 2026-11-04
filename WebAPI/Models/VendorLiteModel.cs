using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("VendorLiteModel")]
    public class VendorLiteModel
    {
        [XmlElement("pk_recId")]
        public string? pk_recId { get; set; }

        [XmlElement("Vendor_Name")]
        public string? Vendor_Name { get; set; }

        // NOTE: Vendor_FatherName, Vendor_Gender, Vendor_DOB intentionally excluded

        [XmlElement("Vendor_ContactNo")]
        public string? Vendor_ContactNo { get; set; }

        [XmlElement("Vendor_Address")]
        public string? Vendor_Address { get; set; }

        [XmlElement("Vendor_State")]
        public string? Vendor_State { get; set; }

        [XmlElement("Vendor_FKStateId")]
        public string? Vendor_FKStateId { get; set; }

        [XmlElement("Vendor_City")]
        public string? Vendor_City { get; set; }

        [XmlElement("Vendor_FKCityId")]
        public string? Vendor_FKCityId { get; set; }

        [XmlElement("Vendor_PermanentAddress")]
        public string? Vendor_PermanentAddress { get; set; }

        [XmlElement("Vendor_PermState")]
        public string? Vendor_PermState { get; set; }

        [XmlElement("Vendor_FKPermStateId")]
        public string? Vendor_FKPermStateId { get; set; }

        [XmlElement("Vendor_PermCity")]
        public string? Vendor_PermCity { get; set; }

        [XmlElement("Vendor_FKPermCityId")]
        public string? Vendor_FKPermCityId { get; set; }

        // Bank & Identity — all optional (nullable, no validation attributes)
        [XmlElement("Vendor_FKBankId")]
        public string? Vendor_FKBankId { get; set; }

        [XmlElement("Vendor_BankName")]
        public string? Vendor_BankName { get; set; }

        [XmlElement("Vendor_AccountNo")]
        public string? Vendor_AccountNo { get; set; }

        [XmlElement("Vendor_IFSCCode")]
        public string? Vendor_IFSCCode { get; set; }

        [XmlElement("Vendor_PanNo")]
        public string? Vendor_PanNo { get; set; }

        [XmlElement("Vendor_AaddharNo")]
        public string? Vendor_AaddharNo { get; set; }

        [XmlElement("Vendor_GSTNo")]
        public string? Vendor_GSTNo { get; set; }

        // Tax Details
        [XmlElement("Vendor_IsGSTApplicable")]
        public bool? Vendor_IsGSTApplicable { get; set; }

        [XmlElement("Vendor_GSTRate")]
        public decimal? Vendor_GSTRate { get; set; }

        [XmlElement("Vendor_IsTDSApplicable")]
        public bool? Vendor_IsTDSApplicable { get; set; }

        [XmlElement("Vendor_TaxTDSRate")]
        public decimal? Vendor_TaxTDSRate { get; set; }

        [XmlElement("Vendor_Status")]
        public string? Vendor_Status { get; set; }

        [XmlElement("Vendor_RegistrationDate")]
        public string? Vendor_RegistrationDate { get; set; }

        [XmlElement("Vendor_ContractStartDate")]
        public string? Vendor_ContractStartDate { get; set; }

        [XmlElement("Vendor_ContractEndDate")]
        public string? Vendor_ContractEndDate { get; set; }

        [XmlElement("Vendor_Location")]
        public string? Vendor_Location { get; set; }

        [XmlElement("Vendor_Services")]
        public string? Vendor_Services { get; set; }

        [XmlElement("Vendor_ServiceType")]
        public string? Vendor_ServiceType { get; set; }

        [XmlElement("Vendor_ServiceTax")]
        public decimal? Vendor_ServiceTax { get; set; }

        [XmlElement("ShowDetailsOnSlalrySlip")]
        public bool? ShowDetailsOnSlalrySlip { get; set; }

        [XmlElement("EmailID")]
        public string? EmailID { get; set; }

        [XmlIgnore] public string? ServiceType { get; set; }
        [XmlIgnore] public decimal? ServiceTax { get; set; }

        [XmlIgnore] public string? StateName { get; set; }
        [XmlIgnore] public string? CityName { get; set; }
        [XmlIgnore] public string? BankMasterName { get; set; }
        [XmlIgnore] public string? Vendor_Code { get; set; }
        [XmlIgnore] public int TotalCount { get; set; }
        [XmlIgnore] public int Vendor_TDSPercentage { get; set; }
        [XmlIgnore] public string? Vendor_LogoPath { get; set; }
        [XmlIgnore] public string? Vendor_Logo { get; set; }
        [XmlIgnore] public string? LogoPath { get; set; }
        [XmlIgnore] public string? fk_companyId { get; set; }
    }

    [XmlRoot("VendorDocumentModel")]
    public class VendorDocumentModel
    {
        [XmlElement("fk_vendorId")]
        public string? fk_vendorId { get; set; }

        [XmlElement("DocTypeCodeId")]
        public int DocTypeCodeId { get; set; }

        [XmlElement("DocTypeName")]
        public string? DocTypeName { get; set; }

        [XmlElement("DocIndex")]
        public int DocIndex { get; set; }

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

        // Response-only fields (populated from SP result, not serialized to XML)
        [XmlIgnore] public long pk_docId { get; set; }
        [XmlIgnore] public string? UploadedBy { get; set; }
        [XmlIgnore] public DateTime? UploadedDate { get; set; }
        [XmlIgnore] public bool? IsActive { get; set; }
        [XmlIgnore] public string? fk_companyId { get; set; }
    }

    public class VendorLiteResponseModel
    {
        public bool IsSuccessfully { get; set; }
        public string? IsMessage { get; set; }
        public string? pk_recId { get; set; }
        public long? pk_docId { get; set; }
        public string? VendorCode { get; set; }
    }

    public class VendorLogoUploadModel
    {
        public string VendorId { get; set; } = string.Empty;
        public IFormFile? Logo { get; set; }
        public string? LogoName { get; set; }
    }
}
