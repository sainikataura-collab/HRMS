using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Ocsp;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LeaveAccrualController : ControllerBase
    {
        private readonly IleaveAccrualRepository leaveAccrualRepository;

        public LeaveAccrualController(IleaveAccrualRepository _leaveAccrualRepository)
        {
            leaveAccrualRepository = _leaveAccrualRepository;
        }



        [HttpPost]
        [Authorize]
        public async Task<IActionResult> GetAll(leaveAccrualRequest res)
        {
            // Create the model response
            var modelResponse = new ModelResponse();

            try
            {
                // Create filter object to pass to the repository method
                var filter = new leaveAccrualRequest
                {

                    empcode = res.empcode,
                    empcodemanual = res.empcodemanual,
                    empname = res.empname,
                    selectedDesignation = res.selectedDesignation,
                    selectedNature = res.selectedNature,
                    selectedCity = res.selectedCity,
                    sortBy = res.sortBy,
                    fk_monthId = res.fk_monthId,
                    fk_yearId = res.fk_yearId,
                    SelectedLocations = res.SelectedLocations ?? new List<string>(),  // Ensure default to an empty list if null
                    SelectedDepartments = res.SelectedDepartments ?? new List<string>(),
                    fk_costcentreid = res.fk_costcentreid,
                    PageIndex1 = res.PageIndex1,
                    PageSize1 = res.PageSize1,
                    PageSize2 = res.PageSize2,
                    PageIndex2 = res.PageIndex2

                };

                // Calling the repository to get the data
                var result = await leaveAccrualRepository.GetAll(filter);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail retrieved successfully.";
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

        [HttpPost("insert")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Insert([FromBody] NewDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from headers or context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                //  var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                // Assign fk values to the request object if needed
                request.fk_userID = decryptedUserId;
                // request.fk_locid = decryptedLocationId;
                request.fk_finid = decryptedFinancialYearId;

                // Call repository method with employee list, month, year, etc.
                bool isInserted = await leaveAccrualRepository.Insert(request);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Insert successful." : "Failed to insert.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }




        [HttpPost("delete")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> delete([FromBody] NewDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from headers or context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Optional use if needed
                                                                                        //  var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Optional use if needed
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Retrieve the FinancialYear
                                                                                                          // Assign fk_finid to each item in the list
                                                                                                          //    var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                // Assign fk values to the request object if needed
                request.fk_userID = decryptedUserId;
                // request.fk_locid = decryptedLocationId;
                request.fk_finid = decryptedFinancialYearId;




                // Call repository method with employee list, month and year
                bool isStopped = await leaveAccrualRepository.delete(request);

                //request.stopsalary ="Y";
                modelResponse.IsSuccess = isStopped;
                modelResponse.Message = isStopped ? "delete successfully." : "Failed to delete.";
                modelResponse.StatusCode = isStopped ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }


    }
}
