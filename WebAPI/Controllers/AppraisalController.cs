using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AppraisalController : ControllerBase
    {
        private readonly IAppraisalRepository _appraisalRepository;

        public AppraisalController(IAppraisalRepository appraisalRepository)
        {
            _appraisalRepository = appraisalRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertAppraisalAsync([FromBody] AppraisalMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                model.fk_insUserID = decryptedUserId;
                model.fk_insDateID = decryptedLocId;

                bool isInserted = await _appraisalRepository.InsertAppraisalAsync(model);
                response.IsSuccess = isInserted;
                response.Message = isInserted ? "Appraisal inserted successfully." : "Failed to insert appraisal.";
                response.StatusCode = isInserted ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllAppraisals(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var (totalCount, result) = await _appraisalRepository.GetAllAppraisalsAsync(pageIndex, pageSize);
                if (result == null || !result.Any())
                {
                    response.IsSuccess = false;
                    response.Message = "No records found.";
                    response.StatusCode = 404;
                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Message = "Appraisal list fetched successfully.";
                response.Data = result;
                response.TotalCount = totalCount;
                response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpGet("{appraisalId}")]
        [Authorize]
        public async Task<IActionResult> GetAppraisalByIdAsync([FromRoute] long appraisalId)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var result = await _appraisalRepository.GetAppraisalByIdAsync(appraisalId);

                if (result == null)
                {
                    response.IsSuccess = false;
                    response.Message = "Appraisal not found.";
                    response.StatusCode = 404;
                }
                else
                {
                    response.IsSuccess = true;
                    response.Message = "Appraisal retrieved successfully.";
                    response.Data = result;
                    response.StatusCode = 200;
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateAppraisalAsync([FromBody] AppraisalMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                model.fk_updUserID = decryptedUserId;
                model.fk_updDateID = decryptedLocId;

                bool isUpdated = await _appraisalRepository.UpdateAppraisalAsync(model);
                response.IsSuccess = isUpdated;
                response.Message = isUpdated ? "Appraisal updated successfully." : "Failed to update appraisal.";
                response.StatusCode = isUpdated ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpDelete("{appraisalId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAppraisalAsync([FromRoute] long appraisalId)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                bool isDeleted = await _appraisalRepository.DeleteAppraisalAsync(appraisalId);
                response.IsSuccess = isDeleted;
                response.Message = isDeleted ? "Appraisal deleted successfully." : "Failed to delete appraisal.";
                response.StatusCode = isDeleted ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }
    }
}
