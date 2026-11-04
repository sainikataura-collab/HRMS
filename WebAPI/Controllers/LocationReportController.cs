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
    public class LocationReportController : ControllerBase
    {
        private readonly ILocationReportRepository _locationReportRepository;

        public LocationReportController(ILocationReportRepository locationReportRepository)
        {
            _locationReportRepository = locationReportRepository;
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
                var masterData = await _locationReportRepository.GetReportMasterDataAsync(resolvedCompanyId);

                return Ok(new
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Master data retrieved successfully.",
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

        [HttpPost("GetLocationReport")]
        [Authorize]
        public async Task<IActionResult> GetLocationReport([FromBody] LocationReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var (totalCount, summary, items) = await _locationReportRepository.GetLocationReportAsync(request, companyId);

                return Ok(new
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Location report retrieved successfully.",
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
                    Message = "An error occurred while fetching location report: " + ex.Message
                });
            }
        }

        [HttpPost("GetLocationWiseJobsReport")]
        [Authorize]
        public async Task<IActionResult> GetLocationWiseJobsReport([FromBody] LocationReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var (totalCount, items) = await _locationReportRepository.GetLocationWiseJobsReportAsync(request, companyId);

                return Ok(new
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Location wise jobs report retrieved successfully.",
                    TotalCount = totalCount,
                    Data = items
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    StatusCode = 500,
                    Message = "An error occurred while fetching location wise jobs report: " + ex.Message
                });
            }
        }

        [HttpPost("DownloadLocationReportExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadLocationReportExcel([FromBody] LocationReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var fileBytes = await _locationReportRepository.GenerateLocationReportExcelAsync(request, companyId);

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Location_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
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

        [HttpPost("DownloadLocationWiseJobsReportExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadLocationWiseJobsReportExcel([FromBody] LocationReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var fileBytes = await _locationReportRepository.GenerateLocationWiseJobsReportExcelAsync(request, companyId);

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Location_Wise_Jobs_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
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
