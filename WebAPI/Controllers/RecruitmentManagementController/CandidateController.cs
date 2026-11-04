using DocumentFormat.OpenXml.ExtendedProperties;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateMasterRepository candidateMasterRepository;
        private readonly ICandidateExperienceDetailsRepository candidateExperienceDetailsRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;

        public CandidateController(ICandidateMasterRepository _candidateMasterRepository, FileService _fileService, IOptions<AppSettings> _appSettings, ICandidateExperienceDetailsRepository _candidateExperienceDetailsRepository)

        {
            candidateExperienceDetailsRepository = _candidateExperienceDetailsRepository;
            candidateMasterRepository = _candidateMasterRepository;
            this.fileService = _fileService;
            this.appSettings = _appSettings.Value;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId


                var (totalCount, result) = await candidateMasterRepository.GetAll(pageIndex, pageSize, decryptedCompanyId, searchTerm);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);

            }
        }

        [HttpDelete("{pk_recId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await candidateMasterRepository.DeleteAsync(pk_recId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail delete successfully." : "Failed to delete detail.";
                modelResponse.StatusCode = isDeleted ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

        [HttpGet("{pk_recId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                Response result = await candidateMasterRepository.GetById(pk_recId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertCandidateAsync([FromForm] Mst1 model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                model.CandidateKey = CandidateKeyGenerator.GenerateUrlSafeKey();
                model.IsOnboardingDone = false;

                if (model.Pic != null && model.Pic.Length > 0)
                {
                    if (!fileService.IsImageFile(model.Pic))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed for Pic." });
                    }
                    var savedpicName = await fileService.SaveFileAsync(model.Pic);
                    model.picturename = savedpicName;
                    //model.picturetype = model.Pic.ContentType;
                }

                // Handle File Upload (Resume or other attachment)
                if (model.File != null && model.File.Length > 0)
                {
                    var savedFileName = await fileService.SaveFileAsync(model.File);
                    model.filename = savedFileName;
                    //model. = model.Pic.ContentType;
                }

                // Nullify form files after extracting data
                model.Pic = null;
                model.File = null;

                // Call repository
                bool isInserted = await candidateMasterRepository.InsertAsync(model, decryptedLocationId, decryptedUserId, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Candidate inserted successfully." : "Failed to insert candidate.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }




        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Update([FromForm] Mst1 model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                if (model.Pic != null && model.Pic.Length > 0)
                {
                    if (!fileService.IsImageFile(model.Pic))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png,pdf ) are allowed for Pic." });
                    }
                    var savedpicName = await fileService.SaveFileAsync(model.Pic);
                    model.picturename = savedpicName;
                    //model.picturetype = model.Pic.ContentType;
                }
                else
                {
                    model.picturename = model.picturename;
                }

                // Handle File Upload (Resume or other attachment)
                if (model.File != null && model.File.Length > 0)
                {
                    var savedFileName = await fileService.SaveFileAsync(model.File);
                    model.filename = savedFileName;
                    //model. = model.Pic.ContentType;
                }
                else
                {
                    model.filename = model.filename;
                }

                // Nullify form files after extracting data
                model.Pic = null;
                model.File = null;

                // Call repository
                bool isInserted = await candidateMasterRepository.Update(model, model.pk_recId, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Candidate updated successfully." : "Failed to update candidate.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }



        [HttpGet("by-emailormobile/{EmailOrMobile}")]
        [Authorize]
        public async Task<IActionResult> GetbyEmialorMobile([FromRoute] string EmailOrMobile)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await candidateMasterRepository.GetbyEmialorMobile(EmailOrMobile);

                // Check if result is null or has no items
                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "No History for this email or mobile.";
                    modelResponse.Data = null;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "History retrieved successfully!";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }


        [HttpPost("send-onboarding-email/{pk_recId}")]
        [Authorize]
        public async Task<IActionResult> SendOnboardingEmail([FromRoute] string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                // Get candidate details
                var candidate = await candidateMasterRepository.GetById(pk_recId);
                if (candidate == null || candidate.Mst1 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Candidate not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                // Get candidate key
                string candidateKey = candidate.Mst1.CandidateKey;

                // If candidate key is missing (e.g. for Vendors created via Vendor Master), generate and update it
                if (string.IsNullOrEmpty(candidateKey))
                {
                    candidateKey = CandidateKeyGenerator.GenerateUrlSafeKey();
                    var p = new Dapper.DynamicParameters();
                    p.Add("@pk_recId", pk_recId);
                    p.Add("@CandidateKey", candidateKey);
                    await HRMSWebAPI.Helper.DataBaseFactory.QuerySPAsync("REC_Candidate_UpdateCandidateKey", p);
                }

                // Check if onboarding is already done
                if (candidate.Mst1.IsOnboardingDone)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Onboarding is already completed for this candidate.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Validate email - use EmailID as fallback for vendors
                string emailToUse = !string.IsNullOrEmpty(candidate.Mst1.email) 
                    ? candidate.Mst1.email 
                    : candidate.Mst1.EmailID;

                if (string.IsNullOrEmpty(emailToUse))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Email is missing. Please add email in the vendor form first.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Get company config to determine first visible form
                var companyConfig = await candidateExperienceDetailsRepository.GetMandatorySettings(pk_recId);
                string firstVisibleRoute = GetFirstVisibleRoute(companyConfig);

                // Get OnboardingEmailService
                var onboardingEmailService = HttpContext.RequestServices.GetService<OnboardingEmailService>();

                //Pass first visible route
                bool emailSent = await onboardingEmailService.SendOnboardingEmailAsync(
                    pk_recId,
                    candidate.Mst1.candidate_name,
                    emailToUse,
                    candidateKey,
                    firstVisibleRoute,
                    companyConfig,
                    decryptedCompanyId
                );

                if (emailSent)
                {
                    bool statusUpdated = await candidateMasterRepository.UpdateOnboardingStatusInitiated(pk_recId);

                    if (statusUpdated)
                    {
                        modelResponse.IsSuccess = true;
                        modelResponse.Message = $"Onboarding email sent successfully to {emailToUse}";
                        modelResponse.StatusCode = 200;
                    }
                    else
                    {
                        modelResponse.IsSuccess = true;
                        modelResponse.Message = $"Email sent, but failed to update onboarding status.";
                        modelResponse.StatusCode = 200;
                    }
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to send onboarding email. Please try again.";
                    modelResponse.StatusCode = 500;
                }

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Error: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        //Helper method to determine first visible route
        //Helper method to determine first visible route
        private string GetFirstVisibleRoute(CompanyConfig config)
        {
            // Sequence: basicInfo → photograph → aadhaar → pan → voter → driving-licence → education → previous_experience → family_details → bank_account → vendor-gst → signature
            if (config.basicinfo_visible) return "basicInfo";
            if (config.photograph_visible) return "photograph";
            if (config.aadhaar_visible) return "aadhaar";
            if (config.pan_visible) return "pan";
            if (config.voter_visible) return "voter";
            if (config.driving_licence_visible) return "driving-licence";
            if (config.qualification_visible) return "education";
            if (config.experience_visible) return "previous_experience";
            if (config.family_visible) return "family_details";
            if (config.bankaccount_visible) return "bank_account";
            if (config.vendor_gst_visible) return "vendor-gst";
            if (config.eshram_visible) return "eshram";
            if (config.ayushman_visible) return "ayushman";
            if (config.signature_visible) return "signature";

            // Fallback to final submission if nothing is visible (edge case)
            return "final-submission";


        }

    }
}





