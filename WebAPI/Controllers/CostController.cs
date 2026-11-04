using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CostController : ControllerBase
    {
        private readonly ICostRepository costRepository;


        public CostController(ICostRepository _costRepository)

        {
            costRepository = _costRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertCostMstAsync([FromBody] CostMst costMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                bool isInserted = await costRepository.InsertCostMstAsync(costMst, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Cost details inserted successfully." : "Failed to insert cost details.";
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
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var (totalCount, result) = await costRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Cost list retrieved successfully.";
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

        [HttpGet("{costCentreId}")]
        [Authorize]
        public async Task<IActionResult> GetCostMstByIdAsync([FromRoute] long costCentreId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                CostMst result = await costRepository.GetCostMstByIdAsync(costCentreId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid costCentreId.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Cost detail retrieved successfully.";
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
        [Authorize]
        public async Task<IActionResult> UpdateCostMstAsync([FromBody] CostMst costMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isUpdated = await costRepository.UpdateCostMstAsync(costMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Cost detail updated successfully." : "Failed to update cost detail.";
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

        [HttpDelete("{costCentreId}")]
        [Authorize]
        public async Task<IActionResult> DeleteCostMstAsync([FromRoute] long costCentreId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await costRepository.DeleteCostMstAsync(costCentreId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Cost detail deleted successfully." : "Failed to delete cost detail.";
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
