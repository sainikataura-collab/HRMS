// ICandidateExperienceDetailsRepository.cs
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface ICandidateExperienceDetailsRepository
    {
        Task<(int totalCount, IEnumerable<CandidateExperienceDetails>)> GetAll(int pageIndex, int pageSize, string fk_recId);  // Changed from long? to string
        Task<CandidateExperienceDetails> GetById(long pk_cpjobid);

        Task<bool> InsertLifeInsuranceAsync(LifeInsuranceModel model);
        Task<LifeInsuranceModel> GetLifeInsuranceByIdAsync(string pk_recId);

        Task<bool> InsertCandidatePrevJob(CandidateExperienceDetails candidateExperienceDetails);
        Task<bool> UpdateCandidateExperienceDetailsAsync(CandidateExperienceDetails candidateExperienceDetails);
        Task<bool> DeleteCandidateExperienceAsync(long pk_cpjobid);

        //Task<bool> CompleteOnboarding(string candidateId);

        Task<(bool success, CandidateHREmailDetails details)> CompleteOnboarding(string candidateId);
        Task<CandidateBasicDetails> GetCandidateByKeyForHR(string candidateKey);

        Task<CompanyConfig> GetMandatorySettings(string fk_recId);

        Task<CandidateFinalSummary> GetCandidateFinalSummary(string pk_recId);

        //FAMILY

        Task<(int totalCount, IEnumerable<CandidateFamilyDetails>)> GetAllFamily(int pageIndex, int pageSize, string fk_recId);
        Task<CandidateFamilyDetails> GetByIdFamily(long pk_familyid);
        Task<bool> InsertCandidateFamily(CandidateFamilyDetails candidateFamilyDetails);
        Task<bool> UpdateCandidateFamilyDetailsAsync(CandidateFamilyDetails candidateFamilyDetails);
        Task<bool> DeleteCandidateFamilyAsync(long pk_familyid);


        Task<bool> InsertBankAsync(BankModel model);
        Task<BankModel> GetBankByIdAsync(string pk_recId);
        Task<bool> InsertVoterAsync(VoterModel model);
        Task<VoterModel> GetVoterByIdAsync(string pk_recId);
        Task<bool> InsertDrivingLicenceAsync(DrivingLicenceModel model);
        Task<DrivingLicenceModel> GetDrivingLicenceByIdAsync(string pk_recId);
        Task<bool> InsertVendorGSTAsync(VendorGSTModel model);
        Task<VendorGSTModel> GetVendorGSTByIdAsync(string pk_recId);
        Task<bool> InsertSignatureAsync(SignatureModel model);
        Task<SignatureModel> GetSignatureByIdAsync(string pk_recId);
        Task<bool> InsertPhotographAsync(PhotographModel model);
        Task<PhotographModel> GetPhotographByIdAsync(string pk_recId);

        Task<VendorAgreementDetailsDto> GetVendorAgreementDetails(string pk_recId);

        Task<bool> InsertEshramAsync(EshramModel model);  
        Task<EshramModel> GetEshramByIdAsync(string pk_recId);
        Task<bool> InsertAyushmanAsync(AyushmanModel model);
        Task<AyushmanModel> GetAyushmanByIdAsync(string pk_recId);
         
    }

}