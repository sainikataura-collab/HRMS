using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using System;

namespace HRMSWebAPI.Controllers.RecruitmentManagementController
{
    [Route("api/v1/webhooks")]
    [ApiController]
    public class JobBoardWebhookController : ControllerBase
    {
        private readonly IExternalCandidateRepository _externalCandidateRepository;
        private readonly IConfiguration _configuration;

        public JobBoardWebhookController(IExternalCandidateRepository externalCandidateRepository, IConfiguration configuration)
        {
            _externalCandidateRepository = externalCandidateRepository;
            _configuration = configuration;
        }

        [HttpPost("naukri/candidates")]
        public async Task<IActionResult> ReceiveNaukriCandidate([FromBody] ExternalCandidate incomingCandidate)
        {
            // 1. Validate Webhook Secret (Header-based)
            string expectedToken = _configuration["JobBoardIntegrations:Naukri:WebhookToken"];
            if (!Request.Headers.TryGetValue("Authorization", out var authHeader) || 
                authHeader != $"Bearer {expectedToken}")
            {
                return Unauthorized(new { message = "Invalid Webhook Token" });
            }

            try
            {
                // Ensure proper mapping of data based on Naukri's payload structure
                incomingCandidate.SourcePlatform = "Naukri";
                if (string.IsNullOrEmpty(incomingCandidate.ExternalId))
                {
                    incomingCandidate.ExternalId = Guid.NewGuid().ToString(); // Fallback if they don't provide one
                }
                
                incomingCandidate.ApplicationDate = DateTime.UtcNow;
                incomingCandidate.Status = "Applied";

                var success = await _externalCandidateRepository.AddExternalCandidateAsync(incomingCandidate);
                
                if (success)
                    return Ok(new { message = "Candidate processed successfully." });
                else
                    return StatusCode(500, new { message = "Failed to save candidate to database." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("indeed/candidates")]
        public async Task<IActionResult> ReceiveIndeedCandidate([FromBody] ExternalCandidate incomingCandidate)
        {
            // 1. Validate Webhook Secret (Header-based)
            string expectedToken = _configuration["JobBoardIntegrations:Indeed:WebhookToken"];
            if (!Request.Headers.TryGetValue("Authorization", out var authHeader) || 
                authHeader != $"Bearer {expectedToken}")
            {
                return Unauthorized(new { message = "Invalid Webhook Token" });
            }

            try
            {
                // Ensure proper mapping of data based on Indeed's payload structure
                incomingCandidate.SourcePlatform = "Indeed";
                if (string.IsNullOrEmpty(incomingCandidate.ExternalId))
                {
                    incomingCandidate.ExternalId = Guid.NewGuid().ToString(); // Fallback if they don't provide one
                }
                
                incomingCandidate.ApplicationDate = DateTime.UtcNow;
                incomingCandidate.Status = "Applied";

                var success = await _externalCandidateRepository.AddExternalCandidateAsync(incomingCandidate);
                
                if (success)
                    return Ok(new { message = "Candidate processed successfully." });
                else
                    return StatusCode(500, new { message = "Failed to save candidate to database." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
