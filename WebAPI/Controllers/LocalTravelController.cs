//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;

//namespace HRMSWebAPI.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class LocalTravelController : ControllerBase
//    {
//    }
//}

using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LocalTravelController : ControllerBase
    {
        private readonly ILocalTravelRepository LocalTravelRepository;
        private readonly FileService _FileService;

        public LocalTravelController(ILocalTravelRepository _LocalTravelRepository, FileService fileService)
        {
            LocalTravelRepository = _LocalTravelRepository;
            _FileService = fileService;
        }

        /// <summary>
        /// Create new Local Travel Requisition
        /// POST: api/v1/LocalTravelRequisition
        /// </summary>
        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> CreateAsync([FromForm] LocalTravelMst model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                // Get employee ID from token
                var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();

                // Set employee ID for all master records
                if (model?.LocalTravelRequisitionMst != null && model.LocalTravelRequisitionMst.Any())
                {
                    foreach (var item in model.LocalTravelRequisitionMst)
                    {
                        item.fk_empid = fk_empid;
                    }
                }

                // Handle file uploads for each transaction record
                if (model?.LocalTravelRequisitionDateTransactionTrn != null && model.LocalTravelRequisitionDateTransactionTrn.Any())
                {
                    foreach (var transaction in model.LocalTravelRequisitionDateTransactionTrn)
                    {
                        // Check if file is uploaded for this transaction
                        if (transaction.SavedFile != null && transaction.SavedFile.Length > 0)
                        {
                            // Optional: validate image type
                            if (!_FileService.IsImageFile(transaction.SavedFile))
                            {
                                return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                            }

                            // Save the file using file service
                            var savedFileName = await _FileService.SaveFileAsync(transaction.SavedFile);

                            // Save the returned filename to DB field
                            transaction.filepath = savedFileName;
                        }
                    }
                }

                    bool isInserted = await LocalTravelRepository.CreateAsync(model);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Local Travel Requisition inserted successfully." : "Failed to insert Local Travel Requisition.";
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

        [HttpPost("SubmitLocalTravel")]
        [Authorize]
        public async Task<IActionResult> SubmitLocalTravel()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Get employee ID from token
                var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();

                bool isSubmitted = await LocalTravelRepository.SubmitLocalTravel(fk_empid);

                modelResponse.IsSuccess = isSubmitted;
                modelResponse.Message = isSubmitted
                    ? "Local Travel submitted successfully for approval."
                    : "Failed to submit Local Travel.";
                modelResponse.StatusCode = isSubmitted ? 200 : 400;

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
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> GetAllAsync()
        {
            var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();

            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await LocalTravelRepository.GetAll(fk_empid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
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

        /// <summary>
        /// Get Local Travel Requisition by ID
        /// GET: api/v1/LocalTravelRequisition/{pk_localtravelId}
        /// </summary>
        [HttpGet("{pk_localtravelId}")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> GetById([FromRoute] long pk_localtravelId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                ResponseIdMst result = await LocalTravelRepository.GetByIdAsync(pk_localtravelId);

                if (result == null ||
                    (result.LocalTravelRequisitionMst?.Count == 0 &&
                    // result.LocalTravelRequisitionDateTransaction?.Count == 0 &&
                     result.LocalTravelRequisitionDateTransactionTrn?.Count == 0))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Data = result;
                modelResponse.Message = "Data fetched successfully.";
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

        /// <summary>
        /// Delete Local Travel Requisition (only if not approved)
        /// DELETE: api/v1/LocalTravelRequisition/{pk_localtravelId}
        /// </summary>
        [HttpDelete("{pk_localtravelId}")]
        [Authorize]
        public async Task<IActionResult> DeleteLocalTravelAsync([FromRoute] long pk_localtravelId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Condition for message 
                (bool isSuccess, var message) = await LocalTravelRepository.DeleteAsync(pk_localtravelId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;

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

        /// <summary>
        /// Update Local Travel Requisition
        /// PUT: api/v1/LocalTravelRequisition
        /// </summary>
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateLocalTravelMstAsync( [FromForm] LocalTravelMst model)
        {
            var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();

            // Set employee ID for all master records
            if (model?.LocalTravelRequisitionMst != null && model.LocalTravelRequisitionMst.Any())
            {
                foreach (var item in model.LocalTravelRequisitionMst)
                {
                    item.fk_empid = fk_empid;
                   // item.pk_localtravelId = ; // 🔧 ADD THIS LINE

                }
            }


            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (model?.LocalTravelRequisitionDateTransactionTrn != null && model.LocalTravelRequisitionDateTransactionTrn.Any())
                {
                    foreach (var transaction in model.LocalTravelRequisitionDateTransactionTrn)
                    {
                        // Check if file is uploaded for this transaction
                        if (transaction.SavedFile != null && transaction.SavedFile.Length > 0)
                        {
                            // Optional: validate image type
                            if (!_FileService.IsImageFile(transaction.SavedFile))
                            {
                                return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                            }

                            // Save the file using file service
                            var savedFileName = await _FileService.SaveFileAsync(transaction.SavedFile);

                            // Save the returned filename to DB field
                            transaction.filepath = savedFileName;
                        }
                    }
                }


                bool isUpdated = await LocalTravelRepository.UpdateLocalTravelMstAsync(model);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Local Travel Requisition updated successfully." : "Local Travel update failed.";
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







        [HttpPost("download-pdf/{pk_localtravelId}")]
        [Authorize]
        public async Task<IActionResult> DownloadPDF([FromRoute] long pk_localtravelId)
        {
            try
            {
                // ✅ 1. Fetch travel data
                ResponseIdMst data = await LocalTravelRepository.GetByIdAsync(pk_localtravelId);

                if (data == null ||
                    (data.LocalTravelRequisitionMst?.Count == 0 &&
                     data.LocalTravelRequisitionDateTransactionTrn?.Count == 0))
                {
                    return NotFound(new { message = "No travel data found for this ID" });
                }

                // ✅ 2. Get employee ID from da
                var firstMaster = data.LocalTravelRequisitionMst?.FirstOrDefault();
                string employeeId = firstMaster?.fk_empid ?? "N/A";

                EmployeeDetailsDTO employeeDetails = data.EmployeeDetails;

                if (employeeDetails == null)
                {
                    employeeDetails = new EmployeeDetailsDTO
                    {
                        fk_empid = employeeId,
                        EmployeeName = "Unknown Employee",
                        Department = "N/A",
                        Designation = "N/A"
                    };
                }



                // ✅ 5. Generate PDF with dynamic data
                byte[] pdfBytes = GenerateLocalTravelPDF(
                    data,
                    employeeDetails.EmployeeName ?? "N/A",
                    employeeDetails.Department ?? "N/A",
                    employeeDetails.Designation ?? "N/A"
                );

                // ✅ 6. Return PDF file
                string fileName = $"LocalTravel_{employeeId}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error generating PDF",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        #region PDF Generation Methods
        #region Color Constants & Helpers
        // ✅ Professional Color Palette
        #region Minimal Professional Color Palette (Like Your PDF)
        private static class PdfColors
        {
            // ✅ Very Minimal & Clean Colors

            // Headers - Light Gray (not dark)
            public static readonly BaseColor HeaderBackground = new BaseColor(245, 245, 245);  // Very Light Gray
            public static readonly BaseColor HeaderText = new BaseColor(33, 33, 33);           // Dark Gray Text

            // Table Borders
            public static readonly BaseColor TableBorder = new BaseColor(200, 200, 200);       // Light Gray Border

            // Alternate Rows - Almost Invisible
            public static readonly BaseColor AlternateRow = new BaseColor(252, 252, 252);      // Almost White

            // Section Headers (Day 1, Day 2...) - Very Subtle
            public static readonly BaseColor SectionHeader = new BaseColor(248, 248, 248);     // Super Light Gray

            // Totals - Minimal Highlight
            public static readonly BaseColor TotalHighlight = new BaseColor(250, 250, 250);    // Very Subtle
            public static readonly BaseColor GrandTotalBg = new BaseColor(245, 245, 245);      // Light Gray
            public static readonly BaseColor GrandTotalText = new BaseColor(33, 33, 33);       // Dark Text

            // Line Separator
            public static readonly BaseColor LineSeparator = new BaseColor(220, 220, 220);     // Light Gray Line
            public static readonly BaseColor BorderDark = new BaseColor(200, 200, 200);        // Medium Gray
        }

        private static class PdfFonts
        {
            // All text in dark gray/black - no colored text
            private static readonly BaseColor TextColor = new BaseColor(33, 33, 33);

            public static Font Header => FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, TextColor);
            public static Font Title => FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16, TextColor);
            public static Font SubTitle => FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, TextColor);
            public static Font Normal => FontFactory.GetFont(FontFactory.HELVETICA, 9, TextColor);
            public static Font Small => FontFactory.GetFont(FontFactory.HELVETICA, 8, TextColor);
            public static Font Bold => FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, TextColor);
            public static Font GrandTotalFont => FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, TextColor);
            public static Font LabelBold => FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, TextColor);
        }
        #endregion
        #endregion
        private byte[] GenerateLocalTravelPDF(ResponseIdMst data, string employeeName, string department, string designation)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                Document document = new Document(PageSize.A4, 25, 25, 30, 30);
                PdfWriter.GetInstance(document, ms);
                document.Open();

                AddCompanyHeader(document);
                AddEmployeeAndRequisitionDetails(document, data, employeeName, department, designation);
                AddTravelSummary(document, data);
                AddDateWiseTravelDetails(document, data);
                AddGrandTotal(document, data);
                AddFooter(document);

                document.Close();
                return ms.ToArray();
            }
        }
        private void AddCompanyHeader(Document document)
        {
            // Form Title
            Paragraph title = new Paragraph("LOCAL TRAVEL REQUISITION FORM", PdfFonts.Title);
            title.Alignment = Element.ALIGN_CENTER;
            title.SpacingAfter = 2;
            title.SpacingBefore = 5;
            document.Add(title);

            // Underline below title (centered, 60% width)
            Paragraph underline = new Paragraph(new Chunk(new iTextSharp.text.pdf.draw.LineSeparator(
                1f, 60f, BaseColor.BLACK, Element.ALIGN_CENTER, -1)));
            underline.SpacingAfter = 5;
            document.Add(underline);

            // Generated on - Right aligned
            Paragraph generatedOn = new Paragraph($"Generated on: {DateTime.Now:dd/MM/yyyy hh:mm tt}", PdfFonts.Small);
            generatedOn.Alignment = Element.ALIGN_RIGHT;
            generatedOn.SpacingAfter = 2;
          //  generatedOn.SpacingBefore = 5;
            document.Add(generatedOn);

            document.Add(CreateLineSeparator(PdfColors.LineSeparator));
           // document.Add(new Paragraph(" "));
        }        //private void AddCompanyHeader(Document document)
        //{
        //    PdfPTable headerTable = new PdfPTable(1);
        //    headerTable.WidthPercentage = 100;

        //    PdfPCell companyCell = new PdfPCell(new Phrase("TCCI Manufacturing India Pvt. Ltd.", PdfFonts.Title));
        //    companyCell.HorizontalAlignment = Element.ALIGN_CENTER;
        //    companyCell.Border = Rectangle.NO_BORDER;
        //    companyCell.PaddingBottom = 5;
        //    headerTable.AddCell(companyCell);

        //    PdfPCell addressCell = new PdfPCell(new Phrase(
        //        "Shop No. 307, Sector-4, Pankaj Plaza, Dwarka, NEW DELHI-110078, C-45 Sector-80, Noida, UTTAR PRADESH 201301",
        //        PdfFonts.Small));
        //    addressCell.HorizontalAlignment = Element.ALIGN_CENTER;
        //    addressCell.Border = Rectangle.NO_BORDER;
        //    addressCell.PaddingBottom = 10;
        //    headerTable.AddCell(addressCell);

        //    document.Add(headerTable);
        //    document.Add(CreateLineSeparator(PdfColors.LineSeparator));

        //    // Form Title
        //    Paragraph title = new Paragraph("LOCAL TRAVEL REQUISITION FORM", PdfFonts.Title);
        //    title.Alignment = Element.ALIGN_CENTER;
        //    title.SpacingAfter = 15;
        //    title.SpacingBefore = 10;
        //    document.Add(title);
        //}

        private void AddEmployeeAndRequisitionDetails(Document document, ResponseIdMst data, string employeeName, string department, string designation)
        {
            var firstMaster = data.LocalTravelRequisitionMst?.FirstOrDefault();
            if (firstMaster == null) return;

            // Create main table with 2 columns for Employee Info and Requisition Info
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.WidthPercentage = 100;
            mainTable.SetWidths(new float[] { 50f, 50f });
            mainTable.SpacingBefore = 5;  // ✅ Changed from default to 5

            mainTable.SpacingAfter = 15;

            // Left side - Employee Information
            PdfPTable employeeTable = new PdfPTable(2);
            employeeTable.WidthPercentage = 100;
            employeeTable.SetWidths(new float[] { 40f, 60f });

            // Header for Employee Information
            PdfPCell empHeaderCell = new PdfPCell(new Phrase("Employee Information", PdfFonts.Bold));
            empHeaderCell.Colspan = 2;
            empHeaderCell.BackgroundColor = new BaseColor(41, 57, 103); // Dark blue
            empHeaderCell.HorizontalAlignment = Element.ALIGN_LEFT;
            empHeaderCell.Padding = 5;
            empHeaderCell.Border = Rectangle.NO_BORDER;
            Phrase empHeaderPhrase = new Phrase("Employee Information", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE));
            empHeaderCell.Phrase = empHeaderPhrase;
            employeeTable.AddCell(empHeaderCell);

            // Employee details
            AddDetailRow(employeeTable, "Employee Name:", employeeName);
            AddDetailRow(employeeTable, "Employee Code:", firstMaster.fk_empid ?? "N/A");
            AddDetailRow(employeeTable, "Department:", department);
            AddDetailRow(employeeTable, "Designation:", designation);
            AddDetailRow(employeeTable, "Location:", "N/A"); // Add if available in data
            AddDetailRow(employeeTable, "Contact No:", "N/A"); // Add if available in data

            PdfPCell empCell = new PdfPCell(employeeTable);
            empCell.Border = Rectangle.BOX;
            empCell.BorderColor = PdfColors.TableBorder;
            empCell.BorderWidth = 0.5f;
            empCell.Padding = 0;
            mainTable.AddCell(empCell);

            // Right side - Requisition Information
            PdfPTable requisitionTable = new PdfPTable(2);
            requisitionTable.WidthPercentage = 100;
            requisitionTable.SetWidths(new float[] { 40f, 60f });

            // Header for Requisition Information
            PdfPCell reqHeaderCell = new PdfPCell();
            reqHeaderCell.Colspan = 2;
            reqHeaderCell.BackgroundColor = new BaseColor(41, 57, 103); // Dark blue
            reqHeaderCell.HorizontalAlignment = Element.ALIGN_LEFT;
            reqHeaderCell.Padding = 5;
            reqHeaderCell.Border = Rectangle.NO_BORDER;
            Phrase reqHeaderPhrase = new Phrase("Requisition Information", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE));
            reqHeaderCell.Phrase = reqHeaderPhrase;
            requisitionTable.AddCell(reqHeaderCell);

            // Requisition details
            var totalDays = data.LocalTravelRequisitionMst?.Count ?? 0;
            var grandTotal = data.LocalTravelRequisitionMst?.Sum(m => m.GTotal) ?? 0;

            AddDetailRow(requisitionTable, "Requisition No:", firstMaster.pk_localtravelId?.ToString() ?? "N/A");
            //   AddDetailRow(requisitionTable, "Requisition Date:", DateTime.Now.ToString("dd-MMM-yyyy"));
            AddDetailRow(requisitionTable, "Requisition Date:", DateTime.Now.ToString("dd/MM/yyyy"));  // ✅ FIXED
            AddDetailRow(requisitionTable, "Travel Period:", $"{totalDays} day(s)");
            AddDetailRow(requisitionTable, "Status:", GetStatus(firstMaster.isApproved, firstMaster.isSubmitted));
            AddDetailRow(requisitionTable, "Total Travel Days:", totalDays.ToString());
            AddDetailRow(requisitionTable, "Total Amount:", "₹ " + grandTotal.ToString("N2"));

            PdfPCell reqCell = new PdfPCell(requisitionTable);
            reqCell.Border = Rectangle.BOX;
            reqCell.BorderColor = PdfColors.TableBorder;
            reqCell.BorderWidth = 0.5f;
            reqCell.Padding = 0;
            mainTable.AddCell(reqCell);

            document.Add(mainTable);
        }

        private void AddDetailRow(PdfPTable table, string label, string value)
        {
            PdfPCell labelCell = new PdfPCell(new Phrase(label, PdfFonts.Bold));
            labelCell.Border = Rectangle.NO_BORDER;
            labelCell.Padding = 5;
            labelCell.PaddingLeft = 10;
            table.AddCell(labelCell);

            PdfPCell valueCell = new PdfPCell(new Phrase(value, PdfFonts.Normal));
            valueCell.Border = Rectangle.NO_BORDER;
            valueCell.Padding = 5;
            table.AddCell(valueCell);
        }

        private void AddTravelSummary(Document document, ResponseIdMst data)
        {
            // This section is now integrated into the header, so we can skip it or keep it minimal
            // Keeping it empty as the data is already shown in Requisition Information
        }

        private void AddDateWiseTravelDetails(Document document, ResponseIdMst data)
        {
            Paragraph detailsTitle = new Paragraph("Travel Details", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE));

            PdfPTable titleTable = new PdfPTable(1);
            titleTable.WidthPercentage = 100;
            titleTable.SpacingBefore = 5;
            titleTable.SpacingAfter = 5;

            PdfPCell titleCell = new PdfPCell(new Phrase("Travel Details", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE)));
            titleCell.BackgroundColor = new BaseColor(41, 57, 103); // Dark blue
            titleCell.Padding = 5;
            titleCell.Border = Rectangle.NO_BORDER;
            titleTable.AddCell(titleCell);

            document.Add(titleTable);

            if (data.LocalTravelRequisitionMst == null || !data.LocalTravelRequisitionMst.Any()) return;

            int dayIndex = 1;
            foreach (var master in data.LocalTravelRequisitionMst)
            {
                AddDateSectionHeader(document, master, dayIndex);

                var details = data.LocalTravelRequisitionDateTransactionTrn?
                    .Where(t => t.fk_localtravelId == master.pk_localtravelId)
                    .ToList() ?? new List<LocalTravelRequisitionDateTransactionTrn>();

                AddTravelEntriesTable(document, details);
                AddDateSectionTotal(document, master);
                document.Add(new Paragraph(" "));
                dayIndex++;
            }
        }

        private void AddDateSectionHeader(Document document, LocalTravelRequisitionMst master, int index)
        {
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.WidthPercentage = 100;
            headerTable.SpacingBefore = 5;

            string cityName = master.fk_cityId ?? "N/A";
            // string headerText = $"Day {index} - {master.traveldate?.ToString("dd/MM/yyyy")} | {cityName} | {master.InTime} to {master.OutTime} ({master.TotalHour} hrs)";
            string headerText = $"Day {index} - {master.traveldate} | {cityName} | {master.InTime} to {master.OutTime} ({master.TotalHour} hrs)";


            PdfPCell headerCell = new PdfPCell(new Phrase(headerText, PdfFonts.Bold));
            headerCell.BackgroundColor = new BaseColor(220, 220, 220);  // Light gray
            headerCell.Padding = 5;
            headerCell.HorizontalAlignment = Element.ALIGN_LEFT;
            headerCell.BorderColor = PdfColors.TableBorder;
            headerCell.BorderWidth = 0.5f;
            headerTable.AddCell(headerCell);

            document.Add(headerTable);
        }

        private void AddTravelEntriesTable(Document document, List<LocalTravelRequisitionDateTransactionTrn> details)
        {
            PdfPTable table = new PdfPTable(9);
            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 5f, 12f, 15f, 15f, 15f, 8f, 10f, 10f, 10f });
            table.SpacingBefore = 0;

            // Add headers with dark blue background
            string[] headers = { "S.N", "Mode", "Purpose", "From", "To", "KM", "Amount", "Other Charges", "Total" };
            foreach (var header in headers)
            {
                PdfPCell headerCell = new PdfPCell(new Phrase(header, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE)));
                headerCell.BackgroundColor = new BaseColor(41, 57, 103); // Dark blue
                headerCell.HorizontalAlignment = Element.ALIGN_CENTER;
                headerCell.Padding = 5;
                headerCell.BorderColor = BaseColor.WHITE;
                headerCell.BorderWidth = 0.5f;
                table.AddCell(headerCell);
            }

            // Add data rows
            int srNo = 1;
            bool alternateRow = false;
            foreach (var detail in details)
            {
                AddDataCell(table, srNo.ToString(), alternateRow);
              //  AddDataCell(table, detail.fk_travelmodeId?.ToString() ?? "N/A", alternateRow);
                AddDataCell(table, detail.description ?? "N/A", alternateRow);

                AddDataCell(table, detail.purpose ?? "", alternateRow);
                AddDataCell(table, detail.placefrom ?? "", alternateRow);
                AddDataCell(table, detail.placeto ?? "", alternateRow);
                AddDataCell(table, (detail.kilometere ?? 0).ToString("N2"), alternateRow, Element.ALIGN_RIGHT);
                AddDataCell(table, (detail.amount ?? 0).ToString("N2"), alternateRow, Element.ALIGN_RIGHT);
                AddDataCell(table, (detail.othercharges ?? 0).ToString("N2"), alternateRow, Element.ALIGN_RIGHT);
                AddDataCell(table, (detail.totalamount ?? 0).ToString("N2"), alternateRow, Element.ALIGN_RIGHT);

                srNo++;
                alternateRow = !alternateRow;
            }

            document.Add(table);
        }

        private void AddDateSectionTotal(Document document, LocalTravelRequisitionMst master)
        {
            PdfPTable totalTable = new PdfPTable(3);
            totalTable.WidthPercentage = 100;
            totalTable.SetWidths(new float[] { 70f, 15f, 15f });
            totalTable.SpacingBefore = 2;
            totalTable.SpacingAfter = 5;

            AddTotalRow(totalTable, "Subtotal:", master.subTotal ?? 0, false);
            AddTotalRow(totalTable, "Fixed DA:", master.fixedfda ?? 0, false);
            AddTotalRow(totalTable, "Day Total:", master.GTotal ?? 0, true);

            document.Add(totalTable);
        }

        private void AddGrandTotal(Document document, ResponseIdMst data)
        {
            document.Add(CreateLineSeparator(PdfColors.LineSeparator, 0.5f));

            var grandTotal = data.LocalTravelRequisitionMst?.Sum(m => m.GTotal) ?? 0;

            PdfPTable grandTotalTable = new PdfPTable(2);
            grandTotalTable.WidthPercentage = 60;
            grandTotalTable.HorizontalAlignment = Element.ALIGN_RIGHT;
            grandTotalTable.SpacingBefore = 5;
            grandTotalTable.SpacingAfter = 8;
            grandTotalTable.SetWidths(new float[] { 60f, 40f });

            PdfPCell labelCell = new PdfPCell(new Phrase("GRAND TOTAL:", PdfFonts.LabelBold));
            labelCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            labelCell.Border = Rectangle.NO_BORDER;
            labelCell.Padding = 4;
            labelCell.PaddingRight = 8;
            grandTotalTable.AddCell(labelCell);

            PdfPCell amountCell = new PdfPCell(new Phrase("₹ " + grandTotal.ToString("N2"), PdfFonts.GrandTotalFont));
            amountCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            amountCell.Border = Rectangle.NO_BORDER;
            amountCell.Padding = 4;
            amountCell.PaddingRight = 10;
            amountCell.BackgroundColor = new BaseColor(240, 240, 240);
            grandTotalTable.AddCell(amountCell);

            document.Add(grandTotalTable);
        }

        private void AddFooter(Document document)
        {
            PdfPTable signatureTable = new PdfPTable(3);
            signatureTable.WidthPercentage = 100;
            signatureTable.SetWidths(new float[] { 33f, 34f, 33f });
            signatureTable.SpacingBefore = 30;

            AddSignatureCell(signatureTable, "Employee Signature");
            AddSignatureCell(signatureTable, "Manager Approval");
            AddSignatureCell(signatureTable, "Finance Approval");

            document.Add(signatureTable);

            //Paragraph genInfo = new Paragraph($"Generated on: {DateTime.Now:dd/MM/yyyy hh:mm tt}", PdfFonts.Small);
            //genInfo.Alignment = Element.ALIGN_CENTER;
            //genInfo.SpacingBefore = 20;
            //document.Add(genInfo);
        }

        #region Helper Methods

        private Paragraph CreateLineSeparator(BaseColor color, float lineWidth = 0.5f)
        {
            return new Paragraph(new Chunk(new iTextSharp.text.pdf.draw.LineSeparator(
                lineWidth, 100f, color, Element.ALIGN_CENTER, -1)));
        }

        private void AddTableHeader(PdfPTable table, string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE)));
            cell.BackgroundColor = new BaseColor(41, 57, 103);
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 5;
            cell.BorderColor = BaseColor.WHITE;
            cell.BorderWidth = 0.5f;
            table.AddCell(cell);
        }

        private void AddDataCell(PdfPTable table, string text, bool alternate, int alignment = Element.ALIGN_LEFT)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, PdfFonts.Normal));
            cell.HorizontalAlignment = alignment;
            cell.Padding = 4;
            cell.BorderColor = new BaseColor(200, 200, 200);
            cell.BorderWidth = 0.5f;

            if (alternate) cell.BackgroundColor = new BaseColor(245, 245, 245);

            table.AddCell(cell);
        }

        private PdfPCell CreateLabelCell(string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, PdfFonts.Bold));
            cell.Border = Rectangle.NO_BORDER;
            cell.Padding = 5;
            return cell;
        }

        private PdfPCell CreateValueCell(string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, PdfFonts.Normal));
            cell.Border = Rectangle.NO_BORDER;
            cell.Padding = 5;
            return cell;
        }

        private void AddSummaryRow(PdfPTable table, string label, string value)
        {
            table.AddCell(CreateLabelCell(label));
            table.AddCell(CreateValueCell(value));
        }

        private void AddTotalRow(PdfPTable table, string label, decimal amount, bool isGrandTotal)
        {
            PdfPCell labelCell = new PdfPCell(new Phrase(label, PdfFonts.Bold));
            labelCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            labelCell.Border = isGrandTotal ? Rectangle.TOP_BORDER : Rectangle.NO_BORDER;
            labelCell.Padding = 5;
            table.AddCell(labelCell);

            PdfPCell emptyCell = new PdfPCell(new Phrase(""));
            emptyCell.Border = isGrandTotal ? Rectangle.TOP_BORDER : Rectangle.NO_BORDER;
            table.AddCell(emptyCell);

            PdfPCell amountCell = new PdfPCell(new Phrase("₹ " + amount.ToString("N2"), PdfFonts.Bold));
            amountCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            amountCell.Border = isGrandTotal ? Rectangle.TOP_BORDER : Rectangle.NO_BORDER;
            if (isGrandTotal) amountCell.BackgroundColor = new BaseColor(220, 220, 220);
            amountCell.Padding = 5;
            table.AddCell(amountCell);
        }

        private void AddSignatureCell(PdfPTable table, string label)
        {
            PdfPCell cell = new PdfPCell(new Phrase(label + "\n\n_________________", PdfFonts.Small));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Border = Rectangle.NO_BORDER;
            cell.PaddingTop = 20;
            table.AddCell(cell);
        }

        private string GetStatus(bool? isApproved, bool? isSubmitted)
        {
            if (isApproved == true) return "Approved";
            if (isSubmitted == true) return "Pending Approval";
            return "Draft";
        }

        #endregion
        #endregion

    }
}
