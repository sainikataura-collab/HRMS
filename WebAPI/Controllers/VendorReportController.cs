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
    public class VendorReportController : ControllerBase
    {
        private readonly IVendorReportRepository _vendorReportRepository;

        public VendorReportController(IVendorReportRepository vendorReportRepository)
        {
            _vendorReportRepository = vendorReportRepository;
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
                var masterData = await _vendorReportRepository.GetReportMasterDataAsync(resolvedCompanyId);

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

        [HttpPost("GetVendorReport")]
        [Authorize]
        public async Task<IActionResult> GetVendorReport([FromBody] VendorReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var (totalCount, summary, items) = await _vendorReportRepository.GetVendorReportAsync(request, companyId);

                return Ok(new
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Vendor report retrieved successfully.",
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
                    Message = "An error occurred while fetching vendor report: " + ex.Message
                });
            }
        }

        [HttpPost("GetVendorWiseReport")]
        [Authorize]
        public async Task<IActionResult> GetVendorWiseReport([FromBody] VendorReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var (totalCount, items) = await _vendorReportRepository.GetVendorWiseReportAsync(request, companyId);

                return Ok(new
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Vendor wise report retrieved successfully.",
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
                    Message = "An error occurred while fetching vendor wise report: " + ex.Message
                });
            }
        }

        [HttpPost("DownloadVendorReportExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadVendorReportExcel([FromBody] VendorReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var fileBytes = await _vendorReportRepository.GenerateVendorReportExcelAsync(request, companyId);

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Vendor_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
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

        [HttpPost("DownloadVendorWiseReportExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadVendorWiseReportExcel([FromBody] VendorReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var fileBytes = await _vendorReportRepository.GenerateVendorWiseReportExcelAsync(request, companyId);

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Vendor_Wise_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
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
