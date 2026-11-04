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
    public class ManpowerController : ControllerBase
    {
        private readonly IManpowerRepository _manpowerRepository;

        public ManpowerController(IManpowerRepository manpowerRepository)
        {
            _manpowerRepository = manpowerRepository;
            
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertManpowerAsync([FromBody] ManpowerMstDataSet model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                bool isInserted = await _manpowerRepository.InsertManpowerAsync(model, decryptedUserId ?? "NA");

                response.IsSuccess = isInserted;
                response.Message = isInserted
                    ? "Manpower request inserted successfully."
                    : "Failed to insert manpower request.";
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
        [Authorize] // Secure endpoint
        public async Task<IActionResult> GetAllManpowerRequests(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedEmpId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var (totalCount, result) = await _manpowerRepository.GetAllManpowerRequestsAsync(pageIndex, pageSize, decryptedEmpId ?? "NA");

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No manpower requests found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Manpower requests retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
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
        [HttpGet("getbyid")]
        [Authorize]
        public async Task<IActionResult> GetManpowerById(long pk_reqid)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await _manpowerRepository.GetManpowerByIdAsync(pk_reqid, decryptedUserId ?? "NA");

                if (result == null)
                {
                    response.IsSuccess = false;
                    response.Message = "No record found.";
                    response.StatusCode = 404;
                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Message = "Record fetched successfully.";
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

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateManpowerAsync([FromBody] ManpowerMstDataSet model, [FromQuery] long pk_reqid)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                bool isUpdated = await _manpowerRepository.UpdateManpowerAsync(pk_reqid, model, decryptedUserId ?? "NA");

                response.IsSuccess = isUpdated;
                response.Message = isUpdated ? "Manpower updated successfully." : "Failed to update manpower.";
                response.StatusCode = isUpdated ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = $"An error occurred: {ex.Message}";
                response.StatusCode = 500;
            }

            return Ok(response);
        }


        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> DeleteManpower(long pk_reqid)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                bool isDeleted = await _manpowerRepository.DeleteManpowerAsync(pk_reqid);

                response.IsSuccess = isDeleted;
                response.Message = isDeleted ? "Deleted successfully." : "Delete failed.";
                response.StatusCode = isDeleted ? 200 : 400;
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
