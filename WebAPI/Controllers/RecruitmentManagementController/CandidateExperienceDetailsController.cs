// CandidateExperienceDetailsController.cs
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Ocsp;
using System.Data;
using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CandidateExperienceDetailsController : ControllerBase
    {
        private readonly ICityRepository cityRepository;
        private readonly IGeneralRepository generalRepository;
        private readonly ICandidateExperienceDetailsRepository _candidateExperienceDetailsRepository;
        private readonly FileService _fileService;
        private readonly AppSettings _appSettings;

        private readonly IUserMasterRepository userMasterRepository;
        private readonly TokenService tokenService;
        private readonly IConfiguration configuration;
        private readonly EmailService emailService;
        private readonly OnboardingEmailService onboardingEmailService;


        public CandidateExperienceDetailsController(
            ICandidateExperienceDetailsRepository candidateExperienceDetailsRepository,
            ICityRepository _cityRepository,
            IGeneralRepository _generalRepository,
            FileService fileService,
            IOptions<AppSettings> appSettings,
            IUserMasterRepository _userMasterRepository,
             EmailService _emailService,
             TokenService _tokenService,
             IConfiguration _configuration,
             OnboardingEmailService _onboardingEmailService)
        {
            _candidateExperienceDetailsRepository = candidateExperienceDetailsRepository;
            _fileService = fileService;
            _appSettings = appSettings.Value;
            this.userMasterRepository = _userMasterRepository;
            tokenService = _tokenService;
            configuration = _configuration;
            emailService = _emailService;
            generalRepository = _generalRepository;
            cityRepository = _cityRepository;
            onboardingEmailService = _onboardingEmailService;
        }















        [HttpGet]
        public async Task<IActionResult> GetAllCandidateExperienceDetails(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var (totalCount, result) = await _candidateExperienceDetailsRepository.GetAll(pageIndex, pageSize, candidateId);

                if (!result.Any())
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "No records found.";
                    modelResponse.Data = new List<CandidateExperienceDetails>();
                    modelResponse.TotalCount = 0;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate Experience Details List retrieved successfully.";
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

        [HttpGet("{pk_cpjobid}")]
        public async Task<IActionResult> GetById([FromRoute] long pk_cpjobid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                CandidateExperienceDetails result = await _candidateExperienceDetailsRepository.GetById(pk_cpjobid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid pk_cpjobid";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                if (result.fk_recId != candidateId)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this record.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate Experience detail retrieved successfully.";
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

        //[HttpPost]
        //public async Task<IActionResult> InsertCandidatePrevJobAsync([FromForm] CandidateExperienceDetails candidatePrevJobDataSet)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        var candidateId = HttpContext.Items["CandidateId"]?.ToString();

        //        if (string.IsNullOrEmpty(candidateId))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
        //            modelResponse.StatusCode = 401;
        //            return Ok(modelResponse);
        //        }

        //        candidatePrevJobDataSet.fk_recId = candidateId;

        //        // Handle file upload using FileService
        //        if (candidatePrevJobDataSet.UploadFile != null && candidatePrevJobDataSet.UploadFile.Length > 0)
        //        {
        //            // Validate file type
        //            if (!_fileService.IsCandidateDocumentFile(candidatePrevJobDataSet.UploadFile))
        //            {
        //                modelResponse.IsSuccess = false;
        //                modelResponse.Message = "Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.";
        //                modelResponse.StatusCode = 400;
        //                return Ok(modelResponse);
        //            }

        //            // Validate file size (5MB max)
        //            if (candidatePrevJobDataSet.UploadFile.Length > 5 * 1024 * 1024)
        //            {
        //                modelResponse.IsSuccess = false;
        //                modelResponse.Message = "File size should not exceed 5MB.";
        //                modelResponse.StatusCode = 400;
        //                return Ok(modelResponse);
        //            }

        //            // Save file using FileService
        //            var savedFileName = await _fileService.SaveCandidateFileAsync(candidatePrevJobDataSet.UploadFile, candidateId);
        //            candidatePrevJobDataSet.documentupload = savedFileName;
        //        }

        //        candidatePrevJobDataSet.UploadFile = null;

        //        bool isInserted = await _candidateExperienceDetailsRepository.InsertCandidatePrevJob(candidatePrevJobDataSet);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted ? "Experience details added successfully!" : "Failed to add experience details.";
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
        public async Task<IActionResult> InsertCandidatePrevJobAsync([FromForm] CandidateExperienceDetails candidatePrevJobDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                candidatePrevJobDataSet.fk_recId = candidateId;

                // Handle file upload using FileService
                if (candidatePrevJobDataSet.UploadFile != null && candidatePrevJobDataSet.UploadFile.Length > 0)
                {
                    // Validate file type
                    if (!_fileService.IsCandidateDocumentFile(candidatePrevJobDataSet.UploadFile))
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }

                    // Validate file size (5MB max)
                    if (candidatePrevJobDataSet.UploadFile.Length > 5 * 1024 * 1024)
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "File size should not exceed 5MB.";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }

                    // Save file using FileService
                    var savedFileName = await _fileService.SaveCandidateFileAsync(candidatePrevJobDataSet.UploadFile, candidateId);
                    candidatePrevJobDataSet.documentupload = savedFileName;
                }

                candidatePrevJobDataSet.UploadFile = null;

                // Handle offer letter upload using FileService
                if (candidatePrevJobDataSet.UploadOfferLetter != null && candidatePrevJobDataSet.UploadOfferLetter.Length > 0)
                {
                    if (!_fileService.IsCandidateDocumentFile(candidatePrevJobDataSet.UploadOfferLetter))
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed for offer letter.";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }

                    if (candidatePrevJobDataSet.UploadOfferLetter.Length > 5 * 1024 * 1024)
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "Offer letter file size should not exceed 5MB.";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }

                    var savedOfferFileName = await _fileService.SaveCandidateFileAsync(candidatePrevJobDataSet.UploadOfferLetter, candidateId);
                    candidatePrevJobDataSet.offerletter = savedOfferFileName;
                }

                candidatePrevJobDataSet.UploadOfferLetter = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertCandidatePrevJob(candidatePrevJobDataSet);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Experience details added successfully!" : "Failed to add experience details.";
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
        [HttpPut]
        public async Task<IActionResult> UpdateCandidatePrevJobAsync([FromForm] CandidateExperienceDetails candidatePrevJobDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var existingRecord = await _candidateExperienceDetailsRepository.GetById(candidatePrevJobDataSet.pk_cpjobid ?? 0);
                if (existingRecord == null || existingRecord.fk_recId != candidateId)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this record.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                candidatePrevJobDataSet.fk_recId = candidateId;

                // Handle file upload using FileService
                if (candidatePrevJobDataSet.UploadFile != null && candidatePrevJobDataSet.UploadFile.Length > 0)
                {
                    // Validate file type
                    if (!_fileService.IsCandidateDocumentFile(candidatePrevJobDataSet.UploadFile))
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }

                    // Validate file size (5MB max)
                    if (candidatePrevJobDataSet.UploadFile.Length > 5 * 1024 * 1024)
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "File size should not exceed 5MB.";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }

                    // Save new file
                    var savedFileName = await _fileService.SaveCandidateFileAsync(candidatePrevJobDataSet.UploadFile, candidateId);

                    // Delete old file if exists
                    if (!string.IsNullOrEmpty(existingRecord.documentupload))
                    {
                        _fileService.DeleteCandidateFile(existingRecord.documentupload);
                    }

                    candidatePrevJobDataSet.documentupload = savedFileName;
                }
                else
                {
                    // No new file uploaded - preserve existing file name
                    candidatePrevJobDataSet.documentupload = existingRecord.documentupload;
                }

                candidatePrevJobDataSet.UploadFile = null;

                bool isUpdated = await _candidateExperienceDetailsRepository.UpdateCandidateExperienceDetailsAsync(candidatePrevJobDataSet);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Experience details updated successfully!" : "Failed to update experience details.";
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

        [HttpDelete("{pk_cpjobid}")]
        public async Task<IActionResult> DeleteCandidateExperienceAsync([FromRoute] long pk_cpjobid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var existingRecord = await _candidateExperienceDetailsRepository.GetById(pk_cpjobid);
                if (existingRecord == null || existingRecord.fk_recId != candidateId)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this record.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                // Delete associated file if exists
                if (!string.IsNullOrEmpty(existingRecord.documentupload))
                {
                    _fileService.DeleteCandidateFile(existingRecord.documentupload);
                }

                bool isDeleted = await _candidateExperienceDetailsRepository.DeleteCandidateExperienceAsync(pk_cpjobid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Experience detail deleted successfully." : "Failed to delete experience detail.";
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



        [HttpGet("documents/{fileName}")]
        public async Task<IActionResult> GetCandidateDocument(string fileName, [FromQuery] string key)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get candidate ID from HttpContext (set by middleware)
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                // Security: Verify the file belongs to this candidate
                if (!fileName.StartsWith(candidateId + "_"))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this file.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                var filePath = _fileService.GetCandidateFilePath(fileName);

                if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "File not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;

                var mimeType = GetMimeType(filePath);
                var fileExtension = Path.GetExtension(fileName).ToLower();

                // For images and PDFs, display inline; for documents, force download
                if (fileExtension == ".pdf" || fileExtension == ".jpg" || fileExtension == ".jpeg" || fileExtension == ".png")
                {
                    return File(memory, mimeType);
                }
                else
                {
                    return File(memory, mimeType, fileName);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving candidate document: {ex.Message}");

                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
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
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream",
            };
        }


        // added 06 dec 2025

        [HttpGet("validate")]
        public IActionResult ValidateCandidateKey()
        {
            try
            {
                //  If we reach here, middleware already validated:
                // - Key exists
                // - Key is valid
                // - IsOnboardingDone = false (NOT completed)

                var candidateId = HttpContext.Items["CandidateId"]?.ToString();
                var candidateName = HttpContext.Items["CandidateName"]?.ToString();
                var candidateKey = HttpContext.Items["CandidateKey"]?.ToString();

                DateTime? lastOpenedDate = null;
                if (!string.IsNullOrEmpty(candidateKey))
                {
                    try
                    {
                        using var conn = DataBaseFactory.ConnString();
                        lastOpenedDate = conn.QueryFirstOrDefault<DateTime?>(
                            "REC_Candidate_RecordLastOpened",
                            new { candidateKey },
                            commandType: CommandType.StoredProcedure
                        );
                    }
                    catch { }
                }

                return Ok(new
                {
                    isSuccess = true,
                    candidateId = candidateId,
                    candidateName = candidateName,
                    lastOpenedDate = lastOpenedDate,
                    message = "Valid candidate key",
                    statusCode = 200
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = ex.Message,
                    statusCode = 500
                });
            }
        }

        [HttpPost("submit-onboarding")]
        public async Task<IActionResult> SubmitOnboarding()
        {
            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();
                var candidateName = HttpContext.Items["CandidateName"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    return Unauthorized(new
                    {
                        isSuccess = false,
                        message = "Invalid candidate",
                        statusCode = 401
                    });
                }

                // ✅ Single call - get both update status AND candidate details
                var (success, candidateDetails) = await _candidateExperienceDetailsRepository.CompleteOnboarding(candidateId);

                if (!success)
                {
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Failed to submit onboarding",
                        statusCode = 400
                    });
                }

                // ✅ Send email to HR using OnboardingEmailService
                if (candidateDetails != null && !string.IsNullOrEmpty(candidateDetails.OnboardingHREmail))
                {
                    await onboardingEmailService.SendHRNotificationEmailAsync(
                        candidateDetails.OnboardingHREmail,
                        candidateDetails.CandidateName,
                        candidateDetails.pk_recId,
                        candidateDetails.CandidateEmail,
                        candidateDetails.MobileNo,
                        candidateDetails.CandidateKey
                    );
                }

                return Ok(new
                {
                    isSuccess = true,
                    message = "Onboarding submitted successfully! Our HR team will review your details.",
                    statusCode = 200
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = ex.Message,
                    statusCode = 500
                });
            }
        }


        //[HttpPost("submit-onboarding")]
        //public async Task<IActionResult> SubmitOnboarding()
        //{
        //    try
        //    {
        //        var candidateId = HttpContext.Items["CandidateId"]?.ToString();
        //        var candidateName = HttpContext.Items["CandidateName"]?.ToString();

        //        if (string.IsNullOrEmpty(candidateId))
        //        {
        //            return Unauthorized(new
        //            {
        //                isSuccess = false,
        //                message = "Invalid candidate",
        //                statusCode = 401
        //            });
        //        }

        //        //  Single call - get both update status AND candidate details
        //        var (success, candidateDetails) = await _candidateExperienceDetailsRepository.CompleteOnboarding(candidateId);

        //        if (!success)
        //        {
        //            return BadRequest(new
        //            {
        //                isSuccess = false,
        //                message = "Failed to submit onboarding",
        //                statusCode = 400
        //            });
        //        }

        //        //  Send email if HR email exists
        //        if (candidateDetails != null && !string.IsNullOrEmpty(candidateDetails.OnboardingHREmail))
        //        {
        //            // Generate review link
        //            string frontendDomain = configuration["AppSettings:FrontendDomain"];
        //            string reviewLink = $"{frontendDomain}/candidate-review/{candidateDetails.CandidateKey}";

        //            // Send email to HR
        //            await SendOnboardingEmailToHR(
        //                candidateDetails.OnboardingHREmail,
        //                candidateDetails.CandidateName,
        //                candidateDetails.pk_recId,
        //                candidateDetails.CandidateEmail,
        //                candidateDetails.MobileNo,
        //                reviewLink
        //            );
        //        }

        //        return Ok(new
        //        {
        //            isSuccess = true,
        //            message = "Onboarding submitted successfully! Our HR team will review your details.",
        //            statusCode = 200
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            isSuccess = false,
        //            message = ex.Message,
        //            statusCode = 500
        //        });
        //    }
        //}

        //private async Task SendOnboardingEmailToHR(
        //    string hrEmail,
        //    string candidateName,
        //    string candidateId,
        //    string candidateEmail,
        //    string candidateMobile,
        //    string reviewLink)
        //        {
        //            string subject = $"New Onboarding Submission - {candidateName}";

        //            string body = $@"
        //        <html>
        //        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        //            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        //                <h2 style='color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;'>
        //                    New Candidate Onboarding Submission
        //                </h2>

        //                <p>Dear HR Team,</p>

        //                <p>A new candidate has successfully completed their onboarding form.</p>

        //                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
        //                    <h3 style='margin-top: 0; color: #2c3e50;'>Candidate Information</h3>
        //                    <table style='width: 100%;'>
        //                        <tr>
        //                            <td style='padding: 8px 0; font-weight: bold; width: 40%;'>Name:</td>
        //                            <td style='padding: 8px 0;'>{candidateName}</td>
        //                        </tr>
        //                        <tr>
        //                            <td style='padding: 8px 0; font-weight: bold;'>Candidate ID:</td>
        //                            <td style='padding: 8px 0;'>{candidateId}</td>
        //                        </tr>
        //                        <tr>
        //                            <td style='padding: 8px 0; font-weight: bold;'>Email:</td>
        //                            <td style='padding: 8px 0;'>{candidateEmail}</td>
        //                        </tr>
        //                        <tr>
        //                            <td style='padding: 8px 0; font-weight: bold;'>Mobile:</td>
        //                            <td style='padding: 8px 0;'>{candidateMobile}</td>
        //                        </tr>
        //                        <tr>
        //                            <td style='padding: 8px 0; font-weight: bold;'>Submission Date:</td>
        //                            <td style='padding: 8px 0;'>{DateTime.Now:dd-MMM-yyyy HH:mm}</td>
        //                        </tr>
        //                    </table>
        //                </div>

        //                <div style='text-align: center; margin: 30px 0;'>
        //                    <a href='{reviewLink}' 
        //                       style='display: inline-block; 
        //                              background-color: #3498db; 
        //                              color: white; 
        //                              padding: 12px 30px; 
        //                              text-decoration: none; 
        //                              border-radius: 5px;
        //                              font-weight: bold;'>
        //                        Review Candidate Details
        //                    </a>
        //                </div>

        //                <p style='color: #7f8c8d; font-size: 14px;'>
        //                    <strong>Note:</strong> You can click the button above to view complete candidate details, 
        //                    including personal information, qualifications, experience, and family details. 
        //                    You can also print the details directly from the review page.
        //                </p>

        //                <hr style='border: none; border-top: 1px solid #ddd; margin: 30px 0;'>

        //                <p style='color: #7f8c8d; font-size: 12px; text-align: center;'>
        //                    This is an automated email from HRMS System. Please do not reply to this email.
        //                </p>
        //            </div>
        //        </body>
        //        </html>
        //    ";

        //            // existing SendEmailAsync method with correct parameters
        //            await emailService.SendEmailAsync(hrEmail, subject, body);
        //        }




        /// <summary>
        /// HR Review endpoint - Does NOT check IsOnboardingDone
        /// Allows HR to view candidate details even after submission
        /// </summary>
        //[HttpGet("hr-review")]
        //public async Task<IActionResult> GetCandidateForHRReview([FromQuery] string key)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        if (string.IsNullOrEmpty(key))
        //        {
        //            return BadRequest(new
        //            {
        //                isSuccess = false,
        //                message = "Candidate key is required",
        //                statusCode = 400
        //            });
        //        }

        //        //  Validate key and get candidate ID (WITHOUT IsOnboardingDone check)
        //        var candidate = await _candidateExperienceDetailsRepository.GetCandidateByKeyForHR(key);

        //        if (candidate == null)
        //        {
        //            return NotFound(new
        //            {
        //                isSuccess = false,
        //                message = "Invalid or expired candidate key",
        //                statusCode = 404
        //            });
        //        }

        //        // Get complete candidate summary
        //        var summary = await _candidateExperienceDetailsRepository.GetCandidateFinalSummary(candidate.pk_recId);

        //        if (summary == null || summary.BasicInfo == null)
        //        {
        //            return NotFound(new
        //            {
        //                isSuccess = false,
        //                message = "Candidate details not found",
        //                statusCode = 404
        //            });
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Candidate details retrieved successfully.";
        //        modelResponse.Data = new
        //        {
        //            candidateId = candidate.pk_recId,
        //            candidateName = candidate.CandidateName,
        //            onboardingStatus = candidate.OnboardFormStatus,
        //            completionDate = candidate.OnboardCompletionDate,
        //            summary = summary
        //        };
        //        modelResponse.StatusCode = 200;

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



        //Aadhar verifiction =====================================================



        //[HttpPost]
        //[Authorize]
        //[Route("verify-aadhaar/generate-otp")]
        //public async Task<IActionResult> GenerateOtpAsync([FromBody] AadhaarVerification generateOtpRequest)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        //var decryptedUserId = (long)HttpContext.Items["DecryptedUserId"]!; // Retrieve the user ID-long
        //        //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString();

        //        //demo code starts
        //        var data = new
        //        {
        //            client_id = 1,
        //            otp_sent = true,
        //            //if_number = apiResponse.Data.if_number,
        //            valid_aadhaar = true,
        //            //status = apiResponse.Data.status
        //        };

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "OTP sent - demo purpose- 123567 ";
        //        modelResponse.Data = data;

        //        return Ok(modelResponse);
        //        //demo code ends

        //        //uncoment bwelow code after

        //        /*

        //        // Read API settings from appsettings.json
        //        var frontendDomain = configuration["SurePassAPISettings:Domain"];
        //        var token = configuration["SurePassAPISettings:Token"];
        //        var apiUrl = $"{frontendDomain}/aadhaar-v2/generate-otp"; // Append endpoint path to base URL


        //        // Prepare request payload
        //        var requestBody = new
        //        {
        //            id_number = generateOtpRequest.AadhaarNo
        //        };

        //        // Make HTTP POST request to the 3rd-party API
        //        using var httpClient = new HttpClient();
        //        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        //        var response = await httpClient.PostAsJsonAsync(apiUrl, requestBody);

        //        var requestXML = JsonConvert.SerializeObject(requestBody); // Serialize request body

        //        var responseXML = await response.Content.ReadAsStringAsync(); // Deserialize response body

        //        //save this request response over db
        //        // Log the OTP submission request and response data using the repository function
        //        await userRepository.LogAPICallDataAsync(apiUrl, "POST",
        //            requestXML, responseXML, response.StatusCode, response.IsSuccessStatusCode, decryptedUserId);

        //        // Parse the response 
        //        var apiResponse = await response.Content.ReadFromJsonAsync<GenerateOtpResponse>();


        //        if (!response.IsSuccessStatusCode)
        //        {
        //            if (apiResponse!=null && !apiResponse.Data.valid_aadhaar)
        //            {
        //                modelResponse.Message = "Invalid Aadhaar.Please ensure to give correct Aadhaar No.";
        //            }
        //            else if (apiResponse != null && !apiResponse.Data.otp_sent)
        //            {
        //                modelResponse.Message = "OTP not sent to Aadhaar linked mobileno due to server issue.Please try after sometime.";
        //            }
        //            else
        //            {
        //                modelResponse.Message = "Server issue.Please try after sometime";
        //            }


        //            modelResponse.IsSuccess = false;                    
        //            modelResponse.StatusCode = 400;
        //            modelResponse.Data = null;
        //            return Ok(modelResponse);
        //        }


        //        if (apiResponse?.Success != true)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = apiResponse?.Message ?? "OTP generation failed due to an unknown error.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        // Assuming the API gives us PAN-relevant data back from the response
        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "OTP successfully  sent on your Aadhaar linked mobile number.Please use that otp to validate.";
        //        modelResponse.StatusCode = 200;

        //        var data = new
        //        {
        //            client_id = apiResponse.Data.client_id,
        //            otp_sent = apiResponse.Data.otp_sent,
        //            //if_number = apiResponse.Data.if_number,
        //            valid_aadhaar = apiResponse.Data.valid_aadhaar,
        //            //status = apiResponse.Data.status
        //        };

        //        modelResponse.Data = data;

        //        return Ok(modelResponse);
        //        */
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }

        //}




        //[HttpPost]
        //[Authorize]
        //[Route("verify-aadhaar/submit-otp")]
        //public async Task<IActionResult> SubmitOtpAsync([FromBody] SubmitOtpRequest submitOtpRequest)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        //modelResponse.Data = new
        //        //{
        //        //    //client_id = aadhaarApiResponse.data.client_id,
        //        //    full_name = "Mahesh Sharma",
        //        //    dob = "1993-02-17",
        //        //    gender = 'M',
        //        //    address = "HouseNo-23, Delhi Street View, Delhi, India",
        //        //    // status = aadhaarApiResponse.data.status                       
        //        //};
        //        ///*
        //        var decryptedUserId = (long)HttpContext.Items["DecryptedUserId"]!; // Retrieve the user ID-long
        //        var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString();

        //        var requestXML = JsonConvert.SerializeObject(submitOtpRequest); // Serialize request body

        //        var domain = configuration["SurePassAPISettings:Domain"];
        //        var token = configuration["SurePassAPISettings:Token"];
        //        var apiUrl = $"{domain}/aadhaar-v2/submit-otp"; // External API URL for OTP submission

        //        using var httpClient = new HttpClient();
        //        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        //        // Step 2: Submit OTP via API call
        //        var response = await httpClient.PostAsJsonAsync(apiUrl, submitOtpRequest);
        //        var responseXML = await response.Content.ReadAsStringAsync(); // Deserialize response body

        //        // Log the OTP submission request and response data
        //        await userMasterRepository.LogAPICallDataAsync(apiUrl, "POST",
        //            requestXML, responseXML, response.StatusCode, response.IsSuccessStatusCode);

        //        if (!response.IsSuccessStatusCode)
        //        {

        //            modelResponse.Message = "Adhaar Verification failed.Please ensure to give correct details.";
        //            modelResponse.IsSuccess = false;
        //            modelResponse.StatusCode = 400;
        //            modelResponse.Data = null;
        //            return Ok(modelResponse);
        //        }



        //        // Step 3: Deserialize the response into a detailed response model
        //        var aadhaarApiResponse = JsonConvert.DeserializeObject<SubmitOtpResponse>(responseXML);

        //        // Step 4: Check if the response status is successful
        //        if (aadhaarApiResponse != null && aadhaarApiResponse.success)
        //        {
        //            modelResponse.IsSuccess = true;
        //            modelResponse.Message = "Adhaar Verification successfully";
        //            modelResponse.StatusCode = 200;

        //            // Concatenate the address fields
        //            string fullAddress = string.Join(", ", new[]
        //            {
        //                aadhaarApiResponse.data.address.house,
        //                aadhaarApiResponse.data.address.loc,
        //                aadhaarApiResponse.data.address.street,
        //                aadhaarApiResponse.data.address.dist,
        //                aadhaarApiResponse.data.address.state,
        //                aadhaarApiResponse.data.address.country,                       
        //                aadhaarApiResponse.data.zip

        //            }.Where(x => !string.IsNullOrWhiteSpace(x))); // Include only non-empty fields

        //            // Map the data from the API response to the response object
        //            modelResponse.Data = new
        //            {
        //                //client_id = aadhaarApiResponse.data.client_id,
        //                full_name = aadhaarApiResponse.data.full_name,
        //                aadhaar_number = aadhaarApiResponse.data.aadhaar_number,
        //                dob = aadhaarApiResponse.data.dob,
        //                gender = aadhaarApiResponse.data.gender,
        //                address = fullAddress,
        //               // status = aadhaarApiResponse.data.status                       
        //            };
        //        }
        //        else
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Failed to submit OTP or Aadhaar verification failed";
        //            modelResponse.StatusCode = 400; // Bad Request if Aadhaar API returns failure
        //        }

        //        modelResponse.IsSuccess = true;

        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = $"An error occurred: {ex.Message}";
        //        modelResponse.StatusCode = 500;
        //    }

        //    return Ok(modelResponse);
        //}




        [HttpPost]

        [Route("verify-aadhaar/generate-otp")]
        public async Task<IActionResult> GenerateOtpAsync([FromBody] AadhaarVerification generateOtpRequest)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                //var decryptedUserId = (long)HttpContext.Items["DecryptedUserId"]!; // Retrieve the user ID-long
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString();
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();


                // Read API settings from appsettings.json
                var frontendDomain = configuration["SurePassAPISettings:Domain"];
                var token = configuration["SurePassAPISettings:Token"];
                var apiUrl = $"{frontendDomain}/aadhaar-v2/generate-otp"; // Append endpoint path to base URL


                // Prepare request payload
                var requestBody = new
                {
                    id_number = generateOtpRequest.AadhaarNo
                };

                // Make HTTP POST request to the 3rd-party API
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var response = await httpClient.PostAsJsonAsync(apiUrl, requestBody);

                var requestXML = JsonConvert.SerializeObject(requestBody); // Serialize request body

                var responseXML = await response.Content.ReadAsStringAsync(); // Deserialize response body

                //save this request response over db
                // Log the OTP submission request and response data using the repository function
                await userMasterRepository.LogAPICallDataAsync(apiUrl, "POST",
                    requestXML, responseXML, response.StatusCode, response.IsSuccessStatusCode, candidateId);

                // Parse the response 
                var apiResponse = await response.Content.ReadFromJsonAsync<GenerateOtpResponse>();


                if (!response.IsSuccessStatusCode)
                {
                    if (apiResponse != null && !apiResponse.Data.valid_aadhaar)
                    {
                        modelResponse.Message = "Invalid Aadhaar.Please ensure to give correct Aadhaar No.";
                    }
                    else if (apiResponse != null && !apiResponse.Data.otp_sent)
                    {
                        modelResponse.Message = "OTP not sent to Aadhaar linked mobileno due to server issue.Please try after sometime.";
                    }
                    else
                    {
                        modelResponse.Message = "Server issue.Please try after sometime";
                    }


                    modelResponse.IsSuccess = false;
                    modelResponse.StatusCode = 400;
                    modelResponse.Data = null;
                    return Ok(modelResponse);
                }


                if (apiResponse?.Success != true)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = apiResponse?.Message ?? "OTP generation failed due to an unknown error.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Assuming the API gives us PAN-relevant data back from the response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "OTP successfully  sent on your Aadhaar linked mobile number.Please use that otp to validate.";
                modelResponse.StatusCode = 200;

                var data = new
                {
                    client_id = apiResponse.Data.client_id,
                    otp_sent = apiResponse.Data.otp_sent,
                    //if_number = apiResponse.Data.if_number,
                    valid_aadhaar = apiResponse.Data.valid_aadhaar,
                    //status = apiResponse.Data.status
                };

                modelResponse.Data = data;

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

        [Route("verify-aadhaar/submit-otp")]

        public async Task<IActionResult> SubmitOtpAsync([FromBody] SubmitOtpRequest submitOtpRequest)
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();

            try
            {
                //modelResponse.Data = new
                //{
                //    //client_id = aadhaarApiResponse.data.client_id,
                //    full_name = "Mahesh Sharma",
                //    aadhaar_number = "763489071234",
                //    dob = "1993-02-17",
                //    gender = 'M',
                //    address = "HouseNo-23, Delhi Street View, Delhi, India",
                //    // status = aadhaarApiResponse.data.status                       
                //};
                ///*
                var decryptedUserId = (long)HttpContext.Items["DecryptedUserId"]!; // Retrieve the user ID-long
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString();

                var requestXML = JsonConvert.SerializeObject(submitOtpRequest); // Serialize request body

                var domain = configuration["SurePassAPISettings:Domain"];
                var token = configuration["SurePassAPISettings:Token"];
                var apiUrl = $"{domain}/aadhaar-v2/submit-otp"; // External API URL for OTP submission

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                // Step 2: Submit OTP via API call
                var response = await httpClient.PostAsJsonAsync(apiUrl, submitOtpRequest);
                var responseXML = await response.Content.ReadAsStringAsync(); // Deserialize response body

                // Log the OTP submission request and response data
                await userMasterRepository.LogAPICallDataAsync(apiUrl, "POST",
                    requestXML, responseXML, response.StatusCode, response.IsSuccessStatusCode, candidateId);

                if (!response.IsSuccessStatusCode)
                {

                    modelResponse.Message = "Adhaar Verification failed.Please ensure to give correct details.";
                    modelResponse.IsSuccess = false;
                    modelResponse.StatusCode = 400;
                    modelResponse.Data = null;
                    return Ok(modelResponse);
                }



                // Step 3: Deserialize the response into a detailed response model
                var aadhaarApiResponse = JsonConvert.DeserializeObject<SubmitOtpResponse>(responseXML);

                // Step 4: Check if the response status is successful
                if (aadhaarApiResponse != null && aadhaarApiResponse.success)
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Adhaar Verification successfully";
                    modelResponse.StatusCode = 200;

                    // Concatenate the address fields
                    string fullAddress = string.Join(", ", new[]
                    {
                        aadhaarApiResponse.data.address.house,
                        aadhaarApiResponse.data.address.loc,
                        aadhaarApiResponse.data.address.street,
                        aadhaarApiResponse.data.address.dist,
                        aadhaarApiResponse.data.address.state,
                        aadhaarApiResponse.data.address.country,
                        aadhaarApiResponse.data.zip

                    }.Where(x => !string.IsNullOrWhiteSpace(x))); // Include only non-empty fields

                    // Map the data from the API response to the response object
                    modelResponse.Data = new
                    {
                        //client_id = aadhaarApiResponse.data.client_id,
                        full_name = aadhaarApiResponse.data.full_name,
                        aadhaar_number = aadhaarApiResponse.data.aadhaar_number,
                        dob = aadhaarApiResponse.data.dob,
                        gender = aadhaarApiResponse.data.gender,
                        address = fullAddress,
                        // status = aadhaarApiResponse.data.status                       
                    };
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to submit OTP or Aadhaar verification failed";
                    modelResponse.StatusCode = 400; // Bad Request if Aadhaar API returns failure
                }

                modelResponse.IsSuccess = true;

            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
            }

            return Ok(modelResponse);
        }




        [HttpPost]

        [Route("verify-aadhaar/Aadhaar")]
        public async Task<IActionResult> InsertAadhaarAsync([FromForm] AadhaarModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;
            try
            {
                // Basic Required Checks
                if (model == null)
                    return BadRequest(new { message = "Invalid Aadhaar data." });

                if (string.IsNullOrWhiteSpace(model.AadhaarNo) ||
                    model.AadhaarNo.Length != 12 ||
                    !model.AadhaarNo.All(char.IsDigit))
                    return BadRequest(new { message = "Aadhaar number must be 12 digits." });

                if (!DateTime.TryParse(model.AadhaarDob, out _))
                    return BadRequest(new { message = "Invalid Date of Birth." });

                if (string.IsNullOrWhiteSpace(model.AadhaarName) ||
                    string.IsNullOrWhiteSpace(model.AadhaarAddress))
                    return BadRequest(new { message = "Name and address are required." });

                // ============================
                // FILE: Aadhaar Front
                // ============================
                if (model.AadhaarFrontFile != null && model.AadhaarFrontFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.AadhaarFrontFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.AadhaarFront = await _fileService.SaveFileAsync(model.AadhaarFrontFile);
                }

                // ============================
                // FILE: Aadhaar Back
                // ============================
                if (model.AadhaarBackFile != null && model.AadhaarBackFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.AadhaarBackFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.AadhaarBack = await _fileService.SaveFileAsync(model.AadhaarBackFile);
                }

                // ============================
                // FILE: Father Aadhaar Front
                // ============================
                if (model.FatherAadhaarFrontFile != null && model.FatherAadhaarFrontFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.FatherAadhaarFrontFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed for Father's Aadhaar Front." });

                    model.FatherAadhaarFront = await _fileService.SaveFileAsync(model.FatherAadhaarFrontFile);
                }

                // ============================
                // FILE: Father Aadhaar Back
                // ============================
                if (model.FatherAadhaarBackFile != null && model.FatherAadhaarBackFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.FatherAadhaarBackFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed for Father's Aadhaar Back." });

                    model.FatherAadhaarBack = await _fileService.SaveFileAsync(model.FatherAadhaarBackFile);
                }

                // Clear uploaded files
                model.AadhaarFrontFile = null;
                model.AadhaarBackFile = null;
                model.FatherAadhaarFrontFile = null;
                model.FatherAadhaarBackFile = null;

                // ============================
                // CALL REPOSITORY
                // ============================
                bool isInserted = await userMasterRepository.InsertAadhaarAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Aadhaar verified successfully." : "Aadhaar verification failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return StatusCode(500, response);
            }
        }

        [HttpGet("GetAadhaarById")]

        public async Task<IActionResult> GetAadhaarByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;
            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                AadhaarModel result = await userMasterRepository.GetAadhaarByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid record ID.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Aadhaar detail retrieved successfully.";
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






        //PanVerification===================================================================================================================================






        //[HttpPost]
        //  // Secured endpoint
        //[Route("verify-pan")]
        //public async Task<IActionResult> PanVerifiedAsync(PanVerification panVerifiedObj)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {



        //        // Make a 3rd party service API call that will verify the PAN No (mocked here)

        //        var response = verifyPanNo(panVerifiedObj.PanNo);
        //        if (!response.IsSuccess)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "PAN No Not Verified";
        //            return Ok(modelResponse);
        //        }


        //        // Assuming the API gives us PAN-relevant data back from the response
        //        var panData = new
        //        {
        //            Name = "Ankit Mehra",
        //            Dob = new DateOnly(1985, 10, 15)
        //        };

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "PAN No Verified Successfully";
        //        modelResponse.StatusCode = 200;
        //        modelResponse.Data = panData;

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
        // Secured endpoint
        [Route("verify-pan")]
        public async Task<IActionResult> PanVerifiedAsync(PanVerification panVerifiedObj)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {



                //var decryptedUserId = (long)HttpContext.Items["DecryptedUserId"]!; // Retrieve the user ID-long
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString();

                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                // Read API settings from appsettings.json
                var frontendDomain = configuration["SurePassAPISettings:Domain"];
                var token = configuration["SurePassAPISettings:Token"];

                var apiUrl = $"{frontendDomain}/pan/pan-comprehensive"; // Append endpoint path to base URL


                // Prepare request payload
                var requestBody = new
                {
                    id_number = panVerifiedObj.PanNo
                };

                // Make HTTP POST request to the 3rd-party API
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                var response = await httpClient.PostAsJsonAsync(apiUrl, requestBody);

                var requestXML = JsonConvert.SerializeObject(requestBody); // Serialize request body

                var responseXML = await response.Content.ReadAsStringAsync(); // Deserialize response body

                //save this request response over db
                // Log the OTP submission request and response data using the repository function
                await userMasterRepository.LogAPICallDataAsync(apiUrl, "POST",
                    requestXML, responseXML, response.StatusCode, response.IsSuccessStatusCode, candidateId);

                // Parse the response into the PanApiResponse model
                var apiResponse = await response.Content.ReadFromJsonAsync<PanApiResponse>();



                if (!response.IsSuccessStatusCode)
                {
                    if (apiResponse != null && apiResponse.Data?.Status == "invalid")
                    {
                        modelResponse.Message = "Invalid PAN No.Please ensure to give correct PAN No.";
                    }
                    else
                    {
                        modelResponse.Message = "PAN No Not Verified";
                    }
                    modelResponse.IsSuccess = false;

                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                if (apiResponse?.Success != true)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = apiResponse?.Message ?? "PAN verification failed";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Assuming the API gives us PAN-relevant data back from the response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "PAN No Verified Successfully";
                modelResponse.StatusCode = 200;

                var panData = new
                {
                    PanNo = apiResponse.Data?.PanNumber,
                    FullName = apiResponse.Data?.FullName,
                    Category = apiResponse.Data?.Category,
                    Dob = apiResponse.Data?.Dob
                };

                modelResponse.Data = panData;

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

        [Route("verify-pan/PAN")]
        public async Task<IActionResult> InsertPANAsync([FromForm] PANModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid PAN data." });

                if (string.IsNullOrWhiteSpace(model.PANNo) ||
                    model.PANNo.Length != 10)
                    return BadRequest(new { message = "PAN number must be 10 characters." });

                if (!DateTime.TryParse(model.PANDob, out _))
                    return BadRequest(new { message = "Invalid Date of Birth." });

                if (string.IsNullOrWhiteSpace(model.PANName))
                    return BadRequest(new { message = "Name is required." });

                // ============================
                // FILE: PanCard
                // ============================
                if (model.PanCardFile != null && model.PanCardFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.PanCardFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.PanCard = await _fileService.SaveFileAsync(model.PanCardFile);
                }



                model.PanCardFile = null;

                // ============================
                // CALL REPOSITORY
                // ============================
                bool isInserted = await userMasterRepository.InsertPANAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "PAN verified successfully." : "PAN verification failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return StatusCode(500, response);
            }
        }


        [HttpGet("GetPanById")]

        public async Task<IActionResult> GetPanByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                PANModel result = await userMasterRepository.GetPanByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid record ID.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Aadhaar detail retrieved successfully.";
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


        [HttpPost("BasicInfo")]

        public async Task<IActionResult> InsertBasicInfoAsync([FromForm] BasicInfoModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            var candidateId = HttpContext.Items["CandidateId"]?.ToString();

            request.pk_recId = candidateId;
            try
            {
                if (string.IsNullOrEmpty(request.pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required";
                    return BadRequest(modelResponse);
                }


                if (request.ProfileImageFile != null && request.ProfileImageFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(request.ProfileImageFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    request.Photo = await _fileService.SaveFileAsync(request.ProfileImageFile);
                }

                request.ProfileImageFile = null;

                bool isSaved = await userMasterRepository.InsertBasicInfoAsync(
                    request.pk_recId,
                    request.StateId,
                    request.CityId,
                    request.Pincode,
                    request.Address,
                    request.Photo
                );

                modelResponse.IsSuccess = isSaved;
                modelResponse.Message = isSaved ? "Basic information saved." : "Failed to save.";
                modelResponse.StatusCode = isSaved ? 200 : 400;


                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }



        [HttpGet("BasicInfoById")]

        public async Task<IActionResult> GetBasicInfoByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            var candidateId = HttpContext.Items["CandidateId"]?.ToString();

            var pk_recId = candidateId;
            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }
                BasicInfoModel result = await userMasterRepository.GetBasicInfoByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid record ID.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "BasicInfo detail retrieved successfully.";
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


        //stateDDl


        [HttpGet("dropdownList/{fieldName}")]

        public async Task<IActionResult> GetDropdownListAsync([FromRoute] string fieldName)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(fieldName))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "FieldName and FieldValue are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {



                if (string.IsNullOrWhiteSpace(fieldName))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Field Name is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                var result = await generalRepository.GetDropdownListAsync(fieldName, "GU-10", "GU-1"); //deliveryplus company send companyid and userid


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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





        [HttpGet("CityDropdownList/{StateId}")]

        public async Task<IActionResult> GetCityDropdownListAsync([FromRoute] string StateId)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(StateId))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "StateId are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {


                var result = await cityRepository.GetCityDropdownListAsync(StateId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        //image


        [HttpGet("images/{imageName}")]

        public async Task<IActionResult> GetImageByUserIdAsync(string imageName)
        {
            var modelResponse = new ModelResponse();


            try
            {



                // Define the path to the folder where images are stored (based on decrypted user ID)
                //string imageFolderPath = Path.Combine(@"C:\Users\admin\Documents\Empower Logics\Uploads\" + encryptedUserId);
                string imageFolderPath = Path.Combine(_appSettings.UploadsFolderPath);


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
                var mimeType = GetMimeTypeOnboard(imagePath);

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


        [HttpGet("logoimages/{imageName}")]

        public async Task<IActionResult> GetLogoImageByUserIdAsync(string imageName)
        {
            var modelResponse = new ModelResponse();


            try
            {



                // Define the path to the folder where images are stored (based on decrypted user ID)
                //string imageFolderPath = Path.Combine(@"C:\Users\admin\Documents\Empower Logics\Uploads\" + encryptedUserId);
                string imageFolderPath = Path.Combine(_appSettings.CompanyLogoFolderPath);


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
                var mimeType = GetMimeTypeOnboard(imagePath);

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


        private string GetMimeTypeOnboard(string filePath)
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


        //[HttpGet("get-mandatory-settings")]
        //public async Task<IActionResult> GetMandatorySettings()
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        //  Get candidate ID from middleware context
        //        var candidateId = HttpContext.Items["CandidateId"]?.ToString();

        //        if (string.IsNullOrEmpty(candidateId))
        //        {
        //            return Ok(new
        //            {
        //                isSuccess = false,
        //                message = "Invalid candidate",
        //                statusCode = 401
        //            });
        //        }

        //        // Pass candidate ID to get their company's config
        //        var config = await _candidateExperienceDetailsRepository.GetMandatorySettings(candidateId);

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Company config retrieved successfully.";
        //        modelResponse.Data = new
        //        {
        //            panMandatory = config.pan_mandatory,
        //            aadhaarMandatory = config.aadhaar_mandatory
        //        };
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


        //[HttpGet("get-mandatory-settings")]
        //public async Task<IActionResult> GetMandatorySettings()
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        // Get candidate ID from middleware context
        //        var candidateId = HttpContext.Items["CandidateId"]?.ToString();
        //        if (string.IsNullOrEmpty(candidateId))
        //        {
        //            return Ok(new
        //            {
        //                isSuccess = false,
        //                message = "Invalid candidate",
        //                statusCode = 401
        //            });
        //        }

        //        // Pass candidate ID to get their company's config
        //        var config = await _candidateExperienceDetailsRepository.GetMandatorySettings(candidateId);

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Company config retrieved successfully.";
        //        modelResponse.Data = new
        //        {
        //            // Mandatory fields
        //            panMandatory = config.pan_mandatory,
        //            aadhaarMandatory = config.aadhaar_mandatory,
        //            basicInfoMandatory = config.basicinfo_mandatory,
        //            qualificationMandatory = config.qualification_mandatory,
        //            experienceMandatory = config.experience_mandatory,
        //            familyMandatory = config.family_mandatory,
        //            voterMandatory = config.voter_mandatory,
        //            bankAccountMandatory = config.bankaccount_mandatory,

        //            // Verification fields
        //            panVerification = config.pan_verification,
        //            aadhaarVerification = config.aadhaar_verification,
        //            voterVerification = config.voter_verification,
        //            bankAccountVerification = config.bankaccount_verification
        //        };
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

        [HttpGet("get-mandatory-settings")]
        public async Task<IActionResult> GetMandatorySettings()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();
                if (string.IsNullOrEmpty(candidateId))
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = "Invalid candidate",
                        statusCode = 401
                    });
                }

                var config = await _candidateExperienceDetailsRepository.GetMandatorySettings(candidateId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Company config retrieved successfully.";
                modelResponse.Data = new
                {
                    // Mandatory fields
                    photographLivecapture = config.photograph_livecapture,
                    panMandatory = config.pan_mandatory,
                    aadhaarMandatory = config.aadhaar_mandatory,
                    basicInfoMandatory = config.basicinfo_mandatory,
                    qualificationMandatory = config.qualification_mandatory,
                    experienceMandatory = config.experience_mandatory,
                    familyMandatory = config.family_mandatory,
                    voterMandatory = config.voter_mandatory,
                    bankAccountMandatory = config.bankaccount_mandatory,
                    drivingLicenceMandatory = config.driving_licence_mandatory,
                    vehicleInsuranceMandatory = config.vehicle_insurance_mandatory,
                    vehicleRCMandatory = config.vehicle_rc_mandatory,
                    vendorGstMandatory = config.vendor_gst_mandatory,
                    signatureMandatory = config.signature_mandatory,
                    photographMandatory = config.photograph_mandatory,
                    eshramMandatory = config.eshram_mandatory,
                    ayushmanMandatory = config.ayushman_mandatory,

                    // Verification fields
                    panVerification = config.pan_verification,
                    aadhaarVerification = config.aadhaar_verification,
                    voterVerification = config.voter_verification,
                    bankAccountVerification = config.bankaccount_verification,
                    eshramVerification = config.eshram_verification,
                    ayushmanVerification = config.ayushman_verification,

                    // Visibility fields (NEW)
                    panVisible = config.pan_visible,
                    aadhaarVisible = config.aadhaar_visible,
                    basicInfoVisible = config.basicinfo_visible,
                    qualificationVisible = config.qualification_visible,
                    experienceVisible = config.experience_visible,
                    familyVisible = config.family_visible,
                    voterVisible = config.voter_visible,
                    bankAccountVisible = config.bankaccount_visible,
                    drivingLicenceVisible = config.driving_licence_visible,
                    vehicleInsuranceVisible = config.vehicle_insurance_visible,
                    vehicleRCVisible = config.vehicle_rc_visible,
                    vendorGstVisible = config.vendor_gst_visible,
                    signatureVisible = config.signature_visible,
                    photographVisible = config.photograph_visible,
                    eshramVisible = config.eshram_visible,
                    ayushmanVisible = config.ayushman_visible,

                    lifeinsuranceMandatory = config.lifeinsurance_mandatory,
                    lifeinsuranceVerification = config.lifeinsurance_verification,
                    lifeinsuranceVisible = config.lifeinsurance_visible,

                    // OCR & Branding
                    panOcr = config.pan_ocr,
                    aadhaarOcr = config.aadhaar_ocr,
                    voterOcr = config.voter_ocr,
                    is_stamp = config.is_stamp,
                    companyLogo = config.Company_LogoPath,
                    companyName = config.compname
                };
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

        // LIFE INSURANCE ENDPOINTS
        [HttpPost]
        [Route("LifeInsurance")]
        public async Task<IActionResult> InsertLifeInsuranceAsync([FromForm] LifeInsuranceModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Life Insurance data." });

                if (string.IsNullOrWhiteSpace(model.LifeInsurance_No))
                    return BadRequest(new { message = "Policy Number is required." });

                if (model.LifeInsurance_PhotoFile != null && model.LifeInsurance_PhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.LifeInsurance_PhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed." });

                    model.LifeInsurance_Photo = await _fileService.SaveFileAsync(model.LifeInsurance_PhotoFile);
                }

                model.LifeInsurance_PhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertLifeInsuranceAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Life Insurance details saved successfully." : "Failed to save Life Insurance details.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }

        [HttpGet("GetLifeInsuranceById")]
        public async Task<IActionResult> GetLifeInsuranceByIdAsync()
        {
            var modelResponse = new ModelResponse();
            try
            {
                var pk_recId = HttpContext.Items["CandidateId"]?.ToString();
                if (string.IsNullOrEmpty(pk_recId))
                {
                    return Ok(new { isSuccess = false, message = "Invalid candidate", statusCode = 401 });
                }

                LifeInsuranceModel result = await _candidateExperienceDetailsRepository.GetLifeInsuranceByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Life Insurance detail not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Life Insurance detail retrieved successfully.";
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


        /// <summary>
        /// Get candidate's complete onboarding summary for final review
        /// </summary>
        [HttpGet("final-summary")]
        public async Task<IActionResult> GetFinalSummary()
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

                var summary = await _candidateExperienceDetailsRepository.GetCandidateFinalSummary(candidateId);

                if (summary == null || summary.BasicInfo == null)
                {
                    return NotFound(new
                    {
                        isSuccess = false,
                        message = "Candidate details not found",
                        statusCode = 404
                    });
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Final summary retrieved successfully.";
                modelResponse.Data = summary;
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
        //FAMILY



        [HttpGet("FamilyGetall")]
        public async Task<IActionResult> GetAllCandidateFamilyDetails(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var (totalCount, result) = await _candidateExperienceDetailsRepository.GetAllFamily(pageIndex, pageSize, candidateId);

                if (!result.Any())
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "No records found.";
                    modelResponse.Data = new List<CandidateFamilyDetails>();
                    modelResponse.TotalCount = 0;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate Family Details List retrieved successfully.";
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

        [HttpGet("GetByIdFamily/{pk_familyid}")]
        public async Task<IActionResult> GetByIdFamily([FromRoute] long pk_familyid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                CandidateFamilyDetails result = await _candidateExperienceDetailsRepository.GetByIdFamily(pk_familyid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid pk_familyid";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                if (result.fk_recId != candidateId)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this record.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate Family detail retrieved successfully.";
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

        [HttpPost("AddFamily")]
        public async Task<IActionResult> InsertCandidateFamilyAsync([FromForm] CandidateFamilyDetails candidateFamilyDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                candidateFamilyDataSet.fk_recId = candidateId;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertCandidateFamily(candidateFamilyDataSet);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Family details added successfully!" : "Failed to add family details.";
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

        [HttpPut("updateFamily")]
        public async Task<IActionResult> UpdateCandidateFamilyAsync([FromForm] CandidateFamilyDetails candidateFamilyDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var existingRecord = await _candidateExperienceDetailsRepository.GetByIdFamily(candidateFamilyDataSet.pk_familyid ?? 0);
                if (existingRecord == null || existingRecord.fk_recId != candidateId)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this record.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                candidateFamilyDataSet.fk_recId = candidateId;

                bool isUpdated = await _candidateExperienceDetailsRepository.UpdateCandidateFamilyDetailsAsync(candidateFamilyDataSet);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Family details updated successfully!" : "Failed to update family details.";
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

        [HttpDelete("deleteFamily{pk_familyid}")]
        public async Task<IActionResult> DeleteCandidateFamilyAsync([FromRoute] long pk_familyid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var candidateId = HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrEmpty(candidateId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid candidate session. Please use the link sent to your email.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var existingRecord = await _candidateExperienceDetailsRepository.GetByIdFamily(pk_familyid);
                if (existingRecord == null || existingRecord.fk_recId != candidateId)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized access to this record.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                bool isDeleted = await _candidateExperienceDetailsRepository.DeleteCandidateFamilyAsync(pk_familyid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Family detail deleted successfully." : "Failed to delete family detail.";
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






        // BANK VERIFICATION CONTROLLER

        [HttpPost]
        [Route("verify-bank/Bank")]
        public async Task<IActionResult> InsertBankAsync([FromForm] BankModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Bank data." });

                if (string.IsNullOrWhiteSpace(model.BankName) ||
                    string.IsNullOrWhiteSpace(model.AccountNo) ||
                    string.IsNullOrWhiteSpace(model.IFSCCode) ||
                    string.IsNullOrWhiteSpace(model.BranchName))
                    return BadRequest(new { message = "All bank fields are required." });

                // File: Passbook Photo
                if (model.PassbookPhotoFile != null && model.PassbookPhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.PassbookPhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.PassbookPhoto = await _fileService.SaveFileAsync(model.PassbookPhotoFile);
                }

                model.PassbookPhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertBankAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Bank details saved successfully." : "Bank verification failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return StatusCode(500, response);
            }
        }

        [HttpGet("GetBankById")]
        public async Task<IActionResult> GetBankByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                BankModel result = await _candidateExperienceDetailsRepository.GetBankByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid record ID.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Bank detail retrieved successfully.";
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

        // VOTER VERIFICATION CONTROLLER

        [HttpPost]
        [Route("verify-voter/Voter")]
        public async Task<IActionResult> InsertVoterAsync([FromForm] VoterModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Voter data." });

                if (string.IsNullOrWhiteSpace(model.VoterNo) ||
                    string.IsNullOrWhiteSpace(model.VoterName) ||
                    string.IsNullOrWhiteSpace(model.VoterAddress))
                    return BadRequest(new { message = "Voter number, name and address are required." });

                if (!DateTime.TryParse(model.VoterDOB, out _))
                    return BadRequest(new { message = "Invalid Date of Birth." });

                // File: Voter Front Photo
                if (model.VoterFrontPhotoFile != null && model.VoterFrontPhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.VoterFrontPhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.VoterFrontPhoto = await _fileService.SaveFileAsync(model.VoterFrontPhotoFile);
                }

                // File: Voter Back Photo
                if (model.VoterBackPhotoFile != null && model.VoterBackPhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.VoterBackPhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.VoterBackPhoto = await _fileService.SaveFileAsync(model.VoterBackPhotoFile);
                }

                model.VoterFrontPhotoFile = null;
                model.VoterBackPhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertVoterAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Voter details saved successfully." : "Voter verification failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return StatusCode(500, response);
            }
        }

        [HttpGet("GetVoterById")]
        public async Task<IActionResult> GetVoterByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                VoterModel result = await _candidateExperienceDetailsRepository.GetVoterByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid record ID.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Voter detail retrieved successfully.";
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


        //new added

        // DRIVING LICENCE ENDPOINTS


        // VENDOR GST ENDPOINTS
        [HttpPost]
        [Route("verify-vendor-gst/VendorGST")]
        public async Task<IActionResult> InsertVendorGSTAsync([FromForm] VendorGSTModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Vendor GST data." });

                if (model.GSTPhotoFile != null && model.GSTPhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.GSTPhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed." });

                    model.GSTPhoto = await _fileService.SaveFileAsync(model.GSTPhotoFile);
                }

                model.GSTPhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertVendorGSTAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Vendor GST details saved successfully." : "Vendor GST details save failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return StatusCode(500, response);
            }
        }

        [HttpGet("GetVendorGSTById")]
        public async Task<IActionResult> GetVendorGSTByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                VendorGSTModel result = await _candidateExperienceDetailsRepository.GetVendorGSTByIdAsync(pk_recId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor GST details retrieved successfully.";
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

        // SIGNATURE ENDPOINTS
        [HttpPost]
        [Route("verify-signature/Signature")]
        public async Task<IActionResult> InsertSignatureAsync([FromForm] SignatureModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Signature data." });

                if (model.SignaturePhotoFile != null && model.SignaturePhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.SignaturePhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.SignaturePhoto = await _fileService.SaveFileAsync(model.SignaturePhotoFile);
                }

                model.SignaturePhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertSignatureAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Signature saved successfully." : "Signature save failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return StatusCode(500, response);
            }
        }

        [HttpGet("GetSignatureById")]
        public async Task<IActionResult> GetSignatureByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                SignatureModel result = await _candidateExperienceDetailsRepository.GetSignatureByIdAsync(pk_recId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Signature retrieved successfully.";
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

        // PHOTOGRAPH ENDPOINTS
        [HttpPost]
        [Route("verify-photograph/Photograph")]
        public async Task<IActionResult> InsertPhotographAsync([FromForm] PhotographModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Photograph data." });

                if (model.PhotoFile != null && model.PhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.PhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG allowed." });

                    model.Photo = await _fileService.SaveFileAsync(model.PhotoFile);
                }

                model.PhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertPhotographAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Photograph saved successfully." : "Photograph save failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return StatusCode(500, response);
            }
        }

        [HttpGet("GetPhotographById")]
        public async Task<IActionResult> GetPhotographByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                PhotographModel result = await _candidateExperienceDetailsRepository.GetPhotographByIdAsync(pk_recId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Photograph retrieved successfully.";
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

        [HttpGet("GetVendorAgreementDetails")]
        public async Task<IActionResult> GetVendorAgreementDetailsAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                VendorAgreementDetailsDto result = await _candidateExperienceDetailsRepository.GetVendorAgreementDetails(pk_recId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor agreement details retrieved successfully.";
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



        //added code 16 sept starts -shiv
        /// </summary>
        [HttpGet("download-onboarding-pdf")]
        [HttpGet("download-onboarding-pdf/{candidateId}")]
        public async Task<IActionResult> DownloadOnboardingPdf(string? candidateId = null)
        {
            try
            {
                var targetCandidateId = !string.IsNullOrWhiteSpace(candidateId)
                    ? candidateId
                    : HttpContext.Items["CandidateId"]?.ToString();

                if (string.IsNullOrWhiteSpace(targetCandidateId))
                {
                    return Unauthorized(new { isSuccess = false, message = "Candidate ID or valid session key is required", statusCode = 401 });
                }

                var summary = await _candidateExperienceDetailsRepository.GetCandidateFinalSummary(targetCandidateId);
                if (summary == null || summary.BasicInfo == null)
                {
                    return NotFound(new { isSuccess = false, message = "Candidate details not found", statusCode = 404 });
                }

                var dlData = await _candidateExperienceDetailsRepository.GetDrivingLicenceByIdAsync(targetCandidateId);
                var config = await _candidateExperienceDetailsRepository.GetMandatorySettings(targetCandidateId);
                var pdfBytes = GenerateOnboardingPdfBytes(summary, dlData, config);

                string safeName = (summary.BasicInfo.candidate_name ?? "Candidate").Replace(" ", "_");
                string fileName = $"Onboarding_{safeName}_{DateTime.Now:yyyyMMdd}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = $"Failed to generate PDF: {ex.Message}", statusCode = 500 });
            }
        }

        #region Onboarding PDF Generation (iTextSharp)

        // ---- Unified resume-style palette (matches the Word onboarding template) ----
        private static readonly BaseColor PdfNavy = new BaseColor(31, 42, 68);        // #1F2A44 - all section bars
        private static readonly BaseColor PdfGold = new BaseColor(184, 134, 46);      // #B8862E - accents / status
        private static readonly BaseColor PdfBlack = new BaseColor(20, 20, 20);       // #141414 - agreement title bar
        private static readonly BaseColor PdfBadgeGrey = new BaseColor(58, 58, 58);   // #3A3A3A - agreement badge chip
        private static readonly BaseColor PdfHeaderRowBg = new BaseColor(245, 246, 248); // #F5F6F8 - table header rows
        private static readonly BaseColor PdfRuleGrey = new BaseColor(217, 217, 217);   // #D9D9D9 - thin rules
        private static readonly BaseColor PdfPillBlue = new BaseColor(59, 111, 224);    // #3B6FE0 - Model/rate-type chip
        private static readonly BaseColor PdfActiveGreen = new BaseColor(30, 142, 62);  // #1E8E3E - "Active" status text
        private static readonly BaseColor PdfBorderColor = new BaseColor(228, 232, 240); // #E4E8F0
        private static readonly BaseColor PdfLightBg = new BaseColor(248, 249, 252);     // #F8F9FC - zebra row
        private static readonly BaseColor PdfLabelColor = new BaseColor(107, 114, 128);  // #6B7280
        private static readonly BaseColor PdfValueColor = new BaseColor(31, 41, 55);     // #1F2937

        private byte[] GenerateOnboardingPdfBytes(CandidateFinalSummary summary, DrivingLicenceModel? dlData, CompanyConfig? config)
        {
            using var memoryStream = new MemoryStream();
            var document = new Document(PageSize.A4, 18f, 18f, 26f, 18f);
            var writer = PdfWriter.GetInstance(document, memoryStream);

            string candidateName = summary?.BasicInfo?.candidate_name ?? "Candidate";
            string todayDate = DateTime.Now.ToString("dd MMM yyyy", CultureInfo.InvariantCulture);

            var pageEvent = new OnboardingPageEvent(candidateName, todayDate);
            writer.PageEvent = pageEvent;

            document.Open();

            int sectionNo = 1;

            // 1. Personal Information — rendered as a navy resume-style banner
            if (config == null || config.basicinfo_visible)
            {
                RenderPersonalInfoSection(document, summary?.BasicInfo, sectionNo++);
            }

            // 2. Aadhaar Details
            if ((config == null || config.aadhaar_visible) && summary?.AadhaarDetails != null)
            {
                RenderAadhaarSection(document, summary.AadhaarDetails, sectionNo++);
            }

            // 3. PAN Details
            if ((config == null || config.pan_visible) && summary?.PANDetails != null)
            {
                RenderPanSection(document, summary.PANDetails, sectionNo++);
            }

            // 4. Education
            if ((config == null || config.qualification_visible) && summary?.Qualifications?.Any() == true)
            {
                RenderQualificationsSection(document, summary.Qualifications, sectionNo++);
            }

            // 5. Experience
            if ((config == null || config.experience_visible) && summary?.Experience?.Any() == true)
            {
                RenderExperienceSection(document, summary.Experience, sectionNo++);
            }

            // 6. Family Details
            if ((config == null || config.family_visible) && summary?.Family?.Any() == true)
            {
                RenderFamilySection(document, summary.Family, sectionNo++);
            }

            // 7. Bank Details
            if ((config == null || config.bankaccount_visible) && summary?.BankDetails != null)
            {
                RenderBankSection(document, summary.BankDetails, sectionNo++);
            }

            // 8. Voter Details
            if ((config == null || config.voter_visible) && summary?.VoterDetails != null)
            {
                RenderVoterSection(document, summary.VoterDetails, sectionNo++);
            }

            // 9. E-Shram & Ayushman Bharat Details (Combined in one row, no status, respects visibility)
            bool eshramVis = (config == null || config.eshram_visible) && (!string.IsNullOrWhiteSpace(summary?.BasicInfo?.Eshram_UAN) || !string.IsNullOrWhiteSpace(summary?.BasicInfo?.Eshram_Photo));
            bool ayushmanVis = (config == null || config.ayushman_visible) && (!string.IsNullOrWhiteSpace(summary?.BasicInfo?.Ayushman_PMJAY_ID) || !string.IsNullOrWhiteSpace(summary?.BasicInfo?.Ayushman_Photo));
            if (eshramVis || ayushmanVis)
            {
                RenderEShramAndAyushmanSection(document, summary?.BasicInfo, eshramVis, ayushmanVis, sectionNo++);
            }

            // 10. Driving Licence & Vehicle Verification (strictly respects visibility)
            bool dlCardVisible = (config == null || config.driving_licence_visible);
            bool showDL = dlCardVisible;
            bool showInsurance = (config == null || config.vehicle_insurance_visible);
            bool showRC = (config == null || config.vehicle_rc_visible);

            string dlNo = showDL ? (dlData?.DLNo ?? summary?.BasicInfo?.DLNo ?? "") : "";
            string dlPhoto = showDL ? (dlData?.DLPhoto ?? summary?.BasicInfo?.DLPhoto ?? "") : "";
            string insNo = showInsurance ? (dlData?.Vehicle_Insurance_No ?? "") : "";
            string insPhoto = showInsurance ? (dlData?.Vehicle_Insurance_Photo ?? "") : "";
            string rcNo = showRC ? (dlData?.Vehicle_RC_No ?? "") : "";
            string rcPhoto = showRC ? (dlData?.Vehicle_RC_Photo ?? "") : "";

            bool hasDLData = !string.IsNullOrWhiteSpace(dlNo) || !string.IsNullOrWhiteSpace(dlPhoto) ||
                             !string.IsNullOrWhiteSpace(insNo) || !string.IsNullOrWhiteSpace(insPhoto) ||
                             !string.IsNullOrWhiteSpace(rcNo) || !string.IsNullOrWhiteSpace(rcPhoto);

            if (dlCardVisible && hasDLData)
            {
                RenderDrivingLicenceAndVehicleSection(document, dlNo, dlPhoto, insNo, insPhoto, rcNo, rcPhoto, showDL, showInsurance, showRC, sectionNo++);
            }

            // 11. Vendor GST Details
            if ((config == null || config.vendor_gst_visible) && summary?.VendorGstDetails != null)
            {
                RenderVendorGstSection(document, summary.VendorGstDetails, sectionNo++);
            }

            // 12. Signature & Photograph (strictly respects visibility)
            bool sigVisible = (config == null || config.signature_visible);
            bool photoVisible = (config == null || config.photograph_visible);
            if (sigVisible || photoVisible)
            {
                string? sigFile = sigVisible ? summary?.VendorAgreement?.SignaturePhoto : null;
                string? photoFile = photoVisible ? summary?.BasicInfo?.Photo : null;
                RenderSignatureAndPhotoSection(document, sigFile, photoFile, sigVisible, photoVisible, sectionNo++);
            }

            // 14. Service Agreement (Vendors Only)
            bool isVendor = (summary?.BasicInfo?.OnboardFormStatusId == 2) ||
                            (!string.IsNullOrWhiteSpace(summary?.BasicInfo?.Vendor_Code)) ||
                            (summary?.VendorAgreement != null);

            if (isVendor)
            {
                document.NewPage();
                RenderVendorAgreementSection(document, summary?.VendorAgreement, summary?.VendorActiveRateCards, candidateName, todayDate, summary?.BasicInfo, config);
            }

            document.Close();
            return memoryStream.ToArray();
        }

        // ---- Resume-style navy header banner (replaces the old plain "Personal Information" block) ----
        private void RenderPersonalInfoSection(Document doc, OnboardCandidateBasicInfo? info, int sectionNo)
        {
            if (info == null) return;

            var bannerTable = new PdfPTable(2) { WidthPercentage = 100f, SpacingAfter = 5f };
            bannerTable.SetWidths(new float[] { 16f, 84f });

            // Photo cell — navy background, small square photo like the resume header
            var photoCell = new PdfPCell
            {
                Border = Rectangle.NO_BORDER,
                BackgroundColor = PdfNavy,
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 6f,
                PaddingLeft = 8f
            };
            Image? profileImg = TryLoadPdfImage(info.Photo, 52f, 52f);
            if (profileImg != null)
            {
                photoCell.AddElement(profileImg);
            }
            else
            {
                var initialPara = new Paragraph((info.candidate_name?.FirstOrDefault().ToString() ?? "C").ToUpper(),
                    FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.WHITE))
                {
                    Alignment = Element.ALIGN_CENTER
                };
                photoCell.AddElement(initialPara);
            }
            bannerTable.AddCell(photoCell);

            // Name / role / contact strip cell — navy background, white + gold text
            var detailsCell = new PdfPCell
            {
                Border = Rectangle.NO_BORDER,
                BackgroundColor = PdfNavy,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 7f
            };

            var namePara = new Paragraph((info.candidate_name ?? "N/A").ToUpper(),
                FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 13.5f, BaseColor.WHITE))
            {
                SpacingAfter = 2f
            };
            detailsCell.AddElement(namePara);

            string roleLine = "Delivery Associate  •  Contract Basis";
            detailsCell.AddElement(new Paragraph(roleLine, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8f, PdfGold)) { SpacingAfter = 2f });

            string contactLine = $"Mobile: {info.mobile ?? "N/A"}    City: {info.CityName ?? "N/A"}    " +
                                  $"Vendor Code: {info.Vendor_Code ?? "N/A"}    Generated: {DateTime.Now:dd MMM yyyy}";
            detailsCell.AddElement(new Paragraph(contactLine, FontFactory.GetFont(FontFactory.HELVETICA, 7f, new BaseColor(232, 232, 232))));

            bannerTable.AddCell(detailsCell);
            doc.Add(bannerTable);

            // Section header + field grid (all original fields kept, just placed under the banner)
            AddPdfSectionHeader(doc, sectionNo.ToString("00"), "PERSONAL INFORMATION");

            var gridTable = new PdfPTable(3) { WidthPercentage = 100f, SpacingAfter = 4f };
            gridTable.SetWidths(new float[] { 34f, 33f, 33f });

            AddPdfKeyValueCell(gridTable, "Mobile", info.mobile ?? "N/A");
            AddPdfKeyValueCell(gridTable, "Email", info.email ?? "N/A");
            AddPdfKeyValueCell(gridTable, "Vendor Code", info.Vendor_Code ?? "N/A");
            AddPdfKeyValueCell(gridTable, "Pincode", info.Pincode ?? "N/A");
            AddPdfKeyValueCell(gridTable, "State", info.StateName ?? "N/A");
            AddPdfKeyValueCell(gridTable, "City", info.CityName ?? "N/A");
            if (!string.IsNullOrWhiteSpace(info.OnboardFormStatus))
            {
                AddPdfKeyValueCell(gridTable, "Form Status", info.OnboardFormStatus);
                AddPdfKeyValueCell(gridTable, "Candidate ID", info.pk_recId ?? "N/A");
                // pad the row to a multiple of 3 so the grid stays aligned
                var padCell = new PdfPCell { Border = Rectangle.NO_BORDER };
                gridTable.AddCell(padCell);
            }

            var addrCell = new PdfPCell { Colspan = 3, Border = Rectangle.NO_BORDER, Padding = 2f };
            addrCell.AddElement(new Phrase("Address", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7f, PdfLabelColor)));
            addrCell.AddElement(new Phrase(info.Address ?? "N/A", FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, PdfValueColor)));
            gridTable.AddCell(addrCell);

            doc.Add(gridTable);
        }

        private void RenderAadhaarSection(Document doc, OnboardCandidateAadhaarDetails? aadhaar, int sectionNo)
        {
            if (aadhaar == null) return;

            AddPdfSectionHeader(doc, sectionNo.ToString("00"), "IDENTITY DOCUMENTS — AADHAAR");

            var infoTable = new PdfPTable(3) { WidthPercentage = 100f, SpacingAfter = 3f };
            infoTable.SetWidths(new float[] { 34f, 33f, 33f });

            string maskedAadhaar = !string.IsNullOrEmpty(aadhaar.AadhaarNo) && aadhaar.AadhaarNo.Length >= 12
                ? $"XXXX-XXXX-{aadhaar.AadhaarNo.Substring(aadhaar.AadhaarNo.Length - 4)}"
                : (aadhaar.AadhaarNo ?? "N/A");

            AddPdfKeyValueCell(infoTable, "Aadhaar Number", maskedAadhaar);
            AddPdfKeyValueCell(infoTable, "Name on Aadhaar", aadhaar.AadhaarName ?? "N/A");
            AddPdfKeyValueCell(infoTable, "Date of Birth", FormatPdfDate(aadhaar.AadhaarDob));

            if (!string.IsNullOrWhiteSpace(aadhaar.AadhaarAddress))
            {
                var addrCell = new PdfPCell { Colspan = 3, Border = Rectangle.NO_BORDER, Padding = 2f };
                addrCell.AddElement(new Phrase("Aadhaar Address", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6.5f, PdfLabelColor)));
                addrCell.AddElement(new Phrase(aadhaar.AadhaarAddress, FontFactory.GetFont(FontFactory.HELVETICA, 7f, PdfValueColor)));
                infoTable.AddCell(addrCell);
            }

            doc.Add(infoTable);

            // Render Candidate and Father Aadhaar Images (all 4 if available) — small bordered thumbnails
            RenderAadhaarImages(doc, aadhaar.AadhaarFront, aadhaar.AadhaarBack, aadhaar.FatherAadhaarFront, aadhaar.FatherAadhaarBack);
        }

        private void RenderPanSection(Document doc, OnboardCandidatePANDetails? pan, int sectionNo)
        {
            if (pan == null) return;

            AddPdfSectionHeader(doc, sectionNo.ToString("00"), "PAN DETAILS");

            var infoTable = new PdfPTable(3) { WidthPercentage = 100f, SpacingAfter = 3f };
            infoTable.SetWidths(new float[] { 34f, 33f, 33f });

            AddPdfKeyValueCell(infoTable, "PAN Number", pan.PANNo ?? "N/A");
            AddPdfKeyValueCell(infoTable, "Name on PAN", pan.PANName ?? "N/A");
            AddPdfKeyValueCell(infoTable, "Date of Birth", FormatPdfDate(pan.PANDob));

            doc.Add(infoTable);

            if (!string.IsNullOrWhiteSpace(pan.PanCard))
            {
                RenderSinglePdfImage(doc, pan.PanCard, "PAN Card Document");
            }
        }

        private void RenderQualificationsSection(Document doc, List<OnboardCandidateQualificationDetails> qualifications, int sectionNo)
        {
            AddPdfSectionHeader(doc, sectionNo.ToString("00"), $"EDUCATION ({qualifications.Count})");

            var table = new PdfPTable(6) { WidthPercentage = 100f, SpacingAfter = 4f };
            table.SetWidths(new float[] { 8f, 24f, 22f, 26f, 10f, 10f });

            AddPdfTableHeaderCell(table, "Sr.");
            AddPdfTableHeaderCell(table, "Qualification");
            AddPdfTableHeaderCell(table, "Subject");
            AddPdfTableHeaderCell(table, "Institute / Board");
            AddPdfTableHeaderCell(table, "Year");
            AddPdfTableHeaderCell(table, "Marks");

            int idx = 1;
            foreach (var q in qualifications)
            {
                BaseColor rowBg = (idx % 2 == 0) ? PdfLightBg : BaseColor.WHITE;
                AddPdfTableCell(table, idx.ToString(), rowBg, Element.ALIGN_CENTER);
                AddPdfTableCell(table, q.qualification ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, q.subject ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, q.institute ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, q.passyear?.ToString() ?? "-", rowBg, Element.ALIGN_CENTER);
                AddPdfTableCell(table, q.marks.HasValue ? $"{q.marks}%" : "-", rowBg, Element.ALIGN_CENTER);
                idx++;
            }

            doc.Add(table);
        }

        private void RenderExperienceSection(Document doc, List<OnboardCandidateExperienceDetails> experience, int sectionNo)
        {
            AddPdfSectionHeader(doc, sectionNo.ToString("00"), $"EXPERIENCE ({experience.Count})");

            var table = new PdfPTable(6) { WidthPercentage = 100f, SpacingAfter = 4f };
            table.SetWidths(new float[] { 8f, 26f, 22f, 15f, 15f, 14f });

            AddPdfTableHeaderCell(table, "Sr.");
            AddPdfTableHeaderCell(table, "Company");
            AddPdfTableHeaderCell(table, "Designation");
            AddPdfTableHeaderCell(table, "From");
            AddPdfTableHeaderCell(table, "To");
            AddPdfTableHeaderCell(table, "CTC (Rs.)");

            int idx = 1;
            foreach (var e in experience)
            {
                BaseColor rowBg = (idx % 2 == 0) ? PdfLightBg : BaseColor.WHITE;
                AddPdfTableCell(table, idx.ToString(), rowBg, Element.ALIGN_CENTER);
                AddPdfTableCell(table, e.compname ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, e.designation ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, FormatPdfDate(e.fromdate), rowBg, Element.ALIGN_CENTER);
                AddPdfTableCell(table, FormatPdfDate(e.todate), rowBg, Element.ALIGN_CENTER);
                AddPdfTableCell(table, e.ctc.HasValue ? e.ctc.Value.ToString("N0", new CultureInfo("en-IN")) : "-", rowBg, Element.ALIGN_RIGHT);
                idx++;
            }

            doc.Add(table);
        }

        private void RenderFamilySection(Document doc, List<OnboardCandidateFamilyDetails> family, int sectionNo)
        {
            AddPdfSectionHeader(doc, sectionNo.ToString("00"), $"FAMILY DETAILS ({family.Count})");

            var table = new PdfPTable(6) { WidthPercentage = 100f, SpacingAfter = 4f };
            table.SetWidths(new float[] { 8f, 26f, 18f, 16f, 16f, 16f });

            AddPdfTableHeaderCell(table, "Sr.");
            AddPdfTableHeaderCell(table, "Member Name");
            AddPdfTableHeaderCell(table, "Relation");
            AddPdfTableHeaderCell(table, "DOB");
            AddPdfTableHeaderCell(table, "Qualification");
            AddPdfTableHeaderCell(table, "Occupation");

            int idx = 1;
            foreach (var f in family)
            {
                BaseColor rowBg = (idx % 2 == 0) ? PdfLightBg : BaseColor.WHITE;
                AddPdfTableCell(table, idx.ToString(), rowBg, Element.ALIGN_CENTER);
                AddPdfTableCell(table, f.membername ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, f.relation ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, FormatPdfDate(f.dob), rowBg, Element.ALIGN_CENTER);
                AddPdfTableCell(table, f.qualification ?? "-", rowBg, Element.ALIGN_LEFT);
                AddPdfTableCell(table, f.occupation ?? "-", rowBg, Element.ALIGN_LEFT);
                idx++;
            }

            doc.Add(table);
        }

        private void RenderBankSection(Document doc, OnboardCandidateBankDetails? bank, int sectionNo)
        {
            if (bank == null) return;

            AddPdfSectionHeader(doc, sectionNo.ToString("00"), "BANK ACCOUNT DETAILS");

            var infoTable = new PdfPTable(4) { WidthPercentage = 100f, SpacingAfter = 3f };
            infoTable.SetWidths(new float[] { 25f, 25f, 25f, 25f });

            AddPdfKeyValueCell(infoTable, "Bank Name", bank.BankName ?? "N/A");
            AddPdfKeyValueCell(infoTable, "Account No.", bank.AccountNo ?? "N/A");
            AddPdfKeyValueCell(infoTable, "IFSC Code", bank.IFSCCode ?? "N/A");
            AddPdfKeyValueCell(infoTable, "Branch Name", bank.BranchName ?? "N/A");

            doc.Add(infoTable);

            if (!string.IsNullOrWhiteSpace(bank.PassbookPhoto))
            {
                RenderSinglePdfImage(doc, bank.PassbookPhoto, "Passbook / Cancelled Cheque Document");
            }
        }

        private void RenderVoterSection(Document doc, OnboardCandidateVoterDetails voter, int sectionNo)
        {
            AddPdfSectionHeader(doc, sectionNo.ToString("00"), "VOTER ID DETAILS");

            var infoTable = new PdfPTable(3) { WidthPercentage = 100f, SpacingAfter = 3f };
            infoTable.SetWidths(new float[] { 34f, 33f, 33f });

            AddPdfKeyValueCell(infoTable, "Voter ID", voter.VoterNo ?? "N/A");
            AddPdfKeyValueCell(infoTable, "Name on Voter Card", voter.VoterName ?? "N/A");
            AddPdfKeyValueCell(infoTable, "DOB", voter.VoterDOB ?? "N/A");

            if (!string.IsNullOrWhiteSpace(voter.VoterAddress))
            {
                var addrCell = new PdfPCell { Colspan = 3, Border = Rectangle.NO_BORDER, Padding = 2f };
                addrCell.AddElement(new Phrase("Voter Address", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6.5f, PdfLabelColor)));
                addrCell.AddElement(new Phrase(voter.VoterAddress, FontFactory.GetFont(FontFactory.HELVETICA, 7f, PdfValueColor)));
                infoTable.AddCell(addrCell);
            }

            doc.Add(infoTable);

            RenderTwoPdfImages(doc, voter.VoterFrontPhoto, "Voter ID Front", voter.VoterBackPhoto, "Voter ID Back");
        }

        private void RenderEShramAndAyushmanSection(Document doc, OnboardCandidateBasicInfo? info, bool eshramVis, bool ayushmanVis, int sectionNo)
        {
            if (info == null) return;
            if (!eshramVis && !ayushmanVis) return;

            if (eshramVis && ayushmanVis)
            {
                AddPdfSectionHeader(doc, sectionNo.ToString("00"), "E-SHRAM & AYUSHMAN BHARAT DETAILS");

                var infoTable = new PdfPTable(2) { WidthPercentage = 100f, SpacingAfter = 3f };
                infoTable.SetWidths(new float[] { 50f, 50f });

                AddPdfKeyValueCell(infoTable, "E-Shram UAN", !string.IsNullOrWhiteSpace(info.Eshram_UAN) ? info.Eshram_UAN : "Not provided");
                AddPdfKeyValueCell(infoTable, "Ayushman PM-JAY ID", !string.IsNullOrWhiteSpace(info.Ayushman_PMJAY_ID) ? info.Ayushman_PMJAY_ID : "Not provided");

                doc.Add(infoTable);

                if (!string.IsNullOrWhiteSpace(info.Eshram_Photo) && !string.IsNullOrWhiteSpace(info.Ayushman_Photo))
                {
                    RenderTwoPdfImages(doc, info.Eshram_Photo, "E-Shram Document", info.Ayushman_Photo, "Ayushman Document");
                }
                else if (!string.IsNullOrWhiteSpace(info.Eshram_Photo))
                {
                    RenderSinglePdfImage(doc, info.Eshram_Photo, "E-Shram Document");
                }
                else if (!string.IsNullOrWhiteSpace(info.Ayushman_Photo))
                {
                    RenderSinglePdfImage(doc, info.Ayushman_Photo, "Ayushman Document");
                }
            }
            else if (eshramVis)
            {
                AddPdfSectionHeader(doc, sectionNo.ToString("00"), "E-SHRAM DETAILS");

                var infoTable = new PdfPTable(1) { WidthPercentage = 100f, SpacingAfter = 3f };
                AddPdfKeyValueCell(infoTable, "E-Shram UAN", !string.IsNullOrWhiteSpace(info.Eshram_UAN) ? info.Eshram_UAN : "Not provided");
                doc.Add(infoTable);

                if (!string.IsNullOrWhiteSpace(info.Eshram_Photo))
                {
                    RenderSinglePdfImage(doc, info.Eshram_Photo, "E-Shram Document");
                }
            }
            else if (ayushmanVis)
            {
                AddPdfSectionHeader(doc, sectionNo.ToString("00"), "AYUSHMAN BHARAT DETAILS");

                var infoTable = new PdfPTable(1) { WidthPercentage = 100f, SpacingAfter = 3f };
                AddPdfKeyValueCell(infoTable, "Ayushman PM-JAY ID", !string.IsNullOrWhiteSpace(info.Ayushman_PMJAY_ID) ? info.Ayushman_PMJAY_ID : "Not provided");
                doc.Add(infoTable);

                if (!string.IsNullOrWhiteSpace(info.Ayushman_Photo))
                {
                    RenderSinglePdfImage(doc, info.Ayushman_Photo, "Ayushman Document");
                }
            }
        }

        private void RenderDrivingLicenceAndVehicleSection(
            Document doc,
            string dlNo, string dlPhoto,
            string insNo, string insPhoto,
            string rcNo, string rcPhoto,
            bool showDL, bool showInsurance, bool showRC,
            int sectionNo)
        {
            var fields = new List<(string label, string value)>();
            if (showDL) fields.Add(("DL Number", !string.IsNullOrWhiteSpace(dlNo) ? dlNo : "Not provided"));
            if (showInsurance) fields.Add(("Vehicle Insurance No", !string.IsNullOrWhiteSpace(insNo) ? insNo : "Not provided"));
            if (showRC) fields.Add(("Vehicle RC No", !string.IsNullOrWhiteSpace(rcNo) ? rcNo : "Not provided"));

            if (!fields.Any()) return;

            string title = (showInsurance || showRC) ? "DRIVING LICENCE & VEHICLE VERIFICATION" : "DRIVING LICENCE DETAILS";
            AddPdfSectionHeader(doc, sectionNo.ToString("00"), title);

            var infoTable = new PdfPTable(fields.Count) { WidthPercentage = 100f, SpacingAfter = 3f };
            if (fields.Count == 3)
                infoTable.SetWidths(new float[] { 34f, 33f, 33f });
            else if (fields.Count == 2)
                infoTable.SetWidths(new float[] { 50f, 50f });

            foreach (var f in fields)
            {
                AddPdfKeyValueCell(infoTable, f.label, f.value);
            }
            doc.Add(infoTable);

            var images = new List<(string file, string label)>();
            if (showDL && !string.IsNullOrWhiteSpace(dlPhoto)) images.Add((dlPhoto, "Driving Licence"));
            if (showInsurance && !string.IsNullOrWhiteSpace(insPhoto)) images.Add((insPhoto, "Vehicle Insurance"));
            if (showRC && !string.IsNullOrWhiteSpace(rcPhoto)) images.Add((rcPhoto, "Vehicle RC"));

            if (images.Any())
            {
                var imgTable = new PdfPTable(images.Count) { SpacingAfter = 3f, HorizontalAlignment = Element.ALIGN_LEFT };
                imgTable.WidthPercentage = images.Count switch
                {
                    1 => 35f,
                    2 => 55f,
                    _ => 85f
                };

                foreach (var img in images)
                {
                    AddPdfImageCell(imgTable, img.file, img.label, 75f, 48f);
                }

                doc.Add(imgTable);
            }
        }

        private void RenderVendorGstSection(Document doc, VendorGSTModel gst, int sectionNo)
        {
            AddPdfSectionHeader(doc, sectionNo.ToString("00"), "VENDOR GST DETAILS");

            var infoTable = new PdfPTable(2) { WidthPercentage = 100f, SpacingAfter = 3f };
            infoTable.SetWidths(new float[] { 50f, 50f });

            string applicable = gst.Vendor_IsGSTApplicable ? "Yes - Applicable" : "Not Applicable";
            AddPdfKeyValueCell(infoTable, "GST Applicable", applicable);
            AddPdfKeyValueCell(infoTable, "GST Number", gst.Vendor_IsGSTApplicable ? (gst.Vendor_GSTNo ?? "N/A") : "N/A");

            doc.Add(infoTable);

            if (!string.IsNullOrWhiteSpace(gst.GSTPhoto))
            {
                RenderSinglePdfImage(doc, gst.GSTPhoto, "GST Registration Certificate");
            }
        }

        private void RenderSignatureAndPhotoSection(Document doc, string? sigFile, string? photoFile, bool sigVisible, bool photoVisible, int sectionNo)
        {
            if (!sigVisible && !photoVisible) return;

            var sectionTable = new PdfPTable(1) { WidthPercentage = 100f, KeepTogether = true, SpacingBefore = 4f, SpacingAfter = 4f };

            // Header bar inside this table so it can never be split from the signature boxes
            string title = (sigVisible && photoVisible) ? "SIGNATURE & RECENT PHOTOGRAPH" :
                           sigVisible ? "CANDIDATE SIGNATURE" : "RECENT PHOTOGRAPH";

            var headerPhrase = new Phrase();
            headerPhrase.Add(new Chunk($"{sectionNo:00}   ", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8.5f, PdfGold)));
            headerPhrase.Add(new Chunk(title, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8.5f, BaseColor.WHITE)));

            var headerCell = new PdfPCell(headerPhrase)
            {
                BackgroundColor = PdfNavy,
                Padding = 4f,
                Border = Rectangle.NO_BORDER
            };
            sectionTable.AddCell(headerCell);

            int colCount = (sigVisible && photoVisible) ? 2 : 1;
            var subTable = new PdfPTable(colCount) { WidthPercentage = 100f };
            if (colCount == 2)
            {
                subTable.SetWidths(new float[] { 50f, 50f });
            }

            if (sigVisible)
            {
                var sigCell = new PdfPCell { Border = Rectangle.BOX, BorderColor = PdfBorderColor, Padding = 4f, MinimumHeight = 55f };
                sigCell.AddElement(new Phrase("Candidate Signature", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7.5f, PdfLabelColor)));
                Image? sigImg = TryLoadPdfImage(sigFile, 140f, 45f);
                if (sigImg != null)
                {
                    sigCell.AddElement(sigImg);
                }
                else
                {
                    sigCell.AddElement(new Paragraph("[Signature on file / Digital Verification]", FontFactory.GetFont(FontFactory.HELVETICA, 7f, PdfLabelColor)));
                }
                subTable.AddCell(sigCell);
            }

            if (photoVisible)
            {
                var photoCell = new PdfPCell { Border = Rectangle.BOX, BorderColor = PdfBorderColor, Padding = 4f, MinimumHeight = 55f };
                photoCell.AddElement(new Phrase("Recent Photograph", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7.5f, PdfLabelColor)));
                Image? photoImg = TryLoadPdfImage(photoFile, 55f, 55f);
                if (photoImg != null)
                {
                    photoCell.AddElement(photoImg);
                }
                else
                {
                    photoCell.AddElement(new Paragraph("[Photograph on file]", FontFactory.GetFont(FontFactory.HELVETICA, 7f, PdfLabelColor)));
                }
                subTable.AddCell(photoCell);
            }

            var contentCell = new PdfPCell(subTable) { Border = Rectangle.NO_BORDER, Padding = 0f };
            sectionTable.AddCell(contentCell);

            doc.Add(sectionTable);
        }

        // ---- Service Agreement: black title bar + badge, same as the Word template ----
        private void RenderVendorAgreementSection(
            Document doc,
            VendorAgreementDetailsDto? agreement,
            List<VendorActiveRateCardDto>? rateCards,
            string candidateName,
            string todayDate,
            OnboardCandidateBasicInfo? basicInfo = null,
            CompanyConfig? config = null)
        {
            // Black bar with title on the left and "Packet / Contract Basis" badge on the right
            var barTable = new PdfPTable(2) { WidthPercentage = 100f, SpacingAfter = 5f };
            barTable.SetWidths(new float[] { 68f, 32f });

            var barTitleCell = new PdfPCell(new Phrase("Service Agreement – Delivery Associate",
                FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9.5f, BaseColor.WHITE)))
            {
                BackgroundColor = PdfBlack,
                Border = Rectangle.NO_BORDER,
                Padding = 5f,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };
            barTable.AddCell(barTitleCell);

            var badgeChunk = new Chunk("  Packet / Contract Basis  ", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7f, BaseColor.WHITE));
            badgeChunk.SetBackground(PdfBadgeGrey, 2f, 2f, 2f, 2f);
            var barBadgeCell = new PdfPCell(new Phrase(badgeChunk))
            {
                BackgroundColor = PdfBlack,
                Border = Rectangle.NO_BORDER,
                Padding = 5f,
                HorizontalAlignment = Element.ALIGN_RIGHT,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };
            barTable.AddCell(barBadgeCell);
            doc.Add(barTable);

            var titlePara = new Paragraph("SERVICE AGREEMENT – DELIVERY ASSOCIATE\n(PACKET/CONTRACT BASIS)",
                FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10f, new BaseColor(26, 26, 26)))
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 5f
            };
            doc.Add(titlePara);

            string contractorName = agreement?.Vendor_Name ?? candidateName;
            string contractorAddr = agreement?.Vendor_Address ?? "Gurugram, Haryana";

            string introText = $"This Agreement is entered into on {todayDate} between:\n\n" +
                $"1. IdentifyPlus Delivery Services Private Limited, having its registered office at Gurugram – 122001 (\"Company\")\n" +
                $"AND\n" +
                $"2. Mr./Ms. {contractorName}, residing at {contractorAddr} (\"Delivery Associate\" / \"Contractor\").";

            var introPara = new Paragraph(introText, FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, PdfValueColor))
            {
                SpacingAfter = 5f
            };
            doc.Add(introPara);

            AddPdfClause(doc, "1. Scope of Services",
                "The Contractor shall collect, transport, and deliver parcels/packets assigned by the Company in a safe and timely manner. Any undelivered parcel, COD collection, or Company property shall be returned to the designated Company representative as instructed.");

            AddPdfClause(doc, "2. Independent Contractor Relationship",
                "The Contractor is engaged as an independent contractor and not as an employee of the Company. The Contractor shall not be entitled to PF, ESI, gratuity, bonus, leave, insurance, or any other employee benefits. The Contractor shall be solely responsible for compliance with applicable laws relating to his/her engagement, including taxes and statutory obligations, if any.");

            AddPdfClause(doc, "3. Confidentiality",
                "The Contractor shall maintain strict confidentiality of customer information, delivery data, business processes, and any information received during the course of engagement and shall not disclose the same to any third party.");

            AddPdfClause(doc, "4. Compensation",
                "The Company shall pay service charges as per the applicable rate card communicated from time to time:");

            RenderPdfRateCardsTable(doc, rateCards ?? agreement?.ActiveRateCards, agreement);

            var compNotePara = new Paragraph(
                "Payments shall be released within 15–20 days from the end of the relevant month, subject to reconciliation, Govt. taxes and losses done by Contractor.",
                FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, PdfValueColor))
            {
                SpacingBefore = 3f,
                SpacingAfter = 5f
            };
            doc.Add(compNotePara);

            AddPdfClause(doc, "5. Term and Termination",
                "Either party may terminate this Agreement by providing 15 days' written notice and remain valid till termination by either party in writing. The Company may terminate the Agreement immediately in cases involving misconduct, fraud, theft, customer complaints, breach of trust, or violation of Company policies and can take legal action against the contractor. Upon termination, the Contractor shall immediately return all parcels, cash collections, documents, and Company assets in his/her possession.");

            AddPdfClause(doc, "6. General",
                "The Contractor confirms that all information and documents submitted are true and correct. The contractor confirms that he has no relative working in the place of Employment. The contractor further confirms that he/she will follow company code of conduct. Any dispute arising from this Agreement shall be subject to the exclusive jurisdiction of the courts at Gurugram, Haryana.");

            // thin rule above the signature block, like the Word template
            var ruleTable = new PdfPTable(1) { WidthPercentage = 100f, SpacingBefore = 4f };
            var ruleCell = new PdfPCell { Border = Rectangle.TOP_BORDER, BorderColor = PdfRuleGrey, FixedHeight = 3f };
            ruleTable.AddCell(ruleCell);
            doc.Add(ruleTable);

            var sigTable = new PdfPTable(2) { WidthPercentage = 100f, SpacingBefore = 4f };
            sigTable.SetWidths(new float[] { 50f, 50f });

            var compCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 3f };
            compCell.AddElement(new Phrase("For IdentifyPlus Delivery Services Pvt. Ltd.", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8f, PdfValueColor)));

            // Stamp condition: render ONLY when candidate/vendor is fully Verified
            // Must NEVER render when vendor_Status is 'Initiated' or onboardFormStatusId is not 5
            bool isVendor = !string.IsNullOrEmpty(basicInfo?.Vendor_Code) || !string.IsNullOrEmpty(basicInfo?.Vendor_Status);
            bool isStampEligible;
            if (isVendor)
            {
                // For vendor candidates, Vendor_Status MUST be 'Verified'
                isStampEligible = string.Equals(basicInfo?.Vendor_Status?.Trim(), "Verified", StringComparison.OrdinalIgnoreCase);
            }
            else
            {
                // For regular employee candidates, OnboardFormStatusId MUST be 5 (Verified)
                isStampEligible = basicInfo?.OnboardFormStatusId == 5;
            }

            Image? stampImg = null;
            if (isStampEligible)
            {
                string? stampFilename = config?.is_stamp;
                if (string.IsNullOrWhiteSpace(stampFilename) && !string.IsNullOrWhiteSpace(basicInfo?.pk_recId))
                {
                    try
                    {
                        using var conn = DataBaseFactory.ConnString();
                        stampFilename = conn.QueryFirstOrDefault<string>(
                            "SELECT c.is_stamp FROM SAL_Company_Config c INNER JOIN REC_Candidate_Details r ON c.pk_companyId = r.fk_companyId WHERE r.pk_recId = @recId",
                            new { recId = basicInfo.pk_recId });
                    }
                    catch { }
                }

                if (!string.IsNullOrWhiteSpace(stampFilename))
                {
                    stampImg = TryLoadPdfImage(stampFilename, 110f, 45f);
                }
            }

            if (stampImg != null)
            {
                stampImg.SpacingBefore = 3f;
                stampImg.SpacingAfter = 3f;
                stampImg.Alignment = Element.ALIGN_LEFT;
                compCell.AddElement(stampImg);
            }
            else
            {
                compCell.AddElement(new Paragraph("\n[Company Seal & Signature]", FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 7f, PdfLabelColor)));
            }

            compCell.AddElement(new Paragraph("Authorized Signatory", FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, PdfValueColor)));
            sigTable.AddCell(compCell);

            var contrCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 3f };
            contrCell.AddElement(new Phrase("By Contractor", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8f, PdfValueColor)));
            contrCell.AddElement(new Paragraph(contractorName, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7.5f, PdfValueColor)) { SpacingBefore = 2f });

            string? agreementSig = agreement?.SignaturePhoto;
            Image? contrSigImg = TryLoadPdfImage(agreementSig, 110f, 35f);
            if (contrSigImg != null)
            {
                contrCell.AddElement(contrSigImg);
            }
            else
            {
                contrCell.AddElement(new Paragraph("Signature: ____________________", FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, PdfValueColor)) { SpacingBefore = 2f });
            }
            sigTable.AddCell(contrCell);

            doc.Add(sigTable);

            // Acceptance strip, mirroring the checkbox footer in the Word template / web UI
            var acceptTable = new PdfPTable(1) { WidthPercentage = 100f, SpacingBefore = 5f };
            var acceptCell = new PdfPCell { Border = Rectangle.NO_BORDER, BackgroundColor = new BaseColor(241, 243, 248), Padding = 5f };
            acceptCell.AddElement(new Phrase("\u2610  I have read, understood, and agree to the terms and conditions of the Service Agreement.",
                FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, new BaseColor(34, 34, 34))));
            acceptTable.AddCell(acceptCell);
            doc.Add(acceptTable);
        }

        // ---- Rate card table with colored chips & formatted slabs with % signs ----
        private void RenderPdfRateCardsTable(Document doc, List<VendorActiveRateCardDto>? rateCards, VendorAgreementDetailsDto? fallbackAgreement = null)
        {
            var cards = rateCards?.ToList() ?? new List<VendorActiveRateCardDto>();
            if (!cards.Any() && fallbackAgreement != null && (!string.IsNullOrWhiteSpace(fallbackAgreement.FHRID) || !string.IsNullOrWhiteSpace(fallbackAgreement.Vendor_HFRID)))
            {
                cards.Add(new VendorActiveRateCardDto
                {
                    FHRID = fallbackAgreement.FHRID ?? fallbackAgreement.Vendor_HFRID,
                    LocationName = fallbackAgreement.LocationName,
                    EffectiveFrom = fallbackAgreement.EffectiveFrom,
                    Normal_Rate = fallbackAgreement.Normal_Rate,
                    Normal_RateType = fallbackAgreement.Normal_RateType,
                    Normal_SlabExpr = fallbackAgreement.Normal_SlabExpr,
                    Pickup_Rate = fallbackAgreement.Pickup_Rate,
                    Pickup_RateType = fallbackAgreement.Pickup_RateType,
                    Pickup_SlabExpr = fallbackAgreement.Pickup_SlabExpr,
                    MFN_Rate = fallbackAgreement.MFN_Rate,
                    MFN_RateType = fallbackAgreement.MFN_RateType,
                    MFN_SlabExpr = fallbackAgreement.MFN_SlabExpr,
                    Van_Rate = fallbackAgreement.Van_Rate,
                    Grocery_Rate = fallbackAgreement.Grocery_Rate,
                    IsActive = true
                });
            }

            var table = new PdfPTable(8) { WidthPercentage = 100f, SpacingAfter = 6f };
            table.SetWidths(new float[] { 4f, 9f, 10f, 11f, 10f, 8f, 6f, 42f });

            AddPdfTableHeaderCell(table, "Sr.");
            AddPdfTableHeaderCell(table, "Client");
            AddPdfTableHeaderCell(table, "Model");
            AddPdfTableHeaderCell(table, "FHR ID");
            AddPdfTableHeaderCell(table, "Location");
            AddPdfTableHeaderCell(table, "Effective");
            AddPdfTableHeaderCell(table, "Status");
            AddPdfTableHeaderCell(table, "Configured Rates & Values");

            if (cards.Any())
            {
                int idx = 1;
                foreach (var rc in cards)
                {
                    BaseColor rowBg = (idx % 2 == 0) ? PdfLightBg : BaseColor.WHITE;
                    AddPdfTableCell(table, idx.ToString(), rowBg, Element.ALIGN_CENTER);
                    AddPdfTableCell(table, rc.ClientName ?? "N/A", rowBg, Element.ALIGN_LEFT);

                    var modelCell = new PdfPCell { BackgroundColor = rowBg, Padding = 3.5f, BorderColor = PdfBorderColor, VerticalAlignment = Element.ALIGN_MIDDLE, HorizontalAlignment = Element.ALIGN_CENTER };
                    var modelChunk = new Chunk($"  {rc.ModelName ?? "Standard"}  ", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7f, BaseColor.WHITE));
                    modelChunk.SetBackground(PdfPillBlue, 2f, 2f, 2f, 2f);
                    modelCell.AddElement(new Phrase(modelChunk));
                    table.AddCell(modelCell);

                    AddPdfTableCell(table, rc.FHRID ?? "-", rowBg, Element.ALIGN_CENTER);
                    AddPdfTableCell(table, rc.LocationName ?? "N/A", rowBg, Element.ALIGN_LEFT);
                    AddPdfTableCell(table, FormatPdfDate(rc.EffectiveFrom), rowBg, Element.ALIGN_CENTER);

                    var statusCell = new PdfPCell { BackgroundColor = rowBg, Padding = 3.5f, BorderColor = PdfBorderColor, HorizontalAlignment = Element.ALIGN_CENTER, VerticalAlignment = Element.ALIGN_MIDDLE };
                    bool active = rc.IsActive == true;
                    statusCell.AddElement(new Phrase(active ? "Active" : "Inactive",
                        FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7.5f, active ? PdfActiveGreen : PdfLabelColor)));
                    table.AddCell(statusCell);

                    // Configured Rates & Values cell
                    var ratesCell = new PdfPCell
                    {
                        BackgroundColor = rowBg,
                        Padding = 3.5f,
                        BorderColor = PdfBorderColor,
                        VerticalAlignment = Element.ALIGN_MIDDLE
                    };

                    string vType = rc.VehicleTypeName ?? rc.Large_VehicleTypeName ?? "";
                    if (!string.IsNullOrWhiteSpace(vType))
                    {
                        var vPara = new Paragraph { SpacingAfter = 3.5f };
                        var vChunk = new Chunk($"  {vType}  ", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6f, BaseColor.WHITE));
                        vChunk.SetBackground(new BaseColor(40, 40, 40), 2.5f, 1.5f, 2.5f, 1.5f);
                        vPara.Add(vChunk);
                        ratesCell.AddElement(vPara);
                    }

                    var configuredRates = ExtractConfiguredRates(rc);
                    if (configuredRates.Any())
                    {
                        int cols = configuredRates.Count == 1 ? 1 : 2;
                        var grid = new PdfPTable(cols) { WidthPercentage = 100f };
                        if (cols == 2)
                        {
                            grid.SetWidths(new float[] { 50f, 50f });
                        }

                        foreach (var rate in configuredRates)
                        {
                            var cardTable = new PdfPTable(1) { WidthPercentage = 100f };
                            var cardCell = new PdfPCell
                            {
                                BackgroundColor = BaseColor.WHITE,
                                Border = Rectangle.BOX,
                                BorderColor = new BaseColor(218, 224, 233), // #DAE0E9 card border
                                BorderWidth = 0.75f,
                                Padding = 3.5f,
                                PaddingBottom = 4f,
                                VerticalAlignment = Element.ALIGN_TOP
                            };

                            var headerPara = new Paragraph { Leading = 9f };

                            // Label: e.g. "Normal"
                            var labelChunk = new Chunk(rate.Label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6.5f, PdfValueColor));
                            headerPara.Add(labelChunk);

                            // Distinct space between Label and Badge
                            headerPara.Add(new Chunk("   ", FontFactory.GetFont(FontFactory.HELVETICA, 6.5f)));

                            // Badge: "  Slab  " / "  Fixed  " / "  Percentage  "
                            BaseColor badgeBg = rate.IsFixed ? PdfActiveGreen : (rate.IsSlab ? PdfPillBlue : new BaseColor(59, 111, 224));
                            var typeChunk = new Chunk($"  {rate.Type}  ", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 5.5f, BaseColor.WHITE));
                            typeChunk.SetBackground(badgeBg, 2f, 1.5f, 2f, 1.5f);
                            headerPara.Add(typeChunk);

                            if (!rate.IsSlab)
                            {
                                string valStr = "";
                                if (rate.IsFixed)
                                {
                                    valStr = $" Rs. {rate.Rate?.ToString("0.##") ?? "0"}";
                                }
                                else if (string.Equals(rate.Type, "Percentage", StringComparison.OrdinalIgnoreCase))
                                {
                                    valStr = $" {rate.Rate?.ToString("0.##") ?? "0"}%";
                                }
                                else if (rate.Rate.HasValue)
                                {
                                    valStr = $" {rate.Rate.Value:0.##}";
                                }

                                if (!string.IsNullOrEmpty(valStr))
                                {
                                    headerPara.Add(new Chunk("  "));
                                    var valChunk = new Chunk(valStr, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6.5f, rate.IsFixed ? PdfActiveGreen : PdfPillBlue));
                                    headerPara.Add(valChunk);
                                }
                                cardCell.AddElement(headerPara);
                            }
                            else
                            {
                                headerPara.SpacingAfter = 2.5f;
                                cardCell.AddElement(headerPara);

                                var slabs = ParseSlabExpr(rate.SlabExpr);
                                foreach (var slab in slabs)
                                {
                                    var slabPara = new Paragraph { Leading = 8.5f, SpacingBefore = 1f, SpacingAfter = 1f };

                                    // Range pill: " 1-84% " with soft blue background
                                    var rangeChunk = new Chunk($" {slab.Range}% ", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 5.5f, PdfNavy));
                                    rangeChunk.SetBackground(new BaseColor(232, 240, 254), 1.5f, 1f, 1.5f, 1f);
                                    slabPara.Add(rangeChunk);

                                    // Arrow with spacing: "  ->  "
                                    slabPara.Add(new Chunk("  ->  ", FontFactory.GetFont(FontFactory.HELVETICA, 5.5f, new BaseColor(140, 140, 140))));

                                    // Rate: "Rs. 13"
                                    slabPara.Add(new Chunk($"Rs. {slab.Rate}", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6f, PdfPillBlue)));

                                    cardCell.AddElement(slabPara);
                                }
                            }

                            cardTable.AddCell(cardCell);

                            var wrapperCell = new PdfPCell(cardTable)
                            {
                                Border = Rectangle.NO_BORDER,
                                Padding = 1.5f,
                                PaddingBottom = 3f,
                                BackgroundColor = rowBg
                            };
                            grid.AddCell(wrapperCell);
                        }

                        if (cols == 2 && configuredRates.Count % 2 != 0)
                        {
                            var emptyCell = new PdfPCell
                            {
                                Border = Rectangle.NO_BORDER,
                                BackgroundColor = rowBg
                            };
                            grid.AddCell(emptyCell);
                        }

                        ratesCell.AddElement(grid);
                    }
                    else
                    {
                        ratesCell.AddElement(new Phrase("-", FontFactory.GetFont(FontFactory.HELVETICA, 7f, PdfLabelColor)));
                    }

                    table.AddCell(ratesCell);
                    idx++;
                }
            }
            else
            {
                var noDataCell = new PdfPCell(new Phrase("Standard packet-based rate applicable as per client manifest.", FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 7.5f, PdfLabelColor)))
                {
                    Colspan = 8,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 5f
                };
                table.AddCell(noDataCell);
            }

            doc.Add(table);
        }

        private static List<(string Label, string Type, bool IsFixed, bool IsSlab, decimal? Rate, string? SlabExpr)> ExtractConfiguredRates(VendorActiveRateCardDto rc)
        {
            var list = new List<(string Label, string Type, bool IsFixed, bool IsSlab, decimal? Rate, string? SlabExpr)>();

            void CheckAndAdd(string label, string? rateType, decimal? rate, string? slabExpr)
            {
                bool hasType = !string.IsNullOrWhiteSpace(rateType);
                bool hasRate = rate.HasValue;
                bool hasSlab = !string.IsNullOrWhiteSpace(slabExpr);

                if (!hasType && !hasRate && !hasSlab) return;

                string effectiveType = rateType?.Trim() ?? "";
                bool isSlab = string.Equals(effectiveType, "Slab", StringComparison.OrdinalIgnoreCase) || (!hasType && hasSlab);
                bool isFixed = string.Equals(effectiveType, "Fixed", StringComparison.OrdinalIgnoreCase) || (!hasType && !hasSlab && hasRate);

                if (string.IsNullOrWhiteSpace(effectiveType))
                {
                    effectiveType = isSlab ? "Slab" : (isFixed ? "Fixed" : "Rate");
                }

                list.Add((label, effectiveType, isFixed, isSlab, rate, slabExpr));
            }

            CheckAndAdd("Normal", rc.Normal_RateType, rc.Normal_Rate, rc.Normal_SlabExpr);
            CheckAndAdd("Pickup", rc.Pickup_RateType, rc.Pickup_Rate, rc.Pickup_SlabExpr);
            CheckAndAdd("MFN", rc.MFN_RateType, rc.MFN_Rate, rc.MFN_SlabExpr);
            CheckAndAdd("Van", rc.Van_RateType, rc.Van_Rate, rc.Van_SlabExpr);
            CheckAndAdd("U2S", rc.U2S_RateType, rc.U2S_Rate, rc.U2S_SlabExpr);
            CheckAndAdd("Shopsy", rc.Shopsy_RateType, rc.Shopsy_Rate, rc.Shopsy_SlabExpr);
            CheckAndAdd("Prexo", rc.Prexo_RateType, rc.Prexo_Rate, rc.Prexo_SlabExpr);
            CheckAndAdd("Grocery", rc.Grocery_RateType, rc.Grocery_Rate, rc.Grocery_SlabExpr);

            return list;
        }

        private static List<(string Range, string Rate)> ParseSlabExpr(string? expr)
        {
            var result = new List<(string Range, string Rate)>();
            if (string.IsNullOrWhiteSpace(expr)) return result;

            var parts = expr.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts)
            {
                var trimmed = part.Trim();
                if (string.IsNullOrEmpty(trimmed)) continue;

                int colonIdx = trimmed.LastIndexOf(':');
                if (colonIdx == -1)
                {
                    result.Add((trimmed.Replace("%", "").Trim(), ""));
                }
                else
                {
                    string range = trimmed.Substring(0, colonIdx).Replace("%", "").Trim();
                    string rate = trimmed.Substring(colonIdx + 1).Trim();
                    result.Add((range, rate));
                }
            }
            return result;
        }

        // ---- Unified section header bar: navy background, gold number, white title ----
        private static void AddPdfSectionHeader(Document doc, string number, string title)
        {
            var table = new PdfPTable(1) { WidthPercentage = 100f, SpacingBefore = 4f, SpacingAfter = 3f };

            var phrase = new Phrase();
            phrase.Add(new Chunk($"{number}   ", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8f, PdfGold)));
            phrase.Add(new Chunk(title, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8f, BaseColor.WHITE)));

            var cell = new PdfPCell(phrase)
            {
                BackgroundColor = PdfNavy,
                Padding = 3.5f,
                Border = Rectangle.NO_BORDER
            };
            table.AddCell(cell);
            doc.Add(table);
        }

        private static void AddPdfKeyValueCell(PdfPTable table, string label, string value)
        {
            var cell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 2f };
            cell.AddElement(new Phrase(label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6.5f, PdfLabelColor)));
            cell.AddElement(new Phrase(value, FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, PdfValueColor)));
            table.AddCell(cell);
        }

        // header row is now a light grey rule-style row (like the Word template's rate table), same for every table
        private static void AddPdfTableHeaderCell(PdfPTable table, string text)
        {
            var cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6.5f, PdfLabelColor)))
            {
                BackgroundColor = PdfHeaderRowBg,
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 3f,
                BorderColor = PdfRuleGrey,
                Border = Rectangle.BOTTOM_BORDER
            };
            table.AddCell(cell);
        }

        private static void AddPdfTableCell(PdfPTable table, string text, BaseColor bgColor, int align)
        {
            var cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA, 7f, PdfValueColor)))
            {
                BackgroundColor = bgColor,
                HorizontalAlignment = align,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 2.5f,
                BorderColor = PdfBorderColor
            };
            table.AddCell(cell);
        }

        private static void AddPdfClause(Document doc, string title, string text)
        {
            var p = new Paragraph
            {
                SpacingAfter = 3.5f
            };
            p.Add(new Chunk(title + "\n", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8f, PdfNavy)));
            p.Add(new Chunk(text, FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, new BaseColor(58, 58, 58))));
            doc.Add(p);
        }

        // ---- Document thumbnails: small bordered cards, matching the Word template's thumbnail grid ----
        private void RenderSinglePdfImage(Document doc, string? filename, string label)
        {
            Image? img = TryLoadPdfImage(filename, 75f, 48f);
            if (img == null) return;

            var table = new PdfPTable(1) { WidthPercentage = 35f, SpacingAfter = 3f, HorizontalAlignment = Element.ALIGN_LEFT };
            var cell = new PdfPCell
            {
                Border = Rectangle.BOX,
                BorderColor = PdfRuleGrey,
                Padding = 3.5f,
                HorizontalAlignment = Element.ALIGN_CENTER
            };
            cell.AddElement(img);
            cell.AddElement(new Paragraph(label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6f, new BaseColor(51, 51, 51))) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 2f });
            table.AddCell(cell);
            doc.Add(table);
        }

        private void RenderTwoPdfImages(Document doc, string? file1, string label1, string? file2, string label2)
        {
            var table = new PdfPTable(2) { WidthPercentage = 55f, SpacingAfter = 3f, HorizontalAlignment = Element.ALIGN_LEFT };
            table.SetWidths(new float[] { 50f, 50f });

            var cell1 = new PdfPCell { Border = Rectangle.BOX, BorderColor = PdfRuleGrey, Padding = 3.5f, HorizontalAlignment = Element.ALIGN_CENTER };
            Image? img1 = TryLoadPdfImage(file1, 75f, 48f);
            if (img1 != null)
            {
                cell1.AddElement(img1);
                cell1.AddElement(new Paragraph(label1, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6f, new BaseColor(51, 51, 51))) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 2f });
            }
            table.AddCell(cell1);

            var cell2 = new PdfPCell { Border = Rectangle.BOX, BorderColor = PdfRuleGrey, Padding = 3.5f, HorizontalAlignment = Element.ALIGN_CENTER };
            Image? img2 = TryLoadPdfImage(file2, 75f, 48f);
            if (img2 != null)
            {
                cell2.AddElement(img2);
                cell2.AddElement(new Paragraph(label2, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6f, new BaseColor(51, 51, 51))) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 2f });
            }
            table.AddCell(cell2);

            if (img1 != null || img2 != null)
            {
                doc.Add(table);
            }
        }

        private void RenderAadhaarImages(Document doc, string? front, string? back, string? fatherFront, string? fatherBack)
        {
            bool hasFather = !string.IsNullOrWhiteSpace(fatherFront) || !string.IsNullOrWhiteSpace(fatherBack);

            if (hasFather)
            {
                var table = new PdfPTable(4) { WidthPercentage = 100f, SpacingAfter = 3f };
                table.SetWidths(new float[] { 25f, 25f, 25f, 25f });

                AddPdfImageCell(table, front, "Aadhaar Front", 70f, 45f);
                AddPdfImageCell(table, back, "Aadhaar Back", 70f, 45f);
                AddPdfImageCell(table, fatherFront, "Father Aadhaar Front", 70f, 45f);
                AddPdfImageCell(table, fatherBack, "Father Aadhaar Back", 70f, 45f);

                doc.Add(table);
            }
            else
            {
                RenderTwoPdfImages(doc, front, "Aadhaar Front", back, "Aadhaar Back");
            }
        }

        private void AddPdfImageCell(PdfPTable table, string? filename, string label, float maxWidth, float maxHeight)
        {
            var cell = new PdfPCell { Border = Rectangle.BOX, BorderColor = PdfRuleGrey, Padding = 3.5f, HorizontalAlignment = Element.ALIGN_CENTER };

            if (!string.IsNullOrWhiteSpace(filename))
            {
                Image? img = TryLoadPdfImage(filename, maxWidth, maxHeight);
                if (img != null)
                {
                    cell.AddElement(img);
                    cell.AddElement(new Paragraph(label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6f, new BaseColor(51, 51, 51))) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 2f });
                    table.AddCell(cell);
                    return;
                }
            }

            cell.AddElement(new Paragraph(label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6f, new BaseColor(51, 51, 51))) { Alignment = Element.ALIGN_CENTER });
            cell.AddElement(new Paragraph("[Not Available]", FontFactory.GetFont(FontFactory.HELVETICA, 6.5f, PdfLabelColor)) { Alignment = Element.ALIGN_CENTER });
            table.AddCell(cell);
        }

        private Image? TryLoadPdfImage(string? filename, float maxWidth, float maxHeight)
        {
            if (string.IsNullOrWhiteSpace(filename)) return null;

            try
            {
                string filePath = filename;
                if (!Path.IsPathRooted(filePath))
                {
                    string primaryFolder = _appSettings.UploadsFolderPath ?? "D:/IMAGE";
                    filePath = Path.Combine(primaryFolder, filename);

                    if (!System.IO.File.Exists(filePath) && !string.IsNullOrWhiteSpace(_appSettings.CandidateFolderPath))
                    {
                        string candidatePath = Path.Combine(_appSettings.CandidateFolderPath, filename);
                        if (System.IO.File.Exists(candidatePath))
                        {
                            filePath = candidatePath;
                        }
                    }

                    if (!System.IO.File.Exists(filePath) && !string.IsNullOrWhiteSpace(_appSettings.CompanyLogoFolderPath))
                    {
                        string logoPath = Path.Combine(_appSettings.CompanyLogoFolderPath, filename);
                        if (System.IO.File.Exists(logoPath))
                        {
                            filePath = logoPath;
                        }
                    }

                    if (!System.IO.File.Exists(filePath))
                    {
                        string frontendLogoPath = Path.Combine(@"d:\HRMS\Frontend\src\assets\Image\Logo", filename);
                        if (System.IO.File.Exists(frontendLogoPath))
                        {
                            filePath = frontendLogoPath;
                        }
                    }
                }

                if (!System.IO.File.Exists(filePath))
                {
                    return null;
                }

                var img = Image.GetInstance(filePath);
                img.ScaleToFit(maxWidth, maxHeight);
                img.Alignment = Element.ALIGN_CENTER;
                return img;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CandidateExperienceDetailsController] Failed to load image {filename}: {ex.Message}");
                return null;
            }
        }

        private static string FormatPdfDate(DateTime? dt)
        {
            if (!dt.HasValue) return "-";
            return dt.Value.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
        }

        private class OnboardingPageEvent : PdfPageEventHelper
        {
            private PdfTemplate _footerTemplate = null!;
            private BaseFont _baseFont = null!;
            private readonly string _candidateName;
            private readonly string _generatedDate;

            public OnboardingPageEvent(string candidateName, string generatedDate)
            {
                _candidateName = candidateName;
                _generatedDate = generatedDate;
            }

            public override void OnOpenDocument(PdfWriter writer, Document document)
            {
                _baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                _footerTemplate = writer.DirectContent.CreateTemplate(50, 50);
            }

            public override void OnEndPage(PdfWriter writer, Document document)
            {
                base.OnEndPage(writer, document);
                var cb = writer.DirectContent;

                // Running Header
                cb.SetColorStroke(new BaseColor(220, 224, 230));
                cb.SetLineWidth(0.5f);
                cb.MoveTo(document.Left, document.PageSize.Height - 22f);
                cb.LineTo(document.Right, document.PageSize.Height - 22f);
                cb.Stroke();

                ColumnText.ShowTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase($"Candidate: {_candidateName}", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7.5f, new BaseColor(80, 80, 80))),
                    document.Left, document.PageSize.Height - 18f, 0);

                ColumnText.ShowTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase("Onboarding Form", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8.5f, new BaseColor(40, 40, 40))),
                    document.PageSize.Width / 2, document.PageSize.Height - 18f, 0);

                ColumnText.ShowTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase($"Generated: {_generatedDate}", FontFactory.GetFont(FontFactory.HELVETICA, 7.5f, new BaseColor(120, 120, 120))),
                    document.Right, document.PageSize.Height - 18f, 0);

                // Running Footer: "Page X of " + Template
                string pageText = $"Page {writer.PageNumber} of ";
                float textLen = _baseFont.GetWidthPoint(pageText, 8f);

                cb.BeginText();
                cb.SetFontAndSize(_baseFont, 8f);
                cb.SetColorFill(new BaseColor(120, 120, 120));
                cb.SetTextMatrix(document.Right - textLen - 20f, 12f);
                cb.ShowText(pageText);
                cb.EndText();

                cb.AddTemplate(_footerTemplate, document.Right - 20f, 12f);
            }

            public override void OnCloseDocument(PdfWriter writer, Document document)
            {
                base.OnCloseDocument(writer, document);
                _footerTemplate.BeginText();
                _footerTemplate.SetFontAndSize(_baseFont, 8f);
                _footerTemplate.SetColorFill(new BaseColor(120, 120, 120));
                _footerTemplate.ShowText((writer.PageNumber).ToString());
                _footerTemplate.EndText();
            }
        }

        #endregion

        //FAMILY

        // ESHRAM ENDPOINTS
        [HttpPost]
        [Route("Eshram")]
        public async Task<IActionResult> InsertEshramAsync([FromForm] EshramModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid E-Shram data." });

                if (string.IsNullOrWhiteSpace(model.Eshram_UAN))
                    return BadRequest(new { message = "UAN is required." });

                if (model.Eshram_PhotoFile != null && model.Eshram_PhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.Eshram_PhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed." });

                    model.Eshram_Photo = await _fileService.SaveFileAsync(model.Eshram_PhotoFile);
                }

                model.Eshram_PhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertEshramAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "E-Shram details saved successfully." : "Failed to save E-Shram details.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }

        [HttpGet("GetEshramById")]
        public async Task<IActionResult> GetEshramByIdAsync()
        {
            var modelResponse = new ModelResponse();
            try
            {
                var pk_recId = HttpContext.Items["CandidateId"]?.ToString();
                if (string.IsNullOrEmpty(pk_recId))
                {
                    return Ok(new { isSuccess = false, message = "Invalid candidate", statusCode = 401 });
                }

                EshramModel result = await _candidateExperienceDetailsRepository.GetEshramByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "E-Shram detail not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "E-Shram detail retrieved successfully.";
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

        // AYUSHMAN ENDPOINTS
        [HttpPost]
        [Route("Ayushman")]
        public async Task<IActionResult> InsertAyushmanAsync([FromForm] AyushmanModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Ayushman data." });

                if (string.IsNullOrWhiteSpace(model.Ayushman_PMJAY_ID))
                    return BadRequest(new { message = "PM-JAY ID is required." });

                if (model.Ayushman_PhotoFile != null && model.Ayushman_PhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.Ayushman_PhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed." });

                    model.Ayushman_Photo = await _fileService.SaveFileAsync(model.Ayushman_PhotoFile);
                }

                model.Ayushman_PhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertAyushmanAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Ayushman details saved successfully." : "Failed to save Ayushman details.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }

        [HttpGet("GetAyushmanById")]
        public async Task<IActionResult> GetAyushmanByIdAsync()
        {
            var modelResponse = new ModelResponse();
            try
            {
                var pk_recId = HttpContext.Items["CandidateId"]?.ToString();
                if (string.IsNullOrEmpty(pk_recId))
                {
                    return Ok(new { isSuccess = false, message = "Invalid candidate", statusCode = 401 });
                }

                AyushmanModel result = await _candidateExperienceDetailsRepository.GetAyushmanByIdAsync(pk_recId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Ayushman detail not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Ayushman detail retrieved successfully.";
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

        // DRIVING LICENCE ENDPOINTS
        [HttpPost]
        [Route("verify-driving-licence/DrivingLicence")]
        public async Task<IActionResult> InsertDrivingLicenceAsync([FromForm] DrivingLicenceModel model)
        {
            var response = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            model.pk_recId = candidateId;

            try
            {
                if (model == null)
                    return BadRequest(new { message = "Invalid Driving Licence data." });

                if (string.IsNullOrWhiteSpace(model.DLNo))
                    return BadRequest(new { message = "Driving Licence number is required." });

                if (model.DLPhotoFile != null && model.DLPhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.DLPhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed for DL." });

                    model.DLPhoto = await _fileService.SaveFileAsync(model.DLPhotoFile);
                }
                model.DLPhotoFile = null;

                if (model.Vehicle_Insurance_PhotoFile != null && model.Vehicle_Insurance_PhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.Vehicle_Insurance_PhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed for Insurance." });

                    model.Vehicle_Insurance_Photo = await _fileService.SaveFileAsync(model.Vehicle_Insurance_PhotoFile);
                }
                model.Vehicle_Insurance_PhotoFile = null;

                if (model.Vehicle_RC_PhotoFile != null && model.Vehicle_RC_PhotoFile.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.Vehicle_RC_PhotoFile))
                        return BadRequest(new { message = "Only JPG, JPEG, PNG, PDF allowed for RC." });

                    model.Vehicle_RC_Photo = await _fileService.SaveFileAsync(model.Vehicle_RC_PhotoFile);
                }
                model.Vehicle_RC_PhotoFile = null;

                bool isInserted = await _candidateExperienceDetailsRepository.InsertDrivingLicenceAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Driving Licence saved successfully." : "Driving Licence save failed.";
                response.StatusCode = isInserted ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return StatusCode(500, response);
            }
        }


        [HttpGet("GetDrivingLicenceById")]
        public async Task<IActionResult> GetDrivingLicenceByIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            var candidateId = HttpContext.Items["CandidateId"]?.ToString();
            var pk_recId = candidateId;

            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                DrivingLicenceModel result = await _candidateExperienceDetailsRepository.GetDrivingLicenceByIdAsync(pk_recId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Driving Licence retrieved successfully.";
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




        [HttpGet("checkduplicat/{*fieldName}")]
        [HttpGet("checkduplicat")]
        public async Task<IActionResult> checkduplicat(
         [FromRoute] string? fieldName = null,
         [FromQuery] string? fieldNameQuery = null,
         [FromQuery] string fieldValue = "",
         [FromQuery] string? generalId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                fieldName = !string.IsNullOrWhiteSpace(fieldName) ? fieldName : fieldNameQuery;
                if (!string.IsNullOrWhiteSpace(fieldName))
                {
                    fieldName = System.Net.WebUtility.UrlDecode(fieldName);
                }

                if (string.IsNullOrWhiteSpace(fieldName) ||
                    string.IsNullOrWhiteSpace(fieldValue))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "FieldName and FieldValue are required.";
                    modelResponse.StatusCode = 400;

                    return Ok(modelResponse);
                }

                // If generalId is not provided, use the candidate's pk_recId from middleware context
                if (string.IsNullOrWhiteSpace(generalId) ||
                    generalId.Equals("undefined", StringComparison.OrdinalIgnoreCase) ||
                    generalId.Equals("null", StringComparison.OrdinalIgnoreCase))
                {
                    generalId = HttpContext.Items["CandidateId"]?.ToString();
                }

                Result result = await generalRepository.CheckValidationPublicAsync(
                    fieldName,
                    fieldValue,
                    generalId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        //added code 16 sept ends- shiv

        [HttpPost("chatbot/ask")]
        [AllowAnonymous]
        public async Task<IActionResult> AskQuestion([FromBody] CandidateChatRequest request, [FromServices] IHttpClientFactory _httpClientFactory)
        {
            string _groqApiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? "";


            string dynamicAgentName = ""; // Fallback default

            try
            {
                using var conn = DataBaseFactory.ConnString();
                var dbAgent = conn.QueryFirstOrDefault<string>(
                    "GET_AGENT_NAME_BY_CANDIDATE_KEY",
                    new { CandidateKey = request.candidateKey },
                    commandType: CommandType.StoredProcedure
                );

                if (!string.IsNullOrEmpty(dbAgent))
                {
                    dynamicAgentName = dbAgent;
                }
            }
            catch
            {
                // If SP fails or doesn't exist yet, it will fallback to "Dinesh"
            }

            if (string.IsNullOrWhiteSpace(request.question))
            {
                return BadRequest(new { answer = "Please provide a question." });
            }

            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _groqApiKey);

                string systemPrompt = $@"You are an intelligent, friendly AI Onboarding Assistant for this specific company's HRMS system. 

IMPORTANT CONTEXT ABOUT THE USER YOU ARE TALKING TO:
- The person talking to you is a candidate named: {request.candidateName}. ALWAYS address them by their name nicely.
- Their unique candidate link/key is: {request.candidateKey}. If they ask for their key, provide it.
- Their assigned Agent/Head/HR Manager is: {dynamicAgentName}. If they ask who their agent, head, or manager is, tell them THIS name exactly. DO NOT invent or guess any other names for company heads or directors. If they ask who their agent is, tell them this name.

IMPORTANT COMPANY ONBOARDING RULES YOU MUST FOLLOW AND TELL CANDIDATES:
1. Link Validity: The onboarding link is valid. It will remain open UNTIL the candidate clicks the final 'Submit' button on the Final Submission view. After final submission, the link gets locked.
2. Verification Status: After submission, the HR team will verify the details. If verified, they will be notified by HR. If anything is missing, HR will revert the link back to them to correct it.
3. Form Progress & Missing Details: If the candidate asks about their percentage or missing details, tell them to ""Please check the 'Final Submission View' tab or the progress bar at the top of your screen to see your exact completion percentage and the list of incomplete sections (like PAN Details, Bank Details, etc.)"".
4. PAN/Aadhar Uploads: Must be uploaded in the 'Statutory Details' section.
5. Technical Support: If they face bugs, they should email the HR support team.
6. Language: If they speak Hindi, reply in natural Hindi. If English, reply in English.";

                var payload = new
                {
                    model = "openai/gpt-oss-20b",
                    messages = new[]
                    {
                        new { role = "system", content = systemPrompt },
                        new { role = "user", content = request.question }
                    }
                };

                var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);

                if (response.IsSuccessStatusCode)
                {
                    var resultString = await response.Content.ReadAsStringAsync();
                    using (JsonDocument doc = JsonDocument.Parse(resultString))
                    {
                        var root = doc.RootElement;
                        var answer = root.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                        return Ok(new { answer = answer });
                    }
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return Ok(new { answer = "API Error: " + error });
                }
            }
            catch
            {
                return Ok(new { answer = "An unexpected error occurred while processing your request. Please contact HR." });
            }
        }



    }
}