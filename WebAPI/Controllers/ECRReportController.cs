using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Threading.Tasks;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ECRReportController : ControllerBase
    {
        private readonly IECRReportRepository _ecrReportRepository;

        public ECRReportController()
        {
            // Instantiated directly to avoid editing Program.cs Dependency Injection registration
            _ecrReportRepository = new ECRReportRepository();
        }

        [HttpPost("GeneratePdf")]
        [Authorize]
        public async Task<IActionResult> GeneratePdf([FromBody] ReportModelRequest request)
        {
            try
            {
                var (header, details) = await _ecrReportRepository.GetECRReportDataAsync(request);

                using (var ms = new MemoryStream())
                {
                    // Create Landscape PDF Document with tight margins to fit 16 columns
                    var document = new Document(PageSize.A4.Rotate(), 15f, 15f, 25f, 25f);
                    var writer = PdfWriter.GetInstance(document, ms);
                    writer.PageEvent = new PageBorderEvent();
                    document.Open();

                    BaseFont baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                    Font mainTitleFont = new Font(baseFont, 12, Font.BOLD, BaseColor.BLACK);
                    Font sectionFont = new Font(baseFont, 8, Font.BOLD, BaseColor.BLACK);
                    Font metadataFont = new Font(baseFont, 7.5f, Font.NORMAL, BaseColor.BLACK);
                    Font headerFont = new Font(baseFont, 7, Font.BOLD, BaseColor.BLACK);
                    Font dataFont = new Font(baseFont, 7, Font.NORMAL, BaseColor.BLACK);
                    Font totalFont = new Font(baseFont, 7, Font.BOLD, BaseColor.BLACK);

                    // 1. Center Titles
                    var p1 = new Paragraph("EMPLOYEES' PROVIDENT FUND ORGANISATION", mainTitleFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    var p2 = new Paragraph("ELECTRONIC CHALLAN CUM RETURN (ECR)", mainTitleFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    document.Add(p1);
                    document.Add(p2);
                    document.Add(new Paragraph(" ", dataFont)); // spacing

                    // 2. Structured Metadata Header Table
                    if (header.Rows.Count > 0)
                    {
                        var headRow = header.Rows[0];
                        
                        var metaTable = new PdfPTable(4) { WidthPercentage = 100 };
                        metaTable.SetWidths(new float[] { 25f, 25f, 25f, 25f });

                        // Row 1: Name of Establishment
                        metaTable.AddCell(new PdfPCell(new Phrase("Name of Establishment", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Company Name"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f, Colspan = 3 });

                        // Row 2: Establishment Id & LIN
                        metaTable.AddCell(new PdfPCell(new Phrase("Establishment Id", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Establishment ID"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase("LIN", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["LIN"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f });

                        // Row 3: Wage Month & Return Month
                        metaTable.AddCell(new PdfPCell(new Phrase("Wage Month", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Wage Month"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase("Return Month", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Return Month"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f });

                        // Row 4: Contribution Rate (%) & ECR Type
                        metaTable.AddCell(new PdfPCell(new Phrase("Contribution Rate (%)", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Contribution Rate"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase("ECR Type", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["ECR Type"]?.ToString() ?? "ECR", metadataFont)) { Padding = 4, BorderWidth = 0.5f });

                        // Row 5: Uploaded Date Time
                        metaTable.AddCell(new PdfPCell(new Phrase("Uploaded Date Time", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Uploaded Date"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f, Colspan = 3 });

                        // Row 6: Exemption Status
                        metaTable.AddCell(new PdfPCell(new Phrase("Exemption Status", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Exemption Status"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f, Colspan = 3 });

                        // Row 7: Remarks
                        metaTable.AddCell(new PdfPCell(new Phrase("Remarks", metadataFont)) { Padding = 4, BorderWidth = 0.5f });
                        metaTable.AddCell(new PdfPCell(new Phrase(headRow["Remarks"]?.ToString() ?? "", metadataFont)) { Padding = 4, BorderWidth = 0.5f, Colspan = 3 });

                        document.Add(metaTable);
                    }

                    // 3. Section Title "Member Details:-"
                    var secTitle = new Paragraph("Member Details:-", sectionFont);
                    secTitle.SpacingBefore = 8f;
                    secTitle.SpacingAfter = 6f;
                    document.Add(secTitle);

                    // 4. Details Table
                    if (details.Columns.Count > 0)
                    {
                        var table = new PdfPTable(details.Columns.Count) { WidthPercentage = 100 };
                        table.HeaderRows = 2; // Let headers repeat on multi-page PDF

                        // Calculate custom relative widths to make names and locations wider than numbers
                        float[] widths = new float[details.Columns.Count];
                        if (details.Columns.Count == 16)
                        {
                            widths = new float[] { 8f, 8f, 12f, 14f, 7f, 7f, 7f, 7f, 7f, 7f, 7f, 6f, 6f, 7f, 7f, 12f };
                        }
                        else
                        {
                            for (int colIdx = 0; colIdx < details.Columns.Count; colIdx++)
                            {
                                var colName = details.Columns[colIdx].ColumnName;
                                if (colName.Contains("Name as per") || colName.Contains("Location"))
                                {
                                    widths[colIdx] = 12f;
                                }
                                else if (colName.Contains("UAN"))
                                {
                                    widths[colIdx] = 8f;
                                }
                                else
                                {
                                    widths[colIdx] = 6f;
                                }
                            }
                        }
                        table.SetWidths(widths);

                        // --- GENERATE NESTED HEADERS ---
                        var firstRowCells = new List<PdfPCell>();
                        var secondRowCells = new List<PdfPCell>();

                        for (int i = 0; i < details.Columns.Count; )
                        {
                            var column = details.Columns[i];
                            string colName = column.ColumnName;

                            if (colName.Contains("_"))
                            {
                                string parent = colName.Split('_')[0];

                                // Count group colspan size
                                int colSpan = 0;
                                int j = i;
                                while (j < details.Columns.Count && details.Columns[j].ColumnName.StartsWith(parent + "_"))
                                {
                                    colSpan++;
                                    j++;
                                }

                                // 1st Row Group Header cell
                                var parentCell = new PdfPCell(CreateSemiboldPhrase(parent, dataFont, 0.04f))
                                {
                                    Colspan = colSpan,
                                    Rowspan = 1,
                                    HorizontalAlignment = Element.ALIGN_CENTER,
                                    VerticalAlignment = Element.ALIGN_MIDDLE,
                                    BackgroundColor = BaseColor.LIGHT_GRAY,
                                    Padding = 4,
                                    BorderWidth = 0.5f
                                };
                                firstRowCells.Add(parentCell);

                                // 2nd Row Sub-headers cells
                                for (int k = i; k < j; k++)
                                {
                                    string sub = details.Columns[k].ColumnName.Split('_')[1];
                                    var subCell = new PdfPCell(CreateSemiboldPhrase(sub, dataFont, 0.04f))
                                    {
                                        Colspan = 1,
                                        Rowspan = 1,
                                        HorizontalAlignment = Element.ALIGN_CENTER,
                                        VerticalAlignment = Element.ALIGN_MIDDLE,
                                        BackgroundColor = BaseColor.LIGHT_GRAY,
                                        Padding = 4,
                                        BorderWidth = 0.5f
                                    };
                                    secondRowCells.Add(subCell);
                                }

                                i = j; // Advance
                            }
                            else
                            {
                                // Flat Column header (Rowspan = 2)
                                var cell = new PdfPCell(CreateSemiboldPhrase(colName, dataFont, 0.04f))
                                {
                                    Colspan = 1,
                                    Rowspan = 2,
                                    HorizontalAlignment = Element.ALIGN_CENTER,
                                    VerticalAlignment = Element.ALIGN_MIDDLE,
                                    BackgroundColor = BaseColor.LIGHT_GRAY,
                                    Padding = 4,
                                    BorderWidth = 0.5f
                                };
                                firstRowCells.Add(cell);
                                i++;
                            }
                        }

                        // Add header rows to table in correct sequence
                        foreach (var cell in firstRowCells)
                        {
                            table.AddCell(cell);
                        }
                        foreach (var cell in secondRowCells)
                        {
                            table.AddCell(cell);
                        }

                        // --- GENERATE DATA ROWS ---
                        foreach (DataRow row in details.Rows)
                        {
                            for (int colIdx = 0; colIdx < details.Columns.Count; colIdx++)
                            {
                                var col = details.Columns[colIdx];
                                var cellValue = row[col]?.ToString() ?? "";

                                // Formatting values (decimal with commas, '-' for 0 or empty PMRPY codes)
                                if (colIdx >= 4 && colIdx <= 14) // Wages, contributions, NCP, Refunds
                                {
                                    if (decimal.TryParse(cellValue, out decimal numericVal))
                                    {
                                        if (numericVal == 0 && (col.ColumnName.Contains("PMRPY") || col.ColumnName.Contains("PMPRPY")))
                                        {
                                            cellValue = "-";
                                        }
                                        else
                                        {
                                            cellValue = numericVal.ToString("#,##0");
                                        }
                                    }
                                }

                                var dataCell = new PdfPCell(new Phrase(cellValue, dataFont))
                                {
                                    Padding = 4,
                                    VerticalAlignment = Element.ALIGN_MIDDLE,
                                    BorderWidth = 0.5f
                                };

                                // Alignment
                                if (colIdx >= 4 && colIdx <= 14) // Numerical columns
                                {
                                    dataCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                                }
                                else if (colIdx == 0 || colIdx == 1) // Sl No & UAN
                                {
                                    dataCell.HorizontalAlignment = Element.ALIGN_CENTER;
                                }
                                else // Names and location
                                {
                                    dataCell.HorizontalAlignment = Element.ALIGN_LEFT;
                                }

                                table.AddCell(dataCell);
                            }
                        }

                        // --- GENERATE GRAND TOTAL ROW ---
                        for (int colIdx = 0; colIdx < details.Columns.Count; colIdx++)
                        {
                            var col = details.Columns[colIdx];

                            if (colIdx == 0)
                            {
                                var cell = new PdfPCell(new Phrase("Grand Total", totalFont)) 
                                { 
                                    Padding = 4, 
                                    BorderWidth = 0.5f, 
                                    HorizontalAlignment = Element.ALIGN_LEFT,
                                    VerticalAlignment = Element.ALIGN_MIDDLE
                                };
                                table.AddCell(cell);
                            }
                            else if (colIdx == 1)
                            {
                                var cell = new PdfPCell(new Phrase(details.Rows.Count.ToString(), totalFont)) 
                                { 
                                    Padding = 4, 
                                    BorderWidth = 0.5f, 
                                    HorizontalAlignment = Element.ALIGN_CENTER,
                                    VerticalAlignment = Element.ALIGN_MIDDLE
                                };
                                table.AddCell(cell);
                            }
                            else if (colIdx == 2 || colIdx == 3 || colIdx == 15)
                            {
                                var cell = new PdfPCell(new Phrase("", dataFont)) 
                                { 
                                    Padding = 4, 
                                    BorderWidth = 0.5f,
                                    VerticalAlignment = Element.ALIGN_MIDDLE
                                };
                                table.AddCell(cell);
                            }
                            else
                            {
                                decimal sum = 0;
                                bool isNumeric = false;
                                foreach (DataRow row in details.Rows)
                                {
                                    var valStr = row[col]?.ToString();
                                    if (decimal.TryParse(valStr, out decimal val))
                                    {
                                        sum += val;
                                        isNumeric = true;
                                    }
                                }

                                string totalText = isNumeric ? sum.ToString("#,##0") : "0";
                                var cell = new PdfPCell(new Phrase(totalText, totalFont)) 
                                { 
                                    Padding = 4, 
                                    BorderWidth = 0.5f, 
                                    HorizontalAlignment = Element.ALIGN_RIGHT,
                                    VerticalAlignment = Element.ALIGN_MIDDLE
                                };
                                table.AddCell(cell);
                            }
                        }

                        document.Add(table);
                    }

                    document.Close();
                    return File(ms.ToArray(), "application/pdf", "ECR_Report.pdf");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private Phrase CreateSemiboldPhrase(string text, Font baseFont, float strokeWidth = 0.04f)
        {
            var chunk = new Chunk(text, baseFont);
            chunk.SetTextRenderMode(PdfContentByte.TEXT_RENDER_MODE_FILL_STROKE, strokeWidth, BaseColor.BLACK);
            return new Phrase(chunk);
        }

        private class PageBorderEvent : PdfPageEventHelper
        {
            public override void OnEndPage(PdfWriter writer, Document document)
            {
                PdfContentByte cb = writer.DirectContent;
                cb.SetColorStroke(BaseColor.BLACK);
                cb.SetLineWidth(1f);
                float margin = 10f;


                cb.Rectangle(
                    document.PageSize.Left + margin,
                    document.PageSize.Bottom + margin,
                    document.PageSize.Width - (margin * 2),
                    document.PageSize.Height - (margin * 2)
                );
                cb.Stroke();
            }
        }
    }
}