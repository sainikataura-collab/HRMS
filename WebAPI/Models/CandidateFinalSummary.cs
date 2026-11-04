using SkiaSharp;

namespace HRMSWebAPI.Models
{
    public class CandidateFinalSummary
    {
        public OnboardCandidateBasicInfo BasicInfo { get; set; }
        public OnboardCandidateAadhaarDetails AadhaarDetails { get; set; }
        public OnboardCandidatePANDetails PANDetails { get; set; }
        public List<OnboardCandidateQualificationDetails> Qualifications { get; set; }
        public List<OnboardCandidateExperienceDetails> Experience { get; set; }

        public List<OnboardCandidateFamilyDetails> Family { get; set; }

        public OnboardCandidateBankDetails BankDetails { get; set; }
        public OnboardCandidateVoterDetails VoterDetails { get; set; }

        public VendorGSTModel VendorGstDetails { get; set; }
        public VendorAgreementDetailsDto VendorAgreement { get; set; }
        public List<VendorActiveRateCardDto> VendorActiveRateCards { get; set; }
        public DrivingLicenceModel? DrivingLicenceData { get; set; }

    }

    public class OnboardCandidateBasicInfo
    {
    
        public string pk_recId { get; set; }
        public string candidate_name { get; set; }
        public string LifeInsurance_No { get; set; }
        public string LifeInsurance_Photo { get; set; }
        public string email { get; set; }
        public string mobile { get; set; }
        public string StateId { get; set; }
        public string StateName { get; set; }
        public string? CityId { get; set; }
        public string CityName { get; set; }
        public string Pincode { get; set; }
        public string Address { get; set; }
        public string Photo { get; set; }
        public int? OnboardFormStatusId { get; set; }
        public string OnboardFormStatusName { get; set; }
        public string Vendor_Code { get; set; }
        public string Vendor_Status { get; set; }
        public string OnboardFormStatus { get; set; }
        public bool? isVendor { get; set; }

        public string DLNo { get; set; }
        public string DLPhoto { get; set; }

        public string Eshram_UAN { get; set; }
        public string Eshram_Photo { get; set; }
        public string Ayushman_PMJAY_ID { get; set; }
        public string Ayushman_Photo { get; set; }

        public string ApprovedByName { get; set; }
        public string ApprovedBySignature { get; set; }
        public string ApproverRemarks { get; set; }
        public DateTime? ApprovedDate { get; set; }

    }
    public class OnboardCandidateAadhaarDetails
    {
        public string pk_recId { get; set; }
        public string AadhaarNo { get; set; }
        public string AadhaarName { get; set; }
        public DateTime? AadhaarDob { get; set; }
        public string AadhaarAddress { get; set; }
        public string AadhaarFront { get; set; }
        public string AadhaarBack { get; set; }

        public string FatherAadhaarFront { get; set; }
        public string FatherAadhaarBack { get; set; }
        public DateTime? EntryDate { get; set; }
    }

    public class OnboardCandidatePANDetails
    {
        public string pk_recId { get; set; }
        public string PANNo { get; set; }
        public string PANName { get; set; }
        public DateTime? PANDob { get; set; }
        public string PanCard { get; set; }
        public DateTime? EntryDate { get; set; }
    }

    public class OnboardCandidateQualificationDetails
    {
        public long pk_cqualid { get; set; }
        public string qualification { get; set; }
        public string subject { get; set; }
        public string institute { get; set; }
        public int? passyear { get; set; }
        public decimal? marks { get; set; }
        public string division { get; set; }
        public string documentupload { get; set; }
    }

    public class OnboardCandidateExperienceDetails
    {
        public long pk_cpjobid { get; set; }
        public string compname { get; set; }
        public string designation { get; set; }
        public string department { get; set; }
        public DateTime? fromdate { get; set; }
        public DateTime? todate { get; set; }
        public decimal? ctc { get; set; }
        public string documentupload { get; set; }
        public string profile { get; set; }
        public string leavingreason { get; set; }
    }

    public class OnboardCandidateFamilyDetails
    {
        public string? fk_recId { get; set; }
        public string? membername { get; set; }
        public string? relation { get; set; }
        public DateTime? dob { get; set; }
        public string? qualification { get; set;  }
        public string? occupation { get; set; }
       
    }

    public class OnboardCandidateBankDetails
    {
        public string pk_recId { get; set; }
        public string BankName { get; set; }
        public string AccountNo { get; set; }
        public string IFSCCode { get; set; }
        public string BranchName { get; set; }
        public string PassbookPhoto { get; set; }
        
    }

    public class OnboardCandidateVoterDetails
    {
        public string pk_recId { get; set; }
        public string VoterNo { get; set; }
        public string VoterName { get; set; }
        public string VoterAddress { get; set; }
        public string VoterDOB { get; set; }
        public string VoterFrontPhoto { get; set; }
        public string VoterBackPhoto { get; set; }
        
    }
}