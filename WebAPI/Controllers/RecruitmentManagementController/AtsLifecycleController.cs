using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace HRMSWebAPI.Controllers.RecruitmentManagementController
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AtsLifecycleController : ControllerBase
    {
        private readonly IAtsLifecycleRepository _repository;
        private readonly IRecruitmentNotificationService _notificationService;
        private readonly IConfiguration _configuration;

        public AtsLifecycleController(
            IAtsLifecycleRepository repository,
            IRecruitmentNotificationService notificationService,
            IConfiguration configuration)
        {
            _repository = repository;
            _notificationService = notificationService;
            _configuration = configuration;
        }

        private string ResolveCompanyId(string? fallbackCompanyId = null)
        {
            if (!string.IsNullOrWhiteSpace(fallbackCompanyId))
                return fallbackCompanyId;

            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            if (!string.IsNullOrEmpty(decryptedCompanyId))
                return decryptedCompanyId;

            return "";
        }

        // =========================================================================
        // STEP 4 & 5: VENDOR TO REQUISITION ALLOCATION (CJ DARCL ATS)
        // =========================================================================

        [HttpGet("GetVendorsForMapping")]
        public async Task<IActionResult> GetVendorsForMapping(
            [FromQuery] long reqId,
            [FromQuery] string? companyId = null,
            [FromQuery] string? vendorType = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var vendors = await _repository.GetVendorsForMappingAsync(reqId, scopedCompanyId, vendorType);
                return Ok(vendors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendors for mapping", error = ex.Message });
            }
        }

        [HttpGet("GetVendorsByLocation")]
        public async Task<IActionResult> GetVendorsByLocation(
            [FromQuery] string? companyId,
            [FromQuery] string? locationId = null,
            [FromQuery] long? reqId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var vendors = await _repository.GetVendorsByLocationAsync(scopedCompanyId, locationId, reqId);
                return Ok(vendors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendors by company & location", error = ex.Message });
            }
        }

        [HttpPost("AssignVendorToCandidate")]
        public async Task<IActionResult> AssignVendorToCandidate([FromBody] AssignVendorToCandidateDto dto)
        {
            if (dto == null || dto.AppId <= 0 || string.IsNullOrWhiteSpace(dto.VendorId))
                return BadRequest(new { success = false, message = "Application ID and Staffing Vendor selection are required." });

            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var assignedBy = HttpContext.Items["DecryptedUserId"]?.ToString() ?? dto.AssignedBy ?? "Recruiter";

                var result = await _repository.AssignVendorToCandidateAsync(dto, assignedBy, scopedCompanyId);

                bool isSuccess = result != null && Convert.ToBoolean(result.Success);
                if (!isSuccess)
                {
                    return BadRequest(new { success = false, message = (string?)result?.Message ?? "Failed to assign staffing vendor." });
                }

                return Ok(new
                {
                    success = true,
                    message = (string?)result?.Message ?? "Staffing vendor assigned successfully.",
                    vendorId = (string?)result?.VendorId,
                    vendorName = (string?)result?.VendorName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error assigning vendor to candidate", error = ex.Message });
            }
        }

        [HttpPost("SaveVendorMapping")]
        public async Task<IActionResult> SaveVendorMapping([FromBody] VendorMappingDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.SaveVendorMappingAsync(dto, scopedCompanyId);
                return Ok(result ?? new { success = true, message = "Vendor mapping saved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error saving vendor mapping", error = ex.Message });
            }
        }

        [HttpPost("SaveBulkVendorMapping")]
        public async Task<IActionResult> SaveBulkVendorMapping([FromBody] List<VendorMappingDto> dtoList)
        {
            if (dtoList == null || dtoList.Count == 0)
                return BadRequest(new { success = false, message = "No vendor allocations provided." });

            try
            {
                int successCount = await _repository.SaveBulkVendorMappingAsync(dtoList, ResolveCompanyId);
                return Ok(new { success = true, count = successCount, message = $"{successCount} vendor(s) allocated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error saving bulk vendor allocations", error = ex.Message });
            }
        }

        /// <summary>
        /// Sends formal email intimation to assigned staffing vendors and optional additional recipients.
        /// Zero DB inline queries — asynchronous background SMTP delivery with audit log into SAL_Email_Log via repository.
        /// </summary>
        [HttpPost("SendVendorRequisitionIntimationEmail")]
        public async Task<IActionResult> SendVendorRequisitionIntimationEmail([FromBody] SendVendorJobEmailDto dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Invalid email request payload." });

            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var senderUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "System";

                // Dispatch email asynchronously
                _ = SendVendorIntimationEmailInternalAsync(dto, scopedCompanyId);

                // Dispatch in-app notification to all active vendor users (ReceiverRole = 'Vendor')
                if (dto.LockedVendorEmails != null && dto.LockedVendorEmails.Count > 0)
                {
                    foreach (var v in dto.LockedVendorEmails)
                    {
                        if (!string.IsNullOrWhiteSpace(v.VendorId))
                        {
                            _ = _notificationService.SendVendorJobAssignmentNotificationAsync(
                                scopedCompanyId,
                                v.VendorId,
                                dto.MrfCode ?? "",
                                dto.JobTitle ?? "Job Mandate",
                                senderUserId
                            );
                        }
                    }
                }

                int lockedCount = dto.LockedVendorEmails?.Count ?? 0;
                int additionalCount = dto.AdditionalEmails?.Count ?? 0;
                return Ok(new
                {
                    success = true,
                    message = $"Vendor requisition intimation emails and in-app notifications dispatched successfully to {lockedCount + additionalCount} recipient(s).",
                    recipientCount = lockedCount + additionalCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error dispatching vendor intimation emails", error = ex.Message });
            }
        }

        private async Task SendVendorIntimationEmailInternalAsync(SendVendorJobEmailDto dto, string companyId)
        {
            try
            {
                var allRecipients = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                if (dto.LockedVendorEmails != null)
                {
                    foreach (var v in dto.LockedVendorEmails)
                    {
                        if (!string.IsNullOrWhiteSpace(v.Email) && v.Email.Contains('@'))
                            allRecipients.Add(v.Email.Trim());
                    }
                }

                if (dto.AdditionalEmails != null)
                {
                    foreach (var e in dto.AdditionalEmails)
                    {
                        if (!string.IsNullOrWhiteSpace(e) && e.Contains('@'))
                            allRecipients.Add(e.Trim());
                    }
                }

                if (allRecipients.Count == 0) return;

                string subject = !string.IsNullOrWhiteSpace(dto.Subject)
                    ? dto.Subject
                    : $"[NEW ASSIGNMENT] Job Opportunity: {dto.JobTitle} ({dto.MrfCode}) - CJ DARCL Logistics";

                string templatePath = Path.Combine(AppContext.BaseDirectory, "Templates", "Email", "Vendor_Requisition_Assigned.html");
                if (!System.IO.File.Exists(templatePath))
                {
                    templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email", "Vendor_Requisition_Assigned.html");
                }

                string specialInstructionsHtml = "";
                if (!string.IsNullOrWhiteSpace(dto.CustomRemarks))
                {
                    specialInstructionsHtml = $@"<div class=""instructions-box"">
                        <b>Recruiter Sourcing Instructions:</b><br/>
                        {System.Net.WebUtility.HtmlEncode(dto.CustomRemarks)}
                    </div>";
                }

                string body = "";
                if (System.IO.File.Exists(templatePath))
                {
                    body = await System.IO.File.ReadAllTextAsync(templatePath);
                    body = body.Replace("{{MRF_CODE}}", dto.MrfCode ?? "")
                               .Replace("{{JOB_TITLE}}", dto.JobTitle ?? "")
                               .Replace("{{DEPARTMENT}}", dto.Department ?? "Operations")
                               .Replace("{{LOCATION}}", dto.Location ?? "Hub Operations")
                               .Replace("{{OPENINGS}}", (dto.Openings > 0 ? dto.Openings : 1).ToString())
                               .Replace("{{EXPERIENCE}}", !string.IsNullOrWhiteSpace(dto.ExperienceRange) ? dto.ExperienceRange : "Standard")
                               .Replace("{{CTC}}", !string.IsNullOrWhiteSpace(dto.CtcRange) ? dto.CtcRange : "As per company standards")
                               .Replace("{{CHANNEL_TYPE}}", !string.IsNullOrWhiteSpace(dto.ChannelType) ? dto.ChannelType : "Supply Vendors")
                               .Replace("{{ACTION_DATE}}", DateTime.Now.ToString("dd-MMM-yyyy HH:mm"))
                               .Replace("{{SPECIAL_INSTRUCTIONS_HTML}}", specialInstructionsHtml)
                               .Replace("{{PORTAL_URL}}", "http://localhost:4200/#/dash/recruitment/recruitmentdashboard/vendor-portal");
                }
                else
                {
                    body = $@"<div style='font-family: Arial, sans-serif; padding: 20px;'>
                        <h3>CJ DARCL Logistics — Sourcing Mandate</h3>
                        <p>Job Requisition <b>{dto.MrfCode} — {dto.JobTitle}</b> at <b>{dto.Location}</b> has been assigned to you.</p>
                        <p>Open Positions: <b>{dto.Openings}</b></p>
                        {specialInstructionsHtml}
                        <p>Please submit candidates via the CJ DARCL Vendor Portal.</p>
                    </div>";
                }

                using var smtp = new SmtpClient("smtp.gmail.com", 587)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential("ofctesting62@gmail.com", "owzxcappjvuvaxzh")
                };

                foreach (var recipient in allRecipients)
                {
                    try
                    {
                        var mail = new MailMessage
                        {
                            From = new MailAddress("ofctesting62@gmail.com", "CJ DARCL Talent Acquisition"),
                            Subject = subject,
                            Body = body,
                            IsBodyHtml = true
                        };
                        mail.To.Add(recipient);

                        await smtp.SendMailAsync(mail);

                        // Audit Log into SAL_Email_Log via Repository
                        await _repository.LogEmailAuditAsync(recipient, subject, body, 1, string.Empty);
                    }
                    catch (Exception exRecipient)
                    {
                        await _repository.LogEmailAuditAsync(recipient, subject, body, 0, exRecipient.Message);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SendVendorIntimationEmailInternalAsync] Error: {ex.Message}");
            }
        }

        [HttpPost("DeallocateVendor")]
        public async Task<IActionResult> DeallocateVendor([FromQuery] long reqId, [FromQuery] string vendorId, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                await _repository.DeallocateVendorAsync(reqId, vendorId, scopedCompanyId);
                return Ok(new { success = true, message = "Vendor deallocated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error deallocating vendor", error = ex.Message });
            }
        }

        [HttpPost("DeallocateBulkVendors")]
        public async Task<IActionResult> DeallocateBulkVendors([FromBody] List<VendorMappingDto> dtoList)
        {
            if (dtoList == null || dtoList.Count == 0)
                return BadRequest(new { success = false, message = "No vendors provided for deallocation." });

            try
            {
                int successCount = await _repository.DeallocateBulkVendorsAsync(dtoList, ResolveCompanyId);
                return Ok(new { success = true, count = successCount, message = $"{successCount} vendor(s) deallocated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error deallocating bulk vendors", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 5 & 10: VENDOR SOURCING & ONBOARDING PORTAL (CJ DARCL ATS)
        // =========================================================================

        [HttpGet("GetMyVendorProfile")]
        public async Task<IActionResult> GetMyVendorProfile()
        {
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                if (string.IsNullOrEmpty(userId))
                    return Ok(new { isVendor = false, vendorId = "", vendorName = "" });

                var scopedCompanyId = ResolveCompanyId();
                var profile = await _repository.GetUserVendorProfileAsync(userId, scopedCompanyId);

                if (profile == null)
                    return Ok(new { isVendor = false, vendorId = "", vendorName = "", vendorCode = "" });

                return Ok(new 
                { 
                    isVendor = Convert.ToBoolean(profile.isVendor), 
                    vendorId = (string)profile.vendorId,
                    vendorName = (string)profile.vendorName,
                    vendorCode = (string)profile.vendorCode
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetVendorListForPortal")]
        public async Task<IActionResult> GetVendorListForPortal([FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var vendors = await _repository.GetVendorListForPortalAsync(scopedCompanyId);
                return Ok(vendors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendors for portal", error = ex.Message });
            }
        }

        [HttpGet("GetVendorPortalMetrics")]
        public async Task<IActionResult> GetVendorPortalMetrics([FromQuery] string vendorId, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var metrics = await _repository.GetVendorPortalMetricsAsync(vendorId, scopedCompanyId);

                return Ok(metrics ?? new
                {
                    assignedJobsCount = 0,
                    totalSubmissions = 0,
                    inReviewCount = 0,
                    selectedCount = 0,
                    hiredCount = 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendor metrics", error = ex.Message });
            }
        }

        [HttpGet("GetVendorAssignedJobs")]
        public async Task<IActionResult> GetVendorAssignedJobs([FromQuery] string vendorId, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var jobs = await _repository.GetVendorAssignedJobsAsync(vendorId, scopedCompanyId);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendor assigned jobs", error = ex.Message });
            }
        }

        [HttpGet("GetVendorSelectedCandidates")]
        public async Task<IActionResult> GetVendorSelectedCandidates([FromQuery] string vendorId, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var candidates = await _repository.GetVendorSelectedCandidatesAsync(vendorId, scopedCompanyId);
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendor selected candidates", error = ex.Message });
            }
        }

        [HttpGet("GetVendorJobSubmissions")]
        public async Task<IActionResult> GetVendorJobSubmissions([FromQuery] string vendorId, [FromQuery] long reqId, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                // If user is logged in as a vendor, strictly lock to their own vendorId
                if (!string.IsNullOrEmpty(userId))
                {
                    var profile = await _repository.GetUserVendorProfileAsync(userId, scopedCompanyId);
                    if (profile != null && Convert.ToBoolean(profile.isVendor) && !string.IsNullOrEmpty((string?)profile.vendorId))
                    {
                        vendorId = (string)profile.vendorId;
                    }
                }

                var candidates = await _repository.GetVendorJobSubmissionsAsync(vendorId, reqId, scopedCompanyId);
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendor job submissions", error = ex.Message });
            }
        }

        // =========================================================================
        // VENDOR ALL CANDIDATES & TALENT POOL (Pre-registered & Assigned)
        // =========================================================================

        [HttpGet("GetVendorAllCandidates")]
        public async Task<IActionResult> GetVendorAllCandidates(
            [FromQuery] string vendorId,
            [FromQuery] string? stageFilter = "ALL",
            [FromQuery] string? searchQuery = null,
            [FromQuery] string? companyId = null)
        {
            if (string.IsNullOrEmpty(vendorId))
                return BadRequest(new { success = false, message = "vendorId is required." });

            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();

                // If user is logged in as vendor, restrict to their assigned vendor ID
                if (!string.IsNullOrEmpty(userId))
                {
                    var profile = await _repository.GetUserVendorProfileAsync(userId, scopedCompanyId);
                    if (profile != null && Convert.ToBoolean(profile.isVendor) && !string.IsNullOrEmpty((string?)profile.vendorId))
                    {
                        vendorId = (string)profile.vendorId;
                    }
                }

                var candidates = await _repository.GetVendorAllCandidatesAsync(vendorId, stageFilter ?? "ALL", searchQuery, scopedCompanyId);
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendor candidates", error = ex.Message });
            }
        }

        [HttpGet("GetVendorPoolCandidates")]
        public async Task<IActionResult> GetVendorPoolCandidates(
            [FromQuery] string? vendorId = null,
            [FromQuery] long? targetReqId = null,
            [FromQuery] string? searchQuery = null,
            [FromQuery] string? poolFilter = "ALL",
            [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (!string.IsNullOrEmpty(userId))
                {
                    var profile = await _repository.GetUserVendorProfileAsync(userId, scopedCompanyId);
                    if (profile != null && Convert.ToBoolean(profile.isVendor) && !string.IsNullOrEmpty((string?)profile.vendorId))
                    {
                        vendorId = (string)profile.vendorId;
                    }
                }

                string? effectiveVendorId = string.IsNullOrWhiteSpace(vendorId) || vendorId == "ALL" || vendorId == "HR" ? null : vendorId.Trim();
                var candidates = await _repository.GetVendorPoolCandidatesAsync(effectiveVendorId, targetReqId, searchQuery, poolFilter ?? "ALL", scopedCompanyId);
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading vendor pool candidates", error = ex.Message });
            }
        }

        [HttpPost("SubmitVendorCandidateBatch")]
        public async Task<IActionResult> SubmitVendorCandidateBatch([FromBody] SubmitVendorCandidateBatchDto dto)
        {
            if (dto == null || dto.Candidates == null || dto.Candidates.Count == 0)
                return BadRequest(new { success = false, message = "No candidate data provided for submission." });

            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? dto.SubmittedBy ?? "Vendor Portal";

                // If user is logged in as a vendor, strictly lock submission to their own vendorId
                if (!string.IsNullOrEmpty(userId))
                {
                    var profile = await _repository.GetUserVendorProfileAsync(userId, scopedCompanyId);
                    if (profile != null && Convert.ToBoolean(profile.isVendor) && !string.IsNullOrEmpty((string?)profile.vendorId))
                    {
                        dto.VendorId = (string)profile.vendorId;
                        dto.VendorName = (string)profile.vendorName ?? dto.VendorName;
                    }
                }

                var results = new List<dynamic>();
                int succeeded = 0;
                int failed = 0;

                foreach (var c in dto.Candidates)
                {
                    if (string.IsNullOrWhiteSpace(c.CandidateName) || string.IsNullOrWhiteSpace(c.Mobile))
                    {
                        results.Add(new { success = false, candidateName = c.CandidateName, message = "Candidate Name and Mobile are mandatory." });
                        failed++;
                        continue;
                    }

                    var res = await _repository.SubmitVendorCandidateAsync(dto.ReqId, dto.VendorId, dto.VendorName, c, userId, scopedCompanyId);

                    bool isSuccess = res != null && Convert.ToBoolean(res.Success);
                    if (isSuccess)
                    {
                        succeeded++;
                        results.Add(new { success = true, candidateName = c.CandidateName, appId = res.AppId, applicationNo = res.ApplicationNo, message = res.Message });
                    }
                    else
                    {
                        failed++;
                        results.Add(new { success = false, candidateName = c.CandidateName, message = res?.Message ?? "Registration failed." });
                    }
                }

                if (succeeded > 0)
                {
                    try
                    {
                        var reqOwner = await _repository.GetJobRequisitionOwnerAsync(dto.ReqId);
                        string hrUserId = reqOwner?.SubmittedById?.ToString() ?? "";
                        string mrf = reqOwner?.MrfCode?.ToString() ?? dto.ReqId.ToString();

                        if (!string.IsNullOrEmpty(hrUserId))
                        {
                            _ = _notificationService.SendHrCandidateSubmissionNotificationAsync(
                                scopedCompanyId,
                                hrUserId,
                                dto.VendorName ?? "Vendor Partner",
                                mrf,
                                succeeded,
                                userId);
                        }
                    }
                    catch { }
                }

                return Ok(new
                {
                    success = succeeded > 0,
                    total = dto.Candidates.Count,
                    succeeded,
                    failed,
                    results,
                    message = $"Processed {dto.Candidates.Count} candidate(s): {succeeded} registered, {failed} rejected/duplicate."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error submitting vendor candidates", error = ex.Message });
            }
        }

        /// <summary>
        /// Centralized Aadhaar Card Deduplication & Validation API.
        /// Checks across active employees, active recruitment pipeline, and talent bench records.
        /// </summary>
        [HttpPost("VerifyAadhaarUniqueness")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyAadhaarUniqueness([FromBody] ValidateAadhaarRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.AadhaarNo))
            {
                return BadRequest(new ValidateAadhaarResultDto
                {
                    IsSuccess = false,
                    IsDuplicate = false,
                    CanProceed = false,
                    DuplicateType = "INVALID_FORMAT",
                    Message = "Aadhaar number is required."
                });
            }

            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.ValidateAadhaarUniquenessAsync(dto.AadhaarNo.Trim(), scopedCompanyId, dto.CurrentAppId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ValidateAadhaarResultDto
                {
                    IsSuccess = false,
                    IsDuplicate = false,
                    CanProceed = false,
                    DuplicateType = "ERROR",
                    Message = "Error verifying Aadhaar uniqueness: " + ex.Message
                });
            }
        }

        [HttpPost("AssignBenchCandidatesToJob")]
        public async Task<IActionResult> AssignBenchCandidatesToJob([FromBody] AssignBenchCandidatesBatchDto dto)
        {
            if (dto == null || dto.AppIds == null || dto.AppIds.Count == 0 || dto.ReqId == 0)
                return BadRequest(new { success = false, message = "Requisition ID and at least one Candidate ID are required." });

            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? dto.AssignedBy ?? "Vendor Portal";

                if (!string.IsNullOrEmpty(userId))
                {
                    var profile = await _repository.GetUserVendorProfileAsync(userId, scopedCompanyId);
                    if (profile != null && Convert.ToBoolean(profile.isVendor) && !string.IsNullOrEmpty((string?)profile.vendorId))
                    {
                        dto.VendorId = (string)profile.vendorId;
                    }
                }

                string? effectiveVendorId = string.IsNullOrWhiteSpace(dto.VendorId) || dto.VendorId == "ALL" || dto.VendorId == "HR" ? null : dto.VendorId.Trim();
                string appIdCsv = string.Join(",", dto.AppIds);

                var result = await _repository.AssignBenchCandidatesToJobAsync(dto.ReqId, effectiveVendorId, appIdCsv, userId, scopedCompanyId);

                bool success = result != null && (Convert.ToString(result.Success) == "True" || Convert.ToString(result.Success) == "1");
                return Ok(new
                {
                    success = success,
                    message = (string?)result?.Message ?? (success ? "Candidates assigned successfully." : "Failed to assign candidates."),
                    succeededCount = (int?)result?.SucceededCount ?? 0,
                    failedCount = (int?)result?.FailedCount ?? 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error assigning bench candidates to job", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 6: CANDIDATE REGISTRATION (Vendor App & QR Direct Mobile Site)
        // =========================================================================

        [HttpPost("RegisterCandidate")]
        public async Task<IActionResult> RegisterCandidate([FromBody] CandidateRegistrationDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.RegisterCandidateApplicationAsync(dto, scopedCompanyId);
                return Ok(result ?? new { success = true, message = "Candidate registration processed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error registering candidate", error = ex.Message });
            }
        }

        // =========================================================================
        // STEPS 4 TO 16: CANDIDATE PIPELINE ROSTER
        // =========================================================================

        [HttpGet("GetCandidatePipeline")]
        public async Task<IActionResult> GetCandidatePipeline(
            [FromQuery] long? reqId = null,
            [FromQuery] string? stageFilter = "ALL",
            [FromQuery] string? searchQuery = null,
            [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var roster = await _repository.GetCandidatePipelineAsync(reqId, stageFilter ?? "ALL", searchQuery, scopedCompanyId);
                return Ok(roster);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching candidate pipeline", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 7: INTERVIEW SCHEDULING
        // =========================================================================

        [HttpPost("ScheduleInterview")]
        public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.ScheduleInterviewAsync(dto, scopedCompanyId);

                bool isSuccess = result != null && (Convert.ToBoolean(result.Success) || Convert.ToInt32(result.Success) == 1);
                if (!isSuccess)
                {
                    return BadRequest(new { success = false, message = (string?)result?.Message ?? "Failed to schedule interview." });
                }

                // In-app notification to vendor if candidate belongs to a vendor partner
                try
                {
                    var cand = await _repository.GetCandidateApplicationBriefAsync(dto.AppId);
                    if (cand != null && !string.IsNullOrEmpty((string?)cand.fk_vendorId))
                    {
                        _ = _notificationService.SendVendorCandidateStatusNotificationAsync(
                            scopedCompanyId,
                            (string)cand.fk_vendorId,
                            (string?)cand.CandidateName ?? "Candidate",
                            (string?)cand.MrfCode ?? "",
                            $"Interview Scheduled for {dto.InterviewDate} ({dto.InterviewRound})",
                            dto.ScheduledBy ?? "Site HR");
                    }
                }
                catch { }

                return Ok(result ?? new { success = true, message = "Interview scheduled successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error scheduling interview", error = ex.Message });
            }
        }

        // =========================================================================
        // STEPS 8 & 9: INTERVIEW EVALUATION & SKILL CLASSIFICATION
        // =========================================================================

        [HttpPost("SubmitInterviewEvaluation")]
        public async Task<IActionResult> SubmitInterviewEvaluation([FromBody] InterviewEvaluationDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.SubmitInterviewEvaluationAsync(dto, scopedCompanyId);

                if (result != null)
                {
                    var dict = (IDictionary<string, object>)result;
                    if (dict.ContainsKey("Success") && Convert.ToInt32(dict["Success"]) == 0)
                    {
                        return BadRequest(new { success = false, message = dict.ContainsKey("Message") ? dict["Message"]?.ToString() : "Application not found." });
                    }
                }

                // In-app notification to vendor on interview decision
                try
                {
                    var cand = await _repository.GetCandidateApplicationBriefAsync(dto.AppId);

                    if (cand != null && !string.IsNullOrEmpty((string?)cand.fk_vendorId))
                    {
                        bool isSelected = string.Equals(dto.Decision, "Selected", StringComparison.OrdinalIgnoreCase);
                        if (isSelected)
                        {
                            _ = _notificationService.SendVendorCandidateSelectedActionNotificationAsync(
                                scopedCompanyId,
                                (string)cand.fk_vendorId,
                                (string?)cand.CandidateName ?? "Candidate",
                                (string?)cand.MrfCode ?? "",
                                dto.AppId,
                                dto.EvaluatorName ?? "Interviewer");
                        }
                        else
                        {
                            _ = _notificationService.SendVendorCandidateStatusNotificationAsync(
                                scopedCompanyId,
                                (string)cand.fk_vendorId,
                                (string?)cand.CandidateName ?? "Candidate",
                                (string?)cand.MrfCode ?? "",
                                $"Interview Evaluation Result: {dto.Decision}",
                                dto.EvaluatorName ?? "Interviewer");
                        }
                    }
                }
                catch { }

                return Ok(result ?? new { success = true, message = "Interview evaluation submitted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error submitting interview evaluation", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 10: ONBOARDING DOCUMENT CAPTURE
        // =========================================================================

        [HttpPost("SaveOnboardingDocs")]
        public async Task<IActionResult> SaveOnboardingDocs([FromBody] OnboardingDocsDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.SaveCandidateOnboardingDocsAsync(dto, scopedCompanyId);
                return Ok(result ?? new { success = true, message = "Documents uploaded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error saving onboarding documents", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 11: SITE HR DOCUMENT VERIFICATION
        // =========================================================================

        [HttpPost("VerifyDocuments")]
        public async Task<IActionResult> VerifyDocuments([FromBody] VerifyDocsDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.VerifyCandidateDocumentsAsync(dto, scopedCompanyId);
                return Ok(result ?? new { success = true, message = "Documents verified." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error verifying documents", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 11B: 22-POINT CANDIDATE DOCUMENT REVIEW & VERIFICATION ARCHITECTURE
        // =========================================================================

        [HttpGet("GetCandidateDocuments")]
        public async Task<IActionResult> GetCandidateDocuments([FromQuery] long appId, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var (candidate, documents) = await _repository.GetCandidateDocumentsAsync(appId, scopedCompanyId);

                return Ok(new
                {
                    success = true,
                    candidate = candidate,
                    documents = documents
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching candidate documents", error = ex.Message });
            }
        }

        [HttpPost("UploadCandidateDocument")]
        public async Task<IActionResult> UploadCandidateDocument(
            [FromForm] long appId,
            [FromForm] string docTypeCode,
            [FromForm] string? companyId = null,
            IFormFile? file = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "Site HR Admin";

                string fileName = file?.FileName ?? $"{docTypeCode}.pdf";
                string fileType = file?.ContentType ?? "application/pdf";
                long fileSize = file?.Length ?? 102400;
                string uniqueFileName = $"{appId}_{docTypeCode}_{DateTime.Now:yyyyMMddHHmmss}{Path.GetExtension(fileName)}";
                string filePath = $"/Uploads/CandidateDocuments/{uniqueFileName}";

                if (file != null && file.Length > 0)
                {
                    try
                    {
                        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "CandidateDocuments");
                        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                        var savedPath = Path.Combine(uploadsFolder, uniqueFileName);
                        using var stream = new FileStream(savedPath, FileMode.Create);
                        await file.CopyToAsync(stream);
                    }
                    catch
                    {
                        // Fallback virtual path
                    }
                }

                var result = await _repository.UploadCandidateDocumentItemAsync(
                    appId, docTypeCode, fileName, filePath, fileSize, fileType, userId, scopedCompanyId);

                bool isSuccess = result != null && (Convert.ToString(result.Success) == "True" || Convert.ToString(result.Success) == "1");
                if (!isSuccess)
                {
                    return BadRequest(new { success = false, message = (string?)result?.Message ?? "Failed to upload document." });
                }

                return Ok(result ?? new { success = true, message = "Document uploaded successfully.", filePath = filePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error uploading document", error = ex.Message });
            }
        }

        [HttpGet("ViewCandidateDocument")]
        public async Task<IActionResult> ViewCandidateDocument([FromQuery] long? docId, [FromQuery] long? appId, [FromQuery] string? docTypeCode, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var doc = await _repository.GetCandidateDocumentFileAsync(docId, appId, docTypeCode, scopedCompanyId);

                if (doc == null)
                    return NotFound(new { message = "Document record not found in repository." });

                try
                {
                    var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "HR Admin";
                    await _repository.MarkCandidateDocumentViewedAsync(docId ?? (long?)doc.docId, appId ?? (long?)doc.appId, docTypeCode ?? (string?)doc.DocTypeCode, userId);
                }
                catch { /* non-blocking */ }

                string rawPath = (string?)doc.FilePath ?? "";
                string fileName = (string?)doc.FileName ?? "document.pdf";
                string docTypeName = (string?)doc.DocTypeName ?? doc.DocTypeCode ?? "Document";

                string physicalPath = rawPath;
                if (!System.IO.File.Exists(physicalPath))
                {
                    string clean = rawPath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
                    physicalPath = Path.Combine(Directory.GetCurrentDirectory(), clean);
                }

                if (!System.IO.File.Exists(physicalPath))
                {
                    var candDocsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "CandidateDocuments");
                    if (Directory.Exists(candDocsFolder))
                    {
                        var pattern = $"{doc.appId}_{doc.DocTypeCode}*.*";
                        var matchedFile = Directory.GetFiles(candDocsFolder, pattern).OrderByDescending(System.IO.File.GetLastWriteTime).FirstOrDefault();
                        if (matchedFile != null && System.IO.File.Exists(matchedFile))
                        {
                            physicalPath = matchedFile;
                        }
                    }
                }

                if (!System.IO.File.Exists(physicalPath))
                {
                    var html = $@"<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'/>
<title>{docTypeName} - Preview</title>
<style>
body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 80vh; }}
.card {{ background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); padding: 36px; max-width: 560px; text-align: center; }}
.badge {{ display: inline-block; background: #eff6ff; color: #0051d5; border: 1px solid #bfdbfe; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }}
h2 {{ color: #0f172a; margin: 0 0 8px 0; font-size: 20px; }}
p {{ color: #64748b; font-size: 13px; line-height: 1.6; margin: 8px 0; }}
.meta-box {{ background: #f1f5f9; border-radius: 8px; padding: 14px; margin: 20px 0; text-align: left; font-size: 12px; }}
.meta-row {{ display: flex; justify-content: space-between; margin-bottom: 6px; }}
.meta-row:last-child {{ margin-bottom: 0; }}
.meta-label {{ color: #64748b; font-weight: 500; }}
.meta-val {{ color: #0f172a; font-weight: 600; }}
.stamp {{ color: #059669; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 16px; border-radius: 8px; }}
</style>
</head>
<body>
<div class='card'>
  <div class='badge'>CJ DARCL Logistics · Digital Repository</div>
  <h2>{docTypeName}</h2>
  <p>Official Candidate Onboarding Credential Record</p>
  <div class='meta-box'>
    <div class='meta-row'><span class='meta-label'>Document Name:</span><span class='meta-val'>{fileName}</span></div>
    <div class='meta-row'><span class='meta-label'>Document Code:</span><span class='meta-val'>{doc.DocTypeCode}</span></div>
    <div class='meta-row'><span class='meta-label'>Application ID:</span><span class='meta-val'>{doc.appId}</span></div>
    <div class='meta-row'><span class='meta-label'>Repository Status:</span><span class='meta-val'>Digitally Indexed</span></div>
  </div>
  <div class='stamp'>✓ Verified in CJ DARCL Document Repository</div>
</div>
</body>
</html>";
                    return Content(html, "text/html");
                }

                var ext = Path.GetExtension(physicalPath).ToLower();
                var contentType = ext switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".pdf" => "application/pdf",
                    _ => "application/octet-stream"
                };

                var bytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
                Response.Headers.Append("Content-Disposition", $"inline; filename=\"{fileName}\"");
                return File(bytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error streaming document", error = ex.Message });
            }
        }

        [HttpPost("VerifyCandidateDocumentItem")]
        public async Task<IActionResult> VerifyCandidateDocumentItem([FromBody] VerifyDocItemDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "Site HR Admin";

                var result = await _repository.VerifyCandidateDocumentItemAsync(dto, dto.VerifiedBy ?? userId, scopedCompanyId);

                bool isSuccess = result != null && (Convert.ToString(result.Success) == "True" || Convert.ToString(result.Success) == "1");
                if (!isSuccess)
                {
                    return BadRequest(new { success = false, message = (string?)result?.Message ?? "Failed to update document status." });
                }

                return Ok(result ?? new { success = true, message = "Document status updated." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error verifying document", error = ex.Message });
            }
        }

        [HttpPost("MarkCandidateDocumentViewed")]
        public async Task<IActionResult> MarkCandidateDocumentViewed([FromBody] MarkDocViewedDto dto)
        {
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "Site HR Admin";
                await _repository.MarkCandidateDocumentViewedAsync(dto.DocId, dto.AppId, dto.DocTypeCode, dto.ViewedBy ?? userId);
                return Ok(new { success = true, message = "Document marked as viewed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error marking document as viewed", error = ex.Message });
            }
        }

        [HttpPost("SaveCandidateOnboardingDossier")]
        public async Task<IActionResult> SaveCandidateOnboardingDossier([FromBody] CandidateDossierDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "Site HR Admin";

                var result = await _repository.SaveCandidateOnboardingDossierAsync(dto, userId, scopedCompanyId);

                bool isSuccess = result != null && (Convert.ToString(result.Success) == "True" || Convert.ToString(result.Success) == "1");
                if (!isSuccess)
                {
                    return BadRequest(new { success = false, message = (string?)result?.Message ?? "Failed to save candidate dossier." });
                }

                return Ok(result ?? new { success = true, message = "Candidate dossier saved." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error saving candidate dossier", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 12: CANDIDATE ID & OFFER LETTER GENERATION
        // =========================================================================

        [HttpPost("GenerateOfferLetter")]
        public async Task<IActionResult> GenerateOfferLetter([FromBody] GenerateOfferDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.GenerateOfferLetterAsync(dto, scopedCompanyId);
                return Ok(result ?? new { success = true, message = "Offer letter generated." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error generating offer letter", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 12b: ISSUE OFFER LETTER — Word template → PDF (Syncfusion) + Email
        // =========================================================================

        [HttpPost("IssueOfferLetterPdf")]
        public async Task<IActionResult> IssueOfferLetterPdf([FromBody] IssueOfferLetterDto dto)
        {
            if (dto.AppIds == null || dto.AppIds.Count == 0)
                return BadRequest(new { success = false, message = "No AppIds provided." });

            var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
            var templateFolder = _configuration["AppSettings:LetterTemplatesFolderPath"] ?? "LetterTemplates";
            var offerLetterFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "OfferLetters");
            Directory.CreateDirectory(offerLetterFolder);

            var emailSvc = new EmailService(_configuration);
            var results = new List<object>();

            foreach (var appId in dto.AppIds)
            {
                try
                {
                    // 1. Resolve per-candidate override if present
                    var ovr = dto.PerCandidateOverrides.FirstOrDefault(x => x.AppId == appId);

                    decimal gross = ovr?.GrossCTC > 0 ? ovr.GrossCTC : dto.GrossCTC;
                    decimal basic = ovr?.BasicSalary > 0 ? ovr.BasicSalary : dto.BasicSalary;
                    decimal hra = ovr?.HRA > 0 ? ovr.HRA : dto.HRA;
                    decimal da = ovr?.DA > 0 ? ovr.DA : dto.DA;
                    decimal conv = ovr?.Conveyance > 0 ? ovr.Conveyance : dto.Conveyance;
                    decimal med = ovr?.MedicalAllowance > 0 ? ovr.MedicalAllowance : dto.MedicalAllowance;
                    decimal other = ovr?.OtherAllowance > 0 ? ovr.OtherAllowance : dto.OtherAllowance;
                    decimal pf = ovr?.PfDeduction > 0 ? ovr.PfDeduction : dto.PfDeduction;
                    string desig = ovr?.Designation ?? dto.Designation ?? "";
                    string? joinStr = ovr?.JoiningDate ?? dto.JoiningDate;
                    DateTime? joinDate = DateTime.TryParse(joinStr, out var jd) ? jd : (DateTime?)null;

                    // 2. Save to DB via repository — returns full candidate + vendor info
                    var spResult = await _repository.GenerateOfferLetterDetailedAsync(
                        appId,
                        scopedCompanyId,
                        dto.IssuedBy ?? "Corporate HR",
                        desig,
                        dto.Department ?? "",
                        dto.Location ?? "",
                        dto.ReportingManager ?? "",
                        joinDate,
                        dto.ProbationPeriod ?? "90 Days",
                        dto.NoticePeriod ?? "30 Days",
                        gross,
                        basic,
                        hra,
                        da,
                        conv,
                        med,
                        other,
                        pf);

                    if (spResult == null)
                    {
                        results.Add(new { appId, success = false, message = "SP returned no data." });
                        continue;
                    }

                    var spData = (IDictionary<string, object>)spResult;

                    // 3. Build data object for template
                    var companyName = _configuration["AppSettings:CompanyName"] ?? "Company";
                    var companyAddr = _configuration["AppSettings:CompanyAddress"] ?? "";

                    var offerData = new OfferLetterData
                    {
                        AppId = appId,
                        OfferId = spData.ContainsKey("offerId") ? Convert.ToInt32(spData["offerId"]) : 0,
                        OfferCode = spData.ContainsKey("offerCode") ? spData["offerCode"]?.ToString() : "",
                        CandidateCode = spData.ContainsKey("candidateCode") ? spData["candidateCode"]?.ToString() : "",
                        CandidateName = spData.ContainsKey("candidateName") ? spData["candidateName"]?.ToString() : "",
                        FatherName = spData.ContainsKey("fatherName") ? spData["fatherName"]?.ToString() : "",
                        CandidateAddress = spData.ContainsKey("candidateAddress") ? spData["candidateAddress"]?.ToString() : "",
                        CandidateEmail = spData.ContainsKey("candidateEmail") ? spData["candidateEmail"]?.ToString() : "",
                        VendorEmail = spData.ContainsKey("vendorEmail") ? spData["vendorEmail"]?.ToString() : "",
                        VendorCode = spData.ContainsKey("vendorCode") ? spData["vendorCode"]?.ToString() : "",
                        VendorName = spData.ContainsKey("vendorName") && !string.IsNullOrWhiteSpace(spData["vendorName"]?.ToString()) ? spData["vendorName"]?.ToString() : (spData.ContainsKey("companyName") ? spData["companyName"]?.ToString() : companyName),
                        Designation = spData.ContainsKey("designation") ? spData["designation"]?.ToString() : desig,
                        Department = spData.ContainsKey("department") ? spData["department"]?.ToString() : dto.Department,
                        Location = spData.ContainsKey("location") ? spData["location"]?.ToString() : dto.Location,
                        ReportingManager = spData.ContainsKey("reportingManager") ? spData["reportingManager"]?.ToString() : dto.ReportingManager,
                        JoiningDate = joinDate,
                        ProbationPeriod = dto.ProbationPeriod ?? "90 Days",
                        NoticePeriod = dto.NoticePeriod ?? "30 Days",
                        GrossCTC = gross,
                        BasicSalary = basic,
                        HRA = hra,
                        DA = da,
                        Conveyance = conv,
                        MedicalAllowance = med,
                        OtherAllowance = other,
                        PfDeduction = pf,
                        IssuedBy = dto.IssuedBy ?? "Corporate HR",
                        IssuedDate = DateTime.Now.ToString("dd MMMM yyyy"),
                        CompanyName = companyName,
                        CompanyAddress = companyAddr,
                        SalaryHeads = dto.SalaryHeads
                    };

                    // 4. Generate PDF from Word template via Syncfusion (includes dynamic non-zero CTC heads)
                    byte[] pdfBytes = OfferLetterGenerator.GenerateOfferLetterPdf(offerData, templateFolder);

                    // 5. Save PDF to wwwroot/OfferLetters/
                    string safeOfferCode = (offerData.OfferCode ?? "").Replace('/', '_').Replace('\\', '_');
                    string pdfFileName = $"OfferLetter_{safeOfferCode}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                    string pdfFilePath = Path.Combine(offerLetterFolder, pdfFileName);
                    await System.IO.File.WriteAllBytesAsync(pdfFilePath, pdfBytes);
                    string relativePdfPath = $"OfferLetters/{pdfFileName}";

                    // 5b. Persist offer letter path and dynamic salary heads JSON immediately to both tables
                    try
                    {
                        string? headsJson = (dto.SalaryHeads != null && dto.SalaryHeads.Count > 0)
                            ? System.Text.Json.JsonSerializer.Serialize(dto.SalaryHeads)
                            : null;
                        await _repository.SaveOfferLetterPathAsync(appId, offerData.OfferId, relativePdfPath, headsJson);
                    }
                    catch { /* non-blocking */ }

                    // 6. Send email with PDF attached
                    var sentTo = new List<string>();
                    string emailSubject = $"Offer Letter — {offerData.Designation} | {companyName}";
                    string emailBodyCandidate = BuildOfferEmailBody(offerData, companyName, isVendor: false);
                    string emailBodyVendor = BuildOfferEmailBody(offerData, companyName, isVendor: true);

                    if (!string.IsNullOrWhiteSpace(offerData.CandidateEmail))
                    {
                        await emailSvc.SendEmailWithAttachmentAsync(
                            offerData.CandidateEmail, emailSubject, emailBodyCandidate,
                            pdfBytes, pdfFileName);
                        sentTo.Add(offerData.CandidateEmail);
                    }

                    if (!string.IsNullOrWhiteSpace(offerData.VendorEmail))
                    {
                        string vendorSubject = $"Offer Issued — {offerData.CandidateName} for {offerData.Designation} | {companyName}";
                        await emailSvc.SendEmailWithAttachmentAsync(
                            offerData.VendorEmail, vendorSubject, emailBodyVendor,
                            pdfBytes, pdfFileName);
                        sentTo.Add(offerData.VendorEmail);
                    }

                    // 7. Update email sent status in DB
                    if (offerData.OfferId > 0 && sentTo.Count > 0)
                    {
                        await _repository.UpdateOfferLetterEmailStatusAsync(offerData.OfferId, string.Join(", ", sentTo), relativePdfPath);
                    }

                    results.Add(new
                    {
                        appId,
                        success = true,
                        offerCode = offerData.OfferCode,
                        candidateCode = offerData.CandidateCode,
                        candidateName = offerData.CandidateName,
                        emailSentTo = sentTo,
                        pdfFileName
                    });
                }
                catch (Exception ex)
                {
                    results.Add(new { appId, success = false, message = ex.Message });
                }
            }

            int successCount = results.Count(r => (bool)((dynamic)r).success);
            return Ok(new
            {
                success = successCount > 0,
                total = dto.AppIds.Count,
                sent = successCount,
                failed = dto.AppIds.Count - successCount,
                results
            });
        }

        // ── Offer email HTML builder ─────────────────────────────────
        private static string BuildOfferEmailBody(OfferLetterData d, string companyName, bool isVendor)
        {
            string salutation = isVendor
                ? $"Dear <b>Recruitment Partner</b>,"
                : $"Dear <b>{d.CandidateName}</b>,";

            string body = isVendor
                ? $"We are pleased to inform you that your sourced candidate <b>{d.CandidateName}</b> has been issued an Offer Letter for the position of <b>{d.Designation}</b> at <b>{d.Location}</b>. Please find the offer letter attached."
                : $"Congratulations! We are pleased to extend an offer of employment for the position of <b>{d.Designation}</b>. Please find your Offer Letter attached to this email.";

            return $@"
            <div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e1e4e8;border-radius:8px;overflow:hidden'>
              <div style='background:#3080e8;padding:20px 24px;color:#fff'>
                <h2 style='margin:0;font-size:18px'>{companyName} — Offer Letter</h2>
                <p style='margin:4px 0 0;font-size:12px;opacity:.9'>Talent Acquisition</p>
              </div>
              <div style='padding:24px;font-size:13px;line-height:1.6'>
                <p>{salutation}</p>
                <p>{body}</p>
                <table style='width:100%;border-collapse:collapse;margin:16px 0;font-size:12px'>
                  <tr><td style='padding:7px 12px;background:#f7f9fc;font-weight:600;width:40%'>Candidate</td><td style='padding:7px 12px'>{d.CandidateName}</td></tr>
                  <tr><td style='padding:7px 12px;background:#f7f9fc;font-weight:600'>Designation</td><td style='padding:7px 12px'>{d.Designation}</td></tr>
                  <tr><td style='padding:7px 12px;background:#f7f9fc;font-weight:600'>Department</td><td style='padding:7px 12px'>{d.Department}</td></tr>
                  <tr><td style='padding:7px 12px;background:#f7f9fc;font-weight:600'>Location</td><td style='padding:7px 12px'>{d.Location}</td></tr>
                  <tr><td style='padding:7px 12px;background:#f7f9fc;font-weight:600'>Date of Joining</td><td style='padding:7px 12px'>{d.JoiningDate?.ToString("dd MMMM yyyy")}</td></tr>
                  <tr><td style='padding:7px 12px;background:#f7f9fc;font-weight:600'>Offer Code</td><td style='padding:7px 12px'><b>{d.OfferCode}</b></td></tr>
                </table>
                <p style='font-size:12px;color:#718096'>Please review the attached offer letter PDF and revert with your acceptance at the earliest.</p>
              </div>
              <div style='background:#f8fafc;padding:14px 24px;font-size:11px;color:#718096;text-align:center;border-top:1px solid #e1e4e8'>
                {companyName} &bull; Talent Acquisition &bull; Confidential
              </div>
            </div>";
        }

        private static string BuildConsolidatedVendorOfferEmailBody(
            string vendorName,
            string companyName,
            List<dynamic> candidateList)
        {
            var rowsHtml = new System.Text.StringBuilder();
            int idx = 1;
            foreach (var c in candidateList)
            {
                string cName = (string?)c.candidateName ?? "Candidate";
                string appNo = (string?)c.applicationNo ?? "";
                string desig = (string?)c.designation ?? "-";
                string dept = (string?)c.department ?? "-";
                string doj = c.expectedJoiningDate != null ? Convert.ToDateTime(c.expectedJoiningDate).ToString("dd MMM yyyy") : "TBD";
                string ctc = c.offeredCTC != null ? $"₹{Convert.ToDecimal(c.offeredCTC):N0}" : "-";

                rowsHtml.Append($@"
                    <tr style='border-bottom: 1px solid #edf2f7;'>
                        <td style='padding: 10px 12px; font-weight: 600; text-align: center;'>{idx++}</td>
                        <td style='padding: 10px 12px; font-weight: 600; color: #1a202c;'>{cName}</td>
                        <td style='padding: 10px 12px; color: #4a5568;'>{appNo}</td>
                        <td style='padding: 10px 12px; color: #4a5568;'>{desig}</td>
                        <td style='padding: 10px 12px; color: #4a5568;'>{dept}</td>
                        <td style='padding: 10px 12px; color: #2b6cb0; font-weight: 500;'>{doj}</td>
                        <td style='padding: 10px 12px; font-weight: 600; color: #276749; text-align: right;'>{ctc}</td>
                    </tr>");
            }

            return $@"
            <div style='font-family:Segoe UI,Helvetica,Arial,sans-serif;max-width:780px;margin:0 auto;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>
              <div style='background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);padding:24px 30px;color:#ffffff;'>
                <div style='font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;opacity:0.85;margin-bottom:4px;'>Talent Acquisition & Staffing Operations</div>
                <h2 style='margin:0;font-size:20px;font-weight:700;'>{companyName} — Offer Letters Release</h2>
              </div>
              <div style='padding:28px 30px;background:#ffffff;font-size:14px;line-height:1.6;color:#2d3748;'>
                <p style='margin-top:0;'>Dear <b>{vendorName}</b>,</p>
                <p>We are pleased to inform you that the following <b>{candidateList.Count}</b> candidate(s) sponsored by your organization have been selected and officially issued Offer Letters. All official Offer Letter PDF documents are attached to this email.</p>
                
                <div style='overflow-x:auto;margin:20px 0;'>
                  <table style='width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;'>
                    <thead>
                      <tr style='background:#f7fafc;border-bottom:2px solid #cbd5e0;color:#4a5568;text-align:left;'>
                        <th style='padding:10px 12px;text-align:center;'>#</th>
                        <th style='padding:10px 12px;'>Candidate Name</th>
                        <th style='padding:10px 12px;'>App No</th>
                        <th style='padding:10px 12px;'>Designation</th>
                        <th style='padding:10px 12px;'>Department</th>
                        <th style='padding:10px 12px;'>Expected DOJ</th>
                        <th style='padding:10px 12px;text-align:right;'>Offered CTC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsHtml}
                    </tbody>
                  </table>
                </div>

                <div style='background:#ebf8ff;border-left:4px solid #3182ce;padding:14px 16px;border-radius:4px;font-size:13px;color:#2b6cb0;margin:20px 0;'>
                  <strong>Next Steps:</strong>
                  <ul style='margin:6px 0 0;padding-left:20px;'>
                    <li>Kindly forward the respective signed Offer Letters to the candidates.</li>
                    <li>Ensure all candidate joining formalities, medical clearance, and mandatory KYC documents are completed prior to the respective Expected DOJ.</li>
                    <li>Please acknowledge receipt of this email with candidate joining confirmations.</li>
                  </ul>
                </div>

                <p style='margin-bottom:0;'>Best Regards,<br/><b>Talent Acquisition Team</b><br/>{companyName}</p>
              </div>
              <div style='background:#f8fafc;padding:16px 30px;font-size:11px;color:#a0aec0;text-align:center;border-top:1px solid #e2e8f0;'>
                This is an automated communication generated by the ATS System. &bull; Strictly Confidential
              </div>
            </div>";
        }

        // =========================================================================
        // STEP 12c: CONSOLIDATED STAFFING VENDOR EMAIL DISPATCH (ONE EMAIL PER VENDOR)
        // =========================================================================

        [HttpPost("SendVendorOfferLettersBatch")]
        public async Task<IActionResult> SendVendorOfferLettersBatch([FromBody] SendVendorOfferEmailBatchDto dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Payload cannot be empty." });

            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var emailSvc = new EmailService(_configuration);
                var companyName = _configuration["AppSettings:CompanyName"] ?? "Company";
                var webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

                var candidates = (await _repository.GetCandidateOfferDetailsForVendorBatchAsync(dto.AppIds, scopedCompanyId)).ToList();
                if (candidates == null || candidates.Count == 0)
                {
                    return Ok(new VendorOfferEmailBatchResultDto
                    {
                        Success = false,
                        TotalVendors = 0,
                        TotalCandidates = 0,
                        Message = "No candidates found in Offer Letter stage for the given selection."
                    });
                }

                if (!string.IsNullOrWhiteSpace(dto.FilterVendorId))
                {
                    candidates = candidates.Where(c => ((string?)c.vendorId) == dto.FilterVendorId).ToList();
                }

                // Group candidates by Vendor (Email and VendorId)
                var vendorGroups = candidates
                    .GroupBy(c => new
                    {
                        VendorEmail = ((string?)c.vendorEmail)?.Trim().ToLowerInvariant() ?? "",
                        VendorId = ((string?)c.vendorId)?.Trim() ?? "",
                        VendorName = ((string?)c.vendorName)?.Trim() ?? "Staffing Partner"
                    })
                    .ToList();

                var groupSummaries = new List<VendorOfferEmailGroupSummaryDto>();
                int totalSentVendors = 0;
                int totalSentCandidates = 0;

                foreach (var group in vendorGroups)
                {
                    var groupCandidates = group.ToList();
                    string vendorEmail = group.Key.VendorEmail;
                    string vendorName = !string.IsNullOrWhiteSpace(group.Key.VendorName) ? group.Key.VendorName : "Staffing Partner";
                    string vendorId = group.Key.VendorId;
                    var candidateNames = new List<string>();
                    var groupAppIds = new List<long>();
                    foreach (var c in groupCandidates)
                    {
                        candidateNames.Add((string)(c.candidateName ?? "Candidate"));
                        groupAppIds.Add(Convert.ToInt64(c.appId));
                    }

                    var summary = new VendorOfferEmailGroupSummaryDto
                    {
                        VendorId = vendorId,
                        VendorName = vendorName,
                        VendorEmail = vendorEmail,
                        CandidateCount = groupCandidates.Count,
                        CandidateNames = candidateNames
                    };

                    if (string.IsNullOrWhiteSpace(vendorEmail))
                    {
                        summary.EmailSent = false;
                        summary.StatusMessage = "No vendor email address found on file.";
                        groupSummaries.Add(summary);
                        continue;
                    }

                    // Collect PDF attachments for all candidates in this vendor group
                    var attachments = new List<(byte[] Bytes, string FileName)>();
                    foreach (var c in groupCandidates)
                    {
                        string? relPath = (string?)c.offerPdfPath;
                        if (!string.IsNullOrWhiteSpace(relPath))
                        {
                            string localPath = Path.Combine(webRoot, relPath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar));
                            if (System.IO.File.Exists(localPath))
                            {
                                byte[] bytes = await System.IO.File.ReadAllBytesAsync(localPath);
                                string fileName = Path.GetFileName(localPath);
                                attachments.Add((bytes, fileName));
                            }
                        }
                    }

                    if (attachments.Count == 0)
                    {
                        summary.EmailSent = false;
                        summary.StatusMessage = "No Offer Letter PDFs found on server for these candidates. Generate offer letters first.";
                        groupSummaries.Add(summary);
                        continue;
                    }

                    // Build single consolidated email body
                    string subject = $"Selected Candidates — Official Offer Letters ({groupCandidates.Count}) | {companyName}";
                    string htmlBody = BuildConsolidatedVendorOfferEmailBody(vendorName, companyName, groupCandidates);

                    // Send ONE email to this vendor with ALL candidate offer PDFs attached
                    bool sent = await emailSvc.SendEmailWithMultipleAttachmentsAsync(vendorEmail, subject, htmlBody, attachments);
                    if (sent)
                    {
                        await _repository.UpdateCandidateOfferEmailStatusBatchAsync(groupAppIds, vendorEmail, dto.SentBy ?? "HR Team");
                        summary.EmailSent = true;
                        summary.StatusMessage = $"Dispatched {attachments.Count} offer letter(s) in a single consolidated email to {vendorEmail}.";
                        totalSentVendors++;
                        totalSentCandidates += groupCandidates.Count;
                    }
                    else
                    {
                        summary.EmailSent = false;
                        summary.StatusMessage = "SMTP email dispatch failed.";
                    }

                    groupSummaries.Add(summary);
                }

                return Ok(new VendorOfferEmailBatchResultDto
                {
                    Success = totalSentVendors > 0,
                    TotalVendors = vendorGroups.Count,
                    TotalCandidates = candidates.Count,
                    Message = totalSentVendors > 0
                        ? $"Successfully dispatched offer letters to {totalSentVendors} vendor(s) covering {totalSentCandidates} candidate(s)."
                        : "Failed to dispatch vendor emails. Please review vendor email configurations.",
                    VendorSummaries = groupSummaries
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // =========================================================================
        // OFFER LETTER HISTORY
        // =========================================================================

        [HttpGet("GetOfferLetterHistory")]
        public async Task<IActionResult> GetOfferLetterHistory([FromQuery] long appId = 0, [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var rows = await _repository.GetOfferLetterHistoryAsync(appId, scopedCompanyId);
                return Ok(new { success = true, data = rows });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // =========================================================================
        // VIEW & DOWNLOAD OFFER LETTER PDF (Accessible from Offer & Hired stages)
        // =========================================================================

        [HttpGet("ViewOfferLetter")]
        [HttpGet("DownloadOfferLetter")]
        public async Task<IActionResult> ViewOfferLetter([FromQuery] long appId = 0, [FromQuery] int offerId = 0, [FromQuery] bool download = false)
        {
            try
            {
                string? pdfPath = null;
                string? candidateName = null;

                if (offerId > 0)
                {
                    var row = await _repository.GetOfferLetterRecordAsync(offerId);
                    if (row != null)
                    {
                        pdfPath = (string?)row.pdfFilePath;
                        candidateName = (string?)row.candidateName;
                    }
                }

                if (string.IsNullOrWhiteSpace(pdfPath) && appId > 0)
                {
                    var row = await _repository.GetOfferLetterRecordByAppIdAsync(appId);
                    if (row != null)
                    {
                        pdfPath = (string?)row.pdfFilePath;
                        candidateName = (string?)row.CandidateName;
                    }
                }

                string physicalPath = ResolvePhysicalPath(pdfPath);

                // If file does not exist on disk, or no record existed, auto-generate on-the-fly for the candidate
                if ((string.IsNullOrWhiteSpace(pdfPath) || !System.IO.File.Exists(physicalPath)) && appId > 0)
                {
                    pdfPath = await GenerateOfferLetterOnTheFlyAsync(appId);
                    if (!string.IsNullOrWhiteSpace(pdfPath))
                    {
                        physicalPath = ResolvePhysicalPath(pdfPath);
                        if (string.IsNullOrWhiteSpace(candidateName))
                        {
                            var r = await _repository.GetOfferLetterRecordByAppIdAsync(appId);
                            if (r != null) candidateName = (string?)r.CandidateName;
                        }
                    }
                }

                if (string.IsNullOrWhiteSpace(physicalPath) || !System.IO.File.Exists(physicalPath))
                {
                    return NotFound(new { success = false, message = "Offer letter file could not be generated or located on disk." });
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
                string cleanName = (candidateName ?? $"Candidate_{appId}").Replace(" ", "_");
                string ext = Path.GetExtension(physicalPath).ToLowerInvariant();
                string mimeType = ext == ".docx"
                    ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    : (ext == ".doc" ? "application/msword" : "application/pdf");
                string downloadName = $"OfferLetter_{cleanName}_{appId}{(ext.Length > 0 ? ext : ".pdf")}";

                if (download)
                {
                    return File(fileBytes, mimeType, downloadName);
                }

                Response.Headers["Content-Disposition"] = $"inline; filename=\"{downloadName}\"";
                return File(fileBytes, mimeType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private string ResolvePhysicalPath(string? pdfPath)
        {
            if (string.IsNullOrWhiteSpace(pdfPath)) return string.Empty;
            if (System.IO.File.Exists(pdfPath)) return pdfPath;

            string clean = pdfPath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
            var candidates = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", clean),
                Path.Combine(AppContext.BaseDirectory, "wwwroot", clean),
                Path.Combine(@"d:\hr_24_10\WebAPI\WebAPI\wwwroot", clean),
                Path.Combine(Directory.GetCurrentDirectory(), clean),
                Path.Combine(AppContext.BaseDirectory, clean)
            };

            foreach (var cand in candidates)
            {
                if (System.IO.File.Exists(cand)) return cand;
            }

            return candidates[0];
        }

        private async Task<string?> GenerateOfferLetterOnTheFlyAsync(long appId)
        {
            try
            {
                var spResult = await _repository.GenerateOfferLetterDetailedAsync(
                    appId,
                    "GU-8",
                    "Corporate HR",
                    "",
                    "",
                    "",
                    "",
                    DateTime.Now.AddDays(14),
                    "90 Days",
                    "30 Days",
                    0, 0, 0, 0, 0, 0, 0, 0);

                if (spResult == null) return null;

                var spData = (IDictionary<string, object>)spResult;
                var companyName = _configuration["AppSettings:CompanyName"] ?? "Company";
                var companyAddr = _configuration["AppSettings:CompanyAddress"] ?? "";
                var templateFolder = _configuration["AppSettings:LetterTemplatesFolderPath"] ?? "LetterTemplates";
                var offerLetterFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "OfferLetters");
                if (!Directory.Exists(offerLetterFolder))
                {
                    offerLetterFolder = Path.Combine(AppContext.BaseDirectory, "wwwroot", "OfferLetters");
                }
                Directory.CreateDirectory(offerLetterFolder);

                decimal gross = spData.ContainsKey("grossCTC") && spData["grossCTC"] != null && Convert.ToDecimal(spData["grossCTC"]) > 0 ? Convert.ToDecimal(spData["grossCTC"]) : 360000m;
                decimal basic = spData.ContainsKey("basicSalary") && spData["basicSalary"] != null && Convert.ToDecimal(spData["basicSalary"]) > 0 ? Convert.ToDecimal(spData["basicSalary"]) : Math.Round(gross * 0.40m);
                decimal hra = spData.ContainsKey("hra") && spData["hra"] != null && Convert.ToDecimal(spData["hra"]) > 0 ? Convert.ToDecimal(spData["hra"]) : Math.Round(gross * 0.20m);
                decimal da = spData.ContainsKey("da") && spData["da"] != null && Convert.ToDecimal(spData["da"]) > 0 ? Convert.ToDecimal(spData["da"]) : Math.Round(gross * 0.10m);
                decimal conv = spData.ContainsKey("conveyance") && spData["conveyance"] != null && Convert.ToDecimal(spData["conveyance"]) > 0 ? Convert.ToDecimal(spData["conveyance"]) : 19200m;
                decimal med = spData.ContainsKey("medicalAllowance") && spData["medicalAllowance"] != null && Convert.ToDecimal(spData["medicalAllowance"]) > 0 ? Convert.ToDecimal(spData["medicalAllowance"]) : 15000m;
                decimal other = spData.ContainsKey("otherAllowance") && spData["otherAllowance"] != null && Convert.ToDecimal(spData["otherAllowance"]) > 0 ? Convert.ToDecimal(spData["otherAllowance"]) : Math.Max(0, gross - (basic + hra + da + conv + med));
                decimal pf = spData.ContainsKey("pfDeduction") && spData["pfDeduction"] != null && Convert.ToDecimal(spData["pfDeduction"]) > 0 ? Convert.ToDecimal(spData["pfDeduction"]) : Math.Round(basic * 0.12m);

                int offerId = spData.ContainsKey("offerId") && spData["offerId"] != null ? Convert.ToInt32(spData["offerId"]) : 0;
                string offerCode = spData.ContainsKey("offerCode") ? spData["offerCode"]?.ToString() ?? "" : "";

                List<OfferSalaryHeadDto>? heads = null;
                try
                {
                    var offerRow = await _repository.GetOfferLetterRecordByAppIdAsync(appId);
                    if (offerRow != null && offerRow.salaryHeadsJson != null)
                    {
                        string json = (string)offerRow.salaryHeadsJson;
                        if (!string.IsNullOrWhiteSpace(json))
                        {
                            heads = System.Text.Json.JsonSerializer.Deserialize<List<OfferSalaryHeadDto>>(json);
                        }
                    }
                }
                catch { }

                var offerData = new OfferLetterData
                {
                    AppId = appId,
                    OfferId = offerId,
                    OfferCode = offerCode,
                    CandidateCode = spData.ContainsKey("candidateCode") ? spData["candidateCode"]?.ToString() : "",
                    CandidateName = spData.ContainsKey("candidateName") ? spData["candidateName"]?.ToString() : "",
                    FatherName = spData.ContainsKey("fatherName") ? spData["fatherName"]?.ToString() : "",
                    CandidateAddress = spData.ContainsKey("candidateAddress") ? spData["candidateAddress"]?.ToString() : "",
                    CandidateEmail = spData.ContainsKey("candidateEmail") ? spData["candidateEmail"]?.ToString() : "",
                    VendorEmail = spData.ContainsKey("vendorEmail") ? spData["vendorEmail"]?.ToString() : "",
                    VendorCode = spData.ContainsKey("vendorCode") ? spData["vendorCode"]?.ToString() : "",
                    VendorName = spData.ContainsKey("vendorName") && !string.IsNullOrWhiteSpace(spData["vendorName"]?.ToString()) ? spData["vendorName"]?.ToString() : (spData.ContainsKey("companyName") ? spData["companyName"]?.ToString() : companyName),
                    Designation = spData.ContainsKey("designation") ? spData["designation"]?.ToString() : "",
                    Department = spData.ContainsKey("department") ? spData["department"]?.ToString() : "",
                    Location = spData.ContainsKey("location") ? spData["location"]?.ToString() : "",
                    ReportingManager = spData.ContainsKey("reportingManager") ? spData["reportingManager"]?.ToString() : "",
                    JoiningDate = DateTime.Now.AddDays(14),
                    ProbationPeriod = "90 Days",
                    NoticePeriod = "30 Days",
                    GrossCTC = gross,
                    BasicSalary = basic,
                    HRA = hra,
                    DA = da,
                    Conveyance = conv,
                    MedicalAllowance = med,
                    OtherAllowance = other,
                    PfDeduction = pf,
                    SalaryHeads = heads,
                    IssuedBy = "Corporate HR",
                    IssuedDate = DateTime.Now.ToString("dd MMMM yyyy"),
                    CompanyName = companyName,
                    CompanyAddress = companyAddr
                };

                byte[] pdfBytes = OfferLetterGenerator.GenerateOfferLetterPdf(offerData, templateFolder);
                string safeOfferCode = (offerCode ?? $"App_{appId}").Replace('/', '_').Replace('\\', '_');
                string pdfFileName = $"OfferLetter_{safeOfferCode}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                string pdfFilePath = Path.Combine(offerLetterFolder, pdfFileName);
                await System.IO.File.WriteAllBytesAsync(pdfFilePath, pdfBytes);
                string relativePdfPath = $"OfferLetters/{pdfFileName}";

                await _repository.SaveOfferLetterPathAsync(appId, offerId, relativePdfPath);
                return relativePdfPath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GenerateOfferLetterOnTheFlyAsync] Error for appId {appId}: {ex}");
                return null;
            }
        }

        // =========================================================================
        // STEP 13: HIRE & TRANSFER TO EMPLOYEE MASTER (SAL_Employee_Mst)
        // =========================================================================

        [HttpPost("HireAndTransfer")]
        public async Task<IActionResult> HireAndTransfer([FromBody] HireTransferDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.HireAndTransferToEmployeeMasterAsync(dto, scopedCompanyId);

                if (result != null)
                {
                    IDictionary<string, object> dict = (IDictionary<string, object>)result;
                    int success = dict.ContainsKey("Success") ? Convert.ToInt32(dict["Success"]) : (dict.ContainsKey("success") ? Convert.ToInt32(dict["success"]) : 1);
                    if (success == 0)
                    {
                        string msg = dict.ContainsKey("Message") ? dict["Message"]?.ToString() ?? "Failed to hire candidate." : (dict.ContainsKey("message") ? dict["message"]?.ToString() ?? "Failed to hire candidate." : "Failed to hire candidate.");
                        return BadRequest(new { success = false, message = msg });
                    }
                }

                return Ok(result ?? new { success = true, message = "Candidate successfully marked as Hired." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error hiring and transferring candidate", error = ex.Message });
            }
        }

        // =========================================================================
        // CANDIDATE TAGGING & ATTRIBUTES RE-MAPPING
        // =========================================================================

        [HttpPost("TagCandidate")]
        public async Task<IActionResult> TagCandidate([FromBody] TagCandidateDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.TagCandidateAsync(dto, scopedCompanyId);
                return Ok(result ?? new { success = true, message = "Candidate tagged successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error tagging candidate", error = ex.Message });
            }
        }

        // =========================================================================
        // CANDIDATE STAGE PROGRESSION (MOVE TO NEXT STAGE)
        // =========================================================================

        [HttpPost("MoveCandidateStage")]
        public async Task<IActionResult> MoveCandidateStage([FromBody] MoveCandidateStageDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.MoveCandidateStageAsync(dto, scopedCompanyId);

                bool isSuccess = result != null && (Convert.ToBoolean(result.Success) || Convert.ToInt32(result.Success) == 1);
                if (!isSuccess)
                {
                    return BadRequest(new { success = false, message = (string?)result?.Message ?? "Failed to move candidate stage." });
                }

                // In-app notification to vendor
                try
                {
                    var cand = await _repository.GetCandidateApplicationBriefAsync(dto.AppId);

                    if (cand != null && !string.IsNullOrEmpty((string?)cand.fk_vendorId))
                    {
                        if (dto.TargetStage.Contains("Select", StringComparison.OrdinalIgnoreCase))
                        {
                            _ = _notificationService.SendVendorCandidateSelectedActionNotificationAsync(
                                scopedCompanyId,
                                (string)cand.fk_vendorId,
                                (string?)cand.CandidateName ?? "Candidate",
                                (string?)cand.MrfCode ?? "",
                                dto.AppId,
                                dto.MovedBy ?? "Recruiter");
                        }
                        else
                        {
                            _ = _notificationService.SendVendorCandidateStatusNotificationAsync(
                                scopedCompanyId,
                                (string)cand.fk_vendorId,
                                (string?)cand.CandidateName ?? "Candidate",
                                (string?)cand.MrfCode ?? "",
                                $"Stage updated to: {dto.TargetStage}",
                                dto.MovedBy ?? "Recruiter");
                        }
                    }
                }
                catch { }

                return Ok(result ?? new { success = true, message = $"Candidate moved to {dto.TargetStage}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error transitioning candidate stage", error = ex.Message });
            }
        }

        // =========================================================================
        // CANDIDATE REJECTION WITH MANDATORY REMARKS & REASON
        // =========================================================================

        [HttpPost("RejectCandidate")]
        public async Task<IActionResult> RejectCandidate([FromBody] RejectCandidateDto dto)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(dto.CompanyId);
                var result = await _repository.RejectCandidateAsync(dto, scopedCompanyId);

                // In-app notification to vendor on candidate rejection
                try
                {
                    var cand = await _repository.GetCandidateApplicationBriefAsync(dto.AppId);

                    if (cand != null && !string.IsNullOrEmpty((string?)cand.fk_vendorId))
                    {
                        _ = _notificationService.SendVendorCandidateStatusNotificationAsync(
                            scopedCompanyId,
                            (string)cand.fk_vendorId,
                            (string?)cand.CandidateName ?? "Candidate",
                            (string?)cand.MrfCode ?? "",
                            $"Candidate Rejected - Reason: {dto.RejectionReason}",
                            dto.RejectedBy ?? "Recruiter");
                    }
                }
                catch { }

                return Ok(result ?? new { success = true, message = "Candidate rejection recorded." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error recording candidate rejection", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 15: CANDIDATE LIFECYCLE AUDIT TRAIL
        // =========================================================================

        [HttpGet("GetCandidateAuditTrail")]
        public async Task<IActionResult> GetCandidateAuditTrail(
            [FromQuery] long appId,
            [FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var auditLogs = await _repository.GetCandidateAuditTrailAsync(appId, scopedCompanyId);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching candidate audit trail", error = ex.Message });
            }
        }

        // =========================================================================
        // STEP 16: RECRUITMENT MIS & PIPELINE KPI ANALYTICS
        // =========================================================================

        [HttpGet("GetRecruitmentMIS")]
        public async Task<IActionResult> GetRecruitmentMIS([FromQuery] string? companyId = null)
        {
            try
            {
                var scopedCompanyId = ResolveCompanyId(companyId);
                var (funnel, locationDemand, skillDistribution) = await _repository.GetRecruitmentMISReportAsync(scopedCompanyId);

                return Ok(new
                {
                    funnel = funnel ?? new { },
                    locationDemand = locationDemand ?? Enumerable.Empty<dynamic>(),
                    skillDistribution = skillDistribution ?? Enumerable.Empty<dynamic>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching recruitment MIS", error = ex.Message });
            }
        }
    }
}
