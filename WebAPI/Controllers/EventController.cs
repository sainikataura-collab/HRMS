using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly IEventRepository _birthdayRepo;

        public EventController(IEventRepository birthdayRepo)
        {
            _birthdayRepo = birthdayRepo;
        }

        // 🎂 Get Today’s Birthdays
        [HttpGet("GetTodayBirthday")]
        [Authorize] // keep if you want security
        public async Task<IActionResult> GetTodayBirthday()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _birthdayRepo.GetTodayBirthdaysAsync();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No birthdays found for today.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Today's birthdays retrieved successfully.";
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

        // 🎉 Get Upcoming Birthdays (Next 10 Days)
        [HttpGet("GetUpcomingBirthday")]
        [Authorize] // keep if you want security
        public async Task<IActionResult> GetUpcomingBirthday()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _birthdayRepo.GetUpcomingBirthdaysAsync();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No upcoming birthdays found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Upcoming birthdays retrieved successfully.";
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


        [HttpGet("GetEvents")]
        [Authorize] // keep if you want security
        public async Task<IActionResult> GetEvents()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _birthdayRepo.GetEvents();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No event found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "events retrieved successfully.";
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


        [HttpGet("GetAniversary")]
        [Authorize] // keep if you want security
        public async Task<IActionResult> GetAniversary()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _birthdayRepo.GetAniversary();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Aniversary found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Aniversary retrieved successfully.";
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


        [HttpGet("GetActivity")]
        [Authorize] // keep if you want security
        public async Task<IActionResult> RecentAcitvityofHR()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _birthdayRepo.RecentAcitvityofHR();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No activity found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Activity retrieved successfully.";
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


    }
}
