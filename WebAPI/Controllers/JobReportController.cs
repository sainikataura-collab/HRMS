using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class JobReportController : ControllerBase
    {
        private readonly IJobReportRepository _jobReportRepository;

        public JobReportController(IJobReportRepository jobReportRepository)
        {
            _jobReportRepository = jobReportRepository;
        }

        [HttpGet("GetReportMasterData")]
        [Authorize]
        public async Task<IActionResult> GetReportMasterData([FromQuery] string? companyId = null)
        {
            try
            {
                var resolvedCompanyId = !string.IsNullOrWhiteSpace(companyId)
                    ? companyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var masterData = await _jobReportRepository.GetReportMasterDataAsync(resolvedCompanyId);

                return Ok(new
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Job Report master data retrieved successfully.",
                    Data = masterData
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    StatusCode = 500,
                    Message = "An error occurred while fetching master data: " + ex.Message
                });
            }
        }

        [HttpPost("GetJobReport")]
        [Authorize]
        public async Task<IActionResult> GetJobReport([FromBody] JobReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var (totalCount, summary, items) = await _jobReportRepository.GetJobReportAsync(request, companyId);

                return Ok(new
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Jobs report retrieved successfully.",
                    TotalCount = totalCount,
                    Summary = summary,
                    Data = items
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    StatusCode = 500,
                    Message = "An error occurred while fetching jobs report: " + ex.Message
                });
            }
        }

        [HttpPost("DownloadJobReportExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadJobReportExcel([FromBody] JobReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var fileBytes = await _jobReportRepository.GenerateJobReportExcelAsync(request, companyId);

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Jobs_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    StatusCode = 500,
                    Message = "An error occurred while downloading Excel: " + ex.Message
                });
            }
        }
    }
}
