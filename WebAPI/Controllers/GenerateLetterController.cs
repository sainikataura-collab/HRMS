using Dapper;
using HRMSWebAPI.Helper;
using DocumentFormat.OpenXml.Wordprocessing;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using HRMSWebAPI.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Syncfusion.DocIO;
using Syncfusion.DocIO;
using Syncfusion.DocIO.DLS;
using Syncfusion.DocIORenderer;
using Syncfusion.Pdf;
using Microsoft.AspNetCore.SignalR;
namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class GenerateLetterController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IGenerateLetterRepository generateLetterRepository;
        private readonly IExportReportRepository exportReportRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;
        private readonly IHrchatRepository _hrchatRepository;
        private readonly IHubContext<ChatHub> _hubContext;


        public GenerateLetterController(IExportReportRepository _exportReportRepository, IWebHostEnvironment environment,
            IGenerateLetterRepository _generateLetterRepository, FileService _fileService, IOptions<AppSettings> _appSettings,
            IHrchatRepository hrchatRepository, IHubContext<ChatHub> hubContext)

        {
            exportReportRepository = _exportReportRepository;
            _environment = environment;
            generateLetterRepository = _generateLetterRepository;
            fileService = _fileService;
            appSettings = _appSettings.Value;
            _hrchatRepository = hrchatRepository;
            _hubContext = hubContext;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertCandidateLetterAsync([FromBody] CandidateLetterDataset dataset)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (dataset == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid request payload.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid company ID.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                var result = await generateLetterRepository.InsertCandidateLetterAsync(dataset, decryptedCompanyId);

                if (!result.IsSuccess)
                {
                    // This will catch SQL duplicate-message or custom THROW from SP
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = result.ErrorMessage;   // <-- error coming from SP
                    modelResponse.StatusCode = 400;

                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate letter inserted successfully.";
                modelResponse.StatusCode = 200;

                // ✅ Send notification if published
                if (modelResponse.IsSuccess == true && dataset.Candidates != null && dataset.Candidates.StatusId == true)
                {
                    string letterTypeStr = GetLetterTypeName(dataset.FormatTrn?.formattype);
                    string receiverUserId = dataset.Candidates.fk_empid;

                    if (!string.IsNullOrEmpty(receiverUserId))
                    {
                        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                        var notification = new ChatMessage
                        {
                            SenderUserId = decryptedUserId,
                            ReceiverUserId = receiverUserId,
                            SenderRole = "HR",
                            ReceiverRole = "EMP",
                            MessageText = $"New {letterTypeStr} generated",
                            NotificationType = "Letter",
                            RedirectUrl = "/dash/hrdocument/hrdocumentdashboard/HR_Letter",
                            SentAt = DateTime.Now,
                            IsRead = false,
                            SenderName = dataset.Candidates.SenderName
                        };

                        long chatId = _hrchatRepository.InsertChatMessage(notification);
                        if (chatId > 0)
                        {
                            string receiverGroupKey = $"{receiverUserId}:EMP";
                            await _hubContext.Clients.Group(receiverGroupKey).SendAsync("ReceiveNotification", new
                            {
                                senderId = decryptedUserId,
                                senderName = notification.SenderName,
                                senderRole = "HR",
                                message = notification.MessageText,
                                notificationType = notification.NotificationType,
                                redirectUrl = notification.RedirectUrl,
                                timestamp = DateTime.Now,
                                chatId = chatId
                            });
                        }
                    }
                }

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

        [HttpGet("GetHeads")]
        [Authorize] // keep if you want security
        public async Task<IActionResult> GetHeads([FromQuery] string? companyId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var targetCompanyId = !string.IsNullOrWhiteSpace(decryptedCompanyId) ? decryptedCompanyId : companyId;

                var result = await generateLetterRepository.GetHeads(targetCompanyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No event found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Heads retrieved successfully.";
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


        [HttpGet("GetCandidateLetterGrid")]
        [Authorize]   // keep if needed
        public async Task<IActionResult> GetCandidateLetterGrid(int pageIndex, int pageSize, long? fk_formatid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, data) = await generateLetterRepository.GetCandidateLetterGrid(pageIndex, pageSize, fk_formatid);

                if (data == null || !data.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Candidate letters retrieved successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.TotalCount = totalCount;  // add if your ModelResponse supports it
                modelResponse.Data = data;

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

        [HttpDelete("{pk_trnid}")]
        [Authorize]
        public async Task<IActionResult> DeleteGradeAsync([FromRoute] long pk_trnid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await generateLetterRepository.DeleteAsync(pk_trnid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "letter detail delete successfully." : "Failed to delete letter detail.";
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

                //string templatePath = Path.Combine(
                //    "D:\\HRMS_Code_2026\\LatestHRMS_28JAN\\WebAPI\\LetterTemplates",
                //    templateFile);

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
                    document.Replace("{{CompanyName}}", "HR Book" ?? "", true, true);
                    document.Replace("{{CompanyAddress}}", "SVH Metro Street Sector 83" ?? "", true, true);
                    document.Replace("{{CandidateName}}", mst?.name ?? "", true, true);
                    document.Replace("{{CandidateAddress}}", mst?.address ?? "", true, true);
                    document.Replace("{{CandidateCityStatePin}}", mst?.pinno ?? "", true, true);
                    document.Replace("{{HRName}}", mst?.HrName ?? "", true, true);
                    document.Replace("{{Location}}", mst?.Location ?? "", true, true);
                    document.Replace("{{Designation}}", mst?.DesignationName ?? "", true, true);
                    document.Replace("{{DepartmentName}}", mst?.Department ?? "", true, true);
                    document.Replace("{{JoiningDate}}",
                        mst?.joiningdate != null ? Convert.ToDateTime(mst.joiningdate).ToString("dd MMMM yyyy") : "", true, true);
                    document.Replace("{{effectivedate}}",
                        trn.effectivedate != null ? Convert.ToDateTime(trn.effectivedate).ToString("dd MMMM yyyy") : "", true, true);
                    document.Replace("{{Salary}}",
                        trn.ctc != null ? trn.ctc.ToString("N0") : "", true, true);
                    document.Replace("{{CTCInWords}}", trn.newctcinword ?? "", true, true);
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

                // 5. CONVERT TO PDF
                byte[] pdfBytes;
                string fileName = $"Letter_{mst?.name}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

                using (DocIORenderer renderer = new DocIORenderer())
                {
                    using (PdfDocument pdfDoc = renderer.ConvertToPDF(document))
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            pdfDoc.Save(ms);
                            pdfDoc.Close(true);
                            pdfBytes = ms.ToArray();
                        }
                    }
                }

                // ✅ 6. SAVE PDF TO D:\image FOLDER ANJALI 
                try
                {
                    //string saveFolder = @"D:\image";
                    string saveFolder = Path.Combine(
appSettings.UploadsFolderPath,
templateFile);



                    // ✅ Create folder if it doesn't exist
                    if (!Directory.Exists(saveFolder))
                    {
                        Directory.CreateDirectory(saveFolder);
                    }
                    string savedFileName = $"{pk_trnid}_{fileName}";
                    string savePath = Path.Combine(saveFolder, savedFileName);

                    // ✅ Save the PDF file
                    System.IO.File.WriteAllBytes(savePath, pdfBytes);

                    Console.WriteLine($"PDF saved successfully at: {savePath}");
                }
                catch (Exception saveEx)
                {
                    // ✅ Log error but don't stop the download
                    Console.WriteLine($"Failed to save PDF to D:\\image: {saveEx.Message}");
                    // Optionally you can still continue and return the file
                }

                // 7. RETURN PDF FILE FOR DOWNLOAD
                return File(
                    pdfBytes,
                    "application/pdf",
                    fileName
                );
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = "Error: " + ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }



        //// ✅ VIEW saved PDF
        //[HttpGet("ViewLetter/{pk_trnid}")]
        //[Authorize]
        //public IActionResult ViewSavedLetter(long pk_trnid)
        //{
        //    try
        //    {
        //        string saveFolder = @"D:\image";

        //        // ✅ Find file with pk_trnid prefix
        //        var files = Directory.GetFiles(saveFolder, $"{pk_trnid}_*.pdf");

        //        if (files.Length == 0)
        //        {
        //            return NotFound(new
        //            {
        //                isSuccess = false,
        //                message = "Letter not downloaded yet. Please download first.",
        //                statusCode = 404
        //            });
        //        }

        //        // ✅ Get most recent file (in case multiple downloads)
        //        string filePath = files.OrderByDescending(f => System.IO.File.GetCreationTime(f)).First();

        //        byte[] fileBytes = System.IO.File.ReadAllBytes(filePath);
        //        string fileName = Path.GetFileName(filePath);

        //        Console.WriteLine($"✅ Viewing: {fileName}");

        //        // ✅ Return SAME PDF that was saved during download
        //        return File(fileBytes, "application/pdf", fileName);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            isSuccess = false,
        //            message = $"Error: {ex.Message}",
        //            statusCode = 500
        //        });
        //    }
        //}


        //[HttpGet("DownloadFormat/{pk_trnid}")]
        //[Authorize]
        //public async Task<IActionResult> DownloadFormat(long pk_trnid)
        //{
        //    var response = new ModelResponse();

        //    try
        //    {
        //        // 1. Fetch All Data From SP
        //        var data = await generateLetterRepository.DownloadFormatAsync(pk_trnid);

        //        if (data == null || data.Trn == null)
        //        {
        //            response.IsSuccess = false;
        //            response.Message = "No record found.";
        //            response.StatusCode = 404;
        //            return Ok(response);
        //        }

        //        var company = data.Company;
        //        var trn = data.Trn;
        //        //var mst = data.Mst; // only one employee
        //        //var head = data.Head;
        //        var mst = ((IEnumerable<dynamic>)data.Mst).FirstOrDefault();
        //        var head = ((IEnumerable<dynamic>)data.Head).ToList();

        //        // 2. SELECT TEMPLATE BASED ON FORMAT TYPE
        //        string templateFile = trn.formattype switch
        //        {
        //            "A" => "appointment_letter_template.docx",
        //            "B" => "Confirmation_Letter_With_Increment.docx",
        //            "R" => "promotion_letter_template.docx",
        //            "D" => "increment_letter_template.docx",
        //            "L" => "Retirement_Letter_Template.docx",
        //            "F" => "Transfer_Letter_Template.docx",
        //             "X" => "CONFIRMATIONOFEXTENSION.docx",
        //            _ => "Default_Letter_Template.docx"

        //        };

        //        string templatePath = Path.Combine(
        //           //  "D:\\VISHWANATH SIR LATEST\\HRMS currently working 30-09-2025\\Application\\WebAPI\\LetterTemplates",
        //           "D:\\HRMS_Code_2026\\LatestHRMS_28JAN\\WebAPI\\LetterTemplates",
        //            templateFile);


        //        if (!System.IO.File.Exists(templatePath))
        //        {
        //            response.IsSuccess = false;
        //            response.Message = $"Template Not Found: {templateFile}";
        //            response.StatusCode = 500;
        //            return Ok(response);
        //        }

        //        // 3. Load Word Template
        //        using WordDocument document = new WordDocument(templatePath, FormatType.Docx);

        //        // 4. REPLACE PLACEHOLDERS
        //        //document.Replace("{{CompanyName}}", company.compname ?? "", true, true);
        //        document.Replace("{{CompanyName}}", "HR Book" ?? "", true, true);
        //        //document.Replace("{{CompanyAddress}}", company.address1 ?? "", true, true);
        //        document.Replace("{{CompanyAddress}}", "SVH Metro Street Sector 83"?? "", true, true);
        //        // ========== CANDIDATE DETAILS ==========
        //        document.Replace("{{CandidateName}}", mst?.name ?? "", true, true);


        //        document.Replace("{{CandidateAddress}}", mst?.address ?? "", true, true);
        //        document.Replace("{{CandidateCityStatePin}}", mst?.pinno ?? "", true, true);

        //        document.Replace("{{HRName}}", mst?.HrName ?? "", true, true);
        //        document.Replace("{{Location}}", mst?.Location ?? "", true, true);

        //        document.Replace("{{CandidateName}}", mst?.name ?? "", true, true);
        //        document.Replace("{{Designation}}", mst?.DesignationName ?? "", true, true);
        //        document.Replace("{{DepartmentName}}", mst?.Department ?? "", true, true);
        //        document.Replace("{{JoiningDate}}",
        //            mst?.joiningdate != null ? Convert.ToDateTime(mst.joiningdate).ToString("dd MMMM yyyy") : "", true, true);

        //        document.Replace("{{effectivedate}}",
        //          trn.effectivedate != null ? Convert.ToDateTime(trn.effectivedate).ToString("dd MMMM yyyy") : "", true, true);

        //        document.Replace("{{Salary}}",
        //            trn.ctc != null ? trn.ctc.ToString("N0") : "", true, true);

        //        document.Replace("{{CTCInWords}}", trn.newctcinword ?? "", true, true);
        //        //document.Replace("{{newctc}}", trn.newctc ?? "", true, true);


        //        document.Replace("{{EmployeeCode}}", trn.fk_empcooid ?? "", true, true);

        //        document.Replace("{{CurrentDate}}", DateTime.Now.ToString("dd MMMM yyyy"), true, true);

        //        document.Replace("{{resigndate}}",
        //         trn.resigndate != null ? Convert.ToDateTime(trn.resigndate).ToString("dd MMMM yyyy") : "", true, true);

        //        document.Replace("{{contactno}}", trn.contactno ?? "", true, true);

        //        document.Replace("{{TransferLocation}}", trn.TransferLocation ?? "", true, true);
        //        document.Replace("{{trandate}}",
        //       trn.trandate != null ? Convert.ToDateTime(trn.trandate).ToString("dd MMMM yyyy") : "", true, true);

        //        document.Replace("{{IncrementAmount}}",
        //           trn.IncrementAmount != null ? trn.IncrementAmount.ToString("N0") : "", true, true);

        //        document.Replace("{{PerMonthSalary}}",
        //          trn.PerMonthSalary != null ? trn.PerMonthSalary.ToString("N0") : "", true, true);

        //        document.Replace("{{comments1}}", trn.comments1 ?? "", true, true);
        //        document.Replace("{{comments2}}", trn.comments2 ?? "", true, true);
        //        document.Replace("{{comments3}}", trn.comments3 ?? "", true, true);
        //        document.Replace("{{comments4}}", trn.comments4 ?? "", true, true);

        //        document.Replace("{{eperiod}}", trn.eperiod ?? "", true, true);

        //        //document.Replace("{{eperiod}}",
        //        //  trn.eperiod != null ? trn.eperiod.ToString("N0") : "", true, true);

        //        // 5. SAVE PDF
        //        //string outputFolder = Path.Combine(
        //        //        "D:\\VISHWANATH SIR LATEST\\HRMS currently working 30-09-2025\\Application\\WebAPI\\Templates");

        //        //Directory.CreateDirectory(outputFolder);

        //        //string fileName = $"Letter_{mst?.name}_{DateTime.Now:yyyyMMdd_HHmmss}";
        //        //string pdfPath = Path.Combine(outputFolder, fileName + ".pdf");

        //        //    using (DocIORenderer renderer = new DocIORenderer())
        //        //    {
        //        //        using (PdfDocument pdfDoc = renderer.ConvertToPDF(document))
        //        //        {
        //        //            pdfDoc.Save(pdfPath);
        //        //            pdfDoc.Close(true);
        //        //        }
        //        //    }

        //        //    document.Close();

        //        //    // 6. RETURN PDF FILE FOR DOWNLOAD  
        //        //    byte[] fileBytes = System.IO.File.ReadAllBytes(pdfPath);

        //        //    return File(
        //        //        fileBytes,
        //        //        "application/pdf",
        //        //        $"{fileName}.pdf"
        //        //    );
        //        //}

        //        using (DocIORenderer renderer = new DocIORenderer())
        //        {
        //            using (PdfDocument pdfDoc = renderer.ConvertToPDF(document))
        //            {
        //                using (MemoryStream ms = new MemoryStream())
        //                {
        //                    pdfDoc.Save(ms);
        //                    pdfDoc.Close(true);

        //                    byte[] pdfBytes = ms.ToArray();

        //                    string fileName = $"Letter_{mst?.name}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";

        //                    return File(
        //                        pdfBytes,
        //                        "application/pdf",
        //                        fileName
        //                    );
        //                }
        //            }
        //        }


        //    }
        //    catch (Exception ex)
        //    {
        //        response.IsSuccess = false;
        //        response.Message = "Error: " + ex.Message;
        //        response.StatusCode = 500;
        //        return Ok(response);
        //    }
        //}











        [HttpGet("download/{pk_trnid}")]
        [Authorize]
        public async Task<IActionResult> DownloadFormats(long pk_trnid)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var result = await generateLetterRepository.DownloadFormatAsync(pk_trnid);

                // ❗ Same pattern check as your Leave Dashboard API
                //if (result == null ||
                //   (result.company == null && result.trn == null &&
                //    (result.mst == null)))
                //{
                //    modelResponse.IsSuccess = false;
                //    modelResponse.Message = "No record found.";
                //    modelResponse.StatusCode = 404;
                //    return Ok(modelResponse);
                //}

                // ✅ Success
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Format details retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                //  return error but still 200 OK as per your pattern
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        //ANJali
        // ✅ ADD THIS NEW METHOD
        [HttpGet("SelectEmployee/{fk_empId}")]
        [Authorize]
        public async Task<IActionResult> GetEmployeeById(string fk_empId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(fk_empId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee ID is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await generateLetterRepository.GetEmployeeByIdAsync(fk_empId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee not found.";
                    modelResponse.StatusCode = 404;
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


        // Add this method to your GenerateLetterController class ANJALI 6 feb 2026

        [HttpPut("publish/{pk_trnid}")]
        [Authorize]
        public async Task<IActionResult> PublishLetter(long pk_trnid, string senderName)
        {
            senderName ??= "HR Team";

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isPublished = await generateLetterRepository.PublishLetterAsync(pk_trnid);

                if (isPublished)
                {
                    // Fetch details for notification
                    var letterData = await generateLetterRepository.DownloadFormatAsync(pk_trnid);
                    string letterTypeStr = "Document";
                    if (letterData != null && letterData.Trn != null)
                    {
                        string type = letterData.Trn.formattype;
                        letterTypeStr = type switch
                        {
                            "A" => "Appointment Letter",
                            "B" => "Confirmation Letter",
                            "R" => "Promotion Letter",
                            "D" => "Increment Letter",
                            "L" => "Retirement Letter",
                            "F" => "Transfer Letter",
                            "X" => "Confirmation Extension",
                            _ => "HR Letter"
                        };
                    }
                    await SendLetterNotification(pk_trnid, letterTypeStr, senderName);
                }

                modelResponse.IsSuccess = isPublished;
                modelResponse.Message = isPublished
                    ? "Letter published successfully."
                    : "Failed to publish letter.";
                modelResponse.StatusCode = isPublished ? 200 : 400;

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

        private string GetLetterTypeName(string type)
        {
            return type switch
            {
                "A" => "Appointment Letter",
                "B" => "Confirmation Letter",
                "R" => "Promotion Letter",
                "D" => "Increment Letter",
                "L" => "Retirement Letter",
                "F" => "Transfer Letter",
                "X" => "Confirmation Extension",
                _ => "HR Letter"
            };
        }

        private async Task SendLetterNotification(long pk_trnid, string letterType, string senderName)
        {
            try
            {
                var data = await generateLetterRepository.DownloadFormatAsync(pk_trnid);
                if (data == null || data.Mst == null) return;

                var mstList = (IEnumerable<dynamic>)data.Mst;
                var mst = mstList.FirstOrDefault();
                if (mst == null) return;

                string receiverUserId = mst.fk_empid?.ToString();
                if (string.IsNullOrEmpty(receiverUserId)) return;

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var notification = new ChatMessage
                {
                    SenderUserId = decryptedUserId,
                    ReceiverUserId = receiverUserId,
                    SenderRole = "HR",
                    ReceiverRole = "EMP",
                    MessageText = $"New {letterType} generated",
                    NotificationType = "Letter",
                    RedirectUrl = "/dash/hrdocument/hrdocumentdashboard/HR_Letter",
                    SentAt = DateTime.Now,
                    IsRead = false,
                    SenderName = senderName
                };

                long chatId = _hrchatRepository.InsertChatMessage(notification);

                if (chatId > 0)
                {
                    string receiverGroupKey = $"{receiverUserId}:EMP";
                    await _hubContext.Clients.Group(receiverGroupKey).SendAsync("ReceiveNotification", new
                    {
                        senderId = decryptedUserId,
                        senderName = senderName,
                        senderRole = "HR",
                        message = notification.MessageText,
                        notificationType = notification.NotificationType,
                        redirectUrl = notification.RedirectUrl,
                        timestamp = DateTime.UtcNow,
                        chatId = chatId
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending notification: {ex.Message}");
            }
        }



        [HttpPost("UpdateStatus")]
        public async Task<IActionResult> UpdateStatus(int pk_trnid, bool status, string remark)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await generateLetterRepository.UpdateLetterStatusAsync(pk_trnid, status, remark);

                if (result > 0)
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Status updated successfully";
                    modelResponse.StatusCode = 200;
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to update status";
                    modelResponse.StatusCode = 400;
                }

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

    }
}