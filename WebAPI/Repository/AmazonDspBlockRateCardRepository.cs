using ClosedXML.Excel;
using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class AmazonDspBlockRateCardRepository : IAmazonDspBlockRateCardRepository
    {
        private readonly IConfiguration _configuration;

        public AmazonDspBlockRateCardRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<AmazonDspBlockRateCardResponseModel> InsertAsync(AmazonDspBlockRateCardModel model, string userId, string companyId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@LocationID", string.IsNullOrWhiteSpace(model.LocationID) ? null : model.LocationID, DbType.String);
                dynamicParameters.Add("@Block", string.IsNullOrWhiteSpace(model.Block) ? null : model.Block, DbType.String);
                dynamicParameters.Add("@VehicleType", string.IsNullOrWhiteSpace(model.VehicleType) ? null : model.VehicleType, DbType.String);
                dynamicParameters.Add("@Rate", string.IsNullOrWhiteSpace(model.Rate) ? null : model.Rate, DbType.String);
                dynamicParameters.Add("@EffectiveFrom", model.EffectiveFrom, DbType.DateTime);
                dynamicParameters.Add("@fk_CompanyID", companyId ?? "", DbType.String);
                dynamicParameters.Add("@Source", string.IsNullOrWhiteSpace(model.Source) ? "Form Entry" : model.Source, DbType.String);
                dynamicParameters.Add("@FilePath", string.IsNullOrWhiteSpace(model.FilePath) ? null : model.FilePath, DbType.String);
                dynamicParameters.Add("@fk_InsUserID", userId ?? "", DbType.String);

                var result = DataBaseFactory.QuerySP<AmazonDspBlockRateCardResponseModel>(
                    "Amazon_Dsp_BlockRateCard_Ins", dynamicParameters, "Amazon_Dsp_BlockRateCard_Ins").FirstOrDefault();

                return result ?? new AmazonDspBlockRateCardResponseModel { IsSuccessfully = false, IsMessage = "Failed to insert rate card." };
            }
            catch (Exception ex)
            {
                return new AmazonDspBlockRateCardResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        public async Task<AmazonDspBlockRateCardResponseModel> UpdateAsync(AmazonDspBlockRateCardModel model, string userId, string companyId)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_BlockRateCardID", model.pk_BlockRateCardID, DbType.Int64);
                dynamicParameters.Add("@LocationID", string.IsNullOrWhiteSpace(model.LocationID) ? null : model.LocationID, DbType.String);
                dynamicParameters.Add("@Block", string.IsNullOrWhiteSpace(model.Block) ? null : model.Block, DbType.String);
                dynamicParameters.Add("@VehicleType", string.IsNullOrWhiteSpace(model.VehicleType) ? null : model.VehicleType, DbType.String);
                dynamicParameters.Add("@Rate", string.IsNullOrWhiteSpace(model.Rate) ? null : model.Rate, DbType.String);
                dynamicParameters.Add("@EffectiveFrom", model.EffectiveFrom, DbType.DateTime);
                dynamicParameters.Add("@fk_CompanyID", companyId ?? "", DbType.String);
                dynamicParameters.Add("@Source", string.IsNullOrWhiteSpace(model.Source) ? null : model.Source, DbType.String);
                dynamicParameters.Add("@FilePath", string.IsNullOrWhiteSpace(model.FilePath) ? null : model.FilePath, DbType.String);
                dynamicParameters.Add("@fk_UpdUserID", userId ?? "", DbType.String);

                var result = DataBaseFactory.QuerySP<AmazonDspBlockRateCardResponseModel>(
                    "Amazon_Dsp_BlockRateCard_Upd", dynamicParameters, "Amazon_Dsp_BlockRateCard_Upd").FirstOrDefault();

                return result ?? new AmazonDspBlockRateCardResponseModel { IsSuccessfully = false, IsMessage = "Failed to update rate card." };
            }
            catch (Exception ex)
            {
                return new AmazonDspBlockRateCardResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        public async Task<AmazonDspBlockRateCardResponseModel> DeleteAsync(long id)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_BlockRateCardID", id, DbType.Int64);

                var result = DataBaseFactory.QuerySP<AmazonDspBlockRateCardResponseModel>(
                    "Amazon_Dsp_BlockRateCard_Del", dynamicParameters, "Amazon_Dsp_BlockRateCard_Del").FirstOrDefault();

                return result ?? new AmazonDspBlockRateCardResponseModel { IsSuccessfully = false, IsMessage = "Failed to delete rate card." };
            }
            catch (Exception ex)
            {
                return new AmazonDspBlockRateCardResponseModel { IsSuccessfully = false, IsMessage = ex.Message };
            }
        }

        public async Task<AmazonDspBlockRateCardModel?> GetByIdAsync(long id)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pk_BlockRateCardID", id, DbType.Int64);

                var rateCard = DataBaseFactory.QuerySP<AmazonDspBlockRateCardModel>(
                    "Amazon_Dsp_BlockRateCard_GetById", dynamicParameters, "Amazon_Dsp_BlockRateCard_GetById").FirstOrDefault();

                return rateCard;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetByIdAsync: " + ex.Message);
                return null;
            }
        }

        public async Task<(int totalCount, IEnumerable<AmazonDspBlockRateCardModel> list)> GetListAsync(int pageIndex, int pageSize, string companyId, string searchTerm, string? userId = "")
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@pageIndex", pageIndex, DbType.Int32);
                dynamicParameters.Add("@pageSize", pageSize, DbType.Int32);
                dynamicParameters.Add("@fk_CompanyID", companyId ?? "", DbType.String);
                dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);
                dynamicParameters.Add("@fk_UserID", userId ?? "", DbType.String);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, AmazonDspBlockRateCardModel>(
                    "Amazon_Dsp_BlockRateCard_SelForGrid", dynamicParameters, "Amazon_Dsp_BlockRateCard_SelForGrid");

                if (tuple == null || tuple.Item2 == null)
                    return (0, new List<AmazonDspBlockRateCardModel>());

                int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                    ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                    : 0;

                return (totalCount, tuple.Item2.ToList());
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetListAsync: " + ex.Message);
                return (0, new List<AmazonDspBlockRateCardModel>());
            }
        }

        //=============================Amazon DSP Block RateCard=============

        public async Task<List<BlockRateCardUploadRowModel>> UploadBlockRateCardExcelAsync(IFormFile file, string? companyId = null, string? userId = null)
        {
            var resultList = new List<BlockRateCardUploadRowModel>();
            if (file == null || file.Length == 0) return resultList;

            try
            {
                // 1. Physical file saving with timestamped naming convention
                string uploadFolder = _configuration?["AppSettings:BlockRateCardUploads"]!;
                if (string.IsNullOrEmpty(uploadFolder))
                {
                    uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "BlockRateCardUploads");
                }
                if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
                string ext = Path.GetExtension(file.FileName);
                string savedFileName = $"{fileNameWithoutExt}_{DateTime.Now:ddMMyy_HHmmss}{ext}";
                string savedFilePath = Path.Combine(uploadFolder, savedFileName);

                using (var fs = new FileStream(savedFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }

                // 2. Read Excel rows and build XML Request
                using var workbook = new XLWorkbook(savedFilePath);
                var worksheet = workbook.Worksheets.FirstOrDefault();
                if (worksheet == null) return resultList;

                var headerRow = worksheet.Row(1);
                var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                foreach (var cell in headerRow.CellsUsed())
                {
                    string headerText = cell.GetValue<string>().Trim().Replace(" ", "").Replace("_", "");
                    if (!string.IsNullOrEmpty(headerText) && !colMap.ContainsKey(headerText))
                    {
                        colMap[headerText] = cell.Address.ColumnNumber;
                    }
                }

                string GetVal(IXLRow r, string key, int fallbackCol)
                {
                    if (colMap.TryGetValue(key, out int colIdx))
                    {
                        return r.Cell(colIdx).GetValue<string>().Trim();
                    }
                    if (fallbackCol > 0)
                    {
                        return r.Cell(fallbackCol).GetValue<string>().Trim();
                    }
                    return string.Empty;
                }

                int lastRowNumber = worksheet.LastRowUsed()?.RowNumber() ?? 0;
                var xmlRequest = new AmazonDspBlockRateCardXmlRequest();

                for (int rowNumber = 2; rowNumber <= lastRowNumber; rowNumber++)
                {
                    var row = worksheet.Row(rowNumber);
                    string location = GetVal(row, "LOCATION", 1);
                    string block = GetVal(row, "BLOCK", 2);
                    string vehicleType = GetVal(row, "VEHICLETYPE", 3);
                    string rate = GetVal(row, "RATE", 4);
                    string effectiveDate = GetVal(row, "EFFECTIVEDATE", 5);

                    // Skip completely empty rows
                    if (string.IsNullOrWhiteSpace(location) && string.IsNullOrWhiteSpace(block) && string.IsNullOrWhiteSpace(vehicleType))
                    {
                        continue;
                    }

                    xmlRequest.Rows.Add(new AmazonDspBlockRateCardXmlItem
                    {
                        Location = location,
                        Block = block,
                        VehicleType = vehicleType,
                        Rate = rate,
                        EffectiveDate = effectiveDate
                    });
                }

                if (xmlRequest.Rows.Count == 0)
                {
                    resultList.Add(new BlockRateCardUploadRowModel
                    {
                        Status = "Failed",
                        Message = "No valid data rows found in Excel file.",
                        IsSuccess = false
                    });
                    return resultList;
                }

                // 3. Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(xmlRequest);
                if (xmlData.StartsWith("<?xml"))
                {
                    int idx = xmlData.IndexOf("?>");
                    if (idx != -1)
                    {
                        xmlData = xmlData.Substring(idx + 2).Trim();
                    }
                }

                // 4. Call Single Stored Procedure
                var p = new DynamicParameters();
                p.Add("@Doc", xmlData, DbType.Xml);
                p.Add("@FileName", savedFileName, DbType.String);
                p.Add("@FilePath", savedFilePath, DbType.String);
                p.Add("@fk_companyId", companyId ?? "", DbType.String);
                p.Add("@fk_userId", userId ?? "", DbType.String);

                var dbResult = DataBaseFactory.QuerySP<BlockRateCardUploadRowModel>(
                    "Usp_AmazonDspBlockRateCard_Upload",
                    p,
                    "Usp_AmazonDspBlockRateCard_Upload"
                );

                if (dbResult != null && dbResult.Any())
                {
                    resultList = dbResult.ToList();
                }
                else
                {
                    resultList.Add(new BlockRateCardUploadRowModel
                    {
                        Status = "Uploaded",
                        Message = "Block rate card records processed successfully.",
                        IsSuccess = true
                    });
                }

                // 5. Multi-Tab Excel: Append 'Upload Summary & Status' worksheet in background task
                if (resultList.Any())
                {
                    var resultsForExcel = resultList.ToList();
                    _ = Task.Run(() =>
                    {
                        try
                        {
                            if (File.Exists(savedFilePath))
                            {
                                using (var wb = new XLWorkbook(savedFilePath))
                                {
                                    string summarySheetName = "Upload Summary & Status";
                                    var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
                                    if (existingSummary != null)
                                    {
                                        wb.Worksheets.Delete(existingSummary.Name);
                                    }

                                    var summaryWs = wb.Worksheets.Add(summarySheetName);

                                    int totalRecords = resultsForExcel.Count;
                                    int successCount = resultsForExcel.Count(r => r.IsSuccess || r.Status == "Uploaded" || r.Status == "Success" || r.Status == "Inserted" || r.Status == "Updated");
                                    int failedCount = totalRecords - successCount;

                                    // Top Summary Metrics Header
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

                                    // Top Summary Metrics Values
                                    summaryWs.Cell(2, 1).Value = totalRecords;
                                    summaryWs.Cell(2, 1).Style.Font.Bold = true;
                                    summaryWs.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    summaryWs.Cell(2, 2).Value = successCount;
                                    summaryWs.Cell(2, 2).Style.Font.Bold = true;
                                    summaryWs.Cell(2, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    summaryWs.Cell(2, 3).Value = failedCount;
                                    summaryWs.Cell(2, 3).Style.Font.Bold = true;
                                    summaryWs.Cell(2, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                                    // Detailed Rows Header
                                    int summaryHeaderRow = 4;
                                    string[] headers = new string[] {
                                        "Sr. No", "Status", "Location", "Block", "Vehicle Type", "Rate", "Effective Date"
                                    };
                                    for (int i = 0; i < headers.Length; i++)
                                    {
                                        var cell = summaryWs.Cell(summaryHeaderRow, i + 1);
                                        cell.Value = headers[i];
                                        cell.Style.Font.Bold = true;
                                        cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                                        cell.Style.Font.FontColor = XLColor.White;
                                    }

                                    // Detailed Rows Data
                                    int currRow = 5;
                                    for (int i = 0; i < resultsForExcel.Count; i++)
                                    {
                                        var item = resultsForExcel[i];
                                        bool isRowUploaded = item.IsSuccess || item.Status == "Uploaded" || item.Status == "Updated" || item.Status == "Success" || item.Status == "Inserted";
                                        string rowStatus = isRowUploaded
                                            ? "Uploaded"
                                            : (!string.IsNullOrEmpty(item.Message) ? item.Message : (!string.IsNullOrEmpty(item.Status) ? item.Status : "Failed"));

                                        summaryWs.Cell(currRow, 1).Value = i + 1;
                                        summaryWs.Cell(currRow, 2).Value = rowStatus;
                                        summaryWs.Cell(currRow, 3).Value = item.Location ?? "";
                                        summaryWs.Cell(currRow, 4).Value = item.Block ?? "";
                                        summaryWs.Cell(currRow, 5).Value = item.VehicleType ?? "";
                                        summaryWs.Cell(currRow, 6).Value = item.Rate ?? "";
                                        summaryWs.Cell(currRow, 7).Value = item.EffectiveDate ?? "";

                                        if (isRowUploaded)
                                        {
                                            summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                                            summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                        }
                                        else
                                        {
                                            summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Red;
                                            summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                                        }

                                        currRow++;
                                    }

                                    summaryWs.Columns().AdjustToContents();
                                    wb.Save();
                                }
                            }
                        }
                        catch (Exception exWb)
                        {
                            Console.WriteLine("Could not append summary sheet to Excel: " + exWb.Message);
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in UploadBlockRateCardExcelAsync: " + ex.Message);
                resultList.Add(new BlockRateCardUploadRowModel
                {
                    Status = "Failed",
                    Message = "File parsing/database error: " + ex.Message,
                    IsSuccess = false
                });
            }

            return resultList;
        }

        public async Task<(int totalCount, IEnumerable<BlockRateCardUploadFileItemModel> list)> GetExcelUploadListAsync(string? companyId, string? searchTerm, int pageIndex = 1, int pageSize = 10)
        {
            try
            {
                DynamicParameters p = new DynamicParameters();
                p.Add("@fk_companyId", companyId ?? "", DbType.String);
                p.Add("@searchTerm", searchTerm ?? "", DbType.String);
                p.Add("@pageIndex", pageIndex, DbType.Int32);
                p.Add("@pageSize", pageSize, DbType.Int32);

                var list = DataBaseFactory.QuerySP<BlockRateCardUploadFileItemModel>("AmazonDspBlockRateCard_GetUploadFileList", p, "AmazonDspBlockRateCard_GetUploadFileList")?.ToList() ?? new List<BlockRateCardUploadFileItemModel>();

                int totalCount = list.FirstOrDefault()?.TotalCount ?? list.Count;
                return (totalCount, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in AmazonDspBlockRateCard GetExcelUploadListAsync: " + ex.Message);
                return (0, Enumerable.Empty<BlockRateCardUploadFileItemModel>());
            }
        }

        public async Task<BlockRateCardUploadFileItemModel?> GetExcelUploadFileByIdAsync(int id)
        {
            try
            {
                DynamicParameters p = new DynamicParameters();
                p.Add("@File_Id", id, DbType.Int32);

                var result = DataBaseFactory.QuerySP<BlockRateCardUploadFileItemModel>("AmazonDspBlockRateCard_GetUploadFileById", p, "AmazonDspBlockRateCard_GetUploadFileById");
                return result?.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetExcelUploadFileByIdAsync: " + ex.Message);
                return null;
            }
        }



    }
}
