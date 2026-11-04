using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadFileHistoryController : ControllerBase
    {
        private readonly IUploadFileHistoryRepository _repository;

        public UploadFileHistoryController(IUploadFileHistoryRepository repository)
        {
            _repository = repository;
        }

        private (string userId, string companyId) GetUserAndCompany()
        {
            string userId = string.Empty;
            string companyId = string.Empty;

            var userItem = HttpContext.Items["DecryptedUserId"]?.ToString();
            if (!string.IsNullOrEmpty(userItem))
            {
                userId = userItem.Trim();
            }
            if (string.IsNullOrEmpty(userId))
            {
                var claim = User.Claims.FirstOrDefault(c => c.Type == "UserId" || c.Type == "uid" || c.Type == "nameid");
                if (claim != null)
                {
                    userId = claim.Value.Trim();
                }
            }

            var compItem = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            if (!string.IsNullOrEmpty(compItem))
            {
                companyId = compItem.Trim();
            }
            if (string.IsNullOrEmpty(companyId))
            {
                var claim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId" || c.Type == "company_id");
                if (claim != null)
                {
                    companyId = claim.Value.Trim();
                }
            }

            return (userId, companyId);
        }

        [HttpPost("SaveHistory")]
        public async Task<IActionResult> SaveHistory(IFormFile file, [FromForm] string fileType, [FromForm] string? userId = null, [FromForm] string? companyId = null, [FromForm] string? resultData = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "File is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var (tokenUserId, tokenCompanyId) = GetUserAndCompany();
                string effectiveUserId = !string.IsNullOrWhiteSpace(userId) ? userId.Trim() : tokenUserId;
                string effectiveCompanyId = !string.IsNullOrWhiteSpace(companyId) ? companyId.Trim() : tokenCompanyId;

                var newId = await _repository.SaveUploadHistoryAsync(file, fileType, effectiveUserId, effectiveCompanyId, resultData);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "File uploaded and recorded in history successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = new { id = newId };
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

        [HttpGet("GetHistory")]
        public async Task<IActionResult> GetHistory([FromQuery] string fileType, [FromQuery] string? userId = null, [FromQuery] string? companyId = null, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 5)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var (tokenUserId, tokenCompanyId) = GetUserAndCompany();
                string effectiveCompanyId = !string.IsNullOrWhiteSpace(companyId) ? companyId.Trim() : tokenCompanyId;
                string effectiveUserId = !string.IsNullOrWhiteSpace(userId) ? userId.Trim() : tokenUserId;

                var (totalCount, list) = await _repository.GetUploadHistoryListAsync(fileType, effectiveCompanyId, effectiveUserId, pageIndex, pageSize);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Upload history retrieved successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = new { totalCount, list };
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

        [HttpGet("Download/{id}")]
        public async Task<IActionResult> Download(long id)
        {
            try
            {
                var (_, companyId) = GetUserAndCompany();

                var result = await _repository.GetFileBytesByIdAsync(id, companyId);
                if (result == null)
                {
                    return NotFound(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Physical file or history record not found."
                    });
                }

                var (fileBytes, fileName, contentType) = result.Value;
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet("View/{id}")]
        public async Task<IActionResult> ViewFile(long id)
        {
            try
            {
                var (_, companyId) = GetUserAndCompany();

                var result = await _repository.GetFileBytesByIdAsync(id, companyId);
                if (result == null)
                {
                    return NotFound(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Physical file or history record not found."
                    });
                }

                var (fileBytes, fileName, contentType) = result.Value;
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }
    }
}
