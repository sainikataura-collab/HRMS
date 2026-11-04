using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveAssignmentController : ControllerBase
    {
        private readonly IleaveAssignmentRepository leaveRepository;

        public LeaveAssignmentController(IleaveAssignmentRepository _leaveRepository)

        {
            leaveRepository = _leaveRepository;
        }

        //get by id emplyee detail
        [HttpGet("{pkEmpId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmployeeLeaveDetailsAsync([FromRoute] string pkEmpId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                EmpdetailMst result = await leaveRepository.GetEmployeeLeaveDetailsAsync(pkEmpId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid emoidId";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "employee detail retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }
        //leave assignment

        //get by id leave 
        [HttpGet("{empId}/{leaveId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> LeaveAssignmentAsync([FromRoute] long leaveId,string empId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                LeaveAssignmentMst result = await leaveRepository.LeaveAssignmentAsync(leaveId,empId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid empId or leaveId";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee leave retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }
        //leave insert


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertEmployeeLeaveAsync([FromBody] List<LeaveDetailMst> leaveDetailMstList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                string? empid = ""; long? leaveid = 0;

                foreach(var item in leaveDetailMstList)
                {
                    empid = item.fk_empid;
                    leaveid = item.fk_leaveid;
                }


                ModelResponse modelValiadte = await leaveRepository.LeaveAssignmentValidateAsync(leaveid, empid);

                if (modelValiadte != null)
                {
                    if(!modelValiadte.IsSuccess)
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = modelValiadte.Message;
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }
                }


                bool isInserted = await leaveRepository.InsertEmployeeLeaveAsync(leaveDetailMstList, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "leave inserted successfully." : "Failed to insert leave.";
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
       
        // Get all leave
        [HttpGet]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string? employeeId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(employeeId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                var (totalCount, leaveDetails) = await leaveRepository.GetAll(pageIndex, pageSize, employeeId);

                // ✅ Fix: Return isSuccess = true when no data is found
                modelResponse.IsSuccess = true;
                modelResponse.Message = leaveDetails == null || !leaveDetails.Any()
                    ? "No records found."
                    : "Employee leave assignments retrieved successfully.";
                modelResponse.Data = leaveDetails ?? new List<LeaveDetailMst>(); // Ensure it's not null
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }




        //get by id
        [HttpGet("GetById/{assignId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetLeaveByIdAsync([FromRoute] string assignId)
        {
            ModelResponse modelResponse = new ModelResponse();


            try
            {
               LeaveDetailMst result = await leaveRepository.GetLeaveAssignmentByIdAsync(assignId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "leave detail retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }

        //for delete

        [HttpDelete("{pk_assignid}")]
        [Authorize]
        public async Task<IActionResult> DeleteLeaveAssignment([FromRoute] string pk_assignid)
        {
            ModelResponse modelResponse = new ModelResponse();
             try
            {
                bool isDeleted = await leaveRepository.DeleteLeaveAssignment(pk_assignid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "leave detail delete successfully." : "Failed to delete leave detail.";
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
        //update
          [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateLeaveAssignmentAsync([FromBody] LeaveDetailMst leaveDetailMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await leaveRepository.UpdateLeaveAssignmentAsync(leaveDetailMst,decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "leave updated successfully." : "Failed to update leave.";
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
