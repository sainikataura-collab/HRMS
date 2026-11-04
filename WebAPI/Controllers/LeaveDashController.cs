using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveDashController : ControllerBase
    {
        private readonly ILeaveDashReposoitory leaveDashRepository;

        public LeaveDashController(ILeaveDashReposoitory _leaveDashRepository)
        {
            leaveDashRepository = _leaveDashRepository;
        }

        //[HttpGet]
        //[Authorize]  // secured endpoint
        //public async Task<IActionResult> GetLeaveDashboard(int month, int year)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // logged-in userId

        //        var result = await leaveDashRepository.GetLeaveDashboardAsync(month, year, decryptedUserId);

        //        if (result == null || (result.LeaveSummary == null && (result.LeaveTrend == null || !result.LeaveTrend.Any())))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No record found.";
        //            modelResponse.StatusCode = 404;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Leave Dashboard Details retrieved successfully.";
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


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetLeaveDashboard(int month, int year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                var result = await leaveDashRepository.GetLeaveDashboardAsync(month, year, decryptedUserId);


                if (result == null || (result.LeaveSummary == null && (result.LeaveTrend == null || !result.LeaveTrend.Any())))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave Dashboard Details retrieved successfully.";
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



        [HttpGet("GetUserDashboard")]
        [Authorize]
        public async Task<IActionResult> GetUserDashboard(int month, int year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get logged-in user (if decrypted ID is stored in HttpContext)
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await leaveDashRepository.GetUserDashboardAsync(month, year, decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "User Dashboard data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpGet("GetHRDashboard")]
        [Authorize]
        public async Task<IActionResult> GetHRDashboardAsync(int month, int year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get logged-in user (if decrypted ID is stored in HttpContext)
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await leaveDashRepository.GetHRDashboardAsync(month, year, decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "HR Dashboard data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpGet("GetTaskboxDashboard")]
        [Authorize]
        public async Task<IActionResult> GetTaskboxDashboard(int month, int year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get logged-in user (if decrypted ID is stored in HttpContext)

                var result = await leaveDashRepository.GetTaskboxDashboard(month, year);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Taskbox Dashboard data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpGet("GetEmpmanagementDashboard")]
        [Authorize]
        public async Task<IActionResult> GetEmpmanagementDashboard(int month, int year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get logged-in user (if decrypted ID is stored in HttpContext)
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await leaveDashRepository.GetEmpmanagementDashboard(month, year, decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee Management Dashboard data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpGet("GetAttendanceDashboard")]
        [Authorize]
        public async Task<IActionResult> GetAttendanceDashboard(int month, int year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get logged-in user (if decrypted ID is stored in HttpContext)
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await leaveDashRepository.GetAttendanceDashboard(month, year, decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance Management Dashboard data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        //leave admin added 3/3/2025
        [HttpGet("GetleaveDashboard")]
        [Authorize]
        public async Task<IActionResult> GetleaveDashboard(int month, int year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get logged-in user (if decrypted ID is stored in HttpContext)
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await leaveDashRepository.GetleaveDashboard(month, year, decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave Management Dashboard data retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


    }
}
