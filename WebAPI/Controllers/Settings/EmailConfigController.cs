using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmailConfigController : ControllerBase
    {
        private readonly IEmailConfigRepository emailConfigRepository;

        public EmailConfigController(IEmailConfigRepository _emailConfigRepository)
        {
            this.emailConfigRepository = _emailConfigRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertEmailConfigAsync([FromBody] EmailConfigMst config)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (config == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Email config is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                bool isInserted = await emailConfigRepository.InsertEmailConfigAsync(config);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Email config inserted successfully." : "Failed to insert email config.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

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

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetEmailConfigAsync()
        {
            var modelResponse = new ModelResponse();

            try
            {
                var config = await emailConfigRepository.GetEmailConfigAsync();

                if (config == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Email config not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Email config retrieved successfully.";
                modelResponse.Data = config;
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

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateEmailConfigAsync([FromBody] EmailConfigMst config)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (config == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Email config is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                bool isUpdated = await emailConfigRepository.UpdateEmailConfigAsync(config);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Email config updated successfully." : "Failed to update email config.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

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
    }
}
