using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using UAParser;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using static System.Net.WebRequestMethods;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
//using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using Dapper;
using System.Data;
using Org.BouncyCastle.Asn1.Ocsp;
//using Newtonsoft.Json;


namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly FileService fileService;
        private readonly IUserRepository userRepository;
        private readonly TokenService tokenService;
        private readonly IConfiguration configuration;
        private readonly EmailService emailService;
        private readonly AppSettings appSettings;


        public UserController(IUserRepository _userRepository, FileService _fileService, TokenService _tokenService, IConfiguration _configuration, EmailService _emailService, IOptions<AppSettings> _appSettings)
        {
            userRepository = _userRepository;
            fileService = _fileService;
            tokenService = _tokenService;
            configuration = _configuration;
            emailService = _emailService;
            appSettings = _appSettings.Value;
        }




        [Authorize]
        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                string? updatedPassword = await userRepository.ChangePasswordAsync(request.fk_empid, request.password);

                if (string.IsNullOrEmpty(updatedPassword))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to change password.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Password changed successfully.";
                modelResponse.Data = updatedPassword;
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
        [AllowAnonymous]
        [Route("login")]
        public async Task<IActionResult> LoginPartial([FromBody] LoginModel loginModel)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string ipAddress = GetClientIpAddress();
                string deviceInfo = GetDeviceInfo();

                // Encrypt password for User type
                //if (loginModel.UserType == "User")
                //{
                //    loginModel.Password = this.userRepository.Encrypt(loginModel.Password);
                //}

               //loginModel.Password = this.userRepository.Encrypt(loginModel.Password);




                //  Call unified login method
                UnifiedLoginDetail result = await this.userRepository.LoginCompleteAsync(loginModel, ipAddress, deviceInfo);

                if (!result.IsLoginSuccessfull)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = result.Message ?? "Invalid credentials",
                        StatusCode = 400
                    });
                }

                //  Generate OTP
                string otp = new Random().Next(100000, 999999).ToString();

                //  Save OTP

                string userId =
                !string.IsNullOrWhiteSpace(result.UserId) ? result.UserId :
                result.pk_userId;

                await this.userRepository.SaveUserOTPAsync(userId, otp,
                     result.fk_locid,
                    loginModel.CompanyCode);

                //  Send Email (optional)
                // await this.emailService.SendEmailAsync(result.UserEmail, "Your OTP", $"Your OTP is: {otp}");

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "OTP sent to your registered email.",
                    StatusCode = 200,
                    DocumentNo = otp,
                    //  DocumentId = result.UserId,
                    DocumentId = userId,
                    //  VERY IMPORTANT
                    LoginType = result.LoginType,
                    ShowAdminSwitch = result.ShowAdminSwitch,
                    isotprequired = result.isotprequired,
                    contractor_LabelName = result.contractor_LabelName,
                    ContractorApplicable = result.ContractorApplicable,
                    vendor_Applicable=result.vendor_Applicable,
                    showclientdetails = result.showclientdetails,
                    isAutoEmpcode=result.isAutoEmpcode

                });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }
    
        [HttpPost]
        [AllowAnonymous]
        [Route("verify-otp")]
        public async Task<IActionResult> LoginComplete([FromBody] VerifyOTPModel request)
        {
            var modelResponse = new ModelResponse();

            try
            {
                //// Decrypt and validate UserId
                //var (isValid, userId, message) = IdHelper.ValidateAndDecryptId(request.UserId, "userId");

                //if (!isValid || userId == null)
                //{
                //    modelResponse.IsSuccess = false;
                //    modelResponse.Message = message;
                //    modelResponse.StatusCode = 400;
                //    return Ok(modelResponse);
                //}

                //string ipAddress = GetClientIpAddress();
                //string deviceInfo = GetDeviceInfo();

                // Verify OTP
                LoginResult result = await this.userRepository.VerifyOtpAsync(request.UserId, request.Otp, request.usertype);

                if (!result.IsLoginSuccessfull)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = result.Message;
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                //var result1 = new LoginModel();
                // Encrypt the values before sending as part of the token payload
                var encryptedUserId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.UserId.ToString());
                var encryptedCompanyId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.CompanyId.ToString());
                var encryptedFinancialYearId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.FinancialYearId.ToString());
                var encryptedLocationId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.LocationId.ToString()); // Use LocationId from request

               
                    
                    var accessToken = tokenService.GenerateAccessToken(encryptedUserId,
                       encryptedLocationId,
                        encryptedCompanyId, encryptedFinancialYearId);
                    var refreshToken = tokenService.GenerateRefreshToken();


                // Query isVendor and fk_vendorId via stored procedure
                bool isUserVendor = false;
                string userVendorId = "";
                try
                {
                    using var conn = DataBaseFactory.ConnString();
                    var vInfo = await conn.QueryFirstOrDefaultAsync<dynamic>(
                        "dbo.usp_UM_GetUserVendorProfile",
                        new { UserId = result.UserId, CompanyId = result.CompanyId?.ToString() },
                        commandType: CommandType.StoredProcedure);
                    if (vInfo != null)
                    {
                        isUserVendor = Convert.ToBoolean(vInfo.isVendor);
                        userVendorId = (string)vInfo.vendorId;
                    }
                }
                catch { }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Successfully logged in";
                modelResponse.StatusCode = 200;
                modelResponse.Data = new
                {
                    financialDate1 = result.Date1,
                    financialDate2 = result.Date2,
                    result.UserName,
                    result.UserId,
                    result.CompanyId,

                    result.contractor_LabelName,
                    result.ContractorApplicable,
                    result.CompanyName,
                    // Role Details
                    result.pk_roleId,
                    result.rolename,
                    isVendor = isUserVendor,
                    fk_vendorId = userVendorId,

                    accessToken,
                    refreshToken,


                };



                // Generate access token

                // Generate refresh token


                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }


        private string GetClientIpAddress()
        {
            // Check if the request has passed through a reverse proxy
            var xForwardedForHeader = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();

            if (!string.IsNullOrEmpty(xForwardedForHeader))
            {
                // X-Forwarded-For may contain multiple IPs (client IP, proxy IP, etc.), the first one is the real client IP
                var ipAddress = xForwardedForHeader.Split(',').First().Trim();
                return ipAddress;
            }

            // If no X-Forwarded-For header is present, use the direct connection IP
            var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;

            if (remoteIpAddress != null)
            {
                // Handle loopback (localhost)
                if (remoteIpAddress.Equals(IPAddress.IPv6Loopback))
                {
                    return IPAddress.Loopback.ToString();
                }

                // Return the IP address as a string
                return remoteIpAddress.ToString();
            }

            return "Unknown IP";
        }

        private string GetDeviceInfo()
        {
            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

            if (string.IsNullOrEmpty(userAgent))
            {
                return "Unknown Device";
            }

            // Parse the User-Agent string
            var uaParser = Parser.GetDefault();
            ClientInfo clientInfo = uaParser.Parse(userAgent);

            // Get details
            var browser = clientInfo.UA.Family;
            var browserVersion = clientInfo.UA.Major;
            var os = clientInfo.OS.Family;
            var device = clientInfo.Device.Family;

            return $"Browser: {browser} {browserVersion}, OS: {os}, Device: {device}";
        }


        // comapny validate
        [HttpPost]
        [Route("validateCompanyCode")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidateCompanyCodeAsync([FromBody] CompanyCodeRequestModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {


                var companyDetails= await userRepository.ValidateCompanyCodeAsync(model.CompanyCode);

                if (companyDetails== null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Company Code.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Data = new
                {
                    CompanyId = companyDetails.CompanyId,
                    companyname = companyDetails.CompanyName

                    //OfficeTypes = officeTypes
                };
                modelResponse.Message = "Data retrieved successfully.";
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


        //not in used

        [HttpPost("GetLocationByOfficeType")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLocationByOfficeType([FromBody] LocationRequestModel model)
        {
            //decrypt the OfficeTypeId and  CompanyId
            ModelResponse modelResponse = new ModelResponse();






            var locations = await userRepository.GetLocationByOfficeTypeAsync(model.CompanyId, model.OfficeTypeId);

            if (locations.Count == 0)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "No record found";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }



            modelResponse.IsSuccess = true;
            modelResponse.Message = "Location retrieved successfully.";
            modelResponse.StatusCode = 200;
            modelResponse.Data = locations;
            return Ok(modelResponse);


        }

        //not in used

        [Authorize]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                //if (request.UserType == "User")
                //{
                //    request.NewPassword = Encrypt(request.NewPassword);
                //}

                request.UserId = decryptedUserId;
                // Example: Call repo/service to reset password
                var result = await userRepository.ResetPasswordAsync(request);

                if (result != null) //  If reset success
                {
                    response.IsSuccess = true;
                    response.Message = "Password reset successfully.";
                    response.StatusCode = 200;
                }
                else // ❌ If reset failed
                {
                    response.IsSuccess = false;
                    response.Message = "Password reset failed. Invalid request or user not found.";
                    response.StatusCode = 400;
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = $"Error: {ex.Message}";
                response.StatusCode = 500;
            }

            return Ok(response);
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



        [Authorize]
        [HttpPost("verify-old-password")]
        public async Task<IActionResult> VerifyOldPassword([FromBody] VerifyOldPasswordRequest request)
        {
            var response = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                bool isValid = await userRepository.VerifyOldPasswordAsync(
                    decryptedUserId,
                    request.UserType,
                    request.OldPassword
                );

                if (isValid)
                {
                    response.IsSuccess = true;
                    response.Message = "Old password is correct.";
                    response.StatusCode = 200;
                }
                else
                {
                    response.IsSuccess = false;
                    response.Message = "Old password is incorrect.";
                    response.StatusCode = 400;
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = $"Error: {ex.Message}";
                response.StatusCode = 500;
            }
            return Ok(response);
        
        }

        [Authorize]
        [HttpPost("switch-employee-to-admin")]
      
        public async Task<IActionResult> SwitchEmployeeToAdmin(
    [FromBody] SwitchEmployeeToAdminDto model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await userRepository.SwitchEmployeeToAdminAsync(
                   model
                );

                if (result == null || result.IsSuccess == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = result?.Message ?? "Admin switch failed";
                    modelResponse.StatusCode = 400;

                    return StatusCode(400, modelResponse);
                }


                //added code for verfiy otp
                var encryptedUserId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.UserId.ToString());
                var encryptedCompanyId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.CompanyId.ToString());
                var encryptedFinancialYearId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.FinancialYearId.ToString());
                var encryptedLocationId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.LocationId.ToString()); // Use LocationId from request



                var accessToken = tokenService.GenerateAccessToken(encryptedUserId,
                   encryptedLocationId,
                    encryptedCompanyId, encryptedFinancialYearId);
                var refreshToken = tokenService.GenerateRefreshToken();



                modelResponse.IsSuccess = true;
                //modelResponse.Message = "Successfully logged in";
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = 200;
                modelResponse.Data = new
                {
                    result.financialDate1,
                    result.financialDate2,
                    result.UserName,
                    result.UserId,
                    result.OTP,
                    result.LoginType,
                    result.ShowAdminSwitch,
                    result.ContractorApplicable,
                    result.compname,
                    result.FinancialYearId,
                    result.CompanyId,
                    result.fk_CompanyCode,
                    result.contractor_LabelName,
                    result.Vendor_Applicable,
                    result.isAutoEmpcode
,

                    result.LocationId,
                    result.showclientdetails,
                    accessToken,
                    refreshToken,


                };



                // Generate access token

                // Generate refresh token


                return Ok(modelResponse);


                //return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Error switching to admin: {ex.Message}";
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }

        // admin to employe
        [Authorize]
        [HttpPost("SwitchAdmintoEmployeeAsync")]

        public async Task<IActionResult> SwitchAdmintoEmployeeAsync(
       [FromBody] SwitchEmployeeToAdminDto model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await userRepository.SwitchAdmintoEmployeeAsync(
                   model
                );

                if (result == null || result.IsSuccess == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = result?.Message ?? "Employee switch failed";
                    modelResponse.StatusCode = 400;

                    return StatusCode(400, modelResponse);
                }

               //added code 
                var encryptedUserId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.UserId.ToString());
                var encryptedCompanyId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.CompanyId.ToString());
                var encryptedFinancialYearId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.FinancialYearId.ToString());
                var encryptedLocationId = EncryptionStaticHelper.EncryptToUrlSafeBase64(result.LocationId.ToString()); // Use LocationId from request
                var accessToken = tokenService.GenerateAccessToken(encryptedUserId,
                   encryptedLocationId,
                    encryptedCompanyId, encryptedFinancialYearId);
                var refreshToken = tokenService.GenerateRefreshToken();
                modelResponse.IsSuccess = true;
                //modelResponse.Message = "Successfully logged in";
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = 200;
                modelResponse.Data = new
                {
                    result.financialDate1,
                    result.financialDate2,
                    result.UserName,
                    result.UserId,
                    result.LoginType,
                    result.ShowAdminSwitch,
                    result.FinancialYearId,
                    result.CompanyId,
                    result.compcode,
                    result.LocationId,
                    accessToken,
                    refreshToken,


                };

                return Ok(modelResponse);


              
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"Error switching to admin: {ex.Message}";
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }


    }

}
