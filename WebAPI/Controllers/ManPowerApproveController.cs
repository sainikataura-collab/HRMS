using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ManPowerApproveController : ControllerBase
    {
        private readonly IManPowerApproveRepository _manPowerApproveRepository;

        public ManPowerApproveController(IManPowerApproveRepository manPowerApproveRepository)
        {
            _manPowerApproveRepository = manPowerApproveRepository;

        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertJobRequisitionApprovalAsync([FromBody] ManPowerApproveMstApprovalDataSet model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedEmpId = HttpContext.Items["DecryptedUserId"]?.ToString();

                model.JobRequisitionApproval[0].fk_empId = decryptedEmpId;

                bool isInserted = await _manPowerApproveRepository.InsertJobRequisitionApprovalAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted
                    ? "Job requisition approval inserted successfully."
                    : "Failed to insert job requisition approval.";
                response.StatusCode = isInserted ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = $"An error occurred: {ex.Message}";
                response.StatusCode = 500;
            }

            return Ok(response);
        }


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllManpowerApprovalGrid()
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrWhiteSpace(decryptedUserId))
                {
                    response.IsSuccess = false;
                    response.Message = "Invalid user context.";
                    response.StatusCode = 401;
                    return Ok(response);
                }

                var result = await _manPowerApproveRepository.GetAllManpowerApprovalAsync(decryptedUserId);

                if (result == null ||
                    (result.ManPowerApproveMstFrist.Count == 0 && result.ManPowerApproveMstFristSecond.Count == 0))
                {
                    response.IsSuccess = false;
                    response.Message = "No record found.";
                    response.StatusCode = 404;
                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Message = "Records fetched successfully.";
                response.Data = result;
                response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = $"An error occurred: {ex.Message}";
                response.StatusCode = 500;
            }

            return Ok(response);
        }

    }
}
