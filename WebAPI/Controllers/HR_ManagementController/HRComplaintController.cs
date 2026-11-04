using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HRComplaintController : ControllerBase
    {
        private readonly IHRComplaintRepository _hRComplaintRepository;

        public HRComplaintController(IHRComplaintRepository employeeComplaintRepository)
        {
            _hRComplaintRepository = employeeComplaintRepository;
        }

        // Insert Employee Complaint
        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertEmployeeComplaint([FromBody] HRComplaintMst complaint)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                complaint.fk_locId = decryptedLocationId;
                complaint.fk_userId = decryptedUserId;

                bool isInserted = await _hRComplaintRepository.InsertEmployeeComplaint(complaint);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Employee Complaint inserted successfully." : "Failed to insert Employee Complaint.";
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

        // Get Employee Complaints for Grid
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (totalCount, result) = await _hRComplaintRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee Complaints retrieved successfully.";
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

        // Get Employee Complaint by ID
        [HttpGet("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _hRComplaintRepository.GetById(id);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ID";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee Complaint retrieved successfully.";
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

        // Update Employee Complaint
        [HttpPut]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> UpdateEmployeeComplaint([FromBody] HRComplaintMst complaint)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                complaint.fk_locId = decryptedLocationId;
                complaint.fk_userId = decryptedUserId;

                bool isUpdated = await _hRComplaintRepository.UpdateEmployeeComplaint(complaint);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Employee Complaint updated successfully." : "Failed to update Employee Complaint.";
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

        // Delete Employee Complaint
        [HttpDelete("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteEmployeeComplaint([FromRoute] string id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await _hRComplaintRepository.DeleteEmployeeComplaint(id);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Employee Complaint deleted successfully." : "Failed to delete Employee Complaint.";
                modelResponse.StatusCode = isDeleted ? 200 : 400;
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
