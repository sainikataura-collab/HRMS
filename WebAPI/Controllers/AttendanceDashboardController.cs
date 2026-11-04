using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceDashboardController : ControllerBase
    {
        private readonly IAttendanceDashboardRepository _repository;
        private readonly AppSettings _appSettings;

        public AttendanceDashboardController(
            IAttendanceDashboardRepository repository,
            IOptions<AppSettings> appSettings)
        {
            _repository = repository;
            _appSettings = appSettings.Value;
        }

        [HttpPost("GetKPIs")]
        public async Task<IActionResult> GetKPIs([FromBody] AttendanceDashboardFilterRequest request)
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var data = await _repository.GetKPIsAndTrendsAsync(request, companyId, userId);
                return Ok(new
                {
                    IsSuccess = true,
                    Message = "Attendance Dashboard KPIs retrieved successfully.",
                    Data = data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = (object?)null
                });
            }
        }

        [HttpPost("GetEmployeeGrid")]
        public async Task<IActionResult> GetEmployeeGrid([FromBody] AttendanceDashboardFilterRequest request)
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var data = await _repository.GetEmployeeGridAsync(request, companyId, userId);
                return Ok(new
                {
                    IsSuccess = true,
                    Message = "Employee Attendance Grid retrieved successfully.",
                    Data = data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = (object?)null
                });
            }
        }

        [HttpPost("ExportToExcel")]
        public async Task<IActionResult> ExportToExcel([FromBody] AttendanceDashboardFilterRequest request)
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                string uploadFolder = _appSettings.UploadsFolderPath ?? "";

                var fileBytes = await _repository.ExportToExcelWithImagesAsync(request, companyId, userId, uploadFolder);
                string fileName = $"Attendance_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet("GetEmployeeOccurrences")]
        public async Task<IActionResult> GetEmployeeOccurrences(
            [FromQuery] string? empCode, 
            [FromQuery] string? empId, 
            [FromQuery] int monthId, 
            [FromQuery] int yearId, 
            [FromQuery] string? statusFilter)
        {
            try
            {
                string effectiveEmpId = !string.IsNullOrWhiteSpace(empId) ? empId : (HttpContext.Items["DecryptedUserId"]?.ToString() ?? "");
                var data = await _repository.GetEmployeeOccurrencesAsync(empCode ?? "", effectiveEmpId, monthId, yearId, statusFilter ?? "");
                return Ok(new
                {
                    IsSuccess = true,
                    Message = "Employee monthly occurrences retrieved successfully.",
                    Data = data
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = (object?)null
                });
            }
        }

        [HttpGet("images/{imageName}")]
        [HttpGet("GetImage")]
        public IActionResult GetImage(string? imageName, [FromQuery] string? filePath = null)
        {
            try
            {
                string target = !string.IsNullOrWhiteSpace(imageName) ? imageName : (filePath ?? "");
                if (string.IsNullOrWhiteSpace(target))
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File path is required.", StatusCode = 404 });
                }

                string uploadsFolder = _appSettings.UploadsFolderPath ?? "";
                if (string.IsNullOrWhiteSpace(uploadsFolder) || !Directory.Exists(uploadsFolder))
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Uploads directory not found.", StatusCode = 404 });
                }

                // Extract filename
                string fileName = Path.GetFileName(target);
                string targetPath = Path.Combine(uploadsFolder, fileName);

                if (!System.IO.File.Exists(targetPath))
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Image not found.", StatusCode = 404 });
                }

                var provider = new FileExtensionContentTypeProvider();
                if (!provider.TryGetContentType(targetPath, out string? contentType))
                {
                    contentType = "image/png";
                }

                return PhysicalFile(targetPath, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpPost("ExportEmployeeOccurrencesPdf")]
        public async Task<IActionResult> ExportEmployeeOccurrencesPdf([FromBody] AttendanceOccurrencePdfRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest("Invalid request parameters.");
                }

                List<EmployeeOccurrenceItem> list = request.Items ?? new List<EmployeeOccurrenceItem>();

                if (list.Count == 0)
                {
                    string effectiveEmpId = !string.IsNullOrWhiteSpace(request.EmpId) 
                        ? request.EmpId 
                        : (HttpContext.Items["DecryptedUserId"]?.ToString() ?? "");

                    list = await _repository.GetEmployeeOccurrencesAsync(
                        request.EmpCode ?? "", 
                        effectiveEmpId, 
                        request.MonthId, 
                        request.YearId, 
                        request.StatusFilter ?? ""
                    );
                }

                if (list == null || list.Count == 0)
                {
                    return BadRequest("No occurrence records found to export.");
                }

                string empName = !string.IsNullOrWhiteSpace(request.EmpName) ? request.EmpName : (list[0].Empname ?? "Employee");
                string empCode = !string.IsNullOrWhiteSpace(request.EmpCode) ? request.EmpCode : (list[0].Empcode ?? "-");
                string dept = !string.IsNullOrWhiteSpace(request.Department) ? request.Department : (list[0].Department ?? "-");
                string filterLabel = !string.IsNullOrWhiteSpace(request.StatusFilter) ? request.StatusFilter : "All Occurrences";
                string period = !string.IsNullOrWhiteSpace(request.MonthName) 
                    ? $"{request.MonthName} {request.YearId}".ToUpper() 
                    : $"MONTH {request.MonthId} {request.YearId}".ToUpper();

                // Compute counts
                int presentCount = 0;
                int lateCount = 0;
                int missedCount = 0;

                foreach (var occ in list)
                {
                    var desc = (occ.DayDescription ?? "").ToLower();
                    var status = (occ.DayStatus ?? "").ToLower();
                    var late = occ.LateComing ?? "";
                    var inT = occ.Intime ?? "";
                    var outT = occ.Outtime ?? "";

                    if (desc.Contains("missed") || string.IsNullOrWhiteSpace(outT) || outT == "0" || outT == "00:00:00")
                    {
                        missedCount++;
                    }
                    if (desc.Contains("present") || status == "p" || status == "present" || (!string.IsNullOrWhiteSpace(inT) && inT != "0"))
                    {
                        presentCount++;
                    }
                    if (desc.Contains("late") || status.Contains("late") || (!string.IsNullOrWhiteSpace(late) && late != "0" && late != "0:00"))
                    {
                        lateCount++;
                    }
                }

                // Fonts
                var titleFont = FontFactory.GetFont("Arial", 12, iTextSharp.text.Font.BOLD, BaseColor.BLACK);
                var subtitleFont = FontFactory.GetFont("Arial", 8.5f, iTextSharp.text.Font.NORMAL, new BaseColor(70, 70, 70));
                var metaBoldFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.BOLD, BaseColor.BLACK);
                var metaBlueFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.NORMAL, new BaseColor(30, 64, 175));
                var bannerFont = FontFactory.GetFont("Arial", 8.5f, iTextSharp.text.Font.BOLD, new BaseColor(30, 64, 175));
                var infoBoldFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.BOLD, BaseColor.BLACK);
                var infoNormalFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.NORMAL, BaseColor.BLACK);
                var thFont = FontFactory.GetFont("Arial", 7.5f, iTextSharp.text.Font.BOLD, BaseColor.BLACK);
                var tdFont = FontFactory.GetFont("Arial", 7.5f, iTextSharp.text.Font.NORMAL, BaseColor.BLACK);
                var tdBoldFont = FontFactory.GetFont("Arial", 7.5f, iTextSharp.text.Font.BOLD, BaseColor.BLACK);

                // Document Setup (A4 Portrait, 18f margins)
                var pdfDoc = new Document(PageSize.A4, 18, 18, 18, 26);
                var pdfData = new MemoryStream();
                var writer = PdfWriter.GetInstance(pdfDoc, pdfData);
                writer.PageEvent = new OccurrencePdfPageEvent();
                pdfDoc.Open();

                // 1. Header Table (3 columns: 25%, 50%, 25%)
                var headerTable = new PdfPTable(3) { WidthPercentage = 100 };
                headerTable.SetWidths(new float[] { 25f, 50f, 25f });

                // Left: Logo or text
                var logoCell = new PdfPCell { Border = iTextSharp.text.Rectangle.NO_BORDER, VerticalAlignment = Element.ALIGN_MIDDLE };
                string logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "Image", "Logo", "empower.jpg");
                if (System.IO.File.Exists(logoPath))
                {
                    try
                    {
                        var logoImg = iTextSharp.text.Image.GetInstance(logoPath);
                        logoImg.ScaleToFit(65f, 32f);
                        logoCell.AddElement(logoImg);
                    }
                    catch
                    {
                        logoCell.AddElement(new Phrase("EMPOWER", titleFont));
                    }
                }
                else
                {
                    logoCell.AddElement(new Phrase("EMPOWER", titleFont));
                }
                headerTable.AddCell(logoCell);

                // Center: Company Name & Report Subtitle
                var titleCell = new PdfPCell
                {
                    Border = iTextSharp.text.Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                };
                var pTitle = new Paragraph("EMPOWER LOGICS", titleFont) { Alignment = Element.ALIGN_CENTER };
                var pSub = new Paragraph("Employee Attendance & Occurrence Report", subtitleFont) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 2f };
                titleCell.AddElement(pTitle);
                titleCell.AddElement(pSub);
                headerTable.AddCell(titleCell);

                // Right: Metadata (Date only, in black)
                var metaCell = new PdfPCell
                {
                    Border = iTextSharp.text.Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                };
                var metaNormalFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.NORMAL, BaseColor.BLACK);
                var pDate = new Paragraph { Alignment = Element.ALIGN_RIGHT };
                pDate.Add(new Chunk("Date : ", metaBoldFont));
                pDate.Add(new Chunk(DateTime.Now.ToString("dd MMM yyyy"), metaNormalFont));

                metaCell.AddElement(pDate);
                headerTable.AddCell(metaCell);

                pdfDoc.Add(headerTable);
                pdfDoc.Add(new Paragraph(" ", FontFactory.GetFont("Arial", 4)));

                // 2. Section Title Banner
                var bannerTable = new PdfPTable(1) { WidthPercentage = 100 };
                var bannerCell = new PdfPCell(new Phrase("ATTENDANCE OCCURRENCE DETAILS", bannerFont))
                {
                    BackgroundColor = new BaseColor(243, 244, 246),
                    Padding = 5f,
                    Border = iTextSharp.text.Rectangle.BOX,
                    BorderColor = BaseColor.BLACK,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_LEFT
                };
                bannerTable.AddCell(bannerCell);
                pdfDoc.Add(bannerTable);

                // 3. Employee Info 4-Column Grid
                var infoTable = new PdfPTable(4) { WidthPercentage = 100 };
                infoTable.SetWidths(new float[] { 20f, 30f, 20f, 30f });

                AddGridCell(infoTable, "Employee Name :", infoBoldFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, empName, infoNormalFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, "Employee Code :", infoBoldFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, empCode, infoNormalFont, Element.ALIGN_LEFT);

                AddGridCell(infoTable, "Department :", infoBoldFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, dept, infoNormalFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, "Audit Period :", infoBoldFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, period, infoNormalFont, Element.ALIGN_LEFT);

                AddGridCell(infoTable, "Filter Scope :", infoBoldFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, $"{filterLabel} ({list.Count} logs)", infoNormalFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, "Summary Counts :", infoBoldFont, Element.ALIGN_LEFT);
                AddGridCell(infoTable, $"P: {presentCount} | Late: {lateCount} | Missed: {missedCount}", infoNormalFont, Element.ALIGN_LEFT);

                pdfDoc.Add(infoTable);
                pdfDoc.Add(new Paragraph(" ", FontFactory.GetFont("Arial", 3)));

                // 4. Occurrence Records Data Table
                var dataTable = new PdfPTable(9) { WidthPercentage = 100, HeaderRows = 1 };
                dataTable.SetWidths(new float[] { 5f, 13f, 12f, 22f, 9f, 9f, 9f, 9f, 12f });

                string[] headers = { "#", "DATE", "DAY", "STATUS / DESCRIPTION", "IN TIME", "OUT TIME", "LATE BY", "WORK HR", "VERIFICATION" };
                foreach (var h in headers)
                {
                    var thCell = new PdfPCell(new Phrase(h, thFont))
                    {
                        BackgroundColor = new BaseColor(240, 242, 245),
                        Padding = 4f,
                        HorizontalAlignment = (h == "STATUS / DESCRIPTION") ? Element.ALIGN_LEFT : Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Border = iTextSharp.text.Rectangle.BOX,
                        BorderColor = BaseColor.BLACK,
                        BorderWidth = 0.4f
                    };
                    dataTable.AddCell(thCell);
                }

                int index = 1;
                foreach (var item in list)
                {
                    string dateStr = !string.IsNullOrWhiteSpace(item.FormattedDate) ? item.FormattedDate : (item.DateIso ?? "-");
                    string weekday = !string.IsNullOrWhiteSpace(item.Weekday) ? item.Weekday : "-";
                    string statusDesc = !string.IsNullOrWhiteSpace(item.DayDescription) ? item.DayDescription : (item.DayStatus ?? "-");

                    string inT = item.Intime ?? "";
                    string inTime = (string.IsNullOrWhiteSpace(inT) || inT == "0" || inT == "00:00:00" || inT == "00:00") ? "-" : inT;

                    string outT = item.Outtime ?? "";
                    string outTime = (string.IsNullOrWhiteSpace(outT) || outT == "0" || outT == "00:00:00" || outT == "00:00") ? "-" : outT;

                    string late = item.LateComing ?? "";
                    string lateBy = (!string.IsNullOrWhiteSpace(late) && late != "0" && late != "0:00" && late != "00:00") ? late : "-";

                    string work = item.Workhour ?? "";
                    string workHour = (!string.IsNullOrWhiteSpace(work) && work != "0" && work != "00:00" && work != "00:00:00") ? work : "-";

                    string src = item.PunchSource ?? "System";
                    string source = (src == "Mobile") ? "Mobile App" : src;

                    // Row cells
                    AddDataCell(dataTable, index.ToString(), tdFont, Element.ALIGN_CENTER);
                    AddDataCell(dataTable, dateStr, tdBoldFont, Element.ALIGN_CENTER);
                    AddDataCell(dataTable, weekday, tdFont, Element.ALIGN_CENTER);

                    // Contextual status color
                    var statusColor = BaseColor.BLACK;
                    var sLower = statusDesc.ToLower();
                    if (sLower.Contains("missed")) statusColor = new BaseColor(220, 38, 38);
                    else if (sLower.Contains("late")) statusColor = new BaseColor(217, 119, 6);
                    else if (sLower.Contains("half")) statusColor = new BaseColor(124, 58, 237);
                    else if (sLower.Contains("leave")) statusColor = new BaseColor(2, 132, 199);
                    else if (sLower.Contains("present")) statusColor = new BaseColor(22, 163, 74);

                    var statusCellFont = FontFactory.GetFont("Arial", 7.5f, iTextSharp.text.Font.BOLD, statusColor);
                    AddDataCell(dataTable, statusDesc, statusCellFont, Element.ALIGN_LEFT);

                    AddDataCell(dataTable, inTime, tdFont, Element.ALIGN_CENTER);
                    AddDataCell(dataTable, outTime, tdFont, Element.ALIGN_CENTER);
                    AddDataCell(dataTable, lateBy, tdFont, Element.ALIGN_CENTER);
                    AddDataCell(dataTable, workHour, tdFont, Element.ALIGN_CENTER);
                    AddDataCell(dataTable, source, tdFont, Element.ALIGN_CENTER);

                    index++;
                }

                pdfDoc.Add(dataTable);
                pdfDoc.Close();

                string safeEmp = (empCode ?? "Emp").Replace(" ", "_");
                string fileName = $"Attendance_Report_{safeEmp}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                return File(pdfData.ToArray(), "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        private static void AddGridCell(PdfPTable table, string text, Font font, int alignment)
        {
            table.AddCell(new PdfPCell(new Phrase(text, font))
            {
                HorizontalAlignment = alignment,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 4.5f,
                Border = iTextSharp.text.Rectangle.BOX,
                BorderColor = BaseColor.BLACK,
                BorderWidth = 0.4f
            });
        }

        private static void AddDataCell(PdfPTable table, string text, Font font, int alignment)
        {
            table.AddCell(new PdfPCell(new Phrase(text, font))
            {
                HorizontalAlignment = alignment,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 3.5f,
                Border = iTextSharp.text.Rectangle.BOX,
                BorderColor = BaseColor.BLACK,
                BorderWidth = 0.35f
            });
        }

        private class OccurrencePdfPageEvent : PdfPageEventHelper
        {
            public override void OnEndPage(PdfWriter writer, Document document)
            {
                PdfContentByte cb = writer.DirectContent;
                cb.SetColorStroke(BaseColor.BLACK);
                cb.SetLineWidth(0.8f);
                float margin = 12f;

                // Outer border
                cb.Rectangle(
                    document.PageSize.Left + margin,
                    document.PageSize.Bottom + margin,
                    document.PageSize.Width - (margin * 2),
                    document.PageSize.Height - (margin * 2)
                );
                cb.Stroke();

                // Footer divider
                float footerY = document.PageSize.Bottom + margin + 14f;
                cb.MoveTo(document.PageSize.Left + margin, footerY);
                cb.LineTo(document.PageSize.Right - margin, footerY);
                cb.Stroke();

                // Footer note
                var footerFont = FontFactory.GetFont("Arial", 7, iTextSharp.text.Font.ITALIC, new BaseColor(90, 90, 90));
                ColumnText.ShowTextAligned(
                    cb,
                    Element.ALIGN_LEFT,
                    new Phrase("Note: This is a computer generated report and does not require a physical signature.", footerFont),
                    document.PageSize.Left + margin + 4f,
                    document.PageSize.Bottom + margin + 4f,
                    0
                );

                // Page number
                var pageFont = FontFactory.GetFont("Arial", 7, iTextSharp.text.Font.BOLD, BaseColor.BLACK);
                ColumnText.ShowTextAligned(
                    cb,
                    Element.ALIGN_RIGHT,
                    new Phrase($"Page {writer.PageNumber}", pageFont),
                    document.PageSize.Right - margin - 4f,
                    document.PageSize.Bottom + margin + 4f,
                    0
                );
            }
        }
    }
}
