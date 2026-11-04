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
    public class AccidentDetailsController : ControllerBase
    {
        private readonly IAccidentDetailsRepository accidentDetailsRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;

        public AccidentDetailsController(IAccidentDetailsRepository _accidentDetailsRepository, FileService _fileService, IOptions<AppSettings> _appSettings)

        {
            accidentDetailsRepository = _accidentDetailsRepository;
            fileService = _fileService;
            appSettings = _appSettings.Value;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10,string? fk_empid=null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

               
                var (totalCount, result) = await accidentDetailsRepository.GetEmployeeAccidentsAsync(pageIndex, pageSize, fk_empid);
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

        //get by id
        [HttpGet("{pk_accidentId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] string pk_accidentId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                AccidentDetailsMst result = await accidentDetailsRepository.GetById(pk_accidentId);
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
        //for delete
        //for delete 
        [HttpDelete("{pk_accidentId}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string pk_accidentId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await accidentDetailsRepository.Delete(pk_accidentId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail delete successfully." : "Failed to delete detail";
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
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertEmployeeAccidentAsync([FromForm] AccidentDetailsMst accidentDetailsMst)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                if (accidentDetailsMst.Ifilename != null && accidentDetailsMst.Ifilename.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(accidentDetailsMst.Ifilename))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(accidentDetailsMst.Ifilename);

                    // Save the file path in LogoPath (this will go to DB)
                    accidentDetailsMst.Filename = savedFileName;
                }

                accidentDetailsMst.Ifilename = null;





                // Call repository method, passing the list of holidays
                bool isInserted = await accidentDetailsRepository.InsertEmployeeAccidentAsync(accidentDetailsMst, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Data inserted successfully." : "Failed to insert data.";
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
        public async Task<IActionResult> UpdateEmployeeAccidentAsync([FromForm] AccidentDetailsMst accidentDetailsMst)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                if (accidentDetailsMst.Ifilename != null && accidentDetailsMst.Ifilename.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(accidentDetailsMst.Ifilename))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(accidentDetailsMst.Ifilename);

                    // Save the file path in LogoPath (this will go to DB)
                    accidentDetailsMst.Filename = savedFileName;
                }
                else
                {
                    accidentDetailsMst.Filename = accidentDetailsMst.Filename;
                }

                accidentDetailsMst.Ifilename = null;





                // Call repository method, passing the list of holidays
                bool isInserted = await accidentDetailsRepository.UpdateEmployeeAccidentAsync(accidentDetailsMst.pk_accidentId, accidentDetailsMst, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Data updated successfully." : "Failed to update data.";
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
