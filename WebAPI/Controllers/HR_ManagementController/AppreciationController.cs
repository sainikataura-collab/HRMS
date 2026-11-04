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
    public class AppreciationController : ControllerBase
    {
        private readonly IAppreciationRepository _appreciationRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;

        public AppreciationController(IAppreciationRepository appreciationRepository, FileService _fileService, IOptions<AppSettings> _appSettings)
        {
            _appreciationRepository = appreciationRepository;
            fileService = _fileService;
            appSettings = _appSettings.Value;
        }




        // Insert Appreciation
        [Authorize]  // Secured endpoint
        [HttpPost]
       
        public async Task<IActionResult> InsertAppreciation([FromForm] AppreciationMst appreciation)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                if (appreciation.filepath != null && appreciation.filepath.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(appreciation.filepath))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(appreciation.filepath);

                    // Save the file path in LogoPath (this will go to DB)
                    appreciation.attachment = savedFileName;
                }
                appreciation.filepath = null;


                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString();
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string
                appreciation.fk_userId = decryptedUserId;
                appreciation.fk_locId = decryptedLocationId;

                bool isInserted = await _appreciationRepository.InsertEmployeeAppreciation(appreciation);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Appreciation inserted successfully." : "Failed to insert Appreciation.";
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

        // Get Appreciations for Grid
     
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var (totalCount, result) = await _appreciationRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Appreciations retrieved successfully.";
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

        // Get Appreciation by ID
        [HttpGet("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _appreciationRepository.GetById(id);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ID";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Appreciation retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpPost("update")] // We use POST for update to support form-data
        [Authorize]
        public async Task<IActionResult> UpdateAppreciation([FromForm] AppreciationMst appreciation)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (appreciation.filepath != null && appreciation.filepath.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(appreciation.filepath))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(appreciation.filepath);

                    // Save the file path in LogoPath (this will go to DB)
                    appreciation.attachment = savedFileName;
                }
                else
                {
                    appreciation.attachment = appreciation.attachment;
                }


                appreciation.filepath = null;

                // Get decrypted values from HttpContext
                appreciation.fk_userId = HttpContext.Items["DecryptedUserId"]?.ToString();
                appreciation.fk_locId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                bool isUpdated = await _appreciationRepository.UpdateAppreciation(appreciation);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Appreciation updated successfully." : "Failed to update Appreciation.";
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



        // Delete Appreciation
        [HttpDelete("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteAppreciation([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await _appreciationRepository.DeleteAppreciation(id);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Appreciation deleted successfully." : "Failed to delete Appreciation.";
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

        [HttpGet("images/{imageName}")]
        [Authorize]
        public async Task<IActionResult> GetImageByUserIdAsync(string imageName)
        {
            var modelResponse = new ModelResponse();


            try
            {



                // Define the path to the folder where images are stored (based on decrypted user ID)
                //string imageFolderPath = Path.Combine(@"C:\Users\admin\Documents\Empower Logics\Uploads\" + encryptedUserId);
                string imageFolderPath = Path.Combine(appSettings.UploadsFolderPath);


                // Check if the image file exists
                string imagePath = Path.Combine(imageFolderPath, imageName);
                if (!System.IO.File.Exists(imagePath))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Image not found.";
                    modelResponse.StatusCode = 404; // Not Found
                    return Ok(modelResponse);
                }

                // Read the image file into a stream asynchronously
                var imageStream = new FileStream(imagePath, FileMode.Open, FileAccess.Read);
                var mimeType = GetMimeType(imagePath);

                // Return the image as a file response with MIME type based on the image extension
                return File(imageStream, mimeType);
            }
            catch (Exception ex)
            {
                // Log exception details for further analysis
                Console.WriteLine($"Error occurred: {ex.Message}");

                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An unexpected error occurred: {ex.Message}";
                modelResponse.StatusCode = 500; // Internal Server Error
                return Ok(modelResponse);
            }
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
                _ => "application/octet-stream",
            };
        }
    }
}
