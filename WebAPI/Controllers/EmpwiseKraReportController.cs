using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmpwiseKraReportController : ControllerBase
    {
        private readonly IEmpwiseKraReportRepository empwiseKraReportRepository;

        public EmpwiseKraReportController(IEmpwiseKraReportRepository _empwiseKraReportRepository)
        {
            empwiseKraReportRepository = _empwiseKraReportRepository;
        }

        [HttpGet("get-kra-report")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetKRAReport(
    [FromQuery] string? fk_empId,
    [FromQuery] int pageIndex = 0,
    [FromQuery] int pageSize = 10,
    [FromQuery] string? searchTerm = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await empwiseKraReportRepository.GetKRAReportAsync(fk_empId, pageIndex, pageSize, searchTerm);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "KRA report retrieved successfully.";
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
