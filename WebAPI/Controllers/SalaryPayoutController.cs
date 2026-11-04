using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SalaryPayoutController : ControllerBase
    {
        private readonly ISalaryPayoutRepository _repo;
        private readonly IExportReportRepository _exportRepo;

        public SalaryPayoutController(
            ISalaryPayoutRepository repo,
            IExportReportRepository exportRepo)
        {
            _repo      = repo;
            _exportRepo = exportRepo;
        }

        // ═══════════════════════════════════════════════════════════════════
        // GET LIST  →  POST /api/v1/SalaryPayout/GetsalaryPayoutList
        // Optional query param: filterBatchKey to filter paid-out table
        // ═══════════════════════════════════════════════════════════════════
        [HttpPost("GetsalaryPayoutList")]
        [Authorize]
        public async Task<IActionResult> GetsalaryPayoutList(
            [FromBody] SalaryPayoutRequest request)
        {
            ModelResponse res = new();
            try
            {
                var result = await _repo.GetSalaryPayoutListAsync(
                    request.EmpCode, request.EmpCodeManual, request.EmpName,
                    request.SelectedDepartments, request.SelectedDesignation,
                    request.SelectedLocations, request.SelectedNature,
                    request.SelectedCity, request.SortBy,
                    request.fk_monthId, request.fk_yearId, request.fk_costcentreid,
                    request.FilterBatchKey,
                    request.PendingPageIndex, request.PendingPageSize,
                    request.PaidOutPageIndex, request.PaidOutPageSize,
                    request.PendingSearchTerm, request.PaidOutSearchTerm);

                if ((result.pendingList?.Count ?? 0) +
                    (result.paidOutList?.Count  ?? 0) == 0)
                {
                    res.IsSuccess = false; res.Message = "No Record found."; res.StatusCode = 400;
                    return Ok(res);
                }

                res.IsSuccess = true;
                res.Message   = "Salary payout data retrieved successfully.";
                res.StatusCode = 200;
                res.Data = new
                {
                    salaryPendingPayoutCount = result.pendingCount,
                    salaryPaidOutCount       = result.paidOutCount,
                    salaryPendingPayoutList  = result.pendingList,
                    salaryPaidOutList        = result.paidOutList,
                    payoutBatchList          = result.batchList   // for dropdown
                };
                return Ok(res);
            }
            catch (Exception ex)
            {
                res.IsSuccess = false; res.Message = ex.Message; res.StatusCode = 500;
                return Ok(res);
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // PROCESS  →  POST /api/v1/SalaryPayout/ProcessSalaryPayout
        // Returns the new BatchKey so Angular can show it immediately
        // ═══════════════════════════════════════════════════════════════════
        [HttpPost("ProcessSalaryPayout")]
        [Authorize]
        public async Task<IActionResult> ProcessSalaryPayout(
            [FromBody] SalaryPayoutRequest request)
        {
            ModelResponse res = new();
            try
            {
                if (request.SelectedEmpIds == null || request.SelectedEmpIds.Count == 0)
                {
                    res.IsSuccess = false;
                    res.Message   = "Please select at least one employee for payout.";
                    res.StatusCode = 400;
                    return Ok(res);
                }

                var userId     = HttpContext.Items["DecryptedUserId"]?.ToString();
                var locationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var companyId  = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                var (success, batchKey, affectedRows, batchId) =
                    await _repo.ProcessSalaryPayoutAsync(userId, locationId, companyId, request);

                res.IsSuccess  = true;
                res.Message    = $"Payout processed for {affectedRows} employee(s). Batch Key: {batchKey}";
                res.StatusCode = 200;
                res.Data = new { batchKey, affectedRows, batchId };
                return Ok(res);
            }
            catch (Exception ex)
            {
                res.IsSuccess = false; res.Message = "Error: " + ex.Message; res.StatusCode = 500;
                return Ok(res);
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // PROCESS UN-PAYOUT  →  POST /api/v1/SalaryPayout/ProcessSalaryUnPayout
        // ═══════════════════════════════════════════════════════════════════
        [HttpPost("ProcessSalaryUnPayout")]
        [Authorize]
        public async Task<IActionResult> ProcessSalaryUnPayout(
            [FromBody] SalaryUnPayoutRequest request)
        {
            ModelResponse res = new();
            try
            {
                if (request.Employees == null || request.Employees.Count == 0)
                {
                    res.IsSuccess = false;
                    res.Message = "Please select at least one employee for un-payout.";
                    res.StatusCode = 400;
                    return Ok(res);
                }

                if (request.Employees.Any(e => string.IsNullOrWhiteSpace(e.remark)))
                {
                    res.IsSuccess = false;
                    res.Message = "Remarks are required for all selected employees for un-payout.";
                    res.StatusCode = 400;
                    return Ok(res);
                }

                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var (success, affectedRows) = await _repo.ProcessSalaryUnPayoutAsync(userId, request);

                res.IsSuccess = true;
                res.Message = $"Un-Payout processed for {affectedRows} employee(s).";
                res.StatusCode = 200;
                res.Data = new { affectedRows };
                return Ok(res);
            }
            catch (Exception ex)
            {
                res.IsSuccess = false; res.Message = "Error: " + ex.Message; res.StatusCode = 500;
                return Ok(res);
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // DOWNLOAD  →  POST /api/v1/SalaryPayout/DownloadSalaryPayoutReport
        // If FilterBatchKey supplied → exports only that batch's employees
        // ═══════════════════════════════════════════════════════════════════
        //[HttpPost("DownloadSalaryPayoutReport")]
        //public async Task<IActionResult> DownloadSalaryPayoutReport(
        //    [FromQuery] string? reportName,
        //    [FromBody] SalaryPayoutRequest request)
        //{
        //    try
        //    {
        //        var result = await _repo.GetSalaryPayoutListAsync(
        //            request.EmpCode, request.EmpCodeManual, request.EmpName,
        //            request.SelectedDepartments, request.SelectedDesignation,
        //            request.SelectedLocations, request.SelectedNature,
        //            request.SelectedCity, request.SortBy,
        //            request.fk_monthId, request.fk_yearId, request.fk_costcentreid,
        //            request.FilterBatchKey);   // honours batch filter for export too

        //        // Export whichever list has data (paid-out preferred)
        //        List<dynamic> exportList = result.paidOutList?.Any() == true
        //            ? result.paidOutList
        //            : result.pendingList ?? new();

        //        if (!exportList.Any())
        //            return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found." });

        //        var rows = exportList.Select(i => (IDictionary<string, object>)i).ToList();

        //        string? dateHeader = null;
        //        if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
        //        {
        //            int m = int.Parse(request.fk_monthId), y = int.Parse(request.fk_yearId);
        //            dateHeader = $"For the month of {new DateTime(y, m, 1):MMMM yyyy}";
        //            // Append batch key to header if filtering
        //            if (!string.IsNullOrEmpty(request.FilterBatchKey))
        //                dateHeader += $"  |  Batch: {request.FilterBatchKey}";
        //        }

        //        var bytes = await ExcelHelper.GenerateAttendanceExcelReportAsync(
        //            reportName:         reportName ?? "Salary Payout Report",
        //            results:            rows,
        //            contractorName:     request.ContractorName,
        //            dateHeaderText:     dateHeader,
        //            getCompanyNameFunc: () => _exportRepo.GetCompanyNameAsync());

        //        return File(bytes,
        //            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //            $"{reportName ?? "SalaryPayout"}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { IsSuccess = false, Message = ex.Message });
        //    }
        //}





   
        









    }
}
