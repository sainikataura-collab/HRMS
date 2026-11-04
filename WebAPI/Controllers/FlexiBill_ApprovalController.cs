using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static HRMSWebAPI.Models.FlexibillApproval;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class FlexiBill_ApprovalController : ControllerBase
    {


        private readonly IFlexibillRepository flexibillRepository;

        public FlexiBill_ApprovalController(IFlexibillRepository _FlexibillRepository)
        {
            flexibillRepository = _FlexibillRepository;
        }


        [HttpPost("GetFlexiBillList")]
        [Authorize]
        public async Task<IActionResult> GetFlexiBillList([FromBody] FlexiBillRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Optional use if neededneeded
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();




                request.FkFinId = decryptedFinancialYearId;
                request.FkCompanyId = decryptedCompanyId;

                var flexiBillData = await this.flexibillRepository.GetFlexiBillsAsync(
                    request.EmpCode,
                    request.SelectedDepartments,
                    request.SelectedLocations,
                    request.EmpName,
                    request.LeftStatus,
                    request.FkCompanyId,
                    request.FkEmpId,
                    request.FkFinId
                );

                if ((flexiBillData.PendingBills?.Count ?? 0) + (flexiBillData.ApprovedBills?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Flexi bill data retrieved successfully.";
                modelResponse.Data = flexiBillData;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }


        [HttpPost("insert")]
        [Authorize]
        public async Task<IActionResult> InsertApprovalAsync([FromBody] ApprovalRootDataSet model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                model.flexiBillApprovalIns.fk_insUserId = decryptedUserId;

                bool isInserted = await this.flexibillRepository.InsertApprovalAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted
                    ? " approved  successfully."
                    : "Failed to insert job requisition approval.";
                response.StatusCode = isInserted ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = $"An error occurred: {ex.Message}";
                response.StatusCode = 500;
            }

            return Ok(response);
        }



        [HttpGet("{flexiheadnillId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetFlexibillByIdAsync([FromRoute] long? flexiheadnillId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                GetByIdModel result = await flexibillRepository.GetByIdAsync(flexiheadnillId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
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





    }
}
