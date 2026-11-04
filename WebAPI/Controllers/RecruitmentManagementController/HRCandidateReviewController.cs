using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HRCandidateReviewController : ControllerBase
    {
        private readonly ICandidateExperienceDetailsRepository _candidateExperienceDetailsRepository;
        private readonly ICandidateRepository _candidateRepository;

        public HRCandidateReviewController(
            ICandidateExperienceDetailsRepository candidateExperienceDetailsRepository,
            ICandidateRepository candidateRepository)
        {
            _candidateExperienceDetailsRepository = candidateExperienceDetailsRepository;
            _candidateRepository = candidateRepository;
        }

        /// <summary>
        /// HR Review endpoint - Does NOT check IsOnboardingDone
        /// Allows HR to view candidate details even after submission
        /// </summary>
        [HttpGet("review")]
        public async Task<IActionResult> GetCandidateForHRReview([FromQuery] string key)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(key))
                {
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Candidate key is required",
                        statusCode = 400
                    });
                }

                //  Validate key WITHOUT IsOnboardingDone check
                var candidate = await _candidateExperienceDetailsRepository.GetCandidateByKeyForHR(key);

                if (candidate == null)
                {
                    return NotFound(new
                    {
                        isSuccess = false,
                        message = "Invalid or expired candidate key",
                        statusCode = 404
                    });
                }

                // ✅ Get complete candidate summary
                var summary = await _candidateExperienceDetailsRepository.GetCandidateFinalSummary(candidate.pk_recId);

                if (summary == null || summary.BasicInfo == null)
                {
                    return NotFound(new
                    {
                        isSuccess = false,
                        message = "Candidate details not found",
                        statusCode = 404
                    });
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate details retrieved successfully.";
                modelResponse.Data = new
                {
                    candidateId = candidate.pk_recId,
                    candidateName = candidate.CandidateName,
                    onboardingStatus = candidate.OnboardFormStatus,
                    completionDate = candidate.OnboardCompletionDate,
                    summary = summary
                };
                modelResponse.StatusCode = 200;

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
    }
}