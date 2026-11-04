using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveTypeController : ControllerBase
    {
        //private readonly ILWFSlabRepository lwfSlabRepository;

        private readonly ILeaveTypeRepository leaveTypeRepository;




        public LeaveTypeController(ILeaveTypeRepository _leaveTypeRepository) 
        {
            leaveTypeRepository = _leaveTypeRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertLeaveTypeAsync([FromBody] LeaveTypeMstDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve User and Location IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedcompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();


                var leaveTypeMaster = request.LeaveTypeMaster;
                var leaveTypeDetailsList = request.LeaveTypeDetails ?? new List<LeaveTypeDetails>(); // Ensure it's not null


                //foreach (var item in leaveTypeDetailsList)
                //{
                //    item.LeaveLimitPerInstance ??= 0;
                //    item.maxcashable = item.maxcashable == 0 ? 0.0m : item.maxcashable;
                //    item.maxhold = item.maxhold == 0 ? 0.0m : item.maxhold;
                //    item.amount = item.amount == 0 ? 0.0m : item.amount;
                //    item.cashable = false;
                //    item.isconvertible ??= false;
                //    item.lvprocessingtype ??= string.Empty;
                //    if (item.totaltimesissue == 0)
                //        item.totaltimesissue = 0;

                //}


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



        //[HttpPost]
        //[Authorize]  // Secured endpoint        
        //public async Task<IActionResult> InsertLeaveTypeAsync([FromBody] LeaveTypeMstDataSet leaveTypeList)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {

        //        //if (leaveTypeList.LeaveTypeDetails == null)
        //        //    leaveTypeList.LeaveTypeDetails.maxcashable = 0;

        //        if (leaveTypeList.LeaveTypeDetails == null)
        //            leaveTypeList.LeaveTypeDetails = new List<LeaveTypeDetails>();

        //        foreach (var detail in leaveTypeList.LeaveTypeDetails)
        //        {
        //            detail.maxcashable = 0;
        //            //detail.cashable = false; // Ensure it is always true or false
        //        }

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve UserId
        //        var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve CompanyId
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve LocationId

        //        bool isInserted = await leaveTypeRepository.InsertLeaveTypeAsync(leaveTypeList, decryptedUserId, decryptedLocationId, decryptedCompanyId);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted ? "Leave Type inserted successfully." : "Failed to insert Leave Type.";
        //        modelResponse.StatusCode = isInserted ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return StatusCode(500, modelResponse);
        //    }
        //}


        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

              
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

               

                var (totalCount, result) = await leaveTypeRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
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
      
        public async Task<IActionResult> UpdateLeaveTypeAsync([FromBody] LeaveTypeMstDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var leaveTypeMaster = request.LeaveTypeMaster;
                var leaveTypeDetailsList = request.LeaveTypeDetails ?? new List<LeaveTypeDetails>(); // Ensure it's not null

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



        //public async Task<IActionResult> UpdateLeaveTypeAsync([FromBody] LeaveTypeMstDataSet leaveTypeList)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the user ID
        //        var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
        //        var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string


        //        bool isUpdated = await leaveTypeRepository.UpdateLeave(leaveTypeList, decryptedUserId, decryptedLocationId);



        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "Leave Type updated successfully." : "Failed to update Leave Type.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return Ok(modelResponse);
        //    }
        //}




        [HttpGet("{pk_leaveid}")]
        [Authorize]
        public async Task<IActionResult> GetByIdForLeaveType([FromRoute] long pk_leaveid, [FromQuery] string?fk_natureid=null)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Await the repository call
                var (leaveType, leaveDetails) = await leaveTypeRepository.GetLeaveTypeById(pk_leaveid,fk_natureid);

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




        //[HttpGet("{fk_leaveid}/{fk_empid}")]
        //[Authorize]
        //public async Task<IActionResult> GetByIdforLeaveTypeDetails([FromRoute] long fk_leaveid, [FromRoute] string fk_empid)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        // Await the repository call
        //        var leaveDetails = await leaveTypeRepository.GetLeaveTypeByIdAsync(fk_leaveid, fk_empid);

        //        if (leaveDetails == null)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Invalid LeaveId or EmployeeId";
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Leave type details retrieved successfully.";
        //        modelResponse.Data = leaveDetails;
        //        modelResponse.StatusCode = 200;
        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        return Ok(modelResponse);
        //    }
        //}

  


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
