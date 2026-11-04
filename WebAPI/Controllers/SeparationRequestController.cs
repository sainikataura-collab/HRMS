using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.draw;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SeparationRequestController : ControllerBase
    {
        private readonly ISeparationRequestRepository separationRequestRepository;

        public SeparationRequestController(
            ISeparationRequestRepository _separationRequestRepository)
        {
            separationRequestRepository = _separationRequestRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Insert(
            [FromBody] SeparationRequestMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId =
                    HttpContext.Items["DecryptedUserId"]?.ToString();

                var decryptedFinId =
                    HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                model.fk_empid = decryptedUserId;
                model.fk_finid = decryptedFinId;

                //bool result =
                //    await separationRequestRepository
                //    .InsertSeparationRequest(model);

                //response.IsSuccess = result;
                //response.Message = result
                //    ? "Separation Request Created Successfully."
                //    : "Failed To Create Separation Request.";
                var result =
    await separationRequestRepository
        .InsertSeparationRequest(model);

                response.IsSuccess = result.IsSuccess;
                response.Message = result.Message;
                response.StatusCode = result.IsSuccess ? 200 : 400;

             

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(
            int pageIndex = 0,
            int pageSize = 10)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var (totalCount, result) =
                    await separationRequestRepository.GetAll(decryptedUserId, pageIndex, pageSize);

                response.IsSuccess = true;
                response.Data = result;
                response.TotalCount = totalCount;
                response.Message = "Records Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(long id)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var result =
                    await separationRequestRepository.GetById(id);

                if (result == null)
                {
                    response.IsSuccess = false;
                    response.Message = "Invalid Id";
                    response.StatusCode = 400;

                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Data = result;
                response.Message = "Record Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Update(
            [FromBody] SeparationRequestMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var decryptedUserId =
                    HttpContext.Items["DecryptedUserId"]?.ToString();

                var decryptedFinId =
                    HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                model.fk_empid = decryptedUserId;
                model.fk_finid = decryptedFinId;

                bool result =
                    await separationRequestRepository
                    .UpdateSeparationRequest(model);

                response.IsSuccess = result;
                response.Message = result
                    ? "Separation Request Updated Successfully."
                    : "Failed To Update Separation Request.";

                response.StatusCode = result ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(long id)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                bool result =
                    await separationRequestRepository
                    .DeleteSeparationRequest(id);

                response.IsSuccess = result;
                response.Message = result
                    ? "Separation Request Deleted Successfully."
                    : "Failed To Delete Separation Request.";

                response.StatusCode = result ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }


        [HttpGet("notice-period")]
        [Authorize]
        public async Task<IActionResult> GetNoticePeriod()
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var empId =
                    HttpContext.Items["DecryptedUserId"]?.ToString();

                int noticePeriod =
                    await separationRequestRepository
                        .GetNoticePeriod(empId);

                response.IsSuccess = true;
                response.Data = noticePeriod;
                response.Message = "Notice Period Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpPut("approval")]
        [Authorize]
        public async Task<IActionResult> ApproveResignation(
    [FromBody] SeparationRequestMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var hodId =
                    HttpContext.Items["DecryptedUserId"]?.ToString();

                model.ApprovedBy = hodId;

                var result =
                    await separationRequestRepository
                        .ApproveResignation(model);

                response.IsSuccess = result.IsSuccess;
                response.Message = result.Message;
                response.StatusCode =
                    result.IsSuccess ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }


        [HttpGet("approval-list")]
        [Authorize]
        public async Task<IActionResult> GetApprovalList()
        {
            ModelResponse response =
                new ModelResponse();

            try
            {
                var hodId =
                    HttpContext.Items["DecryptedUserId"]
                    ?.ToString();

                var (totalCount, result) =
                    await separationRequestRepository   
                        .GetApprovalList(hodId);

                response.IsSuccess = true;
                response.Data = result;
                response.TotalCount = totalCount;
                response.Message =
                    "Records Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }


        [HttpGet("download-pdf/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadPdf(long id)
        {
            try
            {
                var report =
                    await separationRequestRepository
                        .GetReport(id);

                if (report == null)
                {
                    return NotFound("Record not found.");
                }

                using (MemoryStream ms = new MemoryStream())
                {
                    Document document =
                        new Document(PageSize.A4, 20, 20, 20, 20);

                    PdfWriter.GetInstance(document, ms);

                    document.Open();

                    // PDF Content
                    // Fonts
                    Font titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
                    Font sectionFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
                    Font labelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
                    Font valueFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);

                    // =========================
                    // Report Title
                    // =========================

                    Paragraph title = new Paragraph("RESIGNATION REPORT", titleFont);
                    title.Alignment = Element.ALIGN_CENTER;
                    title.SpacingAfter = 15f;

                    document.Add(title);

                    // =========================
                    // Employee Details Header
                    // =========================

                    PdfPTable employeeHeader = new PdfPTable(1);
                    employeeHeader.WidthPercentage = 100;

                    PdfPCell employeeCell = new PdfPCell(
                        new Phrase("EMPLOYEE DETAILS", sectionFont));

                    employeeCell.BackgroundColor = new BaseColor(41, 128, 185);
                    employeeCell.HorizontalAlignment = Element.ALIGN_LEFT;
                    employeeCell.Padding = 8;
                    employeeCell.Border = Rectangle.NO_BORDER;

                    employeeHeader.AddCell(employeeCell);

                    document.Add(employeeHeader);

                    document.Add(new Paragraph(" "));

                    PdfPTable employeeTable = new PdfPTable(2);

                    employeeTable.WidthPercentage = 100;
                    employeeTable.SetWidths(new float[] { 35, 65 });

                    employeeTable.AddCell(new Phrase("Employee Code", labelFont));
                    employeeTable.AddCell(new Phrase(report.EmployeeCode ?? "", valueFont));

                    employeeTable.AddCell(new Phrase("Employee Name", labelFont));
                    employeeTable.AddCell(new Phrase(report.EmployeeName ?? "", valueFont));

                    employeeTable.AddCell(new Phrase("Department", labelFont));
                    employeeTable.AddCell(new Phrase(report.Department ?? "", valueFont));

                    employeeTable.AddCell(new Phrase("Designation", labelFont));
                    employeeTable.AddCell(new Phrase(report.Designation ?? "", valueFont));

                    employeeTable.AddCell(new Phrase("Reporting HOD", labelFont));
                    employeeTable.AddCell(new Phrase(report.ReportingHOD ?? "", valueFont));

                    employeeTable.AddCell(new Phrase("Date Of Joining", labelFont));
                    employeeTable.AddCell(new Phrase(
                        report.DateOfJoining?.ToString("dd-MM-yyyy") ?? "",
                        valueFont));

                    document.Add(employeeTable);

                    document.Add(new Paragraph(" "));

                    // =========================
                    // Resignation Details Header
                    // =========================

                    PdfPTable resignationHeader = new PdfPTable(1);
                    resignationHeader.WidthPercentage = 100;

                    PdfPCell resignationCell = new PdfPCell(
                        new Phrase("RESIGNATION DETAILS", sectionFont));

                    resignationCell.BackgroundColor = new BaseColor(41, 128, 185);
                    resignationCell.HorizontalAlignment = Element.ALIGN_LEFT;
                    resignationCell.Padding = 8;
                    resignationCell.Border = Rectangle.NO_BORDER;

                    resignationHeader.AddCell(resignationCell);

                    document.Add(resignationHeader);

                    document.Add(new Paragraph(" "));

                    // =========================
                    // Resignation Details Table
                    // =========================

                    PdfPTable resignationTable = new PdfPTable(2);

                    resignationTable.WidthPercentage = 100;
                    resignationTable.SetWidths(new float[] { 35, 65 });

                    resignationTable.AddCell(new Phrase("Resignation Date", labelFont));
                    resignationTable.AddCell(new Phrase(
                        report.resignationDate.ToString("dd-MM-yyyy") ?? "",
                        valueFont));

                    resignationTable.AddCell(new Phrase("Expected Last Working Day", labelFont));
                    resignationTable.AddCell(new Phrase(
                        report.expectedLWD.ToString("dd-MM-yyyy") ?? "",
                        valueFont));

                    resignationTable.AddCell(new Phrase("Notice Period", labelFont));
                    resignationTable.AddCell(new Phrase(
                        report.noticePeriod.ToString(),
                        valueFont));

                    resignationTable.AddCell(new Phrase("Notice Served", labelFont));
                    resignationTable.AddCell(new Phrase(
                        report.NoticeServed ?? "",
                        valueFont));

                    resignationTable.AddCell(new Phrase("Reason", labelFont));
                    resignationTable.AddCell(new Phrase(
                        report.reason ?? "",
                        valueFont));

                    resignationTable.AddCell(new Phrase("Employee Remarks", labelFont));
                    resignationTable.AddCell(new Phrase(
                        report.remarks ?? "",
                        valueFont));

                    document.Add(resignationTable);

                    document.Add(new Paragraph(" "));

                    // =========================
                    // HOD Approval Details Header
                    // =========================

                    PdfPTable approvalHeader = new PdfPTable(1);
                    approvalHeader.WidthPercentage = 100;

                    PdfPCell approvalCell = new PdfPCell(
                        new Phrase("HOD APPROVAL DETAILS", sectionFont));

                    approvalCell.BackgroundColor = new BaseColor(41, 128, 185);
                    approvalCell.HorizontalAlignment = Element.ALIGN_LEFT;
                    approvalCell.Padding = 8;
                    approvalCell.Border = Rectangle.NO_BORDER;

                    approvalHeader.AddCell(approvalCell);

                    document.Add(approvalHeader);

                    document.Add(new Paragraph(" "));

                    // =========================
                    // HOD Approval Details Table
                    // =========================

                    PdfPTable approvalTable = new PdfPTable(2);

                    approvalTable.WidthPercentage = 100;
                    approvalTable.SetWidths(new float[] { 35, 65 });

                    approvalTable.AddCell(new Phrase("Approval Status", labelFont));
                    approvalTable.AddCell(new Phrase(
                        report.ApprovalStatus ?? "",
                        valueFont));

                    approvalTable.AddCell(new Phrase("Approved By", labelFont));
                    approvalTable.AddCell(new Phrase(
                        report.ApprovedBy ?? "",
                        valueFont));

                    approvalTable.AddCell(new Phrase("Approval Date", labelFont));
                    approvalTable.AddCell(new Phrase(
                        report.ApprovedDate?.ToString("dd-MM-yyyy") ?? "",
                        valueFont));

                    approvalTable.AddCell(new Phrase("Approval Remarks", labelFont));
                    approvalTable.AddCell(new Phrase(
                        report.ApprovalRemarks ?? "",
                        valueFont));

                    document.Add(approvalTable);

                    document.Add(new Paragraph(" "));

                    // =========================
                    // Footer Line
                    // =========================

                    LineSeparator line = new LineSeparator();
                    line.LineWidth = 1f;
                    line.Percentage = 100;

                    document.Add(new Chunk(line));
                    document.Add(new Paragraph(" "));

                    // =========================
                    // Generated On
                    // =========================

                    Paragraph generatedOn = new Paragraph(
                        "Generated On : " + DateTime.Now.ToString("dd-MM-yyyy hh:mm tt"),
                        valueFont);

                    generatedOn.Alignment = Element.ALIGN_RIGHT;

                    document.Add(generatedOn);

                    document.Add(new Paragraph(" "));

                    // =========================
                    // Confidential Footer
                    // =========================

                    Paragraph footer = new Paragraph(
                        "This is a system generated report.",
                        FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 9, BaseColor.GRAY));

                    footer.Alignment = Element.ALIGN_CENTER;

                    document.Add(footer);

                    document.Close();

                    return File(
                        ms.ToArray(),
                        "application/pdf",
                        $"Resignation_Report_{id}.pdf");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("withdraw")]
        [Authorize]
        public async Task<IActionResult> WithdrawResignation(
    [FromBody] SeparationRequestMst model)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                // Logged in Employee Id
                var empId =
                    HttpContext.Items["DecryptedUserId"]?.ToString();

                model.fk_empid = empId;

                var result =
                    await separationRequestRepository
                        .WithdrawResignation(model);

                response.IsSuccess = result.IsSuccess;
                response.Message = result.Message;
                response.StatusCode =
                    result.IsSuccess ? 200 : 400;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }


        [HttpGet("admin-list")]
        [Authorize]
        public async Task<IActionResult> GetAdminList(int pageIndex = 1, int pageSize = 5, string searchTerm = null)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var (totalCount, result) =
                    await separationRequestRepository
                        .GetAdminList(pageIndex, pageSize, searchTerm);

                response.IsSuccess = true;
                response.Data = result;
                response.TotalCount = totalCount;
                response.Message = "Records Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpGet("admin-report-list")]
        [Authorize]
        public async Task<IActionResult> GetAdminReportList(int pageIndex = 1, int pageSize = 5, string searchTerm = null)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var (totalCount, result) =
                    await separationRequestRepository
                        .GetAdminReportList(pageIndex, pageSize, searchTerm);

                response.IsSuccess = true;
                response.Data = result;
                response.TotalCount = totalCount;
                response.Message = "Records Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpGet("admin-exitreport-list")]
        [Authorize]
        public async Task<IActionResult> GetAdminExitReportList(int pageIndex = 1, int pageSize = 5, string searchTerm = null)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var (totalCount, result) =
                    await separationRequestRepository
                        .GetAdminExitReportList(pageIndex, pageSize, searchTerm);

                response.IsSuccess = true;
                response.Data = result;
                response.TotalCount = totalCount;
                response.Message = "Records Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpGet("letter-data/{id}")]
        [Authorize]
        public async Task<IActionResult> GetLetterData(long id)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var result =
                    await separationRequestRepository.GetLetterData(id);

                if (result == null)
                {
                    response.IsSuccess = false;
                    response.Message = "Record not found.";
                    response.StatusCode = 404;

                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Data = result;
                response.Message = "Record Retrieved Successfully.";
                response.StatusCode = 200;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;

                return Ok(response);
            }
        }

        [HttpGet("ExperienceLetter/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadExperienceLetter(long id)
        {
            try
            {
                var pdf = await separationRequestRepository.DownloadExperienceLetter(id);

                if (pdf == null || pdf.Length == 0)
                    return NotFound("Record not found.");

                return File(
                    pdf,
                    "application/pdf",
                    $"Experience_Letter_{id}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("RelievingLetter/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadRelievingLetter(long id)
        {
            try
            {
                var pdf = await separationRequestRepository
                    .DownloadRelievingLetter(id);

                if (pdf == null || pdf.Length == 0)
                {
                    return NotFound("Record not found.");
                }

                return File(
                    pdf,
                    "application/pdf",
                    $"Relieving_Letter_{id}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("dashboard-count")]
        [Authorize]
        public async Task<IActionResult> GetDashboardCount()
        {
            var result = await separationRequestRepository.GetDashboardCount();

            return Ok(new
            {
                isSuccess = result.IsSuccess,
                message = result.Message,
                data = result.Data
            });
        }



    }
}