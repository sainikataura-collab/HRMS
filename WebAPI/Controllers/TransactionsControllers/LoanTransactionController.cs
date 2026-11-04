using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LoanTransactionController : ControllerBase
    {
        private readonly ILoanTransactionRepository loanTransactionRepository;
        public LoanTransactionController(ILoanTransactionRepository _loanTransactionRepository)
        {
            loanTransactionRepository = _loanTransactionRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertLoanTransactionAsync([FromBody] LoanTransactionMstDataSet loanTransactionDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                // Call repository method, passing lists from dataset
                bool isInserted = await loanTransactionRepository.InsertLoanTransactionAsync(
                    loanTransactionDataSet.LoanTransactionMst,
                    loanTransactionDataSet.LoanTransactionDetails,
                    decryptedUserId,
                    decryptedLocationId
                );

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Loan transaction inserted successfully." : "Failed to insert loan transaction";
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
        public async Task<IActionResult> GetAllLoanTransaction(int pageIndex = 0, int pageSize = 10, string? fk_empid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();


            try
            {
                //if (string.IsNullOrEmpty(fk_empid))
                //    fk_empid = "";

                var (totalCount, result) = await loanTransactionRepository.GetAllLoanTransactionAsync(pageIndex, pageSize, fk_empid, decryptedCompanyId);

                if (!result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No loan transaction records found.";
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Loan Transaction List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
        }
        [HttpGet("{lid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetLoanTransactionByIdAsync([FromRoute] string lid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                LoanTransactionMstResult result = await loanTransactionRepository.GetLoanTransactionByIdAsync(lid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Loan Transaction ID";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Loan Transaction detail retrieved successfully.";
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
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateLoanTransactionAsync([FromBody] LoanTransactionMstDataSet loanTransactionData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (loanTransactionData == null || loanTransactionData.LoanTransactionMst == null || loanTransactionData.LoanTransactionMst.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid loan transaction data.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var mst = loanTransactionData.LoanTransactionMst.First();
                byte[] timestamp = mst.Timestamp;

                bool isUpdated = await loanTransactionRepository.UpdateLoanTransactionAsync(
                    mst.pk_lid,
                    loanTransactionData.LoanTransactionMst,
                    loanTransactionData.LoanTransactionDetails,
                    decryptedUserId,
                    decryptedLocationId,
                    timestamp
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Loan Transaction updated successfully." : "Failed to update Loan Transaction.";
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


        [HttpDelete("{lid}")]
        [Authorize]
        public async Task<IActionResult> DeleteLoanTransactionAsync([FromRoute] string lid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await loanTransactionRepository.DeleteLoanTransactionAsync(lid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Loan Transaction detail deleted successfully." : "Failed to delete Loan Transaction detail.";
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
