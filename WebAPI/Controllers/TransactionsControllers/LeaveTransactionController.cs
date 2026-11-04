using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveTransactionController : ControllerBase
    {
        private readonly ILeaveTransactionRepository leaveTransactionRepository;

        public LeaveTransactionController(ILeaveTransactionRepository _leaveTransactionRepository)
        {
            leaveTransactionRepository = _leaveTransactionRepository;
        }

        [HttpGet("LeavePendingList")]
        [Authorize]
        public async Task<IActionResult> LeavePendingList()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Retrieve the CompanyId
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedCompanyId) || string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid User or CompanyId.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await leaveTransactionRepository.GetPendingLeave(decryptedUserId, decryptedCompanyId);

                if (result.Leaves == null || !result.Leaves.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Pending Leave List retrieved successfully.";
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
        //Get ALL

        [HttpGet("GetLeaveTakenList/{fk_empid}")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string fk_empid = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(fk_empid))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "LeaveTaken List ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                var (totalCount, leaveTakenDetails) = await leaveTransactionRepository.GetAllLeaveTaken(pageIndex, pageSize, fk_empid);


                modelResponse.IsSuccess = true;
                modelResponse.Message = leaveTakenDetails == null || !leaveTakenDetails.Any()
                    ? "No records found."
                    : "Employee leave taken list retrieved successfully.";
                modelResponse.Data = leaveTakenDetails ?? new List<LeaveTakenDetails>(); // Ensure it's not null
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





        //Get LeaveBalance

        [HttpGet("GetLeaveBalnace")]
        [Authorize]
        public async Task<IActionResult> GetLeaveBalance([FromQuery] string fk_empid, [FromQuery] long fk_leaveId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var leaveBalance = await leaveTransactionRepository.GetLeaveBalance(fk_empid, fk_leaveId);

                if (leaveBalance == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Employee Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "LeaveBalance  retrieved successfully.";
                modelResponse.Data = new
                {
                    leaveBalance = leaveBalance,
                };
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




        //Get Employee Details

        [HttpGet("{fk_empid}")]
        [Authorize]
        public async Task<IActionResult> GetLeaveTakenByEmpId([FromRoute] string fk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var (employeeDetails, leaveDetails) = await leaveTransactionRepository.GetEmployeeLeaveDetails(fk_empid);

                if (employeeDetails == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Employee Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "LeaveTaken details retrieved successfully.";
                modelResponse.Data = new
                {
                    Employee = employeeDetails,
                    LeaveDetails = leaveDetails
                };
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



        //get by Id

        [HttpGet("GetById/{pk_leavetakenid}")]
        [Authorize]
        public async Task<IActionResult> GetById([FromRoute] string pk_leavetakenid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var (employeeDetails, leaveMaster, leaveDetails) = await leaveTransactionRepository.GetById(pk_leavetakenid);

                if (employeeDetails == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record Found Or Invalid Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "LeaveTaken data retrieved successfully.";
                modelResponse.Data = new
                {
                    Employee = employeeDetails,
                    LeaveTakemMster = leaveMaster,
                    LeaveTakenDetails = leaveDetails
                };
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


        // Delete 


        [HttpDelete("Delete/{pk_leavetakenid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string pk_leavetakenid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                bool isDeleted = await leaveTransactionRepository.Delete(pk_leavetakenid, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "LeaveTaken detail delete successfully." : "Failed to delete LeaveTaken detail.";
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



        //End



        //EmpLeavesOnDates

        [HttpGet("EmpLeavesOnDates")]
        [Authorize]
        public async Task<IActionResult> EmpLeavesOnDates([FromQuery] string fk_empid, [FromQuery] long fk_leaveid, [FromQuery] DateTime datefrom, [FromQuery] DateTime dateto)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var message = await leaveTransactionRepository.ValidateLeaveTakenDateNew(fk_empid, fk_leaveid, datefrom, dateto);

                if (message != "")
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = message;
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                var (LeaveDates, leaveMaster, employeeDetails) = await leaveTransactionRepository.EmpLeavesOnDates(fk_empid, fk_leaveid, datefrom, dateto);

                if (LeaveDates == null || LeaveDates.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No leave records found for the given input.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave details Date retrieved successfully.";
                modelResponse.Data = new
                {
                    LeaveTakenDates = LeaveDates,
                    LeaveTakenMster = leaveMaster,
                    Employee = employeeDetails
                };
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


        [HttpPost("InsertLeaveTaken")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertLeaveTakenAsync([FromBody] LeavesTransactionDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Extract the master and detail records from the request
                var leaveTakenMasters = request.LeavesTakenMasters;
                var leaveTakenDetailsList = request.LeaveTakenDetails ?? new List<SAL_LeavesTaken_Details>(); // Ensure it's not null

                // Retrieve User, Location, and Company IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Assuming this is correctly stored

                leaveTakenMasters.fk_finid = decryptedFinancialYearId;

                // Call repository method to insert
                ModelResponse response = await leaveTransactionRepository.InsertLeaveTypeAsync(
                    leaveTakenMasters,
                    leaveTakenDetailsList,
                    decryptedUserId,
                    decryptedLocationId
                );

                // Return response based on the insertion result
                return Ok(new ModelResponse
                {
                    IsSuccess = response.IsSuccess,
                    Message = response.Message,

                    StatusCode = response.IsSuccess ? 200 : 400
                });
            }
            catch (Exception ex)
            {
                // Return internal server error if exception occurs
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }

        //


        //update LeaveTaken

        [HttpPut("UpdateLeaveTaken")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateLeaveTakenAsync([FromBody] LeavesTransactionDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var leaveTakenMaster = request.LeavesTakenMasters;
                var leaveTakenDetailsList = request.LeaveTakenDetails ?? new List<SAL_LeavesTaken_Details>(); // Ensure it's not null


                // Retrieve User, Location, and Company IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Assuming this is correctly stored

                leaveTakenMaster.fk_finid = decryptedFinancialYearId;

                // Call repository method to update
                bool isUpdate = await leaveTransactionRepository.UpdateLeaveTakenAsync(
                    leaveTakenMaster,
                    leaveTakenDetailsList,
                    decryptedUserId,
                    decryptedLocationId
                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isUpdate,
                    Message = isUpdate ? "Leave taken updated successfully." : "Failed to update leave taken.",
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


        //


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetLeavePending()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Retrieve the CompanyId
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedCompanyId) || string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid User or CompanyId.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await leaveTransactionRepository.GetPendingLeave(decryptedUserId, decryptedCompanyId);

                if (result.Leaves == null || !result.Leaves.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Pending Leave List retrieved successfully.";
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



        //For Approve Pending Leave 
        [HttpPost("ApprovePendingLeave")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> ApprovePendingLeaveAsync([FromBody] long pk_leaveappid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var fkUserID = HttpContext.Items["DecryptedUserId"]?.ToString();
                var fkLocID = HttpContext.Items["DecryptedLocationId"]?.ToString();

                // Call the approvePendingLeave method
                ModelResponse response = await leaveTransactionRepository.approvePendingLeave(pk_leaveappid, fkUserID, fkLocID);

                modelResponse.IsSuccess = response.IsSuccess;
                modelResponse.Message = response.Message;
                modelResponse.StatusCode = response.IsSuccess ? 200 : 400;

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

        // Delete Approve Pendind Leave

        [HttpDelete("{pk_leaveappid}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] long pk_leaveappid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                ModelResponse response = await leaveTransactionRepository.DeleteLeavePendingMstAsync(pk_leaveappid);

                modelResponse.IsSuccess = response.IsSuccess;
                modelResponse.Message = response.Message;
                modelResponse.StatusCode = response.IsSuccess ? 200 : 400;
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
