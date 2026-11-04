using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CandidateQualificationDetailsController : ControllerBase
    {
        private readonly ICandidateQualificationRepository _candidateQualificationRepository;
        private readonly IConfiguration _configuration;

        public CandidateQualificationDetailsController(
            ICandidateQualificationRepository candidateQualificationRepository,
            IConfiguration configuration)
        {
            _candidateQualificationRepository = candidateQualificationRepository;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQualificationDetails(
    int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // ✅ Get candidate ID from middleware context (NOT candidateKey!)
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    return Unauthorized(new
                    {
                        isSuccess = false,
                        message = "Invalid candidate",
                        statusCode = 401
                    });
                }

                // ✅ Pass fk_recId to repository
                var (totalCount, result) = await _candidateQualificationRepository.GetAll(
                    pageIndex, pageSize, candidateId);

                if (!result.Any())
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "No records found.";
                    modelResponse.Data = new List<CandidateQualificationDetails>();
                    modelResponse.TotalCount = 0;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate qualification details retrieved successfully.";
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
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost]
        public async Task<IActionResult> InsertQualificationAsync(
            [FromForm] CandidateQualificationDetails qualificationDetails)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    return Unauthorized(new
                    {
                        isSuccess = false,
                        message = "Invalid candidate",
                        statusCode = 401
                    });
                }

                // Set candidate ID
                qualificationDetails.fk_recId = candidateId;

                // Handle file upload
                if (qualificationDetails.UploadFile != null && qualificationDetails.UploadFile.Length > 0)
                {
                    string candidateFolderPath = _configuration["AppSettings:CandidateFolderPath"];

                    if (!Directory.Exists(candidateFolderPath))
                    {
                        Directory.CreateDirectory(candidateFolderPath);
                    }

                    string uniqueFileName = $"{candidateId}_{Guid.NewGuid()}_{qualificationDetails.UploadFile.FileName}";
                    string filePath = Path.Combine(candidateFolderPath, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await qualificationDetails.UploadFile.CopyToAsync(stream);
                    }

                    qualificationDetails.documentupload = uniqueFileName;
                }

                bool isInserted = await _candidateQualificationRepository.InsertCandidateQualification(qualificationDetails);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted
                    ? "Qualification details added successfully."
                    : "Failed to add qualification details.";
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

        [HttpGet("{pk_cqualid}")]
        public async Task<IActionResult> GetById([FromRoute] long pk_cqualid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                CandidateQualificationDetails result = await _candidateQualificationRepository.GetById(pk_cqualid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid pk_cqualid";
                    modelResponse.StatusCode = 404;
                    return NotFound(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Qualification detail retrieved successfully.";
                modelResponse.Data = result;
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

        //[HttpPut]
        //public async Task<IActionResult> UpdateQualificationAsync(
        //    [FromForm] CandidateQualificationDetails qualificationDetails)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var candidateId = HttpContext.Items["CandidateId"]?.ToString();

        //        if (string.IsNullOrEmpty(candidateId))
        //        {
        //            return Unauthorized(new
        //            {
        //                isSuccess = false,
        //                message = "Invalid candidate",
        //                statusCode = 401
        //            });
        //        }

        //        // Set candidate ID
        //        qualificationDetails.fk_recId = candidateId;

        //        // Store existing file name
        //        string existingFileName = qualificationDetails.documentupload;

        //        // Handle new file upload
        //        if (qualificationDetails.UploadFile != null && qualificationDetails.UploadFile.Length > 0)
        //        {
        //            string candidateFolderPath = _configuration["AppSettings:CandidateFolderPath"];

        //            if (!Directory.Exists(candidateFolderPath))
        //            {
        //                Directory.CreateDirectory(candidateFolderPath);
        //            }

        //            string uniqueFileName = $"{candidateId}_{Guid.NewGuid()}_{qualificationDetails.UploadFile.FileName}";
        //            string filePath = Path.Combine(candidateFolderPath, uniqueFileName);

        //            using (var stream = new FileStream(filePath, FileMode.Create))
        //            {
        //                await qualificationDetails.UploadFile.CopyToAsync(stream);
        //            }

        //            qualificationDetails.documentupload = uniqueFileName;
        //        }
        //        else
        //        {
        //            // Preserve old file name if no new upload
        //            qualificationDetails.documentupload = existingFileName;
        //        }

        //        bool isUpdated = await _candidateQualificationRepository.UpdateCandidateQualification(qualificationDetails);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated
        //            ? "Qualification details updated successfully."
        //            : "Failed to update qualification details.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return StatusCode(500, modelResponse);
        //    }
        //}

        [HttpPut]
        public async Task<IActionResult> UpdateQualificationAsync(
    [FromForm] CandidateQualificationDetails qualificationDetails)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    return Unauthorized(new
                    {
                        isSuccess = false,
                        message = "Invalid candidate",
                        statusCode = 401
                    });
                }

                // Get existing record to retrieve old file name
                var existingRecord = await _candidateQualificationRepository.GetById(
                    qualificationDetails.pk_cqualid ?? 0);

                if (existingRecord == null || existingRecord.fk_recId != candidateId)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this record.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                // Set candidate ID
                qualificationDetails.fk_recId = candidateId;

                // Handle new file upload
                if (qualificationDetails.UploadFile != null && qualificationDetails.UploadFile.Length > 0)
                {
                    string candidateFolderPath = _configuration["AppSettings:CandidateFolderPath"];

                    if (!Directory.Exists(candidateFolderPath))
                    {
                        Directory.CreateDirectory(candidateFolderPath);
                    }

                    string uniqueFileName = $"{candidateId}_{Guid.NewGuid()}_{qualificationDetails.UploadFile.FileName}";
                    string filePath = Path.Combine(candidateFolderPath, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await qualificationDetails.UploadFile.CopyToAsync(stream);
                    }

                    qualificationDetails.documentupload = uniqueFileName;

                    //  Delete old file if exists
                    if (!string.IsNullOrEmpty(existingRecord.documentupload))
                    {
                        string oldFilePath = Path.Combine(candidateFolderPath, existingRecord.documentupload);
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }
                }
                else
                {
                    //  NO new file uploaded - preserve existing file name
                    qualificationDetails.documentupload = existingRecord.documentupload;
                }

                bool isUpdated = await _candidateQualificationRepository.UpdateCandidateQualification(qualificationDetails);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Qualification details updated successfully."
                    : "Failed to update qualification details.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

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

        [HttpDelete("{pk_cqualid}")]
        public async Task<IActionResult> DeleteQualificationAsync([FromRoute] long pk_cqualid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await _candidateQualificationRepository.DeleteCandidateQualificationAsync(pk_cqualid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted
                    ? "Qualification detail deleted successfully."
                    : "Failed to delete qualification detail.";
                modelResponse.StatusCode = isDeleted ? 200 : 400;

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

        [HttpGet("documents/{fileName}")]
        public IActionResult GetDocument(string fileName, [FromQuery] string key)
        {
            try
            {
                if (string.IsNullOrEmpty(key))
                {
                    return Unauthorized(new { message = "Candidate key is required" });
                }

                string candidateFolderPath = _configuration["AppSettings:CandidateFolderPath"];
                string filePath = Path.Combine(candidateFolderPath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "File not found" });
                }

                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                var mimeType = GetMimeType(filePath);

                return File(fileStream, mimeType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private string GetMimeType(string filePath)
        {
            var fileExtension = Path.GetExtension(filePath).ToLower();
            return fileExtension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream",
            };
        }
    }
}