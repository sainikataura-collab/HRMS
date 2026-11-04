using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]
    public class QualificationDetailsController : ControllerBase
    {

        private readonly IQualificationDetailsRepository qualificationDetailsRepository;
        private readonly FileService _FileService;




        public QualificationDetailsController(IQualificationDetailsRepository _qualificationDetailsRepository, FileService fileService)

        {
            qualificationDetailsRepository = _qualificationDetailsRepository;
            _FileService = fileService;
        }


        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllExperienceDetails(int pageIndex = 0, int pageSize = 10, string fk_empid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await qualificationDetailsRepository.GetAll(pageIndex, pageSize, fk_empid);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee Qualification Details List retrieved successfully.";
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



        //[HttpPost]
        //[Authorize]
        //public async Task<IActionResult> InsertQualificationJobAsync([FromForm] QualificationDetails experiencePrevJobDataSet)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        // Handle file upload
        //        if (experiencePrevJobDataSet.UploadFile != null && experiencePrevJobDataSet.UploadFile.Length >= 0)
        //        {
        //            string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
        //            if (!Directory.Exists(uploadsFolder))
        //            {
        //                Directory.CreateDirectory(uploadsFolder);
        //            }

        //            string uniqueFileName = Guid.NewGuid().ToString() + "_" + experiencePrevJobDataSet.UploadFile.FileName;
        //            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

        //            using (var stream = new FileStream(filePath, FileMode.Create))
        //            {
        //                await experiencePrevJobDataSet.UploadFile.CopyToAsync(stream);
        //            }

        //            // Set the file path to the XML element field
        //            experiencePrevJobDataSet.documentupload = uniqueFileName;
        //        }

        //        // Insert data into the repository
        //        bool isInserted = await qualificationDetailsRepository.InsertEmpQuali(experiencePrevJobDataSet);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted ? "Employee Quaification details inserted successfully." : "Failed to Employee Quaification details.";
        //        modelResponse.StatusCode = isInserted ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return Ok(modelResponse);
        //    }
        //}


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertQualificationJobAsync([FromForm] QualificationDetails experiencePrevJobDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (experiencePrevJobDataSet.UploadFile != null && experiencePrevJobDataSet.UploadFile.Length > 0)
                {
                    // Optional: validate image type
                    if (!_FileService.IsImageFile(experiencePrevJobDataSet.UploadFile))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file using file service
                    var savedFileName = await _FileService.SaveFileAsync(experiencePrevJobDataSet.UploadFile);

                    // Save the returned filename to DB field
                    experiencePrevJobDataSet.documentupload = savedFileName;
                }

                // Save to database
                bool isInserted = await qualificationDetailsRepository.InsertEmpQuali(experiencePrevJobDataSet);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Employee Qualification details inserted successfully." : "Failed to insert Employee Qualification details.";
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


        [HttpGet("{pk_empqualid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] string pk_empqualid = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                QualificationDetails result = await qualificationDetailsRepository.GetById(pk_empqualid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid pk_pjobid";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Experience detail retrieved successfully.";
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


        [HttpDelete("{pk_empqualid}")]
        [Authorize]
        public async Task<IActionResult> DeleteEmpQualificationAsync([FromRoute] string pk_empqualid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await qualificationDetailsRepository.DeleteQualifiacationAsync(pk_empqualid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Qualification detail delete successfully." : "Failed to delete Qualification detail.";
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




        //[HttpGet("customer/images/{imageName}")]
        //[Authorize]
        //public async Task<IActionResult> GetImageByUserIdAsync(string imageName)
        //{
        //    var modelResponse = new ModelResponse();


        //    try
        //    {

        //        // Define the path to the folder where images are stored (based on decrypted user ID)
        //        //string imageFolderPath = Path.Combine(@"C:\Users\admin\Documents\Empower Logics\Uploads\" + encryptedUserId);
        //        string imageFolderPath = Path.Combine(appSettings.UploadsFolderPath);


        //        // Check if the image file exists
        //        string imagePath = Path.Combine(imageFolderPath, imageName);
        //        if (!System.IO.File.Exists(imagePath))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Image not found.";
        //            modelResponse.StatusCode = 404; // Not Found
        //            return Ok(modelResponse);
        //        }

        //        // Read the image file into a stream asynchronously
        //        var imageStream = new FileStream(imagePath, FileMode.Open, FileAccess.Read);
        //        var mimeType = GetMimeType(imagePath);

        //        // Return the image as a file response with MIME type based on the image extension
        //        return File(imageStream, mimeType);
        //    }
        //    catch (Exception ex)
        //    {
        //        // Log exception details for further analysis
        //        Console.WriteLine($"Error occurred: {ex.Message}");

        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = $"An unexpected error occurred: {ex.Message}";
        //        modelResponse.StatusCode = 500; // Internal Server Error
        //        return Ok(modelResponse);
        //    }
        //}


        //private string GetMimeType(string filePath)
        //{
        //    var fileExtension = Path.GetExtension(filePath).ToLower();
        //    return fileExtension switch
        //    {
        //        ".jpg" => "image/jpeg",
        //        ".jpeg" => "image/jpeg",
        //        ".png" => "image/png",
        //        ".gif" => "image/gif",
        //        ".bmp" => "image/bmp",
        //        ".tiff" => "image/tiff",
        //        _ => "application/octet-stream",
        //    };
        //}












        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateEmployeePrevJobAsync([FromForm] QualificationDetails experiencePrevJobDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // ✅ Store existing file name in case no new file is uploaded
                string existingFileName = experiencePrevJobDataSet.documentupload;

                if (experiencePrevJobDataSet.UploadFile != null && experiencePrevJobDataSet.UploadFile.Length > 0)
                {
                    // Optional: validate file type (if required)
                    if (!_FileService.IsImageFile(experiencePrevJobDataSet.UploadFile))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // ✅ Save new file and update path
                    string savedFileName = await _FileService.SaveFileAsync(experiencePrevJobDataSet.UploadFile);
                    experiencePrevJobDataSet.documentupload = savedFileName;
                }
                else
                {
                    // ✅ Preserve old file name if no new upload
                    experiencePrevJobDataSet.documentupload = existingFileName;
                }

                // ✅ Update in database
                bool isUpdated = await qualificationDetailsRepository.UpdateQualificationDetails(experiencePrevJobDataSet);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Employee Qualification details updated successfully." : "Failed to update Qualification details.";
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