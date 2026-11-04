
using ClosedXML.Excel;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.ComponentModel;
using System.Dynamic;
using System.Globalization;
using System.Text;
using static HRMSWebAPI.Models.ImportExcle;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ExportReportController : ControllerBase
    {
        private readonly IExportReportRepository exportReportRepository;
        private readonly IConfiguration configuration;

        public ExportReportController(IExportReportRepository _exportReportRepository, IConfiguration _configuration)

        {
            exportReportRepository = _exportReportRepository;
            configuration = _configuration;
        }


        //export emplolyee list 

        //[HttpPost("ViewSalaryReportlist")]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> ViewSalaryReportlistAsync([FromBody] ReportModelRequest request)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


        //        var employees = await exportReportRepository.ViewSalaryReportAsync(request);

        //        if (employees == null || !employees.Any())
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No records found.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Data list retrieved successfully.";
        //        modelResponse.Data = employees;
        //        modelResponse.StatusCode = 200;
        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = "An error occurred: " + ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }
        //}


        [HttpPost("downloadForm12Reportlist")]
        [Authorize]
        public async Task<IActionResult> downloadForm12Reportlist(
string? reportName,
[FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            //request.fk_companyid = decryptedCompanyId;

            var dynamicResults = await exportReportRepository.ViewAttendanceReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            //else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            //{
            //    int month = int.Parse(request.fk_monthId);
            //    int year = int.Parse(request.fk_yearId);

            //    var selectedMonth = new DateTime(year, month, 1);
            //    dateHeaderText = $" Month :-{month}          Year :- {year}";
            //}
            else if (!string.IsNullOrEmpty(request.fk_monthId) &&
         !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);

                dateHeaderText = $"Month : {selectedMonth:MMMM}     Year : {year}";
            }


            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateForm12ExcelAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId)
    //columnsToSum: new[] { "Amount" } // which columns to total

);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }






        // for salary slip new 
        [HttpPost("DownloadSalarySlipPdf")]
        [Authorize]
        public async Task<IActionResult> DownloadSalarySlipPdf([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

            var (totalCount, employees, company, head, Leavedetail) = await exportReportRepository.PDFSalarySlip(request, decryptedCompanyId);

            if (employees == null || !employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });

            var pdfBytes = GenerateBulkSalarySlipPdf(employees, company, head, Leavedetail, request, decryptedCompanyId);
            var fileName = !string.IsNullOrWhiteSpace(request.EmpCode)
                ? $"SalarySlip_{request.EmpCode}_{request.fk_monthId}_{request.fk_yearId}.pdf"
                : $"SalarySlip_{request.fk_monthId}_{request.fk_yearId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }

        [NonAction]
        public byte[] GenerateBulkSalarySlipPdf(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, IEnumerable<dynamic> item3, IEnumerable<dynamic>? Leavedetail, ReportModelRequest request, string? decryptedCompanyId = null)
        {
            var list = items.ToList();
            var list1 = item2.ToList();
            var head = item3.ToList();
            var leave = Leavedetail != null ? Leavedetail.ToList() : new List<dynamic>();

            Func<dynamic, string, object?> getHeadProp = (headObj, propName) =>
            {
                try
                {
                    if (headObj is IDictionary<string, object> headDict)
                    {
                        var key = headDict.Keys.FirstOrDefault(k => string.Equals(k, propName, StringComparison.OrdinalIgnoreCase));
                        return key != null ? headDict[key] : null;
                    }
                    var properties = headObj?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var prop in properties)
                        {
                            if (string.Equals(prop.Name, propName, StringComparison.OrdinalIgnoreCase))
                                return prop.GetValue(headObj);
                        }
                    }
                    return null;
                }
                catch { return null; }
            };

            Func<dynamic, string, decimal> GetVal = (row, columnName) =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(columnName) || row == null) return 0;
                    if (row is IDictionary<string, object> dict)
                    {
                        var key = dict.Keys.FirstOrDefault(k => string.Equals(k, columnName, StringComparison.OrdinalIgnoreCase));
                        if (key != null && dict[key] != null) return Convert.ToDecimal(dict[key]);
                        return 0;
                    }
                    var properties = row?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var prop in properties)
                        {
                            if (string.Equals(prop.Name, columnName, StringComparison.OrdinalIgnoreCase))
                            {
                                var val = prop.GetValue(row);
                                return val != null ? Convert.ToDecimal(val) : 0;
                            }
                        }
                    }
                    return 0;
                }
                catch { return 0; }
            };

            Func<dynamic, string, decimal> GetArrearVal = (row, headName) => GetVal(row, "Arr_" + headName);

            Func<dynamic, string> getShortDesc = (x) =>
            {
                var s = getHeadProp(x, "shortdesc")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headname")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headcode")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "description")?.ToString();
                return s?.Trim() ?? string.Empty;
            };

            Func<dynamic, string> getDescription = (x) =>
            {
                var s = getHeadProp(x, "description")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "shortdesc")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headname")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headcode")?.ToString();
                return s?.Trim() ?? string.Empty;
            };

            Func<dynamic, int> getHeadOrder = (hObj) =>
            {
                var ord = getHeadProp(hObj, "sal_order") ?? getHeadProp(hObj, "headorder") ?? getHeadProp(hObj, "sortorder") ?? getHeadProp(hObj, "displayorder") ?? getHeadProp(hObj, "headid") ?? getHeadProp(hObj, "fk_headid");
                int oVal = 999;
                if (ord != null && int.TryParse(ord.ToString(), out oVal)) return oVal;
                return 999;
            };

            Func<dynamic, string[], string> GetStrVal = (row, columnNames) =>
            {
                try
                {
                    if (row == null) return "";
                    if (row is IDictionary<string, object> dict)
                    {
                        foreach (var col in columnNames)
                        {
                            var key = dict.Keys.FirstOrDefault(k => string.Equals(k, col, StringComparison.OrdinalIgnoreCase));
                            if (key != null && dict[key] != null && !string.IsNullOrWhiteSpace(dict[key].ToString()))
                                return dict[key].ToString()!.Trim();
                        }
                        return "";
                    }
                    var properties = row?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var col in columnNames)
                        {
                            foreach (var prop in properties)
                            {
                                if (string.Equals(prop.Name, col, StringComparison.OrdinalIgnoreCase))
                                {
                                    var val = prop.GetValue(row);
                                    if (val != null && !string.IsNullOrWhiteSpace(val.ToString()))
                                        return val.ToString()!.Trim();
                                }
                            }
                        }
                    }
                    return "";
                }
                catch { return ""; }
            };

            Func<dynamic, string[], bool> GetBoolVal = (row, columnNames) =>
            {
                try
                {
                    if (row == null) return false;
                    if (row is IDictionary<string, object> dict)
                    {
                        foreach (var col in columnNames)
                        {
                            var key = dict.Keys.FirstOrDefault(k => string.Equals(k, col, StringComparison.OrdinalIgnoreCase));
                            if (key != null && dict[key] != null)
                            {
                                var valStr = dict[key].ToString()?.Trim();
                                if (bool.TryParse(valStr, out bool bVal)) return bVal;
                                if (int.TryParse(valStr, out int iVal)) return iVal == 1;
                                if (string.Equals(valStr, "true", StringComparison.OrdinalIgnoreCase) || string.Equals(valStr, "1")) return true;
                            }
                        }
                        return false;
                    }
                    var properties = row?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var col in columnNames)
                        {
                            foreach (var prop in properties)
                            {
                                if (string.Equals(prop.Name, col, StringComparison.OrdinalIgnoreCase))
                                {
                                    var val = prop.GetValue(row);
                                    if (val != null)
                                    {
                                        var valStr = val.ToString()?.Trim();
                                        if (bool.TryParse(valStr, out bool bVal)) return bVal;
                                        if (int.TryParse(valStr, out int iVal)) return iVal == 1;
                                        if (string.Equals(valStr, "true", StringComparison.OrdinalIgnoreCase) || string.Equals(valStr, "1")) return true;
                                    }
                                }
                            }
                        }
                    }
                    return false;
                }
                catch { return false; }
            };

            Func<string, string> FormatDate = (val) =>
            {
                if (string.IsNullOrWhiteSpace(val)) return "";
                if (DateTime.TryParse(val, out DateTime dt))
                    return dt.ToString("dd MMM yyyy");
                return val;
            };

            var headObjects = head.Cast<object>().OrderBy(x => getHeadOrder(x)).ToList();

            var earningHeadList = headObjects
                .Where(x => string.Equals(getHeadProp(x, "headtype")?.ToString(), "E", StringComparison.OrdinalIgnoreCase))
                .Select(x => new { ShortDesc = getShortDesc(x), Description = getDescription(x) })
                .Where(x => !string.IsNullOrEmpty(x.ShortDesc))
                .GroupBy(x => x.ShortDesc, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First())
                .ToList();

            var deductionHeadList = headObjects
                .Where(x => string.Equals(getHeadProp(x, "headtype")?.ToString(), "D", StringComparison.OrdinalIgnoreCase))
                .Select(x => new { ShortDesc = getShortDesc(x), Description = getDescription(x) })
                .Where(x => !string.IsNullOrEmpty(x.ShortDesc))
                .GroupBy(x => x.ShortDesc, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First())
                .ToList();

            // Company Info
            string compName = "Mahalakshmi Logistics Pvt. Ltd.";
            string compAddress = "";
            string compEmail = "";
            string compLogo = "";

            if (list1.Count > 0)
            {
                var c = list1[0];
                compName = GetStrVal(c, new[] { "compname", "companyname", "comp_name", "name" });
                if (string.IsNullOrWhiteSpace(compName)) compName = "Mahalakshmi Logistics Pvt. Ltd.";
                compAddress = GetStrVal(c, new[] { "address1", "compaddress", "address", "address2" });
                compEmail = GetStrVal(c, new[] { "email", "compemail", "Email", "CompanyEmail" });
                compLogo = GetStrVal(c, new[] { "company_logopath", "Company_LogoPath" });
            }

            string monthName = "AUGUST";
            if (int.TryParse(request.fk_monthId, out int monthInt) && monthInt >= 1 && monthInt <= 12)
                monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthInt).ToUpper();
            string monthYearStr = $"{monthName} - {request.fk_yearId}";

            string logoFolderPath = configuration["AppSettings:CompanyLogoFolderPath"] ?? "";
            string logoFilePath = !string.IsNullOrEmpty(compLogo) && !string.IsNullOrEmpty(logoFolderPath) ? Path.Combine(logoFolderPath, compLogo) : "";
            if (!System.IO.File.Exists(logoFilePath) && !string.IsNullOrEmpty(logoFolderPath))
            {
                logoFilePath = Path.Combine(logoFolderPath, "empower.jpg");
            }

            using (var ms = new MemoryStream())
            {
                var doc = new Document(PageSize.A4, 18f, 18f, 18f, 32f);
                var pdfWriter = PdfWriter.GetInstance(doc, ms);

                string arialPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "arial.ttf");
                BaseFont baseFont = System.IO.File.Exists(arialPath)
                    ? BaseFont.CreateFont(arialPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED)
                    : BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                string currSymbol = baseFont.CharExists('₹') ? "₹ " : "Rs. ";
                Font captionFont = new Font(baseFont, 9.5f, Font.BOLD, BaseColor.BLACK);
                pdfWriter.PageEvent = new SalarySlipFooterEvent(captionFont);

                doc.Open();

                Font titleFont = new Font(baseFont, 13f, Font.BOLD, BaseColor.BLACK);
                Font subTitleFont = new Font(baseFont, 8.5f, Font.NORMAL, BaseColor.BLACK);
                Font monthYearFont = new Font(baseFont, 10.5f, Font.BOLD, BaseColor.BLACK);
                Font tableHeaderFont = new Font(baseFont, 9.5f, Font.BOLD, BaseColor.BLACK);
                Font cellLabelBold = new Font(baseFont, 9f, Font.BOLD, BaseColor.BLACK);
                Font cellValNormal = new Font(baseFont, 9f, Font.NORMAL, BaseColor.BLACK);
                Font cellValBold = new Font(baseFont, 9.5f, Font.BOLD, BaseColor.BLACK);
                Font redBoldFont = new Font(baseFont, 9.5f, Font.BOLD, new BaseColor(200, 0, 0));

                PdfPCell PlainCell(string text, Font f, int align = Element.ALIGN_LEFT, float padTop = 3.5f, float padBottom = 3.5f, float padLeft = 2f, float padRight = 2f)
                {
                    return new PdfPCell(new Phrase(text ?? "", f))
                    {
                        HorizontalAlignment = align,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Border = Rectangle.NO_BORDER,
                        PaddingTop = padTop,
                        PaddingBottom = padBottom,
                        PaddingLeft = padLeft,
                        PaddingRight = padRight
                    };
                }

                bool isFirstEmp = true;

                foreach (var emp in list)
                {
                    if (!isFirstEmp)
                    {
                        doc.NewPage();
                    }
                    else
                    {
                        isFirstEmp = false;
                    }

                    // Outer Box Table
                    PdfPTable outerBox = new PdfPTable(1) { WidthPercentage = 100 };

                    // 1. Header Table (3 columns: Logo, Company Info, Month-Year)
                    PdfPTable headerTable = new PdfPTable(3) { WidthPercentage = 100 };
                    headerTable.SetWidths(new float[] { 2.2f, 5.8f, 2.0f });

                    // Evaluate Vendor / Client / Default Company Header
                    bool vendorShow = GetBoolVal(emp, new[] { "Vendor_ShowDetailsOnSalarySlip", "VShowDetailsOnSalarySlip", "ShowDetailsOnSlalrySlip" });
                    bool clientShow = GetBoolVal(emp, new[] { "Client_ShowDetailsOnSalarySlip", "CShowDetailsOnSalarySlip" });

                    string empDisplayName;
                    string empDisplayAddress;
                    string empDisplayEmail;
                    string empDisplayLogo;

                    if (vendorShow)
                    {
                        empDisplayName = GetStrVal(emp, new[] { "Vendor_Name", "VendorName" });
                        if (string.IsNullOrWhiteSpace(empDisplayName)) empDisplayName = compName;
                        empDisplayAddress = GetStrVal(emp, new[] { "Vendor_Address", "VendorAddress" });
                        empDisplayEmail = GetStrVal(emp, new[] { "Vendor_Email", "VendorEmail", "EmailID" });
                        empDisplayLogo = GetStrVal(emp, new[] { "Vendor_LogoPath", "VendorLogoPath" });
                    }
                    else if (clientShow)
                    {
                        empDisplayName = GetStrVal(emp, new[] { "ClientName", "Client_Name" });
                        if (string.IsNullOrWhiteSpace(empDisplayName)) empDisplayName = compName;
                        empDisplayAddress = GetStrVal(emp, new[] { "Client_Address", "ClientAddress", "Address" });
                        empDisplayEmail = GetStrVal(emp, new[] { "Client_Email", "ClientEmail" });
                        empDisplayLogo = GetStrVal(emp, new[] { "Client_LogoPath", "ClientLogoPath" });
                    }
                    else
                    {
                        empDisplayName = compName;
                        empDisplayAddress = compAddress;
                        empDisplayEmail = compEmail;
                        empDisplayLogo = compLogo;
                    }

                    string empLogoFilePath = "";
                    if (!string.IsNullOrEmpty(empDisplayLogo) && !string.IsNullOrEmpty(logoFolderPath))
                    {
                        empLogoFilePath = Path.Combine(logoFolderPath, empDisplayLogo);
                    }
                    if ((string.IsNullOrEmpty(empLogoFilePath) || !System.IO.File.Exists(empLogoFilePath)) && !string.IsNullOrEmpty(logoFilePath))
                    {
                        empLogoFilePath = logoFilePath;
                    }

                    // Logo Cell
                    PdfPCell logoCell = new PdfPCell()
                    {
                        Border = Rectangle.NO_BORDER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        HorizontalAlignment = Element.ALIGN_LEFT,
                        Padding = 2f
                    };
                    if (!string.IsNullOrEmpty(empLogoFilePath) && System.IO.File.Exists(empLogoFilePath))
                    {
                        try
                        {
                            var img = Image.GetInstance(empLogoFilePath);
                            img.ScaleToFit(85f, 40f);
                            img.Alignment = Element.ALIGN_LEFT;
                            logoCell.AddElement(img);
                        }
                        catch { }
                    }
                    headerTable.AddCell(logoCell);

                    // Center Info Cell
                    PdfPCell centerCell = new PdfPCell() { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_CENTER, VerticalAlignment = Element.ALIGN_MIDDLE };
                    Paragraph pCompName = new Paragraph(empDisplayName, titleFont) { Alignment = Element.ALIGN_CENTER };
                    centerCell.AddElement(pCompName);

                    //if (!string.IsNullOrWhiteSpace(empDisplayAddress))
                    //{
                    //    Paragraph pAddr = new Paragraph("Registered Office - : " + empDisplayAddress, subTitleFont) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 3f };
                    //    centerCell.AddElement(pAddr);
                    //}


                    if (vendorShow)
                    {
                        Paragraph pAddr = new Paragraph("Address - : " + empDisplayAddress, subTitleFont) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 3f };
                        centerCell.AddElement(pAddr);
                    }
                    else if (clientShow)
                    {
                        Paragraph pAddr = new Paragraph("Address - : " + empDisplayAddress, subTitleFont) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 3f };
                        centerCell.AddElement(pAddr);
                    }
                    else
                    {
                        Paragraph pAddr = new Paragraph("Registered Office - : " + empDisplayAddress, subTitleFont) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 3f };
                        centerCell.AddElement(pAddr);
                    }





                    if (!string.IsNullOrWhiteSpace(empDisplayEmail))
                    {
                        Paragraph pEmail = new Paragraph("Email: " + empDisplayEmail, subTitleFont) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 2f };
                        centerCell.AddElement(pEmail);
                    }
                    headerTable.AddCell(centerCell);

                    // Right Month-Year Cell
                    PdfPCell rightCell = new PdfPCell(new Phrase(monthYearStr, monthYearFont))
                    {
                        Border = Rectangle.NO_BORDER,
                        HorizontalAlignment = Element.ALIGN_RIGHT,
                        VerticalAlignment = Element.ALIGN_TOP,
                        PaddingTop = 4f
                    };
                    headerTable.AddCell(rightCell);

                    PdfPCell headerContainerCell = new PdfPCell()
                    {
                        Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER,
                        BorderWidth = 1f,
                        BorderWidthBottom = 0.75f,
                        BorderColor = BaseColor.BLACK,
                        PaddingRight = 8f,
                        PaddingLeft = 8f,
                        PaddingTop = 8f,
                        PaddingBottom = 8f
                    };
                    headerContainerCell.AddElement(headerTable);
                    outerBox.AddCell(headerContainerCell);

                    // 2. Employee Info Grid (6 columns: Label1, Colon1, Value1, Label2, Colon2, Value2)
                    PdfPTable empInfoTable = new PdfPTable(6) { WidthPercentage = 100 };
                    empInfoTable.SetWidths(new float[] { 2.1f, 0.3f, 2.7f, 2.0f, 0.3f, 2.8f });

                    void AddInfoRow(string l1, string v1, string l2, string v2)
                    {
                        float padV = 4.5f;
                        empInfoTable.AddCell(PlainCell(l1, cellLabelBold, Element.ALIGN_LEFT, padV, padV, 2f, 2f));
                        empInfoTable.AddCell(PlainCell(string.IsNullOrEmpty(l1) ? "" : ":", cellLabelBold, Element.ALIGN_CENTER, padV, padV, 2f, 4f));
                        empInfoTable.AddCell(PlainCell(v1, cellValNormal, Element.ALIGN_LEFT, padV, padV, 4f, 8f));

                        empInfoTable.AddCell(PlainCell(l2, cellLabelBold, Element.ALIGN_LEFT, padV, padV, 8f, 2f));
                        empInfoTable.AddCell(PlainCell(string.IsNullOrEmpty(l2) ? "" : ":", cellLabelBold, Element.ALIGN_CENTER, padV, padV, 2f, 4f));
                        empInfoTable.AddCell(PlainCell(v2, cellValNormal, Element.ALIGN_LEFT, padV, padV, 4f, 2f));
                    }

                    string empName = GetStrVal(emp, new[] { "EmpName", "EmployeeName", "Emp_Name", "Name" });
                    string empCode = GetStrVal(emp, new[] { "EmpCode", "EmployeeCode", "Emp_Code", "Code" });
                    string designation = GetStrVal(emp, new[] { "Designation", "DesignationName", "Desig" });
                    string department = GetStrVal(emp, new[] { "Department", "DepartmentName", "Dept" });
                    string grade = GetStrVal(emp, new[] { "FatherName", "FatherName" });
                    if (string.IsNullOrWhiteSpace(grade)) grade = "";
                    string doj = FormatDate(GetStrVal(emp, new[] { "JoiningDate", "DOJ", "DateOfJoining" }));
                    string bankName = GetStrVal(emp, new[] { "BankName", "Bank", "Bank_Name" });
                    string dob = FormatDate(GetStrVal(emp, new[] { "DOB", "DateOfBirth", "BirthDate" }));
                    string accNo = GetStrVal(emp, new[] { "AccountNo", "AccNo", "BankAcNo", "Account_No", "AccountNumber" });
                    string uanNo = GetStrVal(emp, new[] { "UANNo", "UAN", "Uan_No", "Uan" });
                    string panNo = GetStrVal(emp, new[] { "PanNo", "PAN", "Pan_No", "Pan" });
                    string esiNo = GetStrVal(emp, new[] { "ESINo", "ESI", "Esi_No", "Esi" });
                    string aadharNo = GetStrVal(emp, new[] { "AadharNo", "Aadhar", "AadhaarNo", "Aadhaar", "AdharNo" });
                    string cityName = GetStrVal(emp, new[] { "CityName", "cityname", "City" });

                    AddInfoRow("Employee Name:", empName, "Designation", designation);
                    AddInfoRow("Employee Code:", empCode, "City", cityName);
                    AddInfoRow("Father Name:", grade, "Department", department);
                    AddInfoRow("Bank Name:", bankName, "Date of Joining", doj);
                    AddInfoRow("Account No.:", accNo, "Date of Birth", dob);
                    AddInfoRow("Pan No.:", panNo, "UAN No.", uanNo);
                    AddInfoRow("Aadhar No.:", aadharNo, "ESI No.", string.IsNullOrWhiteSpace(esiNo) ? "0" : esiNo);

                    PdfPCell empInfoContainerCell = new PdfPCell()
                    {
                        Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                        BorderWidth = 1f,
                        BorderWidthBottom = 0.75f,
                        BorderColor = BaseColor.BLACK,
                        PaddingLeft = 8f,
                        PaddingRight = 8f,
                        PaddingTop = 8f,
                        PaddingBottom = 8f
                    };
                    empInfoContainerCell.AddElement(empInfoTable);
                    outerBox.AddCell(empInfoContainerCell);

                    // 3. Earnings & Deductions Table
                    var earnLines = new List<(string label, decimal rate, decimal amt, decimal arr)>();
                    foreach (var h in earningHeadList)
                    {
                        decimal amt = GetVal(emp, h.ShortDesc);
                        decimal rate = GetVal(emp, "Rate_" + h.ShortDesc);
                        decimal arr = GetArrearVal(emp, h.ShortDesc);
                        if (amt != 0 || rate != 0 || arr != 0)
                        {
                            earnLines.Add((h.Description, rate, amt, arr));
                        }
                    }

                    var dedLines = new List<(string label, decimal amt)>();
                    foreach (var h in deductionHeadList)
                    {
                        decimal amt = GetVal(emp, h.ShortDesc);
                        if (amt != 0)
                        {
                            dedLines.Add((h.Description, amt));
                        }
                    }

                    decimal netPay = GetVal(emp, "NetPay");
                    decimal rowRateSum = earnLines.Sum(e => e.rate);
                    decimal rowAmtSum = earnLines.Sum(e => e.amt);
                    decimal rowArrSum = earnLines.Sum(e => e.arr);
                    decimal rowDedSum = dedLines.Sum(d => d.amt);
                    if (netPay == 0 && (rowAmtSum > 0 || rowDedSum > 0))
                    {
                        netPay = (rowAmtSum + rowArrSum) - rowDedSum;
                    }

                    decimal paidDays = GetVal(emp, "PaidDays");
                    /*if (paidDays == 0)*/
                    decimal wokingdays = GetVal(emp, "WorkingDays");
                    decimal lwpDays = GetVal(emp, "LWP");

                    // 3. Salary Table Header Grid
                    PdfPTable tableHeaderGrid = new PdfPTable(6) { WidthPercentage = 100 };
                    tableHeaderGrid.SetWidths(new float[] { 2.6f, 1.2f, 1.3f, 1.1f, 2.6f, 1.2f });

                    PdfPCell HdrCell(string txt, int align, float padL = 2f, float padR = 2f)
                    {
                        return new PdfPCell(new Phrase(txt, tableHeaderFont))
                        {
                            HorizontalAlignment = align,
                            VerticalAlignment = Element.ALIGN_MIDDLE,
                            Border = Rectangle.NO_BORDER,
                            PaddingTop = 4.5f,
                            PaddingBottom = 4.5f,
                            PaddingLeft = padL,
                            PaddingRight = padR
                        };
                    }

                    tableHeaderGrid.AddCell(HdrCell("Fixed", Element.ALIGN_LEFT, 2f, 2f));
                    tableHeaderGrid.AddCell(HdrCell("Rate", Element.ALIGN_RIGHT, 2f, 2f));
                    tableHeaderGrid.AddCell(HdrCell("Earnings", Element.ALIGN_RIGHT, 2f, 2f));
                    tableHeaderGrid.AddCell(HdrCell("Arrears", Element.ALIGN_RIGHT, 2f, 6f));
                    tableHeaderGrid.AddCell(HdrCell("Deduction", Element.ALIGN_LEFT, 18f, 2f));
                    tableHeaderGrid.AddCell(HdrCell("Amount", Element.ALIGN_RIGHT, 2f, 2f));

                    PdfPCell tableHeaderContainerCell = new PdfPCell()
                    {
                        Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                        BorderWidth = 1f,
                        BorderWidthBottom = 0.75f,
                        BorderColor = BaseColor.BLACK,
                        PaddingLeft = 8f,
                        PaddingRight = 8f,
                        PaddingTop = 0f,
                        PaddingBottom = 0f
                    };
                    tableHeaderContainerCell.AddElement(tableHeaderGrid);
                    outerBox.AddCell(tableHeaderContainerCell);

                    // 4. Data Rows Grid
                    PdfPTable dataRowsGrid = new PdfPTable(6) { WidthPercentage = 100 };
                    dataRowsGrid.SetWidths(new float[] { 2.6f, 1.2f, 1.3f, 1.1f, 2.6f, 1.2f });

                    float rowPadV = 4.0f;
                    int maxLines = Math.Max(earnLines.Count, dedLines.Count);
                    for (int r = 0; r < maxLines; r++)
                    {
                        if (r < earnLines.Count)
                        {
                            var e = earnLines[r];
                            dataRowsGrid.AddCell(PlainCell(e.label, cellValNormal, Element.ALIGN_LEFT, rowPadV, rowPadV, 2f, 2f));
                            dataRowsGrid.AddCell(PlainCell(e.rate > 0 ? e.rate.ToString("0.##") : "", cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV, 2f, 2f));
                            dataRowsGrid.AddCell(PlainCell(e.amt > 0 ? e.amt.ToString("0.##") : "0", cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV, 2f, 2f));
                            dataRowsGrid.AddCell(PlainCell(e.arr > 0 ? e.arr.ToString("0.##") : "0", cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV, 2f, 6f));
                        }
                        else
                        {
                            dataRowsGrid.AddCell(PlainCell("", cellValNormal, Element.ALIGN_LEFT, rowPadV, rowPadV));
                            dataRowsGrid.AddCell(PlainCell("", cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV));
                            dataRowsGrid.AddCell(PlainCell("", cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV));
                            dataRowsGrid.AddCell(PlainCell("", cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV));
                        }

                        if (r < dedLines.Count)
                        {
                            var d = dedLines[r];
                            dataRowsGrid.AddCell(PlainCell(d.label, cellValNormal, Element.ALIGN_LEFT, rowPadV, rowPadV, 18f, 2f));
                            dataRowsGrid.AddCell(PlainCell(d.amt.ToString("0.##"), cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV, 2f, 2f));
                        }
                        else
                        {
                            dataRowsGrid.AddCell(PlainCell("", cellValNormal, Element.ALIGN_LEFT, rowPadV, rowPadV));
                            dataRowsGrid.AddCell(PlainCell("", cellValNormal, Element.ALIGN_RIGHT, rowPadV, rowPadV));
                        }
                    }

                    PdfPCell dataRowsContainerCell = new PdfPCell()
                    {
                        Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                        BorderWidth = 1f,
                        BorderWidthBottom = 0.75f,
                        BorderColor = BaseColor.BLACK,
                        PaddingLeft = 8f,
                        PaddingRight = 8f,
                        PaddingTop = 4f,
                        PaddingBottom = 4f
                    };
                    dataRowsContainerCell.AddElement(dataRowsGrid);
                    outerBox.AddCell(dataRowsContainerCell);

                    // 5. Total Row Grid
                    PdfPTable totalGrid = new PdfPTable(6) { WidthPercentage = 100 };
                    totalGrid.SetWidths(new float[] { 2.6f, 1.2f, 1.3f, 1.1f, 2.6f, 1.2f });

                    PdfPCell TotCell(string txt, Font f, int align, float padL = 2f, float padR = 2f)
                    {
                        return new PdfPCell(new Phrase(txt, f))
                        {
                            HorizontalAlignment = align,
                            VerticalAlignment = Element.ALIGN_MIDDLE,
                            Border = Rectangle.NO_BORDER,
                            PaddingTop = 4.5f,
                            PaddingBottom = 4.5f,
                            PaddingLeft = padL,
                            PaddingRight = padR
                        };
                    }

                    totalGrid.AddCell(TotCell("Total", cellValBold, Element.ALIGN_LEFT, 2f, 2f));
                    totalGrid.AddCell(TotCell(rowRateSum > 0 ? currSymbol + rowRateSum.ToString("0.##") : "", cellValBold, Element.ALIGN_RIGHT, 2f, 2f));
                    totalGrid.AddCell(TotCell(currSymbol + (rowAmtSum > 0 ? rowAmtSum.ToString("0.##") : "0"), cellValBold, Element.ALIGN_RIGHT, 2f, 2f));
                    totalGrid.AddCell(TotCell("", cellValBold, Element.ALIGN_RIGHT, 2f, 6f));
                    totalGrid.AddCell(TotCell("Total Deductions:", cellValBold, Element.ALIGN_LEFT, 18f, 2f));
                    totalGrid.AddCell(TotCell(currSymbol + (rowDedSum > 0 ? rowDedSum.ToString("0.##") : "0"), cellValBold, Element.ALIGN_RIGHT, 2f, 2f));

                    PdfPCell totalContainerCell = new PdfPCell()
                    {
                        Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                        BorderWidth = 1f,
                        BorderWidthBottom = 0.5f,
                        BorderColor = BaseColor.BLACK,
                        PaddingLeft = 8f,
                        PaddingRight = 8f,
                        PaddingTop = 0f,
                        PaddingBottom = 0f
                    };
                    totalContainerCell.AddElement(totalGrid);
                    outerBox.AddCell(totalContainerCell);

                    // 6. Gross Total & Net Amount Payable Row
                    PdfPTable grossNetGrid = new PdfPTable(2) { WidthPercentage = 100 };
                    grossNetGrid.SetWidths(new float[] { 3.9f, 6.1f });

                    PdfPTable grossSubTable = new PdfPTable(2) { WidthPercentage = 100 };
                    grossSubTable.SetWidths(new float[] { 1.4f, 2.5f });
                    grossSubTable.AddCell(new PdfPCell(new Phrase("Gross Total", cellValBold)) { Border = Rectangle.NO_BORDER, PaddingTop = 5f, PaddingBottom = 5f, PaddingLeft = 2f, HorizontalAlignment = Element.ALIGN_LEFT, VerticalAlignment = Element.ALIGN_MIDDLE });
                    grossSubTable.AddCell(new PdfPCell(new Phrase(currSymbol + (rowAmtSum > 0 ? rowAmtSum.ToString("0.##") : "0"), cellValBold)) { Border = Rectangle.NO_BORDER, PaddingTop = 5f, PaddingBottom = 5f, PaddingRight = 6f, HorizontalAlignment = Element.ALIGN_RIGHT, VerticalAlignment = Element.ALIGN_MIDDLE });

                    PdfPTable netSubTable = new PdfPTable(3) { WidthPercentage = 100 };
                    netSubTable.SetWidths(new float[] { 2.3f, 1.7f, 2.1f });

                    netSubTable.AddCell(new PdfPCell(new Phrase("")) { Border = Rectangle.NO_BORDER, Padding = 0f });

                    netSubTable.AddCell(new PdfPCell(new Phrase("Net Payable", cellValBold)) { Border = Rectangle.NO_BORDER, PaddingTop = 5f, PaddingBottom = 5f, PaddingLeft = 18f, HorizontalAlignment = Element.ALIGN_LEFT, VerticalAlignment = Element.ALIGN_MIDDLE });
                    netSubTable.AddCell(new PdfPCell(new Phrase(currSymbol + (netPay > 0 ? netPay.ToString("0.##") : "0"), cellValBold)) { Border = Rectangle.NO_BORDER, PaddingTop = 5f, PaddingBottom = 5f, PaddingRight = 2f, HorizontalAlignment = Element.ALIGN_RIGHT, VerticalAlignment = Element.ALIGN_MIDDLE });

                    grossNetGrid.AddCell(new PdfPCell(grossSubTable) { Border = Rectangle.NO_BORDER, Padding = 0f });
                    grossNetGrid.AddCell(new PdfPCell(netSubTable) { Border = Rectangle.NO_BORDER, Padding = 0f });

                    PdfPCell grossNetContainerCell = new PdfPCell()
                    {
                        Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                        BorderWidth = 1f,
                        BorderWidthBottom = 0.75f,
                        BorderColor = BaseColor.BLACK,
                        PaddingLeft = 8f,
                        PaddingRight = 8f,
                        PaddingTop = 2f,
                        PaddingBottom = 2f
                    };
                    grossNetContainerCell.AddElement(grossNetGrid);
                    outerBox.AddCell(grossNetContainerCell);

                    // 7. Words & Attendance Row
                    PdfPTable footerGrid = new PdfPTable(1) { WidthPercentage = 100 };

                    string amountWords = $"Rupees {ConvertIndianNumberToWordsESIChallan((long)netPay)} Only";
                    PdfPCell wordsCell = new PdfPCell(new Phrase(amountWords, cellValBold))
                    {
                        Border = Rectangle.NO_BORDER,
                        PaddingTop = 8f,
                        PaddingBottom = 6f,
                        PaddingLeft = 2f
                    };
                    footerGrid.AddCell(wordsCell);

                    PdfPTable daysGrid = new PdfPTable(3) { WidthPercentage = 100 };
                    daysGrid.SetWidths(new float[] { 3.5f, 4f, 2.5f });

                    Phrase MonthPhrase = new Phrase();
                    MonthPhrase.Add(new Chunk("Month Days : ", cellValNormal));
                    MonthPhrase.Add(new Chunk(wokingdays.ToString("0.##"), wokingdays > 0 ? cellLabelBold : cellLabelBold));

                    daysGrid.AddCell(new PdfPCell(MonthPhrase)
                    {
                        Border = Rectangle.NO_BORDER,
                        PaddingTop = 4f,
                        PaddingBottom = 6f,
                        PaddingLeft = 2f
                    });

                    Phrase PaiddayPhrase = new Phrase();
                    PaiddayPhrase.Add(new Chunk("Paid Days : ", cellValNormal));
                    PaiddayPhrase.Add(new Chunk(paidDays.ToString("0.##"), paidDays > 0 ? cellLabelBold : cellLabelBold));

                    daysGrid.AddCell(new PdfPCell(PaiddayPhrase)
                    {
                        Border = Rectangle.NO_BORDER,
                        PaddingTop = 4f,
                        PaddingBottom = 6f,
                        PaddingLeft = 2f
                    });


                    Phrase lwpPhrase = new Phrase();
                    lwpPhrase.Add(new Chunk("Lwp Days : ", cellValNormal));
                    lwpPhrase.Add(new Chunk(lwpDays.ToString("0.##"), lwpDays > 0 ? cellLabelBold : cellLabelBold));

                    daysGrid.AddCell(new PdfPCell(lwpPhrase)
                    {
                        Border = Rectangle.NO_BORDER,
                        PaddingTop = 4f,
                        PaddingBottom = 6f,
                        PaddingLeft = 18f
                    });
                    footerGrid.AddCell(new PdfPCell(daysGrid) { Border = Rectangle.NO_BORDER, Padding = 0f });

                    // 8. Leave Details Section (rendered only if leave data is present; hidden if null or empty)
                    List<dynamic> empLeaves;
                    if (leave == null || !leave.Any())
                    {
                        empLeaves = new List<dynamic>();
                    }
                    else
                    {
                        empLeaves = leave.Where(l =>
                        {
                            if (l == null) return false;

                            // 1. Direct empcode match if leave record contains empcode
                            string lCode = GetStrVal(l, new[] { "empcode", "EmpCode", "EmployeeCode", "Emp_Code", "Code" });
                            if (!string.IsNullOrEmpty(lCode) && !string.IsNullOrEmpty(empCode))
                            {
                                if (string.Equals(lCode, empCode, StringComparison.OrdinalIgnoreCase))
                                    return true;
                            }

                            // 2. Identifier match (fk_empid in leave vs EmpId/empcode in emp)
                            string lId = GetStrVal(l, new[] { "fk_empid", "fk_empId", "empid", "EmpId", "EmployeeId", "emp_id" });
                            if (!string.IsNullOrEmpty(lId))
                            {
                                var empKeys = new[]
                                {
                         GetStrVal(emp, new[] { "EmpId", "empid", "fk_empid", "fk_empId", "EmployeeId", "emp_id", "Id" }),
                         empCode,
                         GetStrVal(emp, new[] { "EmpCode", "empcode", "EmployeeCode", "Emp_Code", "Code", "EmpCodeManual" })
                     };

                                foreach (var k in empKeys)
                                {
                                    if (!string.IsNullOrWhiteSpace(k))
                                    {
                                        if (string.Equals(lId, k, StringComparison.OrdinalIgnoreCase))
                                            return true;

                                        if (lId.EndsWith("-" + k, StringComparison.OrdinalIgnoreCase) || k.EndsWith("-" + lId, StringComparison.OrdinalIgnoreCase))
                                            return true;
                                    }
                                }
                            }

                            return false;
                        }).ToList();
                    }

                    // Filter out any blank leave entries
                    empLeaves = empLeaves.Where(l =>
                    {
                        if (l == null) return false;
                        string lt = GetStrVal(l, new[] { "leavetype", "LeaveType", "leave_type", "Leave_Type", "leavetypename", "LeaveTypeName", "LeaveName", "leavename" });
                        return !string.IsNullOrWhiteSpace(lt);
                    }).ToList();

                    if (empLeaves.Count > 0)
                    {
                        // Add Leave Details heading inside footerGrid
                        PdfPCell leaveTitleCell = new PdfPCell(new Phrase("Leave Details", cellValBold))
                        {
                            Border = Rectangle.NO_BORDER,
                            PaddingTop = 14f,
                            PaddingBottom = 6f,
                            PaddingLeft = 2f
                        };
                        footerGrid.AddCell(leaveTitleCell);

                        // Line 1: Full-width line above Leave Type header (bottom border of footerContainerCell)
                        PdfPCell footerContainerCell = new PdfPCell()
                        {
                            Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                            BorderWidth = 1f,
                            BorderWidthBottom = 0.75f,
                            BorderColor = BaseColor.BLACK,
                            PaddingLeft = 8f,
                            PaddingRight = 8f,
                            PaddingTop = 0f,
                            PaddingBottom = 4f
                        };
                        footerContainerCell.AddElement(footerGrid);
                        outerBox.AddCell(footerContainerCell);

                        // Leave Header Grid: Widths match Gross Total / Deductions layout for exact vertical alignment
                        PdfPTable leaveHeaderGrid = new PdfPTable(4) { WidthPercentage = 100 };
                        leaveHeaderGrid.SetWidths(new float[] { 3.2f, 3.0f, 2.6f, 1.2f });

                        PdfPCell LeaveHdrCell(string txt, float padL = 2f)
                        {
                            return new PdfPCell(new Phrase(txt, tableHeaderFont))
                            {
                                HorizontalAlignment = Element.ALIGN_LEFT,
                                VerticalAlignment = Element.ALIGN_MIDDLE,
                                Border = Rectangle.NO_BORDER,
                                PaddingTop = 4.5f,
                                PaddingBottom = 4.5f,
                                PaddingLeft = padL,
                                PaddingRight = 2f
                            };
                        }

                        leaveHeaderGrid.AddCell(LeaveHdrCell("Leave Type", 2f));
                        leaveHeaderGrid.AddCell(LeaveHdrCell("Opening", 2f));
                        leaveHeaderGrid.AddCell(LeaveHdrCell("Availed", 18f));
                        leaveHeaderGrid.AddCell(LeaveHdrCell("Balance", 2f));

                        // Line 2: Full-width line below Leave Type header
                        PdfPCell leaveHdrContainerCell = new PdfPCell()
                        {
                            Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                            BorderWidth = 1f,
                            BorderWidthBottom = 0.75f,
                            BorderColor = BaseColor.BLACK,
                            PaddingLeft = 8f,
                            PaddingRight = 8f,
                            PaddingTop = 0f,
                            PaddingBottom = 0f
                        };
                        leaveHdrContainerCell.AddElement(leaveHeaderGrid);
                        outerBox.AddCell(leaveHdrContainerCell);

                        // Leave Data Grid
                        PdfPTable leaveDataGrid = new PdfPTable(4) { WidthPercentage = 100 };
                        leaveDataGrid.SetWidths(new float[] { 3.2f, 3.0f, 2.6f, 1.2f });

                        Func<string, string> formatLeaveVal = (val) =>
                        {
                            if (string.IsNullOrWhiteSpace(val)) return "0";
                            if (decimal.TryParse(val, out decimal d)) return d.ToString("0.##");
                            return val;
                        };

                        for (int li = 0; li < empLeaves.Count; li++)
                        {
                            var l = empLeaves[li];
                            string lt = GetStrVal(l, new[] { "leavetype", "LeaveType", "leave_type", "Leave_Type", "leavetypename", "LeaveTypeName", "LeaveName", "leavename" });
                            string op = formatLeaveVal(GetStrVal(l, new[] { "opbal", "OpBal", "op_bal", "opening", "Opening", "OpeningBalance", "openingbalance", "open_bal" }));
                            string av = formatLeaveVal(GetStrVal(l, new[] { "availed", "Availed", "AvailedLeaves", "taken", "Taken", "used", "Used" }));
                            string bal = formatLeaveVal(GetStrVal(l, new[] { "balance", "Balance", "bal", "Bal", "clbal", "ClBal", "ClosingBalance", "closingbalance", "closing_bal", "close_bal" }));

                            PdfPCell LeaveDataCell(string txt, float padL = 2f)
                            {
                                return new PdfPCell(new Phrase(txt ?? "", cellValNormal))
                                {
                                    HorizontalAlignment = Element.ALIGN_LEFT,
                                    VerticalAlignment = Element.ALIGN_MIDDLE,
                                    Border = Rectangle.NO_BORDER,
                                    PaddingTop = 4f,
                                    PaddingBottom = 4f,
                                    PaddingLeft = padL,
                                    PaddingRight = 2f
                                };
                            }

                            leaveDataGrid.AddCell(LeaveDataCell(lt, 2f));
                            leaveDataGrid.AddCell(LeaveDataCell(op, 2f));
                            leaveDataGrid.AddCell(LeaveDataCell(av, 18f));
                            leaveDataGrid.AddCell(LeaveDataCell(bal, 2f));
                        }

                        // Line 3: Bottom border of outer box (closes the box cleanly after leave data without extra trailing gap)
                        PdfPCell leaveDataContainerCell = new PdfPCell()
                        {
                            Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                            BorderWidth = 1f,
                            BorderColor = BaseColor.BLACK,
                            PaddingLeft = 8f,
                            PaddingRight = 8f,
                            PaddingTop = 0f,
                            PaddingBottom = 4f
                        };
                        leaveDataContainerCell.AddElement(leaveDataGrid);
                        outerBox.AddCell(leaveDataContainerCell);
                    }
                    else
                    {
                        // When no leaves, close footer with standard bottom border
                        PdfPCell footerContainerCell = new PdfPCell()
                        {
                            Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                            BorderWidth = 1f,
                            BorderColor = BaseColor.BLACK,
                            PaddingLeft = 8f,
                            PaddingRight = 8f,
                            PaddingTop = 0f,
                            PaddingBottom = 8f
                        };
                        footerContainerCell.AddElement(footerGrid);
                        outerBox.AddCell(footerContainerCell);
                    }

                    doc.Add(outerBox);
                }

                doc.Close();
                return ms.ToArray();
            }
        }
        private class SalarySlipFooterEvent : PdfPageEventHelper
        {
            private readonly Font _font;
            public SalarySlipFooterEvent(Font font)
            {
                _font = font;
            }

            public override void OnEndPage(PdfWriter writer, Document document)
            {
                base.OnEndPage(writer, document);
                ColumnText.ShowTextAligned(
                    writer.DirectContent,
                    Element.ALIGN_CENTER,
                    new Phrase("\"This is computer generated pay statement and not required signature\"", _font),
                    (document.Left + document.Right) / 2,
                    16f,
                    0
                );
            }
        }


        // end 

        [HttpPost("GetPdf")]
        [Authorize]
        public async Task<IActionResult> GetPdf([FromBody] ReportModelRequest reportFilter)
        {
            //var apiBaseUrl = "http://103.13.97.213/CrystalReport";
            var apiBaseUrl = configuration["CrystalReportSettings:Domain"];

            var externalApiUrl = $"{apiBaseUrl}/api/ReportApi/getpdf";
            //


            HttpClient _httpClient = new HttpClient();
            string reportname = "";
            try
            {
                var RequestJson1 = JsonConvert.SerializeObject(reportFilter);

                var jsonContent = new StringContent(RequestJson1, Encoding.UTF8, "application/json");

                if (reportFilter.ExportType == 36)
                {
                    reportname = "SAL_PFChallan_Monthly";
                }
                else if (reportFilter.ExportType == 37)
                {
                    reportname = "SAL_ESIChallan_Monthly";
                }
                else if (reportFilter.ExportType == 11)
                {
                    reportname = "SAL_LWFStatement_Monthly";
                }
                else if (reportFilter.ExportType == 39)
                {
                    reportname = "SAL_PFForm10";
                }
                else if (reportFilter.ExportType == 40)
                {
                    reportname = "SAL_PFForm5";

                }
                else if (reportFilter.ExportType == 41)
                {
                    reportname = "SAL_PF-Form12A_Monthly";

                }
                else if (reportFilter.ExportType == 42)
                {
                    reportname = "SAL_PFStatementDetail_Monthly";

                }
                else if (reportFilter.ExportType == 43)
                {
                    reportname = "SAL_ESIStatementDetail_Monthly";

                }
                else if (reportFilter.ExportType == 12)
                {
                    reportname = "SAL_PTax_Monthly";
                }
                else if (reportFilter.ExportType == 5)
                {
                    reportname = "SAL_PFStatement_Monthly";
                }
                else if (reportFilter.ExportType == 6)
                {
                    reportname = "SAL_ESIStatement_Monthly";
                }

                else if (reportFilter.ExportType == 100)
                {
                    var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                    var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                    reportFilter.EmpCode = decryptedUserId;
                    reportFilter.fk_companyid = decryptedCompanyId;

                    reportname = "TCCI";
                }
                reportname = reportname + reportFilter.fk_monthId + "_" + reportFilter.fk_yearId;

                var response = await _httpClient.PostAsync(externalApiUrl, jsonContent);

                if (response.IsSuccessStatusCode)
                {
                    var fileStream = await response.Content.ReadAsStreamAsync();
                    return new FileStreamResult(fileStream, "application/pdf")
                    {
                        FileDownloadName = $"{reportname}.pdf"
                    };
                }
                else
                {
                    return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
                }
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, $"An error occurred while calling the external API: {ex.Message}");
            }
        }

        [HttpPost("GetCanteenExcel")]
        [Authorize]
        public async Task<IActionResult> GetCanteenExcel([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            string reportname = "Daily Consumption Report";
            string reportheader = "";

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                var employees = await exportReportRepository.ViewCanteenReportlistAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                foreach (var item in employees)
                {
                    reportheader = "Daily Consumption Report of Lunch : On the day of " + item?.FromDate;
                    break;
                }


                using (var workbook = new ClosedXML.Excel.XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Report");
                    // 👉 Title row spanning across 7 columns
                    worksheet.Range(1, 1, 1, 7).Merge();
                    worksheet.Cell(1, 1).Value = "TCCI MANUFACTURING INDIAN PVT LTD";
                    worksheet.Cell(1, 1).Style.Alignment.Horizontal = ClosedXML.Excel.XLAlignmentHorizontalValues.Center;
                    worksheet.Cell(1, 1).Style.Font.Bold = true;
                    worksheet.Row(1).Height = 20;

                    // 👉 Subtitle row
                    worksheet.Range(2, 1, 2, 7).Merge();
                    worksheet.Cell(2, 1).Value = reportheader;
                    worksheet.Cell(2, 1).Style.Alignment.Horizontal = ClosedXML.Excel.XLAlignmentHorizontalValues.Center;
                    worksheet.Cell(2, 1).Style.Font.Bold = true;

                    // 👉 Column headers start from row 4
                    worksheet.Cell(4, 1).Value = "S. No.";
                    worksheet.Cell(4, 2).Value = "Employee Code";
                    worksheet.Cell(4, 3).Value = "Employee Name";
                    worksheet.Cell(4, 4).Value = "Department";
                    worksheet.Cell(4, 5).Value = "No Of Units";
                    worksheet.Cell(4, 6).Value = "Time";
                    worksheet.Cell(4, 7).Value = "Amount";

                    // 👉 Style headers
                    var headerRange = worksheet.Range(4, 1, 4, 7);
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;
                    headerRange.Style.Alignment.Horizontal = ClosedXML.Excel.XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Border.OutsideBorder = ClosedXML.Excel.XLBorderStyleValues.Thin;
                    headerRange.Style.Border.InsideBorder = ClosedXML.Excel.XLBorderStyleValues.Thin;

                    int row = 5;
                    int sno = 1;
                    foreach (var item in employees)
                    {
                        worksheet.Cell(row, 1).Value = sno.ToString();
                        worksheet.Cell(row, 2).Value = item?.empcode;
                        worksheet.Cell(row, 3).Value = item?.empname;
                        worksheet.Cell(row, 4).Value = item?.Department;
                        worksheet.Cell(row, 5).Value = item?.NoOfUnits;
                        worksheet.Cell(row, 6).Value = item?.Times;
                        worksheet.Cell(row, 7).Value = item?.Amount;
                        row = row + 1;
                        sno = sno + 1;
                    }

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        stream.Position = 0;

                        return new FileStreamResult(stream,
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                        {
                            FileDownloadName = $"{reportname}.xlsx"
                        };
                    }
                }
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, $"An error occurred while calling the external API: {ex.Message}");
            }
        }



        [HttpPost("PayrollDashboradlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> PayrollDashboradlistAsync([FromBody] payrolldashoardrequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var employees = await exportReportRepository.GetPayrollADashboardAsync(request.month, request.year, decryptedUserId);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Payroll dashboard list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }
        //note add this  in ExportReport   controller     

        // for the employee report and download excel

        [HttpPost("ViewEmployeeReportlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewEmployeeReportlist([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var (totalCount, employees) = await exportReportRepository.ViewEmployeeReportAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpPost("downloadViewEmployeeReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewEmployeeReportlist(
     string? reportName,
     [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            //request.fk_companyid = decryptedCompanyId;

            var (totalCount, dynamicResults) = await exportReportRepository.ViewEmployeeReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
    columnsToSum: new[] { "ArrearAmount", "LWP", "OTHrs", "Rate_Basic", "Rate_HRA", "Rate_DA", "Rate_Other", "Rate_CEA", "Rate_SpecialAllowance", "Rate_UniformAllowance", "Rate_OTPay", "Rate_Incentive", "Rate_BonusPay", "Rate_NoticePay", "RateGross", "Basic", "HRA", "DA", "Other", "CEA", "SpecialAllowance", "UniformAllowance", "OTPay", "Incentive", "BonusPay", "NoticePay", "EarnGross", "LTA", "BooksPeriodicals", "DriverSalary", "FuelReimbursement", "TelephoneReimbursement", "Helperallowance", "GrossTotal", "Advance", "Canteen", "NoticeAdj", "Loan", "ESI", "AdvanceSalary", "PF", "VolPF", "LWF", "ProfTax", "IT", "TotalDeductions", "NetPay", "Current Salary", "Previous Salary", "OTHours", "OTGross", "OT", "Salary for EPF", "Salary for EPS", "Salary for EDLI", "Admin Charges", "Employee's Cont", "Employer's Cont-EPS(8.33%) A/C-10", "Admn. Charges on EDLI A/C-22", "Total Contribution", "Wages", "ESI (1.75%)", "ESI (4.75%)" }
);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }

        [HttpPost("ViewAttendanceReportlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewAttendanceReportlistAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var employees = await exportReportRepository.ViewAttendanceReportAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                // added for pagiantion
                //if (request.paginationRequired == true && request.ExportType == 1)
                //{
                //    var employeeList = employees.ToList();

                //    int totalCount = Convert.ToInt32(
                //        ((IDictionary<string, object>)employeeList.First()).Values.First());

                //    var data = employeeList.Skip(1).ToList();

                //    modelResponse.IsSuccess = true;
                //    modelResponse.Message = "Data list retrieved successfully.";
                //    modelResponse.Data = data;
                //    modelResponse.TotalCount = totalCount;   // add this field to ModelResponse if not present
                //    modelResponse.StatusCode = 200;
                //    return Ok(modelResponse);
                //}
                if (request.paginationRequired == true && request.ExportType == 1)
                {
                    var employeeList = employees.ToList();

                    int totalCount = 0;
                    var firstRow = (IDictionary<string, object>)employeeList.First();
                    if (firstRow.ContainsKey("TotalCount"))
                        totalCount = Convert.ToInt32(firstRow["TotalCount"]);

                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Data list retrieved successfully.";
                    modelResponse.Data = employeeList;
                    modelResponse.TotalCount = totalCount;
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }

        }





        // added by  pp  9/10/2025 for download export attendance  report

        [HttpPost("downloadViewAttendanceReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewAttendanceReportlist(
 string? reportName,
 [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            //request.fk_companyid = decryptedCompanyId;

            var dynamicResults = await exportReportRepository.ViewAttendanceReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateAttendanceExcelReportAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId)
    //columnsToSum: new[] { "Amount" } // which columns to total

);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }







        //        [HttpPost("ViewLeaveReportlist")]
        //        [Authorize]  // Secured endpoint
        //        public async Task<IActionResult> ViewLeaveReportlistAsync([FromBody] ReportModelRequest request)
        //        {
        //            ModelResponse modelResponse = new ModelResponse();

        //            try
        //            {
        //                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
        //                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
        //                request.fk_companyid = decryptedCompanyId;

        //                var employees = await exportReportRepository.ViewLeaveReportAsync(request);

        //                if (employees == null || !employees.Any())
        //                {
        //                    modelResponse.IsSuccess = false;
        //                    modelResponse.Message = "No records found.";
        //                    modelResponse.StatusCode = 400;
        //                    return Ok(modelResponse);
        //                }

        //                modelResponse.IsSuccess = true;
        //                modelResponse.Message = "Data list retrieved successfully.";
        //                modelResponse.Data = employees;
        //                modelResponse.StatusCode = 200;
        //                return Ok(modelResponse);
        //            }
        //            catch (Exception ex)
        //            {
        //                modelResponse.IsSuccess = false;
        //                modelResponse.Message = "An error occurred: " + ex.Message;
        //                modelResponse.StatusCode = 500;
        //                return Ok(modelResponse);
        //            }
        //        }
        //        //added by pp 8/10/2025 for the leave export
        //        [HttpPost("downloadViewLeaveReportlist")]
        //        [Authorize]
        //        public async Task<IActionResult> downloadViewLeaveReportlist(
        //   string? reportName,
        //   [FromBody] ReportModelRequest request)
        //        {
        //            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
        //            request.fk_companyid = decryptedCompanyId;

        //            var dynamicResults = await exportReportRepository.ViewLeaveReportAsync(request);

        //            var results = dynamicResults
        //                .Select(item => (IDictionary<string, object>)item)
        //                .ToList();

        //            if (!results.Any())
        //                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

        //            // Build date header dynamically
        //            string? dateHeaderText = null;
        //            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
        //            {
        //                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
        //            }
        //            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
        //            {
        //                int month = int.Parse(request.fk_monthId);
        //                int year = int.Parse(request.fk_yearId);

        //                var selectedMonth = new DateTime(year, month, 1);
        //                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
        //            }

        //            // else ->no date header




        //            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
        //    reportName: request.ReportName ?? reportName ?? "Report",
        //    results: results,
        //    contractorName: request.ContractorName,
        //    dateHeaderText: dateHeaderText,
        //    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId)

        //);

        //            return File(fileBytes,
        //                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        //        }






        // add this in export repo cotroller


        [HttpPost("ViewBillFormAsync")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewBillReportlistAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                request.fk_companyid = decryptedCompanyId;



                var (totalCount, totals, employees, invoiceDetails) = await exportReportRepository.ViewBillFormAsync(request);

                if (employees == null || !employees.Any())
                {
                    return Ok(new
                    {
                        IsSuccess = false,
                        Message = "No records found.",
                        StatusCode = 400,
                        Data = employees,
                        TotalCount = totalCount,
                        Totals = totals,
                        InvoiceDetails = invoiceDetails
                    });
                }

                return Ok(new
                {
                    IsSuccess = true,
                    Message = "Data list retrieved successfully.",
                    Data = employees,
                    TotalCount = totalCount,
                    Totals = totals,
                    InvoiceDetails = invoiceDetails,
                    StatusCode = 200
                });
            }

            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }

        }

        [HttpPost("SaveBillReportlist")]
        [Authorize]
        public async Task<IActionResult> SaveBillReportlist([FromBody] BillSaveRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                request.fk_companyid = decryptedCompanyId;

                var isSaved = await exportReportRepository.SaveBillDataAsync(request);

                if (isSaved)
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Bill data saved successfully.";
                    modelResponse.StatusCode = 200;
                    return Ok(modelResponse);
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to save data.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpPost("downloadViewBillReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewBillReportlist(
string? reportName,
[FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;

            var (totalCount, totals, dynamicResults, invoiceDetails) = await exportReportRepository.ViewBillFormAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
    columnsToSum: new[] { "CommissionAmount", "BillAmount", "Gross Salary", "PFEmpr (13%)", "Employer ESI@3.25%", "Welfare Fund", "Total Benefits", "CTC" } // which columns to total

);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }

        [HttpPost("downloadBillGenerationExcel")]
        [Authorize]
        public async Task<IActionResult> downloadBillGenerationExcel(string? reportName, [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            if (!string.IsNullOrEmpty(decryptedCompanyId))
            {
                request.fk_companyid = decryptedCompanyId;
            }

            var (totalCount, dynamicResults) = await exportReportRepository.GetBillGenerationEmployeeListAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            var firstRow = results.First();
            string invoiceNo = firstRow.ContainsKey("InvoiceNo") ? firstRow["InvoiceNo"]?.ToString() : firstRow.ContainsKey("invoiceNo") ? firstRow["invoiceNo"]?.ToString() : "";
            string createdDate = "";
            if (firstRow.ContainsKey("CreatedDate") && firstRow["CreatedDate"] != null)
            {
                if (DateTime.TryParse(firstRow["CreatedDate"].ToString(), out DateTime parsedDate))
                    createdDate = parsedDate.ToString("dd-MMM-yyyy");
            }
            else if (firstRow.ContainsKey("createdDate") && firstRow["createdDate"] != null)
            {
                if (DateTime.TryParse(firstRow["createdDate"].ToString(), out DateTime parsedDate))
                    createdDate = parsedDate.ToString("dd-MMM-yyyy");
            }
            string month = firstRow.ContainsKey("Month") ? firstRow["Month"]?.ToString() : firstRow.ContainsKey("month") ? firstRow["month"]?.ToString() : "";
            string year = firstRow.ContainsKey("Year") ? firstRow["Year"]?.ToString() : firstRow.ContainsKey("year") ? firstRow["year"]?.ToString() : "";
            string clientName = firstRow.ContainsKey("Client") ? firstRow["Client"]?.ToString() : firstRow.ContainsKey("client") ? firstRow["client"]?.ToString() : request.ContractorName;

            string customHeaderText = $"Client: {clientName}  |  Invoice No: {invoiceNo}  |  Date: {createdDate}  |  Period: {month} {year}";

            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
                reportName: reportName ?? "BillGenerationReport",
                results: results,
                contractorName: null,
                dateHeaderText: customHeaderText,
                getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
                columnsToSum: new[] { "GrossSalary", "Insurance", "TotalBenefits", "CTC", "Bonus", "TADA", "Incentive", "Gratuity" }
            );

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName ?? "BillGenerationReport"}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }

        [HttpPost("downloadBillGenerationPDF")]
        [Authorize]
        public async Task<IActionResult> downloadBillGenerationPDF(string? reportName, [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            if (!string.IsNullOrEmpty(decryptedCompanyId))
            {
                request.fk_companyid = decryptedCompanyId;
            }

            var (totalCount, dynamicResults) = await exportReportRepository.GetBillGenerationEmployeeListAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            using (MemoryStream ms = new MemoryStream())
            {
                Document doc = new Document(PageSize.A4.Rotate(), 20f, 20f, 20f, 20f);
                PdfWriter writer = PdfWriter.GetInstance(doc, ms);
                doc.Open();

                iTextSharp.text.Font titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14);
                iTextSharp.text.Font subtitleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
                iTextSharp.text.Font headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9);
                iTextSharp.text.Font rowFont = FontFactory.GetFont(FontFactory.HELVETICA, 8);

                // Add Titles
                var companyNameObj = await exportReportRepository.GetCompanyNameAsync(decryptedCompanyId);
                string companyNameStr = "Unknown Company";
                if (companyNameObj is IDictionary<string, object> dict && dict.ContainsKey("Company Name"))
                {
                    companyNameStr = dict["Company Name"]?.ToString() ?? "Unknown Company";
                }
                else if (companyNameObj != null && !(companyNameObj is IDictionary<string, object>))
                {
                    companyNameStr = companyNameObj.ToString() ?? "Unknown Company";
                }

                Paragraph title = new Paragraph(companyNameStr, titleFont);
                title.Alignment = Element.ALIGN_CENTER;
                doc.Add(title);

                if (!string.IsNullOrEmpty(request.ContractorName))
                {
                    Paragraph subtitle = new Paragraph(request.ContractorName, subtitleFont);
                    subtitle.Alignment = Element.ALIGN_CENTER;
                    doc.Add(subtitle);
                }

                doc.Add(new Paragraph("Bill Report", subtitleFont) { Alignment = Element.ALIGN_CENTER, SpacingAfter = 5f });

                var groupedResults = results
                    .GroupBy(r => r.ContainsKey("PK_billid") ? r["PK_billid"]?.ToString() : "")
                    .ToList();

                bool isFirstPage = true;

                foreach (var group in groupedResults)
                {
                    if (!isFirstPage)
                    {
                        doc.NewPage();
                    }
                    isFirstPage = false;

                    var firstRow = group.FirstOrDefault();
                    if (firstRow == null) continue;

                    string clientName = firstRow.ContainsKey("Client") ? firstRow["Client"]?.ToString() : firstRow.ContainsKey("client") ? firstRow["client"]?.ToString() : "Unknown Client";
                    string month = firstRow.ContainsKey("Month") ? firstRow["Month"]?.ToString() : firstRow.ContainsKey("month") ? firstRow["month"]?.ToString() : "";
                    string year = firstRow.ContainsKey("Year") ? firstRow["Year"]?.ToString() : firstRow.ContainsKey("year") ? firstRow["year"]?.ToString() : "";

                    Paragraph sectionHeader = new Paragraph($"Client: {clientName}  |  Period: {month} {year}", subtitleFont);
                    sectionHeader.Alignment = Element.ALIGN_CENTER;
                    sectionHeader.SpacingBefore = 10f;
                    sectionHeader.SpacingAfter = 10f;
                    doc.Add(sectionHeader);

                    string createdDateStr = "";
                    if (firstRow.ContainsKey("CreatedDate") && firstRow["CreatedDate"] != null)
                    {
                        if (DateTime.TryParse(firstRow["CreatedDate"].ToString(), out DateTime parsedDate))
                            createdDateStr = parsedDate.ToString("dd-MMM-yyyy");
                    }
                    else if (firstRow.ContainsKey("createdDate") && firstRow["createdDate"] != null)
                    {
                        if (DateTime.TryParse(firstRow["createdDate"].ToString(), out DateTime parsedDate))
                            createdDateStr = parsedDate.ToString("dd-MMM-yyyy");
                    }

                    if (!string.IsNullOrEmpty(createdDateStr))
                    {
                        Paragraph dateParagraph = new Paragraph($"Bill Generate Date: {createdDateStr}", headerFont);
                        dateParagraph.Alignment = Element.ALIGN_RIGHT;
                        dateParagraph.SpacingAfter = 10f;
                        doc.Add(dateParagraph);
                    }
                    else
                    {
                        doc.Add(new Paragraph(" ", headerFont) { SpacingAfter = 10f });
                    }

                    string[] headers = { "Sr.", "Emp Code", "Emp Name", "Gross Salary", "Total Benefits", "CTC", "Insurance", "Bonus", "TA/DA", "Incentive", "Gratuity", "Remarks" };
                    PdfPTable table = new PdfPTable(headers.Length);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 4f, 8f, 15f, 9f, 9f, 9f, 9f, 8f, 8f, 8f, 8f, 10f });
                    table.HeaderRows = 1;

                    foreach (var header in headers)
                    {
                        PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.BackgroundColor = BaseColor.LIGHT_GRAY;
                        cell.Padding = 5f;
                        table.AddCell(cell);
                    }

                    decimal sumGross = 0, sumIns = 0, sumBen = 0, sumCtc = 0, sumBonus = 0, sumTada = 0, sumInc = 0, sumGrat = 0;
                    int rowIndex = 1;

                    foreach (var row in group)
                    {
                        string empCode = row.ContainsKey("EmpCode") ? row["EmpCode"]?.ToString() : row.ContainsKey("empcode") ? row["empcode"]?.ToString() : "";
                        string empName = row.ContainsKey("EmpName") ? row["EmpName"]?.ToString() : row.ContainsKey("empname") ? row["empname"]?.ToString() : "";

                        decimal gross = 0, ins = 0, ben = 0, ctc = 0, bonus = 0, tada = 0, inc = 0, grat = 0;
                        string remarks = row.ContainsKey("Remarks") ? row["Remarks"]?.ToString() : row.ContainsKey("remarks") ? row["remarks"]?.ToString() : "";

                        if (row.ContainsKey("GrossSalary")) decimal.TryParse(row["GrossSalary"]?.ToString(), out gross);
                        else if (row.ContainsKey("grossSalary")) decimal.TryParse(row["grossSalary"]?.ToString(), out gross);

                        if (row.ContainsKey("Insurance")) decimal.TryParse(row["Insurance"]?.ToString(), out ins);
                        else if (row.ContainsKey("insurance")) decimal.TryParse(row["insurance"]?.ToString(), out ins);

                        if (row.ContainsKey("TotalBenefits")) decimal.TryParse(row["TotalBenefits"]?.ToString(), out ben);
                        else if (row.ContainsKey("totalBenefits")) decimal.TryParse(row["totalBenefits"]?.ToString(), out ben);

                        if (row.ContainsKey("CTC")) decimal.TryParse(row["CTC"]?.ToString(), out ctc);
                        else if (row.ContainsKey("ctc")) decimal.TryParse(row["ctc"]?.ToString(), out ctc);

                        if (row.ContainsKey("Bonus")) decimal.TryParse(row["Bonus"]?.ToString(), out bonus);
                        else if (row.ContainsKey("bonus")) decimal.TryParse(row["bonus"]?.ToString(), out bonus);

                        if (row.ContainsKey("TADA")) decimal.TryParse(row["TADA"]?.ToString(), out tada);
                        else if (row.ContainsKey("tada")) decimal.TryParse(row["tada"]?.ToString(), out tada);

                        if (row.ContainsKey("Incentive")) decimal.TryParse(row["Incentive"]?.ToString(), out inc);
                        else if (row.ContainsKey("incentive")) decimal.TryParse(row["incentive"]?.ToString(), out inc);

                        if (row.ContainsKey("Gratuity")) decimal.TryParse(row["Gratuity"]?.ToString(), out grat);
                        else if (row.ContainsKey("gratuity")) decimal.TryParse(row["gratuity"]?.ToString(), out grat);

                        sumGross += gross; sumIns += ins; sumBen += ben; sumCtc += ctc; sumBonus += bonus; sumTada += tada; sumInc += inc; sumGrat += grat;

                        table.AddCell(new PdfPCell(new Phrase(rowIndex.ToString(), rowFont)) { HorizontalAlignment = Element.ALIGN_CENTER, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(empCode, rowFont)) { HorizontalAlignment = Element.ALIGN_CENTER, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(empName, rowFont)) { HorizontalAlignment = Element.ALIGN_LEFT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(gross.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(ben.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(ctc.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(ins.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(bonus.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(tada.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(inc.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(grat.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });
                        table.AddCell(new PdfPCell(new Phrase(remarks, rowFont)) { HorizontalAlignment = Element.ALIGN_LEFT, Padding = 3f });

                        rowIndex++;
                    }

                    table.AddCell(new PdfPCell(new Phrase("TOTAL", headerFont)) { Colspan = 3, HorizontalAlignment = Element.ALIGN_CENTER, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumGross.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumBen.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumCtc.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumIns.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumBonus.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumTada.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumInc.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase(sumGrat.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY, Padding = 5f });
                    table.AddCell(new PdfPCell(new Phrase("", headerFont)) { BackgroundColor = BaseColor.LIGHT_GRAY });

                    doc.Add(table);

                    doc.Add(new Paragraph("Bill Summary", subtitleFont) { Alignment = Element.ALIGN_CENTER, SpacingBefore = 15f, SpacingAfter = 10f });

                    PdfPTable summaryTable = new PdfPTable(2);
                    summaryTable.WidthPercentage = 50;
                    summaryTable.HorizontalAlignment = Element.ALIGN_CENTER;
                    summaryTable.SetWidths(new float[] { 60f, 40f });

                    void AddSummaryRow(string label, string key, bool isBold = false)
                    {
                        decimal val = 0;
                        if (firstRow.ContainsKey(key)) decimal.TryParse(firstRow[key]?.ToString(), out val);
                        else if (firstRow.ContainsKey(key.ToLower())) decimal.TryParse(firstRow[key.ToLower()]?.ToString(), out val);

                        var fontToUse = isBold ? headerFont : rowFont;
                        summaryTable.AddCell(new PdfPCell(new Phrase(label, fontToUse)) { Padding = 5f, BackgroundColor = isBold ? BaseColor.LIGHT_GRAY : BaseColor.WHITE });
                        summaryTable.AddCell(new PdfPCell(new Phrase(val.ToString("0.00"), fontToUse)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 5f, BackgroundColor = isBold ? BaseColor.LIGHT_GRAY : BaseColor.WHITE });
                    }

                    AddSummaryRow("Total CTC", "SummaryCTC");
                    AddSummaryRow("Total Bonus", "SummaryBonus");
                    AddSummaryRow("Total TA/DA", "SummaryTADA");
                    AddSummaryRow("Total Incentive", "SummaryIncentive");
                    AddSummaryRow("Total Gratuity", "SummaryGratuity");
                    AddSummaryRow("Total", "SummaryTotal", true);

                    AddSummaryRow($"Agency Charges", "SummaryAgencyCharges");
                    AddSummaryRow("Sub Total", "SummarySubTotal", true);
                    AddSummaryRow("Recovery", "SummaryRecovery");
                    AddSummaryRow("Final Total", "SummaryFinalTotal", true);
                    AddSummaryRow("IGST Charge", "SummaryIGST");
                    AddSummaryRow("CGST Charge", "SummaryCGST");
                    AddSummaryRow("SGST Charge", "SummarySGST");
                    AddSummaryRow("Grand Total", "SummaryGrandTotal", true);

                    doc.Add(summaryTable);
                }

                doc.Close();

                return File(ms.ToArray(), "application/pdf", $"{reportName ?? "BillGenerationReport"}_{DateTime.Now:yyyyMMddHHmmss}.pdf");
            }
        }

        [HttpPost("GetBillGenerationList")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetBillGenerationList([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                if (!string.IsNullOrEmpty(decryptedCompanyId))
                {
                    request.fk_companyid = decryptedCompanyId;
                }

                var (totalCount, billList) = await exportReportRepository.GetBillGenerationListAsync(request);

                if (billList == null || !billList.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = billList;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpGet("GetBillGenerationDetail")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetBillGenerationDetail(string billId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var billDetailList = await exportReportRepository.GetBillGenerationDetailAsync(billId);

                if (billDetailList == null || !billDetailList.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No details found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Details retrieved successfully.";
                modelResponse.Data = billDetailList;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }





        //Raj start




        [HttpPost("ViewLeaveReportlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewLeaveReportlistAsync(
           [FromQuery] int pageIndex = 0,
           [FromQuery] int pageSize = 10,
           [FromQuery] string? searchTerm = null,
           [FromBody] ReportModelRequest request = null!)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                // Bind pagination & search into the request model
                request.pageIndex = pageIndex;
                request.pageSize = pageSize;
                request.searchTerm = searchTerm;

                var (totalCount, employees) = await exportReportRepository.ViewLeaveReportAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpPost("downloadViewLeaveReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewLeaveReporlist(
   string? reportName,
   [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;

            // For Excel download: fetch ALL data (no pagination limit, no searchTerm filter)
            request.pageIndex = 0;
            request.pageSize = int.MaxValue;
            request.searchTerm = null;

            var (_, dynamicResults) = await exportReportRepository.ViewLeaveReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId)

);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }



        //Raj End




        [HttpPost("ViewCanteenReportlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewCanteenReportlistAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                var employees = await exportReportRepository.ViewCanteenReportlistAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }




        [HttpPost("downloadViewCanteenReportlist")]
        [Authorize]
        public async Task<IActionResult> DownloadViewCanteenReportlist(
     string? reportName,
     [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;

            var dynamicResults = await exportReportRepository.ViewCanteenReportlistAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            //else if (request.Month > 0 && request.Year > 0)
            //{
            //    var selectedMonth = new DateTime(request.Year, request.Month, 1);
            //    dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            //}

            // else -> no date header

            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
               reportName: request.ReportName ?? reportName ?? "Report",
              results: results,
               contractorName: request.ContractorName,
              dateHeaderText: dateHeaderText,
              getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
               columnsToSum: new[] { "Amount" } // which columns to total
            );


            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }



        [HttpPost("ViewLoanReportlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewLoanReportlistAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                var employees = await exportReportRepository.ViewLoanReportAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }
        //added by pp 7/10/2025 for loan report excel export

        [HttpPost("downloadViewLoanReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewLoanReportlist(
    string? reportName,
    [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;

            //var (totalCount, dynamicResults) = await exportReportRepository.ViewSalaryReportAsync(request);
            var dynamicResults = await exportReportRepository.ViewLoanReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
    columnsToSum: new[] { "Loan", "Gross Salary", "Sanctioned Loan Amount", "Old Loan", "Total", "Total Instalments", "EMI Pending", "EMI Amount", "PaidAmt", "Balance" }
);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }




        [HttpPost("downloadViewSalaryReportlistforexporttype1")]
        [Authorize]
        public async Task<IActionResult> downloadViewSalaryReportlistforexporttype1(
    string? reportName,
    [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            //request.fk_companyid = decryptedCompanyId;

            var (totalCount, dynamicResults) = await exportReportRepository.ViewSalaryReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateExcelReportAsyncnottosum(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
    columnsNotToSum: new[] { "EmpCode","EmpName","ClientName","FatherName","MotherName","PanNo","AdharNo","BankAcNo","IFSCCode","BankName","IFSCCode","BankAcNo","UANNo","PFNo","ESINo","Bank Account No","IFSC Code","Bank Name","UAN No","PF No","ESI No","MobileNumber","ClientCode"
 }
);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }



        //export emplolyee list 

        [HttpPost("ViewSalaryReportlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewSalaryReportlistAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var (totalCount, employees) = await exportReportRepository.ViewSalaryReportAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



      
        [HttpPost("downloadViewSalaryReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewSalaryReportlist(
            string? reportName,
            [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            //request.fk_companyid = decryptedCompanyId;

            var (totalCount, dynamicResults) = await exportReportRepository.ViewSalaryReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            byte[] fileBytes;

            if (request.ExportType == 58)
            {
                fileBytes = await ExcelHelper.GenerateSalaryComparisonExcelAsync(
                    reportName: request.ReportName ?? reportName ?? "Salary Comparison Sheet",
                    results: results,
                    contractorName: request.ContractorName,
                    dateHeaderText: dateHeaderText,
                    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId)
                );
            }
            else
            {
                fileBytes = await ExcelHelper.GenerateExcelReportAsync(
                    reportName: request.ReportName ?? reportName ?? "Report",
                    results: results,
                    contractorName: request.ContractorName,
                    dateHeaderText: dateHeaderText,
                    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
                    columnsToSum: new[] { "ArrearAmount", "LWP", "OTHrs", "Rate_Basic", "Rate_HRA", "Rate_DA", "Rate_Other", "Rate_CEA", "Rate_SpecialAllowance", "Rate_UniformAllowance", "Rate_OTPay", "Rate_Incentive", "Rate_BonusPay", "Rate_NoticePay", "RateGross", "Basic", "HRA", "DA", "Other", "CEA", "SpecialAllowance", "UniformAllowance", "OTPay", "Incentive", "BonusPay", "NoticePay", "EarnGross", "LTA", "BooksPeriodicals", "DriverSalary", "FuelReimbursement", "TelephoneReimbursement", "Helperallowance", "GrossTotal", "Advance", "Canteen", "NoticeAdj", "Loan", "ESI", "AdvanceSalary", "PF", "VolPF", "LWF", "ProfTax", "IT", "TotalDeductions", "NetPay", "Current Salary", "Previous Salary", "OTHours", "OTGross", "OT", "Salary for EPF", "Salary for EPS", "Salary for EDLI", "Admin Charges", "Employee's Cont", "Employer's Cont-EPS(8.33%) A/C-10", "Admn. Charges on EDLI A/C-22", "Total Contribution", "Wages", "ESI (1.75%)", "ESI (4.75%)", "LTA Amount", "Amount", "Diff_RateGross", "Diff_EarnGross", "Diff_GrossTotal", "Diff_PF", "Diff_VolPF", "Diff_ESI", "Diff_LWF", "Diff_ProfTax", "Diff_IT", "Diff_TotalDeductions", "Diff_NetPay", "Diff_OT", "Diff_NHAmt", "ESI (.75%)", "ESI (3.25%)", "Total" }
                );
            }

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }






        // added new 
        [HttpPost("Downloadpdfdata")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> PDFdata([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                var (totalCount, employees, company) = await exportReportRepository.PDFdata(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "pdf Data list retrieved successfully.";
                modelResponse.Data = new
                {
                    employees = employees,
                    company = company
                };

                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        // ISalry Slip

        [HttpPost("DownloadSalarySlipAsync")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DownloadSalarySlipAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                var employees = await exportReportRepository.DownloadMonthlySalarySlipAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        // ISalry Slip Employee

        [HttpPost("DownloadEmpSalarySlipAsync")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DownloadEmpSalarySlipAsync([FromQuery] string fk_monthId, [FromQuery] string fk_yearId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
          
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var employees = await exportReportRepository.DownloadMonthlySalarySlipforEmpAsync(decryptedUserId, fk_monthId, fk_yearId, decryptedCompanyId);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpPost("DownloadEmpSalarySlipPdfAsync")]
        [Authorize]
        public async Task<IActionResult> DownloadEmpSalarySlipPdfAsync([FromQuery] string fk_monthId, [FromQuery] string fk_yearId)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedCompanyId))
                {
                    return BadRequest(new { IsSuccess = false, Message = "Invalid user session." });
                }

                var (totalCount, employees, company, head, Leavedetail) = await exportReportRepository.DownloadMonthlySalarySlipforEmpTupleAsync(decryptedUserId, fk_monthId, fk_yearId, decryptedCompanyId);

                if (employees == null || !employees.Any())
                {
                    return BadRequest(new { IsSuccess = false, Message = "No records found." });
                }

                var reportRequest = new ReportModelRequest
                {
                    fk_monthId = fk_monthId,
                    fk_yearId = fk_yearId
                };

                var pdfBytes = GenerateBulkSalarySlipPdf(employees, company, head, Leavedetail, reportRequest, decryptedCompanyId);

                dynamic firstEmp = employees.First();
                string empCode = "";
                if (firstEmp is IDictionary<string, object> empDict)
                {
                    if (empDict.ContainsKey("EmpCode") && empDict["EmpCode"] != null) empCode = empDict["EmpCode"].ToString()!;
                    else if (empDict.ContainsKey("empcode") && empDict["empcode"] != null) empCode = empDict["empcode"].ToString()!;
                }
                else
                {
                    var prop = firstEmp?.GetType().GetProperty("EmpCode") ?? firstEmp?.GetType().GetProperty("empcode");
                    empCode = prop?.GetValue(firstEmp)?.ToString() ?? "";
                }

                string fileName = !string.IsNullOrWhiteSpace(empCode)
                    ? $"SalarySlip_{empCode}_{fk_monthId}_{fk_yearId}.pdf"
                    : $"SalarySlip_{fk_monthId}_{fk_yearId}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = "An error occurred: " + ex.Message });
            }
        }




        [HttpPost("ViewIncomeTaxReportlist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewIncomeTaxReportlistAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;
                var reportData = await exportReportRepository.ViewIncomeTaxReportAsync(request);

                if (reportData == null || !reportData.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = reportData;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        // added by 13/10/2025

        [HttpPost("downloadViewIncomeTaxReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewIncomeTaxReportlist(string? reportName, [FromBody] ReportModelRequest request)
        {


            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;

            var dynamicResults = await exportReportRepository.ViewIncomeTaxReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically

            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {request.fromdate} To : {request.todate}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
    columnsToSum: new[] { "totalAmount", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Amount", "Bill No" }
);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }



        [HttpGet("GetSalaryHeadShortDescActive")]
        [Authorize]
        public async Task<IActionResult> GetSalaryHeadShortDescActive()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var reportData = await exportReportRepository.GetSalaryHeadShortDescActiveAsync();

                if (reportData == null || !reportData.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    modelResponse.Data = null;
                    return Ok(modelResponse); // always Ok
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = reportData;
                return Ok(modelResponse); //  always Ok
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred while fetching Salary Head records.";
                modelResponse.StatusCode = 500;
                modelResponse.Data = new List<dynamic> { new { Error = ex.Message } };

                return Ok(modelResponse); //  always Ok (even error case)
            }
        }





        [HttpPost("DownloadPdfFile")]
        [Authorize]
        public async Task<IActionResult> DownloadPdfFile([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

            var (totalCount, employees, company, head) = await exportReportRepository.PDFSalaryRegisterdata(request, decryptedCompanyId);

            Console.WriteLine($"Total Count: {totalCount}");


            if (employees == null || !employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });


            var pdfBytes = GenerateSalaryRegisterPdf(employees, company, head, request);
            var fileName = $"SalaryRegister_{request.fk_monthId}_{request.fk_yearId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
        // replace this function GenerateSalaryRegisterPdf in export report controller     


        [HttpPost("DownloadPdfFileV2")]
        [Authorize]
        public async Task<IActionResult> DownloadPayRegisterPdf([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

            var (totalCount, employees, company, head) = await exportReportRepository.PDFSalaryRegisterdataV2(request, decryptedCompanyId);

            if (employees == null || !employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });

            var pdfBytes = GeneratePayRegisterPdf(employees, company, head, request);
            var fileName = $"PayRegister_{request.fk_monthId}_{request.fk_yearId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }

        private byte[] GeneratePayRegisterPdf(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, IEnumerable<dynamic> item3, ReportModelRequest request)
        {
            var list = items.ToList();
            var list1 = item2.ToList();
            var head = item3.ToList();

            // 🔥 Consistent-grid helper — every data/header cell in this method goes through this
            PdfPCell GridCell(string text, Font font, int halign = Element.ALIGN_LEFT,
                int valign = Element.ALIGN_MIDDLE, int rowspan = 1, float padding = 3f, bool grayFill = false)
            {
                var cell = new PdfPCell(new Phrase(text ?? "", font))
                {
                    HorizontalAlignment = halign,
                    VerticalAlignment = valign,
                    Rowspan = rowspan,
                    Padding = padding,
                    Border = Rectangle.BOX,
                    BorderWidth = 0.5f,
                    BorderColor = BaseColor.BLACK
                };
                if (grayFill) cell.GrayFill = 0.9f;
                return cell;
            }

            // ---- same dynamic-property helpers as original ----
            Func<dynamic, string, object?> getHeadProp = (headObj, propName) =>
            {
                try
                {
                    if (headObj is IDictionary<string, object> headDict)
                    {
                        var key = headDict.Keys.FirstOrDefault(k => string.Equals(k, propName, StringComparison.OrdinalIgnoreCase));
                        return key != null ? headDict[key] : null;
                    }
                    var properties = headObj?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var prop in properties)
                            if (string.Equals(prop.Name, propName, StringComparison.OrdinalIgnoreCase))
                                return prop.GetValue(headObj);
                    }
                    return null;
                }
                catch { return null; }
            };

            Func<dynamic, string, decimal> GetVal = (row, columnName) =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(columnName)) return 0;
                    if (row is IDictionary<string, object> dict)
                    {
                        var key = dict.Keys.FirstOrDefault(k => string.Equals(k, columnName, StringComparison.OrdinalIgnoreCase));
                        if (key != null && dict[key] != null) return Convert.ToDecimal(dict[key]);
                        return 0;
                    }
                    var properties = row?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var prop in properties)
                            if (string.Equals(prop.Name, columnName, StringComparison.OrdinalIgnoreCase))
                            {
                                var val = prop.GetValue(row);
                                return val != null ? Convert.ToDecimal(val) : 0;
                            }
                    }
                    return 0;
                }
                catch { return 0; }
            };

            Func<dynamic, string, decimal> GetArrearVal = (row, headName) => GetVal(row, "Arr_" + headName);

            Func<dynamic, string> getShortDesc = (x) =>
            {
                var s = getHeadProp(x, "shortdesc")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headname")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headcode")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "description")?.ToString();
                return s?.Trim() ?? string.Empty;
            };

            Func<dynamic, string> getDescription = (x) =>
            {
                var s = getHeadProp(x, "description")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "shortdesc")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headname")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headcode")?.ToString();
                return s?.Trim() ?? string.Empty;
            };

            Func<dynamic, int> getHeadOrder = (hObj) =>
            {
                var ord = getHeadProp(hObj, "sal_order") ?? getHeadProp(hObj, "headorder") ?? getHeadProp(hObj, "sortorder") ?? getHeadProp(hObj, "displayorder") ?? getHeadProp(hObj, "headid") ?? getHeadProp(hObj, "fk_headid");
                int oVal = 999;
                if (ord != null && int.TryParse(ord.ToString(), out oVal)) return oVal;
                return 999;
            };

            var headObjects = head.Cast<object>().OrderBy(x => getHeadOrder(x)).ToList();

            var earningHeadList = headObjects
                .Where(x => string.Equals(getHeadProp(x, "headtype")?.ToString(), "E", StringComparison.OrdinalIgnoreCase))
                .Select(x => new { ShortDesc = getShortDesc(x), Description = getDescription(x) })
                .Where(x => !string.IsNullOrEmpty(x.ShortDesc))
                .GroupBy(x => x.ShortDesc, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First())
                .ToList();

            var deductionHeadList = headObjects
                .Where(x => string.Equals(getHeadProp(x, "headtype")?.ToString(), "D", StringComparison.OrdinalIgnoreCase))
                .Select(x => new { ShortDesc = getShortDesc(x), Description = getDescription(x) })
                .Where(x => !string.IsNullOrEmpty(x.ShortDesc))
                .GroupBy(x => x.ShortDesc, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First())
                .ToList();


            string dynamicTitle = list1.Count > 0 ? list1[0].compname ?? "Default Company" : "Default Company";
            string dynamicTitle2 = list1.Count > 0 ? list1[0].address1 ?? "" : "";
            string caption = "Pay Register for the Month of ";
            string monthName = "Invalid Month";
            if (int.TryParse(request.fk_monthId, out int monthInt) && monthInt >= 1 && monthInt <= 12)
                monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthInt);
            string firmPFNumber = list1.Count > 0 ? list1[0].pfno?.ToString() ?? "" : "";
            string firmESICNumber = list1.Count > 0 ? list1[0].esino?.ToString() ?? "" : "";

            Func<dynamic, string> getLocation = (item) =>
            {
                var dict = item as IDictionary<string, object>;
                if (dict != null)
                {
                    var key = dict.Keys.FirstOrDefault(k => string.Equals(k, "Location", StringComparison.OrdinalIgnoreCase) || string.Equals(k, "LocationName", StringComparison.OrdinalIgnoreCase));
                    if (key != null && dict[key] != null) return dict[key].ToString()?.Trim() ?? "";
                }
                var prop = item?.GetType()?.GetProperty("Location") ?? item?.GetType()?.GetProperty("LocationName");
                return prop?.GetValue(item)?.ToString()?.Trim() ?? "";
            };

            //Func<dynamic, string> getDepartment = (item) =>
            //{
            //    var dict = item as IDictionary<string, object>;
            //    if (dict != null)
            //    {
            //        var key = dict.Keys.FirstOrDefault(k => string.Equals(k, "Department", StringComparison.OrdinalIgnoreCase) || string.Equals(k, "DepartmentName", StringComparison.OrdinalIgnoreCase));
            //        if (key != null && dict[key] != null) return dict[key].ToString()?.Trim() ?? "";
            //    }
            //    var prop = item?.GetType()?.GetProperty("Department") ?? item?.GetType()?.GetProperty("DepartmentName");
            //    return prop?.GetValue(item)?.ToString()?.Trim() ?? "";
            //};

            // Group employees by Location and Department so each section gets its own single Department & Location
            var groupedList = list
                .GroupBy(item => new
                {
                    Location = getLocation(item),
                    //  Department = getDepartment(item)
                })
                .OrderBy(g => g.Key.Location)
                //.ThenBy(g => g.Key.Department)
                .ToList();

            var firstGrp = groupedList.FirstOrDefault();
            string initialLoc = firstGrp != null ? firstGrp.Key.Location : "";
            //string initialDept = firstGrp != null ? firstGrp.Key.Department : "";
            string initialDept = "";
            const string leaveDetailsText = "Leave Details - Leave :Opening/Credit/Used(with Leave Encashment)/Closing";

            using (var ms = new MemoryStream())
            {
                var doc = new Document(PageSize.A4, 4f, 4f, 8f, 8f);
                BaseFont baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                Font titleFont = new Font(baseFont, 12, Font.BOLD, BaseColor.BLACK);
                Font subTitleFont = new Font(baseFont, 9, Font.NORMAL, BaseColor.BLACK);
                Font headerFont = new Font(baseFont, 8.5f, Font.BOLD, BaseColor.BLACK);
                Font normalFont = new Font(baseFont, 8.5f, Font.NORMAL, BaseColor.BLACK);
                Font boldFont = new Font(baseFont, 8.5f, Font.BOLD, BaseColor.BLACK);

                var pageEvent = new SalaryRegisterPageEvent(
                    dynamicTitle, dynamicTitle2, request.ContractorName,
                    caption, monthName, request.fk_yearId,
                    firmPFNumber, firmESICNumber,
                    initialDept, initialLoc, leaveDetailsText,
                    showFirmDetails: false);

                var pdfWriter = PdfWriter.GetInstance(doc, ms);
                pdfWriter.PageEvent = pageEvent;
                doc.Open();

                // ---- Text line measurement helper to keep wrapped heads and numbers in sync ----
                float printableTableWidth = PageSize.A4.Width - doc.LeftMargin - doc.RightMargin;
                float totalTableWeight = 2.8f + 1.8f + 1.8f + 1.6f + 1.6f + 1.2f + 1.4f + 1.6f + 1.6f;
                float earnTextMaxWidth = ((1.8f / totalTableWeight) * printableTableWidth) - 6f - 1f;
                float dedTextMaxWidth = ((1.4f / totalTableWeight) * printableTableWidth) - 6f - 1f;

                Func<string, float, Font, int> GetTextLineCount = (text, maxWidth, font) =>
                {
                    if (string.IsNullOrWhiteSpace(text)) return 1;
                    var bFont = font.BaseFont;
                    float fSize = font.Size;
                    float spaceWidth = bFont.GetWidthPoint(" ", fSize);

                    var paragraphs = text.Replace("\r\n", "\n").Split('\n');
                    int totalLines = 0;

                    foreach (var para in paragraphs)
                    {
                        var words = para.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                        if (words.Length == 0)
                        {
                            totalLines++;
                            continue;
                        }

                        int paraLines = 1;
                        float currentLineWidth = 0;

                        foreach (var word in words)
                        {
                            float wordWidth = bFont.GetWidthPoint(word, fSize);
                            if (currentLineWidth == 0)
                            {
                                currentLineWidth = wordWidth;
                            }
                            else if (currentLineWidth + spaceWidth + wordWidth <= maxWidth)
                            {
                                currentLineWidth += spaceWidth + wordWidth;
                            }
                            else
                            {
                                paraLines++;
                                currentLineWidth = wordWidth;
                            }
                        }
                        totalLines += paraLines;
                    }

                    return Math.Max(1, totalLines);
                };

                // ===== GRAND TOTAL ACCUMULATORS (Head Wise Total) =====
                var headEarnRate = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
                var headEarnAmt = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
                var headEarnArr = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
                var headDedAmt = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
                foreach (var h in earningHeadList) { headEarnRate[h.ShortDesc] = 0; headEarnAmt[h.ShortDesc] = 0; headEarnArr[h.ShortDesc] = 0; }
                foreach (var h in deductionHeadList) headDedAmt[h.ShortDesc] = 0;
                decimal grandRate = 0, grandAmt = 0, grandArr = 0, grandDed = 0, grandNet = 0;

                int sno = 1;
                bool isFirstGroup = true;

                foreach (var group in groupedList)
                {
                    if (!isFirstGroup)
                    {
                        // Set single Department & single Location for this group and start a new page
                        //pageEvent.CurrentDepartment = group.Key.Department;
                        pageEvent.CurrentLocation = group.Key.Location;
                        doc.NewPage();
                    }
                    else
                    {
                        isFirstGroup = false;
                    }

                    // ================= MAIN TABLE (For this Location + Department) =================
                    PdfPTable mainTable = new PdfPTable(9);
                    mainTable.WidthPercentage = 100;
                    mainTable.SpacingBefore = 6f;
                    mainTable.SetWidths(new float[] { 2.8f, 1.8f, 1.8f, 1.6f, 1.6f, 1.2f, 1.4f, 1.6f, 1.6f });

                    string[] headers = { "Employee Particulars", "Days", "Earnings", "Basic Rate", "Amount", "Arrears", "Deductions", "Amount", "Net Pay" };
                    foreach (var h in headers)
                        mainTable.AddCell(GridCell(h, headerFont, Element.ALIGN_CENTER, Element.ALIGN_MIDDLE, 1, 4f, grayFill: true));
                    mainTable.HeaderRows = 1;

                    foreach (var item in group)
                    {
                        var earnLines = new List<(string label, decimal rate, decimal amt, decimal arr)>();
                        foreach (var h in earningHeadList)
                        {
                            decimal amt = GetVal(item, h.ShortDesc);
                            decimal rate = GetVal(item, "Rate_" + h.ShortDesc);
                            decimal arr = GetArrearVal(item, h.ShortDesc);
                            if (amt != 0 || rate != 0)
                            {
                                earnLines.Add((h.Description, rate, amt, arr));
                                headEarnRate[h.ShortDesc] += rate; headEarnAmt[h.ShortDesc] += amt; headEarnArr[h.ShortDesc] += arr;
                            }
                        }

                        var dedLines = new List<(string label, decimal amt)>();
                        foreach (var h in deductionHeadList)
                        {
                            decimal amt = GetVal(item, h.ShortDesc);
                            if (amt != 0)
                            {
                                dedLines.Add((h.Description, amt));
                                headDedAmt[h.ShortDesc] += amt;
                            }
                        }

                        decimal netPay = GetVal(item, "NetPay");
                        decimal rowRateSum = earnLines.Sum(e => e.rate);
                        decimal rowAmtSum = earnLines.Sum(e => e.amt);
                        decimal rowArrSum = earnLines.Sum(e => e.arr);
                        decimal rowDedSum = dedLines.Sum(d => d.amt);
                        if (netPay == 0 && (rowAmtSum > 0 || rowDedSum > 0))
                        {
                            netPay = (rowAmtSum + rowArrSum) - rowDedSum;
                        }

                        // ---- Row 1: Employee Particulars & Days (NO rowspan — only data row) ----
                        //string particulars =
                        //    $"Sno:{sno}  Emp.Code:{item.EmpCode?.ToString() ?? ""}\n\n" +
                        //    $"Name:{item.EmpName?.ToString() ?? ""}\n\n" +
                        //    $"F/H:{item.FatherName?.ToString() ?? ""}\n\n" +
                        //    $"DOJ : {item.JoiningDate?.ToString() ?? ""}\n\n" +
                        //    $"PF:{item.PFNo?.ToString() ?? ""}\n\n" +
                        //     (!string.IsNullOrWhiteSpace(item.ESINo?.ToString()) ? $"ESI:{item.ESINo}\n\n" : "") +
                        //    $"UAN :{item.UANNo?.ToString() ?? ""}\n\n" +
                        //    $"DOB : {item.DOB?.ToString() ?? ""}\n\n" +
                        //    $"Dept : {item.Department?.ToString() ?? ""}\n\n" +
                        //    $"Desig : {item.Designation?.ToString() ?? ""}";
                        //mainTable.AddCell(GridCell(particulars, normalFont, Element.ALIGN_LEFT, Element.ALIGN_TOP));
                        // ---- Row 1: Employee Particulars & Days (NO rowspan — only data row) ----
                        Phrase particularsPhrase = new Phrase();
                        particularsPhrase.Add(new Chunk($"Sno:{sno}  Emp.Code:{item.EmpCode?.ToString() ?? ""}\n\n", normalFont));
                        particularsPhrase.Add(new Chunk("Name:", normalFont));
                        particularsPhrase.Add(new Chunk($"{item.EmpName?.ToString() ?? ""}\n\n", boldFont));   // 👈 sirf EmpName value bold
                        particularsPhrase.Add(new Chunk($"F/H:{item.FatherName?.ToString() ?? ""}\n\n", normalFont));
                        particularsPhrase.Add(new Chunk($"DOJ : {item.JoiningDate?.ToString() ?? ""}\n\n", normalFont));
                        particularsPhrase.Add(new Chunk($"PF:{item.PFNo?.ToString() ?? ""}\n\n", normalFont));
                        if (!string.IsNullOrWhiteSpace(item.ESINo?.ToString()))
                            particularsPhrase.Add(new Chunk($"ESI:{item.ESINo}\n\n", normalFont));
                        particularsPhrase.Add(new Chunk($"UAN :{item.UANNo?.ToString() ?? ""}\n\n", normalFont));
                        //particularsPhrase.Add(new Chunk($"DOB : {item.DOB?.ToString() ?? ""}\n\n", normalFont));
                        //particularsPhrase.Add(new Chunk($"Dept : {item.Department?.ToString() ?? ""}\n\n", normalFont));
                        //particularsPhrase.Add(new Chunk($"Desig : {item.Designation?.ToString() ?? ""}", normalFont));

                        var particularsCell = new PdfPCell(particularsPhrase)
                        {
                            HorizontalAlignment = Element.ALIGN_LEFT,
                            VerticalAlignment = Element.ALIGN_TOP,
                            Padding = 3f,
                            Border = Rectangle.BOX,
                            BorderWidth = 0.5f,
                            BorderColor = BaseColor.BLACK
                        };
                        mainTable.AddCell(particularsCell);

                        string days =
                            $"WP/Ab {GetVal(item, "LWP")}\n\n" +
                            $"W.D. {GetVal(item, "WD")}\n\n" +
                            $"D.P {GetVal(item, "PaidDays")}\n\n" +
                            $"EL: {GetVal(item, "EL")}\n\n" +
                            $"CL: {GetVal(item, "CL")}\n\n" +
                            $"Off Days : {GetVal(item, "OffDays")}\n\n" +
                            $"Incentive Days : {GetVal(item, "IncentiveDays")}";
                        mainTable.AddCell(GridCell(days, normalFont, Element.ALIGN_LEFT, Element.ALIGN_TOP));

                        // ---- Earnings block: Synchronized cells for label / rate / amount / arrears ----
                        var earnLabelParts = new List<string>();
                        var earnRateParts = new List<string>();
                        var earnAmtParts = new List<string>();
                        var earnArrParts = new List<string>();

                        foreach (var e in earnLines)
                        {
                            earnLabelParts.Add(e.label);
                            int lines = GetTextLineCount(e.label, earnTextMaxWidth, normalFont);
                            string pad = lines > 1 ? new string('\n', lines - 1) : "";

                            earnRateParts.Add(e.rate.ToString("N2") + pad);
                            earnAmtParts.Add(e.amt.ToString("N2") + pad);
                            earnArrParts.Add(e.arr.ToString("N2") + pad);
                        }

                        string earnLabelStr = string.Join("\n\n", earnLabelParts);
                        string earnRateStr = string.Join("\n\n", earnRateParts);
                        string earnAmtStr = string.Join("\n\n", earnAmtParts);
                        string earnArrStr = string.Join("\n\n", earnArrParts);

                        mainTable.AddCell(GridCell(earnLabelStr, normalFont, Element.ALIGN_LEFT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(earnRateStr, normalFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(earnAmtStr, normalFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(earnArrStr, normalFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));

                        // ---- Deductions block: Synchronized cells for label / amount ----
                        var dedLabelParts = new List<string>();
                        var dedAmtParts = new List<string>();

                        foreach (var d in dedLines)
                        {
                            dedLabelParts.Add(d.label);
                            int lines = GetTextLineCount(d.label, dedTextMaxWidth, normalFont);
                            string pad = lines > 1 ? new string('\n', lines - 1) : "";

                            dedAmtParts.Add(d.amt.ToString("N2") + pad);
                        }

                        string dedLabelStr = string.Join("\n\n", dedLabelParts);
                        string dedAmtStr = string.Join("\n\n", dedAmtParts);

                        mainTable.AddCell(GridCell(dedLabelStr, normalFont, Element.ALIGN_LEFT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(dedAmtStr, normalFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));

                        // Net Pay on the data row
                        mainTable.AddCell(GridCell(netPay.ToString("N2"), normalFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));

                        // ---- Total row for this employee ----
                        mainTable.AddCell(GridCell("", boldFont));                 // blank (Particulars col, no span now)
                        mainTable.AddCell(GridCell("", boldFont));                 // blank (Days col, no span now)
                        mainTable.AddCell(GridCell("Total", boldFont, Element.ALIGN_LEFT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(rowRateSum.ToString("N2"), boldFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(rowAmtSum.ToString("N2"), boldFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(rowArrSum.ToString("N2"), boldFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell("Total", boldFont, Element.ALIGN_LEFT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(rowDedSum == 0 ? "" : rowDedSum.ToString("N2"), boldFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));
                        mainTable.AddCell(GridCell(netPay.ToString("N2"), boldFont, Element.ALIGN_RIGHT, Element.ALIGN_TOP));
                        grandRate += rowRateSum; grandAmt += rowAmtSum; grandArr += rowArrSum; grandDed += rowDedSum; grandNet += netPay;
                        sno++;
                    }

                    doc.Add(mainTable);
                }

                //doc.Add(new Paragraph(" ", normalFont));
                // ---- Decide whether Head Wise Total should start on a fresh page ----
                // If the last page's employee count is too small, the totals block looks
                // disconnected/awkward sitting right below it — push it to a new page instead.
                //const int minEmployeesToKeepTotalsOnSamePage = 3; // tweak this threshold as needed

                //int lastGroupEmployeeCount = groupedList.Count > 0 ? groupedList.Last().Count() : 0;

                //if (lastGroupEmployeeCount > 0 && lastGroupEmployeeCount <= 2)
                //{
                //    doc.NewPage();
                //}
                //else
                //{
                //    doc.Add(new Paragraph(" ", normalFont));
                //}
                // Client requirement:
                // - Last page pe agar 1-2 employee hi hain (bahut khaali jagah bachti hai) -> Head Wise Total wahi usi page pe daal do
                // - Agar 3 ya usse zyada employee hain (page kaafi bhara hua hai) -> naya page lo
                // Employee count wrong signal hai (group ke total employees, na ki is physical page ke) —
                // isliye actual bachi hui vertical space check karo current page pe.
                float currentY = pdfWriter.GetVerticalPosition(true);
                float pageBottomMargin = doc.BottomMargin;
                float availableSpace = currentY - pageBottomMargin;

                // Head Wise Total + Grand Total block ke liye estimated height:
                // title row + (earning/deduction rows jitne max hain) + total row, har row ~16pt
                // + neeche Grand Total table ke liye ~24pt extra
                int headWiseRowCount = 2 + Math.Max(earningHeadList.Count, deductionHeadList.Count);
                float estimatedNeededSpace = (headWiseRowCount * 16f) + 30f;

                if (availableSpace < estimatedNeededSpace)
                {
                    doc.NewPage();
                }
                else
                {
                    doc.Add(new Paragraph(" ", normalFont));
                } // ================= HEAD WISE TOTAL ...

                // ================= HEAD WISE TOTAL (earnings + deductions in one aligned table) =================
                PdfPTable headWiseTable = new PdfPTable(6);
                headWiseTable.WidthPercentage = 100;
                headWiseTable.SetWidths(new float[] { 3f, 1.8f, 1.8f, 1.4f, 2.5f, 1.8f });

                var headWiseTitleCell = GridCell("Head Wise total", headerFont, Element.ALIGN_LEFT);
                headWiseTitleCell.Colspan = 4;
                headWiseTable.AddCell(headWiseTitleCell);

                var headWiseBlankCell = GridCell("", headerFont);
                headWiseBlankCell.Colspan = 2;
                headWiseTable.AddCell(headWiseBlankCell);

                int maxRows = Math.Max(earningHeadList.Count, deductionHeadList.Count);
                for (int i = 0; i < maxRows; i++)
                {
                    if (i < earningHeadList.Count)
                    {
                        var h = earningHeadList[i];
                        headWiseTable.AddCell(GridCell(h.Description, normalFont));
                        headWiseTable.AddCell(GridCell(headEarnRate[h.ShortDesc].ToString("N2"), normalFont, Element.ALIGN_RIGHT));
                        headWiseTable.AddCell(GridCell(headEarnAmt[h.ShortDesc].ToString("N2"), normalFont, Element.ALIGN_RIGHT));
                        headWiseTable.AddCell(GridCell(headEarnArr[h.ShortDesc].ToString("N2"), normalFont, Element.ALIGN_RIGHT));
                    }
                    else
                    {
                        for (int c = 0; c < 4; c++)
                            headWiseTable.AddCell(GridCell("", normalFont));
                    }

                    if (i < deductionHeadList.Count)
                    {
                        var h = deductionHeadList[i];
                        headWiseTable.AddCell(GridCell(h.Description, normalFont));
                        headWiseTable.AddCell(GridCell(headDedAmt[h.ShortDesc].ToString("N2"), normalFont, Element.ALIGN_RIGHT));
                    }
                    else
                    {
                        headWiseTable.AddCell(GridCell("", normalFont));
                        headWiseTable.AddCell(GridCell("", normalFont));
                    }
                }

                headWiseTable.AddCell(GridCell("Total", boldFont));
                headWiseTable.AddCell(GridCell(grandRate.ToString("N2"), boldFont, Element.ALIGN_RIGHT));
                headWiseTable.AddCell(GridCell(grandAmt.ToString("N2"), boldFont, Element.ALIGN_RIGHT));
                headWiseTable.AddCell(GridCell(grandArr.ToString("N2"), boldFont, Element.ALIGN_RIGHT));
                headWiseTable.AddCell(GridCell("Total", boldFont));
                headWiseTable.AddCell(GridCell(grandDed.ToString("N2"), boldFont, Element.ALIGN_RIGHT));
                doc.Add(headWiseTable);

                // ================= GRAND TOTAL =================
                PdfPTable grandTable = new PdfPTable(2);
                grandTable.WidthPercentage = 100;
                grandTable.SetWidths(new float[] { 5f, 3f });
                grandTable.AddCell(new PdfPCell(new Phrase($"Grand Total   Rate: {grandRate:N2}   Amount: {grandAmt:N2}   Arrears: {grandArr:N2}", boldFont)) { Padding = 3, Border = Rectangle.NO_BORDER });
                grandTable.AddCell(new PdfPCell(new Phrase($"Grand Total   Deductions: {grandDed:N2}   Net Pay: {grandNet:N2}", boldFont)) { Padding = 3, Border = Rectangle.NO_BORDER });
                doc.Add(grandTable);

                doc.Close();
                return ms.ToArray();
            }
        }

        public class SalaryRegisterPageEvent : PdfPageEventHelper
        {
            private readonly string _compName;
            private readonly string _address;
            private readonly string _contractorName;
            private readonly string _caption;
            private readonly string _monthName;
            private readonly string _yearId;
            private readonly string _firmPFNumber;
            private readonly string _firmESICNumber;
            public string CurrentDepartment { get; set; }
            public string CurrentLocation { get; set; }
            private readonly string _leaveDetailsText;
            private readonly bool _showFirmDetails;

            private BaseFont _baseFont;
            private Font _boldFont12;
            private Font _boldFont11;
            private Font _boldFont9;
            private Font _normalFont8;
            private Font _normalFont5;
            private Font _boldFont10;
            private Font _boldFont10forloc;
            private Font _redFont8;

            public SalaryRegisterPageEvent(string compName, string address, string contractorName,
                string caption, string monthName, string yearId, string firmPFNumber, string firmESICNumber,
                string department = null, string departmentLocation = null,
                string leaveDetailsText = null, bool showFirmDetails = true)
            {
                _compName = compName;
                _address = address;
                _contractorName = contractorName;
                _caption = caption;
                _monthName = monthName;
                _yearId = yearId;
                _firmPFNumber = firmPFNumber;
                _firmESICNumber = firmESICNumber;
                CurrentDepartment = department;
                CurrentLocation = departmentLocation;
                _leaveDetailsText = leaveDetailsText;
                _showFirmDetails = showFirmDetails;

                _baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                _boldFont12 = new Font(_baseFont, 13f, Font.BOLD);
                _boldFont11 = new Font(_baseFont, 9f, Font.NORMAL);
                _boldFont9 = new Font(_baseFont, 10f, Font.BOLD);
                _normalFont8 = new Font(_baseFont, 9f, Font.NORMAL);
                _normalFont5 = new Font(_baseFont, 9f, Font.BOLD);
                _boldFont10 = new Font(_baseFont, 11f, Font.NORMAL);
                _boldFont10forloc = new Font(_baseFont, 11f, Font.BOLD);

                _redFont8 = new Font(_baseFont, 8f, Font.NORMAL, BaseColor.RED);
            }

            public override void OnStartPage(PdfWriter writer, Document document)
            {
                PdfPTable headerTable = new PdfPTable(2);
                headerTable.WidthPercentage = 100;
                headerTable.SetWidths(new float[] { 68f, 32f });
                headerTable.DefaultCell.Border = Rectangle.NO_BORDER;

                // --- LEFT CELL ---
                PdfPTable leftInner = new PdfPTable(1);
                leftInner.WidthPercentage = 100;
                leftInner.DefaultCell.Border = Rectangle.NO_BORDER;

                leftInner.AddCell(new PdfPCell(new Phrase(_compName, _boldFont12))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 0,
                    PaddingTop = 8f,         // 👈 Upper space at the top of the header
                    PaddingBottom = 3f
                });

                if (!string.IsNullOrWhiteSpace(_address))
                {
                    leftInner.AddCell(new PdfPCell(new Phrase(_address, _boldFont11))
                    {
                        Border = Rectangle.NO_BORDER,
                        Padding = 0,
                        PaddingBottom = 6f
                    });
                }

                if (!string.IsNullOrWhiteSpace(_contractorName))
                {
                    leftInner.AddCell(new PdfPCell(new Phrase(_contractorName, _boldFont9))
                    {
                        Border = Rectangle.NO_BORDER,
                        Padding = 0,
                        PaddingBottom = 4f
                    });
                }

                leftInner.AddCell(new PdfPCell(new Phrase($"{_caption} {_monthName}, {_yearId}", _boldFont10))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 0,
                    PaddingBottom = 6f
                });

                PdfPTable deptLocTable = new PdfPTable(2);
                deptLocTable.WidthPercentage = 100;
                deptLocTable.SetWidths(new float[] { 14f, 86f });
                deptLocTable.DefaultCell.Border = Rectangle.NO_BORDER;

                //deptLocTable.AddCell(new PdfPCell(new Phrase("Department:", _boldFont10))
                //{ Border = Rectangle.NO_BORDER, Padding = 0, NoWrap = true });

                //deptLocTable.AddCell(new PdfPCell(new Phrase(CurrentDepartment ?? "", _boldFont10))
                //{ Border = Rectangle.NO_BORDER, Padding = 0 });

                deptLocTable.AddCell(new PdfPCell(new Phrase("Location:", _boldFont10))
                { Border = Rectangle.NO_BORDER, Padding = 0, NoWrap = true });

                deptLocTable.AddCell(new PdfPCell(new Phrase(CurrentLocation ?? "", _boldFont10forloc))
                { Border = Rectangle.NO_BORDER, Padding = 0, NoWrap = true });

                PdfPCell deptLocWrapper = new PdfPCell(deptLocTable)
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 0,
                    PaddingBottom = 5f
                };

                leftInner.AddCell(deptLocWrapper);

                if (!string.IsNullOrWhiteSpace(_leaveDetailsText))
                    leftInner.AddCell(new PdfPCell(new Phrase(_leaveDetailsText, _redFont8))
                    {
                        Border = Rectangle.NO_BORDER,
                        Padding = 0,
                        PaddingBottom = 3f
                    });

                PdfPCell leftCell = new PdfPCell(leftInner)
                {
                    Border = Rectangle.NO_BORDER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    PaddingLeft = 4f,
                    PaddingTop = 8f,         // 👈 Upper space on left header block
                    PaddingBottom = 6f
                };

                headerTable.AddCell(leftCell);

                // --- RIGHT CELL ---
                int pageNumber = writer.PageNumber;
                Phrase rightContent = new Phrase();

                if (_showFirmDetails)
                {
                    rightContent.Add(new Chunk("Firm PF Number  ", _normalFont5));
                    rightContent.Add(new Chunk($"{_firmPFNumber}\n", _normalFont8));

                    rightContent.Add(new Chunk("Firm ESIC Number  ", _normalFont5));
                    rightContent.Add(new Chunk($"{_firmESICNumber}\n\n", _normalFont8));

                    rightContent.Add(new Chunk("Page No. : ", _normalFont8));
                    rightContent.Add(new Chunk($"{pageNumber}", _normalFont8));
                }
                else
                {
                    rightContent.Add(new Chunk($"{pageNumber}", _normalFont8));
                }

                PdfPCell rightCell = new PdfPCell(rightContent)
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_TOP,
                    PaddingRight = 8f,
                    PaddingTop = 8f,         // 👈 Upper space on right header block
                    PaddingBottom = 2f,
                };
                headerTable.AddCell(rightCell);

                document.Add(headerTable);
            }
        }

        private byte[] GenerateSalaryRegisterPdf(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, IEnumerable<dynamic> item3, ReportModelRequest request)
        {
            var list = items.ToList();
            var list1 = item2.ToList();
            var head = item3.ToList();

            foreach (var emp in list)
            {
                Console.WriteLine(emp);  // dynamic hai, to emp.ToString() ya emp ka proper property print hoga
            }
            Func<dynamic, string, object?> getHeadProp = (headObj, propName) =>
            {
                try
                {
                    if (headObj is IDictionary<string, object> headDict)
                    {
                        var key = headDict.Keys.FirstOrDefault(k => string.Equals(k, propName, StringComparison.OrdinalIgnoreCase));
                        return key != null ? headDict[key] : null;
                    }
                    var properties = headObj?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var prop in properties)
                        {
                            if (string.Equals(prop.Name, propName, StringComparison.OrdinalIgnoreCase))
                                return prop.GetValue(headObj);
                        }
                    }
                    return null;
                }
                catch { return null; }
            };

            Func<dynamic, string, decimal> GetVal = (row, columnName) =>
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(columnName)) return 0;

                    if (row is IDictionary<string, object> dict)
                    {
                        var key = dict.Keys.FirstOrDefault(k => string.Equals(k, columnName, StringComparison.OrdinalIgnoreCase));
                        if (key != null && dict[key] != null)
                            return Convert.ToDecimal(dict[key]);
                        return 0;
                    }
                    var properties = row?.GetType()?.GetProperties();
                    if (properties != null)
                    {
                        foreach (var prop in properties)
                        {
                            if (string.Equals(prop.Name, columnName, StringComparison.OrdinalIgnoreCase))
                            {
                                var val = prop.GetValue(row);
                                return val != null ? Convert.ToDecimal(val) : 0;
                            }
                        }
                    }
                    return 0;
                }
                catch
                {
                    return 0;
                }
            };

            Func<dynamic, string> getHeadName = (x) =>
            {
                var s = getHeadProp(x, "shortdesc")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headname")?.ToString();
                if (string.IsNullOrWhiteSpace(s)) s = getHeadProp(x, "headcode")?.ToString();
                return s?.Trim() ?? string.Empty;
            };

            Func<dynamic, int> getHeadOrder = (hObj) =>
            {
                var ord = getHeadProp(hObj, "sal_order") ?? getHeadProp(hObj, "headorder") ?? getHeadProp(hObj, "sortorder") ?? getHeadProp(hObj, "displayorder") ?? getHeadProp(hObj, "headid") ?? getHeadProp(hObj, "fk_headid");
                int oVal = 999;
                if (ord != null && int.TryParse(ord.ToString(), out oVal))
                    return oVal;
                return 999;
            };

            var headObjects = head.Cast<object>()
                .OrderBy(x => getHeadOrder(x))
                .ToList();

            var rateHeadList = headObjects
                .Where(x => {
                    var hType = getHeadProp(x, "headtype")?.ToString();
                    var isRate = getHeadProp(x, "isRatePart");
                    bool isR = isRate != null && (isRate.ToString() == "1" || isRate.ToString()?.Equals("true", StringComparison.OrdinalIgnoreCase) == true);
                    return string.Equals(hType, "E", StringComparison.OrdinalIgnoreCase) && isR;
                })
                .Select(x => getHeadName(x))
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var earningHeadList = headObjects
                .Where(x => string.Equals(getHeadProp(x, "headtype")?.ToString(), "E", StringComparison.OrdinalIgnoreCase))
                .Select(x => getHeadName(x))
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var deductionHeadList = headObjects
                .Where(x => string.Equals(getHeadProp(x, "headtype")?.ToString(), "D", StringComparison.OrdinalIgnoreCase))
                .Select(x => getHeadName(x))
                .Where(s => !string.IsNullOrEmpty(s))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            Func<List<string>, int, List<List<string>>> splitList = (itemsList, numParts) =>
            {
                var result = new List<List<string>>();
                for (int i = 0; i < numParts; i++) result.Add(new List<string>());
                if (itemsList == null || itemsList.Count == 0) return result;

                int total = itemsList.Count;
                int baseSize = total / numParts;
                int remainder = total % numParts;

                int startIndex = 0;
                for (int i = 0; i < numParts; i++)
                {
                    int size = baseSize + (i < remainder ? 1 : 0);
                    result[i] = itemsList.Skip(startIndex).Take(size).ToList();
                    startIndex += size;
                }
                return result;
            };

            var rateParts = splitList(rateHeadList, 2);
            var earningParts = splitList(earningHeadList, 3);
            var deductionParts = splitList(deductionHeadList, 2);

            string rateLeftHeaderStr = string.Join("\n\n", rateParts[0].Select(h => h.ToUpper()));
            string rateRightHeaderStr = string.Join("\n\n", rateParts[1].Select(h => h.ToUpper()));
            if (!string.IsNullOrEmpty(rateRightHeaderStr)) rateRightHeaderStr += "\n\nTotal";
            else rateRightHeaderStr = "Total";

            string earnLeftHeaderStr = string.Join("\n\n", earningParts[0].Select(h => h.ToUpper()));
            string earnCenterHeaderStr = string.Join("\n\n", earningParts[1].Select(h => h.ToUpper()));
            string earnRightHeaderStr = string.Join("\n\n", earningParts[2].Select(h => h.ToUpper()));
            if (!string.IsNullOrEmpty(earnRightHeaderStr)) earnRightHeaderStr += "\n\nTotal";
            else earnRightHeaderStr = "Total";

            string dedLeftHeaderStr = string.Join("\n\n", deductionParts[0].Select(h => h.ToUpper()));
            string dedRightHeaderStr = string.Join("\n\n", deductionParts[1].Select(h => h.ToUpper()));
            if (!string.IsNullOrEmpty(dedRightHeaderStr)) dedRightHeaderStr += "\n\nTotal";
            else dedRightHeaderStr = "Total";

            string dynamicTitle = list1.Count > 0 ? list1[0].compname ?? "Default Company" : "Default Company";
            string dynamicTitle1 = request.ContractorName;
            string dynamicTitle2 = list1.Count > 0 ? list1[0].address1 ?? "Default Company" : "Default Company";
            string caption = list1.Count > 0 ? list1[0].caption ?? "Default Company" : "Default Company";

            using (var ms = new MemoryStream())
            {
                var doc = new Document(PageSize.A4.Rotate(), 25f, 25f, 36f, 36f);

                BaseFont baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                Font normalFont = new Font(baseFont, 8, Font.NORMAL, BaseColor.BLACK);
                Font boldFont = new Font(baseFont, 10, Font.BOLD, BaseColor.BLACK);
                Font smallFont = new Font(baseFont, 8, Font.NORMAL, BaseColor.BLACK);
                Font totalboldFont = new Font(baseFont, 7, Font.BOLD, BaseColor.BLACK);
                Font smallBoldFont = new Font(baseFont, 8, Font.BOLD, BaseColor.BLACK);

                Font approvalboldFont = new Font(baseFont, 8, Font.BOLD, BaseColor.BLACK);

                //PdfWriter.GetInstance(doc, ms);
                string firmPFNumber = list1.Count > 0 ? list1[0].pfno?.ToString() ?? "" : "";
                string firmESICNumber = list1.Count > 0 ? list1[0].esino?.ToString() ?? "" : "";
                string monthName = "Invalid Month";
                if (int.TryParse(request.fk_monthId, out int monthInt) && monthInt >= 1 && monthInt <= 12)
                {
                    monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthInt);
                }
                var pdfWriter = PdfWriter.GetInstance(doc, ms);
                pdfWriter.PageEvent = new SalaryRegisterPageEvent(
                    dynamicTitle,
                    dynamicTitle2,
                    dynamicTitle1,
                    caption,
                    monthName,
                    request.fk_yearId,
                    firmPFNumber,
                    firmESICNumber
                );
                doc.Open();



                //----------------------------new---------------------------

                int totalColumns = 15;

                PdfPTable mainTable = new PdfPTable(totalColumns);
                //            mainTable.WidthPercentage = 100;

                //            mainTable.SetWidths(new float[]
                //            {
                //2f,4.5f,3f,3f,3f,2.5f,2.5f,3f,3.5f,3f,2.5f,3f,3f,3f,3.5f
                //            });
                mainTable.WidthPercentage = 100;
                mainTable.SetWidths(new float[] { 2f, 4.5f, 3f, 3f, 3f, 2.5f, 2.5f, 3f, 3.5f, 3f, 2.5f, 3f, 3f, 3f, 3.5f });


                // ================= ROW 1 =================

                // ================= ROW 1 =================

                mainTable.AddCell(new PdfPCell(new Phrase("S.No.\n\nID #", normalFont))
                {
                    Rowspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3
                });

                mainTable.AddCell(new PdfPCell(new Phrase("Particulars", boldFont))
                {
                    Colspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3,

                    // ONLY top border rakho
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER
                });

                mainTable.AddCell(new PdfPCell(new Phrase("Salary / Wage\nRate", boldFont))
                {
                    Colspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3,

                    // sirf top border
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase("Attendance", boldFont))
                {
                    Colspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3,

                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase("Earnings", boldFont))
                {
                    Colspan = 3,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3,

                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase("Deductions", boldFont))
                {
                    Colspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3,

                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase("Employer Share", boldFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3,
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER
                });

                // ================= NET PAYMENT =================

                mainTable.AddCell(new PdfPCell(new Phrase("Net\nPayment", boldFont))
                {
                    Rowspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });

                // ================= SIGNATURE WITH REVENUE STAMP =================

                mainTable.AddCell(new PdfPCell(new Phrase("Signature with\nRevenue Stamp", boldFont))
                {
                    Rowspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });



                // ================= ROW 2 =================

                // LEFT SIDE
                mainTable.AddCell(new PdfPCell(new Phrase(
                "Employee Name\n\nF/H Name\n\nDesignation\n\nP.F. Number\n\nInsurance Number",
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_LEFT,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    // sirf left + bottom border
                    Border = Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });


                // RIGHT SIDE
                mainTable.AddCell(new PdfPCell(new Phrase(
                "\n\n\n\n\n\n\nU.A.N.\n\nD.O.J.",
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_LEFT,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    // sirf right + bottom border
                    Border = Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });
                string rateLeftHeaderCellStr = !string.IsNullOrWhiteSpace(rateLeftHeaderStr) ? rateLeftHeaderStr : "BASIC\n\nH.R.A.\n\nEDU.ALL\n\nHRA.IW";
                string rateRightHeaderCellStr = !string.IsNullOrWhiteSpace(rateRightHeaderStr) ? rateRightHeaderStr : "SPLALL\n\nWASH.AL\n\nINC/WAS\n\nBONUS\n\nTotal";

                string earnLeftHeaderCellStr = !string.IsNullOrWhiteSpace(earnLeftHeaderStr) ? earnLeftHeaderStr : "BASIC\n\nH.R.A.\n\nEDU.ALL\n\nHRA.IWR";
                string earnCenterHeaderCellStr = !string.IsNullOrWhiteSpace(earnCenterHeaderStr) ? earnCenterHeaderStr : "SPLALL\n\nWASH.AL\n\nINC/WAS\n\nBONUS\n\nOT.AMT";
                string earnRightHeaderCellStr = !string.IsNullOrWhiteSpace(earnRightHeaderStr) ? earnRightHeaderStr : "INCENTI\n\nREIMBUR\n\nL.IN CAS\n\nHELP.AL\n\nTotal";

                string dedLeftHeaderCellStr = !string.IsNullOrWhiteSpace(dedLeftHeaderStr) ? dedLeftHeaderStr : "E.P.F.\n\nE.S.I.C.\n\nADVAN.";
                string dedRightHeaderCellStr = !string.IsNullOrWhiteSpace(dedRightHeaderStr) ? dedRightHeaderStr : "V.P.F.\n\nI.TAX\n\nCANTEE\n\nNP DED\n\nTotal";

                mainTable.AddCell(new PdfPCell(new Phrase(
                rateLeftHeaderCellStr,
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    // sirf left + bottom border
                    Border = Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase(
                rateRightHeaderCellStr,
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    // sirf right + bottom border
                    Border = Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });

                mainTable.AddCell(new PdfPCell(new Phrase(
                "W.D.\n\nH.D.\n\nC.L.\n\nE.L.\n\nOT.HR",
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase(
                "S.L.\n\nC.H.\n\nW.P.\n\nP.D.",
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase(
                earnLeftHeaderCellStr,
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });

                mainTable.AddCell(new PdfPCell(new Phrase(
                earnCenterHeaderCellStr,
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.BOTTOM_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase(
                earnRightHeaderCellStr,
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase(
                dedLeftHeaderCellStr,
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });
                mainTable.AddCell(new PdfPCell(new Phrase(
                dedRightHeaderCellStr,
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });

                mainTable.AddCell(new PdfPCell(new Phrase(
                "Pension\n\nDifference\n\nE.S.I.C.\n\nTotal",
                smallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_TOP,
                    Padding = 3,
                    MinimumHeight = 55f,

                    Border = Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });




                //-----------------------new----------------------------




                //===== DATA ROWS =====
                mainTable.HeaderRows = 2;

                // ===== GRAND TOTAL VARIABLES ===== added by pp 20 April
                decimal totWD = 0, totHD = 0, totCL = 0, totEL = 0, totOTHrs = 0;
                decimal totSL = 0, totCH = 0, totWP = 0, totPaidDays = 0;

                decimal totEarnBasic = 0, totEarnHRA = 0, totEdu = 0, totHRALW = 0;
                decimal totEarnSpl = 0, totEarnUniform = 0, totEarnIncentive = 0, totEarnBonus = 0, totEarnOT = 0;
                decimal totIncentive = 0, totReimbur = 0, totLINCase = 0, totHelper = 0, totEarningTotal = 0;

                decimal totPF = 0, totESI = 0, totAdvance = 0, totVolPF = 0, totIT = 0, totCanteen = 0, totNPDed = 0, totDeductionTotal = 0;

                decimal totPension = 0, totDiff = 0, totEmployerShare = 0;
                decimal totNetPay = 0;
                // end

                int rowNo = 1;
                foreach (var item in list)
                {

                    // Fixed rate fields rendered                    // Salary Rates calculation
                    decimal salaryTotal = 0;
                    foreach (var rHead in rateHeadList)
                    {
                        decimal val = GetVal(item, "Rate_" + rHead);
                        if (val == 0) val = GetVal(item, rHead);
                        salaryTotal += val;
                    }
                    if (rateHeadList.Count == 0)
                    {
                        decimal basicRate = GetVal(item, "Rate_Basic");
                        decimal hraRate = GetVal(item, "Rate_HRA");
                        decimal eduRate = GetVal(item, "EDUAL");
                        decimal hralwRate = GetVal(item, "HRALW");
                        decimal splRate = GetVal(item, "Rate_SpecialAllowance");
                        decimal uniformRate = GetVal(item, "Rate_UniformAllowance");
                        decimal incentiveRate = GetVal(item, "Rate_Incentive");
                        decimal bonusRate = GetVal(item, "Rate_BonusPay");
                        salaryTotal = basicRate + hraRate + eduRate + hralwRate + splRate + uniformRate + incentiveRate + bonusRate;
                    }

                    // Earnings calculation
                    decimal earnBasic = GetVal(item, "Basic");
                    decimal earnHRA = GetVal(item, "HRA");
                    decimal eduearning = GetVal(item, "EDUAL");
                    decimal hralwearning = GetVal(item, "HRALW");
                    decimal earnDA = GetVal(item, "DA");
                    decimal earnOther = GetVal(item, "Other");
                    decimal earnCEA = GetVal(item, "CEA");

                    decimal earnSpl = GetVal(item, "SpecialAllowance");
                    decimal earnUniform = GetVal(item, "UniformAllowance");
                    decimal earnOT = GetVal(item, "OTPay");
                    decimal earnIncentive = GetVal(item, "Incentive");
                    decimal earnBonus = GetVal(item, "BonusPay");
                    decimal earnHelperallowance = GetVal(item, "Helperallowance");
                    decimal Incentive = GetVal(item, "Incentive2");
                    decimal Reimbur = GetVal(item, "Reimbur");
                    decimal LINCase = GetVal(item, "LINCase");

                    decimal earningTotal = 0;
                    foreach (var eHead in earningHeadList)
                    {
                        earningTotal += GetVal(item, eHead);
                    }
                    if (earningHeadList.Count == 0)
                    {
                        earningTotal = earnBasic + earnHRA + eduearning + hralwearning + earnCEA +
                                       earnSpl + earnUniform + earnOT + earnIncentive +
                                       earnBonus + earnHelperallowance + Incentive + Reimbur + LINCase + earnDA + earnOther;
                    }

                    // Deductions calculation
                    decimal pf = GetVal(item, "PF");
                    decimal esi = GetVal(item, "ESI");
                    decimal advance = GetVal(item, "Advance");

                    decimal volpf = GetVal(item, "VolPF");
                    decimal it = GetVal(item, "IT");
                    decimal canteen = GetVal(item, "Canteen");
                    decimal npded = GetVal(item, "NPded");

                    decimal deductionTotal = 0;
                    foreach (var dHead in deductionHeadList)
                    {
                        deductionTotal += GetVal(item, dHead);
                    }
                    if (deductionHeadList.Count == 0)
                    {
                        deductionTotal = pf + esi + advance + volpf + it + canteen + npded;
                    }

                    // Employer share
                    decimal pension = GetVal(item, "pensionfund");
                    decimal diffrence = GetVal(item, "epfdiff");
                    decimal employershare = pension + diffrence + esi;

                    // Calculate net pay dynamically if zero or absent
                    decimal netPayVal = GetVal(item, "NetPay");
                    if (netPayVal == 0 && (earningTotal > 0 || deductionTotal > 0))
                    {
                        netPayVal = earningTotal - deductionTotal;
                    }

                    string srNoEmpCode = $"{rowNo}\n{item.EmpCode?.ToString() ?? ""}";
                    mainTable.AddCell(new PdfPCell(new Phrase(srNoEmpCode, smallFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 2,
                        Border = Rectangle.BOX,
                        BorderWidth = 0.5f,
                        MinimumHeight = 35f
                    });

                    string particularsLeft =
                    $"{item.EmpCode?.ToString() ?? ""}\n\n" +
                    $"{item.EmpName?.ToString() ?? ""}\n\n" +
                    $"{item.FatherName?.ToString() ?? ""}\n\n" +
                    $"{item.DesignationName?.ToString() ?? ""}\n\n" +
                    $"{item.PFNo?.ToString() ?? ""}\n\n" +
                    $"{item.ESINo?.ToString() ?? ""}";

                    mainTable.AddCell(new PdfPCell(new Phrase(particularsLeft, smallFont))
                    {
                        HorizontalAlignment = Element.ALIGN_LEFT,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER | Rectangle.LEFT_BORDER,
                        MinimumHeight = 35f
                    });

                    string particularsRight =
                    $"\n\n\n\n\n\n\n{item.UANNo?.ToString() ?? ""}\n\n{item.JoiningDate?.ToString() ?? ""}";

                    mainTable.AddCell(new PdfPCell(new Phrase(particularsRight, smallFont))
                    {
                        HorizontalAlignment = Element.ALIGN_LEFT,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER,
                        MinimumHeight = 35f
                    });

                    string salaryLeft = rateParts[0].Count > 0
                        ? string.Join("\n\n", rateParts[0].Select(h => {
                            decimal val = GetVal(item, "Rate_" + h);
                            if (val == 0) val = GetVal(item, h);
                            return val.ToString();
                        }))
                        : $"{GetVal(item, "Rate_Basic")}\n\n{GetVal(item, "Rate_HRA")}\n\n{GetVal(item, "EDUAL")}\n\n{GetVal(item, "HRALW")}";

                    mainTable.AddCell(new PdfPCell(new Phrase(salaryLeft, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER | Rectangle.LEFT_BORDER,
                        MinimumHeight = 35f
                    });

                    string salaryRight = rateParts[1].Count > 0
                        ? string.Join("\n\n", rateParts[1].Select(h => {
                            decimal val = GetVal(item, "Rate_" + h);
                            if (val == 0) val = GetVal(item, h);
                            return val.ToString();
                        })) + $"\n\n{salaryTotal}"
                        : $"{GetVal(item, "Rate_SpecialAllowance")}\n\n{GetVal(item, "Rate_UniformAllowance")}\n\n{GetVal(item, "Rate_Incentive")}\n\n{GetVal(item, "Rate_BonusPay")}\n\n{salaryTotal}";

                    mainTable.AddCell(new PdfPCell(new Phrase(salaryRight, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER,
                        MinimumHeight = 35f
                    });


                    // ===== ATTENDANCE LEFT =====
                    string attendanceLeft =
                    $"{item.WD?.ToString() ?? "0"}\n\n" +
                    $"{item.HD?.ToString() ?? "0"}\n\n" +
                    $"{item.CL?.ToString() ?? "0"}\n\n" +
                    $"{item.EL?.ToString() ?? "0"}\n\n" +
                    $"{item.OTHrs?.ToString() ?? "0"}";

                    mainTable.AddCell(new PdfPCell(new Phrase(attendanceLeft, smallFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER | Rectangle.TOP_BORDER,
                        MinimumHeight = 35f
                    });


                    // ===== ATTENDANCE RIGHT =====
                    string attendanceRight =
                    $"{item.sl?.ToString() ?? "0"}\n\n" +
                    $"{item.CH?.ToString() ?? "0"}\n\n" +
                    $"{item.WP?.ToString() ?? "0"}\n\n" +
                    $"{item.PaidDays?.ToString() ?? "0"}";

                    mainTable.AddCell(new PdfPCell(new Phrase(attendanceRight, smallFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER | Rectangle.TOP_BORDER,
                        MinimumHeight = 35f
                    });

                    string earningLeft = earningParts[0].Count > 0
                        ? string.Join("\n\n", earningParts[0].Select(h => GetVal(item, h).ToString()))
                        : $"{earnBasic}\n\n{earnHRA}\n\n{eduearning}\n\n{hralwearning}";

                    mainTable.AddCell(new PdfPCell(new Phrase(earningLeft, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER | Rectangle.LEFT_BORDER,
                        MinimumHeight = 35f
                    });

                    string earningCenter = earningParts[1].Count > 0
                        ? string.Join("\n\n", earningParts[1].Select(h => GetVal(item, h).ToString()))
                        : $"{earnSpl}\n\n{earnUniform}\n\n{earnIncentive}\n\n{earnBonus}\n\n{earnOT}";

                    mainTable.AddCell(new PdfPCell(new Phrase(earningCenter, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER,
                        MinimumHeight = 35f
                    });

                    string earningRight = earningParts[2].Count > 0
                        ? string.Join("\n\n", earningParts[2].Select(h => GetVal(item, h).ToString())) + $"\n\n{earningTotal}"
                        : $"{Incentive}\n\n{Reimbur}\n\n{LINCase}\n\n{earnHelperallowance}\n\n{earningTotal}";

                    mainTable.AddCell(new PdfPCell(new Phrase(earningRight, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER,
                        MinimumHeight = 35f
                    });

                    string deductionLeft = deductionParts[0].Count > 0
                        ? string.Join("\n\n", deductionParts[0].Select(h => GetVal(item, h).ToString()))
                        : $"{pf}\n\n{esi}\n\n{advance}";

                    mainTable.AddCell(new PdfPCell(new Phrase(deductionLeft, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER | Rectangle.LEFT_BORDER,
                        MinimumHeight = 35f
                    });

                    string deductionRight = deductionParts[1].Count > 0
                        ? string.Join("\n\n", deductionParts[1].Select(h => GetVal(item, h).ToString())) + $"\n\n{deductionTotal}"
                        : $"{volpf}\n\n{it}\n\n{canteen}\n\n{npded}\n\n{deductionTotal}";

                    mainTable.AddCell(new PdfPCell(new Phrase(deductionRight, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER,
                        BorderWidth = 0.5f,
                        MinimumHeight = 35f
                    });

                    // Employer Share (ONLY 1 COLUMN)
                    string empShareData =
 $"{pension}\n" +
 $"{diffrence}\n" +
  $"{esi}\n\n" +
 $"{employershare}";
                    mainTable.AddCell(new PdfPCell(new Phrase(empShareData, normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_RIGHT,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.BOX,
                        BorderWidth = 0.5f,
                        MinimumHeight = 35f
                    });

                    // Net Payment
                    mainTable.AddCell(new PdfPCell(new Phrase(netPayVal.ToString(), normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_RIGHT,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.BOX,
                        BorderWidth = 0.5f,
                        MinimumHeight = 35f
                    });

                    // Signature
                    mainTable.AddCell(new PdfPCell(new Phrase("", normalFont))
                    {
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        VerticalAlignment = Element.ALIGN_MIDDLE,
                        Padding = 3,
                        Border = Rectangle.BOX,
                        BorderWidth = 0.5f,
                        MinimumHeight = 35f
                    });

                    // added by pp 20 April
                    // ===== ACCUMULATE =====
                    totWD += GetVal(item, "WD");
                    totHD += GetVal(item, "HD");
                    totCL += GetVal(item, "CL");
                    totEL += GetVal(item, "EL");
                    totOTHrs += GetVal(item, "OTHrs");

                    totSL += GetVal(item, "sl");
                    totCH += GetVal(item, "CH");
                    totWP += GetVal(item, "WP");
                    totPaidDays += GetVal(item, "PaidDays");

                    totEarnBasic += earnBasic;
                    totEarnHRA += earnHRA;
                    totEdu += eduearning;
                    totHRALW += hralwearning;
                    totEarnSpl += earnSpl;
                    totEarnUniform += earnUniform;
                    totEarnIncentive += earnIncentive;
                    totEarnBonus += earnBonus;
                    totEarnOT += earnOT;
                    totIncentive += Incentive;
                    totReimbur += Reimbur;
                    totLINCase += LINCase;
                    totHelper += earnHelperallowance;
                    totEarningTotal += earningTotal;

                    totPF += pf;
                    totESI += esi;
                    totAdvance += advance;
                    totVolPF += volpf;
                    totIT += it;
                    totCanteen += canteen;
                    totNPDed += npded;
                    totDeductionTotal += deductionTotal;

                    totPension += pension;
                    totDiff += diffrence;
                    totEmployerShare += employershare;

                    totNetPay += netPayVal;



                    //end


                    rowNo++;
                }

                //

                // ===== TOTAL ROW =====

                // S.No empty
                mainTable.AddCell(new PdfPCell(new Phrase(" ", boldFont)));

                // TOTAL label
                mainTable.AddCell(new PdfPCell(new Phrase("TOTAL", boldFont))
                {
                    Colspan = 4,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                });

                // Attendance LEFT
                string totalAttendanceLeft =
                $"{totWD}\n\n{totHD}\n\n{totCL}\n\n{totEL}\n\n{totOTHrs}";
                mainTable.AddCell(new PdfPCell(new Phrase(totalAttendanceLeft, normalFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });

                // Attendance RIGHT
                string totalAttendanceRight =
                $"{totSL}\n\n{totCH}\n\n{totWP}\n\n{totPaidDays}";
                mainTable.AddCell(new PdfPCell(new Phrase(totalAttendanceRight, normalFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Border = Rectangle.TOP_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER
                });

                // Earnings LEFT
                string totalEarnLeft = earningParts[0].Count > 0
                    ? string.Join("\n\n", earningParts[0].Select(h => list.Cast<object>().Sum(item => GetVal(item, h)).ToString()))
                    : $"{totEarnBasic}\n\n{totEarnHRA}\n\n{totEdu}\n\n{totHRALW}";
                mainTable.AddCell(new PdfPCell(new Phrase(totalEarnLeft, normalFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });

                // Earnings CENTER
                string totalEarnCenter = earningParts[1].Count > 0
                    ? string.Join("\n\n", earningParts[1].Select(h => list.Cast<object>().Sum(item => GetVal(item, h)).ToString()))
                    : $"{totEarnSpl}\n\n{totEarnUniform}\n\n{totEarnIncentive}\n\n{totEarnBonus}\n\n{totEarnOT}";
                mainTable.AddCell(new PdfPCell(new Phrase(totalEarnCenter, normalFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Border = Rectangle.TOP_BORDER | Rectangle.BOTTOM_BORDER
                });

                Phrase earnRightPhrase = new Phrase();
                if (earningParts[2].Count > 0)
                {
                    foreach (var h in earningParts[2])
                    {
                        decimal totVal = list.Cast<object>().Sum(item => GetVal(item, h));
                        earnRightPhrase.Add(new Chunk($"{totVal}\n\n", normalFont));
                    }
                }
                else
                {
                    earnRightPhrase.Add(new Chunk($"{totIncentive}\n\n", normalFont));
                    earnRightPhrase.Add(new Chunk($"{totReimbur}\n\n", normalFont));
                    earnRightPhrase.Add(new Chunk($"{totLINCase}\n\n", normalFont));
                    earnRightPhrase.Add(new Chunk($"{totHelper}\n\n", normalFont));
                }

                // bold total
                earnRightPhrase.Add(new Chunk($"{totEarningTotal}", totalboldFont));
                mainTable.AddCell(new PdfPCell(earnRightPhrase)
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Border = Rectangle.TOP_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                });

                // Deductions LEFT
                string totalDedLeft = deductionParts[0].Count > 0
                    ? string.Join("\n\n", deductionParts[0].Select(h => list.Cast<object>().Sum(item => GetVal(item, h)).ToString()))
                    : $"{totPF}\n\n{totESI}\n\n{totAdvance}";
                mainTable.AddCell(new PdfPCell(new Phrase(totalDedLeft, normalFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Border = Rectangle.TOP_BORDER | Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER
                });

                Phrase dedRightPhrase = new Phrase();
                if (deductionParts[1].Count > 0)
                {
                    foreach (var h in deductionParts[1])
                    {
                        decimal totVal = list.Cast<object>().Sum(item => GetVal(item, h));
                        dedRightPhrase.Add(new Chunk($"{totVal}\n\n", normalFont));
                    }
                }
                else
                {
                    dedRightPhrase.Add(new Chunk($"{totVolPF}\n\n", normalFont));
                    dedRightPhrase.Add(new Chunk($"{totIT}\n\n", normalFont));
                    dedRightPhrase.Add(new Chunk($"{totCanteen}\n\n", normalFont));
                    dedRightPhrase.Add(new Chunk($"{totNPDed}\n\n", normalFont));
                }

                // bold total
                dedRightPhrase.Add(new Chunk($"{totDeductionTotal}", totalboldFont));

                mainTable.AddCell(new PdfPCell(dedRightPhrase)
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Border = Rectangle.TOP_BORDER | Rectangle.RIGHT_BORDER | Rectangle.BOTTOM_BORDER,
                });

                // Employer Share
                //string totalEmpShare =
                //$"{totPension}\n{totDiff}\n{totESI}\n\n{totEmployerShare}";
                //mainTable.AddCell(new PdfPCell(new Phrase(totalEmpShare, normalFont))
                //{
                //    HorizontalAlignment = Element.ALIGN_RIGHT,
                //    VerticalAlignment = Element.ALIGN_MIDDLE
                //});

                Phrase empSharePhrase = new Phrase();

                // normal values
                empSharePhrase.Add(new Chunk($"{totPension}\n", normalFont));
                empSharePhrase.Add(new Chunk($"{totDiff}\n", normalFont));
                empSharePhrase.Add(new Chunk($"{totESI}\n\n", normalFont));

                // 🔥 bold only this
                empSharePhrase.Add(new Chunk($"{totEmployerShare}", totalboldFont));

                mainTable.AddCell(new PdfPCell(empSharePhrase)
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3
                });

                // Net Pay
                mainTable.AddCell(new PdfPCell(new Phrase(totNetPay.ToString(), totalboldFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 3
                });

                // Signature blank
                mainTable.AddCell(new PdfPCell(new Phrase("")));

                //

                doc.Add(mainTable);


                // adding  approved details


                //doc.Add(new Paragraph("\n"));

                PdfPTable approvalTable = new PdfPTable(4);
                approvalTable.WidthPercentage = 100;
                approvalTable.SetWidths(new float[] { 2f, 3f, 2f, 5f });

                approvalTable.AddCell(new PdfPCell(new Phrase("APPROVAL DETAILS", boldFont))
                {
                    MinimumHeight = 25f,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                });

                approvalTable.AddCell(new PdfPCell(new Phrase(
                    $"Approved By : {list.FirstOrDefault()?.ApprovedByName ?? ""}",
                    approvalboldFont))
                {
                    MinimumHeight = 25f,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                });

                //approvalTable.AddCell(new PdfPCell(new Phrase(
                //    $"Date : {list.FirstOrDefault()?.approveddate ?? ""}",
                //    normalFont))
                //{
                //    VerticalAlignment = Element.ALIGN_MIDDLE
                //});
                approvalTable.AddCell(new PdfPCell(new Phrase(
    $"Date : {(list.FirstOrDefault()?.approveddate != null ? Convert.ToDateTime(list.FirstOrDefault().approveddate).ToString("dd/MM/yyyy") : "")}",
    approvalboldFont))
                {
                    MinimumHeight = 25f,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                });

                approvalTable.AddCell(new PdfPCell(new Phrase(

                    $"Remark : {list.FirstOrDefault()?.approvalremark ?? ""}",
                    approvalboldFont))
                {
                    MinimumHeight = 25f,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                });

                doc.Add(approvalTable);




                //
                doc.Close();
                return ms.ToArray();
            }
        }







        void AddSubColumns(PdfPTable table, List<dynamic> values, int fixedCols, Font font)
        {
            for (int i = 0; i < fixedCols; i++)
            {
                string text = i < values.Count ? values[i].ToString() : ""; // fill blank if missing
                PdfPCell cell = new PdfPCell(new Phrase(text, font))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    BackgroundColor = BaseColor.LIGHT_GRAY,
                    Padding = 2,
                    Border = Rectangle.BOX,
                    BorderWidth = 0.5f,
                    MinimumHeight = 25f
                };
                table.AddCell(cell);
            }
        }

        void AddDataColumns(PdfPTable table, dynamic item, List<dynamic> heads, int colsCount, Font font, string alignment)
        {
            for (int i = 0; i < colsCount; i++)
            {
                string value = "0";

                if (i < heads.Count)
                {
                    string headName = heads[i].ToString();

                    // Try to get the property value from the item using reflection or dynamic access
                    try
                    {
                        // Try to access the property dynamically
                        var propertyValue = GetDynamicProperty(item, headName);
                        value = propertyValue?.ToString() ?? "0";
                    }
                    catch
                    {
                        value = "0"; // Default value if property not found
                    }
                }

                int horizontalAlign = alignment == "RIGHT" ? Element.ALIGN_RIGHT :
                                    alignment == "CENTER" ? Element.ALIGN_CENTER : Element.ALIGN_LEFT;

                PdfPCell cell = new PdfPCell(new Phrase(value, font))
                {
                    HorizontalAlignment = horizontalAlign,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 2,
                    Border = Rectangle.BOX,
                    BorderWidth = 0.5f,
                    MinimumHeight = 35f
                };
                table.AddCell(cell);
            }
        }



        object GetDynamicProperty(dynamic obj, string propertyName)
        {
            try
            {
                if (obj is System.Data.DataRow row)
                    return row.Table.Columns.Contains(propertyName) ? row[propertyName] : "0";

                if (obj is IDictionary<string, object> dict)
                    return dict.TryGetValue(propertyName, out object value) ? value : "0";

                var prop = obj.GetType().GetProperty(propertyName);
                if (prop != null)
                    return prop.GetValue(obj);

                return "0";
            }
            catch
            {
                return "0";
            }
        }









        [HttpPost("GenerateForm5")]
        [Authorize]
        public async Task<IActionResult> GenerateForm5([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;
            var (totalCount, employees, company) = await exportReportRepository.PDFdata(request);

            Console.WriteLine($"Total Count: {totalCount}");
            Console.WriteLine($"Employees Count: {employees?.Count() ?? 0}");

            if (employees == null || !employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });

            var pdfBytes = GenerateForm5(employees, company, request);
            var fileName = $"GenerateForm5{request.fk_monthId}_{request.fk_yearId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }



        private byte[] GenerateForm5(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, ReportModelRequest request)
        {
            var list = items.ToList();
            var list1 = item2.ToList();
            using (var ms = new MemoryStream())
            {
                Document doc = new Document(PageSize.A4.Rotate(), 20, 20, 20, 20);
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // =========================
                //  HEADER
                // =========================


                AddCaptionTextForm5(doc, "Form No. 5", 12, true);

                AddCenteredTextForm5(doc, "The Employee's Provident Fund Scheme 1952 [Paragraph 35 (2) (b)]", 11, true);
                AddCenteredTextForm5(doc, "The Employee's Pension Scheme 1995 [Paragraph 10 (A)]", 10, false);
                AddCenteredTextForm5(doc, "The Employee's Deposit Linked Insurance Scheme 1976 [Paragraph 10 (A)]", 10, false);
                AddCenteredTextForm5(doc, "To be sent to the Commissioner with Form 2 (EPF & EPS)", 10, false);

                doc.Add(new Paragraph("\n"));
                string monthName = "Invalid Month"; // 
                if (int.TryParse(request.fk_monthId, out int monthInt) && monthInt >= 1 && monthInt <= 12)
                {
                    monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthInt);
                }

                AddCenteredTextForm5(doc, "RETURN of Employee's qualifying membership of the EPF, EPS and EDLI Fund " +
                                       $"for the first time during the month of {monthName},{request.fk_yearId}", 10, true);

                doc.Add(new Paragraph("\n"));

                // =========================
                //  ESTABLISHMENT DETAILS
                // =========================
                Paragraph est = new Paragraph();
                foreach (var item in list)
                {
                    est.Add(new Chunk($"Name and Address of the Factory/Establishment : {item.compname}\n"));
                    est.Add(new Chunk($"{item.address1}\n"));
                }
                //est.Add(new Chunk("Name and Address of the Factory/Establishment : Autofit Pvt. Ltd.\n"));
                //est.Add(new Chunk("Plot No. 40-41, Sector -4, IMT, Manesar, Gurugram-122050\n"));
                est.Add(new Chunk("Code No. of the Factory/Establishment : MRNOI/49290/000\n"));
                //est.Add(new Chunk("Form No. 5\n", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11)));
                doc.Add(est);

                doc.Add(new Paragraph("\n"));

                // =========================
                //  EMPLOYEE DETAILS TABLE
                // =========================
                PdfPTable table = new PdfPTable(10);
                table.WidthPercentage = 100;
                table.SetWidths(new float[] { 5f, 10f, 15f, 18f, 7f, 12f, 5f, 12f, 16f, 16f });

                // Header Row
                AddTableHeaderForm5(table, "SNo.");
                AddTableHeaderForm5(table, "A/C No.");
                AddTableHeaderForm5(table, "Name of Employee");
                AddTableHeaderForm5(table, "Father's/Husband's Name");
                AddTableHeaderForm5(table, "Age");
                AddTableHeaderForm5(table, "Date of Birth");
                AddTableHeaderForm5(table, "Sex");
                AddTableHeaderForm5(table, "Date of Eligibility");
                AddTableHeaderForm5(table, "Period of Previous\r\nService (Excluding\r\nPeriod of breaks) as on\r\nthe Date of Joining Fund\r\n(Enclosed) scheme\r\ncertificate is available");
                AddTableHeaderForm5(table, "Remarks Previous\r\naccount No. and\r\nParticulars of\r\nPrevious service\r\n(if any)");



                // Example Rows (You can loop your data here)
                //AddRowForm5(table, "1", "12345", "RAMLAL KUMAR", "DINESH SINGH", "20", "20-Sep-1998", "M", "02-Jun-2025", "", "");
                //AddRowForm5(table, "2", "12346", "KALEEM", "ISMAIL", "25", "01-Jan-2000", "M", "05-Jun-2025", "", "");
                //AddRowForm5(table, "3", "12347", "SAROJ KUMAR", "AMAR PAL", "20", "01-Jan-2005", "M", "13-Jun-2025", "", "");
                int srNo = 1;
                foreach (var emp in list1)
                {
                    AddRowForm5(
                        table,
                        srNo.ToString(),
                        emp.bankaccountno?.ToString(),
                        emp.empname?.ToString(),
                        emp.fathername?.ToString(),
                        emp.Age?.ToString(),
                        emp.dob?.ToString(),
                        emp.gender?.ToString(),
                        emp.doj?.ToString(),
                        "",
                        ""
                    );
                    srNo++; // increment serial number
                }

                doc.Add(table);

                doc.Add(new Paragraph("\n\n"));

                // =========================
                //  FOOTER
                // =========================
                Paragraph footer = new Paragraph();
                footer.Add(new Chunk("1. This form should be accompanied by declaration and nomination Form 2 (EPF & EPS).\n"));
                footer.Add(new Chunk("\nSignature of the Employer or any Authorised Officer\n"));
                doc.Add(footer);

                doc.Close();
                return ms.ToArray();
            }
        }




        [Authorize]
        [HttpPost("DownloadSalaryPayoutReport")]
        public async Task<IActionResult> DownloadSalaryPayoutReport(string? reportName, [FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;

            var (totalCount, dynamicResults) = await exportReportRepository.ViewSalaryReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new { IsSuccess = false, StatusCode = 400, Message = "No data found" });

            // Build date header dynamically
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fromdate) && !string.IsNullOrEmpty(request.todate))
            {
                dateHeaderText = $"From : {DateTime.Parse(request.fromdate):dd/MM/yyyy} To : {DateTime.Parse(request.todate):dd/MM/yyyy}";
            }
            else if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);

                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";
            }

            // else ->no date header




            var fileBytes = await ExcelHelper.GenerateExcelReportPayoutAsync(
    reportName: request.ReportName ?? reportName ?? "Report",
    results: results,
    contractorName: request.ContractorName,
    dateHeaderText: dateHeaderText,
    getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),
    columnsToSum: new[] { "ArrearAmount", "LWP", "OTHrs", "Rate_Basic", "Rate_HRA", "Rate_DA", "Rate_Other", "Rate_CEA", "Rate_SpecialAllowance", "Rate_UniformAllowance", "Rate_OTPay", "Rate_Incentive", "Rate_BonusPay", "Rate_NoticePay", "RateGross", "Basic", "HRA", "DA", "Other", "CEA", "SpecialAllowance", "UniformAllowance", "OTPay", "Incentive", "BonusPay", "NoticePay", "EarnGross", "LTA", "BooksPeriodicals", "DriverSalary", "FuelReimbursement", "TelephoneReimbursement", "Helperallowance", "GrossTotal", "Advance", "Canteen", "NoticeAdj", "Loan", "ESI", "AdvanceSalary", "PF", "VolPF", "LWF", "ProfTax", "IT", "TotalDeductions", "NetPay", "Current Salary", "Previous Salary", "OTHours", "OTGross", "OT", "Salary for EPF", "Salary for EPS", "Salary for EDLI", "Admin Charges", "Employee's Cont", "Employer's Cont-EPS(8.33%) A/C-10", "Admn. Charges on EDLI A/C-22", "Total Contribution", "Wages", "ESI (1.75%)", "ESI (4.75%)" }
);

            return File(fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }


        [HttpPost("DownloadSalaryPayoutPdf")]
        [Authorize]
        public async Task<IActionResult> DownloadSalaryPayoutPdf([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

            // Salary Payout export type
            request.ExportType = 100;
            var (totalCount, dynamicResults) = await exportReportRepository.ViewSalaryPayoutPdfAsync(request);

            var employees = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No data found." });

            // Build date header dynamically
            string dateHeaderText = "";
            if (!string.IsNullOrEmpty(request.fk_monthId) && !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);
                var selectedMonth = new DateTime(year, month, 1);
                dateHeaderText = $"For the month of {selectedMonth:MMMM yyyy}";


            }

            string companyName = "Company";

            var companyList = await exportReportRepository.GetCompanyNameAsync(decryptedCompanyId);

            if (companyList != null)
            {
                companyName = (string)(companyList.CompanyName) ?? "Company";
            }

            var pdfBytes = GenerateSalaryPayoutPdf(employees, companyName, dateHeaderText, request.ContractorName);
            var fileName = $"SalaryPayout_{DateTime.Now:yyyyMMddHHmmss}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }


        private byte[] GenerateSalaryPayoutPdf(List<IDictionary<string, object>> employees, string companyName, string dateHeaderText, string costCentreDesc)
        {
            using (var ms = new MemoryStream())
            {
                var doc = new Document(PageSize.A4.Rotate(), 25f, 25f, 36f, 36f);
                BaseFont baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                Font titleFont = new Font(baseFont, 12, Font.BOLD, BaseColor.BLACK);
                Font subtitleFont = new Font(baseFont, 9, Font.NORMAL, BaseColor.BLACK);
                Font headerFont = new Font(baseFont, 8, Font.BOLD, BaseColor.BLACK);
                Font rowFont = new Font(baseFont, 8, Font.NORMAL, BaseColor.BLACK);
                Font batchHeaderFont = new Font(baseFont, 9, Font.BOLD, BaseColor.BLACK);

                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Add Header
                var title = new Paragraph(companyName, titleFont) { Alignment = Element.ALIGN_LEFT, IndentationLeft = 8f };
                doc.Add(title);

                var title1 = new Paragraph(string.IsNullOrEmpty(costCentreDesc) ? " " : costCentreDesc, subtitleFont) { Alignment = Element.ALIGN_LEFT, IndentationLeft = 8f };
                doc.Add(title1);

                var title2 = new Paragraph("Salary Payout Report - " + dateHeaderText, subtitleFont) { Alignment = Element.ALIGN_LEFT, IndentationLeft = 8f, SpacingAfter = 10f };
                doc.Add(title2);

                var groupedEmployees = employees.GroupBy(e =>
                {
                    string batchKey = e.ContainsKey("SalPayoutBatch") ? e["SalPayoutBatch"]?.ToString() : "";
                    return string.IsNullOrEmpty(batchKey) ? "Pending Payout" : batchKey;
                }).ToList();

                foreach (var group in groupedEmployees)
                {
                    var firstEmp = group.First();
                    string batchKey = group.Key;
                    string payoutBy = firstEmp.ContainsKey("SalPayoutBy") ? firstEmp["SalPayoutBy"]?.ToString() : "";
                    string payoutDate = firstEmp.ContainsKey("SalPayoutDate") ? firstEmp["SalPayoutDate"]?.ToString() : "";
                    string payoutBankName = firstEmp.ContainsKey("SalPayoutBankName") ? firstEmp["SalPayoutBankName"]?.ToString() : "";
                    string payoutRefNo = firstEmp.ContainsKey("SalPayoutRefNo") ? firstEmp["SalPayoutRefNo"]?.ToString() : "";
                    string payoutIFSC = firstEmp.ContainsKey("SalPayoutRemark") ? firstEmp["SalPayoutRemark"]?.ToString() : "";

                    string batchHeaderText = batchKey == "Pending Payout"
                        ? "Pending Payout"
                        : $"Batch: {batchKey}  |  Payout By: {payoutBy}  |  Date: {payoutDate}  |  Bank: {payoutBankName}  |  Ref No: {payoutRefNo}  |  Remark: {payoutIFSC}";

                    var batchTitle = new Paragraph(batchHeaderText, batchHeaderFont) { Alignment = Element.ALIGN_LEFT, SpacingAfter = 5f, IndentationLeft = 8f };
                    doc.Add(batchTitle);

                    // Add Table
                    var table = new PdfPTable(8) { WidthPercentage = 100, SpacingAfter = 15f };
                    float[] widths = new float[] { 1.5f, 3f, 3f, 2f, 2.5f, 2f, 2f, 2f };
                    table.SetWidths(widths);

                    string[] headers = { "Emp Code", "Emp Name", "Bank Name", "IFSC Code", "Account No", "Gross Total", "Total Deductions", "Net Pay" };
                    foreach (var header in headers)
                    {
                        var cell = new PdfPCell(new Phrase(header, headerFont))
                        {
                            BackgroundColor = BaseColor.LIGHT_GRAY,
                            HorizontalAlignment = Element.ALIGN_CENTER,
                            Padding = 5f
                        };
                        table.AddCell(cell);
                    }

                    decimal totalGross = 0, totalDed = 0, totalNet = 0;

                    foreach (var emp in group)
                    {
                        table.AddCell(new PdfPCell(new Phrase(emp.ContainsKey("EmpCode") ? emp["EmpCode"]?.ToString() : (emp.ContainsKey("Empcode") ? emp["Empcode"]?.ToString() : ""), rowFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(emp.ContainsKey("EmpName") ? emp["EmpName"]?.ToString() : (emp.ContainsKey("Empname") ? emp["Empname"]?.ToString() : ""), rowFont)));
                        table.AddCell(new PdfPCell(new Phrase(emp.ContainsKey("BankName") ? emp["BankName"]?.ToString() : (emp.ContainsKey("bankname") ? emp["bankname"]?.ToString() : ""), rowFont)));
                        table.AddCell(new PdfPCell(new Phrase(emp.ContainsKey("IFSCCode") ? emp["IFSCCode"]?.ToString() : (emp.ContainsKey("IFSCCODE") ? emp["IFSCCODE"]?.ToString() : ""), rowFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(emp.ContainsKey("BankAcNo") ? emp["BankAcNo"]?.ToString() : "", rowFont)) { HorizontalAlignment = Element.ALIGN_CENTER });

                        decimal gross = emp.ContainsKey("GrossTotal") ? Convert.ToDecimal(emp["GrossTotal"] ?? 0) : 0;
                        decimal ded = emp.ContainsKey("TotalDeductions") ? Convert.ToDecimal(emp["TotalDeductions"] ?? 0) : 0;
                        decimal net = emp.ContainsKey("NetPay") ? Convert.ToDecimal(emp["NetPay"] ?? 0) : 0;

                        totalGross += gross;
                        totalDed += ded;
                        totalNet += net;

                        table.AddCell(new PdfPCell(new Phrase(gross.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
                        table.AddCell(new PdfPCell(new Phrase(ded.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
                        table.AddCell(new PdfPCell(new Phrase(net.ToString("0.00"), rowFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
                    }

                    // Add footer totals
                    var footerCell = new PdfPCell(new Phrase("Total", headerFont))
                    {
                        Colspan = 5,
                        HorizontalAlignment = Element.ALIGN_RIGHT,
                        Padding = 5f,
                        BackgroundColor = BaseColor.LIGHT_GRAY
                    };
                    table.AddCell(footerCell);
                    table.AddCell(new PdfPCell(new Phrase(totalGross.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY });
                    table.AddCell(new PdfPCell(new Phrase(totalDed.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY });
                    table.AddCell(new PdfPCell(new Phrase(totalNet.ToString("0.00"), headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, BackgroundColor = BaseColor.LIGHT_GRAY });

                    doc.Add(table);
                }

                doc.Close();

                return ms.ToArray();
            }
        }










        private void AddCaptionTextForm5(Document doc, string text, int fontSize, bool bold)
        {
            iTextSharp.text.Font font = bold
                ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);

            Paragraph p = new Paragraph(text, font);
            p.Alignment = Element.ALIGN_CENTER;
            doc.Add(p);
        }

        private void AddCenteredTextForm5(Document doc, string text, int fontSize, bool bold)
        {
            iTextSharp.text.Font font = bold
                ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);

            Paragraph p = new Paragraph(text, font);
            p.Alignment = Element.ALIGN_LEFT;
            doc.Add(p);
        }

        private void AddTableHeaderForm5(PdfPTable table, string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8)));
            cell.BackgroundColor = BaseColor.LIGHT_GRAY;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 4;
            table.AddCell(cell);
        }
        private void AddRowForm5(PdfPTable table, string sno, string ac, string name, string father, string age, string dob, string sex, string eligibility, string periodofPrevious, string remarks)
        {
            table.AddCell(GetCellForm5(sno));
            table.AddCell(GetCellForm5(ac));
            table.AddCell(GetCellForm5(name));
            table.AddCell(GetCellForm5(father));
            table.AddCell(GetCellForm5(age));
            table.AddCell(GetCellForm5(dob));
            table.AddCell(GetCellForm5(sex));
            table.AddCell(GetCellForm5(eligibility));
            table.AddCell(GetCellForm5(periodofPrevious));
            table.AddCell(GetCellForm5(remarks));
        }

        private PdfPCell GetCellForm5(string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA, 8)));
            cell.Padding = 4;
            return cell;
        }

        //form 10

        [HttpPost("GenerateForm10")]
        [Authorize]
        public async Task<IActionResult> GenerateForm10([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;
            var (totalCount, employees, company) = await exportReportRepository.PDFdata(request);



            if (employees == null || !employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });

            var pdfBytes = GenerateForm10(employees, company, request);
            var fileName = $"GenerateForm10{request.fk_monthId}_{request.fk_yearId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }


        private byte[] GenerateForm10(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, ReportModelRequest request)
        {
            // Landscape mode for wider table
            var list = items.ToList();
            var list1 = item2.ToList();
            using (var ms = new MemoryStream())
            {
                Document doc = new Document(PageSize.A4.Rotate(), 20, 20, 20, 20);
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                AddCaptionForm10(doc, "Form No. 10", 11, true);

                // =========================
                //  HEADER
                // =========================
                AddCenteredForm10(doc, "The Employee's Provident Fund Scheme 1952 [Paragraph 35 (2) (b)]", 11, true);
                AddCenteredForm10(doc, "The Employee's Pension Scheme 1995 [Paragraph 10 (A)]", 10, false);
                AddCenteredForm10(doc, "The Employee's Deposit Linked Insurance Scheme 1976 [Paragraph 10 (A)]", 10, false);

                doc.Add(new Paragraph("\n"));

                // =========================
                //  ESTABLISHMENT INFO
                // =========================
                Paragraph est = new Paragraph();
                foreach (var item in list)
                {
                    est.Add(new Chunk($"Name and Address of the Factory/Establishment : {item.compname}\n"));
                    est.Add(new Chunk($"{item.address1}\n"));
                }
                //est.Add(new Chunk("Name and Address of the Factory/Establishment : Autofit Pvt. Ltd.\n"));
                //est.Add(new Chunk("Plot No. 40-41, Sector -4, IMT, Manesar, Gurugram-122050\n", FontFactory.GetFont(FontFactory.HELVETICA, 10)));
                doc.Add(est);

                doc.Add(new Paragraph("\n"));
                string monthName = "Invalid Month"; // 
                if (int.TryParse(request.fk_monthId, out int monthInt) && monthInt >= 1 && monthInt <= 12)
                {
                    monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthInt);
                }
                Paragraph est1 = new Paragraph();
                est1.Add(new Chunk($"Return of Member Leaving Service During the month of {monthName},{request.fk_yearId} "));
                est1.Add(new Chunk("                        Code No. of the Factory/Establishment : MRNOI/49290/000",
                                  FontFactory.GetFont(FontFactory.HELVETICA, 9)));
                doc.Add(est1);

                doc.Add(new Paragraph("\n"));

                // =========================
                //  EMPLOYEE TABLE
                // =========================
                PdfPTable table = new PdfPTable(7);
                table.WidthPercentage = 100;
                table.SetWidths(new float[] { 5f, 12f, 20f, 20f, 12f, 20f, 11f });

                AddHeaderForm10(table, "SNo.");
                AddHeaderForm10(table, "A/C No.");
                AddHeaderForm10(table, "Name of Employee");
                AddHeaderForm10(table, "Father's / Husband's Name");
                AddHeaderForm10(table, "Date of Leaving Service");
                AddHeaderForm10(table, "Reason for Leaving Service");
                AddHeaderForm10(table, "Remarks");

                //// Example data rows (replace with your DB/list loop)
                //AddRowForm10(table, "1", "101110491037", "PAWAN RAGHAV", "", "19-Jun-2025", "Resigned", "");
                //AddRowForm10(table, "2", "101233687961", "LALIT KUMAR", "RAMSARAN", "13-Jun-2025", "Resigned", "");
                //AddRowForm10(table, "3", "101271361350", "CHHATERPAL", "JASWANT", "04-Jun-2025", "Retired", "");
                //AddRowForm10(table, "4", "101586374789", "NARESH KUMAR", "JAI PAL", "18-Jun-2025", "Dismissed", "");

                int srNo = 1;
                foreach (var emp in list1)
                {
                    AddRowForm10(
                        table,
                        srNo.ToString(),
                        emp.bankaccountno?.ToString(),
                        emp.empname?.ToString(),
                        emp.fathername?.ToString(),

                        emp.leftdate?.ToString(),
                        emp.leftremarks?.ToString(),
                        emp.leftremarks?.ToString()

                    );
                    srNo++; // increment serial number
                }
                doc.Add(table);

                doc.Add(new Paragraph("\n\n"));

                // =========================
                //  FOOTER
                // =========================
                Paragraph footer = new Paragraph();
                footer.Add(new Chunk("Signature of the Employer or any authorised officer\n\n"));
                footer.Add(new Chunk("Please state whether the member is (a) retiring according to para 69 (1) or (2), " +
                                     "(b) Leaving India permanently, (c) Retirement, (d) Dismissal, (e) Discharge, " +
                                     "(f) Resignation, (g) Employment elsewhere, (h) Attained age of 58 years.\n\n"));
                footer.Add(new Chunk("Certified that the member mentioned above at Serial No. ________ Shri __________ " +
                                     "was paid / not paid retrenchment compensation of Rs. ________ under the Industrial Disputes Act, 1974."));
                doc.Add(footer);

                doc.Close();
                return ms.ToArray();
            }
        }
        private void AddCaptionForm10(Document doc, string text, int fontSize, bool bold)
        {
            iTextSharp.text.Font font = bold
                 ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                 : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);

            Paragraph p = new Paragraph(text, font);
            p.Alignment = Element.ALIGN_CENTER;
            doc.Add(p);
        }

        private void AddCenteredForm10(Document doc, string text, int fontSize, bool bold)
        {
            iTextSharp.text.Font font = bold
                 ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                 : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);

            Paragraph p = new Paragraph(text, font);
            p.Alignment = Element.ALIGN_LEFT;
            doc.Add(p);
        }

        private void AddHeaderForm10(PdfPTable table, string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
            cell.BackgroundColor = BaseColor.LIGHT_GRAY;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 4;
            table.AddCell(cell);
        }

        private void AddRowForm10(PdfPTable table, string sno, string acNo, string empName,
                            string fatherName, string leavingDate, string reason, string remarks)
        {
            table.AddCell(GetCellForm10(sno));
            table.AddCell(GetCellForm10(acNo));
            table.AddCell(GetCellForm10(empName));
            table.AddCell(GetCellForm10(fatherName));
            table.AddCell(GetCellForm10(leavingDate));
            table.AddCell(GetCellForm10(reason));
            table.AddCell(GetCellForm10(remarks));
        }

        private PdfPCell GetCellForm10(string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA, 9)));
            cell.Padding = 4;
            return cell;
        }


        // pf statement


        [HttpPost("GeneratePFStatement")]
        [Authorize]
        public async Task<IActionResult> GeneratePFStatement([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;
            var (totalCount, employees, company) = await exportReportRepository.PDFdata(request);



            if (employees == null || !employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });

            var pdfBytes = GeneratePFStatement(employees, company, request);
            var fileName = $"GeneratePFStatement{request.fk_monthId}_{request.fk_yearId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }


        private byte[] GeneratePFStatement(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, ReportModelRequest request)
        {
            var list = items.ToList();
            var list1 = item2.ToList();
            using (var ms = new MemoryStream())
            {
                Document doc = new Document(PageSize.A4.Rotate(), 20, 20, 20, 20);
                //PdfWriter.GetInstance(doc, new FileStream(filePath, FileMode.Create));
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // =========================
                // HEADER
                //
                //foreach (var item in list)
                //{
                //    est.Add(new Chunk($"Name and Address of the Factory/Establishment : {item.compname}\n"));
                //    est.Add(new Chunk($"{item.address1}\n"));
                //}

                foreach (var item in list)
                {
                    AddCenteredPFStatement(doc, item.compname, 14, true);
                    AddCenteredPFStatement(doc, item.address1, 10, false);

                }

                doc.Add(new Paragraph("\n"));

                string monthName = "Invalid Month"; // 
                if (int.TryParse(request.fk_monthId, out int monthInt) && monthInt >= 1 && monthInt <= 12)
                {
                    monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthInt);
                }
                AddCenteredPFStatement(doc, $"PF Statement For The Month / Year Of {monthName} {request.fk_yearId}", 12, true);
                //AddCenteredPFStatement(doc, "Location : DHARUHERA", 11, false);

                doc.Add(new Paragraph("\n"));

                // =========================
                // EMPLOYEE TABLE
                // =========================
                PdfPTable empTable = new PdfPTable(10);
                empTable.WidthPercentage = 100;
                empTable.SetWidths(new float[] { 5f, 10f, 20f, 12f, 12f, 12f, 10f, 10f, 10f, 10f });

                string[] headers = { "SN", "Code", "Name", "PF No.", "Wages", "Pen. Wages", "PF", "Vol. PF", "EPF", "EPS" };
                foreach (var h in headers) AddHeaderPFStatement(empTable, h);

                // Example row (replace with DB loop)
                // AddRowPFStatement(empTable, "DH001061", "Joginder Kumar", "12345", "30,000", "15,000", "3,600", "0", "2,350", "1,250");

                int srNo = 1;
                double TPFGross = 0; double PensionWages = 0; double PF = 0; double VolPF = 0; double TEPF_Ac1 = 0; double TEPS_Ac10 = 0;
                foreach (var emp in list)
                {
                    TPFGross = TPFGross + Convert.ToDouble(emp.TPFGross?.ToString() ?? "0");
                    PensionWages = PensionWages + Convert.ToDouble(emp.PensionWages?.ToString() ?? "0");
                    PF = PF + Convert.ToDouble(emp.PF?.ToString() ?? "0");
                    VolPF = VolPF + Convert.ToDouble(emp.VolPF?.ToString() ?? "0");
                    TEPF_Ac1 = TEPF_Ac1 + Convert.ToDouble(emp.TEPF_Ac1?.ToString() ?? "0");
                    TEPS_Ac10 = TEPS_Ac10 + Convert.ToDouble(emp.TEPS_Ac10?.ToString() ?? "0");

                    AddRowPFStatement(
                        empTable,
                        srNo.ToString(),
                        emp.empcode?.ToString(),
                        emp.empname?.ToString(),
                        emp.pfno?.ToString() ?? "0",
                        emp.TPFGross?.ToString() ?? "0",
                        emp.PensionWages?.ToString() ?? "0",
                        emp.PF?.ToString() ?? "0",
                         emp.VolPF?.ToString() ?? "0",
                           emp.TEPF_Ac1?.ToString() ?? "0",
                             emp.TEPS_Ac10?.ToString() ?? "0"

                    );
                    srNo++; // increment serial number
                }

                // Sub Total
                PdfPCell subtotal;
                subtotal = new PdfPCell(new Phrase("Sub Total :", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                subtotal.Colspan = 4; subtotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subtotal);

                subtotal = new PdfPCell(new Phrase(TPFGross.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                subtotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subtotal);

                subtotal = new PdfPCell(new Phrase(PensionWages.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                subtotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subtotal);

                subtotal = new PdfPCell(new Phrase(PF.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                subtotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subtotal);

                subtotal = new PdfPCell(new Phrase(VolPF.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                subtotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subtotal);

                subtotal = new PdfPCell(new Phrase(TEPF_Ac1.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                subtotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subtotal);

                subtotal = new PdfPCell(new Phrase(TEPS_Ac10.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                subtotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subtotal);


                // Sub Total
                PdfPCell grandTotal;
                grandTotal = new PdfPCell(new Phrase("Grand Total :", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                grandTotal.Colspan = 4; grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);

                grandTotal = new PdfPCell(new Phrase(TPFGross.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);

                grandTotal = new PdfPCell(new Phrase(PensionWages.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);

                grandTotal = new PdfPCell(new Phrase(PF.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);

                grandTotal = new PdfPCell(new Phrase(VolPF.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);

                grandTotal = new PdfPCell(new Phrase(TEPF_Ac1.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);

                grandTotal = new PdfPCell(new Phrase(TEPS_Ac10.ToString(), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
                grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);

                doc.Add(empTable);

                doc.Add(new Paragraph("\n"));

                // =========================
                // ACCOUNT SUMMARY
                // =========================
                Paragraph accSummary = new Paragraph("Account Summary\n\n",
                    FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11));
                doc.Add(accSummary);

                PdfPTable accTable = new PdfPTable(6);
                accTable.WidthPercentage = 80;
                accTable.SetWidths(new float[] { 15f, 15f, 15f, 15f, 15f, 25f });

                string[] accHeaders = { "Ac1", "Ac10", "Ac2", "Ac21", "Ac22", "Total" };
                foreach (var h in accHeaders) AddHeaderPFStatement(accTable, h);


                //accTable.AddCell(GetCellPFStatement("5,950.00"));
                //accTable.AddCell(GetCellPFStatement("1,250.00"));
                //accTable.AddCell(GetCellPFStatement("150.00"));
                //accTable.AddCell(GetCellPFStatement("75.00"));
                //accTable.AddCell(GetCellPFStatement("0.00"));
                //accTable.AddCell(GetCellPFStatement("7,425.00"));

                //var summary = list1.LastOrDefault();
                //if (summary != null)
                //{
                //    accTable.AddCell(GetCellPFStatement(summary.Ac1?.ToString() ?? "0"));
                //    accTable.AddCell(GetCellPFStatement(summary.Ac10?.ToString() ?? "0"));
                //    accTable.AddCell(GetCellPFStatement(summary.Ac2?.ToString() ?? "0"));
                //    accTable.AddCell(GetCellPFStatement(summary.Ac21?.ToString() ?? "0"));
                //    accTable.AddCell(GetCellPFStatement(summary.Ac22?.ToString() ?? "0"));
                //    accTable.AddCell(GetCellPFStatement(summary.Total?.ToString() ?? "0"));
                //}

                var accData = list1.FirstOrDefault();
                // take second object for TotalAcSummary
                var totalData = list1.Skip(1).FirstOrDefault();

                if (accData != null)
                {
                    accTable.AddCell(GetCellPFStatement(accData.Ac1?.ToString() ?? "0"));
                    accTable.AddCell(GetCellPFStatement(accData.Ac10?.ToString() ?? "0"));
                    accTable.AddCell(GetCellPFStatement(accData.Ac2?.ToString() ?? "0"));
                    accTable.AddCell(GetCellPFStatement(accData.Ac21?.ToString() ?? "0"));
                    accTable.AddCell(GetCellPFStatement(accData.Ac22?.ToString() ?? "0"));

                    // pick Total from the second object
                    string total = totalData?.TotalAcSummary?.ToString() ?? "0";
                    accTable.AddCell(GetCellPFStatement(total));
                }

                doc.Add(accTable);

                doc.Close();
                return ms.ToArray();
            }
        }

        // =========================
        //   HELPER METHODS
        // =========================
        private void AddCenteredPFStatement(Document doc, string text, int fontSize, bool bold)
        {
            iTextSharp.text.Font font = bold
                 ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                 : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);

            Paragraph p = new Paragraph(text, font);
            p.Alignment = Element.ALIGN_CENTER;
            doc.Add(p);
        }

        private void AddHeaderPFStatement(PdfPTable table, string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
            cell.BackgroundColor = BaseColor.LIGHT_GRAY;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 4;
            table.AddCell(cell);
        }

        private void AddRowPFStatement(PdfPTable table, string srNo, string code, string name, string pfNo,
                            string wages, string penWages, string pf, string volPf, string epf, string eps)
        {
            table.AddCell(GetCellPFStatement(srNo)); // SN
            table.AddCell(GetCellPFStatement(code));
            table.AddCell(GetCellPFStatement(name));
            table.AddCell(GetCellPFStatement(pfNo));
            table.AddCell(GetCellPFStatement(wages));
            table.AddCell(GetCellPFStatement(penWages));
            table.AddCell(GetCellPFStatement(pf));
            table.AddCell(GetCellPFStatement(volPf));
            table.AddCell(GetCellPFStatement(epf));
            table.AddCell(GetCellPFStatement(eps));
        }

        private PdfPCell GetCellPFStatement(string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA, 9)));
            cell.Padding = 4;
            return cell;
        }

        // pf statement


        [HttpPost("GenerateESIStatement")]
        [Authorize]
        public async Task<IActionResult> GenerateESIStatement([FromBody] ReportModelRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            request.fk_companyid = decryptedCompanyId;
            var (totalCount, employees, company) = await exportReportRepository.PDFdata(request);



            if (employees == null || !employees.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });

            var pdfBytes = GenerateESIStatement(employees, company, request);
            var fileName = $"GenerateESIStatement{request.fk_monthId}_{request.fk_yearId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }





        private byte[] GenerateESIStatement(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, ReportModelRequest requesth)
        {
            var list = items.ToList();   // employees + company details
            var list1 = item2.ToList();  // account summary
            using (var ms = new MemoryStream())
            {
                Document doc = new Document(PageSize.A4.Rotate(), 20, 20, 20, 20);
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // =========================
                // HEADER (use first company info)
                // =========================
                var company = list.FirstOrDefault();
                string compName = company?.compname?.ToString() ?? "";
                string compAddress = company?.address1?.ToString() ?? "";
                string monthYear = company?.monthyear?.ToString() ?? "";

                AddCenteredESIStatement(doc, compName, 14, true);
                AddCenteredESIStatement(doc, compAddress, 10, false);
                doc.Add(new Paragraph("\n"));
                AddCenteredESIStatement(doc, $"ESI Statement For The Month / Year Of {monthYear}", 12, true);
                doc.Add(new Paragraph("\n"));

                // =========================
                // EMPLOYEE TABLE
                // =========================
                PdfPTable empTable = new PdfPTable(12);
                empTable.WidthPercentage = 100;
                empTable.SetWidths(new float[] { 5f, 15f, 12f, 12f, 10f, 12f, 10f, 10f, 10f, 10f, 10f, 10f });

                string[] headers = { "SNo", "Name", "ESI No.", "Wages", "ESI", "ESI Emr [3.25%]",
                             "OTWages", "OTEsi", "OTEsiEmr", "NHWages", "NHEsi", "NHEsiEmr" };

                foreach (var h in headers) AddHeaderESIStatement(empTable, h);

                int srNo = 1;
                double totalWages = 0, totalEsi = 0, totalEsiEmr = 0;

                foreach (var emp in list.Skip(1))  // skip first because it is company info
                {
                    AddRowESIStatement(
                        empTable,
                        srNo.ToString(),
                        emp.empname?.ToString(),
                        emp.esino?.ToString() ?? "0",
                        emp.ESIGross?.ToString() ?? "0",
                        emp.ESI?.ToString() ?? "0",
                        emp.ESIEmr?.ToString() ?? "0",
                        emp.OTESIGross?.ToString() ?? "0",
                        emp.OTESI?.ToString() ?? "0",
                        emp.OTESIEmr?.ToString() ?? "0",
                        emp.NHESIGross?.ToString() ?? "0",
                        emp.NHESI?.ToString() ?? "0",
                        emp.NHESIEmr?.ToString() ?? "0"
                    );

                    totalWages += Convert.ToDouble(emp.ESIGross ?? 0);
                    totalEsi += Convert.ToDouble(emp.ESI ?? 0);
                    totalEsiEmr += Convert.ToDouble(emp.ESIEmr ?? 0);
                    srNo++;
                }

                // Sub Total
                PdfPCell subTotal = new PdfPCell(new Phrase(
                    $"Sub Total :   {totalWages}   {totalEsi}   {totalEsiEmr}",
                    FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)
                ));
                subTotal.Colspan = 12;
                subTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(subTotal);

                // Grand Total (use list1 summary)
                var summary = list1.FirstOrDefault();
                string grandWages = summary?.ESIGross?.ToString() ?? "0";
                string grandEsi = summary?.ESI?.ToString() ?? "0";
                string grandEsiEmr = summary?.ESIEmr?.ToString() ?? "0";

                PdfPCell grandTotal = new PdfPCell(new Phrase(
                    $"Grand Total :   {grandWages}   {grandEsi}   {grandEsiEmr}",
                    FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)
                ));
                grandTotal.Colspan = 12;
                grandTotal.HorizontalAlignment = Element.ALIGN_RIGHT;
                empTable.AddCell(grandTotal);



                doc.Add(empTable);
                doc.Add(new Paragraph("\n"));

                // =========================
                // ACCOUNT SUMMARY
                // =========================
                Paragraph accSummary = new Paragraph("Account Summary\n",
                    FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11));
                doc.Add(accSummary);

                PdfPTable accTable = new PdfPTable(4);
                accTable.WidthPercentage = 60;
                accTable.SetWidths(new float[] { 20f, 20f, 20f, 20f });
                var summary22 = list1.Skip(1).FirstOrDefault();
                string[] accHeaders = { "Salary", "Employee Share", "Employer Share", "Total" };
                foreach (var h in accHeaders) AddHeaderESIStatement(accTable, h);

                accTable.AddCell(GetCellESIStatement(grandWages));
                accTable.AddCell(GetCellESIStatement(grandEsi));
                accTable.AddCell(GetCellESIStatement(grandEsiEmr));
                accTable.AddCell(GetCellESIStatement(summary22?.TotalAcSummary?.ToString() ?? "0"));

                doc.Add(accTable);

                doc.Close();
                return ms.ToArray();
            }
        }

        // =========================
        // HELPER METHODS
        // =========================
        private void AddCenteredESIStatement(Document doc, string text, int fontSize, bool bold)
        {
            iTextSharp.text.Font font = bold
                 ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                 : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);

            Paragraph p = new Paragraph(text, font);
            p.Alignment = Element.ALIGN_CENTER;
            doc.Add(p);
        }

        private void AddHeaderESIStatement(PdfPTable table, string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
            cell.BackgroundColor = BaseColor.LIGHT_GRAY;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 4;
            table.AddCell(cell);
        }

        private void AddRowESIStatement(PdfPTable table, string sno, string name, string esiNo, string wages,
                            string esi, string esi475, string otWages, string otEsi, string otEsiEmr,
                            string nhWages, string nhEsi, string nhEsiEmr)
        {
            table.AddCell(GetCellESIStatement(sno));
            table.AddCell(GetCellESIStatement(name));
            table.AddCell(GetCellESIStatement(esiNo));
            table.AddCell(GetCellESIStatement(wages));
            table.AddCell(GetCellESIStatement(esi));
            table.AddCell(GetCellESIStatement(esi475));
            table.AddCell(GetCellESIStatement(otWages));
            table.AddCell(GetCellESIStatement(otEsi));
            table.AddCell(GetCellESIStatement(otEsiEmr));
            table.AddCell(GetCellESIStatement(nhWages));
            table.AddCell(GetCellESIStatement(nhEsi));
            table.AddCell(GetCellESIStatement(nhEsiEmr));
        }

        private PdfPCell GetCellESIStatement(string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA, 9)));
            cell.Padding = 4;
            return cell;
        }





        [HttpPost("DownloadFORMDPdf")]

        [Authorize]

        public async Task<IActionResult> GenerateEqualRemunerationPdf([FromBody] ReportModelRequest request)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                var (totalCount, employees) = await exportReportRepository.EqualRemuneration(request);

                if (employees == null || !employees.Any())
                    return BadRequest(new { IsSuccess = false, Message = "No records found." });

                var pdfBytes = GenerateEqualRemunerationPdfBytes(employees, request);
                var fileName = $"EqualRemuneration_{request.fk_monthId}_{request.fk_yearId}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = "Error generating PDF.", Error = ex.Message });
            }
        }

        private byte[] GenerateEqualRemunerationPdfBytes(IEnumerable<dynamic> employees, ReportModelRequest request)
        {
            var list = employees.ToList();

            using (var ms = new MemoryStream())
            {
                iTextSharp.text.Document pdfDoc = new iTextSharp.text.Document(iTextSharp.text.PageSize.A4.Rotate(), 20, 20, 20, 20);
                PdfWriter writer = PdfWriter.GetInstance(pdfDoc, ms);

                var titleFont = FontFactory.GetFont("Arial", 12, iTextSharp.text.Font.BOLD);
                var headerFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.BOLD);
                var bodyFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.NORMAL);
                var bodyFontBold = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.BOLD);
                var smallFont = FontFactory.GetFont("Arial", 7, iTextSharp.text.Font.NORMAL);

                pdfDoc.Open();

                // Get header info from first row
                var firstRow = list.FirstOrDefault();
                string companyName = firstRow?.CompanyName?.ToString() ?? "N/A";
                string companyAddress = firstRow?.CompanyAddress?.ToString() ?? "N/A";
                string period = firstRow?.Period?.ToString() ?? "N/A";
                int totalWorkers = Convert.ToInt32(firstRow?.TotalWorkers ?? 0);
                int totalMale = Convert.ToInt32(firstRow?.TotalMaleWorkers ?? 0);
                int totalFemale = Convert.ToInt32(firstRow?.TotalFemaleWorkers ?? 0);

                // CHANGE 1: Create header table that will be reused
                PdfPTable headerTable = CreateHeaderTable(companyName, companyAddress, period, totalWorkers, totalMale, totalFemale,
                    titleFont, bodyFont, bodyFontBold, smallFont);
                pdfDoc.Add(headerTable);

                // CHANGE 2: Create main table with KeepTogether = false to allow page breaks
                PdfPTable mainTable = new PdfPTable(11);
                mainTable.WidthPercentage = 100;
                mainTable.SpacingBefore = 8f;
                mainTable.KeepTogether = false; // Allow table to break across pages
                mainTable.HeaderRows = 2; // Repeat column headers on each page
                mainTable.SetWidths(new float[] { 4f, 12f, 18f, 6f, 6f, 9f, 9f, 9f, 9f, 9f, 9f });

                // Add table headers
                AddTableHeaderCell(mainTable, "Sl. No.", headerFont, 1);
                AddTableHeaderCell(mainTable, "Category of workers", headerFont, 1);
                AddTableHeaderCell(mainTable, "Brief Description of Work", headerFont, 1);
                AddTableHeaderCell(mainTable, "No. of Men Employed", headerFont, 1);
                AddTableHeaderCell(mainTable, "No. of Women Employed", headerFont, 1);
                AddTableHeaderCell(mainTable, "Rate of Remuneration paid", headerFont, 1);
                AddTableHeaderCell(mainTable, "Basic Wages and DA", headerFont, 1);
                AddTableHeaderCell(mainTable, "Dearness Allowance", headerFont, 1);
                AddTableHeaderCell(mainTable, "House Rent Allowance", headerFont, 1);
                AddTableHeaderCell(mainTable, "Others Allowance", headerFont, 1);
                AddTableHeaderCell(mainTable, "Cash Value of Concessional supply of Essential Commodities", headerFont, 1);

                // Column numbers row
                for (int i = 1; i <= 11; i++)
                {
                    PdfPCell cell = new PdfPCell(new Phrase(i.ToString(), bodyFont));
                    cell.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.Border = iTextSharp.text.Rectangle.BOX;
                    cell.Padding = 3f;
                    cell.MinimumHeight = 20f;
                    cell.BackgroundColor = BaseColor.LIGHT_GRAY;
                    mainTable.AddCell(cell);
                }

                // CHANGE 3: Track rows and add page breaks manually with headers
                int rowCount = 0;
                int rowsPerPage = 6; // Changed from 4 to 6 rows per page for better layout

                foreach (var row in list)
                {
                    // CHANGE 4: Add header on new page after specified rows
                    if (rowCount > 0 && rowCount % rowsPerPage == 0)
                    {
                        pdfDoc.Add(mainTable); // Add current table
                        pdfDoc.NewPage(); // New page

                        // Add header on new page
                        PdfPTable newPageHeader = CreateHeaderTable(companyName, companyAddress, period, totalWorkers, totalMale, totalFemale,
                            titleFont, bodyFont, bodyFontBold, smallFont);
                        pdfDoc.Add(newPageHeader);

                        // Create new table for next page
                        mainTable = new PdfPTable(11);
                        mainTable.WidthPercentage = 100;
                        mainTable.SpacingBefore = 8f;
                        mainTable.KeepTogether = false;
                        mainTable.HeaderRows = 2;
                        mainTable.SetWidths(new float[] { 4f, 12f, 18f, 6f, 6f, 9f, 9f, 9f, 9f, 9f, 9f });

                        // Re-add headers
                        AddTableHeaderCell(mainTable, "Sl. No.", headerFont, 1);
                        AddTableHeaderCell(mainTable, "Category of workers", headerFont, 1);
                        AddTableHeaderCell(mainTable, "Brief Description of Work", headerFont, 1);
                        AddTableHeaderCell(mainTable, "No. of Men Employed", headerFont, 1);
                        AddTableHeaderCell(mainTable, "No. of Women Employed", headerFont, 1);
                        AddTableHeaderCell(mainTable, "Rate of Remuneration paid", headerFont, 1);
                        AddTableHeaderCell(mainTable, "Basic Wages and DA", headerFont, 1);
                        AddTableHeaderCell(mainTable, "Dearness Allowance", headerFont, 1);
                        AddTableHeaderCell(mainTable, "House Rent Allowance", headerFont, 1);
                        AddTableHeaderCell(mainTable, "Others Allowance", headerFont, 1);
                        AddTableHeaderCell(mainTable, "Cash Value of Concessional supply of Essential Commodities", headerFont, 1);

                        // Column numbers
                        for (int i = 1; i <= 11; i++)
                        {
                            PdfPCell cell = new PdfPCell(new Phrase(i.ToString(), bodyFont));
                            cell.HorizontalAlignment = Element.ALIGN_CENTER;
                            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            cell.Border = iTextSharp.text.Rectangle.BOX;
                            cell.Padding = 3f;
                            cell.MinimumHeight = 20f;
                            cell.BackgroundColor = BaseColor.LIGHT_GRAY;
                            mainTable.AddCell(cell);
                        }
                    }

                    AddDataRow(mainTable,
                        row.SlNo?.ToString() ?? "",
                        row.CategoryOfWorkers?.ToString() ?? "",
                        row.BriefDescription?.ToString() ?? "",
                        row.NoOfMenEmployed?.ToString() ?? "0",
                        row.NoOfWomenEmployed?.ToString() ?? "0",
                        Math.Round(Convert.ToDecimal(row.RateOfRemuneration ?? 0), 0).ToString(),
                        Math.Round(Convert.ToDecimal(row.BasicWages ?? 0), 0).ToString(),
                        Math.Round(Convert.ToDecimal(row.DearnessAllowance ?? 0), 0).ToString(),
                        Math.Round(Convert.ToDecimal(row.HouseRentAllowance ?? 0), 0).ToString(),
                        Math.Round(Convert.ToDecimal(row.OthersAllowance ?? 0), 0).ToString(),
                        Math.Round(Convert.ToDecimal(row.CashValueEssentialCommodities ?? 0), 0).ToString(),
                        bodyFont);

                    rowCount++;
                }

                pdfDoc.Add(mainTable); // Add final table
                pdfDoc.Close();
                return ms.ToArray();
            }
        }

        // CHANGE 5: New helper method to create reusable header table
        private PdfPTable CreateHeaderTable(string companyName, string companyAddress, string period,
            int totalWorkers, int totalMale, int totalFemale,
            iTextSharp.text.Font titleFont, iTextSharp.text.Font bodyFont,
            iTextSharp.text.Font bodyFontBold, iTextSharp.text.Font smallFont)
        {
            PdfPTable headerContainer = new PdfPTable(1);
            headerContainer.WidthPercentage = 100;
            headerContainer.SpacingAfter = 0f;

            // Form D section
            PdfPTable formDTable = new PdfPTable(2);
            formDTable.WidthPercentage = 100;
            formDTable.SetWidths(new float[] { 8f, 92f });

            PdfPCell formDCell = new PdfPCell(new Phrase("FORM D\n(Rule 6)", bodyFontBold));
            formDCell.Border = iTextSharp.text.Rectangle.BOX;
            formDCell.HorizontalAlignment = Element.ALIGN_CENTER;
            formDCell.VerticalAlignment = Element.ALIGN_MIDDLE;
            formDCell.Padding = 4f;
            formDTable.AddCell(formDCell);

            PdfPCell titleCell = new PdfPCell();
            titleCell.Border = iTextSharp.text.Rectangle.NO_BORDER;
            titleCell.HorizontalAlignment = Element.ALIGN_CENTER;

            Paragraph title = new Paragraph("Register of Equal Remuneration", titleFont);
            title.Alignment = Element.ALIGN_CENTER;
            titleCell.AddElement(title);

            Paragraph subtitle = new Paragraph("Register to be maintained by the Employer under Rule 6 of the Equal Remuneration Rules 1976", smallFont);
            subtitle.Alignment = Element.ALIGN_CENTER;
            subtitle.SpacingBefore = 2f;
            titleCell.AddElement(subtitle);

            formDTable.AddCell(titleCell);

            PdfPCell formDContainer = new PdfPCell(formDTable);
            formDContainer.Border = iTextSharp.text.Rectangle.NO_BORDER;
            formDContainer.Padding = 0f;
            headerContainer.AddCell(formDContainer);

            // Company info section
            PdfPTable companyInfoTable = new PdfPTable(2);
            companyInfoTable.WidthPercentage = 100;
            companyInfoTable.SetWidths(new float[] { 70f, 30f });

            PdfPCell companyCell = new PdfPCell();
            companyCell.Border = iTextSharp.text.Rectangle.NO_BORDER;
            companyCell.AddElement(new Phrase("Name of the Establishment and its Address:", bodyFont));
            companyCell.AddElement(new Phrase(companyName, bodyFontBold));
            companyCell.AddElement(new Phrase(companyAddress, bodyFont));
            companyInfoTable.AddCell(companyCell);

            PdfPCell periodCell = new PdfPCell();
            periodCell.Border = iTextSharp.text.Rectangle.NO_BORDER;
            periodCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            periodCell.AddElement(new Phrase($"Period: {period}", bodyFontBold));
            periodCell.AddElement(new Phrase($"Total No. of workers employed: {totalWorkers}", bodyFont));
            periodCell.AddElement(new Phrase($"Total No. of Men workers employed: {totalMale}", bodyFont));
            periodCell.AddElement(new Phrase($"Total No. of Women workers employed: {totalFemale}", bodyFont));
            companyInfoTable.AddCell(periodCell);

            PdfPCell companyContainer = new PdfPCell(companyInfoTable);
            companyContainer.Border = iTextSharp.text.Rectangle.NO_BORDER;
            companyContainer.Padding = 0f;
            companyContainer.PaddingTop = 8f;
            headerContainer.AddCell(companyContainer);

            return headerContainer;
        }

        private void AddTableHeaderCell(PdfPTable table, string text, iTextSharp.text.Font font, int rowspan)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.Border = iTextSharp.text.Rectangle.BOX;
            cell.Padding = 3f;
            cell.PaddingLeft = 2f;
            cell.PaddingRight = 2f;
            cell.Rowspan = rowspan;
            cell.MinimumHeight = 30f;
            cell.BackgroundColor = BaseColor.LIGHT_GRAY;
            table.AddCell(cell);
        }

        private void AddDataRow(PdfPTable table, string col1, string col2, string col3,
            string col4, string col5, string col6, string col7, string col8,
            string col9, string col10, string col11, iTextSharp.text.Font font)
        {
            AddDataCell(table, col1, font, Element.ALIGN_CENTER);
            AddDataCell(table, col2, font, Element.ALIGN_LEFT);
            AddDataCell(table, col3, font, Element.ALIGN_LEFT);
            AddDataCell(table, col4, font, Element.ALIGN_CENTER);
            AddDataCell(table, col5, font, Element.ALIGN_CENTER);
            AddDataCell(table, col6, font, Element.ALIGN_RIGHT);
            AddDataCell(table, col7, font, Element.ALIGN_RIGHT);
            AddDataCell(table, col8, font, Element.ALIGN_RIGHT);
            AddDataCell(table, col9, font, Element.ALIGN_RIGHT);
            AddDataCell(table, col10, font, Element.ALIGN_RIGHT);
            AddDataCell(table, col11, font, Element.ALIGN_RIGHT);
        }

        // CHANGE 6: Reduced cell height for 6 rows per page
        private void AddDataCell(PdfPTable table, string text, iTextSharp.text.Font font, int alignment)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = alignment;
            cell.VerticalAlignment = Element.ALIGN_TOP;
            cell.Border = iTextSharp.text.Rectangle.BOX;
            cell.Padding = 5f;
            cell.PaddingTop = 8f;
            cell.PaddingLeft = 5f;
            cell.PaddingRight = 5f;
            cell.MinimumHeight = 50f; // Reduced from 80f to 50f for 6 rows per page
            table.AddCell(cell);
        }







        [HttpPost("DownloadMusterRollPdf")]
        [Authorize]

        public async Task<IActionResult> DownloadMusterRollPdf([FromBody] ReportModelRequest request)
        {
            // Call repository - returns (int totalCount, IEnumerable<dynamic> data)
            var result = await exportReportRepository.GetMusterRollForPdfAsync(request);

            // ✅ Access the data part of the tuple (Item2)
            if (result.Item2 == null || !result.Item2.Any())
                return BadRequest(new { IsSuccess = false, Message = "No records found." });

            // Generate PDF bytes - pass only the data part
            var pdfBytes = GenerateMusterRollPdf(result.Item2, request);
            var fileName = $"MusterRoll_{request.fk_monthId}_{request.fk_yearId}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }
        //public async Task<IActionResult> DownloadMusterRollPdf([FromBody] ReportModelRequest request)
        //{
        //    // Call repository
        //    var musterData = await exportReportRepository.GetMusterRollForPdfAsync(request );

        //    if (musterData == null || !musterData.Any())
        //        return BadRequest(new { IsSuccess = false, Message = "No records found." });

        //    // Generate PDF bytes
        //    var pdfBytes = GenerateMusterRollPdf(musterData, request);
        //    var fileName = $"MusterRoll_{request.fk_monthId}_{request.fk_yearId}.pdf";
        //    return File(pdfBytes, "application/pdf", fileName);
        //}

        private byte[] GenerateMusterRollPdf(IEnumerable<dynamic> musterData, ReportModelRequest request)
        {
            using (var ms = new MemoryStream())
            {
                // Portrait orientation like the image
                var doc = new Document(PageSize.A4, 40, 40, 40, 40);
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Fonts
                var titleFont = FontFactory.GetFont("Arial", 12, Font.BOLD);
                var headerFont = FontFactory.GetFont("Arial", 10, Font.BOLD);
                var normalFont = FontFactory.GetFont("Arial", 9, Font.NORMAL);
                var smallFont = FontFactory.GetFont("Arial", 8, Font.NORMAL);

                // Loop through each employee (one per page)
                bool isFirst = true;
                foreach (var employee in musterData)
                {
                    if (!isFirst)
                    {
                        doc.NewPage(); // New page for each employee
                    }
                    isFirst = false;

                    // ===== HEADER SECTION =====
                    AddCenteredText(doc, "FORM A", titleFont, 5f);
                    AddCenteredText(doc, "(See Rule 3)", normalFont, 3f);
                    AddCenteredText(doc, "Muster Roll", titleFont, 5f);

                    // Factory name - FULLY DYNAMIC
                    string factoryName = employee.FactoryName?.ToString() ?? "N/A";
                    Paragraph p = new Paragraph { SpacingAfter = 10f };
                    p.Add(new Chunk("Name of the Factory/ plantation :- ", normalFont));
                    p.Add(new Chunk(factoryName, headerFont));
                    doc.Add(p);

                    // ===== POINT 1: Serial Number - DYNAMIC =====
                    AddPointWithBoldValue(doc, "1.", "Serial Number.",
                        employee.EmployeeCode?.ToString() ?? "N/A", normalFont, headerFont, 8f, true);

                    // ===== POINT 2: Name and Father's/Husband's Name - DYNAMIC =====
                    string employeeName = employee.EmployeeName?.ToString() ?? "N/A";
                    string fatherHusbandName = employee.FatherHusbandName?.ToString() ?? "N/A";
                    string fullName = $"{employeeName} D/O {fatherHusbandName}";
                    AddPointWithBoldValue(doc, "2.", "Name of woman and her father's (or, if married, husband's) name.",
                        fullName, normalFont, headerFont, 8f, true);

                    // ===== POINT 3: Date of Appointment - DYNAMIC =====
                    AddPointWithBoldValue(doc, "3.", "Date of appointment.",
                        FormatNullableDate(employee.DateOfAppointment), normalFont, headerFont, 8f, true);

                    // ===== POINT 4: Nature of Work - DYNAMIC =====
                    AddPointWithBoldValue(doc, "4.", "Nature of work.",
                        employee.NatureOfWork?.ToString() ?? "N/A", normalFont, headerFont, 8f, true);

                    // ===== POINT 5: Employment Details Table =====
                    AddPointLabel(doc, "5.", "Dates with month and year in which she is employed, laid off and not employed.",
                        normalFont, 5f);

                    // Create small table for point 5
                    PdfPTable employmentTable = new PdfPTable(5);
                    employmentTable.WidthPercentage = 100;
                    employmentTable.SetWidths(new float[] { 20f, 20f, 20f, 20f, 20f });
                    employmentTable.SpacingBefore = 5f;
                    employmentTable.SpacingAfter = 8f;

                    // Headers
                    AddTableCell(employmentTable, "Month & Year", smallFont, true);
                    AddTableCell(employmentTable, "No. of days employed", smallFont, true);
                    AddTableCell(employmentTable, "No. of days laid off", smallFont, true);
                    AddTableCell(employmentTable, "No. of days not\nemployed", smallFont, true);
                    AddTableCell(employmentTable, "Remark", smallFont, true);

                    // Data row - ALL DYNAMIC
                    string monthYear = employee.MonthYear?.ToString() ?? "N/A";
                    string daysEmployed = employee.DaysEmployed?.ToString() ?? "0";
                    string daysLaidOff = employee.DaysLaidOff?.ToString() ?? "0";
                    string daysNotEmployed = employee.DaysNotEmployed?.ToString() ?? "0";
                    string remark = employee.Remark?.ToString() ?? "-";

                    AddTableCell(employmentTable, monthYear, smallFont, false);
                    AddTableCell(employmentTable, daysEmployed, smallFont, false);
                    AddTableCell(employmentTable, daysLaidOff, smallFont, false);
                    AddTableCell(employmentTable, daysNotEmployed, smallFont, false);
                    AddTableCell(employmentTable, remark, smallFont, false);

                    doc.Add(employmentTable);

                    // ===== POINTS 6-21: All other compliance fields - ALL DYNAMIC =====
                    AddPointWithValue(doc, "6.", "Date on which the woman gives notice under section 6.",
                        FormatNullableDate(employee.NoticeDate), normalFont, 5f);

                    AddPointWithValue(doc, "7.", "Date of discharge/dismissal, if any.",
                        FormatNullableDate(employee.DischargeDate), normalFont, 5f);

                    AddPointWithValue(doc, "8.", "Date of production of proof of pregnancy under section 6.",
                        FormatNullableDate(employee.PregnancyProofDate), normalFont, 5f);

                    AddPointWithValue(doc, "9.", "Date of birth of child.",
                        FormatNullableDate(employee.BirthDate), normalFont, 5f);

                    AddPointWithValue(doc, "10.",
                        "Date of production of proof of delivery/miscarriage/:[Medical Termination of pregnancy/\ntubectomy operation /death.]",
                        FormatNullableDate(employee.DeliveryProofDate), normalFont, 5f);

                    AddPointWithValue(doc, "11.", "Date of production of proof of illness referred to in section 10.",
                        FormatNullableDate(employee.IllnessProofDate), normalFont, 5f);

                    AddPointWithValue(doc, "12.", "Date with the amount of maternity benefit paid in advance of expected delivery.",
                        FormatDateAmountInline(employee.AdvanceBenefitDate, employee.AdvanceBenefitAmount), normalFont, 5f);

                    AddPointWithValue(doc, "13.", "Date with the amount of subsequent payment of maternity benefit.",
                        FormatDateAmountInline(employee.SubsequentBenefitDate, employee.SubsequentBenefitAmount), normalFont, 5f);

                    AddPointWithValue(doc, "14.", "Date with the amount of bonus, if paid, under section 8.",
                        FormatDateAmountInline(employee.BonusDate, employee.BonusAmount), normalFont, 5f);

                    AddPointWithValue(doc, "15.", "Date with the amount of wages paid on account of leave under section 9.",
                        FormatDateAmountInline(employee.LeaveWagesDate, employee.LeaveWagesAmount), normalFont, 5f);

                    AddPointWithValue(doc, "16.", "Date with the amount of wages paid on account of leave under section 10 and period of leave\ngranted",
                        FormatDateAmountInline(employee.Section10LeaveDate, employee.Section10LeaveAmount) +
                        (employee.LeavePeriod != null ? $", Period: {employee.LeavePeriod}" : ""),
                        normalFont, 5f);

                    AddPointWithValue(doc, "17.", "Name of the person nominated by the woman under section 6.",
                        employee.NominatedPerson?.ToString() ?? "NIL", normalFont, 5f);

                    AddPointWithValue(doc, "18.",
                        "If the woman dies, the date of her death, the names of the person to whom maternity benefit\nand/or other amount was paid, the amount thereof, and the date of payment.",
                        FormatDeathInfoInline(employee.DeathDate, employee.DeathBenefitPerson, employee.DeathBenefitAmount),
                        normalFont, 5f);

                    AddPointWithValue(doc, "19.",
                        "If the woman dies and the child survives, the name of the person to whom the amount of\nmaternity benefit was paid on behalf of the child and the period for which it was paid.",
                        FormatChildBenefitInfo(employee.ChildBenefitPerson, employee.ChildBenefitAmount, employee.ChildBenefitPeriod),
                        normalFont, 5f);

                    AddPointWithValue(doc, "20.", "Signature of the employer or 2[the mine or circus] authenticating the entries in the muster-roll.",
                        employee.EmployerSignature?.ToString() ?? "", normalFont, 5f);

                    AddPointWithValue(doc, "21.", "Remarks column for the use of the Inspector.",
                        employee.InspectorRemarks?.ToString() ?? "", normalFont, 10f);
                }

                doc.Close();
                return ms.ToArray();
            }
        }

        // ===== HELPER METHODS =====

        private void AddCenteredText(Document doc, string text, Font font, float spacingAfter)
        {
            Paragraph para = new Paragraph(text, font)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = spacingAfter
            };
            doc.Add(para);
        }

        private void AddBoldText(Document doc, string text, Font font, float spacingAfter)
        {
            Paragraph para = new Paragraph(text, font)
            {
                Alignment = Element.ALIGN_LEFT,
                SpacingAfter = spacingAfter
            };
            doc.Add(para);
        }

        private void AddPointWithValue(Document doc, string pointNo, string label, string value, Font font, float spacingAfter, bool leftAlignValue = false)
        {
            // Create table with 3 columns: point number, label, value
            PdfPTable table = new PdfPTable(3);
            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 5f, 70f, 25f });
            table.SpacingAfter = spacingAfter;

            // Point number
            PdfPCell pointCell = new PdfPCell(new Phrase(pointNo, font))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = leftAlignValue ? Element.ALIGN_LEFT : Element.ALIGN_RIGHT,
                VerticalAlignment = Element.ALIGN_TOP,
                PaddingRight = 5f
            };
            table.AddCell(pointCell);

            // Label
            PdfPCell labelCell = new PdfPCell(new Phrase(label, font))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                VerticalAlignment = Element.ALIGN_TOP
            };
            table.AddCell(labelCell);

            // Value
            PdfPCell valueCell = new PdfPCell(new Phrase(value, font))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_RIGHT,
                VerticalAlignment = Element.ALIGN_TOP
            };
            table.AddCell(valueCell);

            doc.Add(table);
        }

        private void AddPointLabel(Document doc, string pointNo, string label, Font font, float spacingAfter)
        {
            PdfPTable table = new PdfPTable(2);
            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 5f, 95f });
            table.SpacingAfter = spacingAfter;

            PdfPCell pointCell = new PdfPCell(new Phrase(pointNo, font))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingRight = 5f
            };
            table.AddCell(pointCell);

            PdfPCell labelCell = new PdfPCell(new Phrase(label, font))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT
            };
            table.AddCell(labelCell);

            doc.Add(table);
        }

        private void AddTableCell(PdfPTable table, string text, Font font, bool isHeader)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font))
            {
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 5f,
                Border = Rectangle.BOX
            };

            if (isHeader)
            {
                cell.BackgroundColor = BaseColor.LIGHT_GRAY;
            }

            table.AddCell(cell);
        }

        private string FormatNullableDate(object dateValue)
        {
            if (dateValue == null || dateValue == DBNull.Value) return "NIL";
            try
            {
                return Convert.ToDateTime(dateValue).ToString("dd/MM/yyyy");
            }
            catch
            {
                return "NIL";
            }
        }

        private string FormatDateAmountInline(object dateValue, object amountValue)
        {
            string result = "";

            if (dateValue != null && dateValue != DBNull.Value)
            {
                try
                {
                    result = Convert.ToDateTime(dateValue).ToString("dd/MM/yyyy");
                }
                catch { }
            }

            if (amountValue != null && amountValue != DBNull.Value)
            {
                try
                {
                    decimal amount = Convert.ToDecimal(amountValue);
                    if (amount > 0)
                    {
                        result += (string.IsNullOrEmpty(result) ? "" : ", ") + "₹" + amount.ToString("N2");
                    }
                }
                catch { }
            }

            return string.IsNullOrEmpty(result) ? "NIL" : result;
        }

        private string FormatDeathInfoInline(object dateValue, object personValue, object amountValue)
        {
            List<string> parts = new List<string>();

            if (dateValue != null && dateValue != DBNull.Value)
            {
                try
                {
                    parts.Add("Date: " + Convert.ToDateTime(dateValue).ToString("dd/MM/yyyy"));
                }
                catch { }
            }

            if (personValue != null && personValue != DBNull.Value && !string.IsNullOrWhiteSpace(personValue.ToString()))
            {
                parts.Add("Person: " + personValue.ToString());
            }

            if (amountValue != null && amountValue != DBNull.Value)
            {
                try
                {
                    decimal amount = Convert.ToDecimal(amountValue);
                    if (amount > 0)
                    {
                        parts.Add("Amount: ₹" + amount.ToString("N2"));
                    }
                }
                catch { }
            }

            return parts.Count > 0 ? string.Join(", ", parts) : "NIL";
        }

        private string FormatChildBenefitInfo(object personValue, object amountValue, object periodValue)
        {
            List<string> parts = new List<string>();

            if (personValue != null && personValue != DBNull.Value && !string.IsNullOrWhiteSpace(personValue.ToString()))
            {
                parts.Add("Person: " + personValue.ToString());
            }

            if (amountValue != null && amountValue != DBNull.Value)
            {
                try
                {
                    decimal amount = Convert.ToDecimal(amountValue);
                    if (amount > 0)
                    {
                        parts.Add("Amount: ₹" + amount.ToString("N2"));
                    }
                }
                catch { }
            }

            if (periodValue != null && periodValue != DBNull.Value && !string.IsNullOrWhiteSpace(periodValue.ToString()))
            {
                parts.Add("Period: " + periodValue.ToString());
            }

            return parts.Count > 0 ? string.Join(", ", parts) : "NIL";
        }

        // 🔥 NEW METHOD - Add this after AddPointWithValue
        private void AddPointWithBoldValue(Document doc, string pointNo, string label, string value,
            Font labelFont, Font valueFont, float spacingAfter, bool leftAlignValue = false)
        {
            PdfPTable table = new PdfPTable(3);
            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 5f, 70f, 25f });
            table.SpacingAfter = spacingAfter;

            PdfPCell pointCell = new PdfPCell(new Phrase(pointNo, labelFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = leftAlignValue ? Element.ALIGN_LEFT : Element.ALIGN_RIGHT,
                VerticalAlignment = Element.ALIGN_TOP,
                PaddingRight = 5f
            };
            table.AddCell(pointCell);

            PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                VerticalAlignment = Element.ALIGN_TOP
            };
            table.AddCell(labelCell);

            // 🔥 Value uses valueFont (bold)
            PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_RIGHT,
                VerticalAlignment = Element.ALIGN_TOP
            };
            table.AddCell(valueCell);

            doc.Add(table);
        }



        // esi sTATEMNT
        // form 12 A
        [HttpPost("GenerateForm12A")]
        [Authorize]
        public async Task<IActionResult> GenerateForm12AAction([FromBody] ReportModelRequest request)
        {
            try
            {
                var validationResult = ValidateRequest(request);
                if (validationResult != null) return validationResult;

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;
                var (totalCount, employees, company) = await exportReportRepository.PDFdata(request);
                var dataValidationResult = ValidateRepositoryData(employees, company);
                if (dataValidationResult != null) return dataValidationResult;

                var pdfBytes = GenerateForm12APdf(employees, company);
                var fileName = $"PF_Form12A_{request.fk_monthId}_{request.fk_yearId}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = "Error generating PDF.", Error = ex.Message });
            }
        }

        #region Validation
        private IActionResult ValidateRequest(ReportModelRequest request)
        {
            if (request == null)
                return BadRequest(new { IsSuccess = false, Message = "Request body cannot be empty." });

            if (string.IsNullOrWhiteSpace(request.fk_monthId) || !int.TryParse(request.fk_monthId, out int month) || month < 1 || month > 12)
                return BadRequest(new { IsSuccess = false, Message = "Month must be valid (1–12)." });

            if (string.IsNullOrWhiteSpace(request.fk_yearId) || !int.TryParse(request.fk_yearId, out int year) || year < 1900 || year > 9999)
                return BadRequest(new { IsSuccess = false, Message = "Year must be valid 4-digit number." });

            return null;
        }

        private IActionResult ValidateRepositoryData(IEnumerable<dynamic> employees, IEnumerable<dynamic> company)
        {
            if (company == null || !company.Any())
                return NotFound(new { IsSuccess = false, Message = "No company data returned from repository." });

            if (employees == null || !employees.Any())
                return NotFound(new { IsSuccess = false, Message = "No employee data returned from repository." });

            return null;
        }
        #endregion

        #region Data Extraction from Repository - PATCHED FOR YOUR JSON STRUCTURE
        private Form12AData ExtractFormDataFromRepository(IEnumerable<dynamic> employees, IEnumerable<dynamic> company)
        {
            // Get company info from first company record
            var companyRow = company.First();

            // Find summary records from employees array
            var summaryRow = employees.FirstOrDefault(e => GetDynamicValue<decimal>(e, "PFGross") > 0 &&
                                                           GetDynamicValue<string>(e, "empname") == null);
            var totalAcSummary = employees.FirstOrDefault(e => GetDynamicValue<decimal>(e, "TotalAcSummary") > 0);
            var totalEmpRecord = employees.FirstOrDefault(e => GetDynamicValue<int>(e, "TotalEmp") > 0);

            // If no summary found in employees, create default
            if (summaryRow == null)
            {
                summaryRow = employees.Last(); // Try the last record as fallback
            }

            var data = new Form12AData
            {
                CompanyName = GetDynamicValue<string>(companyRow, "compname"),

                PF_rate = GetDynamicValue<string>(companyRow, "PF_rate"),
                CompanyAddress = $"{GetDynamicValue<string>(companyRow, "address1")} {GetDynamicValue<string>(companyRow, "address2")}".Trim(),
                PfCodeNo = GetDynamicValue<string>(companyRow, "PFNo"),
                ContributionMonth = GetDynamicValue<string>(companyRow, "monthname", "N/A").ToUpper(),
                ContributionYear = GetDynamicValue<string>(companyRow, "yearname", "N/A"),

                // Extract financial data from summary row
                PFGross = GetDynamicValue<decimal>(summaryRow, "PFGross"),
                PensionWages = GetDynamicValue<decimal>(summaryRow, "PensionWages"),
                PF_WorkerShare = GetDynamicValue<decimal>(summaryRow, "PF"),
                EPF_Ac1 = GetDynamicValue<decimal>(summaryRow, "Ac1"),
                EPS_Ac10 = GetDynamicValue<decimal>(summaryRow, "Ac10"),
                EDLI_Ac21 = GetDynamicValue<decimal>(summaryRow, "Ac21"),
                Admin_Ac2 = GetDynamicValue<decimal>(summaryRow, "Ac2"),
                Admin_Ac22 = GetDynamicValue<decimal>(summaryRow, "Ac22"),

                // Extract employee counts
                TotalEmp = GetDynamicValue<int>(totalEmpRecord ?? summaryRow, "TotalEmp"),
                TotalLeftEmployees = GetDynamicValue<int>(companyRow, "TotalLeftEmployees"),
                TotalNewEmployees = GetDynamicValue<int>(companyRow, "TotalNewEmployees"),

                // For subscriber counts
                LastMonthSubs = GetDynamicValue<int>(totalEmpRecord ?? summaryRow, "TotalEmp"),
                NewSubs = GetDynamicValue<int>(companyRow, "TotalNewEmployees"),
                LeftSubs = GetDynamicValue<int>(companyRow, "TotalLeftEmployees")
            };

            var sfinDate = GetDynamicValue<DateTime>(companyRow, "SFin_Date");
            var efinDate = GetDynamicValue<DateTime>(companyRow, "EFin_Date");
            data.CurrencyPeriodFrom = sfinDate != DateTime.MinValue ? sfinDate.ToString("d-MMMM-yyyy") : "N/A";
            data.CurrencyPeriodTo = efinDate != DateTime.MinValue ? efinDate.ToString("d-MMMM-yyyy") : "N/A";

            data.NetTotalSubs = data.LastMonthSubs + data.NewSubs - data.LeftSubs;

            return data;
        }

        private T GetDynamicValue<T>(dynamic obj, string propertyName, T defaultValue = default(T))
        {
            try
            {
                if (obj == null) return defaultValue;

                var dict = obj as IDictionary<string, object>;
                if (dict != null && dict.TryGetValue(propertyName, out object value))
                {
                    if (value == null || value == DBNull.Value) return defaultValue;

                    if (typeof(T) == typeof(string))
                        return (T)(object)(value?.ToString() ?? string.Empty);
                    return (T)Convert.ChangeType(value, typeof(T));
                }
                return defaultValue;
            }
            catch { return defaultValue; }
        }
        #endregion

        #region Models (Keep your existing Form12AData and PdfFonts classes)
        private class Form12AData
        {
            public string CompanyName { get; set; }

            public string PF_rate { get; set; }
            public string CompanyAddress { get; set; }
            public string PfCodeNo { get; set; }
            public string CurrencyPeriodFrom { get; set; }
            public string CurrencyPeriodTo { get; set; }
            public string ContributionMonth { get; set; }
            public string ContributionYear { get; set; }

            public decimal PFGross { get; set; }
            public decimal PensionWages { get; set; }
            public decimal PF_WorkerShare { get; set; }
            public decimal EPF_Ac1 { get; set; }
            public decimal EPS_Ac10 { get; set; }
            public decimal EDLI_Ac21 { get; set; }
            public decimal Admin_Ac2 { get; set; }
            public decimal Admin_Ac22 { get; set; }

            public int LastMonthSubs { get; set; }
            public int NewSubs { get; set; }
            public int LeftSubs { get; set; }

            public int TotalEmp { get; set; }
            public int TotalLeftEmployees { get; set; }
            public int TotalNewEmployees { get; set; }
            public int NetTotalSubs { get; set; }
        }

        private class PdfFonts
        {
            public Font Title { get; set; }
            public Font SubTitle { get; set; }
            public Font Bold { get; set; }
            public Font Normal { get; set; }
            public Font Small { get; set; }
            public Font SmallBold { get; set; }
        }
        #endregion

        #region PDF Generation (Pure Design Logic) - UNCHANGED, KEEPING YOUR DESIGN
        private byte[] GenerateForm12APdf(IEnumerable<dynamic> employees, IEnumerable<dynamic> company)
        {
            using (var ms = new MemoryStream())
            using (var document = new Document(PageSize.A4, 24, 24, 24, 28))
            {
                PdfWriter.GetInstance(document, ms);
                document.Open();

                var formData = ExtractFormDataFromRepository(employees, company);
                var fonts = CreateFonts();

                AddTopBanner(document, formData, fonts);
                AddCompanyAddress(document, formData, fonts);
                AddContributionGrid(document, formData, fonts);
                AddTopEmployeesBankAndSignatures(document, formData, fonts);
                AddBottomSubscribersAndSignature(document, formData, fonts);

                document.Close();
                return ms.ToArray();
            }
        }

        private PdfFonts CreateFonts()
        {
            var baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            return new PdfFonts
            {
                Title = new Font(baseFont, 11.5f, Font.BOLD),
                SubTitle = new Font(baseFont, 9.5f, Font.BOLD),
                Bold = new Font(baseFont, 9, Font.BOLD),
                Normal = new Font(baseFont, 9, Font.NORMAL),
                Small = new Font(baseFont, 8, Font.NORMAL),
                SmallBold = new Font(baseFont, 8, Font.BOLD)
            };
        }

        private string C(decimal v) => string.Format("{0:n0}", v);
        private string Z(decimal v) => v == 0 ? "0" : C(v);
        private PdfPCell HCell(string text, Font font, int rowspan = 1, int colspan = 1, int halign = Element.ALIGN_CENTER)
            => new PdfPCell(new Phrase(text, font)) { Rowspan = rowspan, Colspan = colspan, HorizontalAlignment = halign, VerticalAlignment = Element.ALIGN_MIDDLE, Padding = 4 };
        private PdfPCell NCell(string text, Font font, int halign = Element.ALIGN_CENTER)
            => new PdfPCell(new Phrase(text, font)) { HorizontalAlignment = halign, VerticalAlignment = Element.ALIGN_MIDDLE, Padding = 3 };

        // Add constants
        private const string STATUTORY_RATE_TEXT = "Statutory rate of Contribution";
        private const string DEFAULT_BANK_NAME = "HDFC BANK";
        private const string DEFAULT_BANK_LOCATION = "GURGAON";

        private void AddTopBanner(Document document, Form12AData data, PdfFonts fonts)
        {
            var topBanner = new PdfPTable(new float[] { 20f, 60f, 20f }) { WidthPercentage = 100 };

            // LEFT: Only for unexempted establishments
            var leftCell = new PdfPCell(new Phrase("Only for unexempted establishments", fonts.Small))
            {
                Border = Rectangle.BOX,
                Padding = 6,
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                MinimumHeight = 50f
            };
            topBanner.AddCell(leftCell);

            // CENTER: Form title and subtitle
            var centerCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 4, VerticalAlignment = Element.ALIGN_MIDDLE };

            centerCell.AddElement(new Paragraph("Form 12 - A (REVISED)", fonts.Title) { Alignment = Element.ALIGN_CENTER, SpacingAfter = 2f });

            var subtitleLines = new[]
            {
"Employees Provident Fund and Misc. Provisions Act,1952",
"Employees' Pension Scheme",
"[Paragraph 20(4)]",
$"Currency Period from {data.CurrencyPeriodFrom} to {data.CurrencyPeriodTo}",
$"Statement of contribution for the month of {data.ContributionMonth} - {data.ContributionYear}",
STATUTORY_RATE_TEXT + " "+data.PF_rate.ToString()
};

            foreach (var line in subtitleLines)
            {
                centerCell.AddElement(new Paragraph(line, fonts.Small) { Alignment = Element.ALIGN_CENTER, SpacingAfter = 1f });
            }

            topBanner.AddCell(centerCell);

            // RIGHT: EPFO section
            var rightCell = new PdfPCell { Border = Rectangle.BOX, Padding = 4, MinimumHeight = 50f };

            rightCell.AddElement(new Paragraph("(To be filled in by the EPFO)", fonts.Small) { Alignment = Element.ALIGN_CENTER, SpacingAfter = 3f });

            var statusTable = new PdfPTable(new float[] { 75f, 25f }) { WidthPercentage = 100 };
            statusTable.AddCell(new PdfPCell(new Phrase("Establishment Status", fonts.Small))
            {
                Border = Rectangle.NO_BORDER,
                Padding = 1,
                HorizontalAlignment = Element.ALIGN_LEFT,
                VerticalAlignment = Element.ALIGN_MIDDLE
            });
            statusTable.AddCell(CreateVerySmallSquareBoxes(2));
            rightCell.AddElement(statusTable);

            rightCell.AddElement(new Paragraph(" ", fonts.Small));

            var codeTable = new PdfPTable(new float[] { 75f, 25f }) { WidthPercentage = 100 };
            codeTable.AddCell(new PdfPCell(new Phrase("Group Code", fonts.Small))
            {
                Border = Rectangle.NO_BORDER,
                Padding = 1,
                HorizontalAlignment = Element.ALIGN_LEFT,
                VerticalAlignment = Element.ALIGN_MIDDLE
            });
            codeTable.AddCell(CreateVerySmallSquareBoxes(2));
            rightCell.AddElement(codeTable);

            topBanner.AddCell(rightCell);

            document.Add(topBanner);
            document.Add(new Paragraph("\n"));
        }

        private void AddCompanyAddress(Document document, Form12AData data, PdfFonts fonts)
        {
            var companyDiv = new Paragraph();
            companyDiv.Add(new Phrase("Name and Address of the Establishment\n", fonts.Small));
            companyDiv.Add(new Phrase(data.CompanyName + "\n", fonts.SmallBold));
            if (!string.IsNullOrWhiteSpace(data.CompanyAddress))
                companyDiv.Add(new Phrase(data.CompanyAddress, fonts.Small));

            var addressTable = new PdfPTable(1) { WidthPercentage = 100 };
            var addressCell = new PdfPCell(companyDiv)
            {
                Border = Rectangle.BOX,
                Padding = 8,
                MinimumHeight = 40f,
                VerticalAlignment = Element.ALIGN_TOP
            };
            addressTable.AddCell(addressCell);

            document.Add(addressTable);
            document.Add(new Paragraph("\n"));

            var codePara = new Paragraph($"Code No. {data.PfCodeNo}", fonts.SmallBold) { Alignment = Element.ALIGN_CENTER };
            document.Add(codePara);
            document.Add(new Paragraph("\n"));
        }

        private PdfPCell CreateVerySmallSquareBoxes(int count)
        {
            var inner = new PdfPTable(count) { WidthPercentage = 100 };
            for (int i = 0; i < count; i++)
            {
                inner.AddCell(new PdfPCell
                {
                    FixedHeight = 8f,
                    MinimumHeight = 8f,
                    Border = Rectangle.BOX,
                    Padding = 0f
                });
            }
            return new PdfPCell(inner)
            {
                Border = Rectangle.NO_BORDER,
                Padding = 0,
                HorizontalAlignment = Element.ALIGN_RIGHT,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };
        }

        private void AddContributionGrid(Document document, Form12AData d, PdfFonts fonts)
        {
            var widths = new float[] { 18, 12, 12, 12, 12, 12, 12, 12, 12 };
            var table = new PdfPTable(widths) { WidthPercentage = 100 };

            table.AddCell(HCell("Particulars", fonts.SmallBold, rowspan: 2));
            table.AddCell(HCell("Wages on which Contributions", fonts.SmallBold, rowspan: 2));
            table.AddCell(HCell("Amount of Contribution", fonts.SmallBold, colspan: 2));
            table.AddCell(HCell("Amount of Contribution Remitted", fonts.SmallBold, colspan: 2));
            table.AddCell(HCell("Amount of Administration charges due", fonts.SmallBold, rowspan: 2));
            table.AddCell(HCell("Amount of Administration charges remitted", fonts.SmallBold, rowspan: 2));
            table.AddCell(HCell("Date of Remittance\n(enclose triplicate copies of challan )", fonts.SmallBold, rowspan: 2));

            table.AddCell(HCell("Recovered from Workers", fonts.SmallBold));
            table.AddCell(HCell("Payable by the Employer", fonts.SmallBold));
            table.AddCell(HCell("Worker's Share", fonts.SmallBold));
            table.AddCell(HCell("Employer's Share", fonts.SmallBold));

            // EPF Row
            table.AddCell(NCell("E.P.F. A/c No. 01", fonts.Small, Element.ALIGN_LEFT));
            table.AddCell(NCell(C(d.PFGross), fonts.Small));
            table.AddCell(NCell(C(d.PF_WorkerShare), fonts.Small));
            table.AddCell(NCell(C(d.EPF_Ac1 + d.EPS_Ac10), fonts.Small));
            table.AddCell(NCell(C(d.PF_WorkerShare), fonts.Small));
            table.AddCell(NCell(C(d.EPF_Ac1 + d.EPS_Ac10), fonts.Small));
            table.AddCell(NCell(Z(d.Admin_Ac2), fonts.Small));
            table.AddCell(NCell(Z(d.Admin_Ac2), fonts.Small));
            table.AddCell(CreateChallanBoxesCell(6));

            // Pension Row
            table.AddCell(NCell("Pension Fund A/c no 10", fonts.Small, Element.ALIGN_LEFT));
            table.AddCell(NCell(C(d.PensionWages), fonts.Small));
            table.AddCell(NCell("NIL", fonts.Small));
            table.AddCell(NCell(C(d.EPS_Ac10), fonts.Small));
            table.AddCell(NCell("NIL", fonts.Small));
            table.AddCell(NCell(C(d.EPS_Ac10), fonts.Small));
            table.AddCell(NCell("NIL", fonts.Small));
            table.AddCell(NCell("NIL", fonts.Small));
            table.AddCell(CreateChallanBoxesCell(6));

            // EDLI Row
            table.AddCell(NCell("D.L.I. A/c No. 21", fonts.Small, Element.ALIGN_LEFT));
            table.AddCell(NCell(C(d.PensionWages), fonts.Small));
            table.AddCell(NCell("NIL", fonts.Small));
            table.AddCell(NCell(C(d.EPS_Ac10), fonts.Small));
            table.AddCell(NCell("NIL", fonts.Small));
            table.AddCell(NCell(C(d.EDLI_Ac21), fonts.Small));

            table.AddCell(NCell(Z(d.Admin_Ac22), fonts.Small));
            table.AddCell(NCell(Z(d.Admin_Ac22), fonts.Small));
            table.AddCell(CreateChallanBoxesCell(6));

            document.Add(table);
            document.Add(new Paragraph("\n"));
        }

        private PdfPCell CreateChallanBoxesCell(int count)
        {
            var inner = new PdfPTable(count) { WidthPercentage = 100 };
            for (int i = 0; i < count; i++)
                inner.AddCell(new PdfPCell { FixedHeight = 12f, Border = Rectangle.BOX, Padding = 0f });
            return new PdfPCell(inner) { Padding = 2, HorizontalAlignment = Element.ALIGN_CENTER, VerticalAlignment = Element.ALIGN_MIDDLE };
        }

        private void AddTopEmployeesBankAndSignatures(Document document, Form12AData d, PdfFonts fonts)
        {
            var mainTable = new PdfPTable(new float[] { 50f, 50f }) { WidthPercentage = 100 };

            // LEFT: Employee details
            var empCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 4f, VerticalAlignment = Element.ALIGN_TOP };

            var empTitle = new Paragraph("Total No. of Employees " + d.TotalEmp.ToString(), fonts.SmallBold)
            {
                Alignment = Element.ALIGN_LEFT
            };
            empCell.AddElement(empTitle);
            empCell.AddElement(new Paragraph(" ", fonts.Small));

            var empTable = new PdfPTable(new float[] { 55f, 45f })
            {
                WidthPercentage = 70f,
                HorizontalAlignment = Element.ALIGN_LEFT
            };

            empTable.AddCell(new PdfPCell(new Phrase("a) Contract", fonts.Small)) { Padding = 1, Border = Rectangle.BOX, HorizontalAlignment = Element.ALIGN_LEFT });
            empTable.AddCell(new PdfPCell(new Phrase("NIL", fonts.Small)) { Padding = 1, Border = Rectangle.BOX, HorizontalAlignment = Element.ALIGN_CENTER });

            empTable.AddCell(new PdfPCell(new Phrase("b) Rest", fonts.Small)) { Padding = 1, Border = Rectangle.BOX, HorizontalAlignment = Element.ALIGN_LEFT });
            empTable.AddCell(new PdfPCell(new Phrase((d.TotalEmp - d.TotalLeftEmployees + d.TotalNewEmployees).ToString(), fonts.Small)) { Padding = 1, Border = Rectangle.BOX, HorizontalAlignment = Element.ALIGN_CENTER });

            empTable.AddCell(new PdfPCell(new Phrase("c) Total", fonts.Small)) { Padding = 1, Border = Rectangle.BOX, HorizontalAlignment = Element.ALIGN_LEFT });
            empTable.AddCell(new PdfPCell(new Phrase((d.TotalEmp - d.TotalLeftEmployees + d.TotalNewEmployees).ToString(), fonts.Small)) { Padding = 1, Border = Rectangle.BOX, HorizontalAlignment = Element.ALIGN_CENTER });

            empCell.AddElement(empTable);

            // RIGHT: Bank details
            var bankCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 4f, VerticalAlignment = Element.ALIGN_TOP };

            var bankTitle = new Paragraph("Name & Address of the bank in which the amount is remitted", fonts.SmallBold)
            {
                SpacingAfter = 4f
            };
            bankCell.AddElement(bankTitle);

            var bankLine = new Paragraph(DEFAULT_BANK_NAME + " " + DEFAULT_BANK_LOCATION, fonts.Normal);
            bankCell.AddElement(bankLine);

            mainTable.AddCell(empCell);
            mainTable.AddCell(bankCell);

            var container = new PdfPTable(1) { WidthPercentage = 100 };
            container.AddCell(new PdfPCell(mainTable) { Border = Rectangle.BOX, Padding = 0f });

            document.Add(container);
            document.Add(new Paragraph("\n"));
        }

        private void AddBottomSubscribersAndSignature(Document document, Form12AData d, PdfFonts fonts)
        {
            var mainTable = new PdfPTable(new float[] { 65f, 35f }) { WidthPercentage = 100 };

            // LEFT: Subscribers table 
            var subCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 4f };
            var subsTable = BuildSubscribersTable(d, fonts);
            subCell.AddElement(subsTable);

            // RIGHT: Signature
            var sigCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 6f, VerticalAlignment = Element.ALIGN_BOTTOM };
            sigCell.AddElement(new Phrase("\n\n\n"));
            var sigText = new Paragraph("Signature of the Employer with official Seal", fonts.Small)
            {
                Alignment = Element.ALIGN_RIGHT
            };
            sigCell.AddElement(sigText);

            mainTable.AddCell(subCell);
            mainTable.AddCell(sigCell);

            var container = new PdfPTable(1) { WidthPercentage = 100 };
            container.AddCell(new PdfPCell(mainTable) { Border = Rectangle.BOX, Padding = 0f });

            document.Add(container);
            document.Add(new Paragraph("\n"));
        }

        private PdfPTable BuildSubscribersTable(Form12AData d, PdfFonts fonts)
        {
            var widths = new float[] { 50f, 16.6f, 16.6f, 16.6f };
            var t = new PdfPTable(widths) { WidthPercentage = 100 };

            t.AddCell(new PdfPCell(new Phrase("Details of the Subscribers", fonts.SmallBold)) { Padding = 4, HorizontalAlignment = Element.ALIGN_LEFT });
            t.AddCell(HCell("E.P.F.", fonts.SmallBold));
            t.AddCell(HCell("Pension Fund", fonts.SmallBold));
            t.AddCell(HCell("E.D.L.I.", fonts.SmallBold));

            t.AddCell(new PdfPCell(new Phrase("No. of Subscribers as per last month", fonts.Small)) { Padding = 4, HorizontalAlignment = Element.ALIGN_LEFT });
            t.AddCell(NCell(d.TotalEmp.ToString(), fonts.Small));
            t.AddCell(NCell(d.TotalEmp.ToString(), fonts.Small));
            t.AddCell(NCell(d.TotalEmp.ToString(), fonts.Small));

            t.AddCell(new PdfPCell(new Phrase("No. of new Subscribers\n(Wide Form-V)", fonts.Small)) { Padding = 4, HorizontalAlignment = Element.ALIGN_LEFT });
            t.AddCell(NCell(d.TotalNewEmployees.ToString(), fonts.Small));
            t.AddCell(NCell(d.TotalNewEmployees.ToString(), fonts.Small));
            t.AddCell(NCell(d.TotalNewEmployees.ToString(), fonts.Small));

            t.AddCell(new PdfPCell(new Phrase("No. of Subscribers left service\n(Wide Form-XI)", fonts.Small)) { Padding = 4, HorizontalAlignment = Element.ALIGN_LEFT });
            t.AddCell(NCell(d.TotalLeftEmployees.ToString(), fonts.Small));
            t.AddCell(NCell(d.TotalLeftEmployees.ToString(), fonts.Small));
            t.AddCell(NCell(d.TotalLeftEmployees.ToString(), fonts.Small));

            t.AddCell(new PdfPCell(new Phrase("(Net) Total No. of Subscribers", fonts.Small)) { Padding = 4, HorizontalAlignment = Element.ALIGN_LEFT });
            t.AddCell(NCell((d.TotalEmp - d.TotalLeftEmployees + d.TotalNewEmployees).ToString(), fonts.Small));
            t.AddCell(NCell((d.TotalEmp - d.TotalLeftEmployees + d.TotalNewEmployees).ToString(), fonts.Small));
            t.AddCell(NCell((d.TotalEmp - d.TotalLeftEmployees + d.TotalNewEmployees).ToString(), fonts.Small));

            return t;
        }
        #endregion


        [HttpGet("GetCompanyName")]
        [Authorize]
        public async Task<IActionResult> GetCompanyName()
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            dynamic company = await exportReportRepository.GetCompanyNameAsync(decryptedCompanyId);

            string companyName = company != null && ((IDictionary<string, object>)company).ContainsKey("Company Name")
                ? ((IDictionary<string, object>)company)["Company Name"]?.ToString()
                : "Unknown Company";

            return Ok(new { CompanyName = companyName });
        }


        //added code - 24JAN 2026 -ANJALI -STARTS




        //anjali JAn


        [HttpPost("PFForm3")]
        [Authorize]
        public async Task<IActionResult> GenerateForm3APdf([FromBody] ReportModelRequest request)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                var (header, allData) = await exportReportRepository.PFForm3(request);

                if (allData == null || !allData.Any())
                    return BadRequest(new { IsSuccess = false, Message = "No records found." });

                // Group data by employee
                var groupedByEmployee = allData
                    .GroupBy(x => x.pk_empid)
                    .ToList();

                var pdfBytes = GenerateForm3APdfBytesForAllEmployees(groupedByEmployee, request);
                var fileName = $"Form3A_AllEmployees_{request.fk_finid}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = "Error generating PDF.", Error = ex.Message });
            }
        }

        private byte[] GenerateForm3APdfBytesForAllEmployees(
            IEnumerable<IGrouping<dynamic, dynamic>> groupedEmployees,
            ReportModelRequest request)
        {
            using (var ms = new MemoryStream())
            {
                // Define fonts ONCE
                var titleFont = FontFactory.GetFont("Arial", 11, iTextSharp.text.Font.BOLD);
                var headerFont = FontFactory.GetFont("Arial", 9, iTextSharp.text.Font.BOLD);
                var bodyFont = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.NORMAL);
                var bodyFontBold = FontFactory.GetFont("Arial", 8, iTextSharp.text.Font.BOLD);
                var smallFont = FontFactory.GetFont("Arial", 7, iTextSharp.text.Font.NORMAL);

                iTextSharp.text.Document pdfDoc = new iTextSharp.text.Document(
                    iTextSharp.text.PageSize.A4, 20, 20, 20, 20);
                PdfWriter writer = PdfWriter.GetInstance(pdfDoc, ms);

                writer.PageEvent = new PageBorderEvent();

                pdfDoc.Open();

                bool isFirstEmployee = true;

                // LOOP THROUGH EACH EMPLOYEE  
                foreach (var employeeGroup in groupedEmployees)
                {
                    // Add new page for each employee (except first)
                    if (!isFirstEmployee)
                    {
                        pdfDoc.NewPage();
                    }
                    isFirstEmployee = false;

                    var employeeData = employeeGroup.First();
                    var contributionData = employeeGroup.ToList();

                    // Add content for this employee
                    AddEmployeePage(pdfDoc, employeeData, contributionData,
                        titleFont, headerFont, bodyFont, bodyFontBold, smallFont);
                }

                pdfDoc.Close();
                return ms.ToArray();
            }
        }

        private void AddEmployeePage(
            iTextSharp.text.Document pdfDoc,
            dynamic employeeData,
            IEnumerable<dynamic> contributionData,
            iTextSharp.text.Font titleFont,
            iTextSharp.text.Font headerFont,
            iTextSharp.text.Font bodyFont,
            iTextSharp.text.Font bodyFontBold,
            iTextSharp.text.Font smallFont)
        {
            // ========== TITLE SECTION ==========
            Paragraph formTitle = new Paragraph("FORM No. 3-A (Revised)", titleFont);
            formTitle.Alignment = Element.ALIGN_CENTER;
            pdfDoc.Add(formTitle);

            Paragraph subtitle1 = new Paragraph(
                "THE EMPLOYEE'S PROVIDENT FUNDS SCHEME 1952 (Para 35 & 42)", bodyFontBold);
            subtitle1.Alignment = Element.ALIGN_CENTER;
            subtitle1.SpacingBefore = 5f;
            pdfDoc.Add(subtitle1);

            Paragraph subtitle2 = new Paragraph("AND", bodyFontBold);
            subtitle2.Alignment = Element.ALIGN_CENTER;
            pdfDoc.Add(subtitle2);

            Paragraph subtitle3 = new Paragraph(
                "THE EMPLOYEE'S PENSION SCHEME 1995 (Para 19)", bodyFontBold);
            subtitle3.Alignment = Element.ALIGN_CENTER;
            pdfDoc.Add(subtitle3);

            string periodFrom = employeeData.PeriodFrom?.ToString() ?? "";
            string periodTo = employeeData.PeriodTo?.ToString() ?? "";

            Paragraph periodInfo = new Paragraph(
                $"CONTRIBUTION CARD FOR THE CURRENCY PERIOD FROM {periodFrom} to {periodTo}",
                bodyFontBold);
            periodInfo.Alignment = Element.ALIGN_CENTER;
            periodInfo.SpacingBefore = 5f;
            periodInfo.SpacingAfter = 10f;
            pdfDoc.Add(periodInfo);

            // ========== EMPLOYEE DETAILS SECTION ==========
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.WidthPercentage = 100;
            detailsTable.SetWidths(new float[] { 50f, 50f });
            detailsTable.SpacingAfter = 15f;

            AddDetailRow(detailsTable, "1. Account No. :",
                employeeData.AccountNo?.ToString() ?? "", bodyFont, bodyFontBold);
            AddDetailRow(detailsTable, "5. Name and Address of factory/Establishment :",
                employeeData.FactoryName?.ToString() ?? "", bodyFont, bodyFontBold);

            AddDetailRow(detailsTable, "2. Name :",
                employeeData.EmployeeName?.ToString() ?? "", bodyFont, bodyFontBold);
            AddDetailRow(detailsTable, "",
                employeeData.EstablishmentAddress?.ToString() ?? "", bodyFont, bodyFontBold);

            AddDetailRow(detailsTable, "3. Father's / Husband's Name :",
                employeeData.FatherName?.ToString() ?? "", bodyFont, bodyFontBold);
            AddDetailRow(detailsTable, "6. Voluntary higher rate of Employee's Cont. (if any) :",
                "", bodyFont, bodyFontBold);

            AddDetailRow(detailsTable, "4. Statutory rate of contribution :",
                 employeeData.Statutoryrate?.ToString() ?? "", bodyFont, bodyFontBold);
            AddDetailRow(detailsTable, "", "", bodyFont, bodyFontBold);

            pdfDoc.Add(detailsTable);

            // ========== CONTRIBUTION TABLE ==========
            PdfPTable mainTable = new PdfPTable(10);
            mainTable.WidthPercentage = 100;
            mainTable.SetWidths(new float[] { 8f, 7f, 6f, 6f, 7f, 7f, 7f, 7f, 6f, 6f });
            mainTable.SpacingBefore = 5f;

            // ROW 1: Main headers
            AddMergedHeaderCell(mainTable, "", headerFont, 1, 1);
            AddMergedHeaderCell(mainTable, "EMPLOYEE'S SHARE", headerFont, 1, 4);
            AddMergedHeaderCell(mainTable, "EMPLOYER SHARE", headerFont, 1, 2);
            AddMergedHeaderCell(mainTable, "", headerFont, 1, 1);
            AddMergedHeaderCell(mainTable, "No. of\nDays", headerFont, 1, 1);
            AddMergedHeaderCell(mainTable, "", headerFont, 1, 1);

            // ROW 2: Sub-headers
            AddHeaderCell(mainTable, "Month", headerFont);
            AddHeaderCell(mainTable, "Amount\nof\nWages", headerFont);
            AddHeaderCell(mainTable, "EPF", headerFont);
            AddHeaderCell(mainTable, "VOL. PF", headerFont);
            AddHeaderCell(mainTable, "TOTAL", headerFont);
            AddHeaderCell(mainTable, "EPF\nDIFF.", headerFont);
            AddHeaderCell(mainTable, "PENSION\nFUND", headerFont);
            AddHeaderCell(mainTable, "Refund\nof\nAdvance", headerFont);
            AddHeaderCell(mainTable, "Period of\nNon-Cont\n. (if any)", headerFont);
            AddHeaderCell(mainTable, "Remarks", headerFont);

            // ROW 3: Column numbers
            AddColumnNumberCell(mainTable, "1", bodyFont);
            AddColumnNumberCell(mainTable, "2", bodyFont);
            AddColumnNumberCell(mainTable, "(a)", bodyFont);
            AddColumnNumberCell(mainTable, "(b)", bodyFont);
            AddColumnNumberCell(mainTable, "3", bodyFont);
            AddColumnNumberCell(mainTable, "4(a)", bodyFont);
            AddColumnNumberCell(mainTable, "4(b)", bodyFont);
            AddColumnNumberCell(mainTable, "5", bodyFont);
            AddColumnNumberCell(mainTable, "6", bodyFont);
            AddColumnNumberCell(mainTable, "7", bodyFont);

            // Data Rows
            decimal totalWages = 0, totalEPF_Emp = 0, totalVolPF = 0, totalEPF_Total = 0;
            decimal totalEPF_Diff = 0, totalPension = 0, totalRefund = 0;

            // ✅ FIX: Remove duplicates and sort by MonthSeq (1-12 only)
            var sortedData = contributionData
                .Where(x => x.MonthSeq != null && x.MonthSeq >= 1 && x.MonthSeq <= 12)  // Only 1-12
                .GroupBy(x => (int)x.MonthSeq)  // Group by MonthSeq to remove duplicates
                .Select(g => g.First())  // Take first record if duplicate
                .OrderBy(x => (int)x.MonthSeq)  // Sort by MonthSeq
                .ToList();

            foreach (var row in sortedData)
            {
                string monthName = row.MonthName?.ToString() ?? "";
                decimal wages = Convert.ToDecimal(row.Wages ?? 0);
                decimal epf = Convert.ToDecimal(row.EPF ?? 0);
                decimal volPF = Convert.ToDecimal(row.VoluntaryPF ?? 0);
                decimal epfTotal = Convert.ToDecimal(row.EPFTotal ?? 0);
                decimal epfDiff = Convert.ToDecimal(row.EPFDiff ?? 0);
                decimal pension = Convert.ToDecimal(row.PensionFund ?? 0);
                decimal refund = Convert.ToDecimal(row.RefundAdvance ?? 0);
                string daysWorked = row.DaysWorked?.ToString() ?? "";
                string remarks = row.Remarks?.ToString() ?? "";

                AddDataCell1(mainTable, monthName, bodyFont, Element.ALIGN_LEFT);
                AddDataCell1(mainTable, wages.ToString("0.00"), bodyFont, Element.ALIGN_RIGHT);
                AddDataCell1(mainTable, epf.ToString("0.00"), bodyFont, Element.ALIGN_RIGHT);
                AddDataCell1(mainTable, volPF.ToString("0.00"), bodyFont, Element.ALIGN_RIGHT);
                AddDataCell1(mainTable, epfTotal.ToString("0.00"), bodyFont, Element.ALIGN_RIGHT);
                AddDataCell1(mainTable, epfDiff.ToString("0.00"), bodyFont, Element.ALIGN_RIGHT);
                AddDataCell1(mainTable, pension.ToString("0.00"), bodyFont, Element.ALIGN_RIGHT);
                AddDataCell1(mainTable, refund.ToString("0.00"), bodyFont, Element.ALIGN_RIGHT);
                AddDataCell1(mainTable, daysWorked, bodyFont, Element.ALIGN_CENTER);
                AddDataCell1(mainTable, remarks, bodyFont, Element.ALIGN_LEFT);

                totalWages += wages;
                totalEPF_Emp += epf;
                totalVolPF += volPF;
                totalEPF_Total += epfTotal;
                totalEPF_Diff += epfDiff;
                totalPension += pension;
                totalRefund += refund;
            }

            // Total Row
            AddDataCell1(mainTable, "Total", bodyFontBold, Element.ALIGN_LEFT);
            AddDataCell1(mainTable, totalWages.ToString("0"), bodyFontBold, Element.ALIGN_RIGHT);
            AddDataCell1(mainTable, totalEPF_Emp.ToString("0"), bodyFontBold, Element.ALIGN_RIGHT);
            AddDataCell1(mainTable, totalVolPF.ToString("0"), bodyFontBold, Element.ALIGN_RIGHT);
            AddDataCell1(mainTable, totalEPF_Total.ToString("0"), bodyFontBold, Element.ALIGN_RIGHT);
            AddDataCell1(mainTable, totalEPF_Diff.ToString("0"), bodyFontBold, Element.ALIGN_RIGHT);
            AddDataCell1(mainTable, totalPension.ToString("0"), bodyFontBold, Element.ALIGN_RIGHT);
            AddDataCell1(mainTable, totalRefund.ToString("0"), bodyFontBold, Element.ALIGN_RIGHT);
            AddDataCell1(mainTable, "", bodyFontBold, Element.ALIGN_CENTER);
            AddDataCell1(mainTable, "", bodyFontBold, Element.ALIGN_LEFT);

            pdfDoc.Add(mainTable);

            // ========== FOOTER NOTES ==========
            decimal totalContribution = totalEPF_Total + totalEPF_Diff;

            var footerFont = FontFactory.GetFont("Arial", 9, iTextSharp.text.Font.NORMAL);
            var footerFontBold = FontFactory.GetFont("Arial", 9, iTextSharp.text.Font.BOLD);
            Phrase note1Phrase = new Phrase();
            note1Phrase.Add(new Chunk("Certified that the total amount of contribution(both shares) indicated in this card i.e. Rs.", footerFont));
            note1Phrase.Add(new Chunk(totalContribution.ToString("0.00"), footerFontBold));
            note1Phrase.Add(new Chunk(" has already been remitted in full in EPF A/C No.1and Pension fund A/c No. 10 Rs ", footerFont));
            note1Phrase.Add(new Chunk(totalPension.ToString("0.00"), footerFontBold));
            note1Phrase.Add(new Chunk("(vide note below).", footerFont));

            Paragraph note1 = new Paragraph();
            note1.Add(note1Phrase);
            note1.SpacingBefore = 10f;
            pdfDoc.Add(note1);

            Paragraph note2 = new Paragraph(
                "Certified that the difference between the total of the contribution shown under columns 3 & 4a & 4b of the above table and that arrived at on the total wages shown in column 2 at the prescribed rate is solely due to rounding off of contributions to the nearest rupees under the rules.",
                footerFont);
            note2.SpacingBefore = 2f;
            pdfDoc.Add(note2);
        }

        private void AddDetailRow(PdfPTable table, string label, string value, iTextSharp.text.Font labelFont, iTextSharp.text.Font valueFont)
        {
            PdfPCell cell = new PdfPCell();
            cell.Border = iTextSharp.text.Rectangle.NO_BORDER;
            cell.PaddingBottom = 3f;

            Phrase phrase = new Phrase();
            phrase.Add(new Chunk(label + " ", labelFont));
            phrase.Add(new Chunk(value, valueFont));
            cell.Phrase = phrase;

            table.AddCell(cell);
        }

        private void AddMergedHeaderCell(PdfPTable table, string text, iTextSharp.text.Font font, int rowspan, int colspan)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.Rowspan = rowspan;
            cell.Colspan = colspan;
            cell.BorderWidth = 0.5f;
            cell.Padding = 4f;
            table.AddCell(cell);
        }

        private void AddHeaderCell(PdfPTable table, string text, iTextSharp.text.Font font)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderWidth = 0.5f;
            cell.Padding = 4f;
            table.AddCell(cell);
        }

        private void AddColumnNumberCell(PdfPTable table, string text, iTextSharp.text.Font font)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderWidth = 0.5f;
            cell.Padding = 3f;
            table.AddCell(cell);
        }

        private void AddDataCell1(PdfPTable table, string text, iTextSharp.text.Font font, int alignment)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = alignment;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderWidth = 0.5f;
            cell.Padding = 4f;
            cell.MinimumHeight = 18f;
            table.AddCell(cell);
        }

        public class PageBorderEvent : PdfPageEventHelper
        {
            public override void OnEndPage(PdfWriter writer, iTextSharp.text.Document document)
            {
                PdfContentByte canvas = writer.DirectContent;
                canvas.SetLineWidth(1f);
                canvas.SetColorStroke(BaseColor.BLACK);

                iTextSharp.text.Rectangle pageSize = document.PageSize;
                canvas.Rectangle(
                    20,
                    20,
                    pageSize.Width - 40,
                    pageSize.Height - 40
                );
                canvas.Stroke();
            }
        }





        [HttpPost]
        [Route("ViewComplianceReport")]
        public async Task<IActionResult> ViewComplianceReportAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, data) = await exportReportRepository.ViewComplianceReportAsync(request);

                if (data == null || !data.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No compliance records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Compliance report retrieved successfully.";
                modelResponse.Data = data;
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



        [HttpPost("downloadComplianceExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadComplianceExcel(
      string? reportName,
      [FromBody] ReportModelRequest request)
        {

            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            var (totalCount, dynamicResults) =
                await exportReportRepository.ViewComplianceReportAsync(request);

            var results = dynamicResults
                .Select(item => (IDictionary<string, object>)item)
                .ToList();

            if (!results.Any())
                return Ok(new
                {
                    IsSuccess = false,
                    StatusCode = 400,
                    Message = "No data found"
                });

            // 🔹 Financial Year header (from DB)
            string? dateHeaderText = null;

            if (!string.IsNullOrEmpty(request.fk_finid))
            {
                // You already return PeriodFrom & PeriodTo from SP
                var firstRow = results.First();

                if (firstRow.ContainsKey("PeriodFrom") &&
                    firstRow.ContainsKey("PeriodTo"))
                {
                    dateHeaderText =
                        $"Contribution Period : {firstRow["PeriodFrom"]} to {firstRow["PeriodTo"]}";
                }
            }

            var fileBytes = await ExcelHelper.GenerateExcelReportAsync(
                reportName: reportName ?? "PF_Compliance_Report",
                results: results,
                contractorName: request.ContractorName,
                dateHeaderText: dateHeaderText,
                getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId),

                // 🔹 Compliance totals
                columnsToSum: new[]
                {
            "Wages",
            "EPF",
            "VoluntaryPF",
            "EPFTotal",
            "PensionFund",
            "EPFDiff"
                }
            );

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_Compliance_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
            );
        }



        //added code - 24JAN 2026 -ANJALI -ENDS

        private string GetValue(IDictionary<string, object> dict, string key)
        {
            if (dict != null && dict.ContainsKey(key) && dict[key] != null)
            {
                return dict[key].ToString();
            }
            return "";
        }



        // for grauity
        [HttpPost("GenerateGratuityStatementPdf")]
        [Authorize]
        public async Task<IActionResult> GenerateGratuityStatementPdf(ReportModelRequest request)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                // Fetch data from repositories
                var companyData = await exportReportRepository.GetCompanyNameAsync(decryptedCompanyId);
                var (totalCount, gratuityData) = await exportReportRepository.ViewSalaryReportAsync(request);

                // Generate PDF
                byte[] pdfBytes = CreateGratuityStatementPdf(companyData, gratuityData, request);

                // Return PDF file
                return File(pdfBytes, "application/pdf", $"GratuityStatement_{DateTime.Now:yyyyMMdd}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error generating PDF", error = ex.Message });
            }
        }



        [HttpPost("GenerateOvertimePdf")]
        [Authorize]
        public async Task<IActionResult> GenerateOvertimePdf([FromBody] ReportModelRequest request)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;

                // Fetch data from repository
                var (totalCount, employees) = await exportReportRepository.GetOvertimeDataPdfAsync(request);

                if (employees == null || !employees.Any())
                    return BadRequest(new { IsSuccess = false, Message = "No records found." });

                var pdfBytes = GenerateOvertimePdfBytes(employees, request);
                var fileName = $"Overtime_Register_{request.fk_monthId}_{request.fk_yearId}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = "Error generating PDF.", Error = ex.Message });
            }
        }


        [HttpPost("GenerateESIChallan")]
        [Authorize]
        public async Task<IActionResult> GenerateESIChallan([FromBody] ReportModelRequest request)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                request.fk_companyid = decryptedCompanyId;
                request.ExportType = 37;

                var (totalCount, employees, company) = await exportReportRepository.PDFdata(request);

                if (employees == null || !employees.Any())
                    return BadRequest(new { IsSuccess = false, Message = "No records found." });

                var pdfBytes = GenerateESIChallan(employees, company, request);
                var fileName = $"ESIChallan_{request.fk_monthId}_{request.fk_yearId}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = "Error generating PDF.", Error = ex.Message });
            }
        }

        private byte[] GenerateESIChallan(IEnumerable<dynamic> items, IEnumerable<dynamic> item2, ReportModelRequest request)
        {
            // NOTE: PDFdata() flattens the SP's 4 result sets into 2 tables (see ExportType==37
            // case added to the repository) — same shape GenerateESIStatement() already relies on:
            //   items (list)  -> [0] = company info row, [1..] = per-employee ESI rows
            //   item2 (list1) -> [0] = summary row (ceiling sums), [1] = TotalAcSummary row
            var list = items.ToList();
            var list1 = item2.ToList();

            var companyRow = list.FirstOrDefault();
            var employeeRows = list.Skip(1).ToList();

            var summaryRow = list1.FirstOrDefault();          // ESIGross / ESI / ESIEmr (already ceiling-summed by the SP)
            var totalAcRow = list1.Skip(1).FirstOrDefault();  // TotalAcSummary = ESI + ESIEmr

            // ===== Totals — pulled straight from the SP's own summary rows, no re-aggregation needed =====
            decimal totalWages = summaryRow != null ? SafeDecimalESIChallan(summaryRow, "ESIGross") : 0;
            decimal totalEmployeeContribution = summaryRow != null ? SafeDecimalESIChallan(summaryRow, "ESI") : 0;
            decimal totalEmployerContribution = summaryRow != null ? SafeDecimalESIChallan(summaryRow, "ESIEmr") : 0;
            decimal totalContribution = totalAcRow != null
                ? SafeDecimalESIChallan(totalAcRow, "TotalAcSummary")
                : totalEmployeeContribution + totalEmployerContribution;

            int noOfEmployees = employeeRows.Count;

            string compName = companyRow?.compname?.ToString() ?? "";
            string address1 = companyRow?.address1?.ToString() ?? "";
            string address2 = companyRow?.address2?.ToString() ?? "";
            string compCode = companyRow?.compcode?.ToString() ?? "";
            string fullAddress = string.Join(" ", new[] { address1, address2 }.Where(a => !string.IsNullOrWhiteSpace(a)));

            string monthName = "Invalid Month";
            if (int.TryParse(request.fk_monthId, out int monthInt) && monthInt >= 1 && monthInt <= 12)
                monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(monthInt);

            using (var ms = new MemoryStream())
            {
                // Landscape — the two slips sit side by side, exactly like the printed challan sheet
                Document doc = new Document(PageSize.A4.Rotate(), 20f, 20f, 15f, 15f);
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                PdfPTable outer = new PdfPTable(2);
                outer.WidthPercentage = 100;
                outer.SetWidths(new float[] { 1f, 1f });

                const string copyLabel = "Original / Duplicate / Triplicate / Quadruplicate";

                PdfPTable slip1 = BuildESIChallanSlip(copyLabel, compName, fullAddress, compCode, noOfEmployees,
                    totalWages, totalEmployeeContribution, totalEmployerContribution, totalContribution,
                    monthName, request.fk_yearId);

                PdfPTable slip2 = BuildESIChallanSlip(copyLabel, compName, fullAddress, compCode, noOfEmployees,
                    totalWages, totalEmployeeContribution, totalEmployerContribution, totalContribution,
                    monthName, request.fk_yearId);

                PdfPCell leftCell = new PdfPCell(slip1) { Border = Rectangle.RIGHT_BORDER, BorderColor = BaseColor.GRAY, BorderWidth = 0.75f, Padding = 10f };
                PdfPCell rightCell = new PdfPCell(slip2) { Border = Rectangle.NO_BORDER, Padding = 10f };

                outer.AddCell(leftCell);
                outer.AddCell(rightCell);

                doc.Add(outer);
                doc.Close();
                return ms.ToArray();
            }
        }

        // =====================================================================

        private PdfPTable BuildESIChallanSlip(string copyLabel, string compName, string address,
            string compCode, int noOfEmployees, decimal totalWages, decimal employeeContribution,
            decimal employerContribution, decimal totalContribution, string monthName, string year)
        {
            var f8 = FontFactory.GetFont(FontFactory.HELVETICA, 8);
            var f9 = FontFactory.GetFont(FontFactory.HELVETICA, 9);
            var f9b = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9);
            var f10 = FontFactory.GetFont(FontFactory.HELVETICA, 10);
            var f10b = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
            var f11b = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);

            PdfPTable slip = new PdfPTable(1);
            slip.WidthPercentage = 100;
            slip.DefaultCell.Border = Rectangle.NO_BORDER;

            // ---- Header row: boxed copy-label (left) | E.S.I.C. (center) | Challan No. (right) — all one line ----
            var f7 = FontFactory.GetFont(FontFactory.HELVETICA, 7);
            PdfPTable headLine = new PdfPTable(3);
            headLine.WidthPercentage = 100;
            headLine.SetWidths(new float[] { 28f, 44f, 28f });

            PdfPCell copyBox = new PdfPCell(new Phrase(copyLabel, f7));
            copyBox.Border = Rectangle.BOX;
            copyBox.BorderWidth = 0.75f;
            copyBox.Padding = 3;
            copyBox.HorizontalAlignment = Element.ALIGN_CENTER;
            copyBox.VerticalAlignment = Element.ALIGN_MIDDLE;
            headLine.AddCell(copyBox);

            PdfPCell esicCell = new PdfPCell(new Phrase("E . S . I . C .", f11b));
            esicCell.Border = Rectangle.NO_BORDER;
            esicCell.HorizontalAlignment = Element.ALIGN_CENTER;
            esicCell.VerticalAlignment = Element.ALIGN_MIDDLE;
            headLine.AddCell(esicCell);

            PdfPCell challanCell = new PdfPCell(new Phrase("Challan No..........................", f9));
            challanCell.Border = Rectangle.NO_BORDER;
            challanCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            challanCell.VerticalAlignment = Element.ALIGN_MIDDLE;
            headLine.AddCell(challanCell);

            slip.AddCell(NoBorderCellESIChallan(headLine));

            slip.AddCell(PlainRowESIChallan(new Phrase("EMPLOYEE'S STATE INSURANCE FUND ACCOUNT NO.01", f10b), Element.ALIGN_CENTER));
            slip.AddCell(PlainRowESIChallan(new Phrase("PAY - IN - SLIP FOR CONTRIBUTION", f10b), Element.ALIGN_CENTER));
            slip.AddCell(PlainRowESIChallan(new Phrase("STATE BANK OF INDIA", f10b), Element.ALIGN_CENTER));

            // ---- Station / Date ----
            PdfPTable stationLine = TwoColESIChallan();
            stationLine.AddCell(NoBorderCellESIChallan(new Phrase("Station :", f9), Element.ALIGN_LEFT));
            stationLine.AddCell(NoBorderCellESIChallan(new Phrase("Date :", f9), Element.ALIGN_RIGHT));
            slip.AddCell(NoBorderCellESIChallan(stationLine));

            // ---- Particulars of Cash/Cheque  (Rs. / P. split, as in the printed slip) ----
            decimal rupeesPart = Math.Floor(totalContribution);
            string paisePart = ((totalContribution - rupeesPart) * 100m).ToString("00");

            PdfPTable cashTable = new PdfPTable(3);
            cashTable.WidthPercentage = 100;
            cashTable.SetWidths(new float[] { 60f, 20f, 20f });
            cashTable.AddCell(BoxCellESIChallan("Particulars of Cash/Cheque", f9, Element.ALIGN_LEFT));
            cashTable.AddCell(BoxCellESIChallan("Rs.", f9b, Element.ALIGN_CENTER));
            cashTable.AddCell(BoxCellESIChallan("P.", f9b, Element.ALIGN_CENTER));
            cashTable.AddCell(BoxCellESIChallan("", f9, Element.ALIGN_LEFT));
            cashTable.AddCell(BoxCellESIChallan(rupeesPart.ToString("N0"), f9, Element.ALIGN_RIGHT));
            cashTable.AddCell(BoxCellESIChallan(paisePart, f9, Element.ALIGN_RIGHT));
            cashTable.AddCell(BoxCellESIChallan("TOTAL", f9, Element.ALIGN_LEFT));
            cashTable.AddCell(BoxCellESIChallan(rupeesPart.ToString("N0"), f9, Element.ALIGN_RIGHT));
            cashTable.AddCell(BoxCellESIChallan(paisePart, f9, Element.ALIGN_RIGHT));
            slip.AddCell(NoBorderCellESIChallan(cashTable));

            slip.AddCell(PlainRowESIChallan(new Phrase(
                $"Paid into the credit of the employee's State Insurance Fund A/c No. 1  Rs. {totalContribution:N2}", f9), Element.ALIGN_LEFT));

            slip.AddCell(PlainRowESIChallan(new Phrase(
                $"Rupees      {NumberToWordsESIChallan(totalContribution)}", f10), Element.ALIGN_LEFT));

            slip.AddCell(PlainRowESIChallan(new Phrase(
                "In Cash/Cheque (on realisation) for payment of contributions as per details given below " +
                $"under the employer's state subscription for the month of {monthName.ToUpper()} - {year}", f9), Element.ALIGN_LEFT));

            slip.AddCell(PlainRowESIChallan(new Phrase("Deposited by ..............................................", f9), Element.ALIGN_LEFT));

            // ---- Establishment details ----
            Phrase est = new Phrase();
            est.Add(new Chunk($"Employer's Code No : {compCode}\n", f9));
            est.Add(new Chunk($"Name and Address of Factory/Establishment : {compName}\n", f9));
            est.Add(new Chunk($"{address}\n", f9));
            slip.AddCell(PlainRowESIChallan(est, Element.ALIGN_LEFT));

            // ---- Contribution breakdown — labels plain, but Employee's/Employer's/Total values
            // sit inside a boxed "field" exactly like the reference image (see AddContributionRowESIChallan) ----
            PdfPTable contrib = new PdfPTable(3);
            contrib.WidthPercentage = 100;
            contrib.SetWidths(new float[] { 45f, 30f, 25f });
            AddContributionRowESIChallan(contrib, "No of Employees", noOfEmployees.ToString(), "", f9, false);
            AddContributionRowESIChallan(contrib, "Total  Wages", totalWages.ToString("N2"), "", f9, false);
            AddContributionRowESIChallan(contrib, "Employee's Contribution Rs.", employeeContribution.ToString("N2"), "@1.75 %", f9, true);
            AddContributionRowESIChallan(contrib, "Employer's Contribution Rs.", employerContribution.ToString("N2"), "@4.75 %", f9, true);
            AddContributionRowESIChallan(contrib, "Total Rs...", totalContribution.ToString("N2"), "", f9, true);
            slip.AddCell(NoBorderCellESIChallan(contrib));

            // ---- For Use in Bank / dashed divider ----
            PdfPTable useLine = TwoColESIChallan();
            useLine.AddCell(NoBorderCellESIChallan(new Phrase("For Use in Bank", f9), Element.ALIGN_LEFT));
            useLine.AddCell(NoBorderCellESIChallan(new Phrase("(to be filled by depositor)", f9), Element.ALIGN_RIGHT));
            slip.AddCell(NoBorderCellESIChallan(useLine));

            PdfPCell dashCell = new PdfPCell(new Phrase(" ", f8));
            dashCell.Border = Rectangle.TOP_BORDER;
            dashCell.BorderColor = BaseColor.GRAY;
            slip.AddCell(dashCell);

            slip.AddCell(PlainRowESIChallan(new Phrase("ACKNOWLEDGEMENT (to be filled by depositor)", f10b), Element.ALIGN_CENTER));

            slip.AddCell(PlainRowESIChallan(new Phrase(
                "Received payment by Cash / Cheque / Draft No. .................. Dated ...................... " +
                $"for Rupees. {totalContribution:N2} ({NumberToWordsESIChallan(totalContribution)})", f9), Element.ALIGN_LEFT));

            slip.AddCell(PlainRowESIChallan(new Phrase(
                "Drawn in .......................................................................................... in favour of " +
                $"Employee's State Insurance Fund Account No. 1  Rs. {totalContribution:N2}  " +
                "Sl. no. in Bank's Scroll ........................", f9), Element.ALIGN_LEFT));

            // ---- Date / signature ----
            PdfPTable sigLine = TwoColESIChallan();
            sigLine.AddCell(NoBorderCellESIChallan(new Phrase("Date : ..........................", f9), Element.ALIGN_LEFT));
            sigLine.AddCell(NoBorderCellESIChallan(new Phrase("Authorised Signatory of the receiving Bank", f9), Element.ALIGN_RIGHT));
            slip.AddCell(NoBorderCellESIChallan(sigLine));

            return slip;
        }


        private decimal SafeDecimalESIChallan(dynamic row, string columnName)
        {
            try
            {
                var dict = row as IDictionary<string, object>;
                if (dict != null && dict.ContainsKey(columnName) && dict[columnName] != null)
                    return Convert.ToDecimal(dict[columnName]);

                // Fallback for strongly-typed dynamic access
                var value = ((object)row)?.GetType()?.GetProperty(columnName)?.GetValue(row);
                return value != null ? Convert.ToDecimal(value) : 0;
            }
            catch
            {
                return 0;
            }
        }

        private PdfPTable TwoColESIChallan()
        {
            PdfPTable t = new PdfPTable(2);
            t.WidthPercentage = 100;
            return t;
        }

        private PdfPCell NoBorderCellESIChallan(Phrase phrase, int align)
        {
            PdfPCell cell = new PdfPCell(phrase);
            cell.Border = Rectangle.NO_BORDER;
            cell.HorizontalAlignment = align;
            cell.Padding = 2;
            return cell;
        }

        private PdfPCell NoBorderCellESIChallan(PdfPTable nested)
        {
            PdfPCell cell = new PdfPCell(nested);
            cell.Border = Rectangle.NO_BORDER;
            cell.Padding = 1;
            return cell;
        }

        private PdfPCell PlainRowESIChallan(Phrase phrase, int align)
        {
            PdfPCell cell = new PdfPCell(phrase);
            cell.Border = Rectangle.NO_BORDER;
            cell.HorizontalAlignment = align;
            cell.PaddingTop = 4;
            cell.PaddingBottom = 4;
            return cell;
        }

        private PdfPCell BoxCellESIChallan(string text, iTextSharp.text.Font font, int align)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = align;
            cell.Padding = 4;
            return cell; // keeps the default box border, matching the printed cash-table grid
        }


        private void AddContributionRowESIChallan(PdfPTable table, string label, string value, string rate, iTextSharp.text.Font font, bool boxed)
        {
            PdfPCell c1 = new PdfPCell(new Phrase(label, font))
            {
                Border = Rectangle.NO_BORDER,
                PaddingTop = 5,
                PaddingBottom = 5,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };

            PdfPCell c2 = new PdfPCell(new Phrase(value, font))
            {
                Border = boxed ? Rectangle.BOX : Rectangle.NO_BORDER,
                BorderWidth = boxed ? 0.75f : 0f,
                Padding = 4,
                HorizontalAlignment = Element.ALIGN_RIGHT,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };

            PdfPCell c3 = new PdfPCell(new Phrase(rate, font))
            {
                Border = Rectangle.NO_BORDER,
                PaddingLeft = 8,
                PaddingTop = 5,
                PaddingBottom = 5,
                HorizontalAlignment = Element.ALIGN_LEFT,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };

            table.AddCell(c1);
            table.AddCell(c2);
            table.AddCell(c3);
        }

        // "Rupees ... Only" line. Swap for Humanizer if already a dependency.
        private string NumberToWordsESIChallan(decimal amount)
        {
            long rupees = (long)amount;
            return $"{ConvertIndianNumberToWordsESIChallan(rupees)} Only";
        }

        private string ConvertIndianNumberToWordsESIChallan(long number)
        {
            if (number == 0) return "Zero";
            string[] ones = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                       "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                       "Seventeen", "Eighteen", "Nineteen" };
            string[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

            string ConvertTwoDigit(long n)
            {
                if (n < 20) return ones[n];
                return tens[n / 10] + (n % 10 > 0 ? " " + ones[n % 10] : "");
            }

            List<string> parts = new List<string>();
            long crore = number / 10000000; number %= 10000000;
            long lakh = number / 100000; number %= 100000;
            long thousand = number / 1000; number %= 1000;
            long hundred = number / 100; number %= 100;

            if (crore > 0) parts.Add(ConvertTwoDigit(crore) + " Crore");
            if (lakh > 0) parts.Add(ConvertTwoDigit(lakh) + " Lakh");
            if (thousand > 0) parts.Add(ConvertTwoDigit(thousand) + " Thousand");
            if (hundred > 0) parts.Add(ones[hundred] + " Hundred");
            if (number > 0) parts.Add(ConvertTwoDigit(number));

            return string.Join(" ", parts);
        }

        private void AddCenteredTextESIChallan(Document doc, string text, int fontSize, bool bold)
        {
            var font = bold ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                             : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);
            Paragraph p = new Paragraph(text, font) { Alignment = Element.ALIGN_CENTER };
            doc.Add(p);
        }

        private void AddRightTextESIChallan(Document doc, string text, int fontSize, bool bold)
        {
            var font = bold ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, fontSize)
                             : FontFactory.GetFont(FontFactory.HELVETICA, fontSize);
            Paragraph p = new Paragraph(text, font) { Alignment = Element.ALIGN_RIGHT };
            doc.Add(p);
        }

        private void AddPlainCellESIChallan(PdfPTable table, string text, bool bold)
        {
            var font = bold ? FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)
                             : FontFactory.GetFont(FontFactory.HELVETICA, 9);
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.Padding = 3;
            table.AddCell(cell);
        }

        private void AddTableHeaderESIChallan(PdfPTable table, string text)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9)));
            cell.BackgroundColor = BaseColor.LIGHT_GRAY;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 4;
            table.AddCell(cell);
        }

        private void AddRowESIChallan(PdfPTable table, string desc, string value, string rate)
        {
            table.AddCell(GetCellESIChallan(desc, Element.ALIGN_LEFT));
            table.AddCell(GetCellESIChallan(value, Element.ALIGN_RIGHT));
            table.AddCell(GetCellESIChallan(rate, Element.ALIGN_CENTER));
        }

        private PdfPCell GetCellESIChallan(string text, int align)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.GetFont(FontFactory.HELVETICA, 9)));
            cell.Padding = 4;
            cell.HorizontalAlignment = align;
            return cell;
        }



        [HttpPost("GenerateBonusRegisterPdf")]
        [Authorize]
        public async Task<IActionResult> GenerateBonusRegisterPdf(ReportModelRequest request)
        {
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                // Fetch data from repositories
                var companyData = await exportReportRepository.GetCompanyNameAsync(decryptedCompanyId);
                var (totalCount, bonusData) = await exportReportRepository.ViewComplianceReportAsync(request);

                // Generate PDF
                byte[] pdfBytes = CreateBonusRegisterPdf(companyData, bonusData, request);

                // Return PDF file
                return File(pdfBytes, "application/pdf", $"BonusRegister_{DateTime.Now:yyyyMMdd}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error generating PDF", error = ex.Message });
            }
        }

        private byte[] CreateBonusRegisterPdf(dynamic companyData, dynamic bonusData, ReportModelRequest request)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                // Create document with landscape orientation - INCREASED TOP MARGIN to 120f
                Document document = new Document(PageSize.A4.Rotate(), 10f, 10f, 120f, 20f);
                PdfWriter writer = PdfWriter.GetInstance(document, ms);

                // Set page event for repeating header
                BonusRegisterPageEvent pageEvent = new BonusRegisterPageEvent(companyData, bonusData);
                writer.PageEvent = pageEvent;

                document.Open();

                // Add employee bonus table
                AddBonusTable(document, bonusData);

                document.Close();

                return ms.ToArray();
            }
        }

        private void AddBonusTable(Document document, dynamic bonusData)
        {
            Font tableCellFont = FontFactory.GetFont(FontFactory.HELVETICA, 6);

            // Create main table with 16 columns
            PdfPTable table = new PdfPTable(16);
            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 3f, 4f, 8f, 8f, 4f, 4f, 5f, 5f, 4f, 5f, 4f, 5f, 5f, 5f, 6f, 6f });

            // Important: Set HeaderRows to 3 so all 3 header rows repeat on each page
            table.HeaderRows = 3;

            // Add table headers
            AddTableHeaders(table);

            // Add data rows
            int srNo = 1;
            if (bonusData != null)
            {
                foreach (var employee in bonusData)
                {
                    AddEmployeeRow(table, employee, srNo++, tableCellFont);
                }
            }

            document.Add(table);
        }

        private void AddTableHeaders(PdfPTable table)
        {
            Font tableHeaderFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 6);

            // Row 1: Main headers
            AddHeaderCell(table, "Sr. No", tableHeaderFont, 2);
            AddHeaderCell(table, "ID NO", tableHeaderFont, 2);
            AddHeaderCell(table, "Name of the Employee", tableHeaderFont, 2);
            AddHeaderCell(table, "Father's Name/ Husband's Name", tableHeaderFont, 2);
            AddHeaderCell(table, "Whether he has completed 15 yrs of age at the beginning of the accounting year", tableHeaderFont, 2);
            AddHeaderCell(table, "No of days worked in the year", tableHeaderFont, 2);
            AddHeaderCell(table, "Total Salary or wages in the year", tableHeaderFont, 2);
            AddHeaderCell(table, "Amt. of bonus payable under section 10 or section 11 as the case may be ex gratia", tableHeaderFont, 2);
            AddHeaderCell(table, "DEDUCTIONS", tableHeaderFont, 1, 4);

            AddHeaderCell(table, "Net Amount payable (Col. 8 minus Col. 12)", tableHeaderFont, 2);
            AddHeaderCell(table, "Amount Actually paid", tableHeaderFont, 2);
            AddHeaderCell(table, "Date on which paid", tableHeaderFont, 2);
            AddHeaderCell(table, "Thumb impression or signature of the employee", tableHeaderFont, 2);

            // Row 2: Sub-headers for DEDUCTIONS
            AddHeaderCell(table, "%", tableHeaderFont, 1);
            AddHeaderCell(table, "Interim Bonus or bonus paid in advance", tableHeaderFont, 1);
            AddHeaderCell(table, "Deduction on account of financial loss if any caused by misconduct of employee", tableHeaderFont, 1);
            AddHeaderCell(table, "Total Sum Deducted (Col. 9 ,col. 10 and 11)", tableHeaderFont, 1);

            // Row 3: Column numbers
            for (int i = 1; i <= 16; i++)
            {
                PdfPCell cell = new PdfPCell(new Phrase(i.ToString(), tableHeaderFont));
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                cell.Padding = 2;
                table.AddCell(cell);
            }
        }

        private void AddHeaderCell(PdfPTable table, string text, Font font, int rowspan, int colspan = 1)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.Padding = 3;
            cell.Rowspan = rowspan;
            cell.Colspan = colspan;
            table.AddCell(cell);
        }

        private void AddEmployeeRow(PdfPTable table, dynamic employee, int srNo, Font font)
        {
            var empDict = employee as IDictionary<string, object>;

            AddCell(table, srNo.ToString(), font, Element.ALIGN_CENTER);
            AddCell(table, GetValue(empDict, "EmpCode"), font);
            AddCell(table, GetValue(empDict, "EmpName"), font);
            AddCell(table, GetValue(empDict, "FatherName"), font);
            AddCell(table, GetValue(empDict, "Agecomplete15yearinoffice"), font, Element.ALIGN_CENTER);
            AddCell(table, GetValue(empDict, "NoOfDaysWorked"), font, Element.ALIGN_CENTER);
            AddCell(table, GetValue(empDict, "TotalSalaryOrWages"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "BonusPayableSec10_11"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "EmployeeContributionPercent"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "InterimBonusPaid"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "FinancialLossDeductionSec13"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "TotalDeducation"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "NetPayableAmmoutn8_12"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "Bonus Amount"), font, Element.ALIGN_RIGHT);
            AddCell(table, GetValue(empDict, "PAymnetdate"), font);
            AddCell(table, "", font);
        }

        private void AddCell(PdfPTable table, string text, Font font, int alignment = Element.ALIGN_LEFT)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text ?? "", font));
            cell.HorizontalAlignment = alignment;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.Padding = 3;
            cell.MinimumHeight = 15f;
            table.AddCell(cell);
        }





        private byte[] GenerateOvertimePdfBytes(IEnumerable<dynamic> employees, ReportModelRequest request)
        {
            var list = employees.ToList();

            using (MemoryStream ms = new MemoryStream())
            {
                Document document = new Document(PageSize.A4.Rotate(), 10f, 10f, 20f, 20f);
                PdfWriter writer = PdfWriter.GetInstance(document, ms);
                document.Open();

                var firstRow = list.FirstOrDefault();
                string companyName = firstRow?.CompanyName?.ToString() ?? "N/A";
                string companyAddress = firstRow?.CompanyAddress?.ToString() ?? "N/A";

                string monthName = GetMonthName(request.fk_monthId);
                int currentPage = 1;

                decimal cumulativeOTHours = 0;
                decimal cumulativeOTAmount = 0;
                decimal cumulativeESI = 0;
                decimal cumulativeNet = 0;

                PdfPTable headerTable = CreateHeaderTable(companyName, companyAddress, monthName, request.fk_yearId, currentPage);
                document.Add(headerTable);

                // ✅ CHANGED: 12 se 11 columns
                PdfPTable dataTable = new PdfPTable(11);
                dataTable.WidthPercentage = 100;
                dataTable.SpacingBefore = 5f;
                dataTable.KeepTogether = false;
                dataTable.HeaderRows = 1;
                // ✅ CHANGED: 11 widths (removed last one for Remarks)
                dataTable.SetWidths(new float[] { 5f, 8f, 15f, 15f, 10f, 10f, 10f, 10f, 10f, 8f, 12f });

                Font headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
                // ✅ CHANGED: Removed "Remarks" from headers
                string[] headers = {
            "S.No.", "Id #", "Employee Name\nFather / Husband Name", "Insurance\nNumber",
            "Gross / Daily\nwage Rate", "Overtime\nRate /\nHours", "Overtime\nHours",
            "Overtime\nAmount", "ESI\ndeduction", "Net OT\namount\nPayable",
            "Signature with\nRevenue\nStamp"
        };

                foreach (string header in headers)
                {
                    PdfPCell headerCell = new PdfPCell(new Phrase(header, headerFont));
                    headerCell.HorizontalAlignment = Element.ALIGN_CENTER;
                    headerCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    headerCell.Padding = 5f;
                    dataTable.AddCell(headerCell);
                }

                Font cellFont = FontFactory.GetFont(FontFactory.HELVETICA, 7);
                int serialNo = 1;
                int rowCount = 0;
                int rowsPerPage = 17;
                decimal totalOTRate = 0, totalOTHours = 0, totalOTAmount = 0, totalESI = 0, totalNet = 0;

                foreach (var emp in list)
                {
                    if (rowCount > 0 && rowCount % rowsPerPage == 0)
                    {
                        cumulativeOTHours += totalOTHours;
                        cumulativeOTAmount += totalOTAmount;
                        cumulativeESI += totalESI;
                        cumulativeNet += totalNet;

                        string totalLabel = (currentPage == 1) ? "Total C/F" : "Total";
                        AddTotalRow(dataTable, totalOTRate, cumulativeOTHours, cumulativeOTAmount, cumulativeESI, cumulativeNet, totalLabel);

                        document.Add(dataTable);
                        document.NewPage();
                        currentPage++;

                        PdfPTable newPageHeader = CreateHeaderTable(companyName, companyAddress, monthName, request.fk_yearId, currentPage);
                        document.Add(newPageHeader);

                        // ✅ CHANGED: 11 columns
                        dataTable = new PdfPTable(11);
                        dataTable.WidthPercentage = 100;
                        dataTable.SpacingBefore = 5f;
                        dataTable.KeepTogether = false;
                        dataTable.HeaderRows = 1;
                        dataTable.SetWidths(new float[] { 5f, 8f, 15f, 15f, 10f, 10f, 10f, 10f, 10f, 8f, 12f });

                        foreach (string header in headers)
                        {
                            PdfPCell headerCell = new PdfPCell(new Phrase(header, headerFont));
                            headerCell.HorizontalAlignment = Element.ALIGN_CENTER;
                            headerCell.VerticalAlignment = Element.ALIGN_MIDDLE;
                            headerCell.Padding = 5f;
                            dataTable.AddCell(headerCell);
                        }

                        totalOTRate = 0;
                        totalOTHours = 0;
                        totalOTAmount = 0;
                        totalESI = 0;
                        totalNet = 0;
                    }

                    var empDict = (IDictionary<string, object>)emp;

                    dataTable.AddCell(new PdfPCell(new Phrase(serialNo.ToString(), cellFont)) { HorizontalAlignment = Element.ALIGN_CENTER, Padding = 3f });
                    dataTable.AddCell(new PdfPCell(new Phrase(empDict.ContainsKey("Id") ? empDict["Id"]?.ToString() ?? "" : "", cellFont)) { Padding = 3f });

                    string employeeName = empDict.ContainsKey("EmployeeName") ? empDict["EmployeeName"]?.ToString() ?? "" : "";
                    string fatherName = empDict.ContainsKey("FatherHusbandName") ? empDict["FatherHusbandName"]?.ToString() ?? "" : "";
                    dataTable.AddCell(new PdfPCell(new Phrase($"{employeeName}\n{fatherName}", cellFont)) { Padding = 3f });

                    dataTable.AddCell(new PdfPCell(new Phrase(empDict.ContainsKey("InsuranceNumber") ? empDict["InsuranceNumber"]?.ToString() ?? "0" : "0", cellFont)) { HorizontalAlignment = Element.ALIGN_CENTER, Padding = 3f });

                    string grossRate = empDict.ContainsKey("GrossDailyWageRate") ? empDict["GrossDailyWageRate"]?.ToString() ?? "0.00" : "0.00";
                    dataTable.AddCell(new PdfPCell(new Phrase(grossRate + "\n0.00", cellFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });

                    string otRate = empDict.ContainsKey("OvertimeRateHours") ? empDict["OvertimeRateHours"]?.ToString() ?? "0.00" : "0.00";
                    dataTable.AddCell(new PdfPCell(new Phrase(otRate, cellFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });

                    string otHours = empDict.ContainsKey("OvertimeHours") ? empDict["OvertimeHours"]?.ToString() ?? "0.00" : "0.00";
                    dataTable.AddCell(new PdfPCell(new Phrase(otHours, cellFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });

                    string otAmount = empDict.ContainsKey("OvertimeAmount") ? empDict["OvertimeAmount"]?.ToString() ?? "0.00" : "0.00";
                    dataTable.AddCell(new PdfPCell(new Phrase(otAmount, cellFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });

                    string esi = empDict.ContainsKey("ESIDeduction") ? empDict["ESIDeduction"]?.ToString() ?? "0" : "0";
                    dataTable.AddCell(new PdfPCell(new Phrase(esi, cellFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });

                    string netOT = empDict.ContainsKey("NetOTAmountPayable") ? empDict["NetOTAmountPayable"]?.ToString() ?? "0.00" : "0.00";
                    dataTable.AddCell(new PdfPCell(new Phrase(netOT, cellFont)) { HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 3f });

                    // ✅ CHANGED: Only 1 empty cell for Signature column (removed Remarks)
                    dataTable.AddCell(new PdfPCell(new Phrase("", cellFont)) { Padding = 3f });

                    totalOTRate += decimal.TryParse(otRate, out var rate) ? rate : 0;
                    totalOTHours += decimal.TryParse(otHours, out var hours) ? hours : 0;
                    totalOTAmount += decimal.TryParse(otAmount, out var amount) ? amount : 0;
                    totalESI += decimal.TryParse(esi, out var esiVal) ? esiVal : 0;
                    totalNet += decimal.TryParse(netOT, out var netVal) ? netVal : 0;

                    serialNo++;
                    rowCount++;
                }

                cumulativeOTHours += totalOTHours;
                cumulativeOTAmount += totalOTAmount;
                cumulativeESI += totalESI;
                cumulativeNet += totalNet;

                string finalLabel = (currentPage == 1) ? "Total C/F" : "Total";
                AddTotalRow(dataTable, totalOTRate, cumulativeOTHours, cumulativeOTAmount, cumulativeESI, cumulativeNet, finalLabel);

                document.Add(dataTable);
                document.Close();
                writer.Close();

                return ms.ToArray();
            }
        }
        // Helper method to create header table (reused on each page)
        private PdfPTable CreateHeaderTable(string companyName, string companyAddress, string monthName, string year, int pageNumber)
        {
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.WidthPercentage = 100;
            headerTable.SetWidths(new float[] { 85f, 15f });

            // LEFT SIDE
            PdfPCell leftCell = new PdfPCell();
            leftCell.Border = Rectangle.NO_BORDER;
            leftCell.HorizontalAlignment = Element.ALIGN_LEFT;
            leftCell.PaddingBottom = 5f;


            // Company Name (BOLD, size 10)
            Paragraph companyNamePara = new Paragraph(companyName, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10));
            companyNamePara.Alignment = Element.ALIGN_LEFT;
            companyNamePara.SpacingAfter = 2f;
            leftCell.AddElement(companyNamePara);

            // Company Address (normal, size 8)
            Paragraph addressPara = new Paragraph(companyAddress, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8));
            addressPara.Alignment = Element.ALIGN_LEFT;
            addressPara.SpacingAfter = 2f;
            leftCell.AddElement(addressPara);

            // Report Title and Month/Year in ONE LINE (BOLD, size 10)
            Paragraph titlePara = new Paragraph(
                $"Register of Overtime Payment for the month of   {monthName}, {year}",
                FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8)
            );
            titlePara.Alignment = Element.ALIGN_LEFT;
            leftCell.AddElement(titlePara);

            headerTable.AddCell(leftCell);

            // RIGHT SIDE - "Sargaon" and Page No
            PdfPCell rightCell = new PdfPCell();
            rightCell.Border = Rectangle.NO_BORDER;
            rightCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            rightCell.VerticalAlignment = Element.ALIGN_TOP;

            //Paragraph sargaonPara = new Paragraph("Servagya", FontFactory.GetFont(FontFactory.HELVETICA, 8));
            //sargaonPara.Alignment = Element.ALIGN_RIGHT;
            //rightCell.AddElement(sargaonPara);

            // ✅ CHANGED: Create underlined font for "Servagya"
            Font underlineFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8);
            underlineFont.SetStyle(Font.UNDERLINE);


            Paragraph sargaonPara = new Paragraph("Servagya", underlineFont);
            sargaonPara.Alignment = Element.ALIGN_RIGHT;
            rightCell.AddElement(sargaonPara);


            Paragraph pageNoPara = new Paragraph($"Page No. : {pageNumber}", FontFactory.GetFont(FontFactory.HELVETICA, 8));
            pageNoPara.Alignment = Element.ALIGN_RIGHT;
            pageNoPara.SpacingBefore = 20f;
            rightCell.AddElement(pageNoPara);

            headerTable.AddCell(rightCell);

            return headerTable;
        }

        // Helper method to get month name
        private string GetMonthName(string monthId)
        {
            return monthId switch
            {
                "1" => "January",
                "2" => "February",
                "3" => "March",
                "4" => "April",
                "5" => "May",
                "6" => "June",
                "7" => "July",
                "8" => "August",
                "9" => "September",
                "10" => "October",
                "11" => "November",
                "12" => "December",
                _ => monthId
            };
        }

        private void AddTotalRow(PdfPTable dataTable, decimal totalOTRate, decimal totalOTHours,
                decimal totalOTAmount, decimal totalESI, decimal totalNet, string label)
        {
            Font boldFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8);

            // ✅ CHANGED: First cell now shows the label and spans 5 columns
            PdfPCell totalLabelCell = new PdfPCell(new Phrase(label, boldFont))
            {
                Colspan = 6,
                HorizontalAlignment = Element.ALIGN_RIGHT,  // Right-aligned like in image
                Padding = 5f,
                BorderWidthLeft = 0.5f,
                BorderWidthRight = 0.5f,
                BorderWidthTop = 1f,
                BorderWidthBottom = 0.5f
            };
            dataTable.AddCell(totalLabelCell);

            // ✅ REMOVED: The separate label cell (column 6) - no longer needed

            // OT Hours (column 6 - was column 7)
            dataTable.AddCell(new PdfPCell(new Phrase(totalOTHours.ToString("0.00"), boldFont))
            {
                HorizontalAlignment = Element.ALIGN_RIGHT,
                Padding = 5f,
                BorderWidthLeft = 0.5f,
                BorderWidthRight = 0.5f,
                BorderWidthTop = 1f,
                BorderWidthBottom = 0.5f
            });

            // OT Amount (column 7 - was column 8)
            dataTable.AddCell(new PdfPCell(new Phrase(totalOTAmount.ToString("0"), boldFont))
            {
                HorizontalAlignment = Element.ALIGN_RIGHT,
                Padding = 5f,
                BorderWidthLeft = 0.5f,
                BorderWidthRight = 0.5f,
                BorderWidthTop = 1f,
                BorderWidthBottom = 0.5f
            });

            // ESI (column 8 - was column 9)
            dataTable.AddCell(new PdfPCell(new Phrase(totalESI.ToString("0"), boldFont))
            {
                HorizontalAlignment = Element.ALIGN_RIGHT,
                Padding = 5f,
                BorderWidthLeft = 0.5f,
                BorderWidthRight = 0.5f,
                BorderWidthTop = 1f,
                BorderWidthBottom = 0.5f
            });

            // Net OT (column 9 - was column 10)
            dataTable.AddCell(new PdfPCell(new Phrase(totalNet.ToString("0"), boldFont))
            {
                HorizontalAlignment = Element.ALIGN_RIGHT,
                Padding = 5f,
                BorderWidthLeft = 0.5f,
                BorderWidthRight = 0.5f,
                BorderWidthTop = 1f,
                BorderWidthBottom = 0.5f
            });

            // Last 3 columns (10, 11, 12) - empty and merged
            dataTable.AddCell(new PdfPCell(new Phrase("", boldFont))
            {
                Colspan = 2,  // ✅ CHANGED: Changed from 2 to 3 to cover remaining columns
                Padding = 5f,
                BorderWidthLeft = 0.5f,
                BorderWidthRight = 0.5f,
                BorderWidthTop = 1f,
                BorderWidthBottom = 0.5f
            });
        }



        private byte[] CreateGratuityStatementPdf(dynamic companyData, dynamic gratuityData, ReportModelRequest request)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                // Create document with portrait orientation
                Document document = new Document(PageSize.A4, 15f, 15f, 80f, 20f);
                PdfWriter writer = PdfWriter.GetInstance(document, ms);

                // Page event add karo
                //Font pageNumberFont = FontFactory.GetFont(FontFactory.HELVETICA, 8);
                //writer.PageEvent = new PageNumberEvent(pageNumberFont);

                writer.PageEvent = new PageHeaderEvent(companyData);

                document.Open();

                // Add header section
                //AddGratuityStatementHeader(document, companyData, gratuityData);



                // Add employee gratuity table
                AddGratuityStatementTable(document, gratuityData);

                document.Close();

                return ms.ToArray();
            }
        }

        //private void AddGratuityStatementHeader(Document document, dynamic companyData, dynamic gratuityData)
        //{
        //    // Fonts
        //    Font titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);
        //    Font normalFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9);
        //    Font smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 8);
        //    Font boldSmallFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7);

        //    // Get company details
        //    string companyName = "UNKNOWN";
        //    string companyAddress = "";

        //    if (companyData is IDictionary<string, object> dict)
        //    {
        //        companyName = dict.ContainsKey("Company Name")
        //            ? dict["Company Name"]?.ToString() ?? "UNKNOWN"
        //            : "UNKNOWN";
        //        companyAddress = dict.ContainsKey("Company Address")
        //            ? dict["Company Address"]?.ToString() ?? ""
        //            : "";
        //    }


        //    Paragraph companyLine = new Paragraph();

        //    // Company name
        //    Chunk companyChunk = new Chunk(companyName, titleFont);
        //    companyLine.Add(companyChunk);

        //    // Spaces for pushing right
        //    string spaces = new string(' ', 150); // Adjust number of spaces
        //    companyLine.Add(new Chunk(spaces, smallFont));

        //    // Servagya with underline
        //    Chunk servagyaChunk = new Chunk("Servagya", normalFont);
        //    servagyaChunk.SetUnderline(0.5f, -1f);
        //    companyLine.Add(servagyaChunk);

        //    document.Add(companyLine);

        //    // Company address
        //    if (!string.IsNullOrEmpty(companyAddress))
        //    {
        //        Paragraph address = new Paragraph(companyAddress, normalFont);
        //        address.Alignment = Element.ALIGN_LEFT;
        //        document.Add(address);
        //    }




        //    // Statement of Gratuity with Page No: 1 (for first page only)
        //    Paragraph statementLine = new Paragraph();
        //    statementLine.SpacingAfter = 2f;

        //    Chunk statementChunk = new Chunk("Statement of Gratuity : 262503", boldSmallFont);
        //    statementLine.Add(statementChunk);

        //    // Add spaces to push "Page No: 1" to right
        //    string pageSpaces = new string(' ', 165); // Adjust as needed
        //    statementLine.Add(new Chunk(pageSpaces, smallFont));

        //    // Add "Page No: 1" for first page
        //    Chunk pageNoChunk = new Chunk("Page No : 1", smallFont);
        //    statementLine.Add(pageNoChunk);

        //    document.Add(statementLine);


        //}

        private void AddGratuityStatementTable(Document document, dynamic gratuityData)
        {
            Font tableHeaderFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7);
            Font tableCellFont = FontFactory.GetFont(FontFactory.HELVETICA, 7);
            Font smallCellFont = FontFactory.GetFont(FontFactory.HELVETICA, 6);
            Font boldCellFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7);

            // Create main table with 8 columns
            PdfPTable table = new PdfPTable(8);
            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 9f, 25f, 10f, 12f, 10f, 10f, 11f, 11f });

            // Add table headers
            AddGratuityStatementHeaders(table, tableHeaderFont);

            table.HeaderRows = 1;
            // Add data rows
            int srNo = 1;
            if (gratuityData != null)
            {
                foreach (var employee in gratuityData)
                {
                    AddGratuityEmployeeRows(table, employee, srNo++, tableCellFont, smallCellFont, boldCellFont);
                }
            }

            document.Add(table);
        }

        private void AddGratuityStatementHeaders(PdfPTable table, Font font)
        {
            // Row 1: All column headers (single row)
            AddGratuityHeaderCell(table, "S.No.\nId #", font, 1, 1);
            AddGratuityHeaderCell(table, "Employee Name\nF/H Name\nDesignation", font, 1, 1);
            AddGratuityHeaderCell(table, "Date of\nJoining and\nBirth", font, 1, 1);
            AddGratuityHeaderCell(table, "Date of\nCalculating\nGratuity", font, 1, 1);
            AddGratuityHeaderCell(table, "Gross\nService", font, 1, 1);
            AddGratuityHeaderCell(table, "Eligible\nService", font, 1, 1);
            AddGratuityHeaderCell(table, "Basic\nRate", font, 1, 1);
            AddGratuityHeaderCell(table, "Gratuity\nAmount", font, 1, 1);
        }

        private void AddGratuityHeaderCell(PdfPTable table, string text, Font font, int rowspan, int colspan)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.Padding = 3;
            cell.Rowspan = rowspan;
            cell.Colspan = colspan;
            cell.MinimumHeight = 20f;
            table.AddCell(cell);
        }

        private void AddGratuityEmployeeRows(PdfPTable table, dynamic employee, int srNo, Font normalFont, Font smallFont, Font boldFont)
        {
            var empDict = employee as IDictionary<string, object>;

            // Get employee data
            string empName = GetValue(empDict, "empname");
            string empCode = GetValue(empDict, "empcode");
            string fatherName = GetValue(empDict, "FatherName");
            string designation = GetValue(empDict, "Designation");


            int totalRows = 3; // Example: employee + 2 family members

            // Column 1: Sr. No WITH EmpCode (spans all rows for this employee)
            PdfPCell srCell = new PdfPCell();
            // Add serial number (bold/normal)
            Paragraph srNoPara = new Paragraph(srNo.ToString(), normalFont);
            srCell.AddElement(srNoPara);

            // Add employee code below serial number
            Paragraph empCodePara = new Paragraph(empCode, smallFont);
            srCell.AddElement(empCodePara);

            srCell.HorizontalAlignment = Element.ALIGN_RIGHT;
            srCell.VerticalAlignment = Element.ALIGN_TOP;
            srCell.Rowspan = totalRows;
            srCell.Padding = 3;
            srCell.MinimumHeight = 15f;
            table.AddCell(srCell);




            // Column 2: Employee details (multi-line cell spanning all rows)
            PdfPCell nameCell = new PdfPCell();

            // Add employee name (bold)
            Paragraph empNamePara = new Paragraph(empName, smallFont);
            nameCell.AddElement(empNamePara);



            // Add father's name
            Paragraph fatherNamePara = new Paragraph(fatherName, smallFont);
            nameCell.AddElement(fatherNamePara);

            // Add designation
            Paragraph designationPara = new Paragraph(designation, smallFont);
            nameCell.AddElement(designationPara);

            nameCell.VerticalAlignment = Element.ALIGN_TOP;
            nameCell.Padding = 3;
            nameCell.Rowspan = totalRows;
            nameCell.MinimumHeight = 15f;
            table.AddCell(nameCell);


            // Columns 3-8: These span all employee rows
            string doj = GetValue(empDict, "dateofjoining");
            string dob = GetValue(empDict, "dateofbirth");

            // Column 3: Date of Joining and Birth
            AddGratuityDataCell(table, doj + "\n" + dob, normalFont, Element.ALIGN_CENTER, totalRows);

            // Column 4: Date of Calculating Gratuity
            string calcDate = GetValue(empDict, "DateOfcalGrau");
            AddGratuityDataCell(table, calcDate, normalFont, Element.ALIGN_CENTER, totalRows);

            // Column 5: Gross Service
            string grossService = GetValue(empDict, "GrossService");
            AddGratuityDataCell(table, grossService, normalFont, Element.ALIGN_CENTER, totalRows);

            // Column 6: Eligible Service
            string eligibleService = GetValue(empDict, "EligibleService");
            AddGratuityDataCell(table, eligibleService, normalFont, Element.ALIGN_CENTER, totalRows);

            // Column 7: Basic Rate
            string basicRate = GetValue(empDict, "PayRAmt1");
            AddGratuityDataCell(table, basicRate, normalFont, Element.ALIGN_RIGHT, totalRows);

            // Column 8: Gratuity Amount
            string gratuityAmount = GetValue(empDict, "GratuityAmt");
            AddGratuityDataCell(table, gratuityAmount, normalFont, Element.ALIGN_RIGHT, totalRows);
        }

        private void AddGratuityDataCell(PdfPTable table, string text, Font font, int alignment, int rowspan)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text ?? "", font));
            cell.HorizontalAlignment = alignment;
            cell.VerticalAlignment = Element.ALIGN_TOP;
            cell.Padding = 3;
            cell.MinimumHeight = 15f;
            cell.Rowspan = rowspan;
            table.AddCell(cell);
        }

    }

    public class PageHeaderEvent : PdfPageEventHelper
    {
        private Font titleFont;
        private Font normalFont;
        private Font smallFont;
        private Font boldSmallFont;
        private dynamic companyData;

        public PageHeaderEvent(dynamic companyData)
        {
            this.companyData = companyData;

            titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);
            normalFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9);
            smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 8);
            boldSmallFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7);
        }

        public override void OnEndPage(PdfWriter writer, Document document)
        {
            string companyName = "UNKNOWN";
            string companyAddress = "";

            if (companyData is IDictionary<string, object> dict)
            {
                companyName = dict.ContainsKey("Company Name")
                    ? dict["Company Name"]?.ToString() ?? "UNKNOWN"
                    : "UNKNOWN";
                companyAddress = dict.ContainsKey("Company Address")
                    ? dict["Company Address"]?.ToString() ?? ""
                    : "";
            }

            PdfContentByte cb = writer.DirectContent;
            //float yPos = document.PageSize.Height - document.TopMargin + 10f;
            float yPos = document.PageSize.Height - 20f; // Fixed position from top

            // Company name (left)
            Phrase companyPhrase = new Phrase(companyName, titleFont);
            ColumnText.ShowTextAligned(cb, Element.ALIGN_LEFT, companyPhrase,
                document.LeftMargin, yPos, 0);

            // Servagya (right) with underline
            Chunk servagyaChunk = new Chunk("Servagya", normalFont);
            servagyaChunk.SetUnderline(0.5f, -1f);
            Phrase servagyaPhrase = new Phrase(servagyaChunk);
            ColumnText.ShowTextAligned(cb, Element.ALIGN_RIGHT, servagyaPhrase,
                document.PageSize.Width - document.RightMargin, yPos, 0);

            yPos -= 15f;

            // Company Address
            if (!string.IsNullOrEmpty(companyAddress))
            {
                Phrase addressPhrase = new Phrase(companyAddress, normalFont);
                ColumnText.ShowTextAligned(cb, Element.ALIGN_LEFT, addressPhrase,
                    document.LeftMargin, yPos, 0);
                yPos -= 15f;
            }

            // Statement of Gratuity and Page Number
            Phrase statementPhrase = new Phrase("Statement of Gratuity : 262503", boldSmallFont);
            ColumnText.ShowTextAligned(cb, Element.ALIGN_LEFT, statementPhrase,
                document.LeftMargin, yPos, 0);

            string pageText = "Page No : " + writer.PageNumber;
            Phrase pagePhrase = new Phrase(pageText, smallFont);
            ColumnText.ShowTextAligned(cb, Element.ALIGN_RIGHT, pagePhrase,
                document.PageSize.Width - document.RightMargin, yPos, 0);
        }




    }

    public class BonusRegisterPageEvent : PdfPageEventHelper
    {
        private dynamic companyData;
        private dynamic bonusData;

        public BonusRegisterPageEvent(dynamic compData, dynamic bonData)
        {
            this.companyData = compData;
            this.bonusData = bonData;
        }

        public override void OnEndPage(PdfWriter writer, Document document)
        {
            // Get data for header
            string fromDateStr = "";
            string toDateStr = "";
            int TotalWorkingDaysInYear = 0;

            if (bonusData != null)
            {
                var firstRow = (bonusData as IEnumerable<dynamic>)?.FirstOrDefault();
                var rowDict = firstRow as IDictionary<string, object>;

                if (rowDict != null)
                {
                    fromDateStr = rowDict.ContainsKey("FromDate") ? rowDict["FromDate"]?.ToString() : "";
                    toDateStr = rowDict.ContainsKey("ToDate") ? rowDict["ToDate"]?.ToString() : "";
                    TotalWorkingDaysInYear = rowDict.ContainsKey("TotalWorkingDaysInYear") && rowDict["TotalWorkingDaysInYear"] != DBNull.Value
                        ? (rowDict["TotalWorkingDaysInYear"] is int ? (int)rowDict["TotalWorkingDaysInYear"] : Convert.ToInt32(rowDict["TotalWorkingDaysInYear"]))
                        : 0;
                }
            }

            // Fonts
            Font headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);
            Font PFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8);
            Font normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 8);
            Font companyfont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
            Font headerFnt = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 13, Font.UNDERLINE);

            // Create header table
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.TotalWidth = document.PageSize.Width - document.LeftMargin - document.RightMargin;
            headerTable.LockedWidth = true;

            // Prescribed text
            PdfPCell prescribedCell = new PdfPCell(new Phrase("Prescribed under payment of Bonus Rule 4(c) of 1975 & Revised by Notification No. GSR 1147 dated 23/8/1979", PFont));
            prescribedCell.HorizontalAlignment = Element.ALIGN_CENTER;
            prescribedCell.Border = Rectangle.NO_BORDER;
            prescribedCell.PaddingBottom = 5;
            headerTable.AddCell(prescribedCell);

            // Title
            PdfPCell titleCell = new PdfPCell(new Phrase("Register for Payment of Bonus", headerFnt));
            titleCell.HorizontalAlignment = Element.ALIGN_CENTER;
            titleCell.Border = Rectangle.NO_BORDER;
            titleCell.PaddingBottom = 5;
            headerTable.AddCell(titleCell);

            // Form reference
            PdfPCell formCell = new PdfPCell(new Phrase("FORM \"C\" (See rule 4 [c])", headerFont));
            formCell.HorizontalAlignment = Element.ALIGN_CENTER;
            formCell.Border = Rectangle.NO_BORDER;
            formCell.PaddingBottom = 10;
            headerTable.AddCell(formCell);

            // Company details
            string companyName = "UNKNOWN";
            if (companyData is IDictionary<string, object> dict)
            {
                companyName = dict.ContainsKey("Company Name") ? dict["Company Name"]?.ToString() ?? "UNKNOWN" : "UNKNOWN";
            }

            string bonusPeriod = $"Bonus paid to employees for the accounting year ending on {fromDateStr} to {toDateStr}";

            PdfPTable detailsTable = new PdfPTable(3);
            detailsTable.TotalWidth = document.PageSize.Width - document.LeftMargin - document.RightMargin;
            detailsTable.LockedWidth = true;
            detailsTable.SetWidths(new float[] { 40f, 40f, 20f });

            PdfPCell leftCell = new PdfPCell(new Phrase($"Name of the Establishment : {companyName}", companyfont));
            leftCell.Border = Rectangle.NO_BORDER;
            leftCell.HorizontalAlignment = Element.ALIGN_LEFT;

            PdfPCell centerCell = new PdfPCell(new Phrase($"{bonusPeriod}", normalFont));
            centerCell.Border = Rectangle.NO_BORDER;
            centerCell.HorizontalAlignment = Element.ALIGN_CENTER;

            PdfPCell rightCell = new PdfPCell(new Phrase($"No of working days in the year\n……{TotalWorkingDaysInYear}……….", normalFont));
            rightCell.Border = Rectangle.NO_BORDER;
            rightCell.HorizontalAlignment = Element.ALIGN_RIGHT;

            detailsTable.AddCell(leftCell);
            detailsTable.AddCell(centerCell);
            detailsTable.AddCell(rightCell);

            PdfPCell detailsWrapperCell = new PdfPCell(detailsTable);
            detailsWrapperCell.Border = Rectangle.NO_BORDER;
            detailsWrapperCell.PaddingBottom = 10;
            headerTable.AddCell(detailsWrapperCell);

            // Write header at top of page
            headerTable.WriteSelectedRows(0, -1, document.LeftMargin, document.PageSize.Height - 10, writer.DirectContent);
        }
    }

   

    //public class SalaryRegisterPageEvent : PdfPageEventHelper
    //{
    //    private readonly string _compName;
    //    private readonly string _address;
    //    private readonly string _contractorName;
    //    private readonly string _caption;
    //    private readonly string _monthName;
    //    private readonly string _yearId;
    //    private readonly string _firmPFNumber;
    //    private readonly string _firmESICNumber;
    //    private readonly string _department;          // 🔥 NEW
    //    private readonly string _departmentLocation;
    //    private readonly string _leaveDetailsText;
    //    private readonly bool _showFirmDetails;

    //    private BaseFont _baseFont;
    //    private Font _boldFont12;
    //    private Font _boldFont11;
    //    private Font _boldFont9;
    //    private Font _normalFont8;
    //    private Font _normalFont5;
    //    private Font _boldFont10;
    //    private Font _redFont8;

    //    public SalaryRegisterPageEvent(string compName, string address, string contractorName,
    //        string caption, string monthName, string yearId, string firmPFNumber, string firmESICNumber,
    //        string department = null, string departmentLocation = null,       // 🔥 department added
    //        string leaveDetailsText = null, bool showFirmDetails = true)
    //    {
    //        _compName = compName;
    //        _address = address;
    //        _contractorName = contractorName;
    //        _caption = caption;
    //        _monthName = monthName;
    //        _yearId = yearId;
    //        _firmPFNumber = firmPFNumber;
    //        _firmESICNumber = firmESICNumber;
    //        _department = department;                  // 🔥 NEW
    //        _departmentLocation = departmentLocation;
    //        _leaveDetailsText = leaveDetailsText;
    //        _showFirmDetails = showFirmDetails;

    //        _baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
    //        _boldFont12 = new Font(_baseFont, 12f, Font.BOLD);
    //        _boldFont11 = new Font(_baseFont, 10f, Font.BOLD);
    //        _boldFont9 = new Font(_baseFont, 9f, Font.BOLD);
    //        _normalFont8 = new Font(_baseFont, 8f, Font.NORMAL);
    //        _normalFont5 = new Font(_baseFont, 8f, Font.BOLD);
    //        _boldFont10 = new Font(_baseFont, 10f, Font.BOLD);
    //        _redFont8 = new Font(_baseFont, 8f, Font.NORMAL, BaseColor.RED);
    //    }

    //    public override void OnStartPage(PdfWriter writer, Document document)
    //    {
    //        PdfPTable headerTable = new PdfPTable(2);
    //        headerTable.WidthPercentage = 100;
    //        headerTable.SetWidths(new float[] { 65f, 35f });
    //        headerTable.DefaultCell.Border = Rectangle.NO_BORDER;

    //        // --- LEFT CELL ---
    //        PdfPTable leftInner = new PdfPTable(1);
    //        leftInner.WidthPercentage = 100;
    //        leftInner.DefaultCell.Border = Rectangle.NO_BORDER;

    //        leftInner.AddCell(new PdfPCell(new Phrase(_compName, _boldFont12))
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            Padding = 0,
    //            PaddingBottom = 2f
    //        });

    //        leftInner.AddCell(new PdfPCell(new Phrase(_address, _boldFont11))
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            Padding = 0,
    //            PaddingBottom = 12f
    //        });

    //        if (!string.IsNullOrWhiteSpace(_contractorName))
    //            leftInner.AddCell(new PdfPCell(new Phrase(_contractorName, _boldFont9))
    //            {
    //                Border = Rectangle.NO_BORDER,
    //                Padding = 0,
    //                PaddingBottom = 5f
    //            });

    //        leftInner.AddCell(new PdfPCell(new Phrase($"{_caption} {_monthName},{_yearId}", _boldFont10))
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            Padding = 0,
    //            PaddingBottom = 8f
    //        });

    //        PdfPTable deptLocTable = new PdfPTable(4);
    //        deptLocTable.WidthPercentage = 100;
    //        deptLocTable.SetWidths(new float[] { 15f, 45f, 15f, 25f });
    //        deptLocTable.DefaultCell.Border = Rectangle.NO_BORDER;

    //        deptLocTable.AddCell(new PdfPCell(new Phrase("Department", _boldFont10))
    //        { Border = Rectangle.NO_BORDER, Padding = 0 });

    //        deptLocTable.AddCell(new PdfPCell(new Phrase(_department ?? "", _boldFont10))   // 🔥 was "" — now DB value
    //        { Border = Rectangle.NO_BORDER, Padding = 0 });

    //        deptLocTable.AddCell(new PdfPCell(new Phrase("Location", _boldFont10))
    //        { Border = Rectangle.NO_BORDER, Padding = 0 });

    //        deptLocTable.AddCell(new PdfPCell(new Phrase(_departmentLocation ?? "", _boldFont10))
    //        { Border = Rectangle.NO_BORDER, Padding = 0 });

    //        PdfPCell deptLocWrapper = new PdfPCell(deptLocTable)
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            Padding = 0,
    //            PaddingBottom = 5f
    //        };

    //        leftInner.AddCell(deptLocWrapper);

    //        if (!string.IsNullOrWhiteSpace(_leaveDetailsText))
    //            leftInner.AddCell(new PdfPCell(new Phrase(_leaveDetailsText, _redFont8))
    //            {
    //                Border = Rectangle.NO_BORDER,
    //                Padding = 0,
    //                PaddingBottom = 3f

    //            });

    //        PdfPCell leftCell = new PdfPCell(leftInner)
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            VerticalAlignment = Element.ALIGN_TOP,
    //            PaddingLeft = 8f,
    //            PaddingBottom = 6f
    //        };

    //        headerTable.AddCell(leftCell);

    //        // --- RIGHT CELL ---
    //        int pageNumber = writer.PageNumber;
    //        Phrase rightContent = new Phrase();

    //        if (_showFirmDetails)
    //        {
    //            rightContent.Add(new Chunk("Firm PF Number  ", _normalFont5));
    //            rightContent.Add(new Chunk($"{_firmPFNumber}\n", _normalFont8));

    //            rightContent.Add(new Chunk("Firm ESIC Number  ", _normalFont5));
    //            rightContent.Add(new Chunk($"{_firmESICNumber}\n\n", _normalFont8));

    //            rightContent.Add(new Chunk("Page No. : ", _normalFont8));
    //            rightContent.Add(new Chunk($"{pageNumber}", _normalFont8));
    //        }
    //        else
    //        {
    //            rightContent.Add(new Chunk($"{pageNumber}", _normalFont8));
    //        }

    //        PdfPCell rightCell = new PdfPCell(rightContent)
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            HorizontalAlignment = Element.ALIGN_RIGHT,
    //            VerticalAlignment = Element.ALIGN_TOP,
    //            PaddingRight = 8f,
    //            PaddingBottom = 2f,
    //        };
    //        headerTable.AddCell(rightCell);

    //        document.Add(headerTable);
    //    }
    //}


    //public class SalaryRegisterPageEvent : PdfPageEventHelper
    //{
    //    private readonly string _compName;
    //    private readonly string _address;
    //    private readonly string _contractorName;
    //    private readonly string _caption;
    //    private readonly string _monthName;
    //    private readonly string _yearId;
    //    private readonly string _firmPFNumber;
    //    private readonly string _firmESICNumber;

    //    private BaseFont _baseFont;
    //    private Font _boldFont12;
    //    private Font _boldFont11;
    //    private Font _boldFont9;
    //    private Font _normalFont8;
    //    private Font _normalFont5;

    //    public SalaryRegisterPageEvent(string compName, string address, string contractorName,
    //        string caption, string monthName, string yearId, string firmPFNumber, string firmESICNumber)
    //    {
    //        _compName = compName;
    //        _address = address;
    //        _contractorName = contractorName;
    //        _caption = caption;
    //        _monthName = monthName;
    //        _yearId = yearId;
    //        _firmPFNumber = firmPFNumber;
    //        _firmESICNumber = firmESICNumber;

    //        _baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
    //        _boldFont12 = new Font(_baseFont, 12f, Font.BOLD);
    //        _boldFont11 = new Font(_baseFont, 10f, Font.BOLD);
    //        _boldFont9 = new Font(_baseFont, 9f, Font.BOLD);
    //        _normalFont8 = new Font(_baseFont, 8f, Font.NORMAL);
    //        _normalFont5 = new Font(_baseFont, 8f, Font.BOLD);


    //    }

    //    public override void OnStartPage(PdfWriter writer, Document document)
    //    {
    //        // ===== Use a 2-column table: Left = Company Info, Right = PF/ESIC/Page =====
    //        PdfPTable headerTable = new PdfPTable(2);
    //        headerTable.WidthPercentage = 100;
    //        headerTable.SetWidths(new float[] { 65f, 35f });
    //        headerTable.DefaultCell.Border = Rectangle.NO_BORDER;

    //        // --- LEFT CELL: Company Name + Address + Contractor + Month ---
    //        Phrase leftContent = new Phrase();
    //        leftContent.Add(new Chunk(_compName + "\n", _boldFont12));
    //        leftContent.Add(new Chunk(_address + "\n", _boldFont11));
    //        leftContent.Add(new Chunk(_contractorName + "\n", _boldFont9));
    //        leftContent.Add(new Chunk($"{_caption} {_monthName},{_yearId}", _boldFont9));

    //        PdfPCell leftCell = new PdfPCell(leftContent)
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            HorizontalAlignment = Element.ALIGN_LEFT,
    //            VerticalAlignment = Element.ALIGN_TOP,
    //            PaddingLeft = 8f,
    //            PaddingBottom = 6f
    //        };
    //        headerTable.AddCell(leftCell);

    //        // --- RIGHT CELL: Firm PF Number + ESIC Number + Page No ---
    //        int pageNumber = writer.PageNumber;
    //        Phrase rightContent = new Phrase();
    //        //rightContent.Add(new Chunk($"Firm PF Number   {_firmPFNumber}\n\n", _normalFont8));
    //        //rightContent.Add(new Chunk($"Firm ESIC Number   {_firmESICNumber}\n", _normalFont8));
    //        //rightContent.Add(new Chunk($"Page No. : {pageNumber}", _normalFont8));
    //        // Firm PF Number
    //        rightContent.Add(new Chunk("Firm PF Number  ", _normalFont5));
    //        rightContent.Add(new Chunk($"{_firmPFNumber}\n", _normalFont8));

    //        // Firm ESIC Number
    //        rightContent.Add(new Chunk("Firm ESIC Number  ", _normalFont5));
    //        rightContent.Add(new Chunk($"{_firmESICNumber}\n\n", _normalFont8));

    //        // Page No
    //        rightContent.Add(new Chunk("Page No. : ", _normalFont8));
    //        rightContent.Add(new Chunk($"{pageNumber}", _normalFont8));

    //        PdfPCell rightCell = new PdfPCell(rightContent)
    //        {
    //            Border = Rectangle.NO_BORDER,
    //            HorizontalAlignment = Element.ALIGN_RIGHT,
    //            VerticalAlignment = Element.ALIGN_TOP,
    //            PaddingRight = 8f,
    //            PaddingBottom = 2f,

    //        };
    //        headerTable.AddCell(rightCell);

    //        document.Add(headerTable);
    //    }
    //}




}
