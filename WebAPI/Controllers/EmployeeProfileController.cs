using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeProfileController : ControllerBase
    {
        private readonly IEmployeeProfileRepository _employeeProfileRepository;

        public EmployeeProfileController(IEmployeeProfileRepository employeeProfileRepository)
        {
            _employeeProfileRepository = employeeProfileRepository;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetEmployeeProfileByUserIdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // 🔓 Decrypt UserId from middleware / token context
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(userId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid UserId.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // 📦 Fetch employee profile using userId (assumed to be pk_empid)
                var result = await _employeeProfileRepository.GetEmployeeFullProfileByIdAsync(userId);

                if (result == null || result.EmployeeProfileMst == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No profile found for this employee.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee profile retrieved successfully.";
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
