using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LoanAllotmentController : ControllerBase
    {
        private readonly ILoanAllotmentRepository loanAllotmentRepository;
        public LoanAllotmentController(ILoanAllotmentRepository _loanAllotmentRepository)
        {
            loanAllotmentRepository = _loanAllotmentRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertLoanAllotmentAsync([FromBody] List<LoanAllotmentMst> loanAllotmentMstList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                // Call repository method, passing the list of loan allotments
                bool isInserted = await loanAllotmentRepository.InsertLoanAllotmentAsync(loanAllotmentMstList, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Loan allotment inserted successfully." : "Failed to insert loan allotment";
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
        [Authorize]  // Endpoint secure hi rahega
        public async Task<IActionResult> GetAllLoanAllotment(int pageIndex = 0, int pageSize = 10, string? fk_empid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (totalCount, result) = await loanAllotmentRepository.GetAllLoanAllotment(pageIndex, pageSize, fk_empid);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No loan allotment records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Loan Allotment List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("{allotId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetLoanAllotmentByIdAsync([FromRoute] string allotId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                LoanAllotmentMst result = await loanAllotmentRepository.GetLoanAllotmentByIdAsync(allotId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Loan Allotment ID";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Loan Allotment detail retrieved successfully.";
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
        public async Task<IActionResult> UpdateLoanAllotmentAsync([FromBody] LoanAllotmentMst loanAllotmentMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                loanAllotmentMst.fk_updUserID = decryptedUserId;

                List<LoanAllotmentMst> loanAllotmentMstList = new() { loanAllotmentMst };

                // Note: You need to retrieve the timestamp from your database or context
                // For demonstration, assuming it's available in the model
                byte[] timestamp = loanAllotmentMst.Timestamp;

                bool isUpdated = await loanAllotmentRepository.UpdateLoanAllotmentAsync(loanAllotmentMstList, decryptedUserId, decryptedLocationId, loanAllotmentMst.pk_allotid, timestamp);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Loan Allotment updated successfully." : "Failed to update Loan Allotment.";
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

        [HttpDelete("{allotId}")]
        [Authorize]
        public async Task<IActionResult> DeleteLoanAllotmentAsync([FromRoute] string allotId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await loanAllotmentRepository.DeleteLoanAllotmentAsync(allotId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Loan Allotment detail deleted successfully." : "Failed to delete Loan Allotment detail.";
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
