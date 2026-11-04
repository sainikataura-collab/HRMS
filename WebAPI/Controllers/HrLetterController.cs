using Dapper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Syncfusion.DocIO;
using Syncfusion.DocIO.DLS;
using Syncfusion.DocIORenderer;
using Syncfusion.Pdf;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HrLetterController : ControllerBase
    {
        private readonly IHrLetterRepository hrLetterRepository;
        private readonly FileService fileService;
        private readonly IGenerateLetterRepository generateLetterRepository;

        private readonly AppSettings appSettings;

        public HrLetterController(IHrLetterRepository _hrLetterRepository, IGenerateLetterRepository _generateLetterRepository, FileService _fileService, IOptions<AppSettings> _appSettings)

        {
            hrLetterRepository = _hrLetterRepository;
            fileService = _fileService;
            appSettings = _appSettings.Value;
            generateLetterRepository = _generateLetterRepository;
        }

        [HttpGet]
        [Authorize]
        //public async Task<IActionResult> GetAllFileDownload()
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
        //        var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        var filetype = "C";
        //        // Validate input
        //        if (string.IsNullOrEmpty(fk_empid) || string.IsNullOrEmpty(filetype) || string.IsNullOrEmpty(decryptedCompanyId))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Required parameters are missing.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        //  Call repository
        //        var (totalCount, result) = await hrLetterRepository.GetAllFileDownload(fk_empid, filetype, decryptedCompanyId);

        //        //  Check empty result
        //        if (result == null || !result.Any())
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No record found.";
        //            modelResponse.StatusCode = 404;
        //            return Ok(modelResponse);
        //        }

        //        //  Success response
        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "List retrieved successfully.";
        //        modelResponse.Data = result;
        //        modelResponse.TotalCount = totalCount;
        //        modelResponse.StatusCode = 200;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        // Error handling
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }
        //}

        public async Task<IActionResult> GetAllFileDownload()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var fk_empid = HttpContext.Items["DecryptedUserId"]?.ToString();

                // ✅ REMOVED filetype parameter - not needed for HR letters

                // Validate input
                if (string.IsNullOrEmpty(fk_empid))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee ID is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // ✅ CHANGED: Call new repository method for HR Letters
                var result = await hrLetterRepository.GetEmployeeHRLetters(fk_empid);

                // Check empty result
                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No letters found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                // Success response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Letters retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = result.Count();
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

        //[HttpGet("download-file")]
        //[Authorize]
        //public IActionResult DownloadFile(string filename)
        //{
        //    if (string.IsNullOrEmpty(filename))
        //        return BadRequest("Filename is required.");

        //    var folderPath = appSettings.UploadsFolderPath;
        //    var filePath = Path.Combine(folderPath, filename);

        //    if (!System.IO.File.Exists(filePath))
        //        return NotFound("File not found.");

        //    var contentType = GetMimeType(filePath);
        //    var fileBytes = System.IO.File.ReadAllBytes(filePath);
        //    return File(fileBytes, contentType, filename);
        //}

        //private string GetMimeType(string filePath)
        //{
        //    var fileExtension = Path.GetExtension(filePath).ToLower();
        //    return fileExtension switch
        //    {
        //        ".jpg" => "image/jpeg",
        //        ".jpeg" => "image/jpeg",
        //        ".png" => "image/png",
        //        ".gif" => "image/gif",
        //        ".bmp" => "image/bmp",
        //        ".tiff" => "image/tiff",
        //        ".pdf" => "application/pdf",
        //        _ => "application/octet-stream",
        //    };
        //}


        //[HttpGet("GetFile/{fileName}")]
        //[Authorize] // Optional: Secure it if needed
        //public IActionResult GetFile(string fileName)
        //{
        //    if (string.IsNullOrEmpty(fileName))
        //        return BadRequest("Filename not provided.");

        //    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
        //    var filePath = Path.Combine(uploadsPath, fileName);

        //    if (!System.IO.File.Exists(filePath))
        //        return NotFound("File not found.");

        //    var mimeType = GetMimeType(filePath);
        //    var fileBytes = System.IO.File.ReadAllBytes(filePath);

        //    return File(fileBytes, mimeType, fileName); // Optional: replace fileName with original name if stored
        //}





        //Add ANJALI 5 FEB 2026

        [HttpGet("DownloadFormat/{pk_trnid}")]
        [Authorize]
        public async Task<IActionResult> DownloadFormat(long pk_trnid)
        {
            var response = new ModelResponse();

            try
            {
                // 1. Fetch All Data From SP
                var data = await generateLetterRepository.DownloadFormatAsync(pk_trnid);

                if (data == null || data.Trn == null)
                {
                    response.IsSuccess = false;
                    response.Message = "No record found.";
                    response.StatusCode = 404;
                    return Ok(response);
                }

                var company = data.Company;
                var trn = data.Trn;
                //var mst = data.Mst; // only one employee
                //var head = data.Head;
                var mst = ((IEnumerable<dynamic>)data.Mst).FirstOrDefault();
                var head = ((IEnumerable<dynamic>)data.Head).ToList();

                // 2. SELECT TEMPLATE BASED ON FORMAT TYPE
                string templateFile = trn.formattype switch
                {
                    "A" => "appointment_letter_template.docx",
                    "B" => "Confirmation_Letter_With_Increment.docx",
                    "R" => "promotion_letter_template.docx",
                    "D" => "increment_letter_template.docx",
                    "L" => "Retirement_Letter_Template.docx",
                    "F" => "Transfer_Letter_Template.docx",
                    "X" => "CONFIRMATIONOFEXTENSION.docx",
                    "O" => "V1_Vendor Offer Letter_Draft.docx",
                    _ => "Default_Letter_Template.docx"
                };

                string templatePath = Path.Combine(appSettings.LetterTemplatesFolderPath, templateFile);
                if (!System.IO.File.Exists(templatePath))
                {
                    templatePath = Path.Combine(AppContext.BaseDirectory, "LetterTemplates", templateFile);
                }
                if (!System.IO.File.Exists(templatePath))
                {
                    templatePath = Path.Combine(Directory.GetCurrentDirectory(), "LetterTemplates", templateFile);
                }
                if (!System.IO.File.Exists(templatePath))
                {
                    templatePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "LetterTemplates", templateFile);
                }

                if (!System.IO.File.Exists(templatePath))
                {
                    response.IsSuccess = false;
                    response.Message = $"Template Not Found: {templateFile}";
                    response.StatusCode = 500;
                    return Ok(response);
                }

                // 3. Load Word Template
                using WordDocument document = new WordDocument(templatePath, FormatType.Docx);

                // 4. REPLACE PLACEHOLDERS
                if (trn.formattype == "O")
                {
                    string vendorName = "";
                    try
                    {
                        if (mst != null && !string.IsNullOrWhiteSpace((string)mst.VendorName))
                            vendorName = ((string)mst.VendorName).Trim();
                    }
                    catch { }

                    if (string.IsNullOrWhiteSpace(vendorName) || vendorName.Equals("Vendor", StringComparison.OrdinalIgnoreCase))
                    {
                        try
                        {
                            if (trn != null && !string.IsNullOrWhiteSpace((string)trn.vendorname))
                                vendorName = ((string)trn.vendorname).Trim();
                        }
                        catch { }
                    }

                    if (string.IsNullOrWhiteSpace(vendorName) || vendorName.Equals("Vendor", StringComparison.OrdinalIgnoreCase))
                    {
                        try
                        {
                            string empId = mst?.fk_empid?.ToString() ?? trn?.fk_Offerempid?.ToString() ?? "";
                            if (!string.IsNullOrEmpty(empId))
                            {
                                using var conn = HRMSWebAPI.Helper.DataBaseFactory.ConnString();
                                vendorName = conn.QueryFirstOrDefault<string>(@"
                                    SELECT TOP 1 COALESCE(NULLIF(ca.VendorName, ''), NULLIF(cd.Vendor_Name, ''), NULLIF(e.vendorId, ''))
                                    FROM dbo.SAL_Employee_Mst e
                                    LEFT JOIN dbo.REC_Candidate_Applications ca ON (ca.EmployeeCode = e.empcode OR (ca.AadhaarNo IS NOT NULL AND ca.AadhaarNo <> '' AND ca.AadhaarNo = e.adhaarNo))
                                    LEFT JOIN dbo.REC_Candidate_Details cd ON (cd.pk_recId = e.vendorId OR cd.Vendor_Code = e.vendorId)
                                    WHERE e.pk_empid = @empId", new { empId }) ?? "";
                            }
                        }
                        catch { }
                    }

                    if (string.IsNullOrWhiteSpace(vendorName) || vendorName.Equals("Vendor", StringComparison.OrdinalIgnoreCase))
                        vendorName = "Authorized Staffing Partner";
                    string employeeName = mst?.name ?? "";
                    string designation = mst?.DesignationName ?? "";
                    string doj = mst?.joiningdate != null ? Convert.ToDateTime(mst.joiningdate).ToString("dd MMMM yyyy") : "";
                    string dateStr = trn.dated != null ? Convert.ToDateTime(trn.dated).ToString("dd MMMM yyyy") : DateTime.Now.ToString("dd MMMM yyyy");
                    string locationAddr = !string.IsNullOrWhiteSpace((string)(mst?.Location))
                        ? ((string)mst.Location + (!string.IsNullOrWhiteSpace((string)(mst?.LocAddress)) ? ", " + (string)mst.LocAddress : ""))
                        : ((string)(mst?.address) ?? "Client Location");
                    string empCode = mst?.empcode ?? "";
                    string fatherName = mst?.FatherName ?? "";
                    string candAddress = mst?.address ?? "";

                    document.Replace("[VENDOR NAME]", vendorName, false, false);
                    document.Replace("_[VENDOR NAME]_", vendorName, false, false);
                    document.Replace("[EMPLOYEE NAME]", employeeName, false, false);
                    document.Replace("_[EMPLOYEE NAME]_", employeeName, false, false);
                    document.Replace("_[DESIGNATION]_", designation, false, false);
                    document.Replace("[DESIGNATION]", designation, false, false);
                    document.Replace("_ [DATE OF JOINING] _", doj, false, false);
                    document.Replace("[DATE OF JOINING]", doj, false, false);
                    document.Replace("_ [CLIENT LOCATION/SITE ADDRESS]", locationAddr, false, false);
                    document.Replace("[CLIENT LOCATION/SITE ADDRESS]", locationAddr, false, false);

                    document.Replace("Date: _______________", $"Date: {dateStr}", false, false);
                    document.Replace("S/o / D/o: ____________", $"S/o / D/o: {fatherName}", false, false);
                    document.Replace("Address: ____________", $"Address: {candAddress}", false, false);
                    document.Replace("Employee Code (to be assigned): ____________", $"Employee Code: {empCode}", false, false);

                    document.Replace("_[SIGNATURE]_", "", false, false);
                    document.Replace("[EMPLOYEE SIGNATURE]", "", false, false);
                    document.Replace("Name: ____________", $"Name: {employeeName}", false, false);
                    document.Replace("Date: ____________", $"Date: {dateStr}", false, false);

                    AddCompensationAnnexure(document, head, trn);
                }
                else
                {
                //document.Replace("{{CompanyAddress}}", company.address1 ?? "", true, true);
                document.Replace("{{CompanyAddress}}", "SVH Metro Street Sector 83" ?? "", true, true);
                // ========== CANDIDATE DETAILS ==========
                document.Replace("{{CandidateName}}", mst?.name ?? "", true, true);


                document.Replace("{{CandidateAddress}}", mst?.address ?? "", true, true);
                document.Replace("{{CandidateCityStatePin}}", mst?.pinno ?? "", true, true);

                document.Replace("{{HRName}}", mst?.HrName ?? "", true, true);
                document.Replace("{{Location}}", mst?.Location ?? "", true, true);

                document.Replace("{{CandidateName}}", mst?.name ?? "", true, true);
                document.Replace("{{Designation}}", mst?.DesignationName ?? "", true, true);
                document.Replace("{{DepartmentName}}", mst?.Department ?? "", true, true);
                document.Replace("{{JoiningDate}}",
                    mst?.joiningdate != null ? Convert.ToDateTime(mst.joiningdate).ToString("dd MMMM yyyy") : "", true, true);

                document.Replace("{{effectivedate}}",
                  trn.effectivedate != null ? Convert.ToDateTime(trn.effectivedate).ToString("dd MMMM yyyy") : "", true, true);

                document.Replace("{{Salary}}",
                    trn.ctc != null ? trn.ctc.ToString("N0") : "", true, true);

                document.Replace("{{CTCInWords}}", trn.newctcinword ?? "", true, true);
                //document.Replace("{{newctc}}", trn.newctc ?? "", true, true);


                document.Replace("{{EmployeeCode}}", trn.fk_empcooid ?? "", true, true);

                document.Replace("{{CurrentDate}}", DateTime.Now.ToString("dd MMMM yyyy"), true, true);

                document.Replace("{{resigndate}}",
                 trn.resigndate != null ? Convert.ToDateTime(trn.resigndate).ToString("dd MMMM yyyy") : "", true, true);

                document.Replace("{{contactno}}", trn.contactno ?? "", true, true);

                document.Replace("{{TransferLocation}}", trn.TransferLocation ?? "", true, true);
                document.Replace("{{trandate}}",
               trn.trandate != null ? Convert.ToDateTime(trn.trandate).ToString("dd MMMM yyyy") : "", true, true);

                document.Replace("{{IncrementAmount}}",
                   trn.IncrementAmount != null ? trn.IncrementAmount.ToString("N0") : "", true, true);

                document.Replace("{{PerMonthSalary}}",
                  trn.PerMonthSalary != null ? trn.PerMonthSalary.ToString("N0") : "", true, true);

                document.Replace("{{comments1}}", trn.comments1 ?? "", true, true);
                document.Replace("{{comments2}}", trn.comments2 ?? "", true, true);
                document.Replace("{{comments3}}", trn.comments3 ?? "", true, true);
                document.Replace("{{comments4}}", trn.comments4 ?? "", true, true);

                document.Replace("{{eperiod}}", trn.eperiod ?? "", true, true);
                }

                //document.Replace("{{eperiod}}",
                //  trn.eperiod != null ? trn.eperiod.ToString("N0") : "", true, true);

                // 5. SAVE PDF
                //string outputFolder = Path.Combine(
                //        "D:\\VISHWANATH SIR LATEST\\HRMS currently working 30-09-2025\\Application\\WebAPI\\Templates");

                //Directory.CreateDirectory(outputFolder);

                //string fileName = $"Letter_{mst?.name}_{DateTime.Now:yyyyMMdd_HHmmss}";
                //string pdfPath = Path.Combine(outputFolder, fileName + ".pdf");

                //    using (DocIORenderer renderer = new DocIORenderer())
                //    {
                //        using (PdfDocument pdfDoc = renderer.ConvertToPDF(document))
                //        {
                //            pdfDoc.Save(pdfPath);
                //            pdfDoc.Close(true);
                //        }
                //    }

                //    document.Close();

                //    // 6. RETURN PDF FILE FOR DOWNLOAD  
                //    byte[] fileBytes = System.IO.File.ReadAllBytes(pdfPath);

                //    return File(
                //        fileBytes,
                //        "application/pdf",
                //        $"{fileName}.pdf"
                //    );
                //}

                using (DocIORenderer renderer = new DocIORenderer())
                {
                    using (PdfDocument pdfDoc = renderer.ConvertToPDF(document))
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            pdfDoc.Save(ms);
                            pdfDoc.Close(true);

                            byte[] pdfBytes = ms.ToArray();

                            string fileName = $"Letter_{mst?.name}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

                            return File(
                                pdfBytes,
                                "application/pdf",
                                fileName
                            );
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = "Error: " + ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }


        //[HttpGet("download-file/{pk_trnid}")]
        //[Authorize]
        //public async Task<IActionResult> DownloadFormats(long pk_trnid)
        //{
        //    var modelResponse = new ModelResponse();

        //    try
        //    {
        //        var result = await generateLetterRepository.DownloadFormatAsync(pk_trnid);

        //        // ❗ Same pattern check as your Leave Dashboard API
        //        //if (result == null ||
        //        //   (result.company == null && result.trn == null &&
        //        //    (result.mst == null)))
        //        //{
        //        //    modelResponse.IsSuccess = false;
        //        //    modelResponse.Message = "No record found.";
        //        //    modelResponse.StatusCode = 404;
        //        //    return Ok(modelResponse);
        //        //}

        //        // ✅ Success
        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Format details retrieved successfully.";
        //        modelResponse.Data = result;
        //        modelResponse.StatusCode = 200;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        // ❗ return error but still 200 OK as per your pattern
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }
        //}





        private void AddCompensationAnnexure(WordDocument document, List<dynamic> head, dynamic trn)
        {
            try
            {
                if (document.Sections.Count == 0) return;
                IWSection section = document.Sections[0];

                WParagraph titlePara = new WParagraph(document);
                titlePara.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Center;
                titlePara.ParagraphFormat.BeforeSpacing = 10f;
                titlePara.ParagraphFormat.AfterSpacing = 8f;
                IWTextRange titleRange = titlePara.AppendText("ANNEXURE - 1: COMPENSATION STRUCTURE");
                titleRange.CharacterFormat.Bold = true;
                titleRange.CharacterFormat.FontSize = 11.5f;
                titleRange.CharacterFormat.FontName = "Calibri";

                var validHeads = head != null
                    ? head.Where(h => {
                        decimal a = 0; decimal aa = 0;
                        decimal.TryParse(h?.amount?.ToString(), out a);
                        decimal.TryParse(h?.annualamount?.ToString(), out aa);
                        return a > 0 || aa > 0;
                    }).ToList()
                    : new List<dynamic>();

                int rowCount = validHeads.Count > 0 ? validHeads.Count + 2 : 2;
                WTable table = new WTable(document);
                table.ResetCells(rowCount, 3);
                table.TableFormat.IsAutoResized = true;

                WTableRow headerRow = table.Rows[0];
                headerRow.IsHeader = true;
                headerRow.Height = 22f;
                headerRow.HeightType = TableRowHeightType.AtLeast;

                string[] headers = new[] { "Salary Component", "Monthly Amount (Rs.)", "Annual Amount (Rs.)" };
                for (int c = 0; c < 3; c++)
                {
                    WTableCell cell = headerRow.Cells[c];
                    cell.CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(235, 240, 248);
                    IWParagraph p = cell.AddParagraph();
                    p.ParagraphFormat.HorizontalAlignment = c == 0
                        ? Syncfusion.DocIO.DLS.HorizontalAlignment.Left
                        : Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                    IWTextRange tr = p.AppendText(headers[c]);
                    tr.CharacterFormat.Bold = true;
                    tr.CharacterFormat.FontSize = 10f;
                    tr.CharacterFormat.FontName = "Calibri";
                }

                decimal totalMonthly = 0;
                decimal totalAnnual = 0;

                int rowIdx = 1;
                foreach (var item in validHeads)
                {
                    string headName = item?.HeadName ?? item?.description ?? item?.shortdesc ?? $"Component {rowIdx}";
                    decimal monthly = 0;
                    decimal annual = 0;
                    decimal.TryParse(item?.amount?.ToString(), out monthly);
                    decimal.TryParse(item?.annualamount?.ToString(), out annual);

                    if (monthly > 0 && annual == 0) annual = Math.Round(monthly * 12, 2);
                    if (annual > 0 && monthly == 0) monthly = Math.Round(annual / 12, 2);

                    totalMonthly += monthly;
                    totalAnnual += annual;

                    WTableRow row = table.Rows[rowIdx];
                    row.Height = 20f;
                    row.HeightType = TableRowHeightType.AtLeast;

                    IWParagraph p0 = row.Cells[0].AddParagraph();
                    IWTextRange tr0 = p0.AppendText(headName);
                    tr0.CharacterFormat.FontSize = 9.5f;
                    tr0.CharacterFormat.FontName = "Calibri";

                    IWParagraph p1 = row.Cells[1].AddParagraph();
                    p1.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                    IWTextRange tr1 = p1.AppendText(monthly.ToString("N2"));
                    tr1.CharacterFormat.FontSize = 9.5f;
                    tr1.CharacterFormat.FontName = "Calibri";

                    IWParagraph p2 = row.Cells[2].AddParagraph();
                    p2.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                    IWTextRange tr2 = p2.AppendText(annual.ToString("N2"));
                    tr2.CharacterFormat.FontSize = 9.5f;
                    tr2.CharacterFormat.FontName = "Calibri";

                    rowIdx++;
                }

                if (validHeads.Count == 0)
                {
                    decimal ctcVal = 0;
                    decimal.TryParse(trn?.ctc?.ToString(), out ctcVal);
                    totalAnnual = ctcVal;
                    totalMonthly = ctcVal > 0 ? Math.Round(ctcVal / 12, 2) : 0;

                    WTableRow row = table.Rows[1];
                    row.Height = 20f;
                    row.HeightType = TableRowHeightType.AtLeast;

                    IWParagraph p0 = row.Cells[0].AddParagraph();
                    IWTextRange tr0 = p0.AppendText("Cost to Company (Gross CTC)");
                    tr0.CharacterFormat.Bold = true;
                    tr0.CharacterFormat.FontSize = 9.5f;
                    tr0.CharacterFormat.FontName = "Calibri";

                    var pm = row.Cells[1].AddParagraph();
                    pm.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                    var trm = pm.AppendText(totalMonthly.ToString("N2"));
                    trm.CharacterFormat.Bold = true;
                    trm.CharacterFormat.FontSize = 9.5f;
                    trm.CharacterFormat.FontName = "Calibri";

                    var pa = row.Cells[2].AddParagraph();
                    pa.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                    var tra = pa.AppendText(totalAnnual.ToString("N2"));
                    tra.CharacterFormat.Bold = true;
                    tra.CharacterFormat.FontSize = 9.5f;
                    tra.CharacterFormat.FontName = "Calibri";
                }
                else
                {
                    WTableRow totalRow = table.Rows[rowIdx];
                    totalRow.Height = 22f;
                    totalRow.HeightType = TableRowHeightType.AtLeast;

                    for (int c = 0; c < 3; c++)
                    {
                        totalRow.Cells[c].CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(245, 245, 245);
                    }

                    IWParagraph pt0 = totalRow.Cells[0].AddParagraph();
                    IWTextRange trt0 = pt0.AppendText("Total CTC (Cost to Company)");
                    trt0.CharacterFormat.Bold = true;
                    trt0.CharacterFormat.FontSize = 10f;
                    trt0.CharacterFormat.FontName = "Calibri";

                    IWParagraph pt1 = totalRow.Cells[1].AddParagraph();
                    pt1.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                    IWTextRange trt1 = pt1.AppendText(totalMonthly.ToString("N2"));
                    trt1.CharacterFormat.Bold = true;
                    trt1.CharacterFormat.FontSize = 10f;
                    trt1.CharacterFormat.FontName = "Calibri";

                    IWParagraph pt2 = totalRow.Cells[2].AddParagraph();
                    pt2.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                    IWTextRange trt2 = pt2.AppendText(totalAnnual.ToString("N2"));
                    trt2.CharacterFormat.Bold = true;
                    trt2.CharacterFormat.FontSize = 10f;
                    trt2.CharacterFormat.FontName = "Calibri";
                }

                table.TableFormat.Borders.BorderType = Syncfusion.DocIO.DLS.BorderStyle.Single;
                table.TableFormat.Borders.LineWidth = 0.75f;
                table.TableFormat.Borders.Color = Syncfusion.Drawing.Color.FromArgb(180, 190, 205);

                TextSelection selection = document.Find("[COMPENSATION]", false, false);
                if (selection != null)
                {
                    WTextRange range = selection.GetAsOneRange();
                    WParagraph targetPara = range.OwnerParagraph;
                    WTextBody body = targetPara.OwnerTextBody;
                    int insertIdx = body.ChildEntities.IndexOf(targetPara);

                    body.ChildEntities.Remove(targetPara);
                    body.ChildEntities.Insert(insertIdx, titlePara);
                    body.ChildEntities.Insert(insertIdx + 1, table);

                    WParagraph spaceAfter = new WParagraph(document);
                    spaceAfter.ParagraphFormat.AfterSpacing = 8f;
                    body.ChildEntities.Insert(insertIdx + 2, spaceAfter);
                }
                else
                {
                    IWParagraph pBreak = section.AddParagraph();
                    pBreak.AppendBreak(BreakType.PageBreak);
                    section.Body.ChildEntities.Add(titlePara);
                    section.Body.ChildEntities.Add(table);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error building compensation annexure: " + ex.Message);
            }
        }

        private string GetMimeType(string filePath)
        {
            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out string contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
        }


        [HttpGet("GetEmployeeLetters/{fk_empid}")]
      
        [Authorize]
        public async Task<IActionResult> GetEmployeeLetters(string? fk_empid = null, [FromQuery] string? empid = null)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                string targetEmpId = !string.IsNullOrWhiteSpace(fk_empid) ? fk_empid : (empid ?? "");

                if (string.IsNullOrWhiteSpace(targetEmpId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee ID is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await hrLetterRepository.GetEmployeeHRLetters(targetEmpId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "No letters found.";
                    modelResponse.Data = Enumerable.Empty<HrLetterMst>();
                    modelResponse.TotalCount = 0;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Letters retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = result.Count();
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