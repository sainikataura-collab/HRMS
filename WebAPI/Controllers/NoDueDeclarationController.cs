using HRBook_WebAPI.Models;
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
    public class NoDueDeclarationController : ControllerBase
    {
        private readonly INoDueDeclarationRepository noDueDeclarationRepository;

        public NoDueDeclarationController(INoDueDeclarationRepository _noDueDeclarationRepository)
        {
            noDueDeclarationRepository = _noDueDeclarationRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertNoDueDeclarationAsync([FromBody] NoDueDeclarationMst noDueDeclarationMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                noDueDeclarationMst.fk_empid = decryptedUserId;

                bool isInserted = await noDueDeclarationRepository.InsertNoDueDeclarationAsync(noDueDeclarationMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted
                    ? "No Due Declaration submitted successfully."
                    : "Failed to submit No Due Declaration.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                var (totalCount, result) = await noDueDeclarationRepository.GetAll(
                    pageIndex,
                    pageSize,
                    decryptedUserId
                );

                modelResponse.IsSuccess = true;
                modelResponse.Message = result.Any()
                    ? "No Due Declaration list retrieved successfully."
                    : "No Record found.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

        [HttpGet("{pk_noDueDeclarationId}")]
        [Authorize]
        public async Task<IActionResult> GetNoDueDeclarationByIdAsync([FromRoute] int pk_noDueDeclarationId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                NoDueDeclarationMst result =
                    await noDueDeclarationRepository.GetNoDueDeclarationByIdAsync(pk_noDueDeclarationId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid NoDueDeclarationId";
                    modelResponse.StatusCode = 400;

                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "No Due Declaration detail retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

        [HttpGet("GetEmpDetails")]
        [Authorize]
        public async Task<IActionResult> GetEmpDetailsAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                NoDueDeclarationMst result =
                    await noDueDeclarationRepository.GetEmpDetailsAsync(decryptedUserId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee details not found or resignation is not approved.";
                    modelResponse.StatusCode = 400;

                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee details retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateNoDueDeclarationAsync([FromBody] NoDueDeclarationMst noDueDeclarationMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                noDueDeclarationMst.fk_empid = decryptedUserId;

                bool isUpdated =
                    await noDueDeclarationRepository.UpdateNoDueDeclarationAsync(noDueDeclarationMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "No Due Declaration updated successfully."
                    : "Failed to update No Due Declaration.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

        [HttpDelete("{pk_noDueDeclarationId}")]
        [Authorize]
        public async Task<IActionResult> DeleteNoDueDeclarationAsync([FromRoute] int pk_noDueDeclarationId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted =
                    await noDueDeclarationRepository.DeleteNoDueDeclarationAsync(pk_noDueDeclarationId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted
                    ? "No Due Declaration deleted successfully."
                    : "Failed to delete No Due Declaration.";
                modelResponse.StatusCode = isDeleted ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

        [Authorize]
        [HttpGet("ReportPdf/{pk_noDueDeclarationId}")]
        public async Task<IActionResult> PrintNoDueDeclarationPdf([FromRoute] int pk_noDueDeclarationId)
        {
            try
            {
                var report = await noDueDeclarationRepository.GetNoDueDeclarationReportAsync(pk_noDueDeclarationId);

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

                var title = new Paragraph("No Due Declaration Report", titleFont)
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
                AddInfoCell(empTable, "HOD Name", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.hodName ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(empTable, "Resignation Date", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, FormatPdfDate(report.resignationDate), bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Notice Period", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.noticePeriod.HasValue ? $"{Convert.ToInt32(report.noticePeriod)} Days" : "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(empTable, "Notice Served", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.noticePeriodServed == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Status", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.status ?? "-", bodyFont, Element.ALIGN_LEFT);

                pdfDoc.Add(empTable);

                pdfDoc.Add(new Paragraph(" ", bodyFont));

                var declarationHeading = new PdfPTable(1) { WidthPercentage = 100 };
                declarationHeading.AddCell(new PdfPCell(new Phrase("Declaration Details", headerFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 6f
                });
                pdfDoc.Add(declarationHeading);

                var declarationTable = new PdfPTable(4) { WidthPercentage = 100 };
                declarationTable.SetWidths(new float[] { 35f, 15f, 35f, 15f });

                AddInfoCell(declarationTable, "No Salary Advance", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, report.noSalaryAdvance == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, "No Loan", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, report.noLoan == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(declarationTable, "No Reimbursement", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, report.noReimbursement == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, "No Company Property", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, report.noCompanyProperty == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(declarationTable, "Agree Declaration", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, report.agreeDeclaration == true ? "Yes" : "No", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, "Declaration Date", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(declarationTable, FormatPdfDate(report.declarationDate), bodyFont, Element.ALIGN_LEFT);

                pdfDoc.Add(declarationTable);

                pdfDoc.Add(new Paragraph(" ", bodyFont));

                var additionalTable = new PdfPTable(2) { WidthPercentage = 100 };
                additionalTable.SetWidths(new float[] { 30f, 70f });

                AddInfoCell(additionalTable, "Submitted On", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(additionalTable, FormatPdfDate(report.insDate), bodyFont, Element.ALIGN_LEFT);

                pdfDoc.Add(additionalTable);

                pdfDoc.Close();

                var fileBytes = pdfData.ToArray();

                Response.Headers["Content-Disposition"] = $"inline; filename=NoDueDeclaration_{pk_noDueDeclarationId}.pdf";

                return File(
                    fileBytes,
                    "application/pdf"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("AdminHodList")]
        [Authorize]
        public async Task<IActionResult> GetAdminHodNoDueDeclarations(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrWhiteSpace(empId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User not found.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                bool isAdmin = CheckIsAdmin(empId);

                var (totalCount, result) =
                    await noDueDeclarationRepository.GetAdminHodNoDueDeclarationsAsync(
                        empId,
                        isAdmin,
                        pageIndex,
                        pageSize
                    );

                modelResponse.IsSuccess = true;
                modelResponse.Message = result.Any()
                    ? "Admin/HOD No Due Declaration list fetched successfully."
                    : "No Record found.";
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }


        private static void AddInfoCell(PdfPTable table, string text, iTextSharp.text.Font font, int alignment)
        {
            var cell = new PdfPCell(new Phrase(string.IsNullOrWhiteSpace(text) ? "-" : text, font))
            {
                Padding = 6f,
                HorizontalAlignment = alignment,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };

            table.AddCell(cell);
        }

        private static string FormatPdfDate(object? dateValue)
        {
            if (dateValue == null)
                return "-";

            if (DateTime.TryParse(dateValue.ToString(), out DateTime date))
                return date.ToString("dd-MMM-yyyy");

            return "-";
        }

        private bool CheckIsAdmin(string? empId)
        {
            var role = HttpContext.Items["DecryptedUserRole"]?.ToString();
            var loginType = HttpContext.Items["DecryptedLoginType"]?.ToString();

            return role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
                || loginType?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
                || empId == "GU-1";
        }
        [HttpGet("AdminHodView/{pk_noDueDeclarationId}")]
        [Authorize]
        public async Task<IActionResult> GetAdminHodNoDueDeclarationById(int pk_noDueDeclarationId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrWhiteSpace(empId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User not found.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                bool isAdmin = CheckIsAdmin(empId);

                var result = await noDueDeclarationRepository.GetAdminHodNoDueDeclarationByIdAsync(
                    pk_noDueDeclarationId,
                    empId,
                    isAdmin
                );

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Due Declaration not found or access denied.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "No Due Declaration fetched successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }
    }
}