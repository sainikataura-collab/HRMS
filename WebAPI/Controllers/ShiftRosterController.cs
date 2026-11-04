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
    public class ShiftRosterController : ControllerBase
    {
        private readonly IShiftRosterRepository repository;
        private readonly IShiftRepository shiftRepository;

        public ShiftRosterController(IShiftRosterRepository _repository, IShiftRepository _shiftRepository)
        {
            repository = _repository;
            shiftRepository = _shiftRepository;
        }

        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAllAsync([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await repository.GetAllAsync(pageIndex, pageSize, searchTerm, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Shift Roster list retrieved successfully.";
                modelResponse.Data = list;
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
                    modelResponse.Message = "Shift Roster record not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Shift Roster record retrieved successfully.";
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
        public async Task<IActionResult> InsertAsync([FromBody] ShiftRosterModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (model == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid data.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await repository.InsertAsync(model, decryptedCompanyId, decryptedUserId);

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
        [HttpPut("Update")]
        [Authorize]
        public async Task<IActionResult> UpdateAsync([FromBody] ShiftRosterModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (model == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid data.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await repository.UpdateAsync(model, decryptedCompanyId, decryptedUserId);

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

                var result = await repository.DeleteAsync(id, decryptedCompanyId, decryptedUserId);

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
        public async Task<IActionResult> BulkInsertAsync([FromBody] List<ShiftRosterBulkItem> items)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (items == null || items.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records to upload.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var results = await repository.BulkValidateAndInsertAsync(items, decryptedCompanyId, decryptedUserId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Bulk upload validation and insert completed.";
                modelResponse.Data = results;
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

        [HttpGet("GetEmployees")]
        [Authorize]
        public async Task<IActionResult> GetEmployeesAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var employees = await repository.GetEmployeesByCompanyAsync(decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee dropdown list retrieved successfully.";
                modelResponse.Data = employees;
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

        [HttpGet("GetShifts")]
        [Authorize]
        public async Task<IActionResult> GetShiftsAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, shifts) = await shiftRepository.GetAll(0, 1000, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Shift list retrieved successfully.";
                modelResponse.Data = shifts;
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
    }
}
