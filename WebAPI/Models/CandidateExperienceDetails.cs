// CandidateExperienceDetails.cs
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]
    public class CandidateExperienceDetailsDataSet
    {
        [XmlElement("REC_CandidatePreviousJob_Details")]
        public CandidateExperienceDetails candidateExperienceDetails { get; set; }
    }

    public class CandidateExperienceDetails
    {
        public long? pk_cpjobid { get; set; }
        public string? fk_recId { get; set; }  // Changed from long to string
        public string compname { get; set; }
        public string? designation { get; set; }
        public string? department { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
        public decimal? ctc { get; set; }
        public string? documentupload { get; set; }
        public string? offerletter { get; set; }
        public string? profile { get; set; }
        public string? leavingreason { get; set; }
        public byte[]? Timestamp { get; set; }

        [XmlIgnore]
        public IFormFile? UploadFile { get; set; }

        [XmlIgnore]
        public IFormFile? UploadOfferLetter { get; set; }
    }

    public class CandidateKeyValidationDto
    {
        public string pk_recId { get; set; }
        public string CandidateKey { get; set; }
        public string candidate_name { get; set; }
        public bool IsOnboardingDone { get; set; }
    }

    //public class CompanyConfig
    //{
    //    // Mandatory Fields
    //    public bool pan_mandatory { get; set; }
    //    public bool aadhaar_mandatory { get; set; }
    //    public bool basicinfo_mandatory { get; set; }
    //    public bool qualification_mandatory { get; set; }
    //    public bool experience_mandatory { get; set; }
    //    public bool family_mandatory { get; set; }
    //    public bool voter_mandatory { get; set; }
    //    public bool bankaccount_mandatory { get; set; }

    //    // Verification Fields
    //    public bool pan_verification { get; set; }
    //    public bool aadhaar_verification { get; set; }
    //    public bool voter_verification { get; set; }
    //    public bool bankaccount_verification { get; set; }
    //}


    //=====
    //=================

    public class LifeInsuranceModel
    {
        public string? pk_recId { get; set; }
        public string? LifeInsurance_No { get; set; }
        public string? LifeInsurance_Photo { get; set; }
        [XmlIgnore]
        public IFormFile? LifeInsurance_PhotoFile { get; set; }
    }

    public class CompanyConfig
    {

        // Life Insurance Fields
        public bool lifeinsurance_mandatory { get; set; }
        public bool lifeinsurance_verification { get; set; }
        public bool lifeinsurance_visible { get; set; }
        // Mandatory Fields
        public bool photograph_livecapture { get; set; }
        public bool pan_mandatory { get; set; }
        public bool aadhaar_mandatory { get; set; }
        public bool basicinfo_mandatory { get; set; }
        public bool qualification_mandatory { get; set; }
        public bool experience_mandatory { get; set; }
        public bool family_mandatory { get; set; }
        public bool voter_mandatory { get; set; }
        public bool bankaccount_mandatory { get; set; }

        // Verification Fields
        public bool pan_verification { get; set; }
        public bool aadhaar_verification { get; set; }
        public bool voter_verification { get; set; }
        public bool bankaccount_verification { get; set; }

        // Visibility Fields (NEW)
        public bool pan_visible { get; set; }
        public bool aadhaar_visible { get; set; }
        public bool basicinfo_visible { get; set; }
        public bool qualification_visible { get; set; }
        public bool experience_visible { get; set; }
        public bool family_visible { get; set; }
        public bool voter_visible { get; set; }
        public bool bankaccount_visible { get; set; }

        public string? Company_LogoPath { get; set; }
        public string? compname { get; set; }


        // Mandatory Fields

        public bool driving_licence_mandatory { get; set; }
        public bool vehicle_insurance_mandatory { get; set; }
        public bool vehicle_rc_mandatory { get; set; }
        public bool vendor_gst_mandatory { get; set; }
        public bool signature_mandatory { get; set; }
        public bool photograph_mandatory { get; set; }

        // Verification Fields

        // Visibility Fields (NEW)

        public bool driving_licence_visible { get; set; }
        public bool vehicle_insurance_visible { get; set; }
        public bool vehicle_rc_visible { get; set; }
        public bool vendor_gst_visible { get; set; }
        public bool signature_visible { get; set; }
        public bool photograph_visible { get; set; }

        // E-Shram Fields
        public bool eshram_mandatory { get; set; }
        public bool eshram_verification { get; set; }
        public bool eshram_visible { get; set; }

        // Ayushman Fields
        public bool ayushman_mandatory { get; set; }
        public bool ayushman_verification { get; set; }
        public bool ayushman_visible { get; set; }

        // OCR Fields
        public bool? pan_ocr { get; set; }
        public bool? aadhaar_ocr { get; set; }
        public bool? voter_ocr { get; set; }
        public string? is_stamp { get; set; }
    }
    public class CandidateFamilyDetails
    {
        public long? pk_familyid { get; set; }
        public string? fk_recId { get; set; }  // Changed from long to string
        public string membername { get; set; }
        public string relation { get; set; }
        public string dob { get; set; }
        public string? qualification { get; set; }
        public string? occupation { get; set; }
        public byte[]? Timestamp { get; set; }
    }

    [XmlRoot("NewDataSet")]
    public class CandidateFamilyDetailsDataSet
    {
        [XmlElement("REC_CandidateFamily_Details")]
        public CandidateFamilyDetails candidateFamilyDetails { get; set; }
    }


    public class CandidateHREmailDetails
    {
        public string pk_recId { get; set; }
        public string CandidateName { get; set; }
        public string CandidateEmail { get; set; }
        public string MobileNo { get; set; }
        public string OnboardingHREmail { get; set; }
        public string CandidateKey { get; set; }
    }

    public class CandidateBasicDetails
    {
        public string pk_recId { get; set; }
        public string CandidateName { get; set; }
        public string Email { get; set; }
        public string MobileNo { get; set; }
        public string OnboardFormStatus { get; set; }
        public DateTime? OnboardCompletionDate { get; set; }
        public bool IsOnboardingDone { get; set; }
    }



    //public class BankModel
    //{
    //    public string? pk_recId { get; set; }
    //    public string BankName { get; set; }
    //    public string AccountNo { get; set; }
    //    public string IFSCCode { get; set; }
    //    public string BranchName { get; set; }
    //    public string? PassbookPhoto { get; set; }
    //    [XmlIgnore]
    //    public IFormFile PassbookPhotoFile { get; set; }
    //}

    public class BankModel
    {
        public string? pk_recId { get; set; }
        public string BankName { get; set; }
        public string? Vendor_FKBankId { get; set; }
        public string? AgentName { get; set; }
        public string AccountNo { get; set; }
        public string IFSCCode { get; set; }
        public string BranchName { get; set; }
        public string? PassbookPhoto { get; set; }
        [XmlIgnore]
        public IFormFile? PassbookPhotoFile { get; set; }
    }


    public class VoterModel
    {
        public string? pk_recId { get; set; }
        public string VoterNo { get; set; }
        public string VoterName { get; set; }
        public string VoterAddress { get; set; }
        public string VoterDOB { get; set; }
        public string? VoterFrontPhoto { get; set; }
        public string? VoterBackPhoto { get; set; }
        [XmlIgnore]
        public IFormFile? VoterFrontPhotoFile { get; set; }
        [XmlIgnore]
        public IFormFile? VoterBackPhotoFile { get; set; }
    }


    public class DrivingLicenceModel
    {
        public string? pk_recId { get; set; }
        public string? DLNo { get; set; }
        public string? DLPhoto { get; set; }
        [XmlIgnore]
        public IFormFile? DLPhotoFile { get; set; }

        public string? Vehicle_Insurance_No { get; set; }
        public string? Vehicle_Insurance_Photo { get; set; }
        [XmlIgnore]
        public IFormFile? Vehicle_Insurance_PhotoFile { get; set; }

        public string? Vehicle_RC_No { get; set; }
        public string? Vehicle_RC_Photo { get; set; }
        [XmlIgnore]
        public IFormFile? Vehicle_RC_PhotoFile { get; set; }
    }

    public class EshramModel
    {
        public string? pk_recId { get; set; }
        public string? Eshram_UAN { get; set; }
        public string? Eshram_Photo { get; set; }
        [XmlIgnore]
        public IFormFile? Eshram_PhotoFile { get; set; }
    }

    public class AyushmanModel
    {
        public string? pk_recId { get; set; }
        public string? Ayushman_PMJAY_ID { get; set; }
        public string? Ayushman_Photo { get; set; }
        [XmlIgnore]
        public IFormFile? Ayushman_PhotoFile { get; set; }
    }


    public class VendorGSTModel
    {
        public string? pk_recId { get; set; }
        public bool Vendor_IsGSTApplicable { get; set; }
        public string? Vendor_GSTNo { get; set; }
        public string? GSTPhoto { get; set; }
        [XmlIgnore]
        public IFormFile? GSTPhotoFile { get; set; }
    }

    public class SignatureModel
    {
        public string? pk_recId { get; set; }
        public string? SignaturePhoto { get; set; }
        [XmlIgnore]
        public IFormFile? SignaturePhotoFile { get; set; }
    }

    public class PhotographModel
    {
        public string? pk_recId { get; set; }
        public string? Photo { get; set; }
        [XmlIgnore]
        public IFormFile? PhotoFile { get; set; }
    }

    public class VendorAgreementDetailsDto
    {
        public string? pk_recId { get; set; }
        public string? candidate_name { get; set; }
        public string? Vendor_Name { get; set; }
        public string? Vendor_Address { get; set; }
        public bool IsVendor { get; set; }
        public string? Vendor_HFRID { get; set; }
        public string? SignaturePhoto { get; set; }
        public string? Photo { get; set; }
        public long? pk_RateCardID { get; set; }
        public string? FHRID { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public decimal? Normal_Rate { get; set; }
        public string? Normal_RateType { get; set; }
        public string? Normal_SlabExpr { get; set; }
        public decimal? Pickup_Rate { get; set; }
        public string? Pickup_RateType { get; set; }
        public string? Pickup_SlabExpr { get; set; }
        public decimal? MFN_Rate { get; set; }
        public string? MFN_RateType { get; set; }
        public string? MFN_SlabExpr { get; set; }
        public decimal? Van_Rate { get; set; }
        public decimal? Grocery_Rate { get; set; }
        public string? LocationName { get; set; }
        public List<VendorActiveRateCardDto> ActiveRateCards { get; set; } = new List<VendorActiveRateCardDto>();
        public List<VendorRateCardSlabDto> Slabs { get; set; } = new List<VendorRateCardSlabDto>();
    }

    public class VendorActiveRateCardDto
    {
        public string? pk_recId { get; set; }
        public long? ClientID { get; set; }
        public string? ClientName { get; set; }
        public long? ModelID { get; set; }
        public string? ModelName { get; set; }
        public bool? IsActive { get; set; }
        public string? FHRID { get; set; }
        public long? pk_RateCardID { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public string? LocationID { get; set; }
        public string? LocationName { get; set; }
        public decimal? Normal_Rate { get; set; }
        public string? Normal_RateType { get; set; }
        public string? Normal_SlabExpr { get; set; }
        public decimal? Pickup_Rate { get; set; }
        public string? Pickup_RateType { get; set; }
        public string? Pickup_SlabExpr { get; set; }
        public decimal? MFN_Rate { get; set; }
        public string? MFN_RateType { get; set; }
        public string? MFN_SlabExpr { get; set; }
        public decimal? Van_Rate { get; set; }
        public string? Van_RateType { get; set; }
        public string? Van_SlabExpr { get; set; }
        public decimal? U2S_Rate { get; set; }
        public string? U2S_RateType { get; set; }
        public string? U2S_SlabExpr { get; set; }
        public decimal? Shopsy_Rate { get; set; }
        public string? Shopsy_RateType { get; set; }
        public string? Shopsy_SlabExpr { get; set; }
        public decimal? Prexo_Rate { get; set; }
        public string? Prexo_RateType { get; set; }
        public string? Prexo_SlabExpr { get; set; }
        public decimal? Grocery_Rate { get; set; }
        public string? Grocery_RateType { get; set; }
        public string? Grocery_SlabExpr { get; set; }
        public string? VehicleTypeName { get; set; }
        public string? Large_VehicleTypeName { get; set; }
    }

    public class VendorRateCardSlabDto
    {
        public long pk_SlabID { get; set; }
        public long fk_RateCardID { get; set; }
        public string? RateColumn { get; set; }
        public decimal Threshold_From { get; set; }
        public decimal Threshold_To { get; set; }
        public string? ThresholdUnit { get; set; }
        public decimal SlabRate { get; set; }
        public int SortOrder { get; set; }
    }


    public class CandidateChatRequest
    {
        public string question { get; set; }
        public string candidateName { get; set; }
        public string candidateKey { get; set; }
        public string agentName { get; set; }
    }


}