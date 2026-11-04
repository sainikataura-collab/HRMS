using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Http;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CustomerRateCardController : ControllerBase
    {
        private readonly ICustomerRateCardRepository _repository;

        public CustomerRateCardController(ICustomerRateCardRepository repository)
        {
            _repository = repository;
        }

        [HttpPost("Insert")]
        [Authorize]
        public async Task<IActionResult> InsertAsync([FromBody] CustomerRateCardMasterDTO model)
        {
            var response = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await _repository.InsertRateCardAsync(model, userId, companyId);

                response.IsSuccess = result.IsSuccessfull;
                response.Message = result.Message;
                response.Data = result.IsSuccessfull;
                response.StatusCode = result.IsSuccessfull ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }

        [HttpPut("Update")]
        [Authorize]
        public async Task<IActionResult> UpdateAsync([FromBody] CustomerRateCardMasterDTO model)
        {
            var response = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await _repository.UpdateRateCardAsync(model, userId, companyId);

                response.IsSuccess = result.IsSuccessfull;
                response.Message = result.Message;
                response.StatusCode = result.IsSuccessfull ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id)
        {
            var response = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await _repository.DeleteRateCardAsync(id, companyId, userId);

                response.IsSuccess = result.IsSuccessfull;
                response.Message = result.Message;
                response.StatusCode = result.IsSuccessfull ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
        {
            var response = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var rateCard = await _repository.GetRateCardByIdAsync(id, companyId);

                if (rateCard == null)
                {
                    response.IsSuccess = false;
                    response.Message = "Rate card not found.";
                    response.StatusCode = StatusCodes.Status404NotFound;
                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Message = "Rate card retrieved successfully.";
                response.Data = rateCard;
                response.StatusCode = StatusCodes.Status200OK;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }

        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAllAsync(
            [FromQuery] int pageIndex = 0,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = "")
        {
            var response = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var (totalCount, list) = await _repository.GetAllRateCardsAsync(
                    pageIndex, pageSize, companyId, searchTerm);

                response.IsSuccess = true;
                response.Message = "Rate cards retrieved successfully.";
                response.Data = list;
                response.TotalCount = totalCount;
                response.StatusCode = StatusCodes.Status200OK;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }
        [HttpGet("GetDynamicHeads")]
        [Authorize]
        public async Task<IActionResult> GetDynamicHeadsAsync()
        {
            var response = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await _repository.GetEarningHeadsAsync(companyId);

                response.IsSuccess = true;
                response.Message = "Heads retrieved successfully.";
                response.Data = list;
                response.StatusCode = StatusCodes.Status200OK;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }

        [HttpPost("CustomerRateCardExcelUpload")]
        [Authorize]
        public async Task<IActionResult> UploadCustomerRateCardExcel(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Please select a valid Excel file.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var uploadResults = await _repository.UploadCustomerRateCardExcelAsync(file, companyId, userId);
                
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Customer Rate Card Excel processed successfully.";
                modelResponse.Data = uploadResults;
                modelResponse.StatusCode = 200;
                
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

        [HttpGet("GetMinimumWage")]
        [Authorize]
        public async Task<IActionResult> GetMinimumWageAsync([FromQuery] string locationId, [FromQuery] string categoryId)
        {
            var response = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                if (string.IsNullOrWhiteSpace(locationId) || string.IsNullOrWhiteSpace(categoryId))
                {
                    response.IsSuccess = false;
                    response.Message = "Location and Category are required.";
                    response.StatusCode = StatusCodes.Status400BadRequest;
                    return Ok(response);
                }

                var result = await _repository.GetMinimumWageByLocationAndCategoryAsync(locationId, categoryId, companyId);
                response.IsSuccess = true;
                response.Message = "Minimum wage retrieved successfully.";
                response.Data = result;
                response.StatusCode = StatusCodes.Status200OK;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }

        [HttpGet("GetLocationsByCustomer/{customerId}")]
        [Authorize]
        public async Task<IActionResult> GetLocationsByCustomerAsync([FromRoute] long customerId)
        {
            var response = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                if (customerId <= 0)
                {
                    response.IsSuccess = false;
                    response.Message = "Valid Customer is required.";
                    response.StatusCode = StatusCodes.Status400BadRequest;
                    return Ok(response);
                }

                var list = await _repository.GetLocationsByCustomerAsync(customerId, companyId);
                response.IsSuccess = true;
                response.Message = list.Count > 0 ? "Locations retrieved successfully." : "No location mapped with this customer.";
                response.Data = list;
                response.StatusCode = StatusCodes.Status200OK;
                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = StatusCodes.Status500InternalServerError;
                return Ok(response);
            }
        }
    }
}
