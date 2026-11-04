using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.Settings
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class MonthlySalarySlipController : ControllerBase
    {

        private readonly IMonthlySalSlipRepository monthlySalSlipRepository;

        public MonthlySalarySlipController(IMonthlySalSlipRepository _monthlySalSlipRepository)
        {
            monthlySalSlipRepository = _monthlySalSlipRepository;
        }



        [HttpPost("Insert")]
        [Authorize]
        public async Task<IActionResult> InsertMonthlySalarySlipMessageAsync([FromBody] ManthlySalSlipDataset request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var messageList = request.MonthlySalSlip ?? new List<MonthlySalSlipforIns>();

                // Retrieve user context values from HttpContext (assume these are set during auth middleware)
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                // Set the financial year ID for each salary slip message
                foreach (var slip in request.MonthlySalSlip)
                {
                    slip.fk_finid = decryptedFinancialYearId;
                }

                // Call repository method
                bool isInserted = await monthlySalSlipRepository.InsertMonthlySalarySlipMessageAsync(
                    request,
                    decryptedFinancialYearId
                );

                // Return the response
                return Ok(new ModelResponse
                {
                    IsSuccess = isInserted,
                    Message = isInserted ? "Salary slip message inserted successfully." : "Failed to insert salary slip message.",
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


        [HttpPut("Update")]
        [Authorize]
        public async Task<IActionResult> UpdateSalarySlipMessageAsync([FromBody] ManthlySalSlipDataset request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                foreach (var slip in request.MonthlySalSlip)
                {
                    slip.fk_finid = decryptedFinancialYearId;
                }

                
                bool isInserted = await monthlySalSlipRepository.UpdateMonthlySalarySlipMessageAsync(
                    request,
                    decryptedFinancialYearId
                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isInserted,
                    Message = isInserted ? "Salary slip message Update successfully." : "Failed to Update salary slip message.",
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


        //get by Id

        [HttpGet("GetById/{fk_finid}")]
        [Authorize]
        public async Task<IActionResult> GetById([FromRoute] string fk_finid)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var (TempMessage, SalaryMessage) = await monthlySalSlipRepository.GetById(fk_finid);

                if (TempMessage == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record Found Or Invalid Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Monthly Sal Slip data retrieved successfully.";
                modelResponse.Data = new
                {
                    TempMSg= TempMessage,
                    SalMsg = SalaryMessage,
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


        [HttpDelete("Delete/{fk_finid}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] string fk_finid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                bool isDeleted = await monthlySalSlipRepository.Delete(fk_finid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Monthly Sal Slip detail delete successfully." : "Failed to delete Monthly Sal Slip detail.";
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
