using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CompOffRequestController : ControllerBase
    {
        private readonly ICompOffRequestRepository compOffRequestRepository;


        public CompOffRequestController(ICompOffRequestRepository _compOffRequestRepository)

        {
            compOffRequestRepository = _compOffRequestRepository;
        }

        [HttpPost("ApproveOrRejectCompOff")]
        [Authorize]
        public async Task<IActionResult> ApproveOrRejectCompOff([FromQuery] long pk_applycompoffId, [FromQuery] int approvalOrder)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var result = await compOffRequestRepository.ApproveOrRejectCompOffAsync(pk_applycompoffId, approvalOrder);

                response.IsSuccess = result.IsSuccess == 1;   //  fix conversion
                response.Message = result.Message;
                response.StatusCode = result.IsSuccess == 1 ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpDelete("DeleteCompOffLeave/{pk_applycompoffId}")]
        [Authorize]
        public async Task<IActionResult> DeleteCompOffLeaveAsync([FromRoute] string pk_applycompoffId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (isSuccess, message) = await compOffRequestRepository.DeleteCompOffLeaveAsync(pk_applycompoffId);

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

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertCompOffRequest([FromBody] CompOffRequestMstDataSet requestData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                // 👇 Injecting decrypted user id into the incoming data
                requestData.CompOffRequestMst.fk_empid = decryptedUserId;


                // Safely extract hour and minute from intime
                if (!string.IsNullOrEmpty(requestData.CompOffRequestMst.intime) && requestData.CompOffRequestMst.intime.Contains(":"))
                {
                    var inParts = requestData.CompOffRequestMst.intime.Split(':');
                    if (inParts.Length >= 2)
                    {
                        requestData.CompOffRequestMst.fromhours = inParts[0];
                        requestData.CompOffRequestMst.fromminute = inParts[1];
                    }
                }

                // Safely extract hour and minute from outtime
                if (!string.IsNullOrEmpty(requestData.CompOffRequestMst.outtime) && requestData.CompOffRequestMst.outtime.Contains(":"))
                {
                    var outParts = requestData.CompOffRequestMst.outtime.Split(':');
                    if (outParts.Length >= 2)
                    {
                        requestData.CompOffRequestMst.tohours = outParts[0];
                        requestData.CompOffRequestMst.tominute = outParts[1];
                    }
                }

                // Call repository
                ModelResponse isInserted = await compOffRequestRepository.InsertCompOffRequestAsync(requestData);

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


        //[HttpPost]
        //[Authorize]  // Secured endpoint 
        //public async Task<IActionResult> InsertCompOffRequest([FromBody] CompOffRequestMstDataSet requestData)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    CompOffRequestMstDataSet compOffRequestMstDataSet = new CompOffRequestMstDataSet();


        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        compOffRequestMstDataSet.CompOffRequestMst.fk_empid = decryptedUserId;

        //        // Call repository method
        //        bool isInserted = await compOffRequestRepository.InsertCompOffRequestAsync(requestData);

        //        // Prepare response
        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted? "Comp-off request inserted successfully.": "Failed to insert comp-off request.";
        //        modelResponse.StatusCode = isInserted ? 200 : 400;
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

        [HttpGet("compoff")]
        [Authorize]
        public async Task<IActionResult> GetAllCompOffRequestByEmpAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Securely get decrypted user ID from token middleware
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await compOffRequestRepository.GetAllCompOffByEmpAllAsync(decryptedUserId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Comp Off requests retrieved successfully.";
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



        [HttpGet("compoff_Attendance")]
        [Authorize]
        public async Task<IActionResult> GetCompOffRequestByEmpAsync(string dated)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Securely get decrypted user ID from token middleware
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await compOffRequestRepository.GetCompOffByEmpAllAsync(decryptedUserId, dated);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Comp Off list retrieved successfully.";
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



        //[HttpGet]
        //[Authorize]
        //public async Task<IActionResult> GetCompOffList([FromQuery] string? fk_empid)
        //{
        //    try
        //    {
        //        var data = await compOffRequestRepository.GetAllCompOffByEmpAllAsync(fk_empid);
        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = true,
        //            Message = "Data fetched successfully.",
        //            Data = data,
        //            StatusCode = 200
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = false,
        //            Message = ex.Message,
        //            StatusCode = 500
        //        });
        //    }
        //}

        [HttpGet("{applycompoffId}")]
        [Authorize]
        public async Task<IActionResult> GetCompOfById([FromRoute] string applycompoffId)
        {
            try
            {
                var data = await compOffRequestRepository.GetAllCompOffByEmpIdAsync(applycompoffId);
                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Data fetched successfully.",
                    Data = data,
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }


    }
}