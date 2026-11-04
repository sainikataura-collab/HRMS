using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveTypeClientController : ControllerBase
    {

      

        private readonly IleaveTypeClientRepository leaveTypeRepository;




        public LeaveTypeClientController(IleaveTypeClientRepository _leaveTypeRepository)
        {
            leaveTypeRepository = _leaveTypeRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertLeaveTypeAsync([FromBody] LeavetypeClientMstDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve User and Location IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedcompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();


                var leaveTypeMaster = request.LeaveTypeMaster;
                var leaveTypeDetailsList = request.LeaveTypeDetails ?? new List<LeaveTypeClientDetails>(); // Ensure it's 


                // Call repository method to insert
                bool isInserted = await leaveTypeRepository.InsertLeaveTypeAsync(
                    leaveTypeMaster,
                    leaveTypeDetailsList,
                    decryptedUserId,
                    decryptedLocationId,
                    decryptedcompanyId
                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isInserted,
                    Message = isInserted ? "Leave type inserted successfully." : "Failed to insert leave type.",
                    StatusCode = isInserted ? 200 : 400
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }



    
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string? fk_costcentreid = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId



                var (totalCount, result) = await leaveTypeRepository.GetAll(pageIndex, pageSize, decryptedCompanyId, fk_costcentreid);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave type List retrieved successfully.";
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


        [HttpPut]
        [Authorize]  // Secured endpoint [HttpPost]

        public async Task<IActionResult> UpdateLeaveTypeAsync([FromBody] LeavetypeClientMstDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var leaveTypeMaster = request.LeaveTypeMaster;
                var leaveTypeDetailsList = request.LeaveTypeDetails ?? new List<LeaveTypeClientDetails>(); // Ensure it's not null

                // Retrieve User and Location IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();




                // Call repository method to insert
                bool isUpdate = await leaveTypeRepository.updateLeaveTypeAsync(
                    leaveTypeMaster,
                    leaveTypeDetailsList,
                    decryptedUserId,
                    decryptedLocationId
                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isUpdate,
                    Message = isUpdate ? "Leave type update successfully." : "Failed to update leave type.",
                    StatusCode = isUpdate ? 200 : 400
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }



       

        [HttpGet("{pk_leaveid}")]
        [Authorize]
        public async Task<IActionResult> GetByIdForLeaveType([FromRoute] long pk_leaveid, [FromQuery] string? fk_natureid = null)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Await the repository call
                var (leaveType, leaveDetails) = await leaveTypeRepository.GetLeaveTypeById(pk_leaveid, fk_natureid);

                if (leaveType == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid LeaveId";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave type details retrieved successfully.";
                modelResponse.Data = new
                {
                    LeaveType = leaveType,
                    LeaveTypeDetails = leaveDetails
                };
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



        [HttpGet("LeaveTypeClientWise/{fk_costcentreid}")]
        [Authorize]
        public async Task<IActionResult> LeaveTypeClientWise([FromRoute] string? fk_costcentreid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var result = await leaveTypeRepository.LeaveTypeClientWiseAsync(fk_costcentreid, decryptedCompanyId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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











        [HttpDelete("{pk_leaveid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] long pk_leaveid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await leaveTypeRepository.Delete(pk_leaveid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "LeaveType detail delete successfully." : "Failed to delete LeaveType detail.";
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
