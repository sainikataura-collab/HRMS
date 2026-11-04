using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace HRMSWebAPI.Controllers.RecruitmentManagementController
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AtsJobRequisitionController : ControllerBase
    {
        private readonly IAtsJobRequisitionRepository _repository;
        private readonly IRecruitmentNotificationService _notificationService;
        private readonly HRMSWebAPI.Helper.EmailService _emailService;

        public AtsJobRequisitionController(
            IAtsJobRequisitionRepository repository,
            IRecruitmentNotificationService notificationService,
            HRMSWebAPI.Helper.EmailService emailService)
        {
            _repository = repository;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        /// <summary>
        /// Retrieves master data for creating/editing a requisition:
        /// Departments, Locations (with Buffer Metrics), Designations, Employees,
        /// and default user location prefill.
        /// </summary>
        [HttpGet("GetRequisitionMasterData")]
        public async Task<IActionResult> GetRequisitionMasterData(
            [FromQuery] string? userId = null,
            [FromQuery] string? loginName = null,
            [FromQuery] string? companyId = null)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var scopedCompanyId = !string.IsNullOrEmpty(companyId) ? companyId : decryptedCompanyId;

                var (depts, locs, desigs, emps, defaultLoc) = await _repository.GetRequisitionMasterDataAsync(userId, loginName, scopedCompanyId);

                return Ok(new
                {
                    departments = depts,
                    locations = locs,
                    designations = desigs,
                    employees = emps,
                    defaultLocationId = defaultLoc?.defaultLocationId?.ToString(),
                    defaultLocationName = defaultLoc?.defaultLocationName?.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching master data", error = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves all job requisitions with workflow approval status.
        /// </summary>
        [HttpGet("GetJobRequisitions")]
        public async Task<IActionResult> GetJobRequisitions([FromQuery] string? companyId = null)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var scopedCompanyId = !string.IsNullOrEmpty(companyId) ? companyId : decryptedCompanyId;

                var jobs = await _repository.GetJobRequisitionsAsync(null, null, null, null, null, 1, 1000, scopedCompanyId, null, null, null);

                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching job requisitions", error = ex.Message });
            }
        }

        /// <summary>
        /// Persists all wizard fields into REC_JobRequisition_Mst, initializes L1 workflow,
        /// and writes initial approval and audit logs.
        /// </summary>
        [HttpPost("SaveJobRequisition")]
        public async Task<IActionResult> SaveJobRequisition([FromBody] JsonElement payload)
        {
            try
            {
                string jobTitle = GetSafeString(payload, "jobTitle");
                string serviceType = GetSafeString(payload, "serviceType");
                string designation = GetSafeString(payload, "designation");
                string skillCategory = GetSafeString(payload, "skillCategory");
                int openPositions = GetSafeInt(payload, "openPositions") ?? 1;
                string location = GetSafeString(payload, "location");
                string department = GetSafeString(payload, "department");
                string hiringType = GetSafeString(payload, "hiringType", "New");
                bool? isDiversityHiring = null;
                if (payload.TryGetProperty("isDiversityHiring", out var idh) && idh.ValueKind != JsonValueKind.Null && idh.ValueKind != JsonValueKind.Undefined)
                {
                    if (idh.ValueKind == JsonValueKind.True || idh.ValueKind == JsonValueKind.False)
                        isDiversityHiring = idh.GetBoolean();
                    else if (bool.TryParse(idh.GetString(), out var bVal))
                        isDiversityHiring = bVal;
                }
                string diversityCategory = GetSafeString(payload, "diversityCategory");
                
                string workplaceType = GetSafeString(payload, "workplaceType", "On-Site");
                string employmentType = GetSafeString(payload, "employmentType", "Full-Time");
                
                decimal? experienceMin = GetSafeDecimal(payload, "experienceMin");
                decimal? experienceMax = GetSafeDecimal(payload, "experienceMax");
                decimal? ctcMin = GetSafeDecimal(payload, "ctcMin");
                decimal? ctcMax = GetSafeDecimal(payload, "ctcMax");
                
                string currency = GetSafeString(payload, "currency", "INR");
                string priority = GetSafeString(payload, "priority", "Medium");
                string targetStartDate = GetSafeString(payload, "targetStartDate");
                string educationLevel = GetSafeString(payload, "educationLevel");
                string primarySkills = GetSafeString(payload, "primarySkills");
                string secondarySkills = GetSafeString(payload, "secondarySkills");
                int? noticePeriodMaxDays = GetSafeInt(payload, "noticePeriodMaxDays");
                string industry = GetSafeString(payload, "industry", "Logistics & Supply Chain");
                
                string jobDescription = GetSafeString(payload, "jobDescription");
                string responsibilities = GetSafeString(payload, "responsibilities");
                string qualifications = GetSafeString(payload, "qualifications");
                string benefits = GetSafeString(payload, "benefits");
                
                string hiringManager = GetSafeString(payload, "hiringManager");
                string hiringManagerId = GetSafeString(payload, "hiringManagerId");
                string leadRecruiter = GetSafeString(payload, "leadRecruiter");
                string leadRecruiterId = GetSafeString(payload, "leadRecruiterId");
                string l1Approver = GetSafeString(payload, "l1Approver");
                if (string.IsNullOrWhiteSpace(l1Approver))
                {
                    l1Approver = GetSafeString(payload, "l1ApproverName");
                }
                string l1ApproverId = GetSafeString(payload, "l1ApproverId");

                string fk_locid = GetSafeString(payload, "fk_locid");
                string fk_deptid = GetSafeString(payload, "fk_deptid");
                string fk_subdeptid = GetSafeString(payload, "fk_subdeptid");
                string fk_desgid = GetSafeString(payload, "fk_desgid");
                string fk_classid = GetSafeString(payload, "fk_classid");
                string fk_catid = GetSafeString(payload, "fk_catid");
                long? fk_costcentreid = GetSafeLong(payload, "fk_costcentreid");
                string fk_zoneId = GetSafeString(payload, "fk_zoneId");
                string fk_cityid = GetSafeString(payload, "fk_cityid");
                string businessVertical = GetSafeString(payload, "businessVertical");
                
                string interviewers = "";
                if (payload.TryGetProperty("interviewers", out var inv) && inv.ValueKind == JsonValueKind.Array)
                {
                    var list = new List<string>();
                    foreach (var item in inv.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.String)
                        {
                            var s = item.GetString();
                            if (!string.IsNullOrWhiteSpace(s))
                                list.Add(s.Trim());
                        }
                    }
                    interviewers = string.Join(", ", list);
                }

                bool isDraft = GetSafeBool(payload, "isDraft");
                bool isBufferUtilized = GetSafeBool(payload, "isBufferUtilized");
                int bufferHeadsUtilized = GetSafeInt(payload, "bufferHeadsUtilized") ?? 0;
                string submittedBy = GetSafeString(payload, "submittedBy");
                string submittedById = GetSafeString(payload, "submittedById");
                string decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                if (!string.IsNullOrWhiteSpace(decryptedUserId))
                {
                    decryptedUserId = decryptedUserId.Replace("GU-", "", StringComparison.OrdinalIgnoreCase).Trim();
                }

                if (string.IsNullOrWhiteSpace(submittedById) || submittedById == "1")
                {
                    if (!string.IsNullOrWhiteSpace(decryptedUserId))
                    {
                        submittedById = decryptedUserId;
                    }
                }

                // If submittedBy is missing or default fallback, look up real name via repository
                if (string.IsNullOrWhiteSpace(submittedBy) || submittedBy.Equals("Site HR Admin", StringComparison.OrdinalIgnoreCase) || submittedBy.Equals("Site HR", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        var userRecord = await _repository.ResolveUserNameAsync(submittedById, null);
                        if (userRecord != null && !string.IsNullOrWhiteSpace((string)userRecord.ResolvedName))
                        {
                            submittedBy = (string)userRecord.ResolvedName;
                        }
                    }
                    catch { }
                }

                if (string.IsNullOrWhiteSpace(submittedBy))
                {
                    submittedBy = "HR Administrator";
                }

                string companyId = GetSafeString(payload, "companyId");
                if (string.IsNullOrWhiteSpace(companyId))
                {
                    companyId = GetSafeString(payload, "fk_companyId");
                }
                if (string.IsNullOrWhiteSpace(companyId))
                {
                    companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                }

                var parameters = new DynamicParameters();
                parameters.Add("JobTitle", jobTitle);
                parameters.Add("ServiceType", serviceType);
                parameters.Add("Designation", designation);
                parameters.Add("SkillCategory", skillCategory);
                parameters.Add("OpenPositions", openPositions);
                parameters.Add("Location", location);
                parameters.Add("Department", department);
                parameters.Add("HiringType", hiringType);
                parameters.Add("IsDiversityHiring", isDiversityHiring);
                parameters.Add("DiversityCategory", diversityCategory);
                parameters.Add("WorkplaceType", workplaceType);
                parameters.Add("EmploymentType", employmentType);
                parameters.Add("ExperienceMin", experienceMin);
                parameters.Add("ExperienceMax", experienceMax);
                parameters.Add("CtcMin", ctcMin);
                parameters.Add("CtcMax", ctcMax);
                parameters.Add("Currency", currency);
                parameters.Add("Priority", priority);
                parameters.Add("TargetStartDate", targetStartDate);
                parameters.Add("EducationLevel", educationLevel);
                parameters.Add("PrimarySkills", primarySkills);
                parameters.Add("SecondarySkills", secondarySkills);
                parameters.Add("NoticePeriodMaxDays", noticePeriodMaxDays);
                parameters.Add("Industry", industry);
                parameters.Add("JobDescription", jobDescription);
                parameters.Add("Responsibilities", responsibilities);
                parameters.Add("Qualifications", qualifications);
                parameters.Add("Benefits", benefits);
                parameters.Add("HiringManager", hiringManager);
                parameters.Add("HiringManagerId", hiringManagerId);
                parameters.Add("LeadRecruiter", leadRecruiter);
                parameters.Add("LeadRecruiterId", leadRecruiterId);
                parameters.Add("L1ApproverName", l1Approver);
                parameters.Add("L1ApproverId", l1ApproverId);
                parameters.Add("Interviewers", interviewers);
                parameters.Add("IsDraft", isDraft);
                parameters.Add("IsBufferUtilized", isBufferUtilized);
                parameters.Add("BufferHeadsUtilized", bufferHeadsUtilized);
                parameters.Add("SubmittedBy", submittedBy);
                parameters.Add("SubmittedById", submittedById);
                parameters.Add("CompanyId", companyId);
                parameters.Add("fk_companyId", companyId);
                parameters.Add("fk_locid", string.IsNullOrWhiteSpace(fk_locid) ? null : fk_locid);
                parameters.Add("fk_deptid", string.IsNullOrWhiteSpace(fk_deptid) ? null : fk_deptid);
                parameters.Add("fk_subdeptid", string.IsNullOrWhiteSpace(fk_subdeptid) ? null : fk_subdeptid);
                parameters.Add("fk_desgid", string.IsNullOrWhiteSpace(fk_desgid) ? null : fk_desgid);
                parameters.Add("fk_classid", string.IsNullOrWhiteSpace(fk_classid) ? null : fk_classid);
                parameters.Add("fk_catid", string.IsNullOrWhiteSpace(fk_catid) ? null : fk_catid);
                parameters.Add("fk_costcentreid", fk_costcentreid);
                parameters.Add("fk_zoneId", string.IsNullOrWhiteSpace(fk_zoneId) ? null : fk_zoneId);
                parameters.Add("fk_cityid", string.IsNullOrWhiteSpace(fk_cityid) ? null : fk_cityid);
                parameters.Add("BusinessVertical", businessVertical);

                var result = await _repository.SaveJobRequisitionAsync(parameters);

                var reqCode = result?.mrfCode?.ToString();
                if (!isDraft && !string.IsNullOrEmpty(reqCode))
                {
                    try
                    {
                        await _notificationService.SendWorkflowApprovalNotificationToLevelApproversAsync(
                            companyId: companyId ?? "",
                            mrfCode: reqCode,
                            jobTitle: jobTitle ?? "Requisition",
                            targetLevel: 1,
                            specificApproverId: l1ApproverId,
                            senderUserId: submittedById ?? "System"
                        );
                    }
                    catch (Exception notifEx)
                    {
                        Console.WriteLine($"[AtsJobRequisitionController] Error triggering L1 notification: {notifEx.Message}");
                    }
                }

                return Ok(new
                {
                    success = true,
                    requisitionId = reqCode,
                    dbId = result?.reqId,
                    message = result?.Message?.ToString() ?? "Requisition submitted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving requisition", error = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves complete details of a specific job requisition by ID.
        /// </summary>
        [HttpGet("GetJobRequisitionById")]
        public async Task<IActionResult> GetJobRequisitionById([FromQuery] long reqId, [FromQuery] string? companyId = null)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var scopedCompanyId = !string.IsNullOrEmpty(companyId) ? companyId : decryptedCompanyId;

                var requisition = await _repository.GetJobRequisitionByIdAsync(reqId, scopedCompanyId);

                if (requisition == null)
                {
                    return NotFound(new { message = "Job requisition not found." });
                }

                return Ok(requisition);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching job requisition details", error = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing job requisition's editable fields while keeping MRF Code immutable.
        /// </summary>
        [HttpPost("UpdateJobRequisition")]
        public async Task<IActionResult> UpdateJobRequisition([FromBody] JsonElement payload)
        {
            try
            {
                long reqId = GetSafeLong(payload, "reqId") ?? GetSafeLong(payload, "jobId") ?? 0;
                if (reqId <= 0)
                {
                    return BadRequest(new { message = "A valid requisition ID (reqId) is required." });
                }

                string jobTitle = GetSafeString(payload, "jobTitle");
                string serviceType = GetSafeString(payload, "serviceType");
                string designation = GetSafeString(payload, "designation");
                string skillCategory = GetSafeString(payload, "skillCategory");
                int openPositions = GetSafeInt(payload, "openPositions") ?? 1;
                string location = GetSafeString(payload, "location");
                string department = GetSafeString(payload, "department");
                string hiringType = GetSafeString(payload, "hiringType", "New");
                string replacedEmpName = GetSafeString(payload, "replacedEmpName");
                string replacementReason = GetSafeString(payload, "replacementReason");

                bool? isDiversityHiring = null;
                if (payload.TryGetProperty("isDiversityHiring", out var idh) && idh.ValueKind != JsonValueKind.Null && idh.ValueKind != JsonValueKind.Undefined)
                {
                    if (idh.ValueKind == JsonValueKind.True || idh.ValueKind == JsonValueKind.False)
                        isDiversityHiring = idh.GetBoolean();
                    else if (bool.TryParse(idh.GetString(), out var bVal))
                        isDiversityHiring = bVal;
                }
                string diversityCategory = GetSafeString(payload, "diversityCategory");
                
                string workplaceType = GetSafeString(payload, "workplaceType", "On-Site");
                string employmentType = GetSafeString(payload, "employmentType", "Full-Time");
                
                decimal? experienceMin = GetSafeDecimal(payload, "experienceMin");
                decimal? experienceMax = GetSafeDecimal(payload, "experienceMax");
                decimal? ctcMin = GetSafeDecimal(payload, "ctcMin");
                decimal? ctcMax = GetSafeDecimal(payload, "ctcMax");
                
                string currency = GetSafeString(payload, "currency", "INR");
                string priority = GetSafeString(payload, "priority", "Medium");
                string targetStartDate = GetSafeString(payload, "targetStartDate");
                string educationLevel = GetSafeString(payload, "educationLevel");
                string primarySkills = GetSafeString(payload, "primarySkills");
                string secondarySkills = GetSafeString(payload, "secondarySkills");
                int? noticePeriodMaxDays = GetSafeInt(payload, "noticePeriodMaxDays");
                string industry = GetSafeString(payload, "industry", "Logistics & Supply Chain");
                
                string jobDescription = GetSafeString(payload, "jobDescription");
                string responsibilities = GetSafeString(payload, "responsibilities");
                string qualifications = GetSafeString(payload, "qualifications");
                string benefits = GetSafeString(payload, "benefits");

                string fk_locid = GetSafeString(payload, "fk_locid");
                string fk_deptid = GetSafeString(payload, "fk_deptid");
                string fk_subdeptid = GetSafeString(payload, "fk_subdeptid");
                string fk_desgid = GetSafeString(payload, "fk_desgid");
                string fk_classid = GetSafeString(payload, "fk_classid");
                string fk_catid = GetSafeString(payload, "fk_catid");
                long? fk_costcentreid = GetSafeLong(payload, "fk_costcentreid");
                string fk_zoneId = GetSafeString(payload, "fk_zoneId");
                string fk_cityid = GetSafeString(payload, "fk_cityid");
                string businessVertical = GetSafeString(payload, "businessVertical");

                bool isDraft = GetSafeBool(payload, "isDraft");
                bool isBufferUtilized = GetSafeBool(payload, "isBufferUtilized");
                int bufferHeadsUtilized = GetSafeInt(payload, "bufferHeadsUtilized") ?? 0;

                string updatedBy = GetSafeString(payload, "updatedBy") ?? GetSafeString(payload, "submittedBy");
                string updatedById = GetSafeString(payload, "updatedById") ?? GetSafeString(payload, "submittedById");
                string decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                if (!string.IsNullOrWhiteSpace(decryptedUserId))
                {
                    decryptedUserId = decryptedUserId.Replace("GU-", "", StringComparison.OrdinalIgnoreCase).Trim();
                }

                if (string.IsNullOrWhiteSpace(updatedById) || updatedById == "1")
                {
                    if (!string.IsNullOrWhiteSpace(decryptedUserId))
                    {
                        updatedById = decryptedUserId;
                    }
                }

                if (string.IsNullOrWhiteSpace(updatedBy) || updatedBy.Equals("Site HR Admin", StringComparison.OrdinalIgnoreCase) || updatedBy.Equals("Site HR", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        var userRecord = await _repository.ResolveUserNameAsync(updatedById, null);
                        if (userRecord != null && !string.IsNullOrWhiteSpace((string)userRecord.ResolvedName))
                        {
                            updatedBy = (string)userRecord.ResolvedName;
                        }
                    }
                    catch { }
                }

                if (string.IsNullOrWhiteSpace(updatedBy))
                {
                    updatedBy = "HR Administrator";
                }

                string companyId = GetSafeString(payload, "companyId");
                if (string.IsNullOrWhiteSpace(companyId))
                {
                    companyId = GetSafeString(payload, "fk_companyId");
                }
                if (string.IsNullOrWhiteSpace(companyId))
                {
                    companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                }

                var parameters = new DynamicParameters();
                parameters.Add("ReqId", reqId);
                parameters.Add("JobTitle", jobTitle);
                parameters.Add("ServiceType", serviceType);
                parameters.Add("Designation", designation);
                parameters.Add("SkillCategory", skillCategory);
                parameters.Add("OpenPositions", openPositions);
                parameters.Add("Location", location);
                parameters.Add("Department", department);
                parameters.Add("HiringType", hiringType);
                parameters.Add("ReplacedEmpName", replacedEmpName);
                parameters.Add("ReplacementReason", replacementReason);
                parameters.Add("IsDiversityHiring", isDiversityHiring);
                parameters.Add("DiversityCategory", diversityCategory);
                parameters.Add("WorkplaceType", workplaceType);
                parameters.Add("EmploymentType", employmentType);
                parameters.Add("ExperienceMin", experienceMin);
                parameters.Add("ExperienceMax", experienceMax);
                parameters.Add("CtcMin", ctcMin);
                parameters.Add("CtcMax", ctcMax);
                parameters.Add("Currency", currency);
                parameters.Add("Priority", priority);
                parameters.Add("TargetStartDate", targetStartDate);
                parameters.Add("EducationLevel", educationLevel);
                parameters.Add("PrimarySkills", primarySkills);
                parameters.Add("SecondarySkills", secondarySkills);
                parameters.Add("NoticePeriodMaxDays", noticePeriodMaxDays);
                parameters.Add("Industry", industry);
                parameters.Add("JobDescription", jobDescription);
                parameters.Add("Responsibilities", responsibilities);
                parameters.Add("Qualifications", qualifications);
                parameters.Add("Benefits", benefits);
                parameters.Add("IsDraft", isDraft);
                parameters.Add("IsBufferUtilized", isBufferUtilized);
                parameters.Add("BufferHeadsUtilized", bufferHeadsUtilized);
                parameters.Add("UpdatedBy", updatedBy);
                parameters.Add("UpdatedById", updatedById);
                parameters.Add("CompanyId", companyId);
                parameters.Add("fk_companyId", companyId);
                parameters.Add("fk_locid", string.IsNullOrWhiteSpace(fk_locid) ? null : fk_locid);
                parameters.Add("fk_deptid", string.IsNullOrWhiteSpace(fk_deptid) ? null : fk_deptid);
                parameters.Add("fk_subdeptid", string.IsNullOrWhiteSpace(fk_subdeptid) ? null : fk_subdeptid);
                parameters.Add("fk_desgid", string.IsNullOrWhiteSpace(fk_desgid) ? null : fk_desgid);
                parameters.Add("fk_classid", string.IsNullOrWhiteSpace(fk_classid) ? null : fk_classid);
                parameters.Add("fk_catid", string.IsNullOrWhiteSpace(fk_catid) ? null : fk_catid);
                parameters.Add("fk_costcentreid", fk_costcentreid);
                parameters.Add("fk_zoneId", string.IsNullOrWhiteSpace(fk_zoneId) ? null : fk_zoneId);
                parameters.Add("fk_cityid", string.IsNullOrWhiteSpace(fk_cityid) ? null : fk_cityid);
                parameters.Add("BusinessVertical", businessVertical);

                var result = await _repository.UpdateJobRequisitionAsync(parameters);

                var reqCode = result?.mrfCode?.ToString();
                bool isResubmit = false;
                if (result != null)
                {
                    try
                    {
                        var rawResubmit = result.IsResubmit;
                        if (rawResubmit is bool bVal)
                        {
                            isResubmit = bVal;
                        }
                        else if (rawResubmit != null)
                        {
                            string sVal = rawResubmit.ToString();
                            isResubmit = sVal == "1" || string.Equals(sVal, "true", StringComparison.OrdinalIgnoreCase);
                        }
                    }
                    catch
                    {
                        isResubmit = false;
                    }
                }
                if (!isDraft && isResubmit && !string.IsNullOrEmpty(reqCode))
                {
                    try
                    {
                        await _notificationService.SendWorkflowApprovalNotificationToLevelApproversAsync(
                            companyId: companyId ?? "",
                            mrfCode: reqCode,
                            jobTitle: jobTitle ?? "Requisition",
                            targetLevel: 1,
                            specificApproverId: null,
                            senderUserId: updatedById ?? "Site HR"
                        );
                    }
                    catch (Exception notifEx)
                    {
                        Console.WriteLine($"[AtsJobRequisitionController] Error sending resubmit notification: {notifEx.Message}");
                    }
                }

                return Ok(new
                {
                    success = true,
                    requisitionId = reqCode,
                    dbId = result?.reqId,
                    message = result?.Message?.ToString() ?? "Requisition updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating requisition", error = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // APPROVAL WORKFLOW ENDPOINTS (All backed by Repository)
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Returns the approval level (1/2/3) for the logged-in user based on their role.
        /// </summary>
        [HttpGet("GetMyApprovalLevel")]
        public async Task<IActionResult> GetMyApprovalLevel([FromQuery] string userId)
        {
            try
            {
                var info = await _repository.GetMyApprovalLevelAsync(userId, "", null);

                int level = info?.ApprovalLevel ?? 0;
                bool isAdmin = ((int?)(info?.IsAdmin) ?? 0) == 1 || (info?.RoleLabel?.ToString() ?? "").ToUpper().Contains("ADMIN");
                return Ok(new
                {
                    approvalLevel = level,
                    levelLabel = info?.LevelLabel?.ToString(),
                    roleLabel = info?.RoleLabel?.ToString(),
                    hasApprovalRights = level > 0 || isAdmin,
                    isAdmin = isAdmin
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting approval level", error = ex.Message });
            }
        }

        /// <summary>
        /// Returns all requisitions pending action for the given user's approval level.
        /// </summary>
        [HttpGet("GetPendingApprovals")]
        public async Task<IActionResult> GetPendingApprovals([FromQuery] string userId)
        {
            try
            {
                var (requisitions, summary) = await _repository.GetPendingApprovalsAsync(userId, "", null, null);

                return Ok(new
                {
                    approvalLevel = summary?.approvalLevel ?? 0,
                    pendingCount = summary?.pendingCount ?? 0,
                    requisitions = requisitions
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching pending approvals", error = ex.Message });
            }
        }

        /// <summary>
        /// Approve a requisition at L1, L2, or L3. Advances workflow or opens hiring.
        /// </summary>
        [HttpPost("ApproveRequisition")]
        public async Task<IActionResult> ApproveRequisition([FromBody] ApprovalActionDto dto)
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var result = await _repository.ApproveRequisitionAsync(
                    dto.ReqId,
                    dto.ApprovalLevel,
                    dto.ApproverId,
                    dto.ApproverName,
                    dto.ApproverRole,
                    dto.Remarks,
                    companyId);

                if (result == null || (int)result.Success == 0)
                {
                    return BadRequest(new { message = result?.Message?.ToString() ?? "Failed to approve requisition" });
                }

                // Send notification email asynchronously with recipients returned by USP (Page Rights L1, L2, L3)
                _ = SendWorkflowEmailAsync(
                    dto,
                    result.MrfCode?.ToString() ?? dto.ReqId.ToString(),
                    result.JobTitle?.ToString() ?? "Requisition",
                    result.Department?.ToString() ?? "Operations",
                    result.Location?.ToString() ?? "Hub Operations",
                    result.Openings != null ? (int)result.Openings : 1,
                    result.SubmittedBy?.ToString() ?? "Site HR",
                    result.ApproverName?.ToString() ?? dto.ApproverName ?? "Approver",
                    result.Remarks?.ToString() ?? dto.Remarks ?? "Approved",
                    result.NewStatus?.ToString() ?? "Active",
                    result.NextLevelEmails?.ToString() ?? "",
                    result.SiteHrEmail?.ToString() ?? "",
                    isApproval: true,
                    companyId: result.CompanyId?.ToString() ?? companyId);

                // Dispatch in-app notification for approval
                try
                {
                    var mrfCode = result.MrfCode?.ToString() ?? dto.ReqId.ToString();
                    var jobTitle = result.JobTitle?.ToString() ?? "Requisition";
                    var newStatus = result.NewStatus?.ToString() ?? "Active";
                    var submittedByUserId = result.SubmittedById?.ToString() ?? result.SubmittedBy?.ToString() ?? "";
                    var scopedCompanyId = result.CompanyId?.ToString() ?? companyId ?? "";

                    if (newStatus == "Active" && !string.IsNullOrEmpty(submittedByUserId))
                    {
                        await _notificationService.SendWorkflowDecisionNotificationAsync(scopedCompanyId, submittedByUserId, mrfCode, jobTitle, "Approved", dto.ApproverId ?? "Approver");
                    }
                    else if (newStatus == "L2_Pending")
                    {
                        await _notificationService.SendWorkflowApprovalNotificationToLevelApproversAsync(
                            companyId: scopedCompanyId,
                            mrfCode: mrfCode,
                            jobTitle: jobTitle,
                            targetLevel: 2,
                            specificApproverId: null,
                            senderUserId: dto.ApproverId ?? "Approver");
                    }
                    else if (newStatus == "L3_Pending")
                    {
                        await _notificationService.SendWorkflowApprovalNotificationToLevelApproversAsync(
                            companyId: scopedCompanyId,
                            mrfCode: mrfCode,
                            jobTitle: jobTitle,
                            targetLevel: 3,
                            specificApproverId: null,
                            senderUserId: dto.ApproverId ?? "Approver");
                    }
                }
                catch (Exception notifEx)
                {
                    Console.WriteLine($"[AtsJobRequisitionController] In-app notification error: {notifEx.Message}");
                }

                return Ok(new
                {
                    success = true,
                    newStatus = result.NewStatus?.ToString(),
                    message = result.Message?.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error approving requisition", error = ex.Message });
            }
        }

        /// <summary>
        /// Reject a requisition. Resets it to Submitted status — Site HR must resubmit from L1.
        /// </summary>
        [HttpPost("RejectRequisition")]
        public async Task<IActionResult> RejectRequisition([FromBody] ApprovalActionDto dto)
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var result = await _repository.RejectRequisitionAsync(
                    dto.ReqId,
                    dto.ApprovalLevel,
                    dto.ApproverId,
                    dto.ApproverName,
                    dto.ApproverRole,
                    dto.Remarks,
                    companyId);

                if (result == null || (int)result.Success == 0)
                {
                    return BadRequest(new { message = result?.Message?.ToString() ?? "Failed to reject requisition" });
                }

                // Notify Site HR by email asynchronously with template metadata
                _ = SendWorkflowEmailAsync(
                    dto,
                    result.MrfCode?.ToString() ?? dto.ReqId.ToString(),
                    result.JobTitle?.ToString() ?? "Requisition",
                    result.Department?.ToString() ?? "Operations",
                    result.Location?.ToString() ?? "Hub Operations",
                    result.Openings != null ? (int)result.Openings : 1,
                    result.SubmittedBy?.ToString() ?? "Site HR",
                    result.ApproverName?.ToString() ?? dto.ApproverName ?? "Approver",
                    result.Remarks?.ToString() ?? dto.Remarks ?? "Rejected",
                    "Submitted",
                    "",
                    result.SiteHrEmail?.ToString() ?? "",
                    isApproval: false,
                    companyId: result.CompanyId?.ToString() ?? companyId);

                // Dispatch in-app notification for rejection
                try
                {
                    var mrfCode = result.MrfCode?.ToString() ?? dto.ReqId.ToString();
                    var jobTitle = result.JobTitle?.ToString() ?? "Requisition";
                    var submittedByUserId = result.SubmittedById?.ToString() ?? result.SubmittedBy?.ToString() ?? "";

                    if (!string.IsNullOrEmpty(submittedByUserId))
                    {
                        _ = _notificationService.SendWorkflowDecisionNotificationAsync("", submittedByUserId, mrfCode, jobTitle, "Rejected", dto.ApproverId ?? "Approver");
                    }
                }
                catch { }

                return Ok(new
                {
                    success = true,
                    newStatus = result.NewStatus?.ToString() ?? "Rejected",
                    message = result.Message?.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error rejecting requisition", error = ex.Message });
            }
        }

        /// <summary>
        /// Returns the full approval history/timeline and current state for a requisition.
        /// </summary>
        [HttpGet("GetApprovalHistory/{reqId}")]
        public async Task<IActionResult> GetApprovalHistory(string reqId)
        {
            try
            {
                long.TryParse(reqId, out long parsedReqId);
                var (history, currentState) = await _repository.GetApprovalHistoryAsync(parsedReqId, null);

                return Ok(new { history, currentState });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching approval history", error = ex.Message });
            }
        }

        // ─── Private: Email notification helper (Zero DB queries — pure SMTP) ─────
        private async Task SendWorkflowEmailAsync(
            ApprovalActionDto dto,
            string mrfCode,
            string jobTitle,
            string department,
            string location,
            int openings,
            string submittedBy,
            string approverName,
            string remarks,
            string newStatus,
            string nextLevelEmails,
            string siteHrEmail,
            bool isApproval,
            string? companyId = null)
        {
            try
            {
                string toEmail = "";
                string subject = "";
                string templateFileName = "";

                if (!isApproval)
                {
                    toEmail = siteHrEmail;
                    subject = $"[ACTION NEEDED] Requisition {mrfCode} Rejected at L{dto.ApprovalLevel}";
                    templateFileName = "Requisition_Rejected.html";
                }
                else if (newStatus == "Active")
                {
                    toEmail = !string.IsNullOrEmpty(siteHrEmail) ? siteHrEmail : "";
                    subject = $"[HIRING OPEN] Requisition {mrfCode} Fully Approved";
                    templateFileName = "Requisition_Approved.html";
                }
                else if (newStatus == "L2_Pending")
                {
                    toEmail = nextLevelEmails;
                    subject = $"[APPROVAL NEEDED] Requisition {mrfCode} — L2 Action Required";
                    templateFileName = "L2_Approval_Request.html";
                }
                else if (newStatus == "L3_Pending")
                {
                    toEmail = nextLevelEmails;
                    subject = $"[APPROVAL NEEDED] Requisition {mrfCode} — L3 Action Required";
                    templateFileName = "L3_Approval_Request.html";
                }

                if (string.IsNullOrWhiteSpace(toEmail)) return;

                string templatePath = Path.Combine(AppContext.BaseDirectory, "Templates", "Email", templateFileName);
                if (!System.IO.File.Exists(templatePath))
                {
                    templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email", templateFileName);
                }

                string body = "";
                if (System.IO.File.Exists(templatePath))
                {
                    body = await System.IO.File.ReadAllTextAsync(templatePath);
                    body = body.Replace("{{MRF_CODE}}", mrfCode ?? "")
                               .Replace("{{JOB_TITLE}}", jobTitle ?? "")
                               .Replace("{{DEPARTMENT}}", department ?? "Operations")
                               .Replace("{{LOCATION}}", location ?? "Hub Operations")
                               .Replace("{{OPENINGS}}", openings.ToString())
                               .Replace("{{SUBMITTED_BY}}", submittedBy ?? "Site HR")
                               .Replace("{{APPROVER_NAME}}", approverName ?? dto.ApproverName ?? "Approver")
                               .Replace("{{APPROVAL_LEVEL}}", dto.ApprovalLevel.ToString())
                               .Replace("{{ACTION_DATE}}", DateTime.Now.ToString("dd-MMM-yyyy HH:mm"))
                               .Replace("{{REMARKS}}", remarks ?? dto.Remarks ?? "Approved")
                               .Replace("{{PORTAL_URL}}", "http://localhost:4200/#/dash/recruitment/recruitmentdashboard/job-management");
                }
                else
                {
                    body = $@"<div style='font-family: Arial, sans-serif; padding: 20px;'>
                        <h3>CJ DARCL Recruitment Workflow</h3>
                        <p>Requisition <b>{mrfCode} — {jobTitle}</b> status updated to <b>{newStatus}</b> by {approverName}.</p>
                        <p><b>Remarks:</b> {remarks}</p>
                    </div>";
                }

                await _emailService.SendEmailAsync(toEmail, subject, body, companyId);
            }
            catch
            {
                // Email delivery failure is non-fatal to workflow transaction
            }
        }

        /// <summary>
        /// Updates BaseDemand, BufferPercent, BufferHeads, and TargetCapacity for a Location.
        /// </summary>
        [HttpPost("UpdateLocationManpowerBuffer")]
        public async Task<IActionResult> UpdateLocationManpowerBuffer([FromBody] LocationBufferUpdateDto dto)
        {
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? dto.ModifiedBy ?? "Admin";

                var result = await _repository.UpdateLocationManpowerBufferAsync(
                    dto.LocationId,
                    dto.BaseDemand,
                    dto.BufferPercent,
                    decryptedUserId);

                return Ok(new
                {
                    success = true,
                    message = result?.Message?.ToString() ?? "Location manpower and buffer updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating location manpower buffer", error = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves company-specific locations with actual manpower base demand, buffer %,
        /// buffer heads, target capacity, and active employee headcount.
        /// </summary>
        [HttpGet("GetLocationManpowerList")]
        public async Task<IActionResult> GetLocationManpowerList([FromQuery] string? companyId = null)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var scopedCompanyId = !string.IsNullOrEmpty(companyId) ? companyId : decryptedCompanyId;

                var locations = await _repository.GetLocationManpowerListAsync(scopedCompanyId);

                return Ok(new
                {
                    isSuccess = true,
                    data = locations
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error fetching location manpower list", error = ex.Message });
            }
        }

        // =========================================================================
        // PUBLIC LOCATION QR WALK-IN CANDIDATE APPLICATION
        // =========================================================================

        /// <summary>
        /// Public Walk-in QR endpoint: Retrieves Hub details, active open jobs, and mapped vendors
        /// </summary>
        [HttpGet("GetPublicLocationJobsWithVendors")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicLocationJobsWithVendors(
            [FromQuery] string? locationId = null,
            [FromQuery] string? companyId = null)
        {
            try
            {
                var qrHeader = Request.Headers["X-QR-Token"].ToString();

                var (location, jobs, vendors) = await _repository.GetPublicLocationJobsAndVendorsAsync(locationId ?? "", companyId);

                if (location == null)
                {
                    return NotFound(new { isSuccess = false, message = "Location / Hub not found or inactive." });
                }

                return Ok(new
                {
                    isSuccess = true,
                    location = location,
                    openJobs = jobs,
                    activeVendors = vendors,
                    totalOpenings = ((IEnumerable<dynamic>)jobs).Sum(j => (int)(j.Openings ?? 1))
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error loading public location jobs", error = ex.Message });
            }
        }

        /// <summary>
        /// Public / Candidate: Quick Aadhaar check to prevent duplicate walk-ins.
        /// </summary>
        [HttpGet("CheckCandidateAadhaar")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckCandidateAadhaar(
            [FromQuery] string aadhaarNo,
            [FromQuery] string? companyId = null)
        {
            if (string.IsNullOrWhiteSpace(aadhaarNo) || aadhaarNo.Length < 12)
            {
                return BadRequest(new { isSuccess = false, message = "Please enter a valid 12-digit Aadhaar number." });
            }

            try
            {
                var result = await _repository.CheckCandidateAadhaarStatusAsync(aadhaarNo.Trim(), companyId);

                return Ok(result ?? new
                {
                    isEnrolled = false,
                    candidateName = "",
                    mrfCode = "",
                    applicationStatus = ""
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error verifying Aadhaar status", error = ex.Message });
            }
        }

        /// <summary>
        /// Public QR candidate self-registration: Direct registration as walk-in under a location/job.
        /// </summary>
        [HttpPost("SubmitWalkInCandidate")]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitWalkInCandidate([FromBody] JsonElement payload)
        {
            try
            {
                string candidateName = GetSafeString(payload, "candidateName");
                string mobileNumber = GetSafeString(payload, "mobileNumber");
                string aadharNo = GetSafeString(payload, "aadhaarNo");
                string vendorId = GetSafeString(payload, "vendorId", "");
                string vendorName = GetSafeString(payload, "vendorName", "");
                string jobId = GetSafeString(payload, "jobId", "");
                string jobTitle = GetSafeString(payload, "jobTitle", "");
                string locationId = GetSafeString(payload, "locationId", "");
                string companyId = GetSafeString(payload, "companyId", "");

                if (string.IsNullOrEmpty(candidateName) || string.IsNullOrEmpty(mobileNumber))
                {
                    return BadRequest(new { isSuccess = false, message = "Candidate Name and Mobile Number are mandatory." });
                }

                if (!string.IsNullOrEmpty(aadharNo) && aadharNo.Length < 12)
                {
                    return BadRequest(new { isSuccess = false, message = "Aadhaar Number must be 12 digits if provided." });
                }

                var result = await _repository.SubmitWalkInCandidateAsync(
                    candidateName, mobileNumber, aadharNo, vendorId, vendorName, jobId, jobTitle, locationId, companyId);

                int success = ((int?)(result?.Success) ?? 1);
                if (success == 0)
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = result?.Message?.ToString() ?? "Candidate with this phone number or details already exists."
                    });
                }

                return Ok(new
                {
                    isSuccess = true,
                    applicationRef = result?.ApplicationRef?.ToString() ?? "",
                    candidateName = result?.CandidateName?.ToString() ?? candidateName,
                    jobTitle = result?.JobTitle?.ToString() ?? jobTitle,
                    message = result?.Message?.ToString() ?? "Application submitted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error submitting walk-in application", error = ex.Message });
            }
        }

        // ─── Safe Helpers for JsonElement extraction ─────────────────────────────
        private static int? GetSafeInt(JsonElement parent, string propName)
        {
            if (parent.TryGetProperty(propName, out var el))
            {
                if (el.ValueKind == JsonValueKind.Number && el.TryGetInt32(out var val))
                    return val;
                if (el.ValueKind == JsonValueKind.String && int.TryParse(el.GetString(), out var sVal))
                    return sVal;
            }
            return null;
        }

        private static long? GetSafeLong(JsonElement parent, string propName)
        {
            if (parent.TryGetProperty(propName, out var el))
            {
                if (el.ValueKind == JsonValueKind.Number && el.TryGetInt64(out var val))
                    return val;
                if (el.ValueKind == JsonValueKind.String && long.TryParse(el.GetString(), out var sVal))
                    return sVal;
            }
            return null;
        }

        private static decimal? GetSafeDecimal(JsonElement parent, string propName)
        {
            if (parent.TryGetProperty(propName, out var el))
            {
                if (el.ValueKind == JsonValueKind.Number && el.TryGetDecimal(out var val))
                    return val;
                if (el.ValueKind == JsonValueKind.String && decimal.TryParse(el.GetString(), out var sVal))
                    return sVal;
            }
            return null;
        }

        private static bool GetSafeBool(JsonElement parent, string propName, bool defaultValue = false)
        {
            if (parent.TryGetProperty(propName, out var el))
            {
                if (el.ValueKind == JsonValueKind.True) return true;
                if (el.ValueKind == JsonValueKind.False) return false;
                if (el.ValueKind == JsonValueKind.String && bool.TryParse(el.GetString(), out var bVal))
                    return bVal;
            }
            return defaultValue;
        }

        private static string GetSafeString(JsonElement parent, string propName, string defaultValue = "")
        {
            if (parent.TryGetProperty(propName, out var el))
            {
                if (el.ValueKind == JsonValueKind.String)
                    return el.GetString() ?? defaultValue;
                if (el.ValueKind != JsonValueKind.Null && el.ValueKind != JsonValueKind.Undefined)
                    return el.ToString() ?? defaultValue;
            }
            return defaultValue;
        }

        // ─────────────────────────────────────────────────────────────────────
        // PIPELINE STAGE CONFIG — Company-wise enable/disable
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Returns all pipeline stages for a company with IsEnabled flag.
        /// If no config rows exist for the company, returns global defaults.
        /// </summary>
        [HttpGet("GetPipelineStageConfig")]
        public async Task<IActionResult> GetPipelineStageConfig([FromQuery] string? companyId = null)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var scopedCompanyId = !string.IsNullOrEmpty(companyId) ? companyId : decryptedCompanyId;

                if (string.IsNullOrWhiteSpace(scopedCompanyId))
                    return BadRequest(new { message = "CompanyId is required." });

                var stages = await _repository.GetPipelineStageConfigAsync(scopedCompanyId);

                return Ok(stages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching pipeline stage config", error = ex.Message });
            }
        }

        /// <summary>
        /// Inserts or updates a single stage config row for a company.
        /// Used to toggle IsEnabled or rename/reorder a stage.
        /// </summary>
        [HttpPost("UpsertPipelineStageConfig")]
        public async Task<IActionResult> UpsertPipelineStageConfig([FromBody] JsonElement payload)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                string payloadCompanyId = GetSafeString(payload, "companyId");
                string companyId = !string.IsNullOrWhiteSpace(payloadCompanyId)
                    ? payloadCompanyId
                    : (decryptedCompanyId ?? "");

                if (string.IsNullOrWhiteSpace(companyId))
                    return BadRequest(new { message = "CompanyId is required." });

                var result = await _repository.UpsertPipelineStageConfigAsync(
                    companyId,
                    GetSafeString(payload, "stageCode"),
                    GetSafeString(payload, "stageLabel"),
                    GetSafeString(payload, "stageIcon"),
                    GetSafeString(payload, "stageColor"),
                    GetSafeInt(payload, "stageOrder") ?? 1,
                    GetSafeBool(payload, "isEnabled"),
                    GetSafeString(payload, "modifiedBy", "Site HR Admin"));

                return Ok(new { success = true, result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error saving pipeline stage config", error = ex.Message });
            }
        }
    }
}
