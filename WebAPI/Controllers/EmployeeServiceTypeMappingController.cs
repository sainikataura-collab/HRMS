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
    public class EmployeeServiceTypeMappingController : ControllerBase
    {
        private readonly IEmployeeServiceTypeMappingRepository mappingRepository;

        public EmployeeServiceTypeMappingController(IEmployeeServiceTypeMappingRepository _mappingRepository)
        {
            mappingRepository = _mappingRepository;
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
                var result = await mappingRepository.GetByIdAsync(id, decryptedCompanyId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Record not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Record retrieved successfully.";
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
        public async Task<IActionResult> InsertAsync([FromBody] EmployeeServiceTypeMappingModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                model.fk_CompanyID = decryptedCompanyId;

                var result = await mappingRepository.InsertAsync(model, decryptedUserId, decryptedCompanyId);

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
        public async Task<IActionResult> UpdateAsync([FromBody] EmployeeServiceTypeMappingModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                model.fk_CompanyID = decryptedCompanyId;

                var result = await mappingRepository.UpdateAsync(model, decryptedUserId, decryptedCompanyId);

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
        public async Task<IActionResult> GetAllAsync([FromBody] ServiceTypeMappingFilterDto filter)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await mappingRepository.GetListAsync(filter, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Records retrieved successfully.";
                modelResponse.Data = new
                {
                    totalCount = totalCount,
                    list = list
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
    }
}
