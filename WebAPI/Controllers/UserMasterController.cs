using HRMSWebAPI.Helper;
using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.Wordprocessing;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Linq;
using System.Net.Http.Headers;


namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class UserMasterController : ControllerBase
    {
        //    private readonly IUserMasterRepository userMasterRepository;
        //    private readonly FileService fileService;
        //    private readonly AppSettings appSettings;

        //    public UserMasterController(IUserMasterRepository _userMasterRepository, FileService _fileService, IOptions<AppSettings> _appSettings)
        //    {
        //        this.userMasterRepository = _userMasterRepository;
        //        this.fileService = _fileService;
        //        this.appSettings = _appSettings.Value;
        //    }



        private readonly ICandidateExperienceDetailsRepository _candidateExperienceDetailsRepository;
        private readonly IUserMasterRepository userMasterRepository;
        private readonly TokenService tokenService;
        private readonly IConfiguration configuration;
        private readonly EmailService emailService;

        private readonly FileService fileService;
        private readonly AppSettings appSettings;



        public UserMasterController(ICandidateExperienceDetailsRepository candidateExperienceDetailsRepository, IUserMasterRepository _userMasterRepository, FileService _fileService, TokenService _tokenService, IConfiguration _configuration, EmailService _emailService, IOptions<AppSettings> _appSettings)
        {
            _candidateExperienceDetailsRepository = candidateExperienceDetailsRepository;
            this.userMasterRepository = _userMasterRepository;
            fileService = _fileService;
            tokenService = _tokenService;
            configuration = _configuration;
            emailService = _emailService;
            appSettings = _appSettings.Value;
        }



        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertUserAsync([FromBody] List<UserMst> userList)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();


                //foreach (var item in userList)
                //{
                //    item.fk_companyId = decryptedCompanyId;
                //    item.password = Encrypt(item.password);
                //}

                foreach (var item in userList)
                {
                    item.fk_companyId = decryptedCompanyId;
                }

                // Validate input
                if (userList == null || userList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User list cannot be empty";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }
                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId) || string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID, Location ID, or Company ID is missing";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method
                bool isInserted = await userMasterRepository.InsertUserAsync(userList, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "User inserted successfully." : "Failed to insert user";
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
        [Authorize]
        public async Task<IActionResult> UpdateUserAsync([FromBody] List<UserMst> userList)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                //foreach (var item in userList)
                //{
                //    if (item.oldPassword != item.password)
                //    {
                //        item.password = Encrypt(item.password);
                //    }
                //}

                if (userList == null || !userList.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User list is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Set fk_updUserID in each item
                foreach (var item in userList)
                {
                    item.fk_updUserID = decryptedUserId;
                }

                // Pick pk_userId from first object (assuming only one object for now)
                string pk_userId = userList.First().pk_userId;
                byte[] timestamp = userList.First().Timestamp; // Assuming Timestamp is available in the model

                bool isUpdated = await userMasterRepository.UpdateUserAsync(
                    userList,
                    decryptedUserId,
                    decryptedLocationId,
                    pk_userId,
                    timestamp
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "User updated successfully." : "Failed to update User.";
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


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllUsers(int pageIndex = 0, int pageSize = 10, string searchText = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                // Validate CompanyId and UserId
                if (string.IsNullOrEmpty(decryptedCompanyId) || string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID or User ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method to get users
                //var (totalCount, result) = await userMasterRepository.GetAllUsersAsync(pageIndex, pageSize, decryptedUserId, decryptedCompanyId);
                var (totalCount, result) = await userMasterRepository.GetAllUsersAsync(pageIndex, pageSize, decryptedUserId, decryptedCompanyId, searchText);
               
                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No user records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "User List retrieved successfully.";
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

        [HttpGet("{pk_userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserByIdAsync([FromRoute] string pk_userId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Validate input
                if (string.IsNullOrEmpty(pk_userId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method to get user by ID
                UserMst result = await userMasterRepository.GetUserByIdAsync(pk_userId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid User ID.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "User detail retrieved successfully.";
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

       
        [HttpDelete("{pk_userId}")]
        [Authorize]
        public async Task<IActionResult> DeleteUserAsync([FromRoute] string pk_userId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Call repository method to delete the user by ID
                bool isDeleted = await userMasterRepository.DeleteUserAsync(pk_userId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "User deleted successfully." : "Failed to delete User.";
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







        //For User Password Encryption

        private string Encrypt(string sData)
        {
            try
            {
                byte[] encData_byte = new byte[sData.Length];
                encData_byte = System.Text.Encoding.UTF8.GetBytes(sData);
                string encodedData = Convert.ToBase64String(encData_byte); return encodedData;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in base64Encode" + ex.Message);
            }
        }

        private string Decrypt(string sData)
        {
            System.Text.UTF8Encoding encoder = new System.Text.UTF8Encoding();
            System.Text.Decoder utf8Decode = encoder.GetDecoder();
            byte[] todecode_byte = Convert.FromBase64String(sData);
            int charCount = utf8Decode.GetCharCount(todecode_byte, 0, todecode_byte.Length);
            char[] decoded_char = new char[charCount];
            utf8Decode.GetChars(todecode_byte, 0, todecode_byte.Length, decoded_char, 0);
            string result = new String(decoded_char); return result;
        }



        /// <summary>
        /// Get candidate's complete onboarding summary for final review
        /// </summary>
        [HttpGet("final-summary/{candidateId}")]
        [Authorize]
        public async Task<IActionResult> GetFinalSummary([FromRoute] string candidateId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


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

        [HttpGet("get-onboarding-mandatory/{candidateId}")]
        public async Task<IActionResult> GetMandatorySettings([FromRoute] string candidateId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

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
        //FAMILY

        [HttpGet("GetOnBoardingCandidates")]
        [Authorize]
        public async Task<IActionResult> GetOnBoardingCandidates(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedCompanyId) || string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID or User ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repo
                var (totalCount, result) = await userMasterRepository
                    .GetOnBoardingCandidatelist(pageIndex, pageSize, decryptedUserId, decryptedCompanyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No candidate records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Onboarding candidate list retrieved successfully.";
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




        [HttpGet("GetOnBoardingDashboardData")]
        [Authorize]
        public async Task<IActionResult> GetOnBoardingDashboardData(

           )
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var dashboardData = await userMasterRepository.GetOnBoardingDashboardData(decryptedCompanyId);

                if (dashboardData == null)
                {
                    return NotFound(new
                    {
                        isSuccess = false,
                        message = "Dashboard data not found",
                        statusCode = 404
                    });
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Dashboard data retrieved successfully.";
                modelResponse.Data = dashboardData;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Error retrieving dashboard data: {ex.Message}";
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        

        [HttpGet("documents/{fileName}")]
        [Authorize]
        public async Task<IActionResult> GetCandidateDocument(string fileName)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                if (string.IsNullOrEmpty(fileName))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid fileName";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var filePath = fileService.GetCandidateFilePath(fileName);

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
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream",
            };
        }


        [HttpPost("send-emails")]
        [Authorize]
        public async Task<IActionResult> SendUserEmails([FromBody] SendEmailRequestDto request)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                List<UserMst> usersToProcess = new List<UserMst>();

                if (request.SendToAll)
                {
                    // Fetch all users for this company (using large page size)
                    var fk_userId = HttpContext.Items["DecryptedUserId"]?.ToString();
                    var allUsersData = await userMasterRepository.GetAllUsersAsync(0, 999999, fk_userId, decryptedCompanyId, "");
                    if (allUsersData.Item2 != null)
                    {
                        usersToProcess = allUsersData.Item2.ToList();
                    }
                }
                else if (request.Users != null && request.Users.Any())
                {
                    usersToProcess = request.Users;
                }

                if (!usersToProcess.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No users provided.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                int successCount = 0;
                foreach (var user in usersToProcess)
                {
                    string targetEmail = !string.IsNullOrWhiteSpace(user.email) ? user.email.Trim() : user.loginname?.Trim();
                    if (string.IsNullOrWhiteSpace(targetEmail) || !targetEmail.Contains("@")) continue; // skip if no valid email

                    string subject = "";
                    string body = "";

                    int total = user.TotalVendorCount ?? 0;
                    int incomplete = user.IncompleteVendorCount ?? 0;
                    double percentage = total > 0 ? Math.Round(((double)incomplete / total) * 100, 2) : 0;

                    var emailTemplate = await userMasterRepository.GetUserEmailBodyAsync(
                        request.Type,
                        user.empname ?? user.name,
                        user.loginname,
                        user.password,
                        decryptedCompanyId,
                        total,
                        incomplete,
                        percentage
                    );

                    subject = emailTemplate.subject;
                    body = emailTemplate.body;

                    if (!string.IsNullOrEmpty(subject))
                    {
                        bool isSent = await userMasterRepository.SendUserEmailAsync(targetEmail, subject, body, decryptedCompanyId, user.pk_userId);
                        if (isSent) successCount++;
                    }
                }

                modelResponse.IsSuccess = true;
                if (successCount == 0 && usersToProcess.Any())
                {
                    var u = usersToProcess.First();
                    modelResponse.Message = $"0 Emails sent. Debug -> Email: '{u.email}', Login: '{u.loginname}', Type: '{request.Type}'";
                }
                else
                {
                    modelResponse.Message = $"{successCount} Email(s) sent successfully.";
                }
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






    }



}
