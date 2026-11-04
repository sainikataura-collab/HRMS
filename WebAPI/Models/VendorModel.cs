using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("Vendor")]
    public class VendorModelDataset
    {
        [XmlElement("VendorMaster")]
        public VendorModel Vendor { get; set; }
    }

    public class VendorModel
    {
        public string? LocationName { get; set; } = string.Empty;
        public string? pk_recId { get; set; }
        public string? Vendor_Name { get; set; }
        public string? Vendor_FatherName { get; set; }
        public string? Vendor_ContactNo { get; set; }
        public string? Vendor_Gender { get; set; }
        public string? Vendor_DOB { get; set; }
        public string? Vendor_Address { get; set; }
        public string? Vendor_State { get; set; }
        public string? Vendor_FKStateId { get; set; }
        public string? Vendor_City { get; set; }
        public string? Vendor_FKCityId { get; set; }
        public string? Vendor_BankName { get; set; }
        public string? Vendor_FKBankId { get; set; }
        public string? Vendor_AccountNo { get; set; }
        public string? Vendor_IFSCCode { get; set; }
        public string? Vendor_PanNo { get; set; }
        public string? Vendor_AaddharNo { get; set; }
        public string? Vendor_GSTNo { get; set; }
        public string? Vendor_Status { get; set; }
        public string? Vendor_Code { get; set; }
        public string? Vendor_RegistrationDate { get; set; }
        public string? Vendor_FKClientId { get; set; }
        public string? Vendor_FK_ModelId { get; set; }
        public string? Vendor_HFRID { get; set; }
        public string? Vendor_RateType { get; set; }
        public string? Vendor_Type { get; set; }
        public bool? IsVendor { get; set; } = true;
        public int? Vendor_CategoryID { get; set; }
        public decimal? Vendor_Rate { get; set; }
        public decimal? Vendor_RateDeduction { get; set; }
        public decimal? Vendor_DeliveryRate { get; set; }
        public decimal? Vendor_PickupRate { get; set; }

        // Joined Master Display Properties
        public string? ClientName { get; set; }
        public string? ClientCode { get; set; }
        public string? BankMasterName { get; set; }
        public string? BankIFSC { get; set; }
        public string? StateName { get; set; }
        public string? StateCode { get; set; }
        public string? CityName { get; set; }

        public string? Vendor_PermanentAddress { get; set; }

        public string? Vendor_PermState { get; set; }
        public string? Vendor_FKPermStateId { get; set; }
        public string? Vendor_PermCity { get; set; }
        public string? Vendor_FKPermCityId { get; set; }
        public decimal? Vendor_MFNRate { get; set; }
        public decimal? Vendor_TDSPercentage { get; set; }

        public DateTime? EffectiveFrom { get; set; }
        public DateTime? InsDate { get; set; }
        public DateTime? UpdDate { get; set; }


        // Tax Details Additions
        public bool? Vendor_IsGSTApplicable { get; set; }
        public decimal? Vendor_GSTRate { get; set; }
        public bool? Vendor_IsTDSApplicable { get; set; }
        public decimal? Vendor_TaxTDSRate { get; set; }

        public int? OnboardFormStatusId { get; set; }

        public string? AgentName { get; set; }
        public string? AgentCode { get; set; }
        public string? LegalName { get; set; }
        public string? EmergencyContactNo { get; set; }
        public string? EmailID { get; set; }
        public string? EShramCardNo { get; set; }
        public bool? AyushmanCard { get; set; }
        public string? AyushmanCardNo { get; set; }
        public string? AccountHolderName { get; set; }
        public string? PermanentPinCode { get; set; }
        public string? CurrentPinCode { get; set; }

        public string? ParentAgentCode { get; set; }
        public string? ParentAgentName { get; set; }
        public int? TotalSubVendors { get; set; }

        public string? ApprovedByName { get; set; }
        public string? ApprovedBySignature { get; set; }
        public string? ApproverRemarks { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public int? VerificationProgress { get; set; }
        public List<VendorRateCardItemModel>? RateCards { get; set; } = new List<VendorRateCardItemModel>();
    }


    public class VendorListModel
    {
        public string pk_recId { get; set; }
        public string candidate_name { get; set; }
    }

    public class VendorResponseModel
    {
        public bool IsSuccessfully { get; set; }
        public string? IsMessage { get; set; }
        public string? pk_recId { get; set; }
        public string? VendorCode { get; set; }
    }

    public class VendorUploadRowModel
    {
        public string Status { get; set; } = "Failed";
        public string Message { get; set; } = "";
        public bool IsSuccess { get; set; } = false;
        public string? Vendor_Code { get; set; } = "";
        public string Vendor_Name { get; set; } = "";
        public string Vendor_FatherName { get; set; } = "";
        public string Vendor_ContactNo { get; set; } = "";
        public string Vendor_Gender { get; set; } = "";
        public string Vendor_DOB { get; set; } = "";
        public string Vendor_Address { get; set; } = "";
        public string Vendor_State { get; set; } = "";
        public string Vendor_City { get; set; } = "";
        public string Vendor_BankName { get; set; } = "";
        public string Vendor_AccountNo { get; set; } = "";
        public string Vendor_IFSCCode { get; set; } = "";
        public string Vendor_PanNo { get; set; } = "";
        public string Vendor_AaddharNo { get; set; } = "";
        public string Vendor_GSTNo { get; set; } = "";
        public string Vendor_Status { get; set; } = "";

        public string Vendor_GstPercentage { get; set; } = "";
        public string Vendor_TdsPercentage { get; set; } = "";
        public string? AgentName { get; set; }
        public string? LegalName { get; set; }
        public string? EmergencyContactNo { get; set; }
        public string? EmailID { get; set; }
        public string? EShramCardNo { get; set; }
        public string? AyushmanCard { get; set; }
        public string? AyushmanCardNo { get; set; }
        public string? AccountHolderName { get; set; }
        public string? PermanentPinCode { get; set; }
        public string? CurrentPinCode { get; set; }

    }

    public class VendorExcelUploadFileModel
    {
        public long pk_id { get; set; }
        public int? File_Id { get; set; }
        public int? fileid { get; set; }
        public long? fk_clientId { get; set; }
        public string? clientName { get; set; }
        public string? modelId { get; set; }
        public string? modelName { get; set; }
        public string? originalFileName { get; set; }
        public string? savedFileName { get; set; }
        public string? savedFilePath { get; set; }
        public long? fileSize { get; set; }
        public string? fk_companyId { get; set; }
        public string? fk_userId { get; set; }
        public string? uploadedByName { get; set; }
        public DateTime? createdDate { get; set; }
        public bool? isActive { get; set; }
        public DateTime? fromDate { get; set; }
        public DateTime? toDate { get; set; }
        public int? totalRecords { get; set; }
        public int? successCount { get; set; }
        public int? failedCount { get; set; }
        public int TotalCount { get; set; }
    }

    public class VendorExcelUploadSaveRequest
    {
        public long? fk_clientId { get; set; }
        public string? clientName { get; set; }
        public string? modelId { get; set; }
        public string? modelName { get; set; }
        public string? fromDate { get; set; }
        public string? toDate { get; set; }
        public int totalRecords { get; set; }
        public int successCount { get; set; }
        public int failedCount { get; set; }
    }

    public class VendorRateCardItemModel
    {
        public long? pk_rateCardId { get; set; }
        public string? fk_recId { get; set; }
        public long fk_cost_centre_id { get; set; }
        public string? Vendor_FKClientId { get; set; }
        public string fk_modelId { get; set; } = string.Empty;
        public string? Vendor_FK_ModelId { get; set; }
        public string? Vendor_HFRID { get; set; } //SAME AS Vendor_FHRID
        public string? Vendor_FHRID { get; set; } //SAME AS Vendor_HFRID
        public string? Vendor_RateType { get; set; }
        public string? Vendor_Type { get; set; }
        public int? Vendor_CategoryID { get; set; }
        public decimal? Vendor_Rate { get; set; }
        public decimal? Vendor_RateDeduction { get; set; }

        public string? Large_VehicleTypeID { get; set; }
        public string? Large_VehicleTypeName { get; set; }
        public decimal? Vendor_DeliveryRate { get; set; }
        public decimal? Vendor_PickupRate { get; set; }
        public decimal? Vendor_TDSPercentage { get; set; }
        public decimal? Vendor_MFNRate { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string? ClientName { get; set; }
        public string? ModelName { get; set; }
        public string? CategoryName { get; set; }
        public string? RateTypeName { get; set; }
    }

    public class VendorRateCardAuditItemModel : VendorRateCardItemModel
    {
        public long AuditLogId { get; set; }
        public string? AuditAction { get; set; }
        public DateTime? AuditDate { get; set; }
        public DateTime? UploadTimestamp { get; set; }
    }


    [XmlRoot("AuditLogFilterRequest")]
    public class AuditLogFilterRequest
    {
        [XmlElement("DocumentName")]
        public string? DocumentName { get; set; }

        [XmlElement("DocumentCode")]
        public string? DocumentCode { get; set; }

        [XmlElement("FromDate")]
        public string? FromDate { get; set; }

        [XmlElement("ToDate")]
        public string? ToDate { get; set; }
    }

    public class AuditLogDocumentNameItem
    {
        public int Value { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class AuditLogItemModel
    {
        public long LogId { get; set; }
        public string? DocumentId { get; set; }
        public string? DocumentCode { get; set; }
        public string? DocumentName { get; set; }
        public string? FieldName { get; set; }
        public string? PreviousValue { get; set; }
        public string? CurrentValue { get; set; }
        public string? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public string? EntryByName { get; set; }
    }

    public class VendorFHRIDHistoryModel
    {
        public int TotalCount { get; set; }
        public string pk_recId { get; set; }
        public string ClientID { get; set; }
        public string ClientName { get; set; }
        public string ModelID { get; set; }
        public string ModelName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string UpdUserId { get; set; }
        public string UpdateBy { get; set; }
        public string InsUserId { get; set; }
        public string AssignBy { get; set; }
        public string FHRID { get; set; }

        public string LocationID { get; set; }
        public string LocationName { get; set; }
        public DateTime? EffectiveFrom { get; set; }

        public decimal? Normal_Rate { get; set; }
        public string Normal_RateType { get; set; }
        public string Normal_SlabExpr { get; set; }

        public decimal? Pickup_Rate { get; set; }
        public string Pickup_RateType { get; set; }
        public string Pickup_SlabExpr { get; set; }

        public decimal? MFN_Rate { get; set; }
        public string MFN_RateType { get; set; }
        public string MFN_SlabExpr { get; set; }

        public decimal? Van_Rate { get; set; }
        public string Van_RateType { get; set; }
        public string Van_SlabExpr { get; set; }

        public decimal? U2S_Rate { get; set; }
        public string U2S_RateType { get; set; }
        public string U2S_SlabExpr { get; set; }

        public decimal? Shopsy_Rate { get; set; }
        public string Shopsy_RateType { get; set; }
        public string Shopsy_SlabExpr { get; set; }

        public decimal? Prexo_Rate { get; set; }
        public string Prexo_RateType { get; set; }
        public string Prexo_SlabExpr { get; set; }

        public decimal? Grocery_Rate { get; set; }
        public string Grocery_RateType { get; set; }
        public string Grocery_SlabExpr { get; set; }

        public decimal? Rto_Rate { get; set; }
        public string Rto_RateType { get; set; }
        public string Rto_SlabExpr { get; set; }

        public decimal? Dto_Rate { get; set; }
        public string Dto_RateType { get; set; }
        public string Dto_SlabExpr { get; set; }

        public decimal? Fm_Rate { get; set; }
        public string Fm_RateType { get; set; }
        public string Fm_SlabExpr { get; set; }

        public string? Large_VehicleTypeID { get; set; }
        public string? Large_VehicleTypeName { get; set; }
    }

    //added code 31 Aug 2026 starts
    public class VendorFHRIDMappingRow
    {
        public string? VendorCode { get; set; }
        public string? VendorName { get; set; }
        public string? Client { get; set; }
        public string? Model { get; set; }
        public string? FHRID { get; set; }
        public string Status { get; set; } = "Failed";
        public string Message { get; set; } = string.Empty;
    }

    public class UploadVendorFHRIDMappingRequest
    {
        public IFormFile file { get; set; } = null!;
    }

    public class VendorFHRIDFileModel
    {
        public int File_Id { get; set; }
        public int Id { get => File_Id; set => File_Id = value; }
        public string Name { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? UploadedBy { get; set; }
        public int TotalRecords { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public string? Fk_CompanyId { get; set; }
        public string? Fk_UserId { get; set; }
    }

    public class VendorRateCardFileModel
    {
        public int File_Id { get; set; }
        public int Id { get => File_Id; set => File_Id = value; }
        public string Name { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? UploadedBy { get; set; }
        public int TotalRecords { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public string? Fk_CompanyId { get; set; }
        public string? Fk_UserId { get; set; }
    }

    [XmlRoot("VendorFHRIDMappings")]
    public class VendorFHRIDMappingXmlRequest
    {
        [XmlElement("Row")]
        public List<VendorFHRIDMappingXmlItem> Rows { get; set; } = new List<VendorFHRIDMappingXmlItem>();
    }

    public class VendorFHRIDMappingXmlItem
    {
        [XmlElement("VendorCode")]
        public string? VendorCode { get; set; }

        [XmlElement("Client")]
        public string? Client { get; set; }

        [XmlElement("Model")]
        public string? Model { get; set; }

        [XmlElement("FHRID")]
        public string? FHRID { get; set; }
    }
    //added code 31 Aug 2026 ends

    [XmlRoot("VendorUploads")]
    public class VendorXmlUploadRequest
    {
        [XmlElement("Row")]
        public List<VendorXmlUploadItem> Rows { get; set; } = new();
    }

    public class VendorXmlUploadItem
    {
        public string? Vendor_Name { get; set; }
        public string? Vendor_FatherName { get; set; }
        public string? Vendor_ContactNo { get; set; }
        public string? Vendor_Gender { get; set; }
        public string? Vendor_DOB { get; set; }
        public string? Vendor_Address { get; set; }
        public string? Vendor_State { get; set; }
        public string? Vendor_City { get; set; }
        public string? Vendor_BankName { get; set; }
        public string? Vendor_AccountNo { get; set; }
        public string? Vendor_IFSCCode { get; set; }
        public string? Vendor_PanNo { get; set; }
        public string? Vendor_AaddharNo { get; set; }
        public string? Vendor_GSTNo { get; set; }
        public string? GstPercentage { get; set; }
        public string? TdsPercentage { get; set; }
        public string? Vendor_Status { get; set; }
        public string? AgentName { get; set; }
        public string? LegalName { get; set; }
        public string? EmergencyContactNo { get; set; }
        public string? EmailID { get; set; }
        public string? EShramCardNo { get; set; }
        public string? AyushmanCard { get; set; }
        public string? AyushmanCardNo { get; set; }
        public string? AccountHolderName { get; set; }
        public string? PermanentPinCode { get; set; }
        public string? CurrentPinCode { get; set; }
    }

    public class UpdateVendorStatusRequest
    {
        public string PkRecId { get; set; }
        public int StatusId { get; set; }
        public string? ApprovedByName { get; set; }
        public string? ApproverRemarks { get; set; }
        public IFormFile? SignatureFile { get; set; }
    }
    public class VendorVerificationListModel
    {
        public string pk_recId { get; set; } = string.Empty;
        public string VendorCode { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string VerificationLink { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public string LocationName { get; set; } = string.Empty;
        
    }



    public class VendorDashboardCounts
    {
        public int TotalVendors { get; set; }
        public int NotInitiated { get; set; }
        public int Initiated { get; set; }
        public int Submitted { get; set; }
        public int Verified { get; set; }
        public int ReInitiated { get; set; }
        public int TotalAgents { get; set; }
    }

    /// <summary>
    /// Request body for POST /Vendor/ApproveTransaction
    /// </summary>
    public class ApproveTransactionRequest
    {
        /// <summary>Comma-separated TransactionIDs to approve. Ignored when ApproveAll=true.</summary>
        public string? TransactionIds { get; set; }

        /// <summary>If true, approve ALL pending vendor rows for this Client+Model+Period.</summary>
        public bool ApproveAll { get; set; } = false;

        public int ClientId { get; set; }
        public int ModelId { get; set; }

        /// <summary>TransactionRange string, e.g. "01-Jan-2026 to 15-Jan-2026"</summary>
        public string TransactionRange { get; set; } = "";

        public string? ApproverRemarks { get; set; }
    }
}

