using ClosedXML.Excel;
using Dapper;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class VendorController : ControllerBase
    {
        private readonly IVendorRepository _vendorRepository;
        private readonly IConfiguration _configuration;
        public VendorController(IVendorRepository vendorRepository, IConfiguration configuration)
        {
            _vendorRepository = vendorRepository;
            _configuration = configuration;
        }

        [HttpGet("DownloadVendorVerificationExcel")]
        [Authorize]
        public async Task<IActionResult> DownloadVendorVerificationExcel([FromQuery] string searchTerm = "", [FromQuery] string locationId = "")
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var (_, vendors) = await _vendorRepository.DownloadVendorVerificationListAsync(1, 100000, companyId, userId, searchTerm, locationId);

                var vendorList = vendors?.ToList() ?? new List<VendorVerificationListModel>();
                if (!vendorList.Any())
                {
                    return BadRequest(new { IsSuccess = false, Message = "No vendor data found to download." });
                }

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Vendor Verification");

                    // Header styling
                    var headers = new[] { "Sr. No.", "Location Name", "Vendor Code", "Vendor Name", "Email", "Verification Link", "Status" };
                    for (int i = 0; i < headers.Length; i++)
                    {
                        var cell = worksheet.Cell(1, i + 1);
                        cell.Value = headers[i];
                        cell.Style.Font.Bold = true;
                        cell.Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
                        cell.Style.Font.FontColor = XLColor.White;
                        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                        cell.Style.Border.OutsideBorderColor = XLColor.FromArgb(200, 200, 200);
                    }

                    int row = 2;
                    int srNo = 1;
                    foreach (var item in vendorList)
                    {
                        worksheet.Cell(row, 1).Value = srNo++;
                        worksheet.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        worksheet.Cell(row, 2).Value = item.LocationName ?? "";
                        worksheet.Cell(row, 3).Value = item.VendorCode ?? "";
                        worksheet.Cell(row, 4).Value = item.VendorName ?? "";
                        worksheet.Cell(row, 5).Value = item.Email ?? "";
                        worksheet.Cell(row, 6).Value = item.VerificationLink ?? "";
                        worksheet.Cell(row, 7).Value = item.Status ?? "";

                        for (int col = 1; col <= headers.Length; col++)
                        {
                            worksheet.Cell(row, col).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                            worksheet.Cell(row, col).Style.Border.OutsideBorderColor = XLColor.FromArgb(230, 230, 230);
                        }

                        row++;
                    }

                    worksheet.Columns().AdjustToContents();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var fileBytes = stream.ToArray();
                        return File(
                            fileBytes,
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            $"Vendor_Verification_List_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpPost("RateCardExcelUpload")]
        [Authorize]
        public async Task<IActionResult> UploadRateCard(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                // STEP 1: Save uploaded Excel file to path configured in appsettings.json (VendorRateCardUploads)
                var uploadsFolder = _configuration["AppSettings:VendorRateCardUploads"];
                if (string.IsNullOrEmpty(uploadsFolder))
                {
                    uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "VendorRateCardUploads");
                }
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
                var savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyyyy_HHmmss}{ext}";
                var physicalPath = Path.Combine(uploadsFolder, savedFileName);

                using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // STEP 2: Read Excel
                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                // STEP 3: Convert dynamic Excel rows to VendorRateCardModel
                var rateCards = MapToVendorRateCardModels(data);
                foreach (var card in rateCards)
                {
                    card.Source = savedFileName;
                    card.FilePath = physicalPath;
                }

                // STEP 4: Wrap in request object
                var request = new VendorRateCardUploadRequest
                {
                    RateCards = rateCards
                };

                // STEP 5: User context
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var locationId = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";

                // STEP 6: Call repository SP passing savedFileName
                var result = (await _vendorRepository.UploadRateCardAsync(request, userId, companyId, locationId, savedFileName))?.ToList()
                             ?? new List<dynamic>();


                //added code 31 aug 2026 starts
                // Multi-Tab Excel: Background Task to append Tab 2 (Upload Summary & Status)
                var resultsForExcel = result.ToList();
                _ = Task.Run(() =>
                {
                    try
                    {
                        using (var wb = new XLWorkbook(physicalPath))
                        {
                            var sourceWs = wb.Worksheets.FirstOrDefault(w => !w.Name.Equals("Upload Summary & Status", StringComparison.OrdinalIgnoreCase))
                                           ?? wb.Worksheet(1);

                            string summarySheetName = "Upload Summary & Status";
                            var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
                            if (existingSummary != null)
                            {
                                wb.Worksheets.Delete(existingSummary.Name);
                            }

                            var summaryWs = wb.Worksheets.Add(summarySheetName);

                            int totalCount = resultsForExcel.Count;
                            int successCount = resultsForExcel.Count(r =>
                            {
                                var dict = (IDictionary<string, object>)r;
                                var st = dict.ContainsKey("Status") ? Convert.ToString(dict["Status"]) : "";
                                return st == "Uploaded" || st == "Inserted" || st == "Updated" || st == "Success";
                            });
                            int failedCount = totalCount - successCount;

                            // Top Summary Metrics
                            summaryWs.Cell(1, 1).Value = "Total Records";
                            summaryWs.Cell(1, 1).Style.Font.Bold = true;
                            summaryWs.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
                            summaryWs.Cell(1, 1).Style.Font.FontColor = XLColor.White;
                            summaryWs.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(1, 2).Value = "Success / Uploaded";
                            summaryWs.Cell(1, 2).Style.Font.Bold = true;
                            summaryWs.Cell(1, 2).Style.Fill.BackgroundColor = XLColor.FromArgb(25, 135, 84);
                            summaryWs.Cell(1, 2).Style.Font.FontColor = XLColor.White;
                            summaryWs.Cell(1, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(1, 3).Value = "Failed / Not Uploaded";
                            summaryWs.Cell(1, 3).Style.Font.Bold = true;
                            summaryWs.Cell(1, 3).Style.Fill.BackgroundColor = XLColor.FromArgb(220, 53, 69);
                            summaryWs.Cell(1, 3).Style.Font.FontColor = XLColor.White;
                            summaryWs.Cell(1, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(2, 1).Value = totalCount;
                            summaryWs.Cell(2, 1).Style.Font.Bold = true;
                            summaryWs.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(2, 2).Value = successCount;
                            summaryWs.Cell(2, 2).Style.Font.Bold = true;
                            summaryWs.Cell(2, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            summaryWs.Cell(2, 3).Value = failedCount;
                            summaryWs.Cell(2, 3).Style.Font.Bold = true;
                            summaryWs.Cell(2, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                            // Tab 2 Detailed Header (Sr. No + Status / Remarks + All original Tab 1 columns)
                            int summaryHeaderRow = 4;
                            summaryWs.Cell(summaryHeaderRow, 1).Value = "Sr. No";
                            summaryWs.Cell(summaryHeaderRow, 1).Style.Font.Bold = true;
                            summaryWs.Cell(summaryHeaderRow, 1).Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                            summaryWs.Cell(summaryHeaderRow, 1).Style.Font.FontColor = XLColor.White;

                            summaryWs.Cell(summaryHeaderRow, 2).Value = "Status / Remarks";
                            summaryWs.Cell(summaryHeaderRow, 2).Style.Font.Bold = true;
                            summaryWs.Cell(summaryHeaderRow, 2).Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                            summaryWs.Cell(summaryHeaderRow, 2).Style.Font.FontColor = XLColor.White;

                            var firstRow = sourceWs.FirstRowUsed();
                            int sourceColCount = firstRow != null ? firstRow.LastCellUsed()?.Address.ColumnNumber ?? 0 : 0;
                            if (sourceColCount == 0 && sourceWs.LastColumnUsed() != null)
                            {
                                sourceColCount = sourceWs.LastColumnUsed().ColumnNumber();
                            }

                            for (int col = 1; col <= sourceColCount; col++)
                            {
                                var cell = summaryWs.Cell(summaryHeaderRow, col + 2);
                                cell.Value = sourceWs.Cell(1, col).Value;
                                cell.Style.Font.Bold = true;
                                cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                                cell.Style.Font.FontColor = XLColor.White;
                            }

                            // Copy Data rows from Tab 1 and attach Status / Remarks
                            int sourceLastRow = sourceWs.LastRowUsed()?.RowNumber() ?? 1;
                            int currRow = 5;

                            for (int r = 2; r <= sourceLastRow; r++)
                            {
                                int dataIdx = r - 2;
                                summaryWs.Cell(currRow, 1).Value = dataIdx + 1;

                                if (dataIdx < resultsForExcel.Count)
                                {
                                    var dict = (IDictionary<string, object>)resultsForExcel[dataIdx];
                                    string st = dict.ContainsKey("Status") ? Convert.ToString(dict["Status"]) ?? "" : "";
                                    string rem = dict.ContainsKey("Remarks") ? Convert.ToString(dict["Remarks"]) ?? "" : "";

                                    string statusDisplay = "Uploaded";
                                    if (st == "Failed" || st == "Not Uploaded" || st == "Error" || (st != "Uploaded" && st != "Inserted" && st != "Updated"))
                                    {
                                        statusDisplay = $"Failed - {(string.IsNullOrEmpty(rem) ? "Validation error" : rem)}";
                                        summaryWs.Cell(currRow, 2).Value = statusDisplay;
                                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Red;
                                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                    }
                                    else if (st == "Already Exists" || st == "Skipped")
                                    {
                                        statusDisplay = "Already Exists";
                                        summaryWs.Cell(currRow, 2).Value = statusDisplay;
                                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.FromArgb(255, 140, 0);
                                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                    }
                                    else
                                    {
                                        statusDisplay = "Uploaded";
                                        summaryWs.Cell(currRow, 2).Value = statusDisplay;
                                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                    }
                                }
                                else
                                {
                                    summaryWs.Cell(currRow, 2).Value = "Uploaded";
                                    summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                                    summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                }

                                // Copy all columns exactly as in Tab 1
                                for (int col = 1; col <= sourceColCount; col++)
                                {
                                    summaryWs.Cell(currRow, col + 2).Value = sourceWs.Cell(r, col).Value;
                                }

                                currRow++;
                            }

                            summaryWs.Columns().AdjustToContents();
                            wb.Save();
                        }
                    }
                    catch (Exception exWb)
                    {
                        Console.WriteLine("Could not append summary sheet to Rate Card Excel: " + exWb.Message);
                    }
                });
                //added code 31 aug 2026 ends



                var uploadedCount = result.Count(r =>
                {
                    var status = Convert.ToString(((IDictionary<string, object>)r)["Status"]);
                    return status == "Uploaded" || status == "Inserted" || status == "Updated";
                });
                var notUploadedCount = result.Count - uploadedCount;




                modelResponse.IsSuccess = true;
                modelResponse.Message = $"Upload complete. Processed: {uploadedCount}, Failed: {notUploadedCount}.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                string details = ex.InnerException != null
                    ? $"{ex.Message} | Inner: {ex.InnerException.Message}"
                    : ex.Message;

                if (ex is SqlException sqlEx)
                {
                    var realErrors = sqlEx.Errors.Cast<SqlError>()
                        .Where(e => e.Number != 3930)
                        .Select(e => $"[{e.Number}] {e.Message}")
                        .ToList();

                    if (realErrors.Any())
                    {
                        details = string.Join(" | ", realErrors);
                    }
                    else
                    {
                        details = $"{ex.Message} | Full: {sqlEx.ToString()}";
                    }
                }
                return Ok(new ModelResponse { IsSuccess = false, Message = details, StatusCode = 500 });
            }
            //catch (Exception ex)
            //{
            //    return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            //}
        }







        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 100, [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var (totalCount, list) = await _vendorRepository.GetVendorListAsync(pageIndex, pageSize, companyId, searchTerm);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor Rate Card list retrieved successfully.";
                modelResponse.Data = new { totalCount, list };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }



        private static List<VendorRateCardModel> MapToVendorRateCardModels(List<Dictionary<string, string>> data)
        {
            var list = new List<VendorRateCardModel>();
            foreach (var row in data)
            {
                var model = new VendorRateCardModel();
                string? rawNormalRate = null;
                string? rawPickupRate = null;
                string? rawMfnRate = null;
                string? rawVanRate = null;
                string? rawU2sRate = null;
                string? rawShopsyRate = null;
                string? rawPrexoRate = null;
                string? rawGroceryRate = null;
                string? rawRtoRate = null;
                string? rawDtoRate = null;
                string? rawFmRate = null;
                string? rawIncentiveRate = null;

                foreach (var kvp in row)
                {
                    if (string.IsNullOrWhiteSpace(kvp.Key)) continue;
                    var keyNorm = kvp.Key.Replace(" ", "").Replace("_", "").ToLowerInvariant();
                    var val = kvp.Value?.Trim();

                    switch (keyNorm)
                    {
                        case "vendorcode":
                        case "code":
                            model.Vendor_Code = val;
                            break;
                        case "vendorname":
                        case "name":
                            model.Vendor_Name = val;
                            break;
                        case "clientname":
                        case "client":
                        case "costcentre":
                            model.Client_Name = val;
                            break;
                        case "location":
                        case "locationid":
                            model.LocationID = val;
                            break;
                        case "vendorhfrid":
                        case "hfrid":
                        case "fhrid":
                            model.FHRID = val;
                            model.Vendor_HFRID = val;
                            break;
                        case "vendorratetype":
                        case "ratetype":
                            model.Vendor_RateType = val;
                            break;
                        case "vendortype":
                        case "type":
                            model.Vendor_Type = val;
                            break;
                        case "model":
                        case "modelname":
                            var cleanMod = val;
                            if (!string.IsNullOrEmpty(cleanMod) && cleanMod.Contains(":"))
                            {
                                cleanMod = cleanMod.Split(':')[0].Trim();
                            }
                            model.Model = cleanMod;
                            break;
                        case "vendorcategoryid":
                        case "categoryid":
                        case "category":
                            model.Vendor_CategoryID = val;
                            break;
                        case "vehicletype":
                        case "largevehicletypename":
                            model.Large_VehicleTypeName = val;
                            break;
                        case "normalrate":
                            rawNormalRate = val;
                            break;
                        case "normalratetype":
                            model.Normal_RateType = FormatRateType(val);
                            break;
                        case "normalslabexpr":
                            model.Normal_SlabExpr = val;
                            break;
                        case "vendorrate":
                        case "rate":
                            rawNormalRate = val;
                            break;
                        case "vendorratededuction":
                        case "ratededuction":
                        case "deduction":
                            if (decimal.TryParse(val, out var rdVal)) model.Vendor_RateDeduction = rdVal;
                            break;
                        case "vendordeliveryrate":
                        case "deliveryrate":
                            if (decimal.TryParse(val, out var drVal)) model.Vendor_DeliveryRate = drVal;
                            break;
                        case "vendorpickuprate":
                        case "pickuprate":
                            rawPickupRate = val;
                            break;
                        case "pickupratetype":
                            model.Pickup_RateType = FormatRateType(val);
                            break;
                        case "pickupslabexpr":
                            model.Pickup_SlabExpr = val;
                            break;
                        case "vendortds":
                        case "vendortdspercentage":
                        case "tds":
                        case "tdspercentage":
                            if (decimal.TryParse(val, out var tdsVal)) model.Vendor_TDS = tdsVal;
                            break;
                        case "vendormfnrate":
                        case "mfnrate":
                        case "mfn":
                            rawMfnRate = val;
                            break;
                        case "mfnratetype":
                            model.MFN_RateType = FormatRateType(val);
                            break;
                        case "mfnslabexpr":
                            model.MFN_SlabExpr = val;
                            break;
                        case "vanrate":
                            rawVanRate = val;
                            break;
                        case "vanratetype":
                            model.Van_RateType = FormatRateType(val);
                            break;
                        case "vanslabexpr":
                            model.Van_SlabExpr = val;
                            break;
                        case "u2srate":
                            rawU2sRate = val;
                            break;
                        case "u2sratetype":
                            model.U2S_RateType = FormatRateType(val);
                            break;
                        case "u2sslabexpr":
                            model.U2S_SlabExpr = val;
                            break;
                        case "shopsydeductionrate":
                        case "shopsyrate":
                            rawShopsyRate = val;
                            break;

                        case "shopsyratetype":
                            model.Shopsy_RateType = FormatRateType(val);
                            break;
                        case "shopsydeductionratetype":
                            model.Shopsy_RateType = FormatRateType(val);
                            break; // given by raj


                        case "shopsyslabexpr":
                            model.Shopsy_SlabExpr = val;
                            break;
                        case "prexorate":
                            rawPrexoRate = val;
                            break;
                        case "prexoratetype":
                            model.Prexo_RateType = FormatRateType(val);
                            break;
                        case "prexoslabexpr":
                            model.Prexo_SlabExpr = val;
                            break;
                        case "groceryrate":
                            rawGroceryRate = val;
                            break;
                        case "groceryratetype":
                            model.Grocery_RateType = FormatRateType(val);
                            break;
                        case "groceryslabexpr":
                            model.Grocery_SlabExpr = val;
                            break;

                        case "rtorate":
                            rawRtoRate = val;
                            break;
                        case "rtoratetype":
                            model.Rto_RateType = FormatRateType(val);
                            break;
                        case "rtoslabexpr":
                            model.Rto_SlabExpr = val;
                            break;

                        case "dtorate":
                            rawDtoRate = val;
                            break;
                        case "dtoratetype":
                            model.Dto_RateType = FormatRateType(val);
                            break;
                        case "dtoslabexpr":
                            model.Dto_SlabExpr = val;
                            break;

                        case "fmrate":
                            rawFmRate = val;
                            break;
                        case "fmratetype":
                            model.Fm_RateType = FormatRateType(val);
                            break;
                        case "fmslabexpr":
                            model.Fm_SlabExpr = val;
                            break;
                        case "incentiverate":
                            rawIncentiveRate = val;
                            break;
                        case "incentiveratetype":
                            model.Incentive_RateType = FormatRateType(val);
                            break;
                        case "incentiveslabexpr":
                            model.Incentive_SlabExpr = val;
                            break;
                        case "amazonedspvehicletypeid":
                            if (int.TryParse(val, out var aId)) model.AmazonEdsp_VehicleTypeID = aId;
                            break;
                        case "amazonedspvehicletypename":
                        case "amazonedspvehicletype":
                            model.AmazonEdsp_VehicleTypeName = val;
                            break;
                        case "effectivefrom":
                        case "startdate":
                            model.EffectiveFrom = FormatEffectiveDate(val);
                            break;
                    }
                }

                // Process Normal Rate / Slab
                var normalType = model.Normal_RateType ?? "Fixed";
                if (normalType.Equals("Slab", StringComparison.OrdinalIgnoreCase) || normalType.Equals("Packet Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Normal_SlabExpr)) model.Normal_SlabExpr = rawNormalRate;
                    model.Normal_Rate = null;
                }
                else
                {
                    model.Normal_SlabExpr = null;
                    if (decimal.TryParse(rawNormalRate, out var nVal)) model.Normal_Rate = nVal;
                }
                if (model.Normal_Rate.HasValue) model.Vendor_Rate = model.Normal_Rate.Value;

                // Process Pickup Rate / Slab
                var pickupType = model.Pickup_RateType ?? "Fixed";
                if (pickupType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Pickup_SlabExpr)) model.Pickup_SlabExpr = rawPickupRate;
                    model.Pickup_Rate = null;
                }
                else
                {
                    model.Pickup_SlabExpr = null;
                    if (decimal.TryParse(rawPickupRate, out var pVal)) model.Pickup_Rate = pVal;
                }
                if (model.Pickup_Rate.HasValue) model.Vendor_PickupRate = model.Pickup_Rate.Value;

                // Process MFN Rate / Slab
                var mfnType = model.MFN_RateType ?? "Fixed";
                if (mfnType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.MFN_SlabExpr)) model.MFN_SlabExpr = rawMfnRate;
                    model.MFN_Rate = null;
                }
                else
                {
                    model.MFN_SlabExpr = null;
                    if (decimal.TryParse(rawMfnRate, out var mVal)) model.MFN_Rate = mVal;
                }
                if (model.MFN_Rate.HasValue) model.Vendor_MFNRate = model.MFN_Rate.Value;

                // Process Van Rate / Slab
                var vanType = model.Van_RateType ?? "Fixed";
                if (vanType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Van_SlabExpr)) model.Van_SlabExpr = rawVanRate;
                    model.Van_Rate = null;
                }
                else
                {
                    model.Van_SlabExpr = null;
                    if (decimal.TryParse(rawVanRate, out var vVal)) model.Van_Rate = vVal;
                }

                // Process Incentive Rate / Slab
                var incentiveType = model.Incentive_RateType ?? "Fixed";
                if (incentiveType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Incentive_SlabExpr)) model.Incentive_SlabExpr = rawIncentiveRate;
                    model.Incentive_Rate = null;
                }
                else
                {
                    model.Incentive_SlabExpr = null;
                    if (decimal.TryParse(rawIncentiveRate, out var iVal)) model.Incentive_Rate = iVal;
                }

                // Process U2S Rate / Slab
                var u2sType = model.U2S_RateType ?? "Fixed";
                if (u2sType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.U2S_SlabExpr)) model.U2S_SlabExpr = rawU2sRate;
                    model.U2S_Rate = null;
                }
                else
                {
                    model.U2S_SlabExpr = null;
                    if (decimal.TryParse(rawU2sRate, out var uVal)) model.U2S_Rate = uVal;
                }

                // Process Shopsy Rate / Slab
                var shopsyType = model.Shopsy_RateType ?? "Fixed";
                if (shopsyType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Shopsy_SlabExpr)) model.Shopsy_SlabExpr = rawShopsyRate;
                    model.Shopsy_Deduction_Rate = null;
                }
                else
                {
                    model.Shopsy_SlabExpr = null;
                    if (decimal.TryParse(rawShopsyRate, out var sVal)) model.Shopsy_Deduction_Rate = sVal;
                }

                // Process Prexo Rate / Slab
                var prexoType = model.Prexo_RateType ?? "Fixed";
                if (prexoType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Prexo_SlabExpr)) model.Prexo_SlabExpr = rawPrexoRate;
                    model.Prexo_Rate = null;
                }
                else
                {
                    model.Prexo_SlabExpr = null;
                    if (decimal.TryParse(rawPrexoRate, out var prVal)) model.Prexo_Rate = prVal;
                }

                // Process Grocery Rate / Slab
                var groceryType = model.Grocery_RateType ?? "Fixed";
                if (groceryType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Grocery_SlabExpr)) model.Grocery_SlabExpr = rawGroceryRate;
                    model.Grocery_Rate = null;
                }
                else
                {
                    model.Grocery_SlabExpr = null;
                    if (decimal.TryParse(rawGroceryRate, out var gVal)) model.Grocery_Rate = gVal;
                }

                // Process RTO Rate / Slab
                var rtoType = model.Rto_RateType ?? "Fixed";
                if (rtoType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Rto_SlabExpr)) model.Rto_SlabExpr = rawRtoRate;
                    model.Rto_Rate = null;
                }
                else
                {
                    model.Rto_SlabExpr = null;
                    if (decimal.TryParse(rawRtoRate, out var rtoVal)) model.Rto_Rate = rtoVal;
                }

                // Process DTO Rate / Slab
                var dtoType = model.Dto_RateType ?? "Fixed";
                if (dtoType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Dto_SlabExpr)) model.Dto_SlabExpr = rawDtoRate;
                    model.Dto_Rate = null;
                }
                else
                {
                    model.Dto_SlabExpr = null;
                    if (decimal.TryParse(rawDtoRate, out var dtoVal)) model.Dto_Rate = dtoVal;
                }

                // Process FM Rate / Slab
                var fmType = model.Fm_RateType ?? "Fixed";
                if (fmType.Equals("Slab", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(model.Fm_SlabExpr)) model.Fm_SlabExpr = rawFmRate;
                    model.Fm_Rate = null;
                }
                else
                {
                    model.Fm_SlabExpr = null;
                    if (decimal.TryParse(rawFmRate, out var fmVal)) model.Fm_Rate = fmVal;
                }

                list.Add(model);
            }
            return list;
        }

        [HttpPost("InsertVendor")]
        [Authorize]
        public async Task<IActionResult> InsertVendor([FromBody] VendorModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var locationId = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";


                var response = await _vendorRepository.InsertVendorAsync(model, userId, companyId, locationId);
                if (response.IsSuccessfully && !string.IsNullOrEmpty(response.pk_recId))
                {
                    await GenerateAndSaveVerificationLinkAsync(response.pk_recId);
                }

                modelResponse.IsSuccess = response.IsSuccessfully;
                modelResponse.Message = response.IsMessage;
                modelResponse.Data = response.pk_recId;
                modelResponse.StatusCode = response.IsSuccessfully ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        [HttpPost("UpdateVendor")]
        [Authorize]

        public async Task<IActionResult> UpdateVendor([FromBody] VendorModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var response = await _vendorRepository.UpdateVendorAsync(model, userId, companyId);
                if (response.IsSuccessfully && !string.IsNullOrEmpty(model.pk_recId))
                {
                    await GenerateAndSaveVerificationLinkAsync(model.pk_recId);
                }
                modelResponse.IsSuccess = response.IsSuccessfully;
                modelResponse.Message = response.IsMessage;
                modelResponse.Data = response.pk_recId;
                modelResponse.StatusCode = response.IsSuccessfully ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetVendorFHRIDMappingStats")]
        [Authorize]
        public async Task<IActionResult> GetVendorFHRIDMappingStats()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var stats = await _vendorRepository.GetVendorFHRIDMappingStatsAsync(companyId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor FHRID mapping stats fetched successfully.";
                modelResponse.Data = stats;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetVendorMappedUnmappedList")]
        [Authorize]
        public async Task<IActionResult> GetVendorMappedUnmappedList([FromQuery] bool isMapped)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await _vendorRepository.GetVendorMappedUnmappedListAsync(companyId, isMapped);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor list fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        [HttpDelete("DeleteVendor/{pk_recId}")]
        [Authorize]
        public async Task<IActionResult> DeleteVendor(string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var response = await _vendorRepository.DeleteVendorAsync(pk_recId);
                modelResponse.IsSuccess = response.IsSuccessfully;
                modelResponse.Message = response.IsMessage;
                modelResponse.StatusCode = response.IsSuccessfully ? 200 : 400;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetVendorById/{pk_recId}")]
        [Authorize]
        public async Task<IActionResult> GetVendorById(string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var vendor = await _vendorRepository.GetVendorByIdAsync(pk_recId);
                if (vendor != null)
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Vendor fetched successfully.";
                    modelResponse.Data = vendor;
                    modelResponse.StatusCode = 200;
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Vendor not found.";
                    modelResponse.StatusCode = 404;
                }
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetAllVendors")]
        [Authorize]
        public async Task<IActionResult> GetAllVendors([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "", [FromQuery] string locationId = "", [FromQuery] string agentCode = "", [FromQuery] string status = "", [FromQuery] string fhridMappingStatus = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var (totalCount, counts, vendors) = await _vendorRepository.GetAllVendorsAsync(pageIndex, pageSize, companyId, searchTerm, locationId, agentCode, status, fhridMappingStatus, userId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendors fetched successfully.";
                modelResponse.Data = new
                {
                    TotalCount = totalCount,
                    Counts = counts,
                    Vendors = vendors
                };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("UploadVendorExcel")]
        [Authorize]
        public async Task<IActionResult> UploadVendorExcel([FromQuery] string? companyId, [FromForm] UploadVendorExcelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var file = request.file;
                var fk_companyId = request.fk_companyId;
                var fk_insUserID = request.fk_insUserID;
                var userId = request.userId;

                if (file == null || file.Length == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Please select a valid Excel file.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Only Excel files (.xlsx, .xls) are allowed.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var uploadResults = await _vendorRepository.UploadVendorExcelAsync(file, companyId, userId);
                int successCount = uploadResults?.Count(r => r.IsSuccess || r.Status == "Uploaded" || r.Status == "Success" || r.Status == "Inserted" || r.Status == "Updated") ?? 0;

                modelResponse.IsSuccess = true;
                modelResponse.Message = successCount > 0
                    ? $"{successCount} vendor(s) processed successfully."
                    : "No valid vendors found to upload. Please correct invalid fields.";
                modelResponse.Data = uploadResults;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetVendorAuditLogs/{pk_recId}")]
        public async Task<IActionResult> GetVendorAuditLogs(string pk_recId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var logs = await _vendorRepository.GetVendorAuditLogsAsync(pk_recId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Audit logs fetched successfully.";
                modelResponse.Data = logs;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        [HttpGet("GetHIDashboardSummary")]
        [Authorize]
        public async Task<IActionResult> GetHIDashboardSummary()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";   // <-- apne project ke hisaab se

                var data = await _vendorRepository.GetHIDashboardSummaryAsync(companyId, userId);

                // Repository ne SP ka error (jaise "Access denied") isSuccess=false me bheja ho to wahi return karo
                var dict = data as IDictionary<string, object>;
                if (dict != null && dict.ContainsKey("isSuccess") && dict["isSuccess"] is bool ok && !ok)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = dict["message"]?.ToString() ?? "Failed to load HI dashboard.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "HI dashboard summary fetched successfully.";
                modelResponse.Data = data;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }



        [HttpGet("GetVendorDashboardSummary")]
        [Authorize]
        public async Task<IActionResult> GetVendorDashboardSummary([FromQuery] string monthId = "", [FromQuery] string yearId = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var summary = await _vendorRepository.GetVendorDashboardSummaryAsync(companyId, monthId, yearId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor dashboard summary fetched successfully.";
                modelResponse.Data = summary;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        [HttpGet("GetVendorMasterUploadDocumentList")]
        [Authorize]
        public async Task<IActionResult> GetVendorMasterUploadDocumentList([FromQuery] string searchTerm = "", [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await _vendorRepository.GetVendorExcelUploadListAsync(companyId, searchTerm, pageIndex, pageSize);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Uploaded excel documents list fetched successfully.";
                modelResponse.Data = new { totalCount, list };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("DownloadVendorMasterDocument/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadVendorMasterDocument(long id)
        {
            try
            {
                var doc = await _vendorRepository.GetVendorExcelUploadByIdAsync(id);
                if (doc == null || string.IsNullOrEmpty(doc.savedFilePath))
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File metadata not found." });
                }

                string fileName = Path.GetFileName(doc.savedFilePath);
                string configuredFolder = _configuration["AppSettings:VendorMasterUploads"] ?? Path.Combine(Directory.GetCurrentDirectory(), "VendorMasterUploads");
                string fullPath = Path.Combine(configuredFolder, fileName);

                // 1. Check configured folder path
                if (!System.IO.File.Exists(fullPath) && Directory.Exists(configuredFolder))
                {
                    string nameNoExt = Path.GetFileNameWithoutExtension(fileName);
                    int lastUnder = nameNoExt.LastIndexOf('_');
                    string prefix = lastUnder > 0 ? nameNoExt.Substring(0, lastUnder) : nameNoExt;

                    var matching = Directory.GetFiles(configuredFolder, $"{prefix}*")
                        .OrderByDescending(f => System.IO.File.GetLastWriteTime(f))
                        .FirstOrDefault();
                    if (!string.IsNullOrEmpty(matching) && System.IO.File.Exists(matching))
                    {
                        fullPath = matching;
                    }
                }

                // 2. Check if savedFilePath itself was an absolute path that exists
                if (!System.IO.File.Exists(fullPath))
                {
                    if (System.IO.File.Exists(doc.savedFilePath))
                    {
                        fullPath = doc.savedFilePath;
                    }
                }

                // 3. Fallback for legacy files in wwwroot
                if (!System.IO.File.Exists(fullPath))
                {
                    string wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", doc.savedFilePath.TrimStart('/'));
                    if (System.IO.File.Exists(wwwrootPath))
                    {
                        fullPath = wwwrootPath;
                    }
                    else
                    {
                        return NotFound(new ModelResponse { IsSuccess = false, Message = "Physical file not found on server." });
                    }
                }

                byte[] fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
                string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                string downloadName = doc.originalFileName ?? "VendorUpload.xlsx";

                return File(fileBytes, contentType, downloadName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }


        [HttpGet("ratecard-history/{vendorId}")]
        [Authorize]
        public async Task<IActionResult> GetVendorRateCardHistory(string vendorId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var history = await _vendorRepository.GetVendorRateCardAuditHistoryAsync(vendorId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Rate card history fetched successfully.";
                modelResponse.Data = history;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetVendorRateCards/{vendorId}")]
        [Authorize]
        public async Task<IActionResult> GetVendorRateCards(string vendorId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var rateCards = await _vendorRepository.GetVendorRateCardsAsync(vendorId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor rate cards fetched successfully.";
                modelResponse.Data = rateCards;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }




        private static string? FormatEffectiveDate(string? val)
        {
            if (string.IsNullOrWhiteSpace(val)) return null;
            val = val.Trim();

            // Check if it's an OLE Automation date (numeric Excel serial)
            if (double.TryParse(val, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double oaDate) && oaDate > 30000 && oaDate < 80000)
            {
                try
                {
                    return DateTime.FromOADate(oaDate).ToString("yyyy-MM-dd");
                }
                catch { }
            }

            string[] formats = {
        "dd/MM/yyyy", "d/M/yyyy", "dd-MM-yyyy", "d-M-yyyy", "dd.MM.yyyy", "d.M.yyyy",
        "dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy hh:mm:ss tt", "dd/MM/yyyy H:mm:ss",
        "dd-MM-yyyy HH:mm:ss", "dd-MM-yyyy hh:mm:ss tt",
        "yyyy-MM-dd", "yyyy/MM/dd", "yyyy-MM-ddTHH:mm:ss", "yyyy-MM-dd HH:mm:ss",
        "dd/MM/yy", "d/M/yy", "dd-MM-yy", "d-M-yy",
        "MM/dd/yyyy", "M/d/yyyy", "MM/dd/yyyy HH:mm:ss", "MM/dd/yyyy hh:mm:ss tt"
    };

            if (DateTime.TryParseExact(val, formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var dt) ||
                DateTime.TryParse(val, new System.Globalization.CultureInfo("en-GB"), System.Globalization.DateTimeStyles.None, out dt) ||
                DateTime.TryParse(val, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out dt) ||
                DateTime.TryParse(val, out dt))
            {
                return dt.ToString("yyyy-MM-dd");
            }
            return val;
        }


        [HttpGet("audit-log/document-names")]
        [Authorize]
        public async Task<IActionResult> GetAuditLogDocumentNames()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // 1. Get the CompanyId from the token claims
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
              
                var result = await _vendorRepository.GetAuditLogDocumentNamesAsync(companyId);
                modelResponse.IsSuccess = true;
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("audit-log/list")]
        [Authorize]
        public async Task<IActionResult> GetAuditLogs([FromBody] AuditLogFilterRequest filter)
        {
            // 1. Get the CompanyId from the token claims
            var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await _vendorRepository.GetAuditLogsAsync(filter, companyId);
                modelResponse.IsSuccess = true;
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        private static string FormatRateType(string? val)
        {
            if (string.IsNullOrWhiteSpace(val)) return "Fixed";
            var trimmed = val.Trim();
            if (trimmed.Equals("slab", StringComparison.OrdinalIgnoreCase)) return "Slab";
            if (trimmed.Equals("fixed", StringComparison.OrdinalIgnoreCase)) return "Fixed";
            if (trimmed.Equals("percentage", StringComparison.OrdinalIgnoreCase)) return "Percentage";
            return trimmed;
        }


        [HttpGet("GetLinkedFHRIDs")]
        [Authorize]
        public async Task<IActionResult> GetLinkedFHRIDs([FromQuery] string clientId, [FromQuery] string modelId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await _vendorRepository.GetFHRIDsAsync(clientId, modelId, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "FHR IDs fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("fhrid-history/{pk_recId}")]
        public async Task<IActionResult> GetVendorFHRIDHistory(string pk_recId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrEmpty(pk_recId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Vendor ID is required.";
                    return Ok(modelResponse);
                }

                var (totalCount, list) = await _vendorRepository.GetVendorFHRIDHistoryAsync(pk_recId, pageIndex, pageSize);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "FHRID History fetched successfully.";
                modelResponse.Data = new { totalCount, list };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }


        [HttpPost("TransactionExcelUpload")]
        [Authorize]
        public async Task<IActionResult> UploadTransaction(IFormFile file, [FromForm] string? clientId, [FromForm] string? modelId, [FromForm] string? clientName, [FromForm] string? modelName, [FromForm] DateTime fromDate, [FromForm] DateTime toDate)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var uploadsFolder = _configuration["AppSettings:VendorTransactions"];
                if (string.IsNullOrEmpty(uploadsFolder)) uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "VendorTransactions");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
                var savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyyyy_HHmmss}{ext}";
                var physicalPath = Path.Combine(uploadsFolder, savedFileName);

                using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var inputMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                var outputRenameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                int cId = 0, mId = 0;
                int.TryParse(clientId, out cId);
                int.TryParse(modelId, out mId);

                try
                {
                    var configData = await _vendorRepository.GetVendorTemplateConfigAsync(cId, mId);
                    foreach (var row in configData)
                    {
                        var dict = (IDictionary<string, object>)row;
                        var stdCol = dict.ContainsKey("StandardDbColumn") ? Convert.ToString(dict["StandardDbColumn"]) ?? "" : "";
                        var excelHeader = dict.ContainsKey("ExcelHeaderName") ? Convert.ToString(dict["ExcelHeaderName"]) ?? "" : "";
                        inputMap[excelHeader.Replace(" ", "").ToLower()] = stdCol;
                        outputRenameMap[stdCol] = excelHeader;
                    }
                }
                catch { }

                string finalClientName = clientName ?? "";
                string finalModelName = modelName ?? "";
                try
                {
                    if (string.IsNullOrWhiteSpace(finalClientName) && cId > 0)
                        finalClientName = await _vendorRepository.GetClientNameAsync(cId);
                    if (string.IsNullOrWhiteSpace(finalModelName) && mId > 0)
                        finalModelName = await _vendorRepository.GetModelNameAsync(mId);
                }
                catch { }

                string normClient = (finalClientName ?? "").ToLowerInvariant().Trim();
                string normModel = (finalModelName ?? "").ToLowerInvariant().Trim();

                bool isFlipkart = normClient.Contains("flipkart");
                bool isAmazon = normClient.Contains("amazon") || cId == 316;
                bool isAirtel = normClient.Contains("airtel");
                bool isEbees = normClient.Contains("ebees") || normClient.Contains("xbees") || mId == 7;
                bool isBlueDart = normClient.Contains("bluedart");
                bool isShiprocket = normClient.Contains("shiprocket");
                bool isMeesho = normClient.Contains("meesho");
                bool isHealthkart = normClient.Contains("healthkart");

                bool isFlipkartOdhMdh = (isFlipkart && (mId == 1 || normModel.Contains("odh-mdh") || normModel.Contains("odh"))) || (!isAmazon && !isAirtel && !isEbees && mId == 1);
                bool isFlipkartXrm = isFlipkart && (mId == 2 || normModel.Contains("xrm"));
                bool isFlipkartLarge = isFlipkart && (mId == 3 || normModel.Contains("large"));
                bool isFlipkartFm = isFlipkart && (mId == 8 || normModel.Contains("fm") || normModel.Contains("variable"));

                bool isAmazonDsp = (isAmazon && (mId == 4 || (normModel.Contains("dsp") && !normModel.Contains("edsp")))) || (mId == 4 && !isFlipkart && !isAirtel);
                bool isAmazonEdsp = (isAmazon && (mId == 5 || normModel.Contains("edsp"))) || (mId == 5 && !isFlipkart && !isAirtel);

                bool isAirtelFse = isAirtel && (mId == 6 || normModel.Contains("fse"));
                bool isEbeesVar = isEbees || mId == 7 || normModel.Contains("variable(e)");
                bool isBlueDartVar = isBlueDart || mId == 10 || normModel.Contains("variable(b)");
                bool isShiprocketVar = isShiprocket || mId == 9 || normModel.Contains("variable(s)");
                bool isMeeshoVar = isMeesho || mId == 11 || normModel.Contains("variable(m)");
                bool isHealthkartVar = isHealthkart || mId == 12 || normModel.Contains("variable(h)");

                string GetDynamicVal(System.Collections.Generic.Dictionary<string, string> row, string stdColName, string fallbackKey)
                {
                    // 1. Try to find dynamic header in file based on DB config mapping
                    var matchingDynamicKey = inputMap.FirstOrDefault(x => x.Value.Equals(stdColName, StringComparison.OrdinalIgnoreCase)).Key;
                    if (!string.IsNullOrEmpty(matchingDynamicKey))
                    {
                        var val = row.Keys.FirstOrDefault(k => k.Replace(" ", "").ToLower() == matchingDynamicKey);
                        if (val != null && !string.IsNullOrWhiteSpace(row[val])) return row[val];
                    }

                    // 2. Try the fallback standard key directly
                    var valFallback = row.Keys.FirstOrDefault(k => k.Replace(" ", "").ToLower() == fallbackKey.ToLower());
                    if (valFallback != null && !string.IsNullOrWhiteSpace(row[valFallback])) return row[valFallback];

                    // 3. Just in case they uploaded with exact DB column name
                    var valExact = row.Keys.FirstOrDefault(k => k.Replace(" ", "").ToLower() == stdColName.ToLower());
                    if (valExact != null && !string.IsNullOrWhiteSpace(row[valExact])) return row[valExact];

                    return "0";
                }

                string GetCoreVal(System.Collections.Generic.Dictionary<string, string> row, string coreKey)
                {
                    var val = row.Keys.FirstOrDefault(k => k.Replace(" ", "").ToLower() == coreKey.ToLower());
                    if (val != null && !string.IsNullOrWhiteSpace(row[val])) return row[val];
                    return "";
                }

                System.Xml.Linq.XElement xmlUploads = new System.Xml.Linq.XElement("Uploads");
                foreach (var row in data)
                {
                    var xRow = new System.Xml.Linq.XElement("Row",
                        new System.Xml.Linq.XAttribute("VendorCode", GetCoreVal(row, "code")),
                        new System.Xml.Linq.XAttribute("VendorName", GetCoreVal(row, "name")),
                        new System.Xml.Linq.XAttribute("LocationName", GetCoreVal(row, "location")),
                        new System.Xml.Linq.XAttribute("AreaManager", GetCoreVal(row, "areamanager")),
                        new System.Xml.Linq.XAttribute("HubCode", GetCoreVal(row, "hubcode")),
                        new System.Xml.Linq.XAttribute("Assigned_Volume", GetDynamicVal(row, "Assigned_Volume", "sumoftotalofd")),
                        new System.Xml.Linq.XAttribute("Delivered_Volume", GetDynamicVal(row, "Delivered_Volume", "sumoftotaldelivered")),
                        new System.Xml.Linq.XAttribute("Ded_Shipment", GetDynamicVal(row, "Ded_Shipment", "shipmentdeduction")),
                        new System.Xml.Linq.XAttribute("Ded_COD", GetDynamicVal(row, "Ded_COD", "coddeduction")),
                        new System.Xml.Linq.XAttribute("Ded_Other", GetDynamicVal(row, "Ded_Other", "otherdeduction")),
                        new System.Xml.Linq.XAttribute("Ded_Arrear", GetDynamicVal(row, "Ded_Arrear", "arrearamt")),
                        new System.Xml.Linq.XAttribute("Ded_Insurance", GetDynamicVal(row, "Ded_Insurance", "insurance")),
                        new System.Xml.Linq.XAttribute("Ded_SD", GetDynamicVal(row, "Ded_SD", "sd")),
                        new System.Xml.Linq.XAttribute("Ded_Welfare", GetDynamicVal(row, "Ded_Welfare", "welfare")),
                        new System.Xml.Linq.XAttribute("Ded_Hold", GetDynamicVal(row, "Ded_Hold", "hold")),
                        new System.Xml.Linq.XAttribute("Ded_KarmaLife", GetDynamicVal(row, "Ded_KarmaLife", "karmalife")),
                        new System.Xml.Linq.XAttribute("Vehicle_Type", GetDynamicVal(row, "Vehicle_Type", "type") == "0" ? "" : GetDynamicVal(row, "Vehicle_Type", "type")),
                        new System.Xml.Linq.XAttribute("Working_Days", GetDynamicVal(row, "Working_Days", "workingdays")),
                        new System.Xml.Linq.XAttribute("Pickup_Assigned", GetDynamicVal(row, "Pickup_Assigned", "pickupassign")),
                        new System.Xml.Linq.XAttribute("Pickup_Done", GetDynamicVal(row, "Pickup_Done", "pickupdone")),
                        new System.Xml.Linq.XAttribute("RTO_Assigned", GetDynamicVal(row, "RTO_Assigned", "rtoassign")),
                        new System.Xml.Linq.XAttribute("RTO_Done", GetDynamicVal(row, "RTO_Done", "rtodone")),
                        new System.Xml.Linq.XAttribute("DTO_Assigned", GetDynamicVal(row, "DTO_Assigned", "dtoassign")),
                        new System.Xml.Linq.XAttribute("DTO_Done", GetDynamicVal(row, "DTO_Done", "dtodone")),
                        new System.Xml.Linq.XAttribute("FM_Assigned", GetDynamicVal(row, "FM_Assigned", "fmassign")),
                        new System.Xml.Linq.XAttribute("FM_Done", GetDynamicVal(row, "FM_Done", "fmdone")),
                        new System.Xml.Linq.XAttribute("Assigned_RVP", GetDynamicVal(row, "Assigned_RVP", "assignedrvp")),
                        new System.Xml.Linq.XAttribute("Delivered_RVP", GetDynamicVal(row, "Delivered_RVP", "deliveredrvp")),
                        new System.Xml.Linq.XAttribute("SR_LM_Return", GetDynamicVal(row, "SR_LM_Return", "srlmreturn")),
                        new System.Xml.Linq.XAttribute("SR_FM_Return", GetDynamicVal(row, "SR_FM_Return", "srfmreturn")),
                        new System.Xml.Linq.XAttribute("Assign_RVP_Normal", GetDynamicVal(row, "Assign_RVP_Normal", "assignrvpnormal")),
                        new System.Xml.Linq.XAttribute("Total_Delivered_RVP_Shopsy", GetDynamicVal(row, "Total_Delivered_RVP_Shopsy", "totaldeliveredrvpshopsy")),
                        new System.Xml.Linq.XAttribute("U2S", GetDynamicVal(row, "U2S", "u2s")),
                        new System.Xml.Linq.XAttribute("Shopsy", GetDynamicVal(row, "Shopsy", "shopsy")),
                        new System.Xml.Linq.XAttribute("Prexo", GetDynamicVal(row, "Prexo", "prexo")),
                        new System.Xml.Linq.XAttribute("Grocery_Assigned", GetDynamicVal(row, "Grocery_Assigned", "groceryassigned")),
                        new System.Xml.Linq.XAttribute("Grocery_Delivered", GetDynamicVal(row, "Grocery_Delivered", "grocerydelivered")),
                        new System.Xml.Linq.XAttribute("Route", GetCoreVal(row, "route")),
                        new System.Xml.Linq.XAttribute("MFN_Assigned", GetDynamicVal(row, "MFN_Assigned", "mfnassign")),
                        new System.Xml.Linq.XAttribute("MFN_Done", GetDynamicVal(row, "MFN_Done", "mfndone")),
                        new System.Xml.Linq.XAttribute("PresentDays", GetDynamicVal(row, "PresentDays", "presentdays")),
                        new System.Xml.Linq.XAttribute("Special_Charge", GetDynamicVal(row, "Special_Charge", "sc")),
                        new System.Xml.Linq.XAttribute("Ded_Rent", GetDynamicVal(row, "Ded_Rent", "rentdeduction")),
                        new System.Xml.Linq.XAttribute("Ded_Advance", GetDynamicVal(row, "Ded_Advance", "advancededuction")),
                        new System.Xml.Linq.XAttribute("Ded_TNT", GetDynamicVal(row, "Ded_TNT", "tntdeduction")),
                        new System.Xml.Linq.XAttribute("IncentivePackets", GetDynamicVal(row, "Incentive Packets", "incentivepackets"))
                      );
                    xmlUploads.Add(xRow);
                }
                string xmlString = xmlUploads.ToString();
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var processedData = await _vendorRepository.UploadTransactionsAsync(clientId, modelId, fromDate, toDate, xmlString, savedFileName, userId, companyId);

                // --- 1. RENAME JSON KEYS FOR UI ---
                var renamedList = new List<Dictionary<string, object>>();
                if (processedData != null)
                {
                    foreach (var rawRow in processedData)
                    {
                        var rawDict = (IDictionary<string, object>)rawRow;
                        var renamedRow = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                        foreach (var kvp in rawDict)
                        {
                            var internalExclude = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                                "TotalRows", "TotalRecords", "TransactionID", "UploadBatchID", "fk_cost_centre_id", "fk_model_id", "fk_rec_id",
                                "ClientID", "ModelID", "LocationID", "CreatedBy", "CreatedDate", "IsProcessed", "fk_File_Id", "FHRID",
                                "FromDate", "ToDate", "CycleName", "BudgetaryCode", "StateName", "Payment_Status", "Payment Status",
                                "HR_Remark", "HR Remark", "Central_Remark", "Central Remark", "TransactionRange", "UploadedByName"
                            };
                            if (internalExclude.Contains(kvp.Key)) continue;

                            bool isPickupEnabled = outputRenameMap.ContainsKey("Pickup_Assigned") || outputRenameMap.ContainsKey("pickup_assigned") || outputRenameMap.Values.Contains("Pickup Assign");
                            var ebeesCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate", "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable" };
                            if (ebeesCols.Contains(kvp.Key) && !isPickupEnabled) continue;
                            var dedCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Ded_Shipment", "Ded_COD", "Ded_Other", "Ded_Arrear", "Ded_Insurance", "Ded_SD", "Ded_Welfare", "Ded_Hold", "Ded_KarmaLife" };
                            if (dedCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;
                            if (isFlipkartLarge && kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) continue;
                            var fmCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP", "Vehicle_Type", "Working_Days" };
                            if (fmCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;

                            string displayKey = kvp.Key;

                            if (outputRenameMap.ContainsKey(kvp.Key))
                            {
                                displayKey = outputRenameMap[kvp.Key];
                            }
                            else if (kvp.Key.Equals("VendorCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Code";
                            else if (kvp.Key.Equals("VendorName", StringComparison.OrdinalIgnoreCase)) displayKey = "Name";
                            else if (kvp.Key.Equals("LocationName", StringComparison.OrdinalIgnoreCase)) displayKey = "Location";
                            else if (kvp.Key.Equals("FHRID", StringComparison.OrdinalIgnoreCase)) displayKey = "FHRID";
                            else if (kvp.Key.Equals("HubCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Hub code";
                            else if (kvp.Key.Equals("Working_Days", StringComparison.OrdinalIgnoreCase)) displayKey = "No. of Days";
                            else if (kvp.Key.Equals("Processing_Status", StringComparison.OrdinalIgnoreCase)) displayKey = "Processing Status";
                            else if (kvp.Key.Equals("System_Remarks", StringComparison.OrdinalIgnoreCase)) displayKey = "System Remarks";
                            else if (kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total OFD";
                            else if (kvp.Key.Equals("Delivered_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total Delivered";
                            else if (kvp.Key.Equals("Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Conversion %";
                            else if (kvp.Key.Equals("Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Applied BaseRate";
                            else if (kvp.Key.Equals("Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Rate Type";
                            else if (kvp.Key.Equals("Base_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Base payable";
                            else if (kvp.Key.Equals("GST_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Percentage";
                            else if (kvp.Key.Equals("GST_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Amount";
                            else if (kvp.Key.Equals("Total_Payable_After_GST", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Payable After GST";
                            else if (kvp.Key.Equals("TDS_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Percentage";
                            else if (kvp.Key.Equals("TDS_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Amount";
                            else if (kvp.Key.Equals("Net_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Net Payable";
                            else if (kvp.Key.Equals("Vendor_BankName", StringComparison.OrdinalIgnoreCase)) displayKey = "Bank Name";
                            else if (kvp.Key.Equals("Vendor_AccountNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Account No";
                            else if (kvp.Key.Equals("Vendor_IFSCCode", StringComparison.OrdinalIgnoreCase)) displayKey = "IFSC Code";
                            else if (kvp.Key.Equals("Vendor_PanNo", StringComparison.OrdinalIgnoreCase)) displayKey = "PAN No";
                            else if (kvp.Key.Equals("Vendor_AaddharNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Aadhar No";
                            else if (kvp.Key.Equals("TransactionRange", StringComparison.OrdinalIgnoreCase)) displayKey = "Date Range";
                            else if (kvp.Key.Equals("UploadedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Uploaded By";
                            else if (kvp.Key.Equals("Ded_Shipment", StringComparison.OrdinalIgnoreCase)) displayKey = "Deduction";
                            else if (kvp.Key.Equals("Ded_COD", StringComparison.OrdinalIgnoreCase)) displayKey = "COD Deduction";
                            else if (kvp.Key.Equals("Ded_Other", StringComparison.OrdinalIgnoreCase)) displayKey = "Other Deduction";
                            else if (kvp.Key.Equals("Ded_Arrear", StringComparison.OrdinalIgnoreCase)) displayKey = "Arrear";
                            else if (kvp.Key.Equals("Ded_Insurance", StringComparison.OrdinalIgnoreCase)) displayKey = "Insurance";
                            else if (kvp.Key.Equals("Ded_SD", StringComparison.OrdinalIgnoreCase)) displayKey = "SD";
                            else if (kvp.Key.Equals("Ded_Welfare", StringComparison.OrdinalIgnoreCase)) displayKey = "Welfare Deduction";
                            else if (kvp.Key.Equals("Ded_Hold", StringComparison.OrdinalIgnoreCase)) displayKey = "Hold";
                            else if (kvp.Key.Equals("Ded_KarmaLife", StringComparison.OrdinalIgnoreCase)) displayKey = "Karma Life Deduction";
                            else if (kvp.Key.Equals("Ded_Rent", StringComparison.OrdinalIgnoreCase)) displayKey = "Rent Deduction";
                            else if (kvp.Key.Equals("Ded_Advance", StringComparison.OrdinalIgnoreCase)) displayKey = "Advance Deduction";
                            else if (kvp.Key.Equals("Ded_TNT", StringComparison.OrdinalIgnoreCase)) displayKey = "TNT Deduction";
                            else if (kvp.Key.Equals("SR_LM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR LM Return";
                            else if (kvp.Key.Equals("SR_FM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR FM Return";
                            else if (kvp.Key.Equals("Assign_RVP_Normal", StringComparison.OrdinalIgnoreCase)) displayKey = "Assign RVP+Normal";
                            else if (kvp.Key.Equals("Total_Delivered_RVP_Shopsy", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Delivered+RVP+Shopsy";
                            else if (kvp.Key.Equals("FWD_RVP_Del_Wo_SR", StringComparison.OrdinalIgnoreCase)) displayKey = "FWD+RVP Del-W/o SR";
                            else if (kvp.Key.Equals("Delivery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Payable";
                            else if (kvp.Key.Equals("U2S_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate";
                            else if (kvp.Key.Equals("U2S_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate Type";
                            else if (kvp.Key.Equals("U2S_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Applied Rate";
                            else if (kvp.Key.Equals("U2S_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Payable";
                            else if (kvp.Key.Equals("Shopsy_RateDeduction", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateDeduction";
                            else if (kvp.Key.Equals("Shopsy_RateType", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Rate Type";
                            else if (kvp.Key.Equals("Shopsy_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateApplied";
                            else if (kvp.Key.Equals("Shopsy_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Payable";
                            else if (kvp.Key.Equals("Prexo_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate";
                            else if (kvp.Key.Equals("Prexo_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate Type";
                            else if (kvp.Key.Equals("Prexo_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Applied Rate";
                            else if (kvp.Key.Equals("Prexo_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Payable";
                            else if (kvp.Key.Equals("Grocery_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Assigned";
                            else if (kvp.Key.Equals("Grocery_Delivered", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Delivered";
                            else if (kvp.Key.Equals("Grocery_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Conversion %";
                            else if (kvp.Key.Equals("Grocery_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate";
                            else if (kvp.Key.Equals("Grocery_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate Type";
                            else if (kvp.Key.Equals("Grocery_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Applied Rate";
                            else if (kvp.Key.Equals("Grocery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Payable";
                            else if (kvp.Key.Equals("Pickup_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup %";
                            else if (kvp.Key.Equals("Pickup_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate";
                            else if (kvp.Key.Equals("Pickup_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate Type";
                            else if (kvp.Key.Equals("Pickup_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Payable";
                            // *** NEW: RTO display mappings ***
                            else if (kvp.Key.Equals("RTO_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Assign";
                            else if (kvp.Key.Equals("RTO_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Done";
                            else if (kvp.Key.Equals("RTO_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO %";
                            else if (kvp.Key.Equals("RTO_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Rate";
                            else if (kvp.Key.Equals("RTO_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Rate Type";
                            else if (kvp.Key.Equals("RTO_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Payable";
                            // *** NEW: DTO display mappings ***
                            else if (kvp.Key.Equals("DTO_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Assign";
                            else if (kvp.Key.Equals("DTO_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Done";
                            else if (kvp.Key.Equals("DTO_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO %";
                            else if (kvp.Key.Equals("DTO_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Rate";
                            else if (kvp.Key.Equals("DTO_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Rate Type";
                            else if (kvp.Key.Equals("DTO_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Payable";
                            // *** NEW: FM display mappings ***
                            else if (kvp.Key.Equals("FM_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Assign";
                            else if (kvp.Key.Equals("FM_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Done";
                            else if (kvp.Key.Equals("FM_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "FM %";
                            else if (kvp.Key.Equals("FM_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Rate";
                            else if (kvp.Key.Equals("FM_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Rate Type";
                            else if (kvp.Key.Equals("FM_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Payable";
                            else if (kvp.Key.Equals("Total_Assigned_FM_RVP", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Assigne FM+RVP";
                            else if (kvp.Key.Equals("Total_Delivered_FM_RVP", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Delivered FM+RVP";
                            else if (kvp.Key.Equals("Route", StringComparison.OrdinalIgnoreCase)) displayKey = "Route";
                            else if (kvp.Key.Equals("MFN_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Assign";
                            else if (kvp.Key.Equals("MFN_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Done";
                            else if (kvp.Key.Equals("MFN_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Conversion %";
                            else if (kvp.Key.Equals("MFN_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN RateType";
                            else if (kvp.Key.Equals("MFN_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN AppliedRate";
                            else if (kvp.Key.Equals("MFN_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Payable";
                            else if (kvp.Key.Equals("Van_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Van Rate";
                            else if (kvp.Key.Equals("Van_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Van RateType";
                            else if (kvp.Key.Equals("Van_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN AppliedRate";
                            else if (kvp.Key.Equals("PresentDays", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDays";
                            else if (kvp.Key.Equals("Van_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN Payable";
                            else if (kvp.Key.Equals("PresentDaysPayableRate", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayableRate";
                            else if (kvp.Key.Equals("PresentDaysPayable", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayable";
                            else if (kvp.Key.Equals("Special_Charge", StringComparison.OrdinalIgnoreCase)) displayKey = "SC";
                            // *** NEW: Incentive mappings ***
                            else if (kvp.Key.Equals("IncentivePackets", StringComparison.OrdinalIgnoreCase)) displayKey = "IncentivePackets";
                            else if (kvp.Key.Equals("Incentive_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Rate";
                            else if (kvp.Key.Equals("Incentive_RateType", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Rate Type";
                            else if (kvp.Key.Equals("Incentive_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive_Applied_Rate";
                            else if (kvp.Key.Equals("Incentive_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive_Payable";
                            else if (kvp.Key.Equals("Gross_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Gross Payable";
                            else if (kvp.Key.Equals("Total_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "totalPayable";

                            // Hide Ebees-only columns (RTO, DTO, FM) for all non-Ebees models
                            if (!isEbeesVar)
                            {
                                var ebeesOnlyCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                                    "RTO_Assigned", "RTO_Done", "RTO_Conversion_Percentage", "RTO_Applied_Rate", "RTO_Rate_Type", "RTO_Payable",
                                    "DTO_Assigned", "DTO_Done", "DTO_Conversion_Percentage", "DTO_Applied_Rate", "DTO_Rate_Type", "DTO_Payable",
                                    "FM_Assigned", "FM_Done", "FM_Conversion_Percentage", "FM_Applied_Rate", "FM_Rate_Type", "FM_Payable"
                                };
                                if (ebeesOnlyCols.Contains(kvp.Key)) continue;
                            }

                            // HIDE irrelevant columns for ODH-MDH
                            if (isFlipkartOdhMdh)
                            {
                                var odhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                                    "Assigned_Volume", "Delivered_Volume", "Sum of Total OFD", "Sum of Total Delivered",
                                    "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP",
                                    "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate",
                                    "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable", "Ded_Insurance", "Insurance",
                                    "Vehicle_Type", "Shopsy_Rate_Type"
                                };
                                if (odhHideCols.Contains(kvp.Key) || odhHideCols.Contains(displayKey)) continue;
                            }

                            // HIDE ODH-MDH specific columns for ALL OTHER models
                            if (!isFlipkartOdhMdh)
                            {
                                var nonOdhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                                    "SR_LM_Return", "SR LM Return", "SR_FM_Return", "SR FM Return",
                                    "Assign_RVP_Normal", "Assign RVP+Normal", "Total_Delivered_RVP_Shopsy", "Total Delivered+RVP+Shopsy",
                                    "FWD_RVP_Del_Wo_SR", "FWD+RVP Del-W/o SR",
                                    "U2S", "U2S_Rate", "U2S Rate", "U2S_Rate_Type", "U2S Rate Type", "U2S_Applied_Rate", "U2S Applied Rate", "U2S_Payable", "U2S Payable",
                                    "Shopsy", "Shopsy_RateDeduction", "Shopsy RateDeduction", "Shopsy_RateType", "Shopsy_Rate_Type", "Shopsy Rate Type", "Shopsy_Applied_Rate", "Shopsy RateApplied", "Shopsy_Payable", "Shopsy Payable",
                                    "Prexo", "Prexo_Rate", "Prexo Rate", "Prexo_Rate_Type", "Prexo Rate Type", "Prexo_Applied_Rate", "Prexo Applied Rate", "Prexo_Payable", "Prexo Payable",
                                    "Grocery_Assigned", "Grocery Assigned", "Grocery_Delivered", "Grocery Delivered",
                                    "Grocery_Conversion_Percentage", "Grocery Conversion %", "Grocery_Rate", "Grocery Rate",
                                    "Grocery_Rate_Type", "Grocery Rate Type", "Grocery_Applied_Rate", "Grocery Applied Rate", "Grocery_Payable", "Grocery Payable",
                                    "Ded_Rent", "Rent Deduction", "Ded_Advance", "Advance Deduction", "Ded_TNT", "TNT Deduction"
                                };
                                if (isAmazonDsp)
                                {
                                    nonOdhHideCols.Remove("Ded_Advance");
                                    nonOdhHideCols.Remove("Advance Deduction");
                                }
                                if (nonOdhHideCols.Contains(kvp.Key) || nonOdhHideCols.Contains(displayKey)) continue;
                            }

                            // HIDE Amazon DSP / EDSP specific columns for other models (not Amazon DSP or EDSP)
                            if (!isAmazonDsp && !isAmazonEdsp)
                            {
                                var dspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                                    "Route", "MFN_Assigned", "MFN Assign", "MFN_Done", "MFN Done", "MFN  Done",
                                    "MFN_Conversion_Percentage", "MFN Conversion %",
                                    "MFN_Rate_Type", "MFN RateType", "MFN Rate Type", "MFN_Applied_Rate", "MFN AppliedRate", "MFN Applied Rate", "MFN_Payable", "MFN Payable",
                                    "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
                                    "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
                                    "Special_Charge", "SC", "Total_Payable", "totalPayable"
                                };
                                if (dspHideCols.Contains(kvp.Key) || dspHideCols.Contains(displayKey)) continue;
                            }

                            // HIDE DSP-only columns for EDSP
                            if (isAmazonEdsp)
                            {
                                var edspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                                    "Route", "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
                                    "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
                                    "Special_Charge", "SC", "Ded_Advance", "Advance Deduction",
                                    "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
                                    "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
                                    "Ded_Insurance", "Insurance", "Ded_SD", "SD",
                                    "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
                                };
                                if (edspHideCols.Contains(kvp.Key) || edspHideCols.Contains(displayKey)) continue;
                            }

                            // HIDE irrelevant columns for Amazon DSP
                            if (isAmazonDsp)
                            {
                                var dspSpecificHide = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                                    "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
                                    "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
                                    "Ded_Insurance", "Insurance", "Ded_SD", "SD",
                                    "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
                                };
                                if (dspSpecificHide.Contains(kvp.Key) || dspSpecificHide.Contains(displayKey)) continue;
                            }

                            renamedRow[displayKey] = kvp.Value;
                        }

                        var orderedRow = OrderRowByCombo(renamedRow, isFlipkartOdhMdh, isAmazonDsp, isAmazonEdsp, isFlipkartXrm, isFlipkartLarge, isFlipkartFm, isAirtelFse, isEbeesVar, isBlueDartVar, isShiprocketVar, isMeeshoVar, isHealthkartVar);
                        renamedList.Add(orderedRow);

                    }
                }

                // --- 2. ADD TAB 2 USING CLOSEDXML ---
                try
                {
                    using (var wb = new ClosedXML.Excel.XLWorkbook(physicalPath))
                    {
                        string summarySheetName = "Upload Summary";
                        var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
                        if (existingSummary != null) wb.Worksheets.Delete(existingSummary.Name);

                        var ws = wb.Worksheets.Add(summarySheetName);

                        int totalCount = renamedList.Count;
                        int successCount = renamedList.Count(r =>
                        {
                            var dict = r as IDictionary<string, object>;
                            var st = dict.ContainsKey("Processing Status") ? Convert.ToString(dict["Processing Status"]) : "";
                            return st == "Success" || st == "Processed";
                        });
                        int failedCount = totalCount - successCount;

                        // Top Summary Metrics
                        ws.Cell(1, 1).Value = "Client:";
                        ws.Cell(1, 1).Style.Font.Bold = true;
                        ws.Cell(1, 2).Value = clientName;
                        ws.Cell(1, 2).Style.Font.Bold = true;
                        ws.Cell(1, 2).Style.Font.FontColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253);

                        ws.Cell(1, 4).Value = "Model:";
                        ws.Cell(1, 4).Style.Font.Bold = true;
                        ws.Cell(1, 5).Value = modelName;
                        ws.Cell(1, 5).Style.Font.Bold = true;
                        ws.Cell(1, 5).Style.Font.FontColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253);

                        ws.Cell(2, 1).Value = "Total Records";
                        ws.Cell(2, 1).Style.Font.Bold = true;
                        ws.Cell(2, 1).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253);
                        ws.Cell(2, 1).Style.Font.FontColor = ClosedXML.Excel.XLColor.White;

                        ws.Cell(2, 2).Value = totalCount;
                        ws.Cell(2, 2).Style.Font.Bold = true;

                        ws.Cell(2, 4).Value = "Success";
                        ws.Cell(2, 4).Style.Font.Bold = true;
                        ws.Cell(2, 4).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(25, 135, 84);
                        ws.Cell(2, 4).Style.Font.FontColor = ClosedXML.Excel.XLColor.White;

                        ws.Cell(2, 5).Value = successCount;
                        ws.Cell(2, 5).Style.Font.Bold = true;

                        ws.Cell(2, 7).Value = "Failed";
                        ws.Cell(2, 7).Style.Font.Bold = true;
                        ws.Cell(2, 7).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(220, 53, 69);
                        ws.Cell(2, 7).Style.Font.FontColor = ClosedXML.Excel.XLColor.White;

                        ws.Cell(2, 8).Value = failedCount;
                        ws.Cell(2, 8).Style.Font.Bold = true;

                        // Fetch Formulas and Names
                        var formulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                        var stdColToDisplayName = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                        if (string.IsNullOrEmpty(finalClientName)) finalClientName = clientName ?? "";
                        if (string.IsNullOrEmpty(finalModelName)) finalModelName = modelName ?? "";

                        try
                        {
                            if (string.IsNullOrEmpty(finalClientName)) finalClientName = await _vendorRepository.GetClientNameAsync(cId);
                            if (string.IsNullOrEmpty(finalModelName)) finalModelName = await _vendorRepository.GetModelNameAsync(mId);

                            var configData = await _vendorRepository.GetVendorTemplateConfigAsync(cId, mId);
                            foreach (var row in configData)
                            {
                                var dict = (IDictionary<string, object>)row;
                                var stdCol = dict.ContainsKey("StandardDbColumn") ? Convert.ToString(dict["StandardDbColumn"]) ?? "" : "";
                                var excelHeader = dict.ContainsKey("ExcelHeaderName") ? Convert.ToString(dict["ExcelHeaderName"]) ?? "" : "";
                                var formula = dict.ContainsKey("FormulaDescription") ? Convert.ToString(dict["FormulaDescription"]) ?? "" : "";
                                stdColToDisplayName[stdCol] = excelHeader;
                                if (!string.IsNullOrEmpty(formula)) formulaMap[stdCol] = formula;
                            }
                        }
                        catch { }

                        // Update Top Summary Metrics with DB names if form was empty
                        ws.Cell(1, 2).Value = finalClientName;
                        ws.Cell(1, 5).Value = finalModelName;

                        var resolvedFormulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                        foreach (var kv in formulaMap)
                        {
                            var resolved = kv.Value;
                            foreach (var stdKv in stdColToDisplayName)
                                resolved = resolved.Replace("{" + stdKv.Key + "}", "[" + stdKv.Value + "]");

                            if (stdColToDisplayName.ContainsKey(kv.Key))
                            {
                                resolvedFormulaMap[stdColToDisplayName[kv.Key]] = resolved;
                            }
                            else
                            {
                                resolvedFormulaMap[kv.Key] = resolved;
                            }
                        }
                        formulaMap = new Dictionary<string, string>(resolvedFormulaMap, StringComparer.OrdinalIgnoreCase);

                        int summaryHeaderRow = 4;
                        if (renamedList.Any())
                        {
                            var firstRow = renamedList.First();
                            var excludeKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "TotalRows", "TransactionID", "UploadBatchID", "fk_cost_centre_id", "fk_model_id", "fk_rec_id", "ClientID", "ModelID", "LocationID", "CreatedBy", "CreatedDate", "IsProcessed", "fk_File_Id", "FHRID", "FromDate", "ToDate", "CycleName", "BudgetaryCode", "StateName", "Payment_Status", "HR_Remark", "Central_Remark" };
                            var keys = firstRow.Keys.Where(k => !excludeKeys.Contains(k)).ToList();

                            // Headers
                            for (int c = 0; c < keys.Count; c++)
                            {
                                var cell = ws.Cell(summaryHeaderRow, c + 1);
                                cell.Value = keys[c];
                                cell.Style.Font.Bold = true;
                                cell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(52, 58, 64);
                                cell.Style.Font.FontColor = ClosedXML.Excel.XLColor.White;
                            }

                            // Formulas
                            int formulaRow = summaryHeaderRow + 1;
                            ws.Cell(formulaRow, 1).Value = "Formula:";
                            ws.Cell(formulaRow, 1).Style.Font.Italic = true;
                            ws.Cell(formulaRow, 1).Style.Font.FontColor = ClosedXML.Excel.XLColor.Gray;
                            for (int c = 0; c < keys.Count; c++)
                            {
                                if (formulaMap.ContainsKey(keys[c]))
                                {
                                    var fCell = ws.Cell(formulaRow, c + 1);
                                    fCell.Value = formulaMap[keys[c]];
                                    fCell.Style.Font.Italic = true;
                                    fCell.Style.Font.FontColor = ClosedXML.Excel.XLColor.Gray;
                                }
                            }

                            // Data
                            int rowIdx = formulaRow + 1;
                            foreach (var dataRow in renamedList)
                            {
                                for (int c = 0; c < keys.Count; c++)
                                {
                                    if (dataRow.ContainsKey(keys[c]))
                                    {
                                        ws.Cell(rowIdx, c + 1).Value = dataRow[keys[c]]?.ToString();
                                    }
                                }
                                rowIdx++;
                            }
                        }
                        ws.Columns().AdjustToContents();
                        wb.Save();
                    }
                }
                catch (Exception cwEx)
                {
                    Console.WriteLine("Error generating tab 2: " + cwEx.Message);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Transaction processed and saved successfully.";
                modelResponse.Data = renamedList;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        private static Dictionary<string, object> OrderRowByCombo(
            Dictionary<string, object> renamedRow,
            bool isFlipkartOdhMdh,
            bool isAmazonDsp,
            bool isAmazonEdsp,
            bool isFlipkartXrm,
            bool isFlipkartLarge,
            bool isFlipkartFm,
            bool isAirtelFse,
            bool isEbeesVar,
            bool isBlueDartVar,
            bool isShiprocketVar,
            bool isMeeshoVar,
            bool isHealthkartVar)
        {
            var orderedRow = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

            if (isFlipkartOdhMdh)
            {
                var prefOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "No. of Days",
                    "SR LM Return", "SR FM Return", "Assign RVP+Normal", "Total Delivered+RVP+Shopsy", "FWD+RVP Del-W/o SR", "Conversion %",
                    "Rate Type", "Applied BaseRate", "Payable",
                    "U2S", "U2S Rate", "U2S Rate Type", "U2S Applied Rate", "U2S Payable",
                    "Shopsy", "Shopsy Rate Type", "Shopsy RateDeduction", "Shopsy RateApplied", "Shopsy Payable",
                    "Prexo", "Prexo Rate", "Prexo Rate Type", "Prexo Applied Rate", "Prexo Payable",
                    "Grocery Assigned", "Grocery Delivered", "Grocery Conversion %", "Grocery Rate", "Grocery Rate Type", "Grocery Applied Rate", "Grocery Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Rent Deduction", "Advance Deduction", "Hold", "Karma Life Deduction", "Arrear", "SD", "TNT Deduction", "Welfare Deduction",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in prefOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isAmazonDsp)
            {
                var dspOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "Route", "Vehicle Type",
                    "Total OFD", "Total Delivered", "Conversion %", "Applied_Rate", "Rate_Type", "Base Payable",
                    "Pickup Assign", "Pickup Done", "Pickup Conversion%", "Pickup RateType", "Pickup AppliedRate", "Pickup Payable",
                    "MFN Assign", "MFN Done", "MFN Conversion %", "MFN RateType", "MFN AppliedRate", "MFN Payable",
                    "Van Rate", "Van RateType", "VAN AppliedRate", "PresentDays", "VAN Payable",
                    "PresentDaysPayableRate", "PresentDaysPayable", "SC", "totalPayable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "gst%", "GstAmount", "TotalPayableAfterGST", "TDS%", "TDSAmount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear", "Hold", "Karmalife Deduction", "Welfare Deduction", "Advance Deduction",
                    "Recovery Cap %", "Capped Recovery Amount", "net payable", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Vendor_BankName", "Account No", "Vendor_AccountNo", "IFSC Code", "Vendor_IFSCCode", "PAN No", "Vendor_PanNo", "Aadhar No", "Vendor_AaddharNo", "Account Holder Name", "Vendor_AccountHolderName", "Date Range", "TransactionRange", "Uploaded By", "UploadedByName",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in dspOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isAmazonEdsp)
            {
                var edspOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "Vehicle Type",
                    "Total OFD", "Total Delivered", "Conversion %", "Applied_Rate", "Rate_Type", "Base Payable",
                    "Pickup Assign", "Pickup Done", "Pickup Conversion%", "Pickup RateType", "Pickup AppliedRate", "Pickup Payable",
                    "MFN Assign", "MFN Done", "MFN Conversion %", "MFN RateType", "MFN AppliedRate", "MFN Payable",
                    "totalPayable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "gst%", "GstAmount", "TotalPayableAfterGST", "TDS%", "TDSAmount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear", "Hold", "Karmalife Deduction", "Welfare Deduction",
                    "Recovery Cap %", "Capped Recovery Amount", "net payable", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Vendor_BankName", "Account No", "Vendor_AccountNo", "IFSC Code", "Vendor_IFSCCode", "PAN No", "Vendor_PanNo", "Aadhar No", "Vendor_AaddharNo", "Account Holder Name", "Vendor_AccountHolderName", "Date Range", "TransactionRange", "Uploaded By", "UploadedByName",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in edspOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isFlipkartXrm)
            {
                var xrmOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Total OFD", "Total Delivered", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Pickup Assign", "Pickup Done", "Pickup %", "Pickup Rate", "Pickup Rate Type", "Pickup Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Deduction", "COD Deduction", "Other Deduction", "Insurance", "Welfare Deduction", "Hold", "Karma Life", "Arrear", "Arrear Amt",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in xrmOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isFlipkartLarge)
            {
                var largeOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "Vehicle Type", "Working Days",
                    "Delivered Count", "Delivered_Volume", "Delivered", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear", "Hold", "KarmaLife Deduction", "Welfare Deduction",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in largeOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isFlipkartFm)
            {
                var fmOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Assigned FM", "Delivered FM", "Assigned RVP", "Delivered RVP", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear", "Hold",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in fmOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isAirtelFse)
            {
                var airtelOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Over System Pickup Count", "FSE System Pickup Count", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Deduction", "COD Deduction", "Other Deduction", "Arrear Amt", "Insurance", "SD", "Welfare",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in airtelOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isEbeesVar)
            {
                var ebeesOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "VendorCode", "Name", "VendorName", "Location", "LocationName", "FHRID", "AreaManager", "Hub code", "HubCode",
                    "Sum of Total OFD", "Assigned_Volume", "OFD",
                    "Sum of Total Delivered", "Delivered_Volume", "Delivered",
                    "Conversion %", "Conversion_Percentage",
                    "Applied BaseRate", "Applied_Rate", "Applied Rate",
                    "Rate Type", "Rate_Type",
                    "Delivery Payable", "Delivery_Payable", "Payable",
                    "RTO Assign", "RTO_Assigned", "RTO Done", "RTO_Done", "RTO %", "RTO_Conversion_Percentage", "RTO Rate", "RTO_Applied_Rate", "RTO Rate Type", "RTO_Rate_Type", "RTO Payable", "RTO_Payable",
                    "DTO Assign", "DTO_Assigned", "DTO Done", "DTO_Done", "DTO %", "DTO_Conversion_Percentage", "DTO Rate", "DTO_Applied_Rate", "DTO Rate Type", "DTO_Rate_Type", "DTO Payable", "DTO_Payable",
                    "FM Assign", "FM_Assigned", "FM Done", "FM_Done", "FM %", "FM_Conversion_Percentage", "FM Rate", "FM_Applied_Rate", "FM Rate Type", "FM_Rate_Type", "FM Payable", "FM_Payable",
                    "Pickup Assign", "Pickup_Assigned", "Pickup Done", "Pickup_Done", "Pickup %", "Pickup_Conversion_Percentage", "Pickup Rate", "Pickup_Applied_Rate", "Pickup Rate Type", "Pickup_Rate_Type", "Pickup Payable", "Pickup_Payable",
                    "Base payable", "Base_Payable", "Base Payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST_Percentage", "GST Amount", "GST_Amount", "Total Payable After GST", "Total_Payable_After_GST", "TDS Percentage", "TDS_Percentage", "TDS Amount", "TDS_Amount",
                    "Brought-Fwd Deficit",
                    "Deduction", "Ded_Shipment", "COD Deduction", "Ded_COD", "Other Deduction", "Ded_Other", "Arrear", "Ded_Arrear", "Insurance", "Ded_Insurance", "SD", "Ded_SD", "Welfare Deduction", "Ded_Welfare", "Hold", "Ded_Hold", "Karma Life Deduction", "Ded_KarmaLife", "Rent Deduction", "Ded_Rent", "Advance Deduction", "Ded_Advance", "TNT Deduction", "Ded_TNT",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable", "Net_Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Vendor_BankName", "Account No", "Vendor_AccountNo", "IFSC Code", "Vendor_IFSCCode", "PAN No", "Vendor_PanNo", "Aadhar No", "Vendor_AaddharNo", "Account Holder Name", "Vendor_AccountHolderName", "Date Range", "TransactionRange", "Uploaded By", "UploadedByName",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in ebeesOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isBlueDartVar)
            {
                var blueDartOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Total Assigned", "Total Delivered", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear Amt", "SD",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in blueDartOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isShiprocketVar)
            {
                var shiprocketOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Total OFD", "Total Delivered", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear", "Arrear Amt",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in shiprocketOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isMeeshoVar)
            {
                var meeshoOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Total OFD", "Total Delivered", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Pickup Assign", "Pickup Done", "Pickup %", "Pickup Rate", "Pickup Rate Type", "Pickup Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Shipment Loss Deduction", "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear Amt", "Insurance", "Hold", "Karma Life", "Welfare Deduction",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in meeshoOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            if (isHealthkartVar)
            {
                var healthkartOrder = new string[] {
                    "Processing Status", "System Remarks",
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Sum of Total OFD", "Sum of Total Delivered", "Conversion %", "Applied BaseRate", "Rate Type", "Delivery Payable", "Payable",
                    "Base payable", "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable",
                    "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount",
                    "Brought-Fwd Deficit",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear Amt", "Insurance", "SD", "Welfare",
                    "Recovery Cap %", "Capped Recovery Amount", "Net Payable",
                    "Carry-Fwd Deficit", "Deductions Synced",
                    "Deduction Sync Date", "Synced By", "Sync Remarks", "Recovery Policy Applied", "Resolved Gross Payable",
                    "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By",
                    "Payment Date", "Payment Mode", "Payment Transaction No", "Payment Bank Name", "Payment Account No", "Payment Remarks", "Payment Batch No", "Payment Processed By", "Payment Processed Date"
                };
                foreach (var k in healthkartOrder) { if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k]; }
                foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value; }
                return orderedRow;
            }

            // Fallback for general models
            var metaCols = new string[] { "Processing Status", "System Remarks" };
            foreach (var m in metaCols) { if (renamedRow.ContainsKey(m)) orderedRow[m] = renamedRow[m]; }

            var tempDict = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) tempDict[kv.Key] = kv.Value; }

            var incCols = new string[] { "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive Applied Rate", "Incentive Payable", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable" };

            foreach (var kv in tempDict)
            {
                if (Array.Exists(incCols, c => c.Equals(kv.Key, StringComparison.OrdinalIgnoreCase))) continue;
                orderedRow[kv.Key] = kv.Value;

                if (kv.Key.Equals("Base Payable", StringComparison.OrdinalIgnoreCase) || kv.Key.Equals("Payable", StringComparison.OrdinalIgnoreCase))
                {
                    foreach (var c in incCols) if (tempDict.ContainsKey(c)) orderedRow[c] = tempDict[c];
                }
            }
            foreach (var c in incCols) if (tempDict.ContainsKey(c) && !orderedRow.ContainsKey(c)) orderedRow[c] = tempDict[c];

            return orderedRow;
        }

        [HttpGet("TransactionList")]
        public async Task<IActionResult> GetTransactionList([FromQuery] int clientId, [FromQuery] int modelId, [FromQuery] string? locationId = null, [FromQuery] string? transactionRange = null, [FromQuery] string? vendorCode = null, [FromQuery] string? searchTerm = null)
        {
            var (totalCount, list) = await _vendorRepository.GetVendorPaymentTransactionsListAsync(clientId, modelId, locationId, transactionRange, vendorCode, searchTerm, 1, 999999);

            var outputRenameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var formulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var stdColToDisplayName = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var templateConfigHeaderOrder = new List<string>();
            string finalClientName = "";
            string finalModelName = "";

            try
            {
                finalClientName = await _vendorRepository.GetClientNameAsync(clientId);
                finalModelName = await _vendorRepository.GetModelNameAsync(modelId);

                var configData = await _vendorRepository.GetVendorTemplateConfigAsync(clientId, modelId);
                foreach (var row in configData)
                {
                    var dict = (IDictionary<string, object>)row;
                    var stdCol = dict.ContainsKey("StandardDbColumn") ? Convert.ToString(dict["StandardDbColumn"]) ?? "" : "";
                    var excelHeader = dict.ContainsKey("ExcelHeaderName") ? Convert.ToString(dict["ExcelHeaderName"]) ?? "" : "";
                    var formula = dict.ContainsKey("FormulaDescription") ? Convert.ToString(dict["FormulaDescription"]) ?? "" : "";
                    stdColToDisplayName[stdCol] = excelHeader;
                    outputRenameMap[stdCol] = excelHeader;
                    if (!string.IsNullOrEmpty(excelHeader) && !templateConfigHeaderOrder.Contains(excelHeader)) templateConfigHeaderOrder.Add(excelHeader);
                    if (!string.IsNullOrEmpty(formula)) formulaMap[stdCol] = formula;
                }
            }
            catch { }

            string normClient = (finalClientName ?? "").ToLowerInvariant().Trim();
            string normModel = (finalModelName ?? "").ToLowerInvariant().Trim();

            bool isFlipkart = normClient.Contains("flipkart");
            bool isAmazon = normClient.Contains("amazon") || clientId == 316;
            bool isAirtel = normClient.Contains("airtel");
            bool isEbees = normClient.Contains("ebees") || normClient.Contains("xbees") || modelId == 7;
            bool isBlueDart = normClient.Contains("bluedart");
            bool isShiprocket = normClient.Contains("shiprocket");
            bool isMeesho = normClient.Contains("meesho");
            bool isHealthkart = normClient.Contains("healthkart");

            bool isFlipkartOdhMdh = (isFlipkart && (modelId == 1 || normModel.Contains("odh-mdh") || normModel.Contains("odh"))) || (!isAmazon && !isAirtel && !isEbees && modelId == 1);
            bool isFlipkartXrm = isFlipkart && (modelId == 2 || normModel.Contains("xrm"));
            bool isFlipkartLarge = isFlipkart && (modelId == 3 || normModel.Contains("large"));
            bool isFlipkartFm = isFlipkart && (modelId == 8 || normModel.Contains("fm") || normModel.Contains("variable"));

            bool isAmazonDsp = (isAmazon && (modelId == 4 || (normModel.Contains("dsp") && !normModel.Contains("edsp")))) || (modelId == 4 && !isFlipkart && !isAirtel);
            bool isAmazonEdsp = (isAmazon && (modelId == 5 || normModel.Contains("edsp"))) || (modelId == 5 && !isFlipkart && !isAirtel);

            bool isAirtelFse = isAirtel && (modelId == 6 || normModel.Contains("fse"));
            bool isEbeesVar = isEbees || modelId == 7 || normModel.Contains("variable(e)");
            bool isBlueDartVar = isBlueDart || modelId == 10 || normModel.Contains("variable(b)");
            bool isShiprocketVar = isShiprocket || modelId == 9 || normModel.Contains("variable(s)");
            bool isMeeshoVar = isMeesho || modelId == 11 || normModel.Contains("variable(m)");
            bool isHealthkartVar = isHealthkart || modelId == 12 || normModel.Contains("variable(h)");

            var resolvedFormulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var kv in formulaMap)
            {
                var resolved = kv.Value;
                foreach (var stdKv in stdColToDisplayName)
                    resolved = resolved.Replace("{" + stdKv.Key + "}", "[" + stdKv.Value + "]");

                if (stdColToDisplayName.ContainsKey(kv.Key))
                {
                    resolvedFormulaMap[stdColToDisplayName[kv.Key]] = resolved;
                }
                else
                {
                    resolvedFormulaMap[kv.Key] = resolved;
                }
            }
            formulaMap = new Dictionary<string, string>(resolvedFormulaMap, StringComparer.OrdinalIgnoreCase);

            var renamedList = new List<Dictionary<string, object>>();
            foreach (var rawRow in list)
            {
                var rawDict = (IDictionary<string, object>)rawRow;
                var renamedRow = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                foreach (var kvp in rawDict)
                {
                    var internalExclude = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                        "TotalRows", "TotalRecords", "TransactionID", "UploadBatchID", "fk_cost_centre_id", "fk_model_id", "fk_rec_id",
                        "ClientID", "ModelID", "LocationID", "CreatedBy", "CreatedDate", "IsProcessed", "fk_File_Id", "FHRID",
                        "FromDate", "ToDate", "CycleName", "BudgetaryCode", "StateName", "Payment_Status", "Payment Status",
                        "HR_Remark", "HR Remark", "Central_Remark", "Central Remark",
                        "IsApproved", "ApprovedBy", "ApprovedByName", "ApprovedOn", "ApproverRemarks",
                        "SyncedBy", "Synced_By", "Payment_ProcessedBy", "PaymentProcessedBy",
                        "ResolvedSyncedByName", "ResolvedPaymentProcessedByName", "ResolvedRecoveryPolicyApplied","Resolved_Gross_Payable"
                    };
                    if (internalExclude.Contains(kvp.Key)) continue;

                    bool isPickupEnabled = outputRenameMap.ContainsKey("Pickup_Assigned") || outputRenameMap.ContainsKey("pickup_assigned") || outputRenameMap.Values.Contains("Pickup Assign");
                    var ebeesCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate", "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable" };
                    if (ebeesCols.Contains(kvp.Key) && !isPickupEnabled) continue;
                    var dedCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Ded_Shipment", "Ded_COD", "Ded_Other", "Ded_Arrear", "Ded_Insurance", "Ded_SD", "Ded_Welfare", "Ded_Hold", "Ded_KarmaLife" };
                    if (dedCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;
                    if (isFlipkartLarge && kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) continue;
                    var fmCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP", "Vehicle_Type", "Working_Days" };
                    if (fmCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;
                    // Hide Ebees-only columns (RTO, DTO, FM) for all non-Ebees models
                    if (!isEbeesVar)
                    {
                        var ebeesOnlyCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "RTO_Assigned", "RTO_Done", "RTO_Conversion_Percentage", "RTO_Applied_Rate", "RTO_Rate_Type", "RTO_Payable",
                            "DTO_Assigned", "DTO_Done", "DTO_Conversion_Percentage", "DTO_Applied_Rate", "DTO_Rate_Type", "DTO_Payable",
                            "FM_Assigned", "FM_Done", "FM_Conversion_Percentage", "FM_Applied_Rate", "FM_Rate_Type", "FM_Payable"
                        };
                        if (ebeesOnlyCols.Contains(kvp.Key)) continue;
                    }

                    string displayKey = kvp.Key;

                    if (outputRenameMap.ContainsKey(kvp.Key))
                    {
                        displayKey = outputRenameMap[kvp.Key];
                    }
                    else if (kvp.Key.Equals("VendorCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Code";
                    else if (kvp.Key.Equals("VendorName", StringComparison.OrdinalIgnoreCase)) displayKey = "Name";
                    else if (kvp.Key.Equals("LocationName", StringComparison.OrdinalIgnoreCase)) displayKey = "Location";
                    else if (kvp.Key.Equals("FHRID", StringComparison.OrdinalIgnoreCase)) displayKey = "FHRID";
                    else if (kvp.Key.Equals("HubCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Hub code";
                    else if (kvp.Key.Equals("Working_Days", StringComparison.OrdinalIgnoreCase)) displayKey = "No. of Days";
                    else if (kvp.Key.Equals("Processing_Status", StringComparison.OrdinalIgnoreCase)) displayKey = "Processing Status";
                    else if (kvp.Key.Equals("System_Remarks", StringComparison.OrdinalIgnoreCase)) displayKey = "System Remarks";
                    else if (kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total OFD";
                    else if (kvp.Key.Equals("Delivered_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total Delivered";
                    else if (kvp.Key.Equals("Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Conversion %";
                    else if (kvp.Key.Equals("Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Applied BaseRate";
                    else if (kvp.Key.Equals("Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Rate Type";
                    else if (kvp.Key.Equals("Base_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Base payable";
                    else if (kvp.Key.Equals("GST_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Percentage";
                    else if (kvp.Key.Equals("GST_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Amount";
                    else if (kvp.Key.Equals("Total_Payable_After_GST", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Payable After GST";
                    else if (kvp.Key.Equals("TDS_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Percentage";
                    else if (kvp.Key.Equals("TDS_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Amount";
                    else if (kvp.Key.Equals("Net_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Net Payable";
                    else if (kvp.Key.Equals("Vendor_BankName", StringComparison.OrdinalIgnoreCase)) displayKey = "Bank Name";
                    else if (kvp.Key.Equals("Vendor_AccountNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Account No";
                    else if (kvp.Key.Equals("Vendor_IFSCCode", StringComparison.OrdinalIgnoreCase)) displayKey = "IFSC Code";
                    else if (kvp.Key.Equals("Vendor_PanNo", StringComparison.OrdinalIgnoreCase)) displayKey = "PAN No";
                    else if (kvp.Key.Equals("Vendor_AaddharNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Aadhar No";
                    else if (kvp.Key.Equals("Vendor_AccountHolderName", StringComparison.OrdinalIgnoreCase)) displayKey = "Account Holder Name";
                    else if (kvp.Key.Equals("TransactionRange", StringComparison.OrdinalIgnoreCase)) displayKey = "Date Range";
                    else if (kvp.Key.Equals("UploadedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Uploaded By";
                    else if (kvp.Key.Equals("Ded_Shipment", StringComparison.OrdinalIgnoreCase)) displayKey = "Deduction";
                    else if (kvp.Key.Equals("Ded_COD", StringComparison.OrdinalIgnoreCase)) displayKey = "COD Deduction";
                    else if (kvp.Key.Equals("Ded_Other", StringComparison.OrdinalIgnoreCase)) displayKey = "Other Deduction";
                    else if (kvp.Key.Equals("Ded_Arrear", StringComparison.OrdinalIgnoreCase)) displayKey = "Arrear";
                    else if (kvp.Key.Equals("Ded_Insurance", StringComparison.OrdinalIgnoreCase)) displayKey = "Insurance";
                    else if (kvp.Key.Equals("Ded_SD", StringComparison.OrdinalIgnoreCase)) displayKey = "SD";
                    else if (kvp.Key.Equals("Ded_Welfare", StringComparison.OrdinalIgnoreCase)) displayKey = "Welfare Deduction";
                    else if (kvp.Key.Equals("Ded_Hold", StringComparison.OrdinalIgnoreCase)) displayKey = "Hold";
                    else if (kvp.Key.Equals("Ded_KarmaLife", StringComparison.OrdinalIgnoreCase)) displayKey = "Karma Life Deduction";
                    else if (kvp.Key.Equals("Ded_Rent", StringComparison.OrdinalIgnoreCase)) displayKey = "Rent Deduction";
                    else if (kvp.Key.Equals("Ded_Advance", StringComparison.OrdinalIgnoreCase)) displayKey = "Advance Deduction";
                    else if (kvp.Key.Equals("Ded_TNT", StringComparison.OrdinalIgnoreCase)) displayKey = "TNT Deduction";
                    else if (kvp.Key.Equals("SR_LM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR LM Return";
                    else if (kvp.Key.Equals("SR_FM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR FM Return";
                    else if (kvp.Key.Equals("Assign_RVP_Normal", StringComparison.OrdinalIgnoreCase)) displayKey = "Assign RVP+Normal";
                    else if (kvp.Key.Equals("Total_Delivered_RVP_Shopsy", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Delivered+RVP+Shopsy";
                    else if (kvp.Key.Equals("FWD_RVP_Del_Wo_SR", StringComparison.OrdinalIgnoreCase)) displayKey = "FWD+RVP Del-W/o SR";
                    else if (kvp.Key.Equals("Delivery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Payable";
                    else if (kvp.Key.Equals("U2S_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate";
                    else if (kvp.Key.Equals("U2S_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate Type";
                    else if (kvp.Key.Equals("U2S_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Applied Rate";
                    else if (kvp.Key.Equals("U2S_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Payable";
                    else if (kvp.Key.Equals("Shopsy_RateDeduction", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateDeduction";
                    else if (kvp.Key.Equals("Shopsy_RateType", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Rate Type";
                    else if (kvp.Key.Equals("Shopsy_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateApplied";
                    else if (kvp.Key.Equals("Shopsy_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Payable";
                    else if (kvp.Key.Equals("Prexo_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate";
                    else if (kvp.Key.Equals("Prexo_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate Type";
                    else if (kvp.Key.Equals("Prexo_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Applied Rate";
                    else if (kvp.Key.Equals("Prexo_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Payable";
                    else if (kvp.Key.Equals("Grocery_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Assigned";
                    else if (kvp.Key.Equals("Grocery_Delivered", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Delivered";
                    else if (kvp.Key.Equals("Grocery_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Conversion %";
                    else if (kvp.Key.Equals("Grocery_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate";
                    else if (kvp.Key.Equals("Grocery_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate Type";
                    else if (kvp.Key.Equals("Grocery_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Applied Rate";
                    else if (kvp.Key.Equals("Grocery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Payable";
                    else if (kvp.Key.Equals("Pickup_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup %";
                    else if (kvp.Key.Equals("Pickup_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate";
                    else if (kvp.Key.Equals("Pickup_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate Type";
                    else if (kvp.Key.Equals("Pickup_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Payable";
                    // *** NEW: RTO display mappings ***
                    else if (kvp.Key.Equals("RTO_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Assign";
                    else if (kvp.Key.Equals("RTO_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Done";
                    else if (kvp.Key.Equals("RTO_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO %";
                    else if (kvp.Key.Equals("RTO_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Rate";
                    else if (kvp.Key.Equals("RTO_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Rate Type";
                    else if (kvp.Key.Equals("RTO_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "RTO Payable";
                    // *** NEW: DTO display mappings ***
                    else if (kvp.Key.Equals("DTO_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Assign";
                    else if (kvp.Key.Equals("DTO_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Done";
                    else if (kvp.Key.Equals("DTO_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO %";
                    else if (kvp.Key.Equals("DTO_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Rate";
                    else if (kvp.Key.Equals("DTO_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Rate Type";
                    else if (kvp.Key.Equals("DTO_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "DTO Payable";
                    // *** NEW: FM display mappings ***
                    else if (kvp.Key.Equals("FM_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Assign";
                    else if (kvp.Key.Equals("FM_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Done";
                    else if (kvp.Key.Equals("FM_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "FM %";
                    else if (kvp.Key.Equals("FM_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Rate";
                    else if (kvp.Key.Equals("FM_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Rate Type";
                    else if (kvp.Key.Equals("FM_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "FM Payable";
                    else if (kvp.Key.Equals("Total_Assigned_FM_RVP", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Assigne FM+RVP";
                    else if (kvp.Key.Equals("Route", StringComparison.OrdinalIgnoreCase)) displayKey = "Route";
                    else if (kvp.Key.Equals("MFN_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Assign";
                    else if (kvp.Key.Equals("MFN_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Done";
                    else if (kvp.Key.Equals("MFN_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Conversion %";
                    else if (kvp.Key.Equals("MFN_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN RateType";
                    else if (kvp.Key.Equals("MFN_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN AppliedRate";
                    else if (kvp.Key.Equals("MFN_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Payable";
                    else if (kvp.Key.Equals("Van_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Van Rate";
                    else if (kvp.Key.Equals("Van_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Van RateType";
                    else if (kvp.Key.Equals("Van_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN AppliedRate";
                    else if (kvp.Key.Equals("PresentDays", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDays";
                    else if (kvp.Key.Equals("Van_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN Payable";
                    else if (kvp.Key.Equals("PresentDaysPayableRate", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayableRate";
                    else if (kvp.Key.Equals("PresentDaysPayable", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayable";
                    else if (kvp.Key.Equals("Special_Charge", StringComparison.OrdinalIgnoreCase)) displayKey = "SC";
                    // *** NEW: Incentive mappings ***
                    else if (kvp.Key.Equals("IncentivePackets", StringComparison.OrdinalIgnoreCase)) displayKey = "IncentivePackets";
                    else if (kvp.Key.Equals("Incentive_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Rate";
                    else if (kvp.Key.Equals("Incentive_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Applied Rate";
                    else if (kvp.Key.Equals("Incentive_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Payable";
                    else if (kvp.Key.Equals("CarryForwardDeficit_In", StringComparison.OrdinalIgnoreCase)) displayKey = "Brought-Fwd Deficit";
                    else if (kvp.Key.Equals("CarryForwardDeficit_Out", StringComparison.OrdinalIgnoreCase)) displayKey = "Carry-Fwd Deficit";
                    else if (kvp.Key.Equals("RecoveryPercent", StringComparison.OrdinalIgnoreCase)) displayKey = "Recovery Cap %";
                    else if (kvp.Key.Equals("IsDeductionsSynced", StringComparison.OrdinalIgnoreCase)) displayKey = "Deductions Synced";
                    else if (kvp.Key.Equals("Gross_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Gross Payable";
                    else if (kvp.Key.Equals("Total_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "totalPayable";
                    else if (kvp.Key.Equals("SyncedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Synced By";
                    else if (kvp.Key.Equals("Payment_ProcessedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Processed By";
                    else if (kvp.Key.Equals("RecoveryPolicyApplied", StringComparison.OrdinalIgnoreCase)) displayKey = "Recovery Policy Applied";
                    else if (kvp.Key.Equals("Payment_Date", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Date";
                    else if (kvp.Key.Equals("Payment_Mode", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Mode";
                    else if (kvp.Key.Equals("Payment_TransactionNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Transaction No";
                    else if (kvp.Key.Equals("Payment_BankName", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Bank Name";
                    else if (kvp.Key.Equals("Payment_AccountNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Account No";
                    else if (kvp.Key.Equals("Payment_Remarks", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Remarks";
                    else if (kvp.Key.Equals("Payment_BatchNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Batch No";
                    else if (kvp.Key.Equals("Payment_ProcessedDate", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Processed Date";

                    // HIDE irrelevant columns for ODH-MDH
                    if (isFlipkartOdhMdh)
                    {
                        var odhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Assigned_Volume", "Delivered_Volume", "Sum of Total OFD", "Sum of Total Delivered",
                            "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP",
                            "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate",
                            "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable", "Ded_Insurance", "Insurance",
                            "Vehicle_Type", "Shopsy_Rate_Type"
                        };
                        if (odhHideCols.Contains(kvp.Key) || odhHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE ODH-MDH specific columns for ALL OTHER models
                    if (!isFlipkartOdhMdh)
                    {
                        var nonOdhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "SR_LM_Return", "SR LM Return", "SR_FM_Return", "SR FM Return",
                            "Assign_RVP_Normal", "Assign RVP+Normal", "Total_Delivered_RVP_Shopsy", "Total Delivered+RVP+Shopsy",
                            "FWD_RVP_Del_Wo_SR", "FWD+RVP Del-W/o SR",
                            "U2S", "U2S_Rate", "U2S Rate", "U2S_Rate_Type", "U2S Rate Type", "U2S_Applied_Rate", "U2S Applied Rate", "U2S_Payable", "U2S Payable",
                            "Shopsy", "Shopsy_RateDeduction", "Shopsy RateDeduction", "Shopsy_RateType", "Shopsy_Rate_Type", "Shopsy Rate Type", "Shopsy_Applied_Rate", "Shopsy RateApplied", "Shopsy_Payable", "Shopsy Payable",
                            "Prexo", "Prexo_Rate", "Prexo Rate", "Prexo_Rate_Type", "Prexo Rate Type", "Prexo_Applied_Rate", "Prexo Applied Rate", "Prexo_Payable", "Prexo Payable",
                            "Grocery_Assigned", "Grocery Assigned", "Grocery_Delivered", "Grocery Delivered",
                            "Grocery_Conversion_Percentage", "Grocery Conversion %", "Grocery_Rate", "Grocery Rate",
                            "Grocery_Rate_Type", "Grocery Rate Type", "Grocery_Applied_Rate", "Grocery Applied Rate", "Grocery_Payable", "Grocery Payable",
                            "Ded_Rent", "Rent Deduction", "Ded_Advance", "Advance Deduction", "Ded_TNT", "TNT Deduction"
                        };
                        if (isAmazonDsp)
                        {
                            nonOdhHideCols.Remove("Ded_Advance");
                            nonOdhHideCols.Remove("Advance Deduction");
                        }
                        if (nonOdhHideCols.Contains(kvp.Key) || nonOdhHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE Amazon DSP / EDSP specific columns for other models (not Amazon DSP or EDSP)
                    if (!isAmazonDsp && !isAmazonEdsp)
                    {
                        var dspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Route", "MFN_Assigned", "MFN Assign", "MFN_Done", "MFN Done", "MFN  Done",
                            "MFN_Conversion_Percentage", "MFN Conversion %",
                            "MFN_Rate_Type", "MFN RateType", "MFN Rate Type", "MFN_Applied_Rate", "MFN AppliedRate", "MFN Applied Rate", "MFN_Payable", "MFN Payable",
                            "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
                            "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
                            "Special_Charge", "SC", "Total_Payable", "totalPayable"
                        };
                        if (dspHideCols.Contains(kvp.Key) || dspHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE DSP-only columns for EDSP (Model 5)
                    if (isAmazonEdsp)
                    {
                        var edspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Route", "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
                            "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
                            "Special_Charge", "SC", "Ded_Advance", "Advance Deduction",
                            "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
                            "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
                            "Ded_Insurance", "Insurance", "Ded_SD", "SD",
                            "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
                        };
                        if (edspHideCols.Contains(kvp.Key) || edspHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE irrelevant columns for Amazon DSP (Model 4)
                    if (isAmazonDsp)
                    {
                        var dspSpecificHide = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
                            "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
                            "Ded_Insurance", "Insurance", "Ded_SD", "SD",
                            "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
                        };
                        if (dspSpecificHide.Contains(kvp.Key) || dspSpecificHide.Contains(displayKey)) continue;
                    }

                    if ((displayKey.Equals("Incentive_Payable", StringComparison.OrdinalIgnoreCase) ||
                         displayKey.Equals("Incentive Payable", StringComparison.OrdinalIgnoreCase) ||
                         displayKey.Equals("Gross Payable", StringComparison.OrdinalIgnoreCase) ||
                         displayKey.Equals("Gross_Payable", StringComparison.OrdinalIgnoreCase)) &&
                        (kvp.Value == null || kvp.Value is DBNull))
                    {
                        renamedRow[displayKey] = 0.00m;
                    }
                    else if (displayKey.Equals("Synced By", StringComparison.OrdinalIgnoreCase))
                    {
                        var sVal = kvp.Value?.ToString()?.Trim();
                        rawDict.TryGetValue("IsDeductionsSynced", out var rawSync);
                        bool isDeductionSynced = rawSync is bool bSync ? bSync : (rawSync?.ToString() == "1" || rawSync?.ToString()?.Equals("true", StringComparison.OrdinalIgnoreCase) == true);

                        if (!isDeductionSynced)
                        {
                            renamedRow[displayKey] = null;
                        }
                        else if (rawDict.TryGetValue("ResolvedSyncedByName", out var resS) && resS != null && !string.IsNullOrWhiteSpace(resS.ToString()) && !resS.ToString()!.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = resS.ToString()!;
                        }
                        else if (!string.IsNullOrEmpty(sVal) && !sVal.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = sVal;
                        }
                        else
                        {
                            renamedRow[displayKey] = "Admin1";
                        }
                    }
                    else if (displayKey.Equals("Payment Processed By", StringComparison.OrdinalIgnoreCase))
                    {
                        var pVal = kvp.Value?.ToString()?.Trim();
                        rawDict.TryGetValue("Payment_Status", out var rawPayStatus);
                        rawDict.TryGetValue("Payment_ProcessedBy", out var rawProcBy);
                        rawDict.TryGetValue("Payment_Date", out var rawPayDate);
                        rawDict.TryGetValue("Payment_TransactionNo", out var rawPayTxnNo);

                        bool hasPaymentActivity = (rawPayStatus != null && (rawPayStatus.ToString() == "Paid" || rawPayStatus.ToString() == "Payment Done")) ||
                                                  (!string.IsNullOrWhiteSpace(rawProcBy?.ToString())) ||
                                                  (!string.IsNullOrWhiteSpace(pVal)) ||
                                                  (rawPayDate != null && !string.IsNullOrWhiteSpace(rawPayDate.ToString())) ||
                                                  (!string.IsNullOrWhiteSpace(rawPayTxnNo?.ToString()));

                        if (!hasPaymentActivity)
                        {
                            renamedRow[displayKey] = null;
                        }
                        else if (rawDict.TryGetValue("ResolvedPaymentProcessedByName", out var resP) && resP != null && !string.IsNullOrWhiteSpace(resP.ToString()) && !resP.ToString()!.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = resP.ToString()!;
                        }
                        else if (!string.IsNullOrEmpty(pVal) && !pVal.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = pVal;
                        }
                        else
                        {
                            renamedRow[displayKey] = "Admin1";
                        }
                    }
                    else if (displayKey.Equals("Recovery Policy Applied", StringComparison.OrdinalIgnoreCase))
                    {
                        var rVal = kvp.Value?.ToString()?.Trim();
                        if (string.IsNullOrEmpty(rVal))
                        {
                            if (rawDict.TryGetValue("ResolvedRecoveryPolicyApplied", out var resR) && resR != null && !string.IsNullOrWhiteSpace(resR.ToString()))
                                renamedRow[displayKey] = resR.ToString()!;
                            else
                                renamedRow[displayKey] = null;
                        }
                        else
                        {
                            renamedRow[displayKey] = rVal;
                        }
                    }
                    else
                    {
                        renamedRow[displayKey] = kvp.Value;
                    }
                }

                // Compute and ensure Deficit & Recovery Cap columns are populated
                decimal totalPayableAfterGst = 0m;
                if (renamedRow.TryGetValue("Total Payable After GST", out var tpag) && tpag != null && decimal.TryParse(tpag.ToString(), out var pTpag)) totalPayableAfterGst = pTpag;
                else if (renamedRow.TryGetValue("TotalPayableAfterGST", out var tpag2) && tpag2 != null && decimal.TryParse(tpag2.ToString(), out var pTpag2)) totalPayableAfterGst = pTpag2;
                else if (rawDict.TryGetValue("Total_Payable_After_GST", out var tpag3) && tpag3 != null && decimal.TryParse(tpag3.ToString(), out var pTpag3)) totalPayableAfterGst = pTpag3;

                decimal tdsAmount = 0m;
                if (renamedRow.TryGetValue("TDS Amount", out var tds) && tds != null && decimal.TryParse(tds.ToString(), out var pTds)) tdsAmount = pTds;
                else if (renamedRow.TryGetValue("TDSAmount", out var tds2) && tds2 != null && decimal.TryParse(tds2.ToString(), out var pTds2)) tdsAmount = pTds2;
                else if (rawDict.TryGetValue("TDS_Amount", out var tds3) && tds3 != null && decimal.TryParse(tds3.ToString(), out var pTds3)) tdsAmount = pTds3;

                decimal recPercent = 100m;
                if (renamedRow.TryGetValue("Recovery Cap %", out var rp) && rp != null && decimal.TryParse(rp.ToString(), out var pRp)) recPercent = pRp;
                else if (rawDict.TryGetValue("RecoveryPercent", out var rp2) && rp2 != null && decimal.TryParse(rp2.ToString(), out var pRp2)) recPercent = pRp2;

                decimal availableEarnings = Math.Max(0m, totalPayableAfterGst - tdsAmount);
                decimal cappedRecoveryAmount = Math.Round(availableEarnings * (recPercent / 100.00m), 2);

                decimal bFwdDeficit = 0m;
                if (renamedRow.TryGetValue("Brought-Fwd Deficit", out var bfd) && bfd != null && decimal.TryParse(bfd.ToString(), out var pBfd)) bFwdDeficit = pBfd;
                else if (rawDict.TryGetValue("CarryForwardDeficit_In", out var bfd2) && bfd2 != null && decimal.TryParse(bfd2.ToString(), out var pBfd2)) bFwdDeficit = pBfd2;

                decimal cFwdDeficit = 0m;
                if (renamedRow.TryGetValue("Carry-Fwd Deficit", out var cfd) && cfd != null && decimal.TryParse(cfd.ToString(), out var pCfd)) cFwdDeficit = pCfd;
                else if (rawDict.TryGetValue("CarryForwardDeficit_Out", out var cfd2) && cfd2 != null && decimal.TryParse(cfd2.ToString(), out var pCfd2)) cFwdDeficit = pCfd2;

                bool isSynced = false;
                if (renamedRow.TryGetValue("Deductions Synced", out var syn) && syn != null)
                {
                    if (syn is bool b) isSynced = b;
                    else isSynced = syn.ToString() == "1" || syn.ToString().Equals("true", StringComparison.OrdinalIgnoreCase);
                }
                else if (rawDict.TryGetValue("IsDeductionsSynced", out var syn2) && syn2 != null)
                {
                    if (syn2 is bool b2) isSynced = b2;
                    else isSynced = syn2.ToString() == "1" || syn2.ToString().Equals("true", StringComparison.OrdinalIgnoreCase);
                }

                renamedRow["Brought-Fwd Deficit"] = bFwdDeficit;
                renamedRow["Recovery Cap %"] = recPercent;
                renamedRow["Capped Recovery Amount"] = cappedRecoveryAmount;
                renamedRow["Carry-Fwd Deficit"] = cFwdDeficit;
                renamedRow["Deductions Synced"] = isSynced;

                if (isSynced)
                {
                    if (!renamedRow.ContainsKey("Recovery Policy Applied") || renamedRow["Recovery Policy Applied"] == null || string.IsNullOrWhiteSpace(renamedRow["Recovery Policy Applied"]?.ToString()))
                    {
                        renamedRow["Recovery Policy Applied"] = "PRIORITY";
                    }
                    if (!renamedRow.ContainsKey("Synced By") || renamedRow["Synced By"] == null || renamedRow["Synced By"]?.ToString() == "GU-21" || string.IsNullOrWhiteSpace(renamedRow["Synced By"]?.ToString()))
                    {
                        renamedRow["Synced By"] = "Admin1";
                    }
                }
                else
                {
                    renamedRow["Synced By"] = null;
                }

                var orderedRow = OrderRowByCombo(renamedRow, isFlipkartOdhMdh, isAmazonDsp, isAmazonEdsp, isFlipkartXrm, isFlipkartLarge, isFlipkartFm, isAirtelFse, isEbeesVar, isBlueDartVar, isShiprocketVar, isMeeshoVar, isHealthkartVar);

                // Retain internal identifiers needed by frontend deduction drilldown modals without displaying them in table columns
                object? txnIdVal = null;
                object? fhridVal = null;
                foreach (var kvp in rawDict)
                {
                    if (kvp.Key.Equals("TransactionID", StringComparison.OrdinalIgnoreCase)) txnIdVal = kvp.Value;
                    if (kvp.Key.Equals("FHRID", StringComparison.OrdinalIgnoreCase)) fhridVal = kvp.Value;
                }
                if (txnIdVal != null) orderedRow["TransactionID"] = txnIdVal;
                if (fhridVal != null) orderedRow["FHRID"] = fhridVal;

                renamedList.Add(orderedRow);



            }

            return Ok(new { success = true, totalCount, data = renamedList, formulas = formulaMap });
        }

        [HttpGet("TransactionList/Export")]
        public async Task<IActionResult> ExportTransactionList([FromQuery] int clientId, [FromQuery] int modelId, [FromQuery] string? locationId = null, [FromQuery] string? transactionRange = null, [FromQuery] string? vendorCode = null, [FromQuery] string? searchTerm = null)
        {
            var (_, list) = await _vendorRepository.GetVendorPaymentTransactionsListAsync(clientId, modelId, locationId, transactionRange, vendorCode, searchTerm, 1, 999999);

            var outputRenameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var formulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var stdColToDisplayName = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var templateConfigHeaderOrder = new List<string>();
            string finalClientName = "";
            string finalModelName = "";

            try
            {
                finalClientName = await _vendorRepository.GetClientNameAsync(clientId);
                finalModelName = await _vendorRepository.GetModelNameAsync(modelId);

                var configData = await _vendorRepository.GetVendorTemplateConfigAsync(clientId, modelId);
                foreach (var row in configData)
                {
                    var dict = (IDictionary<string, object>)row;
                    var stdCol = dict.ContainsKey("StandardDbColumn") ? Convert.ToString(dict["StandardDbColumn"]) ?? "" : "";
                    var excelHeader = dict.ContainsKey("ExcelHeaderName") ? Convert.ToString(dict["ExcelHeaderName"]) ?? "" : "";
                    var formula = dict.ContainsKey("FormulaDescription") ? Convert.ToString(dict["FormulaDescription"]) ?? "" : "";
                    stdColToDisplayName[stdCol] = excelHeader;
                    outputRenameMap[stdCol] = excelHeader;
                    if (!string.IsNullOrEmpty(excelHeader) && !templateConfigHeaderOrder.Contains(excelHeader)) templateConfigHeaderOrder.Add(excelHeader);
                    if (!string.IsNullOrEmpty(formula)) formulaMap[stdCol] = formula;
                }
            }
            catch { }

            string normClient = (finalClientName ?? "").ToLowerInvariant().Trim();
            string normModel = (finalModelName ?? "").ToLowerInvariant().Trim();

            bool isFlipkart = normClient.Contains("flipkart");
            bool isAmazon = normClient.Contains("amazon") || clientId == 316;
            bool isAirtel = normClient.Contains("airtel");
            bool isEbees = normClient.Contains("ebees") || normClient.Contains("xbees") || modelId == 7;
            bool isBlueDart = normClient.Contains("bluedart");
            bool isShiprocket = normClient.Contains("shiprocket");
            bool isMeesho = normClient.Contains("meesho");
            bool isHealthkart = normClient.Contains("healthkart");

            bool isFlipkartOdhMdh = (isFlipkart && (modelId == 1 || normModel.Contains("odh-mdh") || normModel.Contains("odh"))) || (!isAmazon && !isAirtel && !isEbees && modelId == 1);
            bool isFlipkartXrm = isFlipkart && (modelId == 2 || normModel.Contains("xrm"));
            bool isFlipkartLarge = isFlipkart && (modelId == 3 || normModel.Contains("large"));
            bool isFlipkartFm = isFlipkart && (modelId == 8 || normModel.Contains("fm") || normModel.Contains("variable"));

            bool isAmazonDsp = (isAmazon && (modelId == 4 || (normModel.Contains("dsp") && !normModel.Contains("edsp")))) || (modelId == 4 && !isFlipkart && !isAirtel);
            bool isAmazonEdsp = (isAmazon && (modelId == 5 || normModel.Contains("edsp"))) || (modelId == 5 && !isFlipkart && !isAirtel);

            bool isAirtelFse = isAirtel && (modelId == 6 || normModel.Contains("fse"));
            bool isEbeesVar = isEbees || modelId == 7 || normModel.Contains("variable(e)");
            bool isBlueDartVar = isBlueDart || modelId == 10 || normModel.Contains("variable(b)");
            bool isShiprocketVar = isShiprocket || modelId == 9 || normModel.Contains("variable(s)");
            bool isMeeshoVar = isMeesho || modelId == 11 || normModel.Contains("variable(m)");
            bool isHealthkartVar = isHealthkart || modelId == 12 || normModel.Contains("variable(h)");

            var resolvedFormulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var kv in formulaMap)
            {
                var resolved = kv.Value;
                foreach (var stdKv in stdColToDisplayName)
                    resolved = resolved.Replace("{" + stdKv.Key + "}", "[" + stdKv.Value + "]");

                if (stdColToDisplayName.ContainsKey(kv.Key))
                {
                    resolvedFormulaMap[stdColToDisplayName[kv.Key]] = resolved;
                }
                else
                {
                    resolvedFormulaMap[kv.Key] = resolved;
                }
            }
            formulaMap = new Dictionary<string, string>(resolvedFormulaMap, StringComparer.OrdinalIgnoreCase);

            var renamedList = new List<Dictionary<string, object>>();
            foreach (var rawRow in list)
            {
                var rawDict = (IDictionary<string, object>)rawRow;
                var renamedRow = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                foreach (var kvp in rawDict)
                {
                    var internalExclude = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                "TotalRows", "TotalRecords", "TransactionID", "UploadBatchID", "fk_cost_centre_id", "fk_model_id", "fk_rec_id",
                "ClientID", "ModelID", "LocationID", "CreatedBy", "CreatedDate", "IsProcessed", "fk_File_Id", "FHRID",
                "FromDate", "ToDate", "CycleName", "BudgetaryCode", "StateName", "Payment_Status", "Payment Status",
                "HR_Remark", "HR Remark", "Central_Remark", "Central Remark",
                "IsApproved", "ApprovedBy", "ApprovedByName", "ApprovedOn", "ApproverRemarks",
                "SyncedBy", "Synced_By", "Payment_ProcessedBy", "PaymentProcessedBy",
                "ResolvedSyncedByName", "ResolvedPaymentProcessedByName", "ResolvedRecoveryPolicyApplied"
            };
                    if (internalExclude.Contains(kvp.Key)) continue;

                    bool isPickupEnabled = outputRenameMap.ContainsKey("Pickup_Assigned") || outputRenameMap.ContainsKey("pickup_assigned") || outputRenameMap.Values.Contains("Pickup Assign");
                    var ebeesCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate", "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable" };
                    if (ebeesCols.Contains(kvp.Key) && !isPickupEnabled) continue;
                    var dedCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Ded_Shipment", "Ded_COD", "Ded_Other", "Ded_Arrear", "Ded_Insurance", "Ded_SD", "Ded_Welfare", "Ded_Hold", "Ded_KarmaLife" };
                    if (dedCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;
                    if (isFlipkartLarge && kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) continue;
                    var fmCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP", "Vehicle_Type", "Working_Days" };
                    if (fmCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;
                    // Hide Ebees-only columns (RTO, DTO, FM) for all non-Ebees models
                    if (!isEbeesVar)
                    {
                        var ebeesOnlyCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                    "RTO_Assigned", "RTO_Done", "RTO_Conversion_Percentage", "RTO_Applied_Rate", "RTO_Rate_Type", "RTO_Payable",
                    "DTO_Assigned", "DTO_Done", "DTO_Conversion_Percentage", "DTO_Applied_Rate", "DTO_Rate_Type", "DTO_Payable",
                    "FM_Assigned", "FM_Done", "FM_Conversion_Percentage", "FM_Applied_Rate", "FM_Rate_Type", "FM_Payable"
                };
                        if (ebeesOnlyCols.Contains(kvp.Key)) continue;
                    }

                    string displayKey = kvp.Key;

                    if (outputRenameMap.ContainsKey(kvp.Key))
                    {
                        displayKey = outputRenameMap[kvp.Key];
                    }
                    else if (kvp.Key.Equals("VendorCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Code";
                    else if (kvp.Key.Equals("VendorName", StringComparison.OrdinalIgnoreCase)) displayKey = "Name";
                    else if (kvp.Key.Equals("LocationName", StringComparison.OrdinalIgnoreCase)) displayKey = "Location";
                    else if (kvp.Key.Equals("FHRID", StringComparison.OrdinalIgnoreCase)) displayKey = "FHRID";
                    else if (kvp.Key.Equals("HubCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Hub code";
                    else if (kvp.Key.Equals("Working_Days", StringComparison.OrdinalIgnoreCase)) displayKey = "No. of Days";
                    else if (kvp.Key.Equals("Processing_Status", StringComparison.OrdinalIgnoreCase)) displayKey = "Processing Status";
                    else if (kvp.Key.Equals("System_Remarks", StringComparison.OrdinalIgnoreCase)) displayKey = "System Remarks";
                    else if (kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total OFD";
                    else if (kvp.Key.Equals("Delivered_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total Delivered";
                    else if (kvp.Key.Equals("Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Conversion %";
                    else if (kvp.Key.Equals("Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Applied BaseRate";
                    else if (kvp.Key.Equals("Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Rate Type";
                    else if (kvp.Key.Equals("Base_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Base payable";
                    else if (kvp.Key.Equals("GST_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Percentage";
                    else if (kvp.Key.Equals("GST_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Amount";
                    else if (kvp.Key.Equals("Total_Payable_After_GST", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Payable After GST";
                    else if (kvp.Key.Equals("TDS_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Percentage";
                    else if (kvp.Key.Equals("TDS_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Amount";
                    else if (kvp.Key.Equals("Net_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Net Payable";
                    else if (kvp.Key.Equals("Vendor_BankName", StringComparison.OrdinalIgnoreCase)) displayKey = "Bank Name";
                    else if (kvp.Key.Equals("Vendor_AccountNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Account No";
                    else if (kvp.Key.Equals("Vendor_IFSCCode", StringComparison.OrdinalIgnoreCase)) displayKey = "IFSC Code";
                    else if (kvp.Key.Equals("Vendor_PanNo", StringComparison.OrdinalIgnoreCase)) displayKey = "PAN No";
                    else if (kvp.Key.Equals("Vendor_AaddharNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Aadhar No";
                    else if (kvp.Key.Equals("Vendor_AccountHolderName", StringComparison.OrdinalIgnoreCase)) displayKey = "Account Holder Name";
                    else if (kvp.Key.Equals("TransactionRange", StringComparison.OrdinalIgnoreCase)) displayKey = "Date Range";
                    else if (kvp.Key.Equals("UploadedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Uploaded By";
                    else if (kvp.Key.Equals("Ded_Shipment", StringComparison.OrdinalIgnoreCase)) displayKey = "Deduction";
                    else if (kvp.Key.Equals("Ded_COD", StringComparison.OrdinalIgnoreCase)) displayKey = "COD Deduction";
                    else if (kvp.Key.Equals("Ded_Other", StringComparison.OrdinalIgnoreCase)) displayKey = "Other Deduction";
                    else if (kvp.Key.Equals("Ded_Arrear", StringComparison.OrdinalIgnoreCase)) displayKey = "Arrear";
                    else if (kvp.Key.Equals("Ded_Insurance", StringComparison.OrdinalIgnoreCase)) displayKey = "Insurance";
                    else if (kvp.Key.Equals("Ded_SD", StringComparison.OrdinalIgnoreCase)) displayKey = "SD";
                    else if (kvp.Key.Equals("Ded_Welfare", StringComparison.OrdinalIgnoreCase)) displayKey = "Welfare Deduction";
                    else if (kvp.Key.Equals("Ded_Hold", StringComparison.OrdinalIgnoreCase)) displayKey = "Hold";
                    else if (kvp.Key.Equals("Ded_KarmaLife", StringComparison.OrdinalIgnoreCase)) displayKey = "Karma Life Deduction";
                    else if (kvp.Key.Equals("Ded_Rent", StringComparison.OrdinalIgnoreCase)) displayKey = "Rent Deduction";
                    else if (kvp.Key.Equals("Ded_Advance", StringComparison.OrdinalIgnoreCase)) displayKey = "Advance Deduction";
                    else if (kvp.Key.Equals("Ded_TNT", StringComparison.OrdinalIgnoreCase)) displayKey = "TNT Deduction";
                    else if (kvp.Key.Equals("SR_LM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR LM Return";
                    else if (kvp.Key.Equals("SR_FM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR FM Return";
                    else if (kvp.Key.Equals("Assign_RVP_Normal", StringComparison.OrdinalIgnoreCase)) displayKey = "Assign RVP+Normal";
                    else if (kvp.Key.Equals("Total_Delivered_RVP_Shopsy", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Delivered+RVP+Shopsy";
                    else if (kvp.Key.Equals("FWD_RVP_Del_Wo_SR", StringComparison.OrdinalIgnoreCase)) displayKey = "FWD+RVP Del-W/o SR";
                    else if (kvp.Key.Equals("Delivery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Payable";
                    else if (kvp.Key.Equals("U2S_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate";
                    else if (kvp.Key.Equals("U2S_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate Type";
                    else if (kvp.Key.Equals("U2S_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Applied Rate";
                    else if (kvp.Key.Equals("U2S_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Payable";
                    else if (kvp.Key.Equals("Shopsy_RateDeduction", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateDeduction";
                    else if (kvp.Key.Equals("Shopsy_RateType", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Rate Type";
                    else if (kvp.Key.Equals("Shopsy_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateApplied";
                    else if (kvp.Key.Equals("Shopsy_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Payable";
                    else if (kvp.Key.Equals("Prexo_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate";
                    else if (kvp.Key.Equals("Prexo_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate Type";
                    else if (kvp.Key.Equals("Prexo_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Applied Rate";
                    else if (kvp.Key.Equals("Prexo_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Payable";
                    else if (kvp.Key.Equals("Grocery_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Assigned";
                    else if (kvp.Key.Equals("Grocery_Delivered", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Delivered";
                    else if (kvp.Key.Equals("Grocery_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Conversion %";
                    else if (kvp.Key.Equals("Grocery_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate";
                    else if (kvp.Key.Equals("Grocery_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate Type";
                    else if (kvp.Key.Equals("Grocery_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Applied Rate";
                    else if (kvp.Key.Equals("Grocery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Payable";
                    else if (kvp.Key.Equals("Pickup_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup %";
                    else if (kvp.Key.Equals("Pickup_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate";
                    else if (kvp.Key.Equals("Pickup_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate Type";
                    else if (kvp.Key.Equals("Pickup_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Payable";
                    else if (kvp.Key.Equals("Total_Assigned_FM_RVP", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Assigne FM+RVP";
                    else if (kvp.Key.Equals("Route", StringComparison.OrdinalIgnoreCase)) displayKey = "Route";
                    else if (kvp.Key.Equals("MFN_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Assign";
                    else if (kvp.Key.Equals("MFN_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Done";
                    else if (kvp.Key.Equals("MFN_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Conversion %";
                    else if (kvp.Key.Equals("MFN_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN RateType";
                    else if (kvp.Key.Equals("MFN_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN AppliedRate";
                    else if (kvp.Key.Equals("MFN_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Payable";
                    else if (kvp.Key.Equals("Van_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Van Rate";
                    else if (kvp.Key.Equals("Van_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Van RateType";
                    else if (kvp.Key.Equals("Van_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN AppliedRate";
                    else if (kvp.Key.Equals("PresentDays", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDays";
                    else if (kvp.Key.Equals("Van_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN Payable";
                    else if (kvp.Key.Equals("PresentDaysPayableRate", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayableRate";
                    else if (kvp.Key.Equals("PresentDaysPayable", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayable";
                    else if (kvp.Key.Equals("Special_Charge", StringComparison.OrdinalIgnoreCase)) displayKey = "SC";
                    // *** NEW: Incentive mappings ***
                    else if (kvp.Key.Equals("IncentivePackets", StringComparison.OrdinalIgnoreCase)) displayKey = "IncentivePackets";
                    else if (kvp.Key.Equals("Incentive_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Rate";
                    else if (kvp.Key.Equals("Incentive_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Applied Rate";
                    else if (kvp.Key.Equals("Incentive_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Incentive Payable";
                    else if (kvp.Key.Equals("CarryForwardDeficit_In", StringComparison.OrdinalIgnoreCase)) displayKey = "Brought-Fwd Deficit";
                    else if (kvp.Key.Equals("CarryForwardDeficit_Out", StringComparison.OrdinalIgnoreCase)) displayKey = "Carry-Fwd Deficit";
                    else if (kvp.Key.Equals("RecoveryPercent", StringComparison.OrdinalIgnoreCase)) displayKey = "Recovery Cap %";
                    else if (kvp.Key.Equals("IsDeductionsSynced", StringComparison.OrdinalIgnoreCase)) displayKey = "Deductions Synced";
                    else if (kvp.Key.Equals("Gross_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Gross Payable";
                    else if (kvp.Key.Equals("Total_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "totalPayable";
                    else if (kvp.Key.Equals("SyncedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Synced By";
                    else if (kvp.Key.Equals("Payment_ProcessedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Processed By";
                    else if (kvp.Key.Equals("RecoveryPolicyApplied", StringComparison.OrdinalIgnoreCase)) displayKey = "Recovery Policy Applied";
                    else if (kvp.Key.Equals("Payment_Date", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Date";
                    else if (kvp.Key.Equals("Payment_Mode", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Mode";
                    else if (kvp.Key.Equals("Payment_TransactionNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Transaction No";
                    else if (kvp.Key.Equals("Payment_BankName", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Bank Name";
                    else if (kvp.Key.Equals("Payment_AccountNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Account No";
                    else if (kvp.Key.Equals("Payment_Remarks", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Remarks";
                    else if (kvp.Key.Equals("Payment_BatchNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Batch No";
                    else if (kvp.Key.Equals("Payment_ProcessedDate", StringComparison.OrdinalIgnoreCase)) displayKey = "Payment Processed Date";

                    // HIDE irrelevant columns for ODH-MDH
                    if (isFlipkartOdhMdh)
                    {
                        var odhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Assigned_Volume", "Delivered_Volume", "Sum of Total OFD", "Sum of Total Delivered",
                            "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP",
                            "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate",
                            "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable", "Ded_Insurance", "Insurance",
                            "Vehicle_Type", "Shopsy_Rate_Type"
                        };
                        if (odhHideCols.Contains(kvp.Key) || odhHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE ODH-MDH specific columns for ALL OTHER models
                    if (!isFlipkartOdhMdh)
                    {
                        var nonOdhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "SR_LM_Return", "SR LM Return", "SR_FM_Return", "SR FM Return",
                            "Assign_RVP_Normal", "Assign RVP+Normal", "Total_Delivered_RVP_Shopsy", "Total Delivered+RVP+Shopsy",
                            "FWD_RVP_Del_Wo_SR", "FWD+RVP Del-W/o SR",
                            "U2S", "U2S_Rate", "U2S Rate", "U2S_Rate_Type", "U2S Rate Type", "U2S_Applied_Rate", "U2S Applied Rate", "U2S_Payable", "U2S Payable",
                            "Shopsy", "Shopsy_RateDeduction", "Shopsy RateDeduction", "Shopsy_RateType", "Shopsy_Rate_Type", "Shopsy Rate Type", "Shopsy_Applied_Rate", "Shopsy RateApplied", "Shopsy_Payable", "Shopsy Payable",
                            "Prexo", "Prexo_Rate", "Prexo Rate", "Prexo_Rate_Type", "Prexo Rate Type", "Prexo_Applied_Rate", "Prexo Applied Rate", "Prexo_Payable", "Prexo Payable",
                            "Grocery_Assigned", "Grocery Assigned", "Grocery_Delivered", "Grocery Delivered",
                            "Grocery_Conversion_Percentage", "Grocery Conversion %", "Grocery_Rate", "Grocery Rate",
                            "Grocery_Rate_Type", "Grocery Rate Type", "Grocery_Applied_Rate", "Grocery Applied Rate", "Grocery_Payable", "Grocery Payable",
                            "Ded_Rent", "Rent Deduction", "Ded_Advance", "Advance Deduction", "Ded_TNT", "TNT Deduction"
                        };
                        if (isAmazonDsp)
                        {
                            nonOdhHideCols.Remove("Ded_Advance");
                            nonOdhHideCols.Remove("Advance Deduction");
                        }
                        if (nonOdhHideCols.Contains(kvp.Key) || nonOdhHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE Amazon DSP / EDSP specific columns for other models (not Amazon DSP or EDSP)
                    if (!isAmazonDsp && !isAmazonEdsp)
                    {
                        var dspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Route", "MFN_Assigned", "MFN Assign", "MFN_Done", "MFN Done", "MFN  Done",
                            "MFN_Conversion_Percentage", "MFN Conversion %",
                            "MFN_Rate_Type", "MFN RateType", "MFN Rate Type", "MFN_Applied_Rate", "MFN AppliedRate", "MFN Applied Rate", "MFN_Payable", "MFN Payable",
                            "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
                            "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
                            "Special_Charge", "SC", "Total_Payable", "totalPayable"
                        };
                        if (dspHideCols.Contains(kvp.Key) || dspHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE DSP-only columns for EDSP (Model 5)
                    if (isAmazonEdsp)
                    {
                        var edspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Route", "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
                            "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
                            "Special_Charge", "SC", "Ded_Advance", "Advance Deduction",
                            "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
                            "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
                            "Ded_Insurance", "Insurance", "Ded_SD", "SD",
                            "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
                        };
                        if (edspHideCols.Contains(kvp.Key) || edspHideCols.Contains(displayKey)) continue;
                    }

                    // HIDE irrelevant columns for Amazon DSP (Model 4)
                    if (isAmazonDsp)
                    {
                        var dspSpecificHide = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
                            "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
                            "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
                            "Ded_Insurance", "Insurance", "Ded_SD", "SD",
                            "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
                        };
                        if (dspSpecificHide.Contains(kvp.Key) || dspSpecificHide.Contains(displayKey)) continue;
                    }

                    if ((displayKey.Equals("Incentive_Payable", StringComparison.OrdinalIgnoreCase) ||
                         displayKey.Equals("Incentive Payable", StringComparison.OrdinalIgnoreCase) ||
                         displayKey.Equals("Gross Payable", StringComparison.OrdinalIgnoreCase) ||
                         displayKey.Equals("Gross_Payable", StringComparison.OrdinalIgnoreCase)) &&
                        (kvp.Value == null || kvp.Value is DBNull))
                    {
                        renamedRow[displayKey] = 0.00m;
                    }
                    else if (displayKey.Equals("Synced By", StringComparison.OrdinalIgnoreCase))
                    {
                        var sVal = kvp.Value?.ToString()?.Trim();
                        rawDict.TryGetValue("IsDeductionsSynced", out var rawSync);
                        bool isDeductionSynced = rawSync is bool bSync ? bSync : (rawSync?.ToString() == "1" || rawSync?.ToString()?.Equals("true", StringComparison.OrdinalIgnoreCase) == true);

                        if (!isDeductionSynced)
                        {
                            renamedRow[displayKey] = null;
                        }
                        else if (rawDict.TryGetValue("ResolvedSyncedByName", out var resS) && resS != null && !string.IsNullOrWhiteSpace(resS.ToString()) && !resS.ToString()!.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = resS.ToString()!;
                        }
                        else if (!string.IsNullOrEmpty(sVal) && !sVal.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = sVal;
                        }
                        else
                        {
                            renamedRow[displayKey] = "Admin1";
                        }
                    }
                    else if (displayKey.Equals("Payment Processed By", StringComparison.OrdinalIgnoreCase))
                    {
                        var pVal = kvp.Value?.ToString()?.Trim();
                        rawDict.TryGetValue("Payment_Status", out var rawPayStatus);
                        rawDict.TryGetValue("Payment_ProcessedBy", out var rawProcBy);
                        rawDict.TryGetValue("Payment_Date", out var rawPayDate);
                        rawDict.TryGetValue("Payment_TransactionNo", out var rawPayTxnNo);

                        bool hasPaymentActivity = (rawPayStatus != null && (rawPayStatus.ToString() == "Paid" || rawPayStatus.ToString() == "Payment Done")) ||
                                                  (!string.IsNullOrWhiteSpace(rawProcBy?.ToString())) ||
                                                  (!string.IsNullOrWhiteSpace(pVal)) ||
                                                  (rawPayDate != null && !string.IsNullOrWhiteSpace(rawPayDate.ToString())) ||
                                                  (!string.IsNullOrWhiteSpace(rawPayTxnNo?.ToString()));

                        if (!hasPaymentActivity)
                        {
                            renamedRow[displayKey] = null;
                        }
                        else if (rawDict.TryGetValue("ResolvedPaymentProcessedByName", out var resP) && resP != null && !string.IsNullOrWhiteSpace(resP.ToString()) && !resP.ToString()!.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = resP.ToString()!;
                        }
                        else if (!string.IsNullOrEmpty(pVal) && !pVal.Equals("GU-21", StringComparison.OrdinalIgnoreCase))
                        {
                            renamedRow[displayKey] = pVal;
                        }
                        else
                        {
                            renamedRow[displayKey] = "Admin1";
                        }
                    }
                    else if (displayKey.Equals("Recovery Policy Applied", StringComparison.OrdinalIgnoreCase))
                    {
                        var rVal = kvp.Value?.ToString()?.Trim();
                        if (string.IsNullOrEmpty(rVal))
                        {
                            if (rawDict.TryGetValue("ResolvedRecoveryPolicyApplied", out var resR) && resR != null && !string.IsNullOrWhiteSpace(resR.ToString()))
                                renamedRow[displayKey] = resR.ToString()!;
                            else
                                renamedRow[displayKey] = null;
                        }
                        else
                        {
                            renamedRow[displayKey] = rVal;
                        }
                    }
                    else
                    {
                        renamedRow[displayKey] = kvp.Value;
                    }
                }

                // Compute and ensure Deficit & Recovery Cap columns are populated
                decimal totalPayableAfterGst = 0m;
                if (renamedRow.TryGetValue("Total Payable After GST", out var tpag) && tpag != null && decimal.TryParse(tpag.ToString(), out var pTpag)) totalPayableAfterGst = pTpag;
                else if (renamedRow.TryGetValue("TotalPayableAfterGST", out var tpag2) && tpag2 != null && decimal.TryParse(tpag2.ToString(), out var pTpag2)) totalPayableAfterGst = pTpag2;
                else if (rawDict.TryGetValue("Total_Payable_After_GST", out var tpag3) && tpag3 != null && decimal.TryParse(tpag3.ToString(), out var pTpag3)) totalPayableAfterGst = pTpag3;

                decimal tdsAmount = 0m;
                if (renamedRow.TryGetValue("TDS Amount", out var tds) && tds != null && decimal.TryParse(tds.ToString(), out var pTds)) tdsAmount = pTds;
                else if (renamedRow.TryGetValue("TDSAmount", out var tds2) && tds2 != null && decimal.TryParse(tds2.ToString(), out var pTds2)) tdsAmount = pTds2;
                else if (rawDict.TryGetValue("TDS_Amount", out var tds3) && tds3 != null && decimal.TryParse(tds3.ToString(), out var pTds3)) tdsAmount = pTds3;

                decimal recPercent = 100m;
                if (renamedRow.TryGetValue("Recovery Cap %", out var rp) && rp != null && decimal.TryParse(rp.ToString(), out var pRp)) recPercent = pRp;
                else if (rawDict.TryGetValue("RecoveryPercent", out var rp2) && rp2 != null && decimal.TryParse(rp2.ToString(), out var pRp2)) recPercent = pRp2;

                decimal availableEarnings = Math.Max(0m, totalPayableAfterGst - tdsAmount);
                decimal cappedRecoveryAmount = Math.Round(availableEarnings * (recPercent / 100.00m), 2);

                decimal bFwdDeficit = 0m;
                if (renamedRow.TryGetValue("Brought-Fwd Deficit", out var bfd) && bfd != null && decimal.TryParse(bfd.ToString(), out var pBfd)) bFwdDeficit = pBfd;
                else if (rawDict.TryGetValue("CarryForwardDeficit_In", out var bfd2) && bfd2 != null && decimal.TryParse(bfd2.ToString(), out var pBfd2)) bFwdDeficit = pBfd2;

                decimal cFwdDeficit = 0m;
                if (renamedRow.TryGetValue("Carry-Fwd Deficit", out var cfd) && cfd != null && decimal.TryParse(cfd.ToString(), out var pCfd)) cFwdDeficit = pCfd;
                else if (rawDict.TryGetValue("CarryForwardDeficit_Out", out var cfd2) && cfd2 != null && decimal.TryParse(cfd2.ToString(), out var pCfd2)) cFwdDeficit = pCfd2;

                bool isSynced = false;
                if (renamedRow.TryGetValue("Deductions Synced", out var syn) && syn != null)
                {
                    if (syn is bool b) isSynced = b;
                    else isSynced = syn.ToString() == "1" || syn.ToString().Equals("true", StringComparison.OrdinalIgnoreCase);
                }
                else if (rawDict.TryGetValue("IsDeductionsSynced", out var syn2) && syn2 != null)
                {
                    if (syn2 is bool b2) isSynced = b2;
                    else isSynced = syn2.ToString() == "1" || syn2.ToString().Equals("true", StringComparison.OrdinalIgnoreCase);
                }

                renamedRow["Brought-Fwd Deficit"] = bFwdDeficit;
                renamedRow["Recovery Cap %"] = recPercent;
                renamedRow["Capped Recovery Amount"] = cappedRecoveryAmount;
                renamedRow["Carry-Fwd Deficit"] = cFwdDeficit;
                renamedRow["Deductions Synced"] = isSynced;

                if (isSynced)
                {
                    if (!renamedRow.ContainsKey("Recovery Policy Applied") || renamedRow["Recovery Policy Applied"] == null || string.IsNullOrWhiteSpace(renamedRow["Recovery Policy Applied"]?.ToString()))
                    {
                        renamedRow["Recovery Policy Applied"] = "PRIORITY";
                    }
                    if (!renamedRow.ContainsKey("Synced By") || renamedRow["Synced By"] == null || renamedRow["Synced By"]?.ToString() == "GU-21" || string.IsNullOrWhiteSpace(renamedRow["Synced By"]?.ToString()))
                    {
                        renamedRow["Synced By"] = "Admin1";
                    }
                }
                else
                {
                    renamedRow["Synced By"] = null;
                }

                var orderedRow = OrderRowByCombo(renamedRow, isFlipkartOdhMdh, isAmazonDsp, isAmazonEdsp, isFlipkartXrm, isFlipkartLarge, isFlipkartFm, isAirtelFse, isEbeesVar, isBlueDartVar, isShiprocketVar, isMeeshoVar, isHealthkartVar);
                renamedList.Add(orderedRow);


            }

            using (var wb = new ClosedXML.Excel.XLWorkbook())
            {
                var summaryWs = wb.Worksheets.Add("Transaction List");
                int totalCount = renamedList.Count;

                summaryWs.Cell(1, 1).Value = "Client:";
                summaryWs.Cell(1, 1).Style.Font.Bold = true;
                summaryWs.Cell(1, 2).Value = finalClientName;
                summaryWs.Cell(1, 2).Style.Font.Bold = true;
                summaryWs.Cell(1, 2).Style.Font.FontColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253);
                summaryWs.Cell(1, 4).Value = "Model:";
                summaryWs.Cell(1, 4).Style.Font.Bold = true;
                summaryWs.Cell(1, 5).Value = finalModelName;
                summaryWs.Cell(1, 5).Style.Font.Bold = true;
                summaryWs.Cell(1, 5).Style.Font.FontColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253);

                int summaryHeaderRow = 3;
                summaryWs.Cell(summaryHeaderRow, 1).Value = "Sr. No";
                summaryWs.Cell(summaryHeaderRow, 1).Style.Font.Bold = true;
                summaryWs.Cell(summaryHeaderRow, 1).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(52, 58, 64);
                summaryWs.Cell(summaryHeaderRow, 1).Style.Font.FontColor = ClosedXML.Excel.XLColor.White;

                if (renamedList.Any())
                {
                    var excludeKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "TotalRows", "TransactionID", "UploadBatchID", "fk_cost_centre_id", "fk_model_id", "fk_rec_id", "ClientID", "ModelID", "LocationID", "CreatedBy", "CreatedDate", "IsProcessed", "fk_File_Id", "FHRID", "FromDate", "ToDate", "CycleName", "BudgetaryCode", "StateName", "Payment_Status", "HR_Remark", "Central_Remark" };
                    var keys = renamedList.First().Keys.Where(k => !excludeKeys.Contains(k)).ToList();

                    for (int c = 0; c < keys.Count; c++)
                    {
                        var cell = summaryWs.Cell(summaryHeaderRow, c + 2);
                        cell.Value = keys[c];
                        cell.Style.Font.Bold = true;
                        cell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(52, 58, 64);
                        cell.Style.Font.FontColor = ClosedXML.Excel.XLColor.White;
                    }

                    int formulaRow = summaryHeaderRow + 1;
                    summaryWs.Cell(formulaRow, 1).Value = "Formula:";
                    summaryWs.Cell(formulaRow, 1).Style.Font.Italic = true;
                    summaryWs.Cell(formulaRow, 1).Style.Font.FontColor = ClosedXML.Excel.XLColor.Gray;
                    for (int c = 0; c < keys.Count; c++)
                    {
                        if (formulaMap.ContainsKey(keys[c]))
                        {
                            var fCell = summaryWs.Cell(formulaRow, c + 2);
                            fCell.Value = formulaMap[keys[c]];
                            fCell.Style.Font.Italic = true;
                            fCell.Style.Font.FontColor = ClosedXML.Excel.XLColor.Gray;
                            fCell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(242, 242, 242);
                        }
                    }

                    int currRow = formulaRow + 1;
                    for (int r = 0; r < renamedList.Count; r++)
                    {
                        summaryWs.Cell(currRow, 1).Value = r + 1;
                        var rowDict = renamedList[r];
                        for (int c = 0; c < keys.Count; c++)
                        {
                            var cell = summaryWs.Cell(currRow, c + 2);
                            string keyName = keys[c];
                            var rawVal = rowDict.ContainsKey(keyName) ? rowDict[keyName] : null;

                            if (rawVal == null || rawVal == DBNull.Value)
                            {
                                cell.Value = "";
                            }
                            else
                            {
                                // FORCE these specific columns to always remain as Text (no lost leading zeros!)
                                bool isTextOnlyColumn =
                                    keyName.Contains("Account", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("Aadhar", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("PAN", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("IFSC", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("Code", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("Phone", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("Mobile", StringComparison.OrdinalIgnoreCase);

                                // Check if the column is meant to be formatted with 2 decimal places
                                bool requiresTwoDecimals =
                                    keyName.Contains("Payable", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("Amount", StringComparison.OrdinalIgnoreCase) ||
                                    keyName.Contains("Deficit", StringComparison.OrdinalIgnoreCase);

                                if (keyName.Contains("Cap %", StringComparison.OrdinalIgnoreCase) || keyName.Equals("Recovery Cap %", StringComparison.OrdinalIgnoreCase))
                                {
                                    if (decimal.TryParse(rawVal.ToString(), out decimal pVal))
                                    {
                                        cell.Value = pVal.ToString("0.##") + "%";
                                    }
                                    else
                                    {
                                        cell.Value = (rawVal.ToString()?.TrimEnd('%') ?? "") + "%";
                                    }
                                    cell.Style.Alignment.Horizontal = ClosedXML.Excel.XLAlignmentHorizontalValues.Center;
                                }
                                else if (keyName.Equals("Deductions Synced", StringComparison.OrdinalIgnoreCase))
                                {
                                    bool isSync = false;
                                    if (rawVal is bool b) isSync = b;
                                    else if (rawVal is int or short or byte or long) isSync = Convert.ToInt64(rawVal) == 1;
                                    else if (rawVal != null) isSync = rawVal.ToString() == "1" || rawVal.ToString().Equals("true", StringComparison.OrdinalIgnoreCase);
                                    cell.Value = isSync ? "Yes" : "No";
                                    cell.Style.Alignment.Horizontal = ClosedXML.Excel.XLAlignmentHorizontalValues.Center;
                                }
                                else if (isTextOnlyColumn)
                                {
                                    cell.Value = rawVal.ToString(); // Treat as text safely
                                }
                                else if (rawVal is sbyte or byte or short or ushort or int or uint or long or ulong or float or double or decimal)
                                {
                                    // It's a number from the database, assign as Number to Excel
                                    cell.Value = Convert.ToDouble(rawVal);

                                    // Apply 2-decimal formatting if applicable
                                    if (requiresTwoDecimals)
                                    {
                                        cell.Style.NumberFormat.Format = "0.00";
                                    }
                                }
                                else if (rawVal is DateTime dt)
                                {
                                    // It's a date
                                    cell.Value = dt;
                                }
                                else
                                {
                                    // Try parsing if some numeric data is accidentally stored as string in DB
                                    string strVal = rawVal.ToString() ?? "";
                                    if (decimal.TryParse(strVal, out decimal decVal))
                                    {
                                        cell.Value = decVal;

                                        // Apply 2-decimal formatting if applicable
                                        if (requiresTwoDecimals)
                                        {
                                            cell.Style.NumberFormat.Format = "0.00";
                                        }
                                    }
                                    else
                                    {
                                        cell.Value = strVal; // Fallback to normal text
                                    }
                                }
                            }
                        }
                        currRow++;
                    }
                    summaryWs.Columns().AdjustToContents();
                }

                using (var stream = new MemoryStream())
                {
                    wb.SaveAs(stream);
                    var outputContent = stream.ToArray();
                    return File(outputContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Transaction_List_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
                }
            }
        }


        //[HttpGet("TransactionList/Export")]
        //public async Task<IActionResult> ExportTransactionList([FromQuery] int clientId, [FromQuery] int modelId, [FromQuery] string? locationId = null, [FromQuery] string? transactionRange = null, [FromQuery] string? vendorCode = null, [FromQuery] string? searchTerm = null)
        //{
        //    var (_, list) = await _vendorRepository.GetVendorPaymentTransactionsListAsync(clientId, modelId, locationId, transactionRange, vendorCode, searchTerm, 1, 999999);

        //    var outputRenameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        //    var formulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        //    var stdColToDisplayName = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        //    var templateConfigHeaderOrder = new List<string>();
        //    string finalClientName = "";
        //    string finalModelName = "";

        //    try
        //    {
        //        finalClientName = await _vendorRepository.GetClientNameAsync(clientId);
        //        finalModelName = await _vendorRepository.GetModelNameAsync(modelId);

        //        var configData = await _vendorRepository.GetVendorTemplateConfigAsync(clientId, modelId);
        //        foreach (var row in configData)
        //        {
        //            var dict = (IDictionary<string, object>)row;
        //            var stdCol = dict.ContainsKey("StandardDbColumn") ? Convert.ToString(dict["StandardDbColumn"]) ?? "" : "";
        //            var excelHeader = dict.ContainsKey("ExcelHeaderName") ? Convert.ToString(dict["ExcelHeaderName"]) ?? "" : "";
        //            var formula = dict.ContainsKey("FormulaDescription") ? Convert.ToString(dict["FormulaDescription"]) ?? "" : "";
        //            stdColToDisplayName[stdCol] = excelHeader;
        //            outputRenameMap[stdCol] = excelHeader;
        //            if (!string.IsNullOrEmpty(excelHeader) && !templateConfigHeaderOrder.Contains(excelHeader)) templateConfigHeaderOrder.Add(excelHeader);
        //            if (!string.IsNullOrEmpty(formula)) formulaMap[stdCol] = formula;
        //        }
        //    }
        //    catch { }

        //    var resolvedFormulaMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        //    foreach (var kv in formulaMap)
        //    {
        //        var resolved = kv.Value;
        //        foreach (var stdKv in stdColToDisplayName)
        //            resolved = resolved.Replace("{" + stdKv.Key + "}", "[" + stdKv.Value + "]");

        //        if (stdColToDisplayName.ContainsKey(kv.Key))
        //        {
        //            resolvedFormulaMap[stdColToDisplayName[kv.Key]] = resolved;
        //        }
        //        else
        //        {
        //            resolvedFormulaMap[kv.Key] = resolved;
        //        }
        //    }
        //    formulaMap = new Dictionary<string, string>(resolvedFormulaMap, StringComparer.OrdinalIgnoreCase);

        //    var renamedList = new List<Dictionary<string, object>>();
        //    foreach (var rawRow in list)
        //    {
        //        var rawDict = (IDictionary<string, object>)rawRow;
        //        var renamedRow = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        //        foreach (var kvp in rawDict)
        //        {
        //            var internalExclude = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
        //                "TotalRows", "TotalRecords", "TransactionID", "UploadBatchID", "fk_cost_centre_id", "fk_model_id", "fk_rec_id",
        //                "ClientID", "ModelID", "LocationID", "CreatedBy", "CreatedDate", "IsProcessed", "fk_File_Id", "FHRID",
        //                "FromDate", "ToDate", "CycleName", "BudgetaryCode", "StateName", "Payment_Status", "Payment Status",
        //                "HR_Remark", "HR Remark", "Central_Remark", "Central Remark",
        //                "IsApproved", "ApprovedBy"
        //            };
        //            if (internalExclude.Contains(kvp.Key)) continue;

        //            bool isPickupEnabled = outputRenameMap.ContainsKey("Pickup_Assigned") || outputRenameMap.ContainsKey("pickup_assigned") || outputRenameMap.Values.Contains("Pickup Assign");
        //            var ebeesCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate", "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable" };
        //            if (ebeesCols.Contains(kvp.Key) && !isPickupEnabled) continue;
        //            var dedCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Ded_Shipment", "Ded_COD", "Ded_Other", "Ded_Arrear", "Ded_Insurance", "Ded_SD", "Ded_Welfare", "Ded_Hold", "Ded_KarmaLife" };
        //            if (dedCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;
        //            if (modelId != null && modelId.ToString() == "3" && kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) continue;
        //            var fmCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP", "Vehicle_Type", "Working_Days" };
        //            if (fmCols.Contains(kvp.Key) && !outputRenameMap.ContainsKey(kvp.Key)) continue;
        //            // Hide Ebees-only columns (RTO, DTO, FM) for all non-Ebees models
        //            if (modelId.ToString() != "7")
        //            {
        //                var ebeesOnlyCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
        //                    "RTO_Assigned", "RTO_Done", "RTO_Conversion_Percentage", "RTO_Applied_Rate", "RTO_Rate_Type", "RTO_Payable",
        //                    "DTO_Assigned", "DTO_Done", "DTO_Conversion_Percentage", "DTO_Applied_Rate", "DTO_Rate_Type", "DTO_Payable",
        //                    "FM_Assigned", "FM_Done", "FM_Conversion_Percentage", "FM_Applied_Rate", "FM_Rate_Type", "FM_Payable"
        //                };
        //                if (ebeesOnlyCols.Contains(kvp.Key)) continue;
        //            }

        //            string displayKey = kvp.Key;

        //            if (outputRenameMap.ContainsKey(kvp.Key))
        //            {
        //                displayKey = outputRenameMap[kvp.Key];
        //            }
        //            else if (kvp.Key.Equals("VendorCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Code";
        //            else if (kvp.Key.Equals("VendorName", StringComparison.OrdinalIgnoreCase)) displayKey = "Name";
        //            else if (kvp.Key.Equals("LocationName", StringComparison.OrdinalIgnoreCase)) displayKey = "Location";
        //            else if (kvp.Key.Equals("FHRID", StringComparison.OrdinalIgnoreCase)) displayKey = "FHRID";
        //            else if (kvp.Key.Equals("HubCode", StringComparison.OrdinalIgnoreCase)) displayKey = "Hub code";
        //            else if (kvp.Key.Equals("Working_Days", StringComparison.OrdinalIgnoreCase)) displayKey = "No. of Days";
        //            else if (kvp.Key.Equals("Processing_Status", StringComparison.OrdinalIgnoreCase)) displayKey = "Processing Status";
        //            else if (kvp.Key.Equals("System_Remarks", StringComparison.OrdinalIgnoreCase)) displayKey = "System Remarks";
        //            else if (kvp.Key.Equals("Assigned_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total OFD";
        //            else if (kvp.Key.Equals("Delivered_Volume", StringComparison.OrdinalIgnoreCase)) displayKey = "Sum of Total Delivered";
        //            else if (kvp.Key.Equals("Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Conversion %";
        //            else if (kvp.Key.Equals("Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Applied BaseRate";
        //            else if (kvp.Key.Equals("Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Rate Type";
        //            else if (kvp.Key.Equals("Base_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Base payable";
        //            else if (kvp.Key.Equals("GST_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Percentage";
        //            else if (kvp.Key.Equals("GST_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "GST Amount";
        //            else if (kvp.Key.Equals("Total_Payable_After_GST", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Payable After GST";
        //            else if (kvp.Key.Equals("TDS_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Percentage";
        //            else if (kvp.Key.Equals("TDS_Amount", StringComparison.OrdinalIgnoreCase)) displayKey = "TDS Amount";
        //            else if (kvp.Key.Equals("Net_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Net Payable";
        //            else if (kvp.Key.Equals("Vendor_BankName", StringComparison.OrdinalIgnoreCase)) displayKey = "Bank Name";
        //            else if (kvp.Key.Equals("Vendor_AccountNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Account No";
        //            else if (kvp.Key.Equals("Vendor_IFSCCode", StringComparison.OrdinalIgnoreCase)) displayKey = "IFSC Code";
        //            else if (kvp.Key.Equals("Vendor_PanNo", StringComparison.OrdinalIgnoreCase)) displayKey = "PAN No";
        //            else if (kvp.Key.Equals("Vendor_AaddharNo", StringComparison.OrdinalIgnoreCase)) displayKey = "Aadhar No";
        //            else if (kvp.Key.Equals("Vendor_AccountHolderName", StringComparison.OrdinalIgnoreCase)) displayKey = "Account Holder Name";
        //            else if (kvp.Key.Equals("TransactionRange", StringComparison.OrdinalIgnoreCase)) displayKey = "Date Range";
        //            else if (kvp.Key.Equals("UploadedByName", StringComparison.OrdinalIgnoreCase)) displayKey = "Uploaded By";
        //            else if (kvp.Key.Equals("Ded_Shipment", StringComparison.OrdinalIgnoreCase)) displayKey = "Deduction";
        //            else if (kvp.Key.Equals("Ded_COD", StringComparison.OrdinalIgnoreCase)) displayKey = "COD Deduction";
        //            else if (kvp.Key.Equals("Ded_Other", StringComparison.OrdinalIgnoreCase)) displayKey = "Other Deduction";
        //            else if (kvp.Key.Equals("Ded_Arrear", StringComparison.OrdinalIgnoreCase)) displayKey = "Arrear";
        //            else if (kvp.Key.Equals("Ded_Insurance", StringComparison.OrdinalIgnoreCase)) displayKey = "Insurance";
        //            else if (kvp.Key.Equals("Ded_SD", StringComparison.OrdinalIgnoreCase)) displayKey = "SD";
        //            else if (kvp.Key.Equals("Ded_Welfare", StringComparison.OrdinalIgnoreCase)) displayKey = "Welfare Deduction";
        //            else if (kvp.Key.Equals("Ded_Hold", StringComparison.OrdinalIgnoreCase)) displayKey = "Hold";
        //            else if (kvp.Key.Equals("Ded_KarmaLife", StringComparison.OrdinalIgnoreCase)) displayKey = "Karma Life Deduction";
        //            else if (kvp.Key.Equals("Ded_Rent", StringComparison.OrdinalIgnoreCase)) displayKey = "Rent Deduction";
        //            else if (kvp.Key.Equals("Ded_Advance", StringComparison.OrdinalIgnoreCase)) displayKey = "Advance Deduction";
        //            else if (kvp.Key.Equals("Ded_TNT", StringComparison.OrdinalIgnoreCase)) displayKey = "TNT Deduction";
        //            else if (kvp.Key.Equals("SR_LM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR LM Return";
        //            else if (kvp.Key.Equals("SR_FM_Return", StringComparison.OrdinalIgnoreCase)) displayKey = "SR FM Return";
        //            else if (kvp.Key.Equals("Assign_RVP_Normal", StringComparison.OrdinalIgnoreCase)) displayKey = "Assign RVP+Normal";
        //            else if (kvp.Key.Equals("Total_Delivered_RVP_Shopsy", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Delivered+RVP+Shopsy";
        //            else if (kvp.Key.Equals("FWD_RVP_Del_Wo_SR", StringComparison.OrdinalIgnoreCase)) displayKey = "FWD+RVP Del-W/o SR";
        //            else if (kvp.Key.Equals("Delivery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Payable";
        //            else if (kvp.Key.Equals("U2S_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate";
        //            else if (kvp.Key.Equals("U2S_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Rate Type";
        //            else if (kvp.Key.Equals("U2S_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Applied Rate";
        //            else if (kvp.Key.Equals("U2S_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "U2S Payable";
        //            else if (kvp.Key.Equals("Shopsy_RateDeduction", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateDeduction";
        //            else if (kvp.Key.Equals("Shopsy_RateType", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Rate Type";
        //            else if (kvp.Key.Equals("Shopsy_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy RateApplied";
        //            else if (kvp.Key.Equals("Shopsy_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Shopsy Payable";
        //            else if (kvp.Key.Equals("Prexo_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate";
        //            else if (kvp.Key.Equals("Prexo_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Rate Type";
        //            else if (kvp.Key.Equals("Prexo_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Applied Rate";
        //            else if (kvp.Key.Equals("Prexo_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Prexo Payable";
        //            else if (kvp.Key.Equals("Grocery_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Assigned";
        //            else if (kvp.Key.Equals("Grocery_Delivered", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Delivered";
        //            else if (kvp.Key.Equals("Grocery_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Conversion %";
        //            else if (kvp.Key.Equals("Grocery_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate";
        //            else if (kvp.Key.Equals("Grocery_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Rate Type";
        //            else if (kvp.Key.Equals("Grocery_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Applied Rate";
        //            else if (kvp.Key.Equals("Grocery_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Grocery Payable";
        //            else if (kvp.Key.Equals("Pickup_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup %";
        //            else if (kvp.Key.Equals("Pickup_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate";
        //            else if (kvp.Key.Equals("Pickup_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Rate Type";
        //            else if (kvp.Key.Equals("Pickup_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "Pickup Payable";
        //            else if (kvp.Key.Equals("Total_Assigned_FM_RVP", StringComparison.OrdinalIgnoreCase)) displayKey = "Total Assigne FM+RVP";
        //            else if (kvp.Key.Equals("Route", StringComparison.OrdinalIgnoreCase)) displayKey = "Route";
        //            else if (kvp.Key.Equals("MFN_Assigned", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Assign";
        //            else if (kvp.Key.Equals("MFN_Done", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Done";
        //            else if (kvp.Key.Equals("MFN_Conversion_Percentage", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Conversion %";
        //            else if (kvp.Key.Equals("MFN_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN RateType";
        //            else if (kvp.Key.Equals("MFN_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN AppliedRate";
        //            else if (kvp.Key.Equals("MFN_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "MFN Payable";
        //            else if (kvp.Key.Equals("Van_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "Van Rate";
        //            else if (kvp.Key.Equals("Van_Rate_Type", StringComparison.OrdinalIgnoreCase)) displayKey = "Van RateType";
        //            else if (kvp.Key.Equals("Van_Applied_Rate", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN AppliedRate";
        //            else if (kvp.Key.Equals("PresentDays", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDays";
        //            else if (kvp.Key.Equals("Van_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "VAN Payable";
        //            else if (kvp.Key.Equals("PresentDaysPayableRate", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayableRate";
        //            else if (kvp.Key.Equals("PresentDaysPayable", StringComparison.OrdinalIgnoreCase)) displayKey = "PresentDaysPayable";
        //            else if (kvp.Key.Equals("Special_Charge", StringComparison.OrdinalIgnoreCase)) displayKey = "SC";
        //            else if (kvp.Key.Equals("Total_Payable", StringComparison.OrdinalIgnoreCase)) displayKey = "totalPayable";

        //            // HIDE irrelevant columns for ODH-MDH (ModelId = 1)
        //            if (modelId.ToString() == "1")
        //            {
        //                var odhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
        //                    "Assigned_Volume", "Delivered_Volume", "Sum of Total OFD", "Sum of Total Delivered",
        //                    "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Assigned_RVP", "Delivered_RVP",
        //                    "Pickup_Assigned", "Pickup_Done", "Pickup_Conversion_Percentage", "Pickup_Applied_Rate",
        //                    "Pickup_Rate_Type", "Delivery_Payable", "Pickup_Payable", "Ded_Insurance", "Insurance",
        //                    "Vehicle_Type", "Shopsy_Rate_Type"
        //                };
        //                if (odhHideCols.Contains(kvp.Key) || odhHideCols.Contains(displayKey)) continue;
        //            }

        //            // HIDE ODH-MDH specific columns for ALL OTHER models
        //            if (modelId.ToString() != "1")
        //            {
        //                var nonOdhHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
        //                    "SR_LM_Return", "SR LM Return", "SR_FM_Return", "SR FM Return",
        //                    "Assign_RVP_Normal", "Assign RVP+Normal", "Total_Delivered_RVP_Shopsy", "Total Delivered+RVP+Shopsy",
        //                    "FWD_RVP_Del_Wo_SR", "FWD+RVP Del-W/o SR",
        //                    "U2S", "U2S_Rate", "U2S Rate", "U2S_Rate_Type", "U2S Rate Type", "U2S_Applied_Rate", "U2S Applied Rate", "U2S_Payable", "U2S Payable",
        //                    "Shopsy", "Shopsy_RateDeduction", "Shopsy RateDeduction", "Shopsy_RateType", "Shopsy_Rate_Type", "Shopsy Rate Type", "Shopsy_Applied_Rate", "Shopsy RateApplied", "Shopsy_Payable", "Shopsy Payable",
        //                    "Prexo", "Prexo_Rate", "Prexo Rate", "Prexo_Rate_Type", "Prexo Rate Type", "Prexo_Applied_Rate", "Prexo Applied Rate", "Prexo_Payable", "Prexo Payable",
        //                    "Grocery_Assigned", "Grocery Assigned", "Grocery_Delivered", "Grocery Delivered",
        //                    "Grocery_Conversion_Percentage", "Grocery Conversion %", "Grocery_Rate", "Grocery Rate",
        //                    "Grocery_Rate_Type", "Grocery Rate Type", "Grocery_Applied_Rate", "Grocery Applied Rate", "Grocery_Payable", "Grocery Payable",
        //                    "Ded_Rent", "Rent Deduction", "Ded_Advance", "Advance Deduction", "Ded_TNT", "TNT Deduction"
        //                };
        //                if (modelId.ToString() == "4")
        //                {
        //                    nonOdhHideCols.Remove("Ded_Advance");
        //                    nonOdhHideCols.Remove("Advance Deduction");
        //                }
        //                if (nonOdhHideCols.Contains(kvp.Key) || nonOdhHideCols.Contains(displayKey)) continue;
        //            }

        //            // HIDE Amazon DSP / EDSP specific columns for other models (not model 4 or 5)
        //            if (modelId.ToString() != "4" && modelId.ToString() != "5")
        //            {
        //                var dspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
        //                    "Route", "MFN_Assigned", "MFN Assign", "MFN_Done", "MFN Done", "MFN  Done",
        //                    "MFN_Conversion_Percentage", "MFN Conversion %",
        //                    "MFN_Rate_Type", "MFN RateType", "MFN Rate Type", "MFN_Applied_Rate", "MFN AppliedRate", "MFN Applied Rate", "MFN_Payable", "MFN Payable",
        //                    "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
        //                    "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
        //                    "Special_Charge", "SC", "Total_Payable", "totalPayable"
        //                };
        //                if (dspHideCols.Contains(kvp.Key) || dspHideCols.Contains(displayKey)) continue;
        //            }

        //            // HIDE DSP-only columns for EDSP (Model 5)
        //            if (modelId.ToString() == "5")
        //            {
        //                var edspHideCols = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
        //                    "Route", "Van_Rate", "Van Rate", "Van_Rate_Type", "Van RateType", "Van Rate Type", "Van_Applied_Rate", "VAN AppliedRate", "Van Applied Rate", "Van_Payable", "VAN Payable",
        //                    "PresentDays", "PresentDaysPayableRate", "PresentDaysPayable",
        //                    "Special_Charge", "SC", "Ded_Advance", "Advance Deduction",
        //                    "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
        //                    "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
        //                    "Ded_Insurance", "Insurance", "Ded_SD", "SD",
        //                    "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
        //                };
        //                if (edspHideCols.Contains(kvp.Key) || edspHideCols.Contains(displayKey)) continue;
        //            }

        //            // HIDE irrelevant columns for Amazon DSP (Model 4)
        //            if (modelId.ToString() == "4")
        //            {
        //                var dspSpecificHide = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase) {
        //                    "Assigned_RVP", "Delivered_RVP", "Total_Assigned_FM_RVP", "Total_Delivered_FM_RVP", "Total Assigne FM+RVP", "Total Delivered FM+RVP",
        //                    "Ded_Rent", "Rent Deduction", "Ded_TNT", "TNT Deduction",
        //                    "Ded_Insurance", "Insurance", "Ded_SD", "SD",
        //                    "Working_Days", "No. of Days", "Delivery_Payable", "Payable"
        //                };
        //                if (dspSpecificHide.Contains(kvp.Key) || dspSpecificHide.Contains(displayKey)) continue;
        //            }

        //            renamedRow[displayKey] = kvp.Value;
        //        }

        //        var orderedRow = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
        //        if (modelId.ToString() == "1")
        //        {
        //            var prefOrder = new string[] {
        //                        "Processing Status", "System Remarks",
        //                        "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "No. of Days",
        //                        "SR LM Return", "SR FM Return", "Assign RVP+Normal", "Total Delivered+RVP+Shopsy", "FWD+RVP Del-W/o SR", "Conversion %",
        //                        "Rate Type", "Applied BaseRate", "Payable",
        //                        "U2S", "U2S Rate", "U2S Rate Type", "U2S Applied Rate", "U2S Payable",
        //                        "Shopsy", "Shopsy Rate Type", "Shopsy RateDeduction", "Shopsy RateApplied", "Shopsy Payable",
        //                        "Prexo", "Prexo Rate", "Prexo Rate Type", "Prexo Applied Rate", "Prexo Payable",
        //                        "Grocery Assigned", "Grocery Delivered", "Grocery Conversion %", "Grocery Rate", "Grocery Rate Type", "Grocery Applied Rate", "Grocery Payable",
        //                        "Base payable", "Shipment Deduction", "COD Deduction", "Other Deduction", "Rent Deduction", "Advance Deduction", "Hold", "Karma Life Deduction", "Arrear", "SD", "TNT Deduction", "Welfare Deduction",
        //                        "GST Percentage", "GST Amount", "Total Payable After GST", "TDS Percentage", "TDS Amount", "Net Payable",
        //                        "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By"
        //                    };
        //            foreach (var k in prefOrder)
        //            {
        //                if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k];
        //            }
        //            foreach (var kv in renamedRow)
        //            {
        //                if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value;
        //            }
        //        }
        //        else if (modelId.ToString() == "4")
        //        {
        //            var dspOrder = new string[] {
        //                        "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "Route", "Vehicle Type",
        //                        "Total OFD", "Total Delivered", "Conversion %", "Applied_Rate", "Rate_Type", "Base Payable",
        //                        "Pickup Assign", "Pickup Done", "Pickup Conversion%", "Pickup RateType", "Pickup AppliedRate", "Pickup Payable",
        //                        "MFN Assign", "MFN Done", "MFN Conversion %", "MFN RateType", "MFN AppliedRate", "MFN Payable",
        //                        "Van Rate", "Van RateType", "VAN AppliedRate", "PresentDays", "VAN Payable",
        //                        "PresentDaysPayableRate", "PresentDaysPayable", "SC", "totalPayable",
        //                        "gst%", "GstAmount", "TotalPayableAfterGST", "TDS%", "TDSAmount",
        //                        "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear", "Hold", "Karmalife Deduction", "Welfare Deduction", "Advance Deduction", "net payable",
        //                        "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By"
        //                    };
        //            foreach (var k in dspOrder)
        //            {
        //                if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k];
        //            }
        //        }
        //        else if (modelId.ToString() == "5")
        //        {
        //            var edspOrder = new string[] {
        //                        "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "Vehicle Type",
        //                        "Total OFD", "Total Delivered", "Conversion %", "Applied_Rate", "Rate_Type", "Base Payable",
        //                        "Pickup Assign", "Pickup Done", "Pickup Conversion%", "Pickup RateType", "Pickup AppliedRate", "Pickup Payable",
        //                        "MFN Assign", "MFN Done", "MFN Conversion %", "MFN RateType", "MFN AppliedRate", "MFN Payable",
        //                        "totalPayable",
        //                        "gst%", "GstAmount", "TotalPayableAfterGST", "TDS%", "TDSAmount",
        //                        "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear", "Hold", "Karmalife Deduction", "Welfare Deduction", "net payable",
        //                        "Bank Name", "Account No", "IFSC Code", "PAN No", "Aadhar No", "Account Holder Name", "Date Range", "Uploaded By"
        //                    };
        //            foreach (var k in edspOrder)
        //            {
        //                if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k];
        //            }
        //        }
        //        else if (modelId.ToString() == "7")
        //        {
        //            var ebeesOrder = new string[] {
        //                        "Processing Status", "System Remarks",
        //                        "Code", "VendorCode", "Name", "VendorName", "Location", "LocationName", "FHRID", "FHRID", "AreaManager", "Hub code", "HubCode",
        //                        "Sum of Total OFD", "Assigned_Volume", "OFD",
        //                        "Sum of Total Delivered", "Delivered_Volume", "Delivered",
        //                        "Conversion %", "Conversion_Percentage",
        //                        "Applied BaseRate", "Applied_Rate", "Applied Rate",
        //                        "Rate Type", "Rate_Type",

        //                        "Delivery Payable", "Delivery_Payable", "Payable",

        //                        "RTO Assign", "RTO_Assigned", "RTO Done", "RTO_Done", "RTO %", "RTO_Conversion_Percentage", "RTO Rate", "RTO_Applied_Rate", "RTO Rate Type", "RTO_Rate_Type", "RTO Payable", "RTO_Payable",
        //                        "DTO Assign", "DTO_Assigned", "DTO Done", "DTO_Done", "DTO %", "DTO_Conversion_Percentage", "DTO Rate", "DTO_Applied_Rate", "DTO Rate Type", "DTO_Rate_Type", "DTO Payable", "DTO_Payable",
        //                        "FM Assign", "FM_Assigned", "FM Done", "FM_Done", "FM %", "FM_Conversion_Percentage", "FM Rate", "FM_Applied_Rate", "FM Rate Type", "FM_Rate_Type", "FM Payable", "FM_Payable",

        //                        "Pickup Assign", "Pickup_Assigned", "Pickup Done", "Pickup_Done", "Pickup %", "Pickup_Conversion_Percentage", "Pickup Rate", "Pickup_Applied_Rate", "Pickup Rate Type", "Pickup_Rate_Type", "Pickup Payable", "Pickup_Payable",

        //                        "Base payable", "Base_Payable", "Base Payable",

        //                        "Deduction", "Ded_Shipment", "COD Deduction", "Ded_COD", "Other Deduction", "Ded_Other", "Arrear", "Ded_Arrear", "Insurance", "Ded_Insurance", "SD", "Ded_SD", "Welfare Deduction", "Ded_Welfare", "Hold", "Ded_Hold", "Karma Life Deduction", "Ded_KarmaLife", "Rent Deduction", "Ded_Rent", "Advance Deduction", "Ded_Advance", "TNT Deduction", "Ded_TNT",

        //                        "GST Percentage", "GST_Percentage", "GST Amount", "GST_Amount", "Total Payable After GST", "Total_Payable_After_GST", "TDS Percentage", "TDS_Percentage", "TDS Amount", "TDS_Amount", "Net Payable", "Net_Payable",

        //                        "Bank Name", "Vendor_BankName", "Account No", "Vendor_AccountNo", "IFSC Code", "Vendor_IFSCCode", "PAN No", "Vendor_PanNo", "Aadhar No", "Vendor_AaddharNo", "Account Holder Name", "Vendor_AccountHolderName", "Date Range", "TransactionRange", "Uploaded By", "UploadedByName"
        //                    };
        //            foreach (var k in ebeesOrder)
        //            {
        //                if (renamedRow.ContainsKey(k)) orderedRow[k] = renamedRow[k];
        //            }
        //            foreach (var kv in renamedRow)
        //            {
        //                if (!orderedRow.ContainsKey(kv.Key)) orderedRow[kv.Key] = kv.Value;
        //            }
        //        }
        //        else
        //        {
        //            var metaCols = new string[] { "Processing Status", "System Remarks" };
        //            foreach (var m in metaCols) { if (renamedRow.ContainsKey(m)) orderedRow[m] = renamedRow[m]; }

        //            var tempDict = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
        //            foreach (var kv in renamedRow) { if (!orderedRow.ContainsKey(kv.Key)) tempDict[kv.Key] = kv.Value; }

        //            var incCols = new string[] { "IncentivePackets", "Incentive Rate", "Incentive Rate Type", "Incentive_Applied_Rate", "Incentive_Payable", "Gross Payable" };

        //            foreach (var kv in tempDict)
        //            {
        //                if (Array.Exists(incCols, c => c.Equals(kv.Key, StringComparison.OrdinalIgnoreCase))) continue;
        //                orderedRow[kv.Key] = kv.Value;

        //                if (kv.Key.Equals("Base Payable", StringComparison.OrdinalIgnoreCase) || kv.Key.Equals("Payable", StringComparison.OrdinalIgnoreCase))
        //                {
        //                    foreach (var c in incCols) if (tempDict.ContainsKey(c)) orderedRow[c] = tempDict[c];
        //                }
        //            }
        //            foreach (var c in incCols) if (tempDict.ContainsKey(c) && !orderedRow.ContainsKey(c)) orderedRow[c] = tempDict[c];
        //        }
        //        renamedList.Add(orderedRow);


        //    }

        //    using (var wb = new ClosedXML.Excel.XLWorkbook())
        //    {
        //        var summaryWs = wb.Worksheets.Add("Transaction List");
        //        int totalCount = renamedList.Count;

        //        summaryWs.Cell(1, 1).Value = "Client:";
        //        summaryWs.Cell(1, 1).Style.Font.Bold = true;
        //        summaryWs.Cell(1, 2).Value = finalClientName;
        //        summaryWs.Cell(1, 2).Style.Font.Bold = true;
        //        summaryWs.Cell(1, 2).Style.Font.FontColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253);
        //        summaryWs.Cell(1, 4).Value = "Model:";
        //        summaryWs.Cell(1, 4).Style.Font.Bold = true;
        //        summaryWs.Cell(1, 5).Value = finalModelName;
        //        summaryWs.Cell(1, 5).Style.Font.Bold = true;
        //        summaryWs.Cell(1, 5).Style.Font.FontColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253);

        //        int summaryHeaderRow = 3;
        //        summaryWs.Cell(summaryHeaderRow, 1).Value = "Sr. No";
        //        summaryWs.Cell(summaryHeaderRow, 1).Style.Font.Bold = true;
        //        summaryWs.Cell(summaryHeaderRow, 1).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(52, 58, 64);
        //        summaryWs.Cell(summaryHeaderRow, 1).Style.Font.FontColor = ClosedXML.Excel.XLColor.White;

        //        if (renamedList.Any())
        //        {
        //            var excludeKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "TotalRows", "TransactionID", "UploadBatchID", "fk_cost_centre_id", "fk_model_id", "fk_rec_id", "ClientID", "ModelID", "LocationID", "CreatedBy", "CreatedDate", "IsProcessed", "fk_File_Id", "FHRID", "FromDate", "ToDate", "CycleName", "BudgetaryCode", "StateName", "Payment_Status", "HR_Remark", "Central_Remark" };
        //            var keys = renamedList.First().Keys.Where(k => !excludeKeys.Contains(k)).ToList();

        //            for (int c = 0; c < keys.Count; c++)
        //            {
        //                var cell = summaryWs.Cell(summaryHeaderRow, c + 2);
        //                cell.Value = keys[c];
        //                cell.Style.Font.Bold = true;
        //                cell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(52, 58, 64);
        //                cell.Style.Font.FontColor = ClosedXML.Excel.XLColor.White;
        //            }

        //            int formulaRow = summaryHeaderRow + 1;
        //            summaryWs.Cell(formulaRow, 1).Value = "Formula:";
        //            summaryWs.Cell(formulaRow, 1).Style.Font.Italic = true;
        //            summaryWs.Cell(formulaRow, 1).Style.Font.FontColor = ClosedXML.Excel.XLColor.Gray;
        //            for (int c = 0; c < keys.Count; c++)
        //            {
        //                if (formulaMap.ContainsKey(keys[c]))
        //                {
        //                    var fCell = summaryWs.Cell(formulaRow, c + 2);
        //                    fCell.Value = formulaMap[keys[c]];
        //                    fCell.Style.Font.Italic = true;
        //                    fCell.Style.Font.FontColor = ClosedXML.Excel.XLColor.Gray;
        //                    fCell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(242, 242, 242);
        //                }
        //            }

        //            int currRow = formulaRow + 1;
        //            for (int r = 0; r < renamedList.Count; r++)
        //            {
        //                summaryWs.Cell(currRow, 1).Value = r + 1;
        //                var rowDict = renamedList[r];
        //                for (int c = 0; c < keys.Count; c++)
        //                {
        //                    var val = rowDict.ContainsKey(keys[c]) ? rowDict[keys[c]]?.ToString() ?? "" : "";
        //                    summaryWs.Cell(currRow, c + 2).Value = val;
        //                }
        //                currRow++;
        //            }
        //            summaryWs.Columns().AdjustToContents();
        //        }

        //        using (var stream = new MemoryStream())
        //        {
        //            wb.SaveAs(stream);
        //            var outputContent = stream.ToArray();
        //            return File(outputContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Transaction_List_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        //        }
        //    }
        //}

        [HttpGet("TransactionRanges")]
        public async Task<IActionResult> GetTransactionRanges([FromQuery] int clientId, [FromQuery] int modelId)
        {
            var ranges = await _vendorRepository.GetVendorTransactionRangesAsync(clientId, modelId);
            return Ok(new { success = true, data = ranges });
        }

        [HttpGet("TransactionTemplateData")]
        public async Task<IActionResult> GetTransactionTemplateData([FromQuery] int clientId, [FromQuery] int modelId)
        {
            var data = await _vendorRepository.GetTransactionTemplateDataAsync(clientId, modelId);
            return Ok(new { success = true, data });
        }

        [HttpGet("DownloadTransactionTemplate")]
        public async Task<IActionResult> DownloadTransactionTemplate([FromQuery] int clientId, [FromQuery] int modelId)
        {
            try
            {
                string clientName = await _vendorRepository.GetClientNameAsync(clientId) ?? "";
                string modelName = await _vendorRepository.GetModelNameAsync(modelId) ?? "";
                var vendorsData = await _vendorRepository.GetTransactionTemplateDataAsync(clientId, modelId);
                var vendorsList = vendorsData?.ToList() ?? new List<dynamic>();

                List<string> headers = GetExpectedTemplateHeaders(clientName, modelName);
                headers.Add("Incentive Packets"); //as needed in all clients

                using (var wb = new ClosedXML.Excel.XLWorkbook())
                {
                    var ws = wb.Worksheets.Add("TransactionTemplate");

                    // 1. Write and Style Header Row (Row 1)
                    for (int col = 0; col < headers.Count; col++)
                    {
                        var cell = ws.Cell(1, col + 1);
                        cell.Value = headers[col];
                        cell.Style.Font.Bold = true;
                        cell.Style.Font.FontSize = 11;
                        cell.Style.Font.FontColor = ClosedXML.Excel.XLColor.White;
                        cell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromArgb(13, 110, 253); // #0D6EFD
                        cell.Style.Alignment.Horizontal = ClosedXML.Excel.XLAlignmentHorizontalValues.Center;
                        cell.Style.Alignment.Vertical = ClosedXML.Excel.XLAlignmentVerticalValues.Center;
                    }

                    int vehicleTypeColIdx = headers.IndexOf("Vehicle Type"); // 0-based
                    int routeColIdx = headers.IndexOf("Route"); // 0-based

                    int currentRow = 2;

                    if (vendorsList.Any())
                    {
                        for (int i = 0; i < vendorsList.Count; i++)
                        {
                            var v = vendorsList[i];
                            string vCode = "";
                            string vName = "";
                            string vLoc = "";
                            string vFhrid = "";
                            string vAreaManager = "";
                            string vHubCode = "";

                            if (v is IDictionary<string, object> dict)
                            {
                                vCode = dict.ContainsKey("vendorCode") ? dict["vendorCode"]?.ToString() ?? "" : (dict.ContainsKey("VendorCode") ? dict["VendorCode"]?.ToString() ?? "" : "");
                                vName = dict.ContainsKey("vendorName") ? dict["vendorName"]?.ToString() ?? "" : (dict.ContainsKey("VendorName") ? dict["VendorName"]?.ToString() ?? "" : "");
                                vLoc = dict.ContainsKey("locationName") ? dict["locationName"]?.ToString() ?? "" : (dict.ContainsKey("LocationName") ? dict["LocationName"]?.ToString() ?? "" : "");
                                vFhrid = dict.ContainsKey("FHRID") ? dict["FHRID"]?.ToString() ?? "" : "";
                                vAreaManager = dict.ContainsKey("AreaManager") ? dict["AreaManager"]?.ToString() ?? "" : "";
                                vHubCode = dict.ContainsKey("HubCode") ? dict["HubCode"]?.ToString() ?? "" : "";
                            }
                            else
                            {
                                try { vCode = v.vendorCode?.ToString() ?? v.VendorCode?.ToString() ?? ""; } catch { }
                                try { vName = v.vendorName?.ToString() ?? v.VendorName?.ToString() ?? ""; } catch { }
                                try { vLoc = v.locationName?.ToString() ?? v.LocationName?.ToString() ?? ""; } catch { }
                                try { vFhrid = v.FHRID?.ToString() ?? ""; } catch { }
                                try { vAreaManager = v.AreaManager?.ToString() ?? ""; } catch { }
                                try { vHubCode = v.HubCode?.ToString() ?? ""; } catch { }
                            }

                            ws.Cell(currentRow, 1).Value = vCode;
                            ws.Cell(currentRow, 2).Value = vName;
                            ws.Cell(currentRow, 3).Value = vLoc;
                            ws.Cell(currentRow, 4).Value = vFhrid;
                            ws.Cell(currentRow, 5).Value = vAreaManager;
                            ws.Cell(currentRow, 6).Value = vHubCode;

                            for (int c = 6; c < headers.Count; c++)
                            {
                                if (c == vehicleTypeColIdx)
                                {
                                    ws.Cell(currentRow, c + 1).Value = (i % 2 == 0) ? "VAN" : "Bike";
                                }
                                else if (c == routeColIdx)
                                {
                                    ws.Cell(currentRow, c + 1).Value = "";
                                }
                                else
                                {
                                    ws.Cell(currentRow, c + 1).Value = "0";
                                }
                            }
                            currentRow++;
                        }
                    }
                    else
                    {
                        // Fallback: 2 sample rows if no vendors exist
                        for (int r = 0; r < 2; r++)
                        {
                            ws.Cell(currentRow, 1).Value = "";
                            ws.Cell(currentRow, 2).Value = "";
                            ws.Cell(currentRow, 3).Value = "";
                            ws.Cell(currentRow, 4).Value = "";
                            ws.Cell(currentRow, 5).Value = "";
                            ws.Cell(currentRow, 6).Value = "";

                            for (int c = 6; c < headers.Count; c++)
                            {
                                if (c == vehicleTypeColIdx)
                                {
                                    ws.Cell(currentRow, c + 1).Value = (r == 0) ? "VAN" : "Bike";
                                }
                                else if (c == routeColIdx)
                                {
                                    ws.Cell(currentRow, c + 1).Value = "";
                                }
                                else
                                {
                                    ws.Cell(currentRow, c + 1).Value = "0";
                                }
                            }
                            currentRow++;
                        }
                    }

                    ws.Columns().AdjustToContents();

                    string cleanClientName = System.Text.RegularExpressions.Regex.Replace(clientName, @"[^a-zA-Z0-9_\-]", "_");
                    string cleanModelName = System.Text.RegularExpressions.Regex.Replace(modelName, @"[^a-zA-Z0-9_\-]", "_");
                    string fileDate = DateTime.Now.ToString("dd_MM_yyyy");
                    string fileName = $"Transaction_Upload_Template_{cleanClientName}_{cleanModelName}_{fileDate}.xlsx";

                    using (var stream = new System.IO.MemoryStream())
                    {
                        wb.SaveAs(stream);
                        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Failed to generate template: " + ex.Message });
            }
        }

        private static List<string> GetExpectedTemplateHeaders(string clientInput, string modelInput)
        {
            string clientName = (clientInput ?? "").ToLower().Trim();
            string modelName = (modelInput ?? "").ToLower().Trim();

            // Healthkart
            if (clientName.Contains("healthkart"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Sum of Total OFD", "Sum of Total Delivered", "Shipment Deduction",
                    "COD Deduction", "Other Deduction", "Arrear Amt", "Insurance", "SD", "Welfare"
                };
            }

            // Meesho
            if (clientName.Contains("meesho"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Total OFD", "Total Delivered", "Pickup Assign", "Pickup Done",
                    "Shipment Loss Deduction", "COD Deduction", "Other Deduction",
                    "Arrear Amt", "Insurance", "Hold", "Karma Life", "Welfare Deduction"
                };
            }

            // 1. Flipkart ODH-MDH
            if (clientName.Contains("flipkart") && modelName.Contains("odh-mdh"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "No. of Days", "SR LM Return", "SR FM Return", "Assign RVP+Normal",
                    "Total Delivered+RVP+Shopsy", "U2S", "Shopsy", "Prexo",
                    "Grocery Assigned", "Grocery Delivered", "Shipment Deduction",
                    "COD Deduction", "Other Deduction", "Rent Deduction", "Advance Deduction",
                    "Hold", "Karma Life Deduction", "Arrear", "SD", "TNT Deduction", "Welfare Deduction"
                };
            }

            // 2. Amazon DSP
            if (clientName.Contains("amazon") && modelName.Contains("dsp") && !modelName.Contains("edsp"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "Route", "Vehicle Type",
                    "Total OFD", "Total Delivered", "Pickup Assign", "Pickup Done",
                    "MFN Assign", "MFN Done", "PresentDays", "SC",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear",
                    "Hold", "Karmalife Deduction", "Welfare Deduction", "Advance Deduction"
                };
            }

            // 3. Amazon EDSP
            if (clientName.Contains("amazon") && modelName.Contains("edsp"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code", "Vehicle Type",
                    "Total OFD", "Total Delivered", "Pickup Assign", "Pickup Done",
                    "MFN Assign", "MFN Done",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear",
                    "Hold", "Karmalife Deduction", "Welfare Deduction"
                };
            }

            // 4. BlueDart Variable
            if (clientName.Contains("bluedart") && (modelName.Contains("variable") || modelName.Contains("b")))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Total Assigned", "Total Delivered", "Shipment Deduction",
                    "COD Deduction", "Other Deduction", "Hold", "Arrear Amt", "SD"
                };
            }

            // 5. Ebees / Xbees
            if (clientName.Contains("ebees") || clientName.Contains("xbees"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "OFD", "Delivered", "Pickup Assign", "Pickup Done",
                    "RTO Assign", "RTO Done",   // NEW
                    "DTO Assign", "DTO Done",   // NEW
                    "FM Assign",  "FM Done",    // NEW
                    "Deduction", "COD Deduction", "Other Deduction"
                };
            }

            // 6. Airtel FSE
            if (clientName.Contains("airtel") && modelName.Contains("fse"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Over System Pickup Count", "FSE System Pickup Count",
                    "Deduction", "COD Deduction", "Other Deduction", "Arrear Amt",
                    "Insurance", "SD", "Welfare"
                };
            }

            // 7. Flipkart FM
            if (clientName.Contains("flipkart") && (modelName.Contains("fm") || modelName.Contains("variable")))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Assigned FM", "Delivered FM", "Assigned RVP", "Delivered RVP",
                    "Shipment Deduction", "COD Deduction", "Other Deduction", "Arrear", "Hold"
                };
            }

            // 8. Flipkart XRM
            if (clientName.Contains("flipkart") && modelName.Contains("xrm"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Total OFD", "Total Delivered", "Pickup Assign", "Pickup Done",
                    "Deduction", "COD Deduction", "Other Deduction", "Arrear Amt",
                    "Insurance", "Hold", "Karma Life", "Welfare Deduction"
                };
            }

            // 9. Flipkart Large
            if (clientName.Contains("flipkart") && modelName.Contains("large"))
            {
                return new List<string>
                {
                    "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                    "Vehicle Type", "Working Days", "Delivered Count", "Shipment Deduction",
                    "COD Deduction", "Other Deduction", "Arrear", "Hold",
                    "KarmaLife Deduction", "Welfare Deduction"
                };
            }

            // 10. Default / Fallback
            return new List<string>
            {
                "Code", "Name", "Location", "FHRID", "AreaManager", "Hub code",
                "Sum of Total OFD", "Sum of Total Delivered",
                "Shipment Deduction", "COD Deduction", "Other Deduction",
                "Arrear Amt", "Insurance", "SD", "Welfare"
            };
        }

        [HttpGet("SearchVendors")]
        public async Task<IActionResult> SearchVendors([FromQuery] string searchTerm)
        {
            var vendors = await _vendorRepository.SearchVendorsAsync(searchTerm);
            return Ok(new { success = true, data = vendors });
        }

        //added code 31 aug 2026 starts
        [HttpPost("UploadVendorFHRIDMappingExcel")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadVendorFHRIDMappingExcel([FromForm] UploadVendorFHRIDMappingRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var file = request?.file;
                if (file == null || file.Length == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Please select a valid Excel file.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var uploadResults = await _vendorRepository.UploadVendorFHRIDMappingExcelAsync(file, companyId, userId);

                int successCount = uploadResults.Count(r => r.Status == "Inserted" || r.Status == "Updated");
                int failedCount = uploadResults.Count(r => r.Status == "Failed");

                modelResponse.IsSuccess = true;
                modelResponse.Message = $"Vendor FHR ID Mapping processed: {successCount} successful, {failedCount} failed.";
                modelResponse.Data = uploadResults;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        [HttpGet("GetVendorFHRIDFiles")]
        [Authorize]
        public async Task<IActionResult> GetVendorFHRIDFiles()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var files = await _vendorRepository.GetVendorFHRIDFilesAsync(companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Uploaded files list fetched successfully.";
                modelResponse.Data = files;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpGet("DownloadVendorFHRIDFile/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadVendorFHRIDFile(int id)
        {
            try
            {
                var fileDoc = await _vendorRepository.GetVendorFHRIDFileByIdAsync(id);
                if (fileDoc == null)
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File record not found." });
                }

                string fileName = Path.GetFileName(fileDoc.Path);
                string configuredFolder = _configuration["AppSettings:VendorFHRIDUploads"] ?? Path.Combine(Directory.GetCurrentDirectory(), "VendorFHRIDUploads");
                string fullPath = Path.Combine(configuredFolder, fileName);

                if (!System.IO.File.Exists(fullPath))
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File not found on server." });
                }
                var bytes = System.IO.File.ReadAllBytes(fullPath);
                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileDoc.Name);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpGet("GetRateCardUploadedFiles")]
        [Authorize]
        public async Task<IActionResult> GetRateCardUploadedFiles()
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var files = await _vendorRepository.GetRateCardUploadedFilesAsync(companyId);
                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Uploaded files list fetched successfully.",
                    Data = files,
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpGet("DownloadRateCardFile/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadRateCardFile(int id)
        {
            try
            {
                var fileDoc = await _vendorRepository.GetRateCardFileByIdAsync(id);
                if (fileDoc == null)
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File record not found." });
                }

                string fileName = Path.GetFileName(fileDoc.Path);
                string configuredFolder = _configuration["AppSettings:VendorRateCardUploads"] ?? Path.Combine(Directory.GetCurrentDirectory(), "VendorRateCardUploads");
                string fullPath = Path.Combine(configuredFolder, fileName);

                if (!System.IO.File.Exists(fullPath))
                {
                    var fallbackPath = Path.Combine(Directory.GetCurrentDirectory(), "VendorRateCardUploads", fileName);
                    if (System.IO.File.Exists(fallbackPath))
                    {
                        fullPath = fallbackPath;
                    }
                    else
                    {
                        return NotFound(new ModelResponse { IsSuccess = false, Message = "File not found on server." });
                    }
                }
                var bytes = System.IO.File.ReadAllBytes(fullPath);
                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileDoc.Name);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpGet("GetTransactionUploadedFiles")]
        [Authorize]
        public async Task<IActionResult> GetTransactionUploadedFiles()
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var files = await _vendorRepository.GetTransactionUploadedFilesAsync(companyId);
                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Transaction files fetched successfully",
                    Data = files,
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        // ── Transaction Approval Workflow Endpoints ──────────────────────────────

        [HttpGet("TransactionApprovalList")]
        [Authorize]
        public async Task<IActionResult> GetTransactionApprovalList(
            [FromQuery] int clientId,
            [FromQuery] int modelId,
            [FromQuery] string transactionRange,
            [FromQuery] string? searchTerm = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 100)
        {
            try
            {
                var (totalVendors, approvedCount, pendingCount, totalRows, rows) =
                    await _vendorRepository.GetVendorTransactionForApprovalAsync(
                        clientId, modelId, transactionRange, searchTerm ?? "", pageIndex, pageSize);

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Transaction approval list fetched successfully.",
                    Data = new
                    {
                        TotalVendors = totalVendors,
                        ApprovedCount = approvedCount,
                        PendingCount = pendingCount,
                        TotalRows = totalRows,
                        Rows = rows
                    },
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        [HttpPost("ApproveTransaction")]
        [Authorize]
        public async Task<IActionResult> ApproveTransaction([FromBody] ApproveTransactionRequest request)
        {
            try
            {
                if (request == null)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Invalid request.", StatusCode = 400 });

                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var userName = HttpContext.Items["DecryptedUserName"]?.ToString() ?? userId;

                var result = await _vendorRepository.ApproveVendorTransactionAsync(
                    request.TransactionIds ?? "",
                    request.ApproveAll,
                    request.ClientId,
                    request.ModelId,
                    request.TransactionRange,
                    userId,
                    userName,
                    request.ApproverRemarks ?? "");

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Transaction(s) approved successfully.",
                    Data = result,
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }


        [HttpGet("DownloadTransactionFile/{id}")]
        [Authorize]
        public async Task<IActionResult> DownloadTransactionFile(int id)
        {
            try
            {
                var fileDoc = await _vendorRepository.GetTransactionFileByIdAsync(id);
                if (fileDoc == null)
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File record not found." });
                }

                string fileName = Path.GetFileName((string)fileDoc.name); // or whatever the property is
                string configuredFolder = _configuration["AppSettings:VendorTransactions"] ?? Path.Combine(Directory.GetCurrentDirectory(), "VendorTransactions");
                string fullPath = Path.Combine(configuredFolder, fileName);

                if (!System.IO.File.Exists(fullPath))
                {
                    return NotFound(new ModelResponse { IsSuccess = false, Message = "File not found on server." });
                }
                var bytes = System.IO.File.ReadAllBytes(fullPath);
                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpPost("ReInitiateVendor")]
        public async Task<IActionResult> ReInitiateVendor([FromBody] UpdateVendorStatusRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.PkRecId))
                    return BadRequest(new { IsSuccess = false, Message = "Candidate Key is required." });

                // 1. Get candidate details for email
                var candidateMasterRepository = HttpContext.RequestServices.GetService<ICandidateMasterRepository>();
                var candidate = await candidateMasterRepository.GetById(request.PkRecId);

                if (candidate?.Mst1 == null)
                    return Ok(new { IsSuccess = false, Message = "Candidate not found. Status not updated." });

                string emailToUse = !string.IsNullOrEmpty(candidate.Mst1.email)
                    ? candidate.Mst1.email
                    : candidate.Mst1.EmailID;

                if (string.IsNullOrEmpty(emailToUse))
                    return Ok(new { IsSuccess = false, Message = "Email is missing. Please add email first. Status not updated." });

                // 2. Get first visible route
                var candidateExperienceRepo = HttpContext.RequestServices.GetService<ICandidateExperienceDetailsRepository>();
                var companyConfig = await candidateExperienceRepo.GetMandatorySettings(request.PkRecId);
                string firstVisibleRoute = GetFirstVisibleRoute(companyConfig);

                // 3. Send re-initiation email
                var onboardingEmailService = HttpContext.RequestServices.GetService<OnboardingEmailService>();
                bool isEmailSent = await onboardingEmailService.SendReInitiateEmailAsync(
                    candidate.Mst1.candidate_name,
                    emailToUse,
                    candidate.Mst1.CandidateKey,
                    firstVisibleRoute
                );

                if (isEmailSent)
                {
                    // 4. Update status to ReInitiated (3) ONLY if email sent successfully
                    await _vendorRepository.UpdateVendorStatusAsync(request.PkRecId, 3);
                    return Ok(new { IsSuccess = true, Message = $"Re-Initiated successfully. Email sent to {emailToUse}." });
                }
                else
                {
                    return StatusCode(500, new { IsSuccess = false, Message = "Failed to send email. Status not updated." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = ex.Message });
            }
        }


        private string GetFirstVisibleRoute(CompanyConfig config)
        {
            // Check in priority order
            if (config.pan_visible) return "pan";
            if (config.aadhaar_visible) return "aadhaar";
            if (config.bankaccount_visible) return "bank";
            if (config.driving_licence_visible) return "driving-licence";
            if (config.voter_visible) return "voter";
            if (config.vendor_gst_visible) return "vendor-gst";
            if (config.signature_visible) return "signature";
            if (config.photograph_visible) return "photograph";
            if (config.basicinfo_visible) return "basicInfo";
            if (config.qualification_visible) return "education";
            if (config.experience_visible) return "previous_experience";
            if (config.family_visible) return "family_details";
            if (config.voter_visible) return "voter";
            if (config.bankaccount_visible) return "bank_account";


            // Fallback to final submission if nothing is visible (edge case)
            return "final-submission";


        }

        [HttpPost("UpdateVendorStatus")]
        public async Task<IActionResult> UpdateVendorStatus([FromForm] UpdateVendorStatusRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.PkRecId))
                    return BadRequest(new { IsSuccess = false, Message = "Candidate Key is required." });

                string signatureFilePath = null;
                if (request.SignatureFile != null && request.SignatureFile.Length > 0)
                {
                    var ext = Path.GetExtension(request.SignatureFile.FileName).ToLowerInvariant();
                    if (ext != ".png" && ext != ".jpg" && ext != ".jpeg" && ext != ".pdf")
                        return Ok(new ModelResponse { IsSuccess = false, Message = "Invalid file type. Only PNG, JPG, JPEG, or PDF are allowed.", StatusCode = 400 });

                    //var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "HR_Admin_Signature");
                    var uploadsFolder = _configuration["AppSettings:VendorVerificationSignatureUploads"];
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var fileNameWithoutExt = Path.GetFileNameWithoutExtension(request.SignatureFile.FileName);
                    var savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyyyy_HHmmss}{ext}";
                    var physicalPath = Path.Combine(uploadsFolder, savedFileName);

                    using (var stream = new FileStream(physicalPath, FileMode.Create))
                    {
                        await request.SignatureFile.CopyToAsync(stream);
                    }
                    signatureFilePath = savedFileName;
                }

                var result = await _vendorRepository.UpdateVendorStatusAsync(request.PkRecId, request.StatusId, request.ApprovedByName, signatureFilePath, request.ApproverRemarks);
                return Ok(new { IsSuccess = true, Data = result, Message = "Status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = ex.Message });
            }
        }


        [HttpGet("GetVendorAgentDropdown")]
        [Authorize]
        public async Task<IActionResult> GetVendorAgentDropdown()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await _vendorRepository.GetVendorAgentDropdownAsync(companyId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Agent dropdown fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }



        [HttpGet("GetVendorDownloadVerificationList")]
        [Authorize]
        public async Task<IActionResult> GetVendorDownloadVerificationList([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 1000, [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var (totalCount, vendors) = await _vendorRepository.GetVendorDownloadVerificationListAsync(pageIndex, pageSize, companyId, userId, searchTerm);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor Verification Download List fetched successfully.";
                modelResponse.Data = new
                {
                    TotalCount = totalCount,
                    Vendors = vendors
                };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        private async Task<string> GenerateAndSaveVerificationLinkAsync(string pk_recId)
        {
            try
            {
                if (string.IsNullOrEmpty(pk_recId)) return string.Empty;

                var candidateMasterRepository = HttpContext.RequestServices.GetService<ICandidateMasterRepository>();
                if (candidateMasterRepository == null) return string.Empty;

                // Get candidate details
                var candidate = await candidateMasterRepository.GetById(pk_recId);
                if (candidate == null || candidate.Mst1 == null) return string.Empty;

                string candidateKey = candidate.Mst1.CandidateKey;
                string VerificationLink = candidate.Mst1.VerificationLink;

                if (!string.IsNullOrEmpty(VerificationLink))
                {
                    return string.Empty;
                }

                // Agar CandidateKey pehle se exist karti hai, to bar-bar generate/update karne ki jarurat nahi hai
                if (!string.IsNullOrEmpty(candidateKey))
                {
                    return string.Empty;
                }

                // Sirf tab generate & save karein jab CandidateKey missing/null ho
                candidateKey = CandidateKeyGenerator.GenerateUrlSafeKey();

                var candidateExperienceDetailsRepository = HttpContext.RequestServices.GetService<ICandidateExperienceDetailsRepository>();
                string firstVisibleRoute = "vendor-gst";
                if (candidateExperienceDetailsRepository != null)
                {
                    var companyConfig = await candidateExperienceDetailsRepository.GetMandatorySettings(pk_recId);
                    if (companyConfig != null)
                    {
                        firstVisibleRoute = GetFirstVisibleRoute(companyConfig);
                    }
                }

                string frontendBaseUrl = _configuration["FrontendSettings:Domain"] ?? "";
                string onboardingLink = $"{frontendBaseUrl}/#/on_boarding/{firstVisibleRoute}?key={candidateKey}";

                // Save CandidateKey & VerificationLink to Database
                var p = new DynamicParameters();
                p.Add("@pk_recId", pk_recId);
                p.Add("@CandidateKey", candidateKey);
                p.Add("@VerificationLink", onboardingLink);
                await DataBaseFactory.QuerySPAsync("REC_Candidate_UpdateVerificationLink", p);

                return onboardingLink;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GenerateAndSaveVerificationLinkAsync: {ex.Message}");
                return string.Empty;
            }
        }

       
        // Dynamic Deduction Entry, Fact Box, Sync & Recovery MIS Endpoints
        

        [HttpGet("GetLinkedLocations")]
        [Authorize]
        public async Task<IActionResult> GetLinkedLocations([FromQuery] long clientId, [FromQuery] int modelId)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await _vendorRepository.GetLinkedLocationsAsync(clientId, modelId, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Linked locations fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetLinkedVendors")]
        [Authorize]
        public async Task<IActionResult> GetLinkedVendors([FromQuery] long clientId, [FromQuery] int modelId, [FromQuery] string? locationId = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await _vendorRepository.GetLinkedVendorsAsync(clientId, modelId, locationId, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Linked vendors fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("SaveDeductionEntries")]
        [Authorize]
        public async Task<IActionResult> SaveDeductionEntries([FromBody] SaveDeductionEntryRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var (isSuccess, message) = await _vendorRepository.SaveDeductionEntriesAsync(request, userId, companyId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("DeleteDeductionEntry")]
        [Authorize]
        public async Task<IActionResult> DeleteDeductionEntry([FromQuery] long entryId)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var (isSuccess, message) = await _vendorRepository.DeleteDeductionEntryAsync(entryId, userId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("SaveMultiVendorDeductionBatch")]
        [Authorize]
        public async Task<IActionResult> SaveMultiVendorDeductionBatch([FromBody] SaveMultiVendorDeductionBatchRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var (isSuccess, message, insertedCount) = await _vendorRepository.SaveMultiVendorDeductionBatchAsync(request, userId, companyId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.Data = new { InsertedCount = insertedCount };
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetShipmentRecoverySummary")]
        [Authorize]
        public async Task<IActionResult> GetShipmentRecoverySummary(
            [FromQuery] string shipmentId,
            [FromQuery] long? clientId = null,
            [FromQuery] int? modelId = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrWhiteSpace(shipmentId))
                {
                    return BadRequest(new { IsSuccess = false, Message = "Shipment ID is required." });
                }

                var list = await _vendorRepository.GetShipmentRecoverySummaryAsync(shipmentId, clientId, modelId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Shipment recovery summary retrieved successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        private async Task<List<string>> GetConfiguredDeductionTypesAsync(long clientId, int modelId, string? clientName, string? modelName)
        {
            // 1. Try to read active deduction columns configured in VendorTemplateConfig
            try
            {
                if (clientId > 0 && modelId > 0)
                {
                    var configData = await _vendorRepository.GetVendorTemplateConfigAsync((int)clientId, modelId);
                    if (configData != null && configData.Any())
                    {
                        var fromDb = new List<string>();
                        foreach (var row in configData)
                        {
                            var dict = (IDictionary<string, object>)row;
                            var stdCol = dict.ContainsKey("StandardDbColumn") ? Convert.ToString(dict["StandardDbColumn"]) ?? "" : "";
                            var excelHeader = dict.ContainsKey("ExcelHeaderName") ? Convert.ToString(dict["ExcelHeaderName"]) ?? "" : "";

                            if (stdCol.StartsWith("Ded_", StringComparison.OrdinalIgnoreCase) ||
                                stdCol.Equals("Hold", StringComparison.OrdinalIgnoreCase) ||
                                stdCol.Equals("Arrear", StringComparison.OrdinalIgnoreCase) ||
                                stdCol.Equals("SD", StringComparison.OrdinalIgnoreCase) ||
                                stdCol.Equals("Insurance", StringComparison.OrdinalIgnoreCase))
                            {
                                string label = !string.IsNullOrWhiteSpace(excelHeader) ? excelHeader : stdCol;
                                if (!fromDb.Contains(label, StringComparer.OrdinalIgnoreCase))
                                    fromDb.Add(label);
                            }
                        }
                        if (fromDb.Count >= 2) return fromDb;
                    }
                }
            }
            catch { }

            // 2. Resolve client and model names if needed
            string finalClientName = clientName ?? "";
            string finalModelName = modelName ?? "";
            try
            {
                if (string.IsNullOrWhiteSpace(finalClientName) && clientId > 0)
                    finalClientName = await _vendorRepository.GetClientNameAsync((int)clientId);
                if (string.IsNullOrWhiteSpace(finalModelName) && modelId > 0)
                    finalModelName = await _vendorRepository.GetModelNameAsync(modelId);
            }
            catch { }

            string normClient = (finalClientName ?? "").ToLowerInvariant().Trim();
            string normModel = (finalModelName ?? "").ToLowerInvariant().Trim();

            bool isFlipkart = normClient.Contains("flipkart");
            bool isAmazon = normClient.Contains("amazon") || clientId == 316;
            bool isAirtel = normClient.Contains("airtel");
            bool isEbees = normClient.Contains("ebees") || normClient.Contains("xbees") || modelId == 7;
            bool isBlueDart = normClient.Contains("bluedart");
            bool isShiprocket = normClient.Contains("shiprocket");
            bool isMeesho = normClient.Contains("meesho");
            bool isHealthkart = normClient.Contains("healthkart");

            // Flipkart combinations
            if (isFlipkart)
            {
                if (modelId == 1 || normModel.Contains("odh-mdh") || normModel.Contains("odh"))
                    return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Rent Deduction", "Advance Deduction", "Hold", "Karma Life Deduction", "Arrear", "SD", "TNT Deduction", "Welfare Deduction" };
                if (modelId == 2 || normModel.Contains("xrm"))
                    return new List<string> { "Deduction", "COD Deduction", "Other Deduction", "Insurance", "Welfare Deduction", "Hold", "Karma Life", "Arrear Amt" };
                if (modelId == 3 || normModel.Contains("large"))
                    return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Welfare Deduction", "Hold", "KarmaLife Deduction", "Arrear" };
                if (modelId == 8 || normModel.Contains("fm") || normModel.Contains("variable"))
                    return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear" };
            }

            // Amazon combinations
            if (isAmazon)
            {
                if (modelId == 4 || (normModel.Contains("dsp") && !normModel.Contains("edsp")))
                    return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Advance Deduction", "Welfare Deduction", "Hold", "Karmalife Deduction", "Arrear" };
                if (modelId == 5 || normModel.Contains("edsp"))
                    return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Welfare Deduction", "Hold", "Karmalife Deduction", "Arrear" };
            }

            // Airtel combinations
            if (isAirtel)
            {
                if (modelId == 6 || normModel.Contains("fse"))
                    return new List<string> { "Deduction", "COD Deduction", "Other Deduction", "Insurance", "SD", "Welfare", "Arrear Amt" };
            }

            // Ebees combinations
            if (isEbees || modelId == 7 || normModel.Contains("variable(e)"))
            {
                return new List<string> { "Deduction", "COD Deduction", "Other Deduction" };
            }

            // BlueDart combinations
            if (isBlueDart || modelId == 10 || normModel.Contains("variable(b)"))
            {
                return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "SD", "Hold", "Arrear Amt" };
            }

            // Shiprocket combinations
            if (isShiprocket || modelId == 9 || normModel.Contains("variable(s)"))
            {
                return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear Amt" };
            }

            // Meesho combinations
            if (isMeesho || modelId == 11 || normModel.Contains("variable(m)"))
            {
                return new List<string> { "Shipment Loss Deduction", "COD Deduction", "Other Deduction", "Insurance", "Welfare Deduction", "Hold", "Karma Life", "Arrear Amt" };
            }

            // Healthkart combinations
            if (isHealthkart || modelId == 12 || normModel.Contains("variable(h)"))
            {
                return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Insurance", "SD", "Welfare", "Arrear Amt" };
            }

            // Text keyword fallback if client is not specifically identified
            if (normModel.Contains("odh-mdh")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Rent Deduction", "Advance Deduction", "Hold", "Karma Life Deduction", "Arrear", "SD", "TNT Deduction", "Welfare Deduction" };
            if (normModel.Contains("xrm")) return new List<string> { "Deduction", "COD Deduction", "Other Deduction", "Insurance", "Welfare Deduction", "Hold", "Karma Life", "Arrear Amt" };
            if (normModel.Contains("large")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Welfare Deduction", "Hold", "KarmaLife Deduction", "Arrear" };
            if (normModel.Contains("dsp") && !normModel.Contains("edsp")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Advance Deduction", "Welfare Deduction", "Hold", "Karmalife Deduction", "Arrear" };
            if (normModel.Contains("edsp")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Welfare Deduction", "Hold", "Karmalife Deduction", "Arrear" };
            if (normModel.Contains("fse")) return new List<string> { "Deduction", "COD Deduction", "Other Deduction", "Insurance", "SD", "Welfare", "Arrear Amt" };
            if (normModel.Contains("variable(e)") || normModel.Contains("ebees")) return new List<string> { "Deduction", "COD Deduction", "Other Deduction" };
            if (normModel.Contains("fmvariable") || normModel.Contains("fm")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear" };
            if (normModel.Contains("variable(s)") || normModel.Contains("shiprocket")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear Amt" };
            if (normModel.Contains("variable(b)") || normModel.Contains("bluedart")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "SD", "Hold", "Arrear Amt" };
            if (normModel.Contains("variable(m)") || normModel.Contains("meesho")) return new List<string> { "Shipment Loss Deduction", "COD Deduction", "Other Deduction", "Insurance", "Welfare Deduction", "Hold", "Karma Life", "Arrear Amt" };
            if (normModel.Contains("variable(h)") || normModel.Contains("healthkart")) return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Insurance", "SD", "Welfare", "Arrear Amt" };

            // Direct model ID fallback
            switch (modelId)
            {
                case 1: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Rent Deduction", "Advance Deduction", "Hold", "Karma Life Deduction", "Arrear", "SD", "TNT Deduction", "Welfare Deduction" };
                case 2: return new List<string> { "Deduction", "COD Deduction", "Other Deduction", "Insurance", "Welfare Deduction", "Hold", "Karma Life", "Arrear Amt" };
                case 3: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Welfare Deduction", "Hold", "KarmaLife Deduction", "Arrear" };
                case 4: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Advance Deduction", "Welfare Deduction", "Hold", "Karmalife Deduction", "Arrear" };
                case 5: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Welfare Deduction", "Hold", "Karmalife Deduction", "Arrear" };
                case 6: return new List<string> { "Deduction", "COD Deduction", "Other Deduction", "Insurance", "SD", "Welfare", "Arrear Amt" };
                case 7: return new List<string> { "Deduction", "COD Deduction", "Other Deduction" };
                case 8: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear" };
                case 9: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Hold", "Arrear Amt" };
                case 10: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "SD", "Hold", "Arrear Amt" };
                case 11: return new List<string> { "Shipment Loss Deduction", "COD Deduction", "Other Deduction", "Insurance", "Welfare Deduction", "Hold", "Karma Life", "Arrear Amt" };
                case 12: return new List<string> { "Shipment Deduction", "COD Deduction", "Other Deduction", "Insurance", "SD", "Welfare", "Arrear Amt" };
            }

            return new List<string> { "Shipment Deduction", "COD Deduction", "Advance Deduction", "Rent Deduction", "Hold", "Karma Life Deduction", "Welfare Deduction", "Insurance", "Other Deduction", "Arrear" };
        }

        private static List<string> GetConfiguredDeductionTypes(int modelId, string? modelName)
        {
            return new List<string> { "Shipment Deduction", "COD Deduction", "Advance Deduction", "Rent Deduction", "Hold", "Karma Life Deduction", "Welfare Deduction", "Insurance", "Other Deduction", "Arrear" };
        }

        [HttpGet("DownloadDeductionExcelTemplate")]
        [Authorize]
        public async Task<IActionResult> DownloadDeductionExcelTemplate(
            [FromQuery] long clientId,
            [FromQuery] int modelId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string? locationId = null,
            [FromQuery] string? clientName = null,
            [FromQuery] string? modelName = null)
        {
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                string? cleanLocationId = (!string.IsNullOrWhiteSpace(locationId) && locationId != "0" && !locationId.Equals("All", StringComparison.OrdinalIgnoreCase)) 
                    ? locationId 
                    : null;

                var vendors = await _vendorRepository.GetLinkedVendorsAsync(clientId, modelId, cleanLocationId, companyId);
                var vendorList = vendors?.ToList() ?? new List<VendorLinkedVendorDto>();

                string displayClient = clientName ?? "";
                string displayModel = modelName ?? "";
                try
                {
                    if (string.IsNullOrWhiteSpace(displayClient) && clientId > 0)
                        displayClient = await _vendorRepository.GetClientNameAsync((int)clientId);
                    if (string.IsNullOrWhiteSpace(displayModel) && modelId > 0)
                        displayModel = await _vendorRepository.GetModelNameAsync(modelId);
                }
                catch { }

                if (string.IsNullOrWhiteSpace(displayClient)) displayClient = $"Client {clientId}";
                if (string.IsNullOrWhiteSpace(displayModel)) displayModel = $"Model {modelId}";

                var deductionTypes = await GetConfiguredDeductionTypesAsync(clientId, modelId, displayClient, displayModel);
                string defaultDeductionType = deductionTypes.FirstOrDefault() ?? "Shipment Deduction";

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Deductions_Entry");

                    var headers = new[]
                    {
                        "Vendor Code",
                        "Vendor FHRID *",
                        "Vendor Name",
                        "Location / Hub",
                        "Client Name",
                        "Model Name",
                        "From Date (YYYY-MM-DD)",
                        "To Date (YYYY-MM-DD)",
                        "Vehicle Type",
                        "Route / Block",
                        "Deduction Type *",
                        "Shipment / Waybill ID (Mandatory for Shipment)",
                        "Is Split Shipment? (YES / NO)",
                        "Deduction Amount (₹) *",
                        "Remarks"
                    };

                    for (int i = 0; i < headers.Length; i++)
                    {
                        var cell = worksheet.Cell(1, i + 1);
                        cell.Value = headers[i];
                        cell.Style.Font.Bold = true;
                        cell.Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
                        cell.Style.Font.FontColor = XLColor.White;
                        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    }

                    int rowIdx = 2;
                    if (vendorList.Any())
                    {
                        foreach (var v in vendorList)
                        {
                            worksheet.Cell(rowIdx, 1).Value = v.VendorCode;
                            worksheet.Cell(rowIdx, 2).Value = v.FHRID;
                            worksheet.Cell(rowIdx, 3).Value = v.VendorName;
                            worksheet.Cell(rowIdx, 4).Value = v.LocationName;
                            worksheet.Cell(rowIdx, 5).Value = displayClient;
                            worksheet.Cell(rowIdx, 6).Value = displayModel;
                            worksheet.Cell(rowIdx, 7).Value = fromDate.ToString("yyyy-MM-dd");
                            worksheet.Cell(rowIdx, 8).Value = toDate.ToString("yyyy-MM-dd");
                            worksheet.Cell(rowIdx, 9).Value = v.Vehicle_Type ?? "";
                            worksheet.Cell(rowIdx, 10).Value = v.Route ?? "";
                            worksheet.Cell(rowIdx, 11).Value = defaultDeductionType;
                            worksheet.Cell(rowIdx, 12).Value = "";
                            worksheet.Cell(rowIdx, 13).Value = "NO";
                            worksheet.Cell(rowIdx, 14).Value = "";
                            worksheet.Cell(rowIdx, 15).Value = "";
                            rowIdx++;
                        }
                    }
                    else
                    {
                        bool isAmazonModel = (displayModel.Contains("DSP", StringComparison.OrdinalIgnoreCase) || modelId == 4 || modelId == 5 || displayClient.Contains("Amazon", StringComparison.OrdinalIgnoreCase) || clientId == 316);
                        worksheet.Cell(2, 1).Value = "V4034";
                        worksheet.Cell(2, 2).Value = "Bhishan Lal";
                        worksheet.Cell(2, 3).Value = "Bhishan Lal";
                        worksheet.Cell(2, 4).Value = "Amritsar";
                        worksheet.Cell(2, 5).Value = displayClient;
                        worksheet.Cell(2, 6).Value = displayModel;
                        worksheet.Cell(2, 7).Value = fromDate.ToString("yyyy-MM-dd");
                        worksheet.Cell(2, 8).Value = toDate.ToString("yyyy-MM-dd");
                        worksheet.Cell(2, 9).Value = isAmazonModel ? "Tata Ace" : "";
                        worksheet.Cell(2, 10).Value = isAmazonModel ? "Route-01" : "";
                        worksheet.Cell(2, 11).Value = defaultDeductionType;
                        worksheet.Cell(2, 12).Value = "S123456";
                        worksheet.Cell(2, 13).Value = "NO";
                        worksheet.Cell(2, 14).Value = 500.00;
                        worksheet.Cell(2, 15).Value = "Sample deduction entry";
                        rowIdx = 3;
                    }

                    worksheet.Columns().AdjustToContents();

                    // Sheet 2: Reference Guide of Valid Deduction Types
                    var guideSheet = workbook.Worksheets.Add("Valid_Deduction_Types");
                    var guideHeaders = new[] { "Deduction Type", "Nature / Category", "Requires Shipment ID?", "Can Split Across Vendors?", "Usage Notes & Instructions" };
                    for (int i = 0; i < guideHeaders.Length; i++)
                    {
                        var cell = guideSheet.Cell(1, i + 1);
                        cell.Value = guideHeaders[i];
                        cell.Style.Font.Bold = true;
                        cell.Style.Fill.BackgroundColor = XLColor.FromArgb(15, 23, 42);
                        cell.Style.Font.FontColor = XLColor.White;
                        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    }

                    int gRow = 2;
                    foreach (var dt in deductionTypes)
                    {
                        guideSheet.Cell(gRow, 1).Value = dt;
                        bool isShipment = dt.Contains("Shipment", StringComparison.OrdinalIgnoreCase) || dt.Equals("Deduction", StringComparison.OrdinalIgnoreCase);
                        bool isArrear = dt.Contains("Arrear", StringComparison.OrdinalIgnoreCase);
                        bool isAdvance = dt.Contains("Advance", StringComparison.OrdinalIgnoreCase);
                        bool isCod = dt.Contains("COD", StringComparison.OrdinalIgnoreCase);

                        guideSheet.Cell(gRow, 2).Value = isArrear ? "Addition / Credit" : (isAdvance ? "Advance Recovery" : (isCod ? "COD Shortfall" : "Penalty / Recovery"));
                        guideSheet.Cell(gRow, 3).Value = isShipment ? "YES (Mandatory for Shipment Deductions)" : "Optional / N/A";
                        guideSheet.Cell(gRow, 4).Value = isShipment ? "YES (Set 'YES' to split across vendors, 'NO' for single vendor)" : "NO (Single Vendor only)";
                        guideSheet.Cell(gRow, 5).Value = isArrear 
                            ? "Underpayment adjustment. Amount will be credited to vendor." 
                            : (isShipment ? "Shipment ID is mandatory. Set 'Is Split Shipment?' to 'NO' for a single vendor penalty (must be unique), or 'YES' to split a shared shipment penalty across multiple vendors." : "Standard operational deduction for this client and model.");
                        gRow++;
                    }
                    guideSheet.Columns().AdjustToContents();

                    // Sheet 2 Helper: Split Shipment Options for dropdown list
                    guideSheet.Cell(1, 7).Value = "Split Options";
                    guideSheet.Cell(2, 7).Value = "NO";
                    guideSheet.Cell(3, 7).Value = "YES";

                    // Safely link in-cell dropdowns on Sheet 1 to Sheet 2 ranges (100% valid Excel OpenXML without corruption)
                    int maxValidationRow = Math.Max(rowIdx - 1, 100);
                    if (gRow > 2)
                    {
                        var typeRange = guideSheet.Range(2, 1, gRow - 1, 1);
                        var typeValidation = worksheet.Range(2, 11, maxValidationRow, 11).CreateDataValidation();
                        typeValidation.List(typeRange);
                        typeValidation.InCellDropdown = true;
                        typeValidation.IgnoreBlanks = true;
                    }

                    var splitRange = guideSheet.Range(2, 7, 3, 7);
                    var splitValidation = worksheet.Range(2, 13, maxValidationRow, 13).CreateDataValidation();
                    splitValidation.List(splitRange);
                    splitValidation.InCellDropdown = true;
                    splitValidation.IgnoreBlanks = true;

                    // Ensure Sheet 1 (Deductions_Entry) is the active tab when Excel opens
                    worksheet.SetTabActive();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        string safeClient = displayClient.Replace(" ", "_");
                        string safeModel = displayModel.Replace(" ", "_");
                        string filename = $"Deductions_Template_{safeClient}_{safeModel}_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}.xlsx";
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpPost("UploadDeductionExcel")]
        [Authorize]
        public async Task<IActionResult> UploadDeductionExcel(
            [FromForm] IFormFile file,
            [FromForm] long clientId,
            [FromForm] int modelId,
            [FromForm] string? fromDate = null,
            [FromForm] string? toDate = null,
            [FromForm] string? locationId = null,
            [FromForm] string? clientName = null,
            [FromForm] string? modelName = null,
            [FromForm] string? locationName = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { IsSuccess = false, Message = "Please select a valid Excel file to upload." });
                }

                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var uploadsFolder = _configuration["AppSettings:VendorDeductions"];
                if (string.IsNullOrEmpty(uploadsFolder)) uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "VendorDeductions");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
                var savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyyyy_HHmmss}{ext}";
                var physicalPath = Path.Combine(uploadsFolder, savedFileName);

                using (var fileStream = new FileStream(physicalPath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                string finalClientName = clientName ?? "";
                string finalModelName = modelName ?? "";
                try
                {
                    if (string.IsNullOrWhiteSpace(finalClientName) && clientId > 0)
                        finalClientName = await _vendorRepository.GetClientNameAsync((int)clientId);
                    if (string.IsNullOrWhiteSpace(finalModelName) && modelId > 0)
                        finalModelName = await _vendorRepository.GetModelNameAsync(modelId);
                }
                catch { }

                string? cleanLocationId = (!string.IsNullOrWhiteSpace(locationId) && locationId != "0" && !locationId.Equals("All", StringComparison.OrdinalIgnoreCase)) 
                    ? locationId 
                    : null;

                DateTime.TryParse(fromDate, out DateTime filterFromDate);
                DateTime.TryParse(toDate, out DateTime filterToDate);

                var validDeductionTypes = await GetConfiguredDeductionTypesAsync(clientId, modelId, finalClientName, finalModelName);
                var linkedVendors = (await _vendorRepository.GetLinkedVendorsAsync(clientId, modelId, cleanLocationId, companyId)).ToList();

                string selectedLocationName = locationName ?? "";
                if (string.IsNullOrWhiteSpace(selectedLocationName) && cleanLocationId != null)
                {
                    selectedLocationName = linkedVendors.FirstOrDefault(v => string.Equals(v.LocationID, cleanLocationId, StringComparison.OrdinalIgnoreCase))?.LocationName ?? cleanLocationId;
                }

                var batchId = Guid.NewGuid().ToString("N");
                var rawRows = new List<ExcelParsedDeductionRow>();

                using (var workbook = new XLWorkbook(physicalPath))
                {
                    var worksheet = workbook.Worksheets.FirstOrDefault(ws => ws.Name.Equals("Deductions_Entry", StringComparison.OrdinalIgnoreCase)) ?? workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                    {
                        return BadRequest(new { IsSuccess = false, Message = "The uploaded workbook has no worksheets." });
                    }

                    int rowNum = 1;
                    foreach (var row in worksheet.RowsUsed().Skip(1))
                    {
                        rowNum++;
                        string vendorCode = row.Cell(1).GetString().Trim();
                        string fhrid = row.Cell(2).GetString().Trim();
                        string vName = row.Cell(3).GetString().Trim();
                        string loc = row.Cell(4).GetString().Trim();
                        string cCol = row.Cell(5).GetString().Trim();
                        string mCol = row.Cell(6).GetString().Trim();
                        string rFromStr = row.Cell(7).GetString().Trim();
                        string rToStr = row.Cell(8).GetString().Trim();
                        string vType = row.Cell(9).GetString().Trim();
                        string rRoute = row.Cell(10).GetString().Trim();
                        string dType = row.Cell(11).GetString().Trim();
                        string sId = row.Cell(12).GetString().Trim();
                        string isSplitVal = row.Cell(13).GetString().Trim().ToUpperInvariant();
                        string aStr = row.Cell(14).GetString().Trim();
                        string rem = row.Cell(15).GetString().Trim();

                        // Skip headers, instructions, or example rows
                        if (vendorCode.Equals("Vendor Code", StringComparison.OrdinalIgnoreCase) || 
                            vendorCode.StartsWith("EXAMPLE", StringComparison.OrdinalIgnoreCase) ||
                            fhrid.StartsWith("EXAMPLE", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        // Skip completely empty rows or untouched pre-populated template rows (where amount, shipment ID, and remarks are all blank)
                        if (string.IsNullOrWhiteSpace(aStr) && string.IsNullOrWhiteSpace(sId) && string.IsNullOrWhiteSpace(rem))
                        {
                            continue;
                        }

                        bool isSplit = isSplitVal == "YES" || isSplitVal == "Y" || isSplitVal == "TRUE" || isSplitVal == "1";
                        decimal.TryParse(aStr, out decimal parsedAmt);

                        rawRows.Add(new ExcelParsedDeductionRow
                        {
                            RowNum = rowNum,
                            VendorCode = vendorCode,
                            FHRID = fhrid,
                            VendorName = vName,
                            Location = loc,
                            ClientCol = cCol,
                            ModelCol = mCol,
                            RowFromDateStr = rFromStr,
                            RowToDateStr = rToStr,
                            VehicleType = vType,
                            Route = rRoute,
                            DeductionType = dType,
                            ShipmentId = sId,
                            IsSplitStr = isSplitVal,
                            AmountStr = aStr,
                            Amount = parsedAmt,
                            Remarks = rem,
                            IsSplit = isSplit
                        });
                    }
                }

                if (!rawRows.Any())
                {
                    return BadRequest(new { IsSuccess = false, Message = "No data rows with Deduction details were found in the uploaded sheet." });
                }

                // ── 1. CROSS-ROW & DATABASE SHIPMENT SPLIT VALIDATION ─────────────────
                var shipmentGroups = rawRows
                    .Where(r => !string.IsNullOrWhiteSpace(r.ShipmentId))
                    .GroupBy(r => r.ShipmentId.Trim(), StringComparer.OrdinalIgnoreCase);

                foreach (var group in shipmentGroups)
                {
                    string shpId = group.Key;
                    int groupCount = group.Count();
                    bool anySplit = group.Any(r => r.IsSplit);
                    bool anySingle = group.Any(r => !r.IsSplit);

                    // A. Check for duplicate vendor on the same shipment ID within this sheet
                    var duplicateVendorsInGroup = group
                        .GroupBy(r => !string.IsNullOrWhiteSpace(r.FHRID) ? r.FHRID.Trim().ToLowerInvariant() : (!string.IsNullOrWhiteSpace(r.VendorCode) ? r.VendorCode.Trim().ToLowerInvariant() : r.RowNum.ToString()))
                        .Where(g => g.Count() > 1);

                    foreach (var dup in duplicateVendorsInGroup)
                    {
                        foreach (var r in dup)
                        {
                            r.Errors.Add($"Vendor '{r.VendorCode}' ({r.FHRID}) appears multiple times ({dup.Count()} rows) for the same Shipment ID '{shpId}' in this file. A shipment deduction cannot be assigned to the same vendor more than once.");
                        }
                    }

                    // B. Intra-file Split vs Single Checks
                    if (anySplit && anySingle)
                    {
                        foreach (var r in group)
                        {
                            r.Errors.Add($"Shipment ID '{shpId}' has conflicting split settings ('YES' and 'NO' mixed across rows). All vendor rows sharing a split shipment incident must be marked 'YES'.");
                        }
                    }
                    else if (!anySplit && groupCount > 1)
                    {
                        foreach (var r in group)
                        {
                            r.Errors.Add($"Single Shipment ID '{shpId}' is marked as 'Is Split = NO' but is repeated on {groupCount} rows. Mark as 'YES' if this is a shared split shipment penalty across vendors, or use unique Shipment IDs.");
                        }
                    }

                    // C. Check Existing Database Records for this Shipment ID
                    List<ShipmentRecoverySummaryDto> existingDbRecords = new List<ShipmentRecoverySummaryDto>();
                    try
                    {
                        var dbRecs = await _vendorRepository.GetShipmentRecoverySummaryAsync(shpId, clientId, modelId);
                        if (dbRecs != null)
                        {
                            existingDbRecords = dbRecs.ToList();
                        }
                    }
                    catch (Exception dbEx)
                    {
                        Console.WriteLine($"Error checking existing shipment '{shpId}' in DB: {dbEx.Message}");
                    }

                    if (existingDbRecords.Any())
                    {
                        bool isExistingSplitInDb = existingDbRecords.Any(x => x.IsSplitShipment);
                        var firstDb = existingDbRecords.First();

                        if (!isExistingSplitInDb)
                        {
                            // In DB, this was recorded as a Single (Non-Split) Deduction
                            if (anySingle)
                            {
                                foreach (var r in group)
                                {
                                    r.Errors.Add($"Shipment ID '{shpId}' was already deducted as a single (non-split) deduction for Vendor '{firstDb.VendorName}' ({firstDb.VendorCode}). It cannot be deducted again.");
                                }
                            }
                            else
                            {
                                foreach (var r in group)
                                {
                                    r.Errors.Add($"Shipment ID '{shpId}' is already recorded as a NON-SPLIT deduction for Vendor '{firstDb.VendorName}' ({firstDb.VendorCode}). It cannot be split across other vendors.");
                                }
                            }
                        }
                        else
                        {
                            // In DB, this is already registered as a Split Shipment
                            if (anySingle)
                            {
                                foreach (var r in group)
                                {
                                    r.Errors.Add($"Shipment ID '{shpId}' is already registered as a SPLIT shipment across multiple vendors. All rows for this shipment must be marked with 'Is Split Shipment? = YES'.");
                                }
                            }
                            else
                            {
                                // Valid continuation of existing split shipment in DB
                                // Check if any vendor in the current upload was ALREADY deducted for this shipment
                                foreach (var r in group)
                                {
                                    var matchedDb = existingDbRecords.FirstOrDefault(e => 
                                        (!string.IsNullOrWhiteSpace(r.FHRID) && string.Equals(e.FHRID, r.FHRID, StringComparison.OrdinalIgnoreCase)) ||
                                        (!string.IsNullOrWhiteSpace(r.VendorCode) && string.Equals(e.VendorCode, r.VendorCode, StringComparison.OrdinalIgnoreCase))
                                    );

                                    if (matchedDb != null)
                                    {
                                        r.Errors.Add($"Vendor '{r.VendorCode}' ({r.FHRID}) already has an existing deduction of ₹{matchedDb.SplitAmount} for Shipment ID '{shpId}'. Duplicate deduction for the same vendor is not permitted.");
                                    }
                                }

                                decimal totalUploadSplitAmount = group.Sum(x => x.Amount);
                                decimal existingTotal = existingDbRecords.Sum(e => e.SplitAmount);
                                int totalShares = existingDbRecords.Count + groupCount;
                                string existingGroupId = firstDb.SplitGroupId ?? shpId;

                                foreach (var r in group)
                                {
                                    r.SplitShareCount = totalShares;
                                    r.OriginalShipmentAmount = firstDb.OriginalShipmentAmount ?? (existingTotal + totalUploadSplitAmount);
                                    r.SplitGroupId = existingGroupId;
                                }
                            }
                        }
                    }
                    else if (anySplit)
                    {
                        // Brand new split shipment not in DB yet
                        decimal totalSplitAmount = group.Sum(x => x.Amount);
                        foreach (var r in group)
                        {
                            r.SplitShareCount = groupCount;
                            r.OriginalShipmentAmount = totalSplitAmount > 0 ? totalSplitAmount : r.Amount;
                            r.SplitGroupId = shpId;
                        }
                    }
                }

                // ── 2. INDIVIDUAL ROW VALIDATIONS ────────────────────────────────────
                foreach (var r in rawRows)
                {
                    if (r.Amount <= 0)
                    {
                        r.Errors.Add($"Deduction Amount '{r.AmountStr}' is invalid. Must be > 0.");
                    }

                    if (string.IsNullOrWhiteSpace(r.DeductionType))
                    {
                        r.Errors.Add("Deduction Type is required.");
                    }
                    else if (validDeductionTypes.Any())
                    {
                        bool isValidType = validDeductionTypes.Any(v => v.Equals(r.DeductionType, StringComparison.OrdinalIgnoreCase) || 
                                                                       ResolveDeductionColumn(v).Equals(ResolveDeductionColumn(r.DeductionType), StringComparison.OrdinalIgnoreCase));
                        if (!isValidType)
                        {
                            r.Errors.Add($"Deduction Type '{r.DeductionType}' is not applicable for Client '{finalClientName}' and Model '{finalModelName}'.");
                        }
                    }

                    bool isShipmentDeduction = (!string.IsNullOrWhiteSpace(r.DeductionType)) && (
                        r.DeductionType.Contains("Shipment", StringComparison.OrdinalIgnoreCase) ||
                        r.DeductionType.Equals("Deduction", StringComparison.OrdinalIgnoreCase) ||
                        ResolveDeductionColumn(r.DeductionType).Equals("Ded_Shipment", StringComparison.OrdinalIgnoreCase));

                    if (isShipmentDeduction)
                    {
                        if (string.IsNullOrWhiteSpace(r.ShipmentId))
                        {
                            r.Errors.Add($"Shipment / Waybill ID is mandatory for shipment deduction '{r.DeductionType}'.");
                        }
                    }
                    else
                    {
                        if (r.IsSplit)
                        {
                            r.Errors.Add($"Split deduction is only applicable for Shipment Deduction. '{r.DeductionType}' cannot be split across vendors.");
                        }
                    }

                    // Vendor Linkage Validation
                    VendorLinkedVendorDto? matchedVendor = null;
                    if (!string.IsNullOrWhiteSpace(r.FHRID))
                    {
                        matchedVendor = linkedVendors.FirstOrDefault(v => string.Equals(v.FHRID, r.FHRID, StringComparison.OrdinalIgnoreCase));
                    }
                    if (matchedVendor == null && !string.IsNullOrWhiteSpace(r.VendorCode))
                    {
                        matchedVendor = linkedVendors.FirstOrDefault(v => string.Equals(v.VendorCode, r.VendorCode, StringComparison.OrdinalIgnoreCase));
                    }

                    if (matchedVendor == null)
                    {
                        r.Errors.Add($"Vendor Code '{r.VendorCode}' / FHRID '{r.FHRID}' is not linked to selected Client '{finalClientName}', Model '{finalModelName}', and Location '{selectedLocationName}'.");
                    }
                    else
                    {
                        r.MatchedVendor = matchedVendor;
                    }

                    // Client Match Check from Excel row
                    if (string.IsNullOrWhiteSpace(r.ClientCol))
                    {
                        r.Errors.Add("Client Name is missing in Excel row.");
                    }
                    else if (!string.IsNullOrWhiteSpace(finalClientName))
                    {
                        if (!r.ClientCol.Trim().Equals(finalClientName.Trim(), StringComparison.OrdinalIgnoreCase) && 
                            !r.ClientCol.Contains(finalClientName, StringComparison.OrdinalIgnoreCase) && 
                            !finalClientName.Contains(r.ClientCol, StringComparison.OrdinalIgnoreCase))
                        {
                            r.Errors.Add($"Row Client '{r.ClientCol}' does not match the selected Client '{finalClientName}'.");
                        }
                    }

                    // Model Match Check from Excel row
                    if (string.IsNullOrWhiteSpace(r.ModelCol))
                    {
                        r.Errors.Add("Model Name is missing in Excel row.");
                    }
                    else if (!string.IsNullOrWhiteSpace(finalModelName))
                    {
                        if (!r.ModelCol.Trim().Equals(finalModelName.Trim(), StringComparison.OrdinalIgnoreCase) && 
                            !r.ModelCol.Contains(finalModelName, StringComparison.OrdinalIgnoreCase) && 
                            !finalModelName.Contains(r.ModelCol, StringComparison.OrdinalIgnoreCase))
                        {
                            r.Errors.Add($"Row Model '{r.ModelCol}' does not match the selected Model '{finalModelName}'.");
                        }
                    }

                    // Location Match Check from Excel row
                    if (cleanLocationId != null)
                    {
                        if (string.IsNullOrWhiteSpace(r.Location))
                        {
                            r.Errors.Add("Location / Hub is missing in Excel row.");
                        }
                        else if (!string.IsNullOrWhiteSpace(selectedLocationName) &&
                                 !r.Location.Trim().Equals(selectedLocationName.Trim(), StringComparison.OrdinalIgnoreCase) &&
                                 !r.Location.Contains(selectedLocationName, StringComparison.OrdinalIgnoreCase) &&
                                 !selectedLocationName.Contains(r.Location, StringComparison.OrdinalIgnoreCase))
                        {
                            r.Errors.Add($"Row Location '{r.Location}' does not match the selected Location '{selectedLocationName}'.");
                        }
                        else if (matchedVendor != null && !string.Equals(matchedVendor.LocationID, cleanLocationId, StringComparison.OrdinalIgnoreCase))
                        {
                            r.Errors.Add($"Vendor Location '{matchedVendor.LocationName}' does not match the selected Location '{selectedLocationName}'.");
                        }
                    }

                    // Cycle Date Range Check
                    DateTime cycleFrom = filterFromDate > DateTime.MinValue ? filterFromDate : DateTime.Today;
                    DateTime cycleTo = filterToDate > DateTime.MinValue ? filterToDate : DateTime.Today;

                    if (DateTime.TryParse(r.RowFromDateStr, out DateTime cFrom) && DateTime.TryParse(r.RowToDateStr, out DateTime cTo))
                    {
                        cycleFrom = cFrom;
                        cycleTo = cTo;
                        if (filterFromDate > DateTime.MinValue && filterToDate > DateTime.MinValue)
                        {
                            if (cFrom.Date != filterFromDate.Date || cTo.Date != filterToDate.Date)
                            {
                                r.Errors.Add($"Row cycle dates ({cFrom:yyyy-MM-dd} to {cTo:yyyy-MM-dd}) do not match selected cycle range ({filterFromDate:yyyy-MM-dd} to {filterToDate:yyyy-MM-dd}).");
                            }
                        }
                    }

                    r.CycleFrom = cycleFrom;
                    r.CycleTo = cycleTo;
                }

                // ── 3. ASSEMBLE PREVIEW ROWS & BATCH ITEMS ───────────────────────────
                var previewRows = new List<dynamic>();
                var items = new List<MultiVendorDeductionItemDto>();

                foreach (var r in rawRows)
                {
                    string resolvedFhrid = r.MatchedVendor?.FHRID ?? (string.IsNullOrWhiteSpace(r.FHRID) ? r.VendorCode : r.FHRID);
                    string resolvedVendorCode = r.MatchedVendor?.VendorCode ?? r.VendorCode;
                    string resolvedLocationId = r.MatchedVendor?.LocationID ?? "";
                    string resolvedLocationName = r.MatchedVendor?.LocationName ?? (string.IsNullOrWhiteSpace(r.Location) ? selectedLocationName : r.Location);
                    string resolvedVendorName = r.MatchedVendor?.VendorName ?? r.VendorName;
                    string resolvedVehicleType = !string.IsNullOrWhiteSpace(r.VehicleType) ? r.VehicleType : (r.MatchedVendor?.Vehicle_Type ?? "");
                    string resolvedRoute = !string.IsNullOrWhiteSpace(r.Route) ? r.Route : (r.MatchedVendor?.Route ?? "");

                    bool isRowValid = !r.Errors.Any();
                    string reasonStr = isRowValid ? "Validation Passed" : string.Join("; ", r.Errors);

                    previewRows.Add(new
                    {
                        RowNumber = r.RowNum,
                        VendorCode = resolvedVendorCode,
                        FHRID = resolvedFhrid,
                        VendorName = resolvedVendorName,
                        Location = resolvedLocationName,
                        ClientName = finalClientName,
                        ModelName = finalModelName,
                        VehicleType = resolvedVehicleType,
                        Route = resolvedRoute,
                        DeductionType = r.DeductionType,
                        Amount = r.Amount,
                        ShipmentId = r.ShipmentId,
                        IsSplit = r.IsSplit ? "YES" : "NO",
                        Remarks = r.Remarks,
                        Status = isRowValid ? "Uploaded" : "Not Uploaded",
                        Reason = reasonStr
                    });

                    if (isRowValid)
                    {
                        items.Add(new MultiVendorDeductionItemDto
                        {
                            FHRID = resolvedFhrid,
                            VendorCode = resolvedVendorCode,
                            LocationId = resolvedLocationId,
                            LocationName = resolvedLocationName,
                            ClientName = finalClientName,
                            ModelName = finalModelName,
                            Cycle_FromDate = r.CycleFrom,
                            Cycle_ToDate = r.CycleTo,
                            Vehicle_Type = string.IsNullOrWhiteSpace(resolvedVehicleType) ? null : resolvedVehicleType,
                            Route = string.IsNullOrWhiteSpace(resolvedRoute) ? null : resolvedRoute,
                            DeductionType = r.DeductionType,
                            StandardDbColumn = ResolveDeductionColumn(r.DeductionType),
                            ShipmentId = string.IsNullOrWhiteSpace(r.ShipmentId) ? null : r.ShipmentId,
                            Amount = r.Amount,
                            Remarks = r.Remarks,
                            IsSplitShipment = r.IsSplit,
                            OriginalShipmentAmount = r.OriginalShipmentAmount > 0 ? r.OriginalShipmentAmount : r.Amount,
                            SplitShareCount = r.SplitShareCount > 0 ? r.SplitShareCount : 1,
                            SplitGroupId = r.IsSplit ? (string.IsNullOrWhiteSpace(r.SplitGroupId) ? batchId : r.SplitGroupId) : null,
                            UploadBatchId = batchId
                        });
                    }
                }

                // ── 4. SAVE VALID ROWS TO DATABASE (PARTIAL / ROW-BY-ROW PROCESSING) ────
                int insertedCount = 0;
                bool isSuccess = false;
                string dbMessage = "";

                if (items.Any())
                {
                    var req = new SaveMultiVendorDeductionBatchRequest
                    {
                        ClientId = clientId,
                        ModelId = modelId,
                        LocationId = cleanLocationId,
                        FromDate = filterFromDate > DateTime.MinValue ? filterFromDate : null,
                        ToDate = filterToDate > DateTime.MinValue ? filterToDate : null,
                        ClientName = finalClientName,
                        ModelName = finalModelName,
                        LocationName = selectedLocationName,
                        Items = items
                    };

                    var (saveOk, saveMsg, count) = await _vendorRepository.SaveMultiVendorDeductionBatchAsync(req, userId, companyId);
                    isSuccess = saveOk;
                    dbMessage = saveMsg;
                    insertedCount = count;
                }
                else
                {
                    dbMessage = "None of the rows passed validation.";
                }

                // ── 5. ASSEMBLE DETAILED RESULT ROWS FOR PREVIEW ─────────────────────
                var finalRows = new List<dynamic>();
                foreach (var r in rawRows)
                {
                    string resolvedFhrid = r.MatchedVendor?.FHRID ?? (string.IsNullOrWhiteSpace(r.FHRID) ? r.VendorCode : r.FHRID);
                    string resolvedVendorCode = r.MatchedVendor?.VendorCode ?? r.VendorCode;
                    string resolvedLocationName = r.MatchedVendor?.LocationName ?? (string.IsNullOrWhiteSpace(r.Location) ? selectedLocationName : r.Location);
                    string resolvedVendorName = r.MatchedVendor?.VendorName ?? r.VendorName;
                    string resolvedVehicleType = !string.IsNullOrWhiteSpace(r.VehicleType) ? r.VehicleType : (r.MatchedVendor?.Vehicle_Type ?? "");
                    string resolvedRoute = !string.IsNullOrWhiteSpace(r.Route) ? r.Route : (r.MatchedVendor?.Route ?? "");

                    bool hasErrors = r.Errors.Any();
                    string status;
                    string reason;

                    if (hasErrors)
                    {
                        status = "Not Uploaded";
                        reason = r.Errors.FirstOrDefault() ?? "Validation error";
                    }
                    else if (isSuccess)
                    {
                        status = "Uploaded";
                        reason = "Uploaded successfully";
                    }
                    else
                    {
                        status = "Not Uploaded";
                        reason = !string.IsNullOrWhiteSpace(dbMessage) ? dbMessage : "Database save failed";
                    }

                    finalRows.Add(new
                    {
                        RowNumber = r.RowNum,
                        VendorCode = resolvedVendorCode,
                        FHRID = resolvedFhrid,
                        VendorName = resolvedVendorName,
                        Location = resolvedLocationName,
                        ClientName = finalClientName,
                        ModelName = finalModelName,
                        VehicleType = resolvedVehicleType,
                        Route = resolvedRoute,
                        DeductionType = r.DeductionType,
                        Amount = r.Amount,
                        ShipmentId = r.ShipmentId,
                        IsSplit = r.IsSplit ? "YES" : "NO",
                        Remarks = r.Remarks,
                        Status = status,
                        Reason = reason
                    });
                }

                int totalUploaded = isSuccess ? insertedCount : 0;
                int totalNotUploaded = rawRows.Count - totalUploaded;

                SaveDeductionHistoryRecord(uploadsFolder, new
                {
                    fileName = file.FileName,
                    savedFileName = savedFileName,
                    totalRecords = rawRows.Count,
                    successCount = totalUploaded,
                    failedCount = totalNotUploaded,
                    clientName = finalClientName,
                    modelName = finalModelName,
                    locationName = string.IsNullOrWhiteSpace(selectedLocationName) ? "All Locations" : selectedLocationName,
                    uploadedByName = !string.IsNullOrWhiteSpace(userId) ? userId : "Admin",
                    date = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    status = totalUploaded == rawRows.Count ? "Uploaded" : (totalUploaded > 0 ? "Partial" : "Failed")
                });

                // Multi-Tab Excel: Append Tab 2 (Upload Summary & Status) to physical file for review and download
                try
                {
                    using (var wb = new XLWorkbook(physicalPath))
                    {
                        var sourceWs = wb.Worksheets.FirstOrDefault(w => w.Name.Equals("Deductions_Entry", StringComparison.OrdinalIgnoreCase))
                                       ?? wb.Worksheets.FirstOrDefault(w => !w.Name.Equals("Upload Summary & Status", StringComparison.OrdinalIgnoreCase))
                                       ?? wb.Worksheet(1);

                        string summarySheetName = "Upload Summary & Status";
                        var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
                        if (existingSummary != null)
                        {
                            wb.Worksheets.Delete(existingSummary.Name);
                        }

                        var summaryWs = wb.Worksheets.Add(summarySheetName);

                        // Top Summary Metrics
                        summaryWs.Cell(1, 1).Value = "Total Records";
                        summaryWs.Cell(1, 1).Style.Font.Bold = true;
                        summaryWs.Cell(1, 1).Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
                        summaryWs.Cell(1, 1).Style.Font.FontColor = XLColor.White;
                        summaryWs.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        summaryWs.Cell(1, 2).Value = "Uploaded / Saved";
                        summaryWs.Cell(1, 2).Style.Font.Bold = true;
                        summaryWs.Cell(1, 2).Style.Fill.BackgroundColor = XLColor.FromArgb(25, 135, 84);
                        summaryWs.Cell(1, 2).Style.Font.FontColor = XLColor.White;
                        summaryWs.Cell(1, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        summaryWs.Cell(1, 3).Value = "Not Uploaded / Errors";
                        summaryWs.Cell(1, 3).Style.Font.Bold = true;
                        summaryWs.Cell(1, 3).Style.Fill.BackgroundColor = XLColor.FromArgb(220, 53, 69);
                        summaryWs.Cell(1, 3).Style.Font.FontColor = XLColor.White;
                        summaryWs.Cell(1, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        summaryWs.Cell(2, 1).Value = rawRows.Count;
                        summaryWs.Cell(2, 1).Style.Font.Bold = true;
                        summaryWs.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        summaryWs.Cell(2, 2).Value = totalUploaded;
                        summaryWs.Cell(2, 2).Style.Font.Bold = true;
                        summaryWs.Cell(2, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        summaryWs.Cell(2, 3).Value = totalNotUploaded;
                        summaryWs.Cell(2, 3).Style.Font.Bold = true;
                        summaryWs.Cell(2, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        // Detailed Table Header
                        int summaryHeaderRow = 4;
                        summaryWs.Cell(summaryHeaderRow, 1).Value = "Sr. No";
                        summaryWs.Cell(summaryHeaderRow, 2).Value = "Status";
                        summaryWs.Cell(summaryHeaderRow, 3).Value = "Reason / Error Details";

                        for (int c = 1; c <= 3; c++)
                        {
                            summaryWs.Cell(summaryHeaderRow, c).Style.Font.Bold = true;
                            summaryWs.Cell(summaryHeaderRow, c).Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                            summaryWs.Cell(summaryHeaderRow, c).Style.Font.FontColor = XLColor.White;
                        }

                        var firstRow = sourceWs.FirstRowUsed();
                        int sourceColCount = firstRow != null ? firstRow.LastCellUsed()?.Address.ColumnNumber ?? 0 : 0;
                        if (sourceColCount == 0 && sourceWs.LastColumnUsed() != null)
                        {
                            sourceColCount = sourceWs.LastColumnUsed().ColumnNumber();
                        }

                        for (int col = 1; col <= sourceColCount; col++)
                        {
                            var cell = summaryWs.Cell(summaryHeaderRow, col + 3);
                            cell.Value = sourceWs.Cell(1, col).Value;
                            cell.Style.Font.Bold = true;
                            cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                            cell.Style.Font.FontColor = XLColor.White;
                        }

                        // Data rows
                        int currRow = 5;
                        for (int i = 0; i < rawRows.Count; i++)
                        {
                            var r = rawRows[i];
                            summaryWs.Cell(currRow, 1).Value = i + 1;

                            bool rowHasError = r.Errors.Any();
                            if (rowHasError || !isSuccess)
                            {
                                summaryWs.Cell(currRow, 2).Value = "Not Uploaded";
                                summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Red;
                                summaryWs.Cell(currRow, 2).Style.Font.Bold = true;

                                summaryWs.Cell(currRow, 3).Value = r.Errors.FirstOrDefault() ?? (!string.IsNullOrWhiteSpace(dbMessage) ? dbMessage : "Validation failed");
                                summaryWs.Cell(currRow, 3).Style.Font.FontColor = XLColor.Red;
                            }
                            else
                            {
                                summaryWs.Cell(currRow, 2).Value = "Uploaded";
                                summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                                summaryWs.Cell(currRow, 2).Style.Font.Bold = true;

                                summaryWs.Cell(currRow, 3).Value = "Uploaded successfully";
                                summaryWs.Cell(currRow, 3).Style.Font.FontColor = XLColor.FromArgb(108, 117, 125);
                            }

                            int origRowNum = r.RowNum;
                            for (int col = 1; col <= sourceColCount; col++)
                            {
                                summaryWs.Cell(currRow, col + 3).Value = sourceWs.Cell(origRowNum, col).Value;
                            }

                            currRow++;
                        }

                        summaryWs.Columns().AdjustToContents();
                        wb.Save();
                    }
                }
                catch (Exception exWb)
                {
                    Console.WriteLine("Could not append summary sheet to Deduction Excel: " + exWb.Message);
                }

                string finalMessage;
                if (totalUploaded == rawRows.Count)
                {
                    finalMessage = $"Successfully imported all {totalUploaded} deduction entries!";
                }
                else if (totalUploaded > 0)
                {
                    finalMessage = $"Successfully imported {totalUploaded} valid deduction entries! {totalNotUploaded} row(s) had errors and were not uploaded (see details below).";
                }
                else
                {
                    finalMessage = $"None of the {rawRows.Count} row(s) could be uploaded: {dbMessage}";
                }

                modelResponse.IsSuccess = totalUploaded > 0;
                modelResponse.Message = finalMessage;
                modelResponse.StatusCode = totalUploaded > 0 ? 200 : 400;
                modelResponse.Data = new
                {
                    UploadedCount = totalUploaded,
                    NotUploadedCount = totalNotUploaded,
                    TotalCount = rawRows.Count,
                    Rows = finalRows,
                    BatchId = batchId
                };

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        private static void SaveDeductionHistoryRecord(string uploadsFolder, dynamic record)
        {
            try
            {
                string historyFile = Path.Combine(uploadsFolder, "deduction_upload_history.json");
                var historyList = new List<Dictionary<string, object>>();

                if (System.IO.File.Exists(historyFile))
                {
                    string existingJson = System.IO.File.ReadAllText(historyFile);
                    if (!string.IsNullOrWhiteSpace(existingJson))
                    {
                        var deserialized = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(existingJson);
                        if (deserialized != null) historyList = deserialized;
                    }
                }

                string recJson = System.Text.Json.JsonSerializer.Serialize(record);
                var dict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(recJson);
                if (dict != null)
                {
                    historyList.Insert(0, dict);
                    if (historyList.Count > 100) historyList = historyList.Take(100).ToList();
                    System.IO.File.WriteAllText(historyFile, System.Text.Json.JsonSerializer.Serialize(historyList, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
                }
            }
            catch { }
        }

        [HttpGet("GetDeductionUploadedFiles")]
        [Authorize]
        public IActionResult GetDeductionUploadedFiles()
        {
            try
            {
                var uploadsFolder = _configuration["AppSettings:VendorDeductions"];
                if (string.IsNullOrEmpty(uploadsFolder)) uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "VendorDeductions");
                string historyFile = Path.Combine(uploadsFolder, "deduction_upload_history.json");

                if (System.IO.File.Exists(historyFile))
                {
                    string existingJson = System.IO.File.ReadAllText(historyFile);
                    if (!string.IsNullOrWhiteSpace(existingJson))
                    {
                        var deserialized = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, object>>>(existingJson);
                        return Ok(new ModelResponse { IsSuccess = true, Data = deserialized, StatusCode = 200 });
                    }
                }
                return Ok(new ModelResponse { IsSuccess = true, Data = new List<object>(), StatusCode = 200 });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        [HttpGet("DownloadDeductionUploadedFile")]
        [Authorize]
        public IActionResult DownloadDeductionUploadedFile([FromQuery] string fileName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(fileName)) return BadRequest("File name is required.");
                var uploadsFolder = _configuration["AppSettings:VendorDeductions"];
                if (string.IsNullOrEmpty(uploadsFolder)) uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "VendorDeductions");
                var cleanFile = Path.GetFileName(fileName);
                var physicalPath = Path.Combine(uploadsFolder, cleanFile);

                if (!System.IO.File.Exists(physicalPath))
                {
                    // Search for partial match in folder
                    var match = Directory.GetFiles(uploadsFolder, $"*{cleanFile}*").FirstOrDefault();
                    if (match != null) physicalPath = match;
                    else return NotFound("File not found on server.");
                }

                var bytes = System.IO.File.ReadAllBytes(physicalPath);
                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", cleanFile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private class ExcelParsedDeductionRow
        {
            public int RowNum { get; set; }
            public string VendorCode { get; set; } = "";
            public string FHRID { get; set; } = "";
            public string VendorName { get; set; } = "";
            public string Location { get; set; } = "";
            public string ClientCol { get; set; } = "";
            public string ModelCol { get; set; } = "";
            public string RowFromDateStr { get; set; } = "";
            public string RowToDateStr { get; set; } = "";
            public string VehicleType { get; set; } = "";
            public string Route { get; set; } = "";
            public string DeductionType { get; set; } = "";
            public string ShipmentId { get; set; } = "";
            public string IsSplitStr { get; set; } = "";
            public string AmountStr { get; set; } = "";
            public string Remarks { get; set; } = "";
            public bool IsSplit { get; set; }
            public decimal Amount { get; set; }
            public DateTime CycleFrom { get; set; }
            public DateTime CycleTo { get; set; }
            public int SplitShareCount { get; set; } = 1;
            public decimal OriginalShipmentAmount { get; set; }
            public string? SplitGroupId { get; set; }
            public VendorLinkedVendorDto? MatchedVendor { get; set; }
            public List<string> Errors { get; set; } = new List<string>();
        }

        private static string ResolveDeductionColumn(string deductionType)
        {
            string lower = (deductionType ?? "").Trim().ToLowerInvariant();
            if (lower.Contains("shipment") || lower == "deduction") return "Ded_Shipment";
            if (lower.Contains("cod")) return "Ded_COD";
            if (lower.Contains("advance")) return "Ded_Advance";
            if (lower.Contains("hold")) return "Ded_Hold";
            if (lower.Contains("insurance")) return "Ded_Insurance";
            if (lower.Contains("welfare")) return "Ded_Welfare";
            if (lower.Contains("karma")) return "Ded_KarmaLife";
            if (lower.Contains("arrear")) return "Ded_Arrear";
            if (lower.Contains("rent")) return "Ded_Rent";
            if (lower.Contains("tnt")) return "Ded_TNT";
            if (lower == "sd") return "Ded_SD";
            return "Ded_Other";
        }

        [HttpGet("GetFactBoxSummary")]
        [Authorize]
        public async Task<IActionResult> GetFactBoxSummary(
            [FromQuery] long clientId, 
            [FromQuery] int modelId, 
            [FromQuery] string fhrid, 
            [FromQuery] DateTime fromDate, 
            [FromQuery] DateTime toDate,
            [FromQuery] string? locationId = null,
            [FromQuery] string? vehicleType = null,
            [FromQuery] string? route = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var summary = await _vendorRepository.GetFactBoxDeductionSummaryAsync(clientId, modelId, locationId, fhrid, fromDate, toDate, companyId, vehicleType, route);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Fact box summary fetched successfully.";
                modelResponse.Data = summary;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("SyncDeductions")]
        [Authorize]
        public async Task<IActionResult> SyncDeductions([FromBody] SyncDeductionsRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";

                var (isSuccess, message) = await _vendorRepository.SyncVendorDeductionsAsync(request, userId, companyId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetDeductionBreakdown")]
        [Authorize]
        public async Task<IActionResult> GetDeductionBreakdown([FromQuery] long transactionId, [FromQuery] string? column = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var list = await _vendorRepository.GetDeductionBreakdownAsync(transactionId, column);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Deduction breakdown fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("TransactionSyncList")]
        [Authorize]
        public async Task<IActionResult> GetTransactionSyncList(
            [FromQuery] int clientId,
            [FromQuery] int modelId,
            [FromQuery] string transactionRange,
            [FromQuery] string? locationId = null,
            [FromQuery] string? vendorCode = null,
            [FromQuery] string? searchTerm = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var (totalVendors, syncedCount, pendingCount, totalNetPayable, totalRows, rows) =
                    await _vendorRepository.GetVendorTransactionForSyncAsync(
                        clientId, modelId, locationId, transactionRange, vendorCode, searchTerm ?? "", pageIndex, pageSize);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Transaction sync list fetched successfully.";
                modelResponse.Data = new
                {
                    TotalVendors = totalVendors,
                    SyncedCount = syncedCount,
                    PendingCount = pendingCount,
                    TotalNetPayable = totalNetPayable,
                    TotalRows = totalRows,
                    Rows = rows
                };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("SyncTransactions")]
        [Authorize]
        public async Task<IActionResult> SyncTransactions([FromBody] SyncTransactionsRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (request == null)
                    return BadRequest(new ModelResponse { IsSuccess = false, Message = "Invalid request payload.", StatusCode = 400 });

                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                string userName = HttpContext.Items["DecryptedUserName"]?.ToString() ?? userId;

                var (isSuccess, message, updatedCount) = await _vendorRepository.SyncVendorTransactionsAsync(
                    request, userId, userName, companyId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.Data = new { UpdatedCount = updatedCount };
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("UpdateTransactionRecoveryPercent")]
        [Authorize]
        public async Task<IActionResult> UpdateTransactionRecoveryPercent([FromBody] UpdateTransactionRecoveryPercentRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (request == null || request.TransactionId <= 0)
                    return BadRequest(new ModelResponse { IsSuccess = false, Message = "Invalid transaction ID.", StatusCode = 400 });

                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "System";
                var (isSuccess, message) = await _vendorRepository.UpdateTransactionRecoveryPercentAsync(
                    request.TransactionId, request.RecoveryPercent, userId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }


        [HttpGet("GetRecoveryMISReport")]
        [Authorize]
        public async Task<IActionResult> GetRecoveryMISReport(
            [FromQuery] DateTime fromDate, 
            [FromQuery] DateTime toDate,
            [FromQuery] long? clientId = null, 
            [FromQuery] int? modelId = null, 
            [FromQuery] string? locationId = null, 
            [FromQuery] string recoveryStatus = "ALL")
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = await _vendorRepository.GetDeductionRecoveryMISReportAsync(clientId, modelId, locationId, fromDate, toDate, recoveryStatus, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Recovery MIS report fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("ExportRecoveryMISReport")]
        [Authorize]
        public async Task<IActionResult> ExportRecoveryMISReport(
            [FromQuery] DateTime fromDate, 
            [FromQuery] DateTime toDate,
            [FromQuery] long? clientId = null, 
            [FromQuery] int? modelId = null, 
            [FromQuery] string? locationId = null, 
            [FromQuery] string recoveryStatus = "ALL")
        {
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var list = (await _vendorRepository.GetDeductionRecoveryMISReportAsync(clientId, modelId, locationId, fromDate, toDate, recoveryStatus, companyId))?.ToList() ?? new List<DeductionRecoveryMISDto>();

                using (var workbook = new ClosedXML.Excel.XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Deduction Recovery MIS");
                    string[] headers = new string[] {
                        "POC Entry No", "Entry Date", "Client Name", "Model", "Hub / Location", 
                        "Vehicle Type", "Route / Block",
                        "FHR ID", "Vendor Code", "Vendor Name", "Deduction Type", "Shipment ID", 
                        "Original Amount", "Cycle 1 Range", "Cycle 1 Recovered", "Cycle 2 Recovered", 
                        "Total Recovered", "Pending Balance", "Recovery Status", "Recovery Remarks"
                    };

                    for (int c = 0; c < headers.Length; c++)
                    {
                        var cell = worksheet.Cell(1, c + 1);
                        cell.Value = headers[c];
                        cell.Style.Font.Bold = true;
                        cell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromHtml("#0b5a7a");
                        cell.Style.Font.FontColor = ClosedXML.Excel.XLColor.White;
                    }

                    int row = 2;
                    foreach (var item in list)
                    {
                        worksheet.Cell(row, 1).Value = item.POC_EntryNo;
                        worksheet.Cell(row, 2).Value = item.EntryDate.ToString("yyyy-MM-dd HH:mm");
                        worksheet.Cell(row, 3).Value = item.ClientName;
                        worksheet.Cell(row, 4).Value = item.ModelName;
                        worksheet.Cell(row, 5).Value = item.HubName;
                        worksheet.Cell(row, 6).Value = item.Vehicle_Type ?? "-";
                        worksheet.Cell(row, 7).Value = item.Route ?? "-";
                        worksheet.Cell(row, 8).Value = item.FHRID;
                        worksheet.Cell(row, 9).Value = item.VendorCode;
                        worksheet.Cell(row, 10).Value = item.VendorName;
                        worksheet.Cell(row, 11).Value = item.DeductionType;
                        worksheet.Cell(row, 12).Value = item.ShipmentID ?? "-";
                        worksheet.Cell(row, 13).Value = item.OriginalAmount;
                        worksheet.Cell(row, 14).Value = item.Cycle1_Range;
                        worksheet.Cell(row, 15).Value = item.Cycle1_Recovered;
                        worksheet.Cell(row, 16).Value = item.Cycle2_Recovered;
                        worksheet.Cell(row, 17).Value = item.Total_Recovered;
                        worksheet.Cell(row, 18).Value = item.Pending_Balance;
                        worksheet.Cell(row, 19).Value = item.RecoveryStatus;
                        worksheet.Cell(row, 20).Value = item.RecoveryRemarks ?? "";
                        row++;
                    }

                    worksheet.Columns().AdjustToContents();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Deduction_Recovery_MIS_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpGet("GetRecoveryPolicy")]
        [Authorize]
        public async Task<IActionResult> GetRecoveryPolicy([FromQuery] long? clientId = null, [FromQuery] int? modelId = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var policy = await _vendorRepository.GetDeductionRecoveryPolicyAsync(clientId, modelId, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Recovery policy retrieved successfully.";
                modelResponse.Data = policy;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("SaveRecoveryPolicy")]
        [Authorize]
        public async Task<IActionResult> SaveRecoveryPolicy([FromBody] SaveRecoveryPolicyRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "System";
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var (isSuccess, message) = await _vendorRepository.SaveDeductionRecoveryPolicyAsync(request, userId, companyId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetRecoveryPolicyAuditLog")]
        [Authorize]
        public async Task<IActionResult> GetRecoveryPolicyAuditLog([FromQuery] long? clientId = null, [FromQuery] int? modelId = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var logs = await _vendorRepository.GetDeductionRecoveryPolicyAuditLogAsync(clientId, modelId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Audit log retrieved successfully.";
                modelResponse.Data = logs;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("SaveOpeningDeficit")]
        [Authorize]
        public async Task<IActionResult> SaveOpeningDeficit([FromBody] SaveOpeningDeficitRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "System";
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var (isSuccess, message) = await _vendorRepository.SaveOpeningDeficitAsync(request, userId, companyId);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("BulkUploadOpeningDeficit")]
        [Authorize]
        public async Task<IActionResult> BulkUploadOpeningDeficit(IFormFile file)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { IsSuccess = false, Message = "Please select a valid Excel file to upload." });
                }

                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "System";
                string companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var items = new List<BulkOpeningDeficitItemDto>();
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var workbook = new XLWorkbook(stream))
                    {
                        var worksheet = workbook.Worksheets.FirstOrDefault();
                        if (worksheet == null)
                        {
                            return BadRequest(new { IsSuccess = false, Message = "Uploaded Excel file contains no worksheets." });
                        }

                        var rows = worksheet.RangeUsed().RowsUsed().Skip(1);
                        foreach (var row in rows)
                        {
                            string fhrid = row.Cell(1).GetString().Trim();
                            string vendorCode = row.Cell(2).GetString().Trim();
                            long.TryParse(row.Cell(3).GetString().Trim(), out long clientId);
                            int.TryParse(row.Cell(4).GetString().Trim(), out int modelId);
                            string locationId = row.Cell(5).GetString().Trim();
                            decimal.TryParse(row.Cell(6).GetString().Trim(), out decimal deficitAmount);
                            string dateStr = row.Cell(7).GetString().Trim();
                            DateTime? cutoffDate = DateTime.TryParse(dateStr, out DateTime dt) ? dt : null;
                            string remarks = row.Cell(8).GetString().Trim();

                            if (!string.IsNullOrWhiteSpace(fhrid) && deficitAmount > 0)
                            {
                                items.Add(new BulkOpeningDeficitItemDto
                                {
                                    FHRID = fhrid,
                                    VendorCode = vendorCode,
                                    ClientId = clientId,
                                    ModelId = modelId,
                                    LocationId = locationId,
                                    DeficitAmount = deficitAmount,
                                    CutoffDate = cutoffDate,
                                    Remarks = string.IsNullOrWhiteSpace(remarks) ? "Opening Deficit (Bulk Upload)" : remarks
                                });
                            }
                        }
                    }
                }

                if (!items.Any())
                {
                    return BadRequest(new { IsSuccess = false, Message = "No valid data rows with FHRID and Deficit Amount > 0 were found in the uploaded sheet." });
                }

                var (isSuccess, message, count) = await _vendorRepository.BulkSaveOpeningDeficitsAsync(items, userId, companyId);
                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.Data = new { UploadedCount = count };
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("DownloadOpeningDeficitTemplate")]
        [Authorize]
        public IActionResult DownloadOpeningDeficitTemplate()
        {
            try
            {
                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Opening_Deficits");
                    var headers = new[]
                    {
                        "FHRID *",
                        "Vendor Code (Optional)",
                        "Client ID *",
                        "Model ID *",
                        "Location ID (Optional)",
                        "Opening Deficit Amount (₹) *",
                        "Cutoff Date (YYYY-MM-DD)",
                        "Remarks"
                    };

                    for (int i = 0; i < headers.Length; i++)
                    {
                        var cell = worksheet.Cell(1, i + 1);
                        cell.Value = headers[i];
                        cell.Style.Font.Bold = true;
                        cell.Style.Fill.BackgroundColor = XLColor.FromArgb(13, 110, 253);
                        cell.Style.Font.FontColor = XLColor.White;
                        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    }

                    worksheet.Cell(2, 1).Value = "SANTOSH LENKA / ISPT / 208226290";
                    worksheet.Cell(2, 2).Value = "V4031";
                    worksheet.Cell(2, 3).Value = 316;
                    worksheet.Cell(2, 4).Value = 4;
                    worksheet.Cell(2, 5).Value = "All";
                    worksheet.Cell(2, 6).Value = 20000.00;
                    worksheet.Cell(2, 7).Value = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");
                    worksheet.Cell(2, 8).Value = "Opening deficit migrated from legacy ERP";

                    worksheet.Columns().AdjustToContents();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Vendor_Opening_Deficit_Template.xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { IsSuccess = false, Message = ex.Message });
            }
        }

        [HttpGet("GetOpeningDeficitsList")]
        [Authorize]
        public async Task<IActionResult> GetOpeningDeficitsList(
            [FromQuery] long? clientId = null,
            [FromQuery] int? modelId = null,
            [FromQuery] string? locationId = null,
            [FromQuery] string? searchTerm = null)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var companyId = User.Claims.FirstOrDefault(c => c.Type == "companyId")?.Value ?? string.Empty;
                var list = await _vendorRepository.GetOpeningDeficitsListAsync(clientId, modelId, locationId, searchTerm, companyId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Opening deficits fetched successfully.";
                modelResponse.Data = list;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpDelete("DeleteOpeningDeficit/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteOpeningDeficit(long id)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value ?? "SYSTEM";
                var (isSuccess, message) = await _vendorRepository.DeleteOpeningDeficitAsync(id, userId);
                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpGet("GetPaymentSettlementList")]
        [Authorize]
        public async Task<IActionResult> GetPaymentSettlementList(
            [FromQuery] int clientId,
            [FromQuery] int modelId,
            [FromQuery] string? locationId,
            [FromQuery] string transactionRange,
            [FromQuery] string? vendorCode,
            [FromQuery] string? paymentStatus = "Pending",
            [FromQuery] int? isDeductionsSynced = null,
            [FromQuery] string? searchTerm = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50)
        {
            var modelResponse = new ModelResponse();
            try
            {
                var (totalRecords, kpiTotalCount, kpiPendingCount, kpiPaidCount, kpiTotalPendingAmount, kpiTotalPaidAmount, kpiSyncedCount, kpiUnsyncedCount, rows) =
                    await _vendorRepository.GetPaymentSettlementListAsync(
                        clientId, modelId, locationId, transactionRange, vendorCode, paymentStatus, isDeductionsSynced, searchTerm ?? "", pageIndex, pageSize);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Payment settlement list fetched successfully.";
                modelResponse.Data = new
                {
                    TotalRecords = totalRecords,
                    KpiTotalCount = kpiTotalCount,
                    KpiPendingCount = kpiPendingCount,
                    KpiPaidCount = kpiPaidCount,
                    KpiTotalPendingAmount = kpiTotalPendingAmount,
                    KpiTotalPaidAmount = kpiTotalPaidAmount,
                    KpiSyncedCount = kpiSyncedCount,
                    KpiUnsyncedCount = kpiUnsyncedCount,
                    Rows = rows
                };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("RecordPayment")]
        [Authorize]
        public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (request == null)
                    return BadRequest(new ModelResponse { IsSuccess = false, Message = "Invalid request payload.", StatusCode = 400 });

                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? User.Claims.FirstOrDefault(c => c.Type == "id")?.Value ?? "SYSTEM";
                string userName = HttpContext.Items["DecryptedUserName"]?.ToString() ?? userId;

                var (isSuccess, message, updatedCount, batchNo) = await _vendorRepository.RecordPaymentAsync(
                    request, userId, userName);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.Data = new { UpdatedCount = updatedCount, BatchNo = batchNo };
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }

        [HttpPost("RevertPayment")]
        [Authorize]
        public async Task<IActionResult> RevertPayment([FromBody] RevertPaymentRequest request)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (request == null || request.TransactionId <= 0)
                    return BadRequest(new ModelResponse { IsSuccess = false, Message = "Invalid transaction ID.", StatusCode = 400 });

                string userId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? User.Claims.FirstOrDefault(c => c.Type == "id")?.Value ?? "SYSTEM";
                string userName = HttpContext.Items["DecryptedUserName"]?.ToString() ?? userId;

                var (isSuccess, message) = await _vendorRepository.RevertPaymentAsync(
                    request.TransactionId, request.Remarks, userId, userName);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;
                return isSuccess ? Ok(modelResponse) : BadRequest(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return StatusCode(500, modelResponse);
            }
        }
    }



}












