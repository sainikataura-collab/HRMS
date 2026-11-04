using ClosedXML.Excel;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AmazonDspBlockRateCardController : ControllerBase
    {
        private readonly IAmazonDspBlockRateCardRepository _repository;
        private readonly IConfiguration _configuration;


        public AmazonDspBlockRateCardController(IAmazonDspBlockRateCardRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _configuration = configuration;
        }

        [HttpPost("Insert")]
        [Authorize]
        public async Task<IActionResult> Insert([FromBody] AmazonDspBlockRateCardModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var response = await _repository.InsertAsync(model, userId, companyId);
                modelResponse.IsSuccess = response.IsSuccessfully;
                modelResponse.Message = response.IsMessage;
                modelResponse.Data = response.pk_BlockRateCardID;
                modelResponse.StatusCode = response.IsSuccessfully ? 200 : 400;
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

        [HttpPost("Update")]
        [Authorize]
        public async Task<IActionResult> Update([FromBody] AmazonDspBlockRateCardModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var response = await _repository.UpdateAsync(model, userId, companyId);
                modelResponse.IsSuccess = response.IsSuccessfully;
                modelResponse.Message = response.IsMessage;
                modelResponse.Data = response.pk_BlockRateCardID;
                modelResponse.StatusCode = response.IsSuccessfully ? 200 : 400;
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

        [HttpDelete("Delete/{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(long id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var response = await _repository.DeleteAsync(id);
                modelResponse.IsSuccess = response.IsSuccessfully;
                modelResponse.Message = response.IsMessage;
                modelResponse.StatusCode = response.IsSuccessfully ? 200 : 400;
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

        [HttpGet("GetById/{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(long id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var rateCard = await _repository.GetByIdAsync(id);
                if (rateCard != null)
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Rate card fetched successfully.";
                    modelResponse.Data = rateCard;
                    modelResponse.StatusCode = 200;
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Rate card not found.";
                    modelResponse.StatusCode = 404;
                }
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

        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await _repository.GetListAsync(pageIndex, pageSize, companyId, searchTerm,userId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Rate card list fetched successfully.";
                modelResponse.Data = new
                {
                    TotalCount = totalCount,
                    List = list
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

        // Amazon DSP Block RateCard=========================

        [HttpPost("UploadBlockRateCard")]
        [Authorize]
        public async Task<IActionResult> UploadBlockRateCard(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Please select a valid Excel file.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Only Excel files (.xlsx, .xls) are allowed.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var uploadResults = await _repository.UploadBlockRateCardExcelAsync(file, companyId, userId);
                int successCount = uploadResults?.Count(r => r.IsSuccess || r.Status == "Uploaded" || r.Status == "Success" || r.Status == "Inserted" || r.Status == "Updated") ?? 0;

                modelResponse.IsSuccess = true;
                modelResponse.Message = successCount > 0
                    ? $"{successCount} block ratecard(s) processed successfully."
                    : "No valid block ratecards found to upload.";
                modelResponse.Data = uploadResults;
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

        [HttpGet("GetExcelDocumentList")]
        [Authorize]
        public async Task<IActionResult> GetExcelDocumentList([FromQuery] string searchTerm = "", [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await _repository.GetExcelUploadListAsync(companyId, searchTerm, pageIndex, pageSize);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Block ratecard uploaded excel documents list fetched successfully.";
                modelResponse.Data = new { totalCount, list };
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

        [HttpGet("DownloadExcelDocument/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadExcelDocument(long id)
        {
            try
            {
                var doc = await _repository.GetExcelUploadFileByIdAsync((int)id);
                string? filePath = doc?.savedFileName ?? doc?.FilePath ?? doc?.originalFileName;

                if (string.IsNullOrEmpty(filePath))
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File path not found for the requested ratecard." });
                }

                string fileName = Path.GetFileName(filePath);
                string configuredFolder = _configuration["AppSettings:BlockRateCardUploads"] ?? Path.Combine(Directory.GetCurrentDirectory(), "BlockRateCardUploads");
                string fullPath = Path.Combine(configuredFolder, fileName);

                if (!System.IO.File.Exists(fullPath) && Directory.Exists(configuredFolder))
                {
                    string nameNoExt = Path.GetFileNameWithoutExtension(fileName);
                    int lastUnder = nameNoExt.LastIndexOf('_');
                    string prefix = lastUnder > 0 ? nameNoExt.Substring(0, lastUnder) : nameNoExt;

                    var matching = Directory.GetFiles(configuredFolder, $"{prefix}*")
                        .OrderByDescending(f => System.IO.File.GetLastWriteTime(f))
                        .FirstOrDefault();
                    if (!string.IsNullOrEmpty(matching) && System.IO.File.Exists(matching))
                    {
                        fullPath = matching;
                    }
                }

                if (!System.IO.File.Exists(fullPath))
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File does not exist on disk." });
                }

                var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", doc?.originalFileName ?? fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }


    }
}
