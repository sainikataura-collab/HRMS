using System;
using System.Collections.Generic;
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
    public class CommonRateCardController : ControllerBase
    {
        private readonly ICommonRateCardRepository _repository;

        public CommonRateCardController(ICommonRateCardRepository repository)
        {
            _repository = repository;
        }

        [HttpPost("Insert")]
        [Authorize]
        public async Task<IActionResult> InsertAsync([FromBody] CommonRateCardModel model)
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
        public async Task<IActionResult> UpdateAsync([FromBody] CommonRateCardModel model)
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
        public async Task<IActionResult> DeleteAsync([FromRoute] long id)
        {
            var response = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await _repository.DeleteRateCardAsync(id, companyId);

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

        [HttpGet("{id:long}")]
        [Authorize]
        public async Task<IActionResult> GetByIdAsync([FromRoute] long id)
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

                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var (totalCount, list) = await _repository.GetAllRateCardsAsync(
                    pageIndex, pageSize, companyId, searchTerm, userId);

                //var (totalCount, list) = await _repository.GetAllRateCardsAsync(
                //    pageIndex, pageSize, companyId, searchTerm);

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

        [HttpGet("CheckExists")]
        [Authorize]
        public async Task<IActionResult> CheckExistsAsync(
            [FromQuery] long clientId,
            [FromQuery] int modelId,
            [FromQuery] string locationId,
            [FromQuery] DateTime effectiveFrom,
            [FromQuery] string fhrId,
            [FromQuery] int? largeVehicleTypeId = null,
            [FromQuery] int? amazonEdspVehicleTypeId = null)
        {
            var response = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var (recordExists, list) = await _repository.CheckRateCardExistsAsync(clientId, modelId, locationId, effectiveFrom, fhrId, companyId, largeVehicleTypeId, amazonEdspVehicleTypeId);

                response.IsSuccess = true;
                response.Message = recordExists ? "Rate card already exists for this combination." : "No existing rate card.";
                response.Data = new
                {
                    RecordExists = recordExists,
                    List = list
                };
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
