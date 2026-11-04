using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HRMSWebAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CandidateReportController : ControllerBase
    {
        private readonly ICandidateReportRepository _candidateReportRepository;

        public CandidateReportController(ICandidateReportRepository candidateReportRepository)
        {
            _candidateReportRepository = candidateReportRepository;
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
                var masterData = await _candidateReportRepository.GetReportMasterDataAsync(resolvedCompanyId);

                return Ok(new
                {
                    StatusCode = 200,
                    IsSuccess = true,
                    Message = "Candidate Report master data retrieved successfully.",
                    Data = masterData
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    StatusCode = 500,
                    IsSuccess = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        [HttpPost("GetCandidateReport")]
        [Authorize]
        public async Task<IActionResult> GetCandidateReport([FromBody] CandidateReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var (totalCount, summary, items) = await _candidateReportRepository.GetCandidateReportAsync(request, companyId);

                return Ok(new
                {
                    StatusCode = 200,
                    IsSuccess = true,
                    Message = "Candidate Report retrieved successfully.",
                    TotalCount = totalCount,
                    Summary = summary,
                    Data = items
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    StatusCode = 500,
                    IsSuccess = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        [HttpPost("DownloadCandidateReportExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadCandidateReportExcel([FromBody] CandidateReportFilterRequest request)
        {
            try
            {
                var companyId = !string.IsNullOrWhiteSpace(request?.CompanyId)
                    ? request.CompanyId
                    : (HttpContext.Items["DecryptedCompanyId"]?.ToString() 
                       ?? User.FindFirstValue("CompanyId") 
                       ?? User.FindFirstValue("fk_companyId") 
                       ?? "");
                var fileBytes = await _candidateReportRepository.GenerateCandidateReportExcelAsync(request, companyId);

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Candidate_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    StatusCode = 500,
                    IsSuccess = false,
                    Message = $"Excel generation failed: {ex.Message}"
                });
            }
        }
    }
}
