using DocumentFormat.OpenXml.EMMA;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using static HRMSWebAPI.Models.CompanyConfigMst;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CompanyConfigController : ControllerBase
    {
        private readonly ICompanyConfigRepository companyConfigRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;



        public CompanyConfigController(ICompanyConfigRepository _companyConfigRepository,FileService _fileService, IOptions<AppSettings> _appSettings

)

        {
            companyConfigRepository = _companyConfigRepository;
            this.fileService = _fileService;
            appSettings = _appSettings.Value;

        }

        /// <summary>
        /// PUBLIC endpoint (no auth) — serves company logo by filename.
        /// Used in onboarding email HTML so email clients (Gmail, Outlook) can load the logo via URL.
        /// </summary>
        [HttpGet("public/logo/{logoFileName}")]
        [AllowAnonymous]
        public IActionResult GetPublicCompanyLogo(string logoFileName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(logoFileName))
                    return NotFound();

                // Sanitize — only allow simple filenames, no path traversal
                string safeName = System.IO.Path.GetFileName(logoFileName);
                if (string.IsNullOrWhiteSpace(safeName) || safeName != logoFileName)
                    return BadRequest("Invalid filename.");

                var searchPaths = new List<string>();
                if (!string.IsNullOrWhiteSpace(appSettings.CompanyLogoFolderPath))
                    searchPaths.Add(System.IO.Path.Combine(appSettings.CompanyLogoFolderPath, safeName));
                searchPaths.Add(System.IO.Path.Combine(@"d:\HRMS\Frontend\src\assets\Image\Logo", safeName));
                searchPaths.Add(System.IO.Path.Combine(@"D:\HRBOOK SSPL 10-06-2026\HrBook\Frontend\src\assets\Image\Logo", safeName));

                string? resolvedPath = searchPaths.FirstOrDefault(p => System.IO.File.Exists(p));
                if (resolvedPath == null)
                    return NotFound();

                string ext = System.IO.Path.GetExtension(safeName).ToLowerInvariant();
                string mime = ext switch
                {
                    ".png" => "image/png",
                    ".jpg" => "image/jpeg",
                    ".jpeg" => "image/jpeg",
                    ".gif" => "image/gif",
                    _ => "image/png"
                };

                var stream = new FileStream(resolvedPath, FileMode.Open, FileAccess.Read);
                return File(stream, mime);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PublicLogo] Error: {ex.Message}");
                return StatusCode(500);
            }
        }


        //get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var (totalCount, result) = await companyConfigRepository.GetAll(pageIndex, pageSize, decryptedUserId);
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
        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertCompanyConfigAsync([FromBody] CompanyConfigXmlModel Model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                bool isInserted = await companyConfigRepository.InsertCompanyConfigAsync(Model, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "inserted successfully." : "Failed to insert .";
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

        //get by id
        [HttpGet("{pk_companyId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetSectionByIdAsync([FromRoute] string pk_companyId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (pk_companyId=="1")
                    pk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                // adjust as per actual model structure
                GetByIdResult result = await companyConfigRepository.GetSectionByIdAsync(pk_companyId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Detail retrieved successfully.";
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

        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateCompanyConfig([FromBody] CompanyConfigXmlModel Model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string


                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string
                string pk_companyId = Model.SAL_Company_Config?.pk_companyId; // adjust as per actual model structure

                bool isInserted = await companyConfigRepository.UpdateCompanyConfig(Model, decryptedUserId, decryptedLocationId, pk_companyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "updated successfully." : "Failed to update .";
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



        [HttpPost]
        [Route("UploadCompanyLogo")]
        public async Task<IActionResult> UploadCompanyLogo(
[FromForm] CompanyLogoUploadModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(model.CompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company Id is required.";
                    modelResponse.StatusCode = 400;

                    return Ok(modelResponse);
                }

                if (model.Logo != null && model.Logo.Length > 0)
                {
                    if (!fileService.IsImageFile(model.Logo))
                    {
                        return Ok(new
                        {
                            message = "Only image files (jpg, jpeg, png) are allowed."
                        });
                    }

                    //var savedLogoName =
                    //    await fileService.SaveCompanylogoFileAsync(model.Logo);
                    var savedLogoName =
                        await fileService.SaveCompanylogoFileAsync(model.Logo, model.CompanyId);


                    model.LogoName = savedLogoName;
                }

                // Form file remove after save
                model.Logo = null;

                bool result = await companyConfigRepository.UploadCompanyLogo(model);

                modelResponse.IsSuccess = result;
                modelResponse.Message = result
                    ? "Logo uploaded successfully."
                    : "Logo upload failed.";

                modelResponse.StatusCode = result
                    ? 200
                    : 400;

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



        [HttpPost]
        [Route("UploadCompanyStamp")]
        public async Task<IActionResult> UploadCompanyStamp(
   [FromForm] CompanyStampUploadModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(model.CompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company Id is required.";
                    modelResponse.StatusCode = 400;

                    return Ok(modelResponse);
                }

                if (model.Stamp != null && model.Stamp.Length > 0)
                {
                    if (!fileService.IsImageFile(model.Stamp))
                    {
                        return Ok(new
                        {
                            message = "Only image files (jpg, jpeg, png) are allowed."
                        });
                    }

                    // Save stamp file with dedicated method
                    var savedStampName = await fileService.SaveCompanyStampFileAsync(model.Stamp);

                    model.StampName = savedStampName;
                }

                model.Stamp = null;

                bool result = await companyConfigRepository.UploadCompanyStamp(model);

                modelResponse.IsSuccess = result;
                modelResponse.Message = result
                    ? "Stamp uploaded successfully."
                    : "Stamp upload failed.";

                modelResponse.StatusCode = result ? 200 : 400;

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


        [HttpGet("images/{imageName}")]
        [Authorize]
        public async Task<IActionResult> GetImageByUserIdAsync(string imageName)
        {
            var modelResponse = new ModelResponse();


            try
            {



                // Define the path to the folder where images are stored (based on decrypted user ID)
                //string imageFolderPath = Path.Combine(@"C:\Users\admin\Documents\Empower Logics\Uploads\" + encryptedUserId);
                string imageFolderPath = Path.Combine(appSettings.CompanyLogoFolderPath);


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


        [HttpGet("IsLMVendorExpense")]
        [Authorize]
        public async Task<IActionResult> GetIsLMVendorExpenseAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var pk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                IsLMVendorExpenseResult result =
                    await companyConfigRepository.GetIsLMVendorExpenseAsync(pk_companyId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Detail retrieved successfully.";
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







    }
}
