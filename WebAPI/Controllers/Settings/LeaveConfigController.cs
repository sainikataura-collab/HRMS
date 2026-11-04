using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveConfigController : ControllerBase
    {
        private readonly ILeaveConfigRepository leaveConfigRepository;

        public LeaveConfigController(ILeaveConfigRepository _leaveConfigRepository)
        {
            this.leaveConfigRepository = _leaveConfigRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertLeaveConfigAsync([FromBody] List<LeaveConfigMst> leaveConfigList)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (leaveConfigList == null || leaveConfigList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Leave config list cannot be empty.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                bool isInserted = await leaveConfigRepository.InsertLeaveConfigAsync(leaveConfigList, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Leave config inserted successfully." : "Failed to insert leave config.";
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


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetLeaveConfigAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                LeaveConfigMst result = await leaveConfigRepository.GetLeaveConfigByCompanyIdAsync(decryptedCompanyId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Leave config not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave config retrieved successfully.";
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

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateLeaveConfigAsync([FromBody] LeaveConfigMst leaveConfigObj)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (leaveConfigObj == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Leave config object is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                List<LeaveConfigMst> leaveConfigList = new List<LeaveConfigMst> { leaveConfigObj };

                bool isUpdated = await leaveConfigRepository.UpdateLeaveConfigAsync(leaveConfigList, decryptedCompanyId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Leave config updated successfully." : "Failed to update leave config.";
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
