using BitMiracle.LibTiff.Classic;
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
    public class HrPolicyController : ControllerBase
    {
        private readonly IHrPolicyRepositoy hrPolicyRepositoy;
        private readonly FileService fileService;

        private readonly AppSettings appSettings;

        public HrPolicyController(IHrPolicyRepositoy _hrPolicyRepositoy, FileService _fileService, IOptions<AppSettings> _appSettings)

        {
            hrPolicyRepositoy = _hrPolicyRepositoy;
            fileService = _fileService;
            appSettings = _appSettings.Value;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllFileDownloads()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();
                var filetype = "F";
                // Validate input
                //     if (string.IsNullOrEmpty(fk_empid) || string.IsNullOrEmpty(filetype) || string.IsNullOrEmpty(decryptedCompanyId))
                if (string.IsNullOrEmpty(fk_empid) || string.IsNullOrEmpty(decryptedCompanyId))//Anj

                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Required parameters are missing.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                //  Call repository
                   var (totalCount, result) = await hrPolicyRepositoy.GetAllFileDownloads(fk_empid, filetype, decryptedCompanyId);

                //  Check empty result
                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                //  Success response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                // Error handling
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpGet("download-file")]
        [Authorize]
        public IActionResult DownloadFile(string filename)
        {
            if (string.IsNullOrEmpty(filename))
                return BadRequest("Filename is required.");

            var folderPath = appSettings.UploadsFolderPath;
            var filePath = Path.Combine(folderPath, filename);

            Console.WriteLine($"Looking for: {filePath}"); // ✅ Debug


            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found.");

            var contentType = GetMimeType(filePath);
            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, contentType, filename);
        }

        private string GetMimeType(string filePath)
        {
            var fileExtension = Path.GetExtension(filePath).ToLower();
            return fileExtension switch
            {
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".tiff" => "image/tiff",
                ".pdf" => "application/pdf",
                _ => "application/octet-stream",
            };
        }

    }
}
