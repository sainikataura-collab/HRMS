using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using HRMSWebAPI.Repository; // Add reference to Repository

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OtpController : ControllerBase
    {
        private readonly IOtpRepository _otpRepository; // Inject IOtpRepository

        public OtpController(IOtpRepository otpRepository)
        {
            _otpRepository = otpRepository;
        }

        public class SendOtpRequest
        {
            public string MobileNo { get; set; }
            public string UserName { get; set; }
        }


        public class VerifyOtpRequest
        {
            public string MobileNo { get; set; }
            public string Otp { get; set; }
        }


        //[HttpPost("SendOtp")]
        //public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
        //{
        //    if (string.IsNullOrEmpty(request.MobileNo))
        //    {
        //        return BadRequest(new { isSuccess = false, message = "Mobile number is required" });
        //    }

        //    Random random = new Random();
        //    string generatedOtp = random.Next(100000, 999999).ToString();

        //    // Save OTP to Database via Repository
        //    await _otpRepository.InsertOTPAsync(request.MobileNo, generatedOtp, 5); // 5 mins validity

        //    // =========================================================================
        //    // C# CODE TO HIT THE SMSCOLLECTION API
        //    // =========================================================================
        //    try
        //    {
        //        using (var httpClient = new System.Net.Http.HttpClient())
        //        {

        //            string messageText = $"DELIVERED: Dear Customer, AWB {generatedOtp} is delivered. Track: deliveryplus.in -(IDP)";
        //            string encodedMessage = System.Net.WebUtility.UrlEncode(messageText);


        //            string smsUsername = "IDTP";
        //            string smsPassword = "622";
        //            string senderId = "INFYP";
        //            string templateId = "179154418638253";

        //            // Construct the full URL
        //            string smsUrl = $"https://sms.smscollection.com/api?user={smsUsername}&password={smsPassword}&sender={senderId}&text={encodedMessage}&PhoneNumber={request.MobileNo}&track=1&dlttemplateid={templateId}";

        //            // Send the GET Request
        //            var response = await httpClient.GetAsync(smsUrl);

        //            if (!response.IsSuccessStatusCode)
        //            {
        //                // Log error if needed, but for now we proceed
        //                Console.WriteLine("Failed to send SMS API hit. Status code: " + response.StatusCode);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Error sending SMS: " + ex.Message);
        //    }
        //    // =========================================================================

        //    return Ok(new
        //    {
        //        isSuccess = true,
        //        message = "OTP sent successfully."
        //        data = new { otp = generatedOtp } 
        //    });
        //}



        [HttpPost("SendOtp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.MobileNo))
            {
                return Ok(new { isSuccess = false, message = "Mobile number is required" });
            }

            // Check if mobile number is already used
            bool isMobileUsed = await _otpRepository.CheckMobileExistsAsync(request.MobileNo);
            if (isMobileUsed)
            {
                return Ok(new { isSuccess = false, message = "mobile number already used please enter different number" });
            }

            Random random = new Random();
            string generatedOtp = random.Next(100000, 999999).ToString();

            // Save OTP to Database via Repository
            await _otpRepository.InsertOTPAsync(request.MobileNo, generatedOtp, 5); // 5 mins validity

            // =========================================================================
            // C# CODE TO HIT THE SMSCOLLECTION API
            // =========================================================================
            try
            {
                using (var httpClient = new System.Net.Http.HttpClient())
                {
                    string nameToUse = string.IsNullOrWhiteSpace(request.UserName) ? "User" : request.UserName;
                    string messageText = $"Dear {nameToUse}, your OTP for HRMS onboarding verification is {generatedOtp}. It is valid for 5 minutes. Please do not share it with anyone. - Identifyplus Team";
                    string encodedMessage = System.Net.WebUtility.UrlEncode(messageText);


                    string smsUsername = "IDPOTP";
                    string smsPassword = "620612";
                    string senderId = "IDNFYP";
                    string templateId = "1777179154418638253";

                    // Construct the full URL
                    string smsUrl = $"https://sms.smscollection.com/api?user={smsUsername}&password={smsPassword}&sender={senderId}&text={encodedMessage}&PhoneNumber={request.MobileNo}&track=1&dlttemplateid={templateId}";

                    // Send the GET Request
                    var response = await httpClient.GetAsync(smsUrl);

                    if (!response.IsSuccessStatusCode)
                    {
                        // Log error if needed, but for now we proceed
                        Console.WriteLine("Failed to send SMS API hit. Status code: " + response.StatusCode);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending SMS: " + ex.Message);
            }
            // =========================================================================

            return Ok(new
            {
                isSuccess = true,
                message = "OTP sent successfully."

            });
        }


        // 2. API for Verifying OTP
        [HttpPost("VerifyOtp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.MobileNo) || string.IsNullOrEmpty(request.Otp))
            {
                return Ok(new { isSuccess = false, message = "Mobile number and OTP are required" });
            }

            // Verify via Database Repository
            bool isVerified = await _otpRepository.VerifyOTPAsync(request.MobileNo, request.Otp);

            if (isVerified)
            {
                return Ok(new
                {
                    isSuccess = true,
                    message = "OTP Verified Successfully"
                });
            }

           
            return Ok(new { isSuccess = false, message = "OTP Expired or Invalid" });
        }
    }
}

