using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmpAppraisalStatusController : ControllerBase
    {

        private readonly IEmpAppraisalStatusRepository empAppraisalStatusRepository;

        public EmpAppraisalStatusController(IEmpAppraisalStatusRepository _empAppraisalStatusRepository)
        {
            empAppraisalStatusRepository = _empAppraisalStatusRepository;
        }
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetStatusAsync(
 
  [FromQuery] int pageIndex = 0,
  [FromQuery] int pageSize = 10,
  [FromQuery] string? searchTerm = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await empAppraisalStatusRepository.GetStatusAsync( pageIndex, pageSize, searchTerm);

                if (result == null || result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Appraisal status retrieved successfully.";
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


        [HttpGet("pdf")]
        [Authorize] // Secure this endpoint
        public async Task<IActionResult> GetStatusPdfAsync([FromQuery] string empcode)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrWhiteSpace(empcode))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee code is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var (totalCount, result) = await empAppraisalStatusRepository.GetStatusPdfAsync(empcode);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No appraisal data found for this employee.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Appraisal data retrieved successfully.";
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


    }
}
