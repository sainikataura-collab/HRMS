
    using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RestrictedHolidaysController : ControllerBase
    {
        private readonly IRestrictedHolidaysRepository restrictedHolidaysRepository;
        public RestrictedHolidaysController(IRestrictedHolidaysRepository _restrictedHolidaysRepository)

        {
            restrictedHolidaysRepository = _restrictedHolidaysRepository;
        }




        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(string? fk_yearid)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await restrictedHolidaysRepository.GetAll(fk_yearid, decryptedUserId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Restricted Holiday List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Server error: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        //For Gazatted


        [HttpGet("Gazatted")]
        [Authorize]
        public async Task<IActionResult> GazettedGetAll(string? fk_yearid)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await restrictedHolidaysRepository.GetAllGazatted(fk_yearid, decryptedUserId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = " Gazetted Holiday List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Server error: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

    }
}
