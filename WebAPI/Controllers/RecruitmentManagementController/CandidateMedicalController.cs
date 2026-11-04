using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static HRMSWebAPI.Models.CandidateMedicalMst;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CandidateMedicalController : ControllerBase
    {
        private readonly ICandidateMedicalRepository candidateMedicalRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;

        public CandidateMedicalController(ICandidateMedicalRepository _candidateMedicalRepository,FileService _fileService)

        {
            candidateMedicalRepository = _candidateMedicalRepository;
            fileService = _fileService;
        }

        [HttpGet("candidate/{fk_recId}")]
        [Authorize]

        public async Task<IActionResult> GetCandidateDetailsByIdAsync([FromRoute] string fk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                CandidateDetailData result = await candidateMedicalRepository.GetCandidateDetailsByIdAsync(fk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid fk_recId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate Details retrieved successfully.";
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

        [HttpGet("medical/{pk_mtrnid}")]
        [Authorize]

        public async Task<IActionResult> GetCandidate_MedicalsByIdAsync([FromRoute] long pk_mtrnid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                Candidate_MedicalDetails result = await candidateMedicalRepository.GetCandidate_MedicalsByIdAsync(pk_mtrnid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid fk_recId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate_Medicals Details retrieved successfully.";
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


        [HttpGet("refrence/{pk_rtrnid}")]
        [Authorize]

        public async Task<IActionResult> GetCandidateReferenceByIdAsync([FromRoute] long pk_rtrnid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                CandidateReferenceDetails result = await candidateMedicalRepository.GetCandidateReferenceByIdAsync(pk_rtrnid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid fk_recId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate_Medicals Details retrieved successfully.";
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

        [HttpGet("AllMedical")]
        [Authorize]
        public async Task<IActionResult> GetAllCandidateMedicals(int pageIndex = 0, int pageSize = 10, [FromQuery] string? fk_recId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // REMOVE this block if you want to allow null/empty fk_recId
                // If you still want to validate in some cases, check inside repo method

                var (totalCount, result) = await candidateMedicalRepository.GetAllCandidateMedicalsAsync(pageIndex, pageSize, fk_recId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate medical list retrieved successfully.";
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

        //public async Task<IActionResult> GetAllCandidateMedicals(int pageIndex = 0, int pageSize = 10, [FromQuery] string fk_recId = "")
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        if (string.IsNullOrEmpty(fk_recId))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Recruitment ID (fk_recId) is required.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        var (totalCount, result) = await candidateMedicalRepository.GetAllCandidateMedicalsAsync(pageIndex, pageSize, fk_recId);
        //        if (result == null || !result.Any())
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No record found.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Candidate medical list retrieved successfully.";
        //        modelResponse.Data = result;
        //        modelResponse.TotalCount = totalCount;
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

        [HttpDelete("medical/{pk_mtrnid}")]
        [Authorize]
        public async Task<IActionResult> DeleteCandidateMedicalAsync([FromRoute] long pk_mtrnid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await candidateMedicalRepository.DeleteCandidateMedicalAsync(pk_mtrnid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Candidate medical detail deleted successfully." : "Failed to delete candidate medical detail.";
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
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertCandidateMedicalAsync([FromBody] Candidate_MedicalDetailsDataSet medicalDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString();

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString();

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString();

                // (Optional) Set these values into medicalDataSet if needed in future

                bool isInserted = await candidateMedicalRepository.InsertCandidateMedicalAsync(medicalDataSet);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Candidate medical details inserted successfully." : "Failed to insert candidate medical details.";
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

        [HttpPut("updatemedical")]
        [Authorize] // Secured endpoint        
        public async Task<IActionResult> UpdateCandidateMedical([FromBody] Candidate_MedicalDetailsDataSet medicalDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted user, location, and company IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                // Optionally populate audit fields if applicable in your model (not required in current SP)
                // firstRecord.fk_userid = decryptedUserId;
                // firstRecord.fk_locid = decryptedLocationId;

                // Call repository method
                bool isUpdated = await candidateMedicalRepository.UpdateCandidateMedicalAsync(medicalDataSet);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Candidate medical record updated successfully." : "Failed to update candidate medical record.";
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


        [HttpGet("Allrefrence")]
        [Authorize]
        public async Task<IActionResult> GetAllCandidateReferences(int pageIndex = 0, int pageSize = 10, [FromQuery] string? fk_recId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await candidateMedicalRepository.GetAllCandidateReferencesAsync(pageIndex, pageSize, fk_recId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate reference list retrieved successfully.";
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


        [HttpDelete("reference/{pk_rtrnid}")]
        [Authorize]
        public async Task<IActionResult> DeleteCandidateReferenceAsync([FromRoute] long pk_rtrnid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await candidateMedicalRepository.DeleteCandidateReferenceAsync(pk_rtrnid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Candidate reference detail deleted successfully." : "Failed to delete candidate reference detail.";
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

        // Insert Candidate Reference
        [HttpPost("refrence")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> InsertCandidateReference([FromForm] CandidateReferenceDetailsDataSet reference)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (reference.CandidateReferenceDetails.filepath != null && reference.CandidateReferenceDetails.filepath.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(reference.CandidateReferenceDetails.filepath))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(reference.CandidateReferenceDetails.filepath);

                    // Save the file path in attachment (this will go to DB)
                    reference.CandidateReferenceDetails.attachment = savedFileName;
                }

                // Nullify IFormFile before sending to repository
                reference.CandidateReferenceDetails.filepath = null;


                // Call Repository
                bool isInserted = await candidateMedicalRepository.InsertCandidateReferenceAsync(reference);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Candidate reference inserted successfully." : "Failed to insert candidate reference.";
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

        // Insert Candidate Reference
        [HttpPost("updaterefrence")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateCandidateReferenceAsync([FromForm] CandidateReferenceDetailsDataSet reference)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var refDetails = reference.CandidateReferenceDetails;

                if (refDetails.filepath != null && refDetails.filepath.Length > 0)
                {
                    // Optional: Validate it's an image
                    if (!fileService.IsImageFile(refDetails.filepath))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save the file
                    var savedFileName = await fileService.SaveFileAsync(refDetails.filepath);

                    // Save the file path in attachment (this will go to DB)
                    refDetails.attachment = savedFileName;
                }
                else

                {
                    refDetails.attachment = refDetails.attachment;
                }

                // Nullify IFormFile before sending to repository
                refDetails.filepath = null;


                // Call Repository
                bool isInserted = await candidateMedicalRepository.UpdateCandidateReferenceAsync(reference);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Candidate reference update successfully." : "Failed to update candidate reference.";
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










    }
}
