using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AttendanceConfigController : ControllerBase
    {

        private readonly IAttendanceConfigRepository attendanceConfigRepository;


        public AttendanceConfigController(IAttendanceConfigRepository _attendanceConfigRepository)

        {
            attendanceConfigRepository = _attendanceConfigRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertAttendanceConfigAsync([FromBody] AttendanceConfigMst attendanceConfigs)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                bool isInserted = await attendanceConfigRepository.InsertAttendanceConfigAsync(attendanceConfigs, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Attendance configuration inserted successfully." : "Failed to insert attendance configuration.";
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

        // ✅ Get Leave Config for Edit
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAttendanceConfigAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await attendanceConfigRepository.GetAttendanceConfigByCompanyAsync(decryptedCompanyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No attendance configuration found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance configuration retrieved successfully.";
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

        // ✅ Update Leave Config
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateAttendanceConfigAsync([FromBody] AttendanceConfigMst attendanceConfigs)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                bool isUpdated = await attendanceConfigRepository.UpdateAttendanceConfigAsync(attendanceConfigs, decryptedCompanyId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Attendance configuration updated successfully." : "Failed to update attendance configuration.";
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




    }
}
