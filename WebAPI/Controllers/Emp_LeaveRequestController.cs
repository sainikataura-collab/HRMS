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
    public class Emp_LeaveRequestController : ControllerBase
    {

        private readonly IEmp_LeaveRequestRepository emp_LeaveRequestRepository;
        private readonly AppSettings appSettings;


        public Emp_LeaveRequestController(IEmp_LeaveRequestRepository _emp_LeaveRequestRepository, IOptions<AppSettings> _appSettings)

        {
            emp_LeaveRequestRepository = _emp_LeaveRequestRepository;
            appSettings = _appSettings.Value;
        }

        [HttpPost("ApproveOrRejectAttendance")]
        [Authorize]
        public async Task<IActionResult> ApproveOrRejectAttendanceAsync([FromQuery] long pk_inoutid, [FromQuery] int approvalOrder)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await emp_LeaveRequestRepository.ApproveOrRejectAttendance(pk_inoutid, approvalOrder);

                if (result != null)
                {
                    modelResponse.IsSuccess = result.IsSuccess == 1; // SP returns 1 for success
                    modelResponse.Message = result.Message ?? "Operation completed.";
                    modelResponse.StatusCode = modelResponse.IsSuccess ? 200 : 400;
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No response from stored procedure.";
                    modelResponse.StatusCode = 400;
                }

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


        [HttpPost("ApproveOrRejectShortLeave")]
        [Authorize]
        public async Task<IActionResult> ApproveOrRejectShortLeaveAsync([FromQuery] string pk_shortLeaveId, [FromQuery] int approvalOrder)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await emp_LeaveRequestRepository.ApproveOrRejectShortLeave(pk_shortLeaveId, approvalOrder);

                if (result != null)
                {
                    modelResponse.IsSuccess = result.IsSuccess == 1; // SP should return 1 for success
                    modelResponse.Message = result.Message ?? "Operation completed.";
                    modelResponse.StatusCode = modelResponse.IsSuccess ? 200 : 400;
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No response from stored procedure.";
                    modelResponse.StatusCode = 400;
                }

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

        [HttpPost("InsertLeaveApply")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertEmployeeLeaveReqAsync([FromBody] Emp_LeaverRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Extract the master and detail records from the request
                var leaveApplyMasters = request.sAL_Leave_Apply;
                var leaveApplyDetailsList = request.sAL_Leave_Apply_Details ?? new List<SAL_Leave_Apply_Details>(); // Ensure it's not null

                // Retrieve User, Location, and Company IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Assuming this is correctly stored

                leaveApplyMasters.fk_finid = decryptedFinancialYearId;
                leaveApplyMasters.fk_empid = decryptedUserId;

                // Call repository method to insert
                var response = await emp_LeaveRequestRepository.InsertLeaveTypeAsync(
                    leaveApplyMasters,
                    leaveApplyDetailsList

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



        [HttpGet("ApproveComOff")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ApproveComOff()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var result = await emp_LeaveRequestRepository.GetAll_ApprovalCompOffAsync(decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approval List Details retrieved successfully.";
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














        [HttpGet("ApprovalshortLeave")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllAproval_shortLeaveAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var result = await emp_LeaveRequestRepository.GetAll_Approval_ShortLeaveAsync(decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approval List Details retrieved successfully.";
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









        [HttpGet("GetAllLeaveDetails")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllleavedetailsAsync(
        [FromQuery] int? month, [FromQuery] int? year,[FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 10, [FromQuery] string fk_empid = "", [FromQuery] string? fk_finid = ""
        )
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Assuming this is correctly stored

                fk_empid = decryptedUserId;
                fk_finid = decryptedFinancialYearId;

                var (totalCount, employees) = await emp_LeaveRequestRepository.GetAllEmp_LeaveDetailsAsync(
                    pageIndex, pageSize, fk_empid, fk_finid,month,year
                );

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave details list retrieved successfully.";
                modelResponse.Data = employees;

                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpGet("GetAllLeaveRequest")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEmployeesAsync(
    [FromQuery] int pageIndex,
    [FromQuery] int pageSize, [FromQuery] string fk_empid, [FromQuery] string? fk_finid, [FromQuery] string? status, [FromQuery] int? month,[FromQuery] int? year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Assuming this is correctly stored

                fk_empid = decryptedUserId;
                fk_finid = decryptedFinancialYearId;

                var (totalCount, employees) = await emp_LeaveRequestRepository.GetAllEmp_LeaveReqAsync(
                    pageIndex, pageSize, fk_empid, fk_finid, status, month, year
                );

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave request list retrieved successfully.";
                modelResponse.Data = employees;

                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpGet("Emp_GetLeaveBalnace")]
        [Authorize]
        public async Task<IActionResult> GetLeaveBalance([FromQuery] long fk_leaveId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();
                var leaveBalance = await emp_LeaveRequestRepository.GetLeaveBalance(fk_empid, fk_leaveId);

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







        [HttpGet("Emp_GetViewBalnace")]
        [Authorize]
        public async Task<IActionResult> GetViewLeaveBalance()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();
                var leaveBalance = await emp_LeaveRequestRepository.GetViewLeaveBalance(fk_empid);

                if (leaveBalance == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Employee Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "View Leave Balance retrieved successfully.";
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

        [HttpGet("images/{imageName}")]
        [Authorize]
        public async Task<IActionResult> GetImageByUserIdAsync(string imageName)
        {
            var modelResponse = new ModelResponse();


            try
            {



                // Define the path to the folder where images are stored (based on decrypted user ID)
                //string imageFolderPath = Path.Combine(@"C:\Users\admin\Documents\Empower Logics\Uploads\" + encryptedUserId);
                string imageFolderPath = Path.Combine(appSettings.UploadsFolderPath);


                // Check if the image file exists
                string imagePath = Path.Combine(imageFolderPath, imageName);
                if (!System.IO.File.Exists(imagePath))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Image not found.";
                    modelResponse.StatusCode = 404; // Not Found
                    return Ok(modelResponse);
                }

                // Read the image file into a stream asynchronously
                var imageStream = new FileStream(imagePath, FileMode.Open, FileAccess.Read);
                var mimeType = GetMimeType(imagePath);

                // Return the image as a file response with MIME type based on the image extension
                return File(imageStream, mimeType);
            }
            catch (Exception ex)
            {
                // Log exception details for further analysis
                Console.WriteLine($"Error occurred: {ex.Message}");

                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An unexpected error occurred: {ex.Message}";
                modelResponse.StatusCode = 500; // Internal Server Error
                return Ok(modelResponse);
            }
        }

        private string GetMimeType(string filePath)
        {
            var fileExtension = Path.GetExtension(filePath).ToLower();
            return fileExtension switch
            {
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".tiff" => "image/tiff",
                _ => "application/octet-stream",
            };
        }

        [HttpGet("EmpLeavesOnDates")]
        [Authorize]
        public async Task<IActionResult> EmpLeavesOnDates([FromQuery] long fk_leaveid, [FromQuery] DateTime datefrom, [FromQuery] DateTime dateto)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();
                var message = await emp_LeaveRequestRepository.ValidateLeaveTakenDateNew(fk_empid, fk_leaveid, datefrom, dateto);

                if (message != "")
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = message;
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }
                var (LeaveDates, leaveMaster, employeeDetails) = await emp_LeaveRequestRepository.EmpLeavesOnDates(fk_empid, fk_leaveid, datefrom, dateto);

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


        //OD Request

        [HttpPost("InsertODApply")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertEmployeeODReqAsync([FromBody] LeaveModule request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                // Retrieve User, Location, and Company IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Assuming this is correctly stored

                request.fk_finid = decryptedFinancialYearId;
                request.fk_empid = decryptedUserId;

                // Call repository method to insert
                var result = await emp_LeaveRequestRepository.InsertODLeaveAsync(request);

                // Return response based on result

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.DocumentNo;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;
                modelResponse.DocumentId = result.DocumentId;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                // Return internal server error if exception occurs
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }

        //Approve Regularization


        [HttpGet("ApproveRegularization")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await emp_LeaveRequestRepository.GetAll(decryptedUserId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approve Regularization List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Server error: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }





        [HttpGet("ApproveRegularization/GetById")]
        [Authorize]
        public async Task<IActionResult> GetById(string pk_inoutid)
        {
            var modelResponse = new ModelResponse();

            try
            {


                var result = await emp_LeaveRequestRepository.GetById(pk_inoutid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approve Regularization details retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Server error: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpPost("approveRegularization")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> approveRegularizationAsync([FromBody] AttendanceRegularizationApproval request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                // Retrieve User, Location, and Company IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                request.pk_empId = decryptedUserId;

                // Call repository method to insert
                var result = await emp_LeaveRequestRepository.approveRegularizationAsync(request);

                // Return response based on result


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.IsSuccessfull ? "Approve Regularization successfully." : "Approve Regularization failed.";
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;
                modelResponse.DocumentId = result.DocumentId;
                modelResponse.DocumentNo = result.DocumentNo;
                return Ok(modelResponse);
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



        //Shiv


        [HttpGet("{pk_shortLeaveId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ApplyShortLeaveByIdAsync([FromRoute] string pk_shortLeaveId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                ShortLeaveViewModel result = await emp_LeaveRequestRepository.ApplyShortLeaveByIdAsync(pk_shortLeaveId);


                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid CityId";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "ShortLeave details retrieved successfully.";
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



        //short Leave Inesrt

        [HttpPost("shortLeave")]
        [Authorize]
        public async Task<IActionResult> shortEmployeeLeaveReqAsync(LeaveModule model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                model.fk_empid = decryptedUserId;

                ModelResponse isInserted = await emp_LeaveRequestRepository.Insert_shortLeaveReqMstAsync(model);

                modelResponse.IsSuccess = isInserted.IsSuccess;
                modelResponse.Message = isInserted.Message;
                modelResponse.StatusCode = isInserted.IsSuccess ? 200 : 400;

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


        [HttpGet("shortLeave")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll_shortEmployeeLeaveReqAsync([FromQuery] int? month, [FromQuery] int? year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var result = await emp_LeaveRequestRepository.GetAll_shortLeaveReqMstAsync(decryptedUserId,month,year);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "short Leave Details retrieved successfully.";
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



        //ApprovalshortLeave

        [HttpGet("ApproveshortLeave")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllAprovalshortLeaveAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var result = await emp_LeaveRequestRepository.GetAll_ApprovalShortLeaveAsync(decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approval List Details retrieved successfully.";
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



        [HttpPost("ApproveshortLeave")]
        [Authorize]
        public async Task<IActionResult> ApprovelShortLeaveReqAsync(ShortLeaveApprovalModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                model.fk_empid = decryptedUserId;

                bool isInserted = await emp_LeaveRequestRepository.Insert_ApprovalshortLeaveReqMstAsync(model);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Approva  successfully." : "Failed to Approval  .";
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

        //ApprovalLeaveOd


        [HttpGet("ApprovalLeaveOd")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ApprovalLeaveOdAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var result = await emp_LeaveRequestRepository.ApprovalLeaveAsync(decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid  fk_approvedby ";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "ApprovalOdLeave details retrieved successfully.";
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



        /// <summary>
        /// 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>


        //[HttpPost("ApprovalLeaveOd")]
        //[Authorize]
        //public async Task<IActionResult> InsertApprovalLeaveOdAsync(LeaveApprovalModel model)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

        //        ModelResponse response = await emp_LeaveRequestRepository.Insert_ApprovalLeaveAsync(model, decryptedUserId);

        //        modelResponse.IsSuccess = response.IsSuccess;
        //        modelResponse.Message = response.Message;
        //        modelResponse.StatusCode = response.IsSuccess ? 200 : 400;

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


        [HttpPost("ApprovalLeaveOd")]
        [Authorize]
        public async Task<IActionResult> InsertApprovalLeaveOdAsync(LeaveApprovalModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                int completed = 0, failed = 0;

                // ✅ iterate list
                foreach (var id in model.fk_leaveappids!)
                {
                    // ✅ create single-id model for repo/SP
                    var singleModel = new LeaveApprovalModel
                    {
                        fk_leaveappid = id,           // <--- now valid because fk_leaveappid exists
                        remarks = model.remarks,
                        status = model.status
                    };

                    var response = await emp_LeaveRequestRepository.Insert_ApprovalLeaveAsync(
                        singleModel, decryptedUserId
                    );

                    if (response.IsSuccess)
                        completed++;
                    else
                        failed++;
                }


                modelResponse.IsSuccess = completed > 0;
                modelResponse.Message = $"{completed} requests processed, {failed} failed.";
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
        //approved/Disapporved List

        [HttpGet("ApprovedDisapprovedList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> LeaveApprovedModelListAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var result = await emp_LeaveRequestRepository.LeaveApprovedModelListAsync(decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid  fk_approvedby ";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approved Disapproved details retrieved successfully.";
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


        [HttpGet("validateleavebalance")]
        [Authorize]
        public async Task<IActionResult> validateleavebalanceAsync(string fk_leaveId, long tobeapply)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId


                var isInserted = await emp_LeaveRequestRepository.leavetypebalancevalidation(decryptedUserId, fk_leaveId, tobeapply);

                if (isInserted == "NO")
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Your leave balance is insufficient. Please check your available leave before applying.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "successfully.";
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


        [HttpDelete("DeleteLeave/{pk_leaveappid}")]
        [Authorize]
        public async Task<IActionResult> DeleteLeaveAsync([FromRoute] string pk_leaveappid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (isSuccess, message) = await emp_LeaveRequestRepository.DeleteLeaveAsync(pk_leaveappid);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;

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



        [HttpDelete("DeleteShortLeave/{pk_shortLeaveId}")]
        [Authorize]
        public async Task<IActionResult> DeleteShortLeaveAsync([FromRoute] string pk_shortLeaveId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (isSuccess, message) = await emp_LeaveRequestRepository.DeleteShortLeaveAsync(pk_shortLeaveId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;

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

        [HttpGet("GetAdminApprovalList")]
        [Authorize]
        public async Task<IActionResult> GetAdminApprovalList()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await emp_LeaveRequestRepository.GetAll_AdminApprovalAsync();

                if (result == null || result.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    modelResponse.Data = null;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Admin Approval List retrieved successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                modelResponse.Data = null;
                return Ok(modelResponse);
            }
        }


        [HttpGet("GetApprovedLeaves")]
        [Authorize]
        public async Task<IActionResult> GetApprovedLeaves(
   [FromQuery] int? fk_leaveId,
   [FromQuery] string fk_empid,
   [FromQuery] DateTime? fromDate,
   [FromQuery] DateTime? toDate)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await emp_LeaveRequestRepository.GetApprovedLeavesAsync(fk_leaveId, fk_empid, fromDate, toDate);

                if (result == null || result.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    modelResponse.Data = null;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Approved leave list retrieved successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                modelResponse.Data = null;
                return Ok(modelResponse);
            }
        }


        [HttpDelete("rejectlApprovedleave")]
        public async Task<IActionResult> RejectLeaveAsync([FromQuery] string requestType, [FromQuery] string requestId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (isSuccess, message) = await emp_LeaveRequestRepository.RejectLeaveAsync(requestType, requestId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;

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