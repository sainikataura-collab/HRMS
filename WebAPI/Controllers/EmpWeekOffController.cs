using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmpWeekOffController : ControllerBase
    {
        private readonly IEmpWeekOffRepository empWeekOffRepository;

        public EmpWeekOffController(IEmpWeekOffRepository _empWeekOffRepository)
        {
            this.empWeekOffRepository = _empWeekOffRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertEmpWeeklyOffAsync([FromBody] List<EmpWeekOffMst> empWeekOffMstList)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                // Validate input
                if (empWeekOffMstList == null || empWeekOffMstList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Weekly off list cannot be empty";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }
                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }
                // Call repository method
                bool isInserted = await empWeekOffRepository.InsertEmpWeeklyOffAsync( empWeekOffMstList, decryptedUserId, decryptedLocationId );

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted? "Employee weekly off inserted successfully.": "Failed to insert employee weekly off";
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
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString(); // Retrieve the LocationId

                // Validate LocationId
                if (string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Location ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method
                var (totalCount, result) = await empWeekOffRepository.GetAllEmpWeeklyOff( pageIndex,pageSize,decryptedLocationId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No employee weekly off records found.";
                    modelResponse.StatusCode = 404; // Changed to 404 for "Not Found"
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee Weekly Off List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
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

        [HttpGet("{empWoffId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmpWeeklyOffByIdAsync([FromRoute] string empWoffId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Validate input
                if (string.IsNullOrEmpty(empWoffId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee Weekly Off ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method
                EmpWeekOffMst result = await empWeekOffRepository.GetEmpWeeklyOffByIdAsync(empWoffId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Employee Weekly Off ID";
                    modelResponse.StatusCode = 404; // Changed to 404 for not found
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee Weekly Off detail retrieved successfully.";
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
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> UpdateEmpWeeklyOffAsync([FromBody] EmpWeekOffMst empWeekOffMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                // Validate inputs
                if (empWeekOffMst == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee Weekly Off data is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Set update fields
                empWeekOffMst.fk_upduserid = decryptedUserId;

                // Create list for repository method
                List<EmpWeekOffMst> empWeekOffMstList = new() { empWeekOffMst };

                // Call repository method
                bool isUpdated = await empWeekOffRepository.UpdateEmpWeeklyOffAsync(
                    empWeekOffMstList,
                    decryptedUserId,
                    decryptedLocationId
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated? "Employee Weekly Off updated successfully.": "Failed to update Employee Weekly Off.";
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

        [HttpDelete("{empWoffId}")]  // Changed "woffId" to "empWoffId"
        [Authorize]                  // Kept same authorization attribute
        public async Task<IActionResult> DeleteEmpWeeklyOffAsync([FromRoute] string empWoffId)  // Changed method name and parameter
        {
            ModelResponse modelResponse = new ModelResponse();  // Kept same response model initialization
            try  // Kept same try block structure
            {
                bool isDeleted = await empWeekOffRepository.DeleteEmpWeeklyOffAsync(empWoffId);  // Changed to match repository method name and parameter

                modelResponse.IsSuccess = isDeleted;  // Kept same success assignment
                modelResponse.Message = isDeleted ? "Employee Weekly Off detail deleted successfully." : "Failed to delete Employee Weekly Off detail.";  // Updated message text
                modelResponse.StatusCode = isDeleted ? 200 : 400;  // Kept same status code logic
                return Ok(modelResponse);  // Kept same return statement
            }
            catch (Exception ex)  // Kept same catch block structure
            {
                modelResponse.IsSuccess = false;  // Kept same failure assignment
                modelResponse.Message = ex.Message;  // Kept same exception message
                modelResponse.StatusCode = 500;  // Kept same error status code

                return Ok(modelResponse);  // Kept same return statement
            }
        }









    }


}

