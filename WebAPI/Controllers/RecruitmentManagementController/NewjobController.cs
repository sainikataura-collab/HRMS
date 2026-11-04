using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Text.Json;
using HRMSWebAPI.Helper;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class NewjobController : ControllerBase
    {
        private readonly INewjobRepository _newJobRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;
        private readonly IJobBoardIntegrationService _jobBoardIntegrationService;
        private readonly IExternalCandidateRepository _externalCandidateRepository;

        public NewjobController(
            INewjobRepository newJobRepository, 
            FileService _fileService, 
            IOptions<AppSettings> _appSettings, 
            IJobBoardIntegrationService jobBoardIntegrationService,
            IExternalCandidateRepository externalCandidateRepository)
        {
            _newJobRepository = newJobRepository;
            fileService = _fileService;
            appSettings = _appSettings.Value;
            _jobBoardIntegrationService = jobBoardIntegrationService;
            _externalCandidateRepository = externalCandidateRepository;
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertDocumentAsync([FromForm] NewjobMst uploadDoc, [FromForm] List<string> fk_qualiId, 
            [FromForm] List<string> fk_specializationId, [FromForm] List<string> fk_empId)
        {
            var documentUpldRoot = new NewjobMstDataSet
            {
                NewjobMst = uploadDoc,
                NewjobQualification = fk_qualiId.Select(id => new NewjobQualification { fk_JobId= uploadDoc.pk_JobId, fk_qualiId = long.Parse(id) }).ToList(),
                NewjobSpecialization = fk_specializationId.Select(id => new NewjobSpecialization { fk_JobId = uploadDoc.pk_JobId,fk_specializationId = id }).ToList(),
                NewjobInterviewPanel = fk_empId.Select(id => new NewjobInterviewPanel { fk_JobId = uploadDoc.pk_JobId,fk_empId = id }).ToList()
            };

            var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();


            if (uploadDoc.Appfilepath != null && uploadDoc.Appfilepath.Length > 0)
            {
                // Optional: Validate it's an image
                if (!fileService.IsImageFile(uploadDoc.Appfilepath))
                {
                    return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                }

                // Save the file
                var savedFileName = await fileService.SaveFileAsync(uploadDoc.Appfilepath);

                // Save the file path in LogoPath (this will go to DB)
                uploadDoc.AppFilename = savedFileName;
            }
            uploadDoc.Appfilepath = null;


            if (uploadDoc.Jobfilepath != null && uploadDoc.Jobfilepath.Length > 0)
            {
                // Optional: Validate it's an image
                if (!fileService.IsImageFile(uploadDoc.Jobfilepath))
                {
                    return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                }

                // Save the file
                var savedFileName = await fileService.SaveFileAsync(uploadDoc.Jobfilepath);

                // Save the file path in LogoPath (this will go to DB)
                uploadDoc.JobFilename = savedFileName;
            }
            uploadDoc.Jobfilepath = null;

            // You can now use documentUpldRoot with the repository
            var success = await _newJobRepository.InsertDocumentAsync(documentUpldRoot,decryptedLocationId, decryptedUserId, decryptedCompanyId
            );

            if (success)
            {
                // In a real scenario, the boolean flags for posting to Naukri/Indeed would come from the frontend request (e.g., in NewjobMst).
                // Assuming it's posted to both for this mock implementation.
                await _jobBoardIntegrationService.PostJobToExternalBoardsAsync(uploadDoc, true, true);
            }

            return Ok(new ModelResponse
            {
                IsSuccess = success,
                Message = success ? "Document Uploaded successfully." : "Document Uploaded failed.",
                StatusCode = success ? 200 : 400
            });
        }






        // Get Open Jobs for Grid
        [HttpGet]
        [Authorize]  // Secure endpoint
        public async Task<IActionResult> GetAllOpenJobs(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString();

                var (totalCount, result) = await _newJobRepository.GetAllOpenJobsAsync(pageIndex, pageSize, decryptedCompanyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No open jobs found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Open jobs retrieved successfully.";
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

        [HttpGet("external-stats")]
        [Authorize]
        public async Task<IActionResult> GetExternalStats()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await _externalCandidateRepository.GetDashboardStatsAsync();
                
                modelResponse.IsSuccess = true;
                modelResponse.Message = "External recruitment stats retrieved successfully.";
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



        //// Get Open Job by ID
        //[HttpGet("{id}")]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> GetOpenJobById([FromRoute] string id)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var result = await _newJobRepository.GetOpenNewJobByIdAsync(id);

        //        if (result == null)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Invalid Job ID.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Open job retrieved successfully.";
        //        modelResponse.Data = result;
        //        modelResponse.StatusCode = 200;
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
        [HttpGet("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetOpenJobById([FromRoute] string id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                NewjobResult result = await _newJobRepository.GetOpenNewJobByIdAsync(id);
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




        //[HttpPost("update")]
        //[Authorize]
        //public async Task<IActionResult> UpdateNewJob([FromForm] NewjobMstDataSet newjobData)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        // Get decrypted values
        //        newjobData.NewjobMst.fk_userid = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        newjobData.NewjobMst.fk_locid = HttpContext.Items["DecryptedLocationId"]?.ToString();

        //        // Handle Application Attachment
        //        if (newjobData.NewjobMst.Appfilepath != null && newjobData.NewjobMst.Appfilepath.Length > 0)
        //        {
        //            if (!fileService.IsImageFile(newjobData.NewjobMst.Appfilepath))
        //            {
        //                return BadRequest(new { message = "Invalid Application file format." });
        //            }

        //            newjobData.NewjobMst.AppFilename = newjobData.NewjobMst.Appfilepath.FileName;
        //            newjobData.NewjobMst.Appcontenttype = newjobData.NewjobMst.Appfilepath.ContentType;
        //            newjobData.NewjobMst.Appattachment = await fileService.SaveFileAsync(newjobData.NewjobMst.Appfilepath);
        //            newjobData.NewjobMst.UpdAppChange = "Y";
        //        }
        //        else
        //        {
        //            newjobData.NewjobMst.UpdAppChange = "N";
        //        }

        //        // Handle Job Description Attachment
        //        if (newjobData.NewjobMst.Jobfilepath != null && newjobData.NewjobMst.Jobfilepath.Length > 0)
        //        {
        //            if (!fileService.IsImageFile(newjobData.NewjobMst.Jobfilepath))
        //            {
        //                return BadRequest(new { message = "Invalid Job Description file format." });
        //            }

        //            newjobData.NewjobMst.JobFilename = newjobData.NewjobMst.Jobfilepath.FileName;
        //            newjobData.NewjobMst.Jobcontenttype = newjobData.NewjobMst.Jobfilepath.ContentType;
        //            newjobData.NewjobMst.Jobattachment = await fileService.SaveFileAsync(newjobData.NewjobMst.Jobfilepath);
        //            newjobData.NewjobMst.UpdJobChange = "Y";
        //        }
        //        else
        //        {
        //            newjobData.NewjobMst.UpdJobChange = "N";
        //        }

        //        // Nullify file objects before XML serialization
        //        newjobData.NewjobMst.Appfilepath = null;
        //        newjobData.NewjobMst.Jobfilepath = null;

        //        // Call Repository
        //        bool isUpdated = await _newJobRepository.UpdateNewJobAsync(newjobData);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "New Job updated successfully." : "Failed to update New Job.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

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

        [HttpPost("update")]
        [Authorize]
        public async Task<IActionResult> UpdateDocumentAsync([FromForm] NewjobMst uploadDoc, [FromForm] List<string> fk_qualiId,
                [FromForm] List<string> fk_specializationId, [FromForm] List<string> fk_empId)
        {
            var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

            // File save logic
            if (uploadDoc.Appfilepath != null && uploadDoc.Appfilepath.Length > 0)
            {
                // Optional: Validate it's an image
                if (!fileService.IsImageFile(uploadDoc.Appfilepath))
                {
                    return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                }

                // Save the file
                var savedFileName = await fileService.SaveFileAsync(uploadDoc.Appfilepath);

                // Save the file path in LogoPath (this will go to DB)
                uploadDoc.AppFilename = savedFileName;
            }
            else
            {
                uploadDoc.AppFilename = uploadDoc.AppFilename;
            }

            uploadDoc.Appfilepath = null;


            if (uploadDoc.Jobfilepath != null && uploadDoc.Jobfilepath.Length > 0)
            {
                // Optional: Validate it's an image
                if (!fileService.IsImageFile(uploadDoc.Jobfilepath))
                {
                    return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                }

                // Save the file
                var savedFileName = await fileService.SaveFileAsync(uploadDoc.Jobfilepath);

                // Save the file path in LogoPath (this will go to DB)
                uploadDoc.JobFilename = savedFileName;
            }
            else
            {
                uploadDoc.JobFilename = uploadDoc.AppFilename;
            }

            uploadDoc.Jobfilepath = null;

            // Build full model structure
            var documentUpldRoot = new NewjobMstDataSet
            {
                NewjobMst = uploadDoc,
                NewjobQualification = fk_qualiId.Select(id => new NewjobQualification { fk_JobId = uploadDoc.pk_JobId, fk_qualiId = long.Parse(id) }).ToList(),
                NewjobSpecialization = fk_specializationId.Select(id => new NewjobSpecialization { fk_JobId = uploadDoc.pk_JobId, fk_specializationId = id }).ToList(),
                NewjobInterviewPanel = fk_empId.Select(id => new NewjobInterviewPanel { fk_JobId = uploadDoc.pk_JobId, fk_empId = id }).ToList()
            };

            // Assign user and location context for update
            uploadDoc.fk_userid = decryptedUserId;
            uploadDoc.fk_locid = decryptedLocationId;

            var success = await _newJobRepository.UpdateNewJobAsync(documentUpldRoot);

            return Ok(new ModelResponse
            {
                IsSuccess = success,
                Message = success ? "Job updated successfully." : "Failed to update job.",
                StatusCode = success ? 200 : 400
            });
        }

        [HttpGet("external-candidates")]
        [HttpGet("{id}/external-candidates")]
        [Authorize]
        public async Task<IActionResult> GetExternalCandidates(string id = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var candidates = await _jobBoardIntegrationService.FetchCandidatesFromJobBoardsAsync(id);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "External candidates fetched successfully.";
                modelResponse.Data = candidates;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Error fetching external candidates: {ex.Message}";
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        // Delete Open Job
        [HttpDelete("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteOpenJob([FromRoute] string id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await _newJobRepository.DeleteOpenNewJobAsync(id);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Open job deleted successfully." : "Failed to delete open job.";
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
