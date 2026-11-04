using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ExitInterviewController : ControllerBase
    {
        private readonly IExitInterviewRepository _exitInterviewRepository;

        public ExitInterviewController(IExitInterviewRepository exitInterviewRepository)
        {
            _exitInterviewRepository = exitInterviewRepository;
        }

        private bool CheckIsAdmin(string? empId)
        {
            var role = HttpContext.Items["DecryptedUserRole"]?.ToString();
            var loginType = HttpContext.Items["DecryptedLoginType"]?.ToString();

            return role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
                || loginType?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
                || empId == "GU-1";
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertExitInterviewAsync([FromBody] ExitInterviewMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var locId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var finId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                model.fk_empid = empId;
                model.fk_finid = finId;
                model.fk_insUserID = empId;
                model.fk_insDateID = locId;
                model.active = true;

                bool isInserted = await _exitInterviewRepository.InsertExitInterviewAsync(model);

                response.IsSuccess = isInserted;
                response.Message = isInserted
                    ? "Exit Interview submitted successfully."
                    : "Failed to submit Exit Interview.";
                response.StatusCode = isInserted ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllExitInterviews(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                var (totalCount, result) =
                    await _exitInterviewRepository.GetAllExitInterviewsAsync(
                        pageIndex,
                        pageSize,
                        decryptedUserId);

                response.IsSuccess = true;
                response.Message = result.Any()
                    ? "Exit Interview list fetched successfully."
                    : "No Record found.";
                response.Data = result;
                response.TotalCount = totalCount;
                response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpGet("{exitInterviewId}")]
        [Authorize]
        public async Task<IActionResult> GetExitInterviewByIdAsync([FromRoute] long exitInterviewId)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                var result =
                    await _exitInterviewRepository.GetExitInterviewByIdAsync(
                        exitInterviewId,
                        decryptedUserId);

                if (result == null)
                {
                    response.IsSuccess = false;
                    response.Message = "Exit Interview not found.";
                    response.StatusCode = 404;
                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Message = "Exit Interview retrieved successfully.";
                response.Data = result;
                response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateExitInterviewAsync([FromBody] ExitInterviewMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var locId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var finId = HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                model.fk_empid = empId;
                model.fk_finid = finId;
                model.fk_updUserID = empId;
                model.fk_updDateID = locId;
                model.active = true;

                bool isUpdated =
                    await _exitInterviewRepository.UpdateExitInterviewAsync(model);

                response.IsSuccess = isUpdated;
                response.Message = isUpdated
                    ? "Exit Interview updated successfully."
                    : "Failed to update Exit Interview.";
                response.StatusCode = isUpdated ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpDelete("{exitInterviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteExitInterviewAsync([FromRoute] long exitInterviewId)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                bool isDeleted =
                    await _exitInterviewRepository.DeleteExitInterviewAsync(exitInterviewId);

                response.IsSuccess = isDeleted;
                response.Message = isDeleted
                    ? "Exit Interview deleted successfully."
                    : "Failed to delete Exit Interview.";
                response.StatusCode = isDeleted ? 200 : 400;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpGet("AdminHodList")]
        [Authorize]
        public async Task<IActionResult> GetAdminHodExitInterviews(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();
                bool isAdmin = CheckIsAdmin(empId);

                var (totalCount, result) =
                    await _exitInterviewRepository.GetAdminHodExitInterviewsAsync(
                        empId,
                        isAdmin,
                        pageIndex,
                        pageSize);

                response.IsSuccess = true;
                response.Message = result.Any()
                    ? "Admin/HOD Exit Interview list fetched successfully."
                    : "No Record found.";
                response.Data = result;
                response.TotalCount = totalCount;
                response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [HttpGet("AdminHodView/{empId}")]
        [Authorize]
        public async Task<IActionResult> GetAdminHodExitInterviewByEmpId([FromRoute] string empId)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var loginEmpId = HttpContext.Items["DecryptedUserId"]?.ToString();
                bool isAdmin = CheckIsAdmin(loginEmpId);

                var result =
                    await _exitInterviewRepository.GetAdminHodExitInterviewByEmpIdAsync(
                        empId,
                        loginEmpId,
                        isAdmin);

                if (result == null)
                {
                    response.IsSuccess = false;
                    response.Message = "Exit Interview not found or access denied.";
                    response.StatusCode = 404;
                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Message = "Exit Interview retrieved successfully.";
                response.Data = result;
                response.StatusCode = 200;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
            }

            return Ok(response);
        }

        [Authorize]
        [HttpGet("ReportPdf/{exitInterviewId}")]
        public async Task<IActionResult> PrintExitInterviewPdf([FromRoute] long exitInterviewId)
        {
            try
            {
                var report = await _exitInterviewRepository.GetExitInterviewReportAsync(exitInterviewId);

                if (report == null)
                    return NotFound("No data found.");

                var titleFont = FontFactory.GetFont("Verdana", 14, iTextSharp.text.Font.BOLD);
                var headerFont = FontFactory.GetFont("Verdana", 11, iTextSharp.text.Font.BOLD);
                var bodyFont = FontFactory.GetFont("Verdana", 9, iTextSharp.text.Font.NORMAL);
                var bodyFontBold = FontFactory.GetFont("Verdana", 9, iTextSharp.text.Font.BOLD);

                var pdfDoc = new iTextSharp.text.Document(iTextSharp.text.PageSize.A4, 20, 20, 20, 20);
                var pdfData = new MemoryStream();

                PdfWriter.GetInstance(pdfDoc, pdfData);
                pdfDoc.Open();

                var title = new Paragraph("Exit Interview Report", titleFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 12f
                };
                pdfDoc.Add(title);

                var empTable = new PdfPTable(4) { WidthPercentage = 100 };
                empTable.SetWidths(new float[] { 20f, 30f, 20f, 30f });

                AddInfoCell(empTable, "Employee Code", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.empcode ?? "-", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Employee Name", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.empname ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(empTable, "Department", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.department ?? "-", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Status", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.status ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(empTable, "Resignation Date", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, FormatPdfDate(report.resignationDate), bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Expected LWD", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, FormatPdfDate(report.expectedLastWorkingDate), bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(empTable, "Notice Period", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable,report.noticePeriod.HasValue? $"{Convert.ToInt32(report.noticePeriod)} Days": "-",bodyFont,Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Notice Served", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.noticePeriodServed == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                pdfDoc.Add(empTable);

                pdfDoc.Add(new Paragraph(" ", bodyFont));

                var reasonHeading = new PdfPTable(1) { WidthPercentage = 100 };
                reasonHeading.AddCell(new PdfPCell(new Phrase("Reason for Leaving", headerFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 6f
                });
                pdfDoc.Add(reasonHeading);

                var reasonTable = new PdfPTable(4) { WidthPercentage = 100 };
                reasonTable.SetWidths(new float[] { 35f, 15f, 35f, 15f });

                AddInfoCell(reasonTable, "Better Career Opportunity", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_betterCareer == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, "Higher Salary", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_higherSalary == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(reasonTable, "Relocation", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_relocation == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, "Personal", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_personal == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(reasonTable, "Health", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_health == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, "Education", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_education == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(reasonTable, "Work Environment", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_workEnv == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, "Managerial Issues", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_managerial == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(reasonTable, "Job Dissatisfaction", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_jobDissatisfaction == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, "Work Life Balance", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_workLife == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(reasonTable, "Company Policies", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_companyPolicies == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, "Retirement", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_retirement == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(reasonTable, "Other", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_other == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, "Other Text", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(reasonTable, report.r_otherText ?? "-", bodyFont, Element.ALIGN_LEFT);

                pdfDoc.Add(reasonTable);

                pdfDoc.Add(new Paragraph(" ", bodyFont));

                var feedbackHeading = new PdfPTable(1) { WidthPercentage = 100 };
                feedbackHeading.AddCell(new PdfPCell(new Phrase("Feedback", headerFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 6f
                });
                pdfDoc.Add(feedbackHeading);

                var feedbackTable = new PdfPTable(3) { WidthPercentage = 100 };
                feedbackTable.SetWidths(new float[] { 45f, 20f, 35f });

                AddInfoCell(feedbackTable, "Question", bodyFontBold, Element.ALIGN_CENTER);
                AddInfoCell(feedbackTable, "Rating", bodyFontBold, Element.ALIGN_CENTER);
                AddInfoCell(feedbackTable, "Comments", bodyFontBold, Element.ALIGN_CENTER);

                AddFeedbackRow(feedbackTable, "Job Role Satisfaction", report.q1_jobRole, report.q1_comments, bodyFont);
                AddFeedbackRow(feedbackTable, "Manager Support", report.q2_manager, report.q2_comments, bodyFont);
                AddFeedbackRow(feedbackTable, "Work Environment", report.q3_workEnv, report.q3_comments, bodyFont);
                AddFeedbackRow(feedbackTable, "Salary & Benefits", report.q4_salary, report.q4_comments, bodyFont);
                AddFeedbackRow(feedbackTable, "Company Policies", report.q5_policies, report.q5_comments, bodyFont);
                AddFeedbackRow(feedbackTable, "Training & Growth", report.q6_training, report.q6_comments, bodyFont);
                AddFeedbackRow(feedbackTable, "Team Issues", report.q7_teamIssues, report.q7_comments, bodyFont);

                pdfDoc.Add(feedbackTable);

                pdfDoc.Add(new Paragraph(" ", bodyFont));

                var additionalTable = new PdfPTable(2) { WidthPercentage = 100 };
                additionalTable.SetWidths(new float[] { 30f, 70f });

                AddInfoCell(additionalTable, "What did you like most?", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(additionalTable, report.q8_liked ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(additionalTable, "Suggested Improvements", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(additionalTable, report.q9_improvements ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(additionalTable, "Recommend Company?", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(additionalTable, report.q10_recommend ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(additionalTable, "Reason", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(additionalTable, report.q10_reason ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(additionalTable, "Submitted On", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(additionalTable, FormatPdfDate(report.insDate), bodyFont, Element.ALIGN_LEFT);

                pdfDoc.Add(additionalTable);

                pdfDoc.Close();

                var fileBytes = pdfData.ToArray();

                return File(
                    fileBytes,
                    "application/pdf",
                    $"ExitInterview_{exitInterviewId}.pdf"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        private static void AddInfoCell(PdfPTable table, string text, Font font, int alignment)
        {
            var cell = new PdfPCell(new Phrase(string.IsNullOrWhiteSpace(text) ? "-" : text, font))
            {
                Padding = 6f,
                HorizontalAlignment = alignment,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };

            table.AddCell(cell);
        }

        private static void AddFeedbackRow(PdfPTable table, string question, string? rating, string? comments, Font font)
        {
            AddInfoCell(table, question, font, Element.ALIGN_LEFT);
            AddInfoCell(table, rating ?? "-", font, Element.ALIGN_LEFT);
            AddInfoCell(table, comments ?? "-", font, Element.ALIGN_LEFT);
        }

        private static string FormatPdfDate(object? dateValue)
        {
            if (dateValue == null)
                return "-";

            if (DateTime.TryParse(dateValue.ToString(), out DateTime date))
                return date.ToString("dd-MMM-yyyy");

            return "-";
        }
    }
}