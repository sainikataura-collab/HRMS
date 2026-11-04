using System;
using System.Threading.Tasks;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CustomerShiftRateBonusController : ControllerBase
    {
        private readonly ICustomerShiftRateBonusRepository repository;

        public CustomerShiftRateBonusController(ICustomerShiftRateBonusRepository _repository)
        {
            repository = _repository;
        }

        [HttpGet("{id}")]
        [HttpGet("GetById/{id}")]
        [Authorize]
        public async Task<IActionResult> GetByIdAsync([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var result = await repository.GetByIdAsync(id, decryptedCompanyId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Customer Shift Rate & Bonus record not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Customer Shift Rate & Bonus record retrieved successfully.";
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

        [HttpPost]
        [HttpPost("Insert")]
        [Authorize]
        public async Task<IActionResult> InsertAsync([FromBody] CustomerShiftRateBonusModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";

                model.fk_companyId = decryptedCompanyId;

                var result = await repository.InsertAsync(model, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        [HttpPost("BulkInsert")]
        [Authorize]
        public async Task<IActionResult> BulkInsertAsync([FromBody] System.Collections.Generic.List<CustomerShiftRateBonusModel> list)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";

                if (list != null)
                {
                    foreach (var item in list)
                    {
                        item.fk_companyId = decryptedCompanyId;
                    }
                }

                var result = await repository.BulkInsertAsync(list ?? new System.Collections.Generic.List<CustomerShiftRateBonusModel>(), decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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
        [HttpPost("Update")]
        [Authorize]
        public async Task<IActionResult> UpdateAsync([FromBody] CustomerShiftRateBonusModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";

                model.fk_companyId = decryptedCompanyId;

                var result = await repository.UpdateAsync(model, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        [HttpDelete("{id}")]
        [HttpDelete("Delete/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await repository.DeleteAsync(id, decryptedUserId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        [HttpPost("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAllAsync([FromBody] CustomerShiftRateBonusFilterDto filter)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await repository.GetListAsync(filter ?? new CustomerShiftRateBonusFilterDto(), decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data loaded successfully.";
                modelResponse.Data = new { totalCount, list };
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

        [HttpGet("GetLocationsByClient")]
        [Authorize]
        public async Task<IActionResult> GetLocationsByClientAsync([FromQuery] string clientId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await repository.GetLocationsByClientAsync(clientId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Locations loaded successfully.";
                modelResponse.Data = list;
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

        [HttpGet("GetClientsByLocation")]
        [Authorize]
        public async Task<IActionResult> GetClientsByLocationAsync([FromQuery] string locationId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await repository.GetClientsByLocationAsync(locationId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clients loaded successfully.";
                modelResponse.Data = list;
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
    }
}
