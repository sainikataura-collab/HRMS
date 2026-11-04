using ClosedXML.Excel;
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class UploadFileHistoryRepository : IUploadFileHistoryRepository
    {
        private readonly IConfiguration _configuration;

        public UploadFileHistoryRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetUploadFolder(string fileType)
        {
            string configKey = fileType?.ToUpper() switch
            {
                "EMP_IMPORT" or "EMPLOYEE_IMPORT" => "AppSettings:EmployeeImportUploads",
                "EMP_OTHER_DETAILS_IMPORT" => "AppSettings:EmployeeOtherDetailsImportUploads",
                "SALARY_HEAD_IMPORT" => "AppSettings:SalaryHeadImportUploads",
                "SALARY_OTHER_HEAD_IMPORT" => "AppSettings:SalaryOtherHeadImportUploads",
                "DAYWISE_ATT_IMPORT" => "AppSettings:DaywiseAttendanceImportUploads",
                "ATT_IMPORT" => "AppSettings:AttendanceImportUploads",
                _ => $"AppSettings:{fileType}Uploads"
            };

            string? folder = _configuration[configKey];
            if (!string.IsNullOrWhiteSpace(folder))
            {
                try
                {
                    if (!Directory.Exists(folder))
                    {
                        Directory.CreateDirectory(folder);
                    }
                    return folder;
                }
                catch
                {
                    // Fall through to fallback directories
                }
            }

            // Fallback 1: AppContext.BaseDirectory / Uploads
            try
            {
                folder = Path.Combine(AppContext.BaseDirectory, "Uploads", fileType ?? "General");
                if (!Directory.Exists(folder))
                {
                    Directory.CreateDirectory(folder);
                }
                return folder;
            }
            catch
            {
                // Fallback 2: Path.GetTempPath() / HRMS_Uploads
                try
                {
                    folder = Path.Combine(Path.GetTempPath(), "HRMS_Uploads", fileType ?? "General");
                    if (!Directory.Exists(folder))
                    {
                        Directory.CreateDirectory(folder);
                    }
                    return folder;
                }
                catch
                {
                    return Path.GetTempPath();
                }
            }
        }

        private (int totalRecords, int successCount, int failedCount) AppendSummarySheet(string filePath, string? resultDataJson)
        {
            if (!File.Exists(filePath)) return (0, 0, 0);

            int totalRecords = 0;
            int successCount = 0;
            int failedCount = 0;

            var errorMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var successSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var rowStatusList = new List<(string status, string message)>();
            string fallbackErrorMsg = "";

            if (!string.IsNullOrEmpty(resultDataJson))
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(resultDataJson);
                    var root = doc.RootElement;

                    if (root.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        if (root.TryGetProperty("isSuccess", out var isSuccessProp) || root.TryGetProperty("IsSuccess", out isSuccessProp) ||
                            root.TryGetProperty("success", out isSuccessProp) || root.TryGetProperty("Success", out isSuccessProp))
                        {
                            if (isSuccessProp.ValueKind == System.Text.Json.JsonValueKind.False)
                            {
                                fallbackErrorMsg = GetJsonString(root, "message", "Message", "error", "Error", "remarks", "Remarks");
                            }
                        }

                        if (root.TryGetProperty("TotalCount", out var tc) || root.TryGetProperty("totalCount", out tc) ||
                            root.TryGetProperty("TotalRecords", out tc) || root.TryGetProperty("totalRecords", out tc))
                            totalRecords = tc.GetInt32();

                        if (root.TryGetProperty("SuccessCount", out var sc) || root.TryGetProperty("successCount", out sc))
                            successCount = sc.GetInt32();
                        if (root.TryGetProperty("ErrorCount", out var ec) || root.TryGetProperty("errorCount", out ec) ||
                            root.TryGetProperty("FailedCount", out ec) || root.TryGetProperty("failedCount", out ec))
                            failedCount = ec.GetInt32();

                        if (root.TryGetProperty("ErrorList", out var el) || root.TryGetProperty("errorList", out el))
                        {
                            foreach (var item in el.EnumerateArray())
                            {
                                string code = GetJsonString(item, "empcode", "EmpCode", "empCode", "code", "Code", "fhrid", "FHRID", "vendorcode", "VendorCode");
                                string msg = GetJsonString(item, "message", "Message", "remarks", "Remarks", "error", "Error");
                                if (!string.IsNullOrEmpty(code))
                                {
                                    errorMap[code] = msg;
                                }
                            }
                        }

                        if (root.TryGetProperty("SuccessList", out var sl) || root.TryGetProperty("successList", out sl))
                        {
                            foreach (var item in sl.EnumerateArray())
                            {
                                string code = GetJsonString(item, "empcode", "EmpCode", "empCode", "code", "Code", "fhrid", "FHRID", "vendorcode", "VendorCode");
                                if (!string.IsNullOrEmpty(code))
                                {
                                    successSet.Add(code);
                                }
                            }
                        }

                        // Check if object wraps an array in data, Data, list, List, items, Items, rows, Rows, result, Result
                        System.Text.Json.JsonElement arrayElem = default;
                        bool foundNestedArray = false;
                        string[] arrayPropNames = new[] { "data", "Data", "list", "List", "items", "Items", "rows", "Rows", "result", "Result", "table", "Table" };
                        foreach (var prop in arrayPropNames)
                        {
                            if (root.TryGetProperty(prop, out var propElem) && propElem.ValueKind == System.Text.Json.JsonValueKind.Array)
                            {
                                arrayElem = propElem;
                                foundNestedArray = true;
                                break;
                            }
                        }

                        if (foundNestedArray)
                        {
                            ParseJsonArray(arrayElem, ref successCount, ref failedCount, successSet, errorMap, rowStatusList);
                        }
                    }
                    else if (root.ValueKind == System.Text.Json.JsonValueKind.Array)
                    {
                        ParseJsonArray(root, ref successCount, ref failedCount, successSet, errorMap, rowStatusList);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error parsing resultDataJson: {ex.Message}");
                }
            }

            try
            {
                using var wb = new XLWorkbook(filePath);
                string summarySheetName = "Upload Summary & Status";
                var existingSummary = wb.Worksheets.FirstOrDefault(w => w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase));
                if (existingSummary != null)
                {
                    wb.Worksheets.Delete(existingSummary.Name);
                }

                var sourceWs = wb.Worksheets.FirstOrDefault(w => !w.Name.Equals(summarySheetName, StringComparison.OrdinalIgnoreCase)) ?? wb.Worksheet(1);
                if (sourceWs == null) return (totalRecords, successCount, failedCount);

                int sourceLastRow = sourceWs.LastRowUsed()?.RowNumber() ?? 1;
                int fileTotalRecords = sourceLastRow > 1 ? sourceLastRow - 1 : 0;
                if (totalRecords == 0 && fileTotalRecords > 0)
                {
                    totalRecords = fileTotalRecords;
                }

                if (successCount == 0 && failedCount == 0)
                {
                    if (rowStatusList.Count > 0)
                    {
                        successCount = rowStatusList.Count(r => r.status.Equals("Uploaded", StringComparison.OrdinalIgnoreCase) || r.status.Equals("Success", StringComparison.OrdinalIgnoreCase));
                        failedCount = rowStatusList.Count - successCount;
                    }
                    else if (errorMap.Count > 0 || successSet.Count > 0)
                    {
                        failedCount = errorMap.Count;
                        successCount = totalRecords >= failedCount ? totalRecords - failedCount : successSet.Count;
                    }
                    else if (!string.IsNullOrEmpty(fallbackErrorMsg))
                    {
                        failedCount = totalRecords;
                        successCount = 0;
                    }
                    else
                    {
                        successCount = totalRecords;
                        failedCount = 0;
                    }
                }

                var summaryWs = wb.Worksheets.Add(summarySheetName);

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

                summaryWs.Cell(2, 1).Value = totalRecords;
                summaryWs.Cell(2, 1).Style.Font.Bold = true;
                summaryWs.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                summaryWs.Cell(2, 2).Value = successCount;
                summaryWs.Cell(2, 2).Style.Font.Bold = true;
                summaryWs.Cell(2, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                summaryWs.Cell(2, 3).Value = failedCount;
                summaryWs.Cell(2, 3).Style.Font.Bold = true;
                summaryWs.Cell(2, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                // Header for Detailed Records
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

                int empCodeCol = -1;
                for (int col = 1; col <= sourceColCount; col++)
                {
                    string headerVal = sourceWs.Cell(1, col).GetString()?.Trim().ToLowerInvariant() ?? "";
                    string cleanHeader = headerVal.Replace("_", "").Replace(" ", "").Replace("-", "");
                    if (cleanHeader == "empcode" || cleanHeader == "employeecode" || cleanHeader == "code" ||
                        cleanHeader == "fhrid" || cleanHeader == "vendorcode" || cleanHeader == "vendorhfrid" ||
                        cleanHeader == "vendorid" || cleanHeader == "employeeid" || cleanHeader == "empid")
                    {
                        empCodeCol = col;
                    }
                    var cell = summaryWs.Cell(summaryHeaderRow, col + 2);
                    cell.Value = sourceWs.Cell(1, col).Value;
                    cell.Style.Font.Bold = true;
                    cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 58, 64);
                    cell.Style.Font.FontColor = XLColor.White;
                }

                // Copy Data Rows and Set Status
                int currRow = 5;
                for (int r = 2; r <= sourceLastRow; r++)
                {
                    int dataIdx = r - 2;
                    summaryWs.Cell(currRow, 1).Value = dataIdx + 1;

                    string rowEmpCode = empCodeCol > 0 ? sourceWs.Cell(r, empCodeCol).GetString()?.Trim() ?? "" : "";

                    bool isFailed = false;
                    string failMsg = "";
                    string successMsg = "";

                    if (!string.IsNullOrEmpty(rowEmpCode) && errorMap.TryGetValue(rowEmpCode, out var errMsg))
                    {
                        isFailed = true;
                        failMsg = errMsg;
                    }
                    else if (!string.IsNullOrEmpty(rowEmpCode) && successSet.Contains(rowEmpCode))
                    {
                        isFailed = false;
                    }
                    else if (dataIdx < rowStatusList.Count)
                    {
                        var (st, msg) = rowStatusList[dataIdx];
                        if (st.Equals("Error", StringComparison.OrdinalIgnoreCase) || st.Equals("Failed", StringComparison.OrdinalIgnoreCase))
                        {
                            isFailed = true;
                            failMsg = msg;
                        }
                        else
                        {
                            isFailed = false;
                            successMsg = msg;
                        }
                    }
                    else if (!string.IsNullOrEmpty(fallbackErrorMsg) && successSet.Count == 0 && rowStatusList.Count == 0)
                    {
                        isFailed = true;
                        failMsg = fallbackErrorMsg;
                    }

                    if (isFailed)
                    {
                        summaryWs.Cell(currRow, 2).Value = string.IsNullOrEmpty(failMsg) ? "Failed" : $"Failed - {failMsg}";
                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Red;
                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                    }
                    else
                    {
                        summaryWs.Cell(currRow, 2).Value = !string.IsNullOrEmpty(successMsg) ? $"Uploaded - {successMsg}" : "Uploaded";
                        summaryWs.Cell(currRow, 2).Style.Font.FontColor = XLColor.Green;
                        summaryWs.Cell(currRow, 2).Style.Font.Bold = true;
                    }

                    for (int col = 1; col <= sourceColCount; col++)
                    {
                        summaryWs.Cell(currRow, col + 2).Value = sourceWs.Cell(r, col).Value;
                    }
                    currRow++;
                }

                // Fast fixed column widths (avoids CPU-heavy AdjustToContents on 1000+ rows)
                summaryWs.Column(1).Width = 10;
                summaryWs.Column(2).Width = 35;
                for (int c = 3; c <= sourceColCount + 2; c++)
                {
                    summaryWs.Column(c).Width = 18;
                }

                wb.Save();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error writing summary sheet to {filePath}: {ex.Message}");
            }

            return (totalRecords, successCount, failedCount);
        }

        private static void ParseJsonArray(System.Text.Json.JsonElement arrayElem, ref int successCount, ref int failedCount, HashSet<string> successSet, Dictionary<string, string> errorMap, List<(string status, string message)> rowStatusList)
        {
            foreach (var item in arrayElem.EnumerateArray())
            {
                bool isSuccess = IsStatusSuccess(item, out string st, out string msg, out string code);

                if (isSuccess)
                {
                    successCount++;
                    if (!string.IsNullOrEmpty(code)) successSet.Add(code);
                    rowStatusList.Add(("Uploaded", msg));
                }
                else
                {
                    failedCount++;
                    string errorReason = !string.IsNullOrEmpty(msg) ? msg : (!string.IsNullOrEmpty(st) && !st.Equals("Failed", StringComparison.OrdinalIgnoreCase) && !st.Equals("Error", StringComparison.OrdinalIgnoreCase) ? st : "Validation failed");
                    if (!string.IsNullOrEmpty(code)) errorMap[code] = errorReason;
                    rowStatusList.Add(("Failed", errorReason));
                }
            }
        }

        private static bool IsStatusSuccess(System.Text.Json.JsonElement item, out string statusText, out string messageText, out string codeText)
        {
            statusText = GetJsonString(item, "status", "Status", "upload_status", "UploadStatus", "state", "State", "result", "Result");
            messageText = GetJsonString(item, "message", "Message", "remarks", "Remarks", "error", "Error", "reason", "Reason", "description", "Description", "errorMessage", "ErrorMessage");
            codeText = GetJsonString(item, "empcode", "EmpCode", "emp_code", "Emp_Code", "employeecode", "EmployeeCode", "code", "Code", "fhrid", "FHRID", "vendor_hfrid", "vendorcode", "VendorCode", "id", "Id");

            // Check explicit boolean isSuccess / success properties if present
            if (item.TryGetProperty("isSuccess", out var b) || item.TryGetProperty("IsSuccess", out b) ||
                item.TryGetProperty("success", out b) || item.TryGetProperty("Success", out b) ||
                item.TryGetProperty("valid", out b) || item.TryGetProperty("Valid", out b))
            {
                if (b.ValueKind == System.Text.Json.JsonValueKind.True) return true;
                if (b.ValueKind == System.Text.Json.JsonValueKind.False) return false;
            }

            string stLower = statusText.Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(stLower))
            {
                if (!string.IsNullOrEmpty(messageText))
                {
                    string msgLower = messageText.Trim().ToLowerInvariant();
                    if (msgLower == "success" || msgLower == "uploaded" || msgLower == "updated" || msgLower == "inserted" || msgLower == "valid" || msgLower == "ok")
                    {
                        return true;
                    }
                    if (msgLower.Contains("fail") || msgLower.Contains("error") || msgLower.Contains("invalid") || msgLower.Contains("not found") || msgLower.Contains("mismatch") || msgLower.Contains("exist") || msgLower.Contains("duplicate"))
                    {
                        return false;
                    }
                }
                return false;
            }

            // Only explicit success statuses count as successful
            if (stLower == "success" || stLower == "successful" || stLower == "uploaded" || stLower == "inserted" ||
                stLower == "updated" || stLower == "valid" || stLower == "true" || stLower == "1" || stLower == "ok" || stLower == "pass" || stLower == "passed")
            {
                return true;
            }

            // Any error text (e.g. "Employee code already exists in system.", "Location not found", "Duplicate", "Failed", etc.) is NOT success
            return false;
        }

        private static string GetJsonString(System.Text.Json.JsonElement elem, params string[] propNames)
        {
            foreach (var p in propNames)
            {
                if (elem.TryGetProperty(p, out var val))
                {
                    return val.GetString() ?? val.ToString();
                }
            }
            return string.Empty;
        }

        private (int total, int success, int failed) GetOrExtractMetricsFromFile(string fileType, string fileName)
        {
            try
            {
                string targetFolder = GetUploadFolder(fileType);
                string fullPath = Path.Combine(targetFolder, fileName);
                if (!File.Exists(fullPath))
                {
                    var candidatePaths = new[]
                    {
                        Path.Combine(AppContext.BaseDirectory, "Uploads", fileType ?? "General", fileName),
                        Path.Combine(Directory.GetCurrentDirectory(), "Uploads", fileType ?? "General", fileName),
                        Path.Combine(Path.GetTempPath(), "HRMS_Uploads", fileType ?? "General", fileName)
                    };

                    foreach (var path in candidatePaths)
                    {
                        if (File.Exists(path))
                        {
                            fullPath = path;
                            break;
                        }
                    }
                }

                if (!File.Exists(fullPath)) return (0, 0, 0);

                using var wb = new XLWorkbook(fullPath);
                var summaryWs = wb.Worksheets.FirstOrDefault(w => w.Name.Equals("Upload Summary & Status", StringComparison.OrdinalIgnoreCase));
                if (summaryWs != null)
                {
                    int tot = 0, succ = 0, fail = 0;
                    if (int.TryParse(summaryWs.Cell(2, 1).GetString(), out int t1)) tot = t1;
                    else if (summaryWs.Cell(2, 1).TryGetValue<int>(out int t2)) tot = t2;

                    if (int.TryParse(summaryWs.Cell(2, 2).GetString(), out int s1)) succ = s1;
                    else if (summaryWs.Cell(2, 2).TryGetValue<int>(out int s2)) succ = s2;

                    if (int.TryParse(summaryWs.Cell(2, 3).GetString(), out int f1)) fail = f1;
                    else if (summaryWs.Cell(2, 3).TryGetValue<int>(out int f2)) fail = f2;

                    if (tot > 0 || succ > 0 || fail > 0)
                    {
                        return (tot, succ, fail);
                    }
                }

                // If no summary sheet exists, return (0, 0, 0) without falsely assuming 100% success
                return (0, 0, 0);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading metrics from {fileName}: {ex.Message}");
            }
            return (0, 0, 0);
        }

        public async Task<long> SaveUploadHistoryAsync(IFormFile file, string fileType, string entryBy, string companyId, string? resultDataJson = null)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File cannot be empty.", nameof(file));
            }

            string targetFolder = GetUploadFolder(fileType);
            string rawNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
            string extension = Path.GetExtension(file.FileName);
            string cleanFileName = System.Text.RegularExpressions.Regex.Replace(rawNameWithoutExt, @"[^\w\-\.]", "_");

            // Format: filename_userid_date(ddmmyyyy)_time
            string datePart = DateTime.Now.ToString("ddMMyyyy");
            string timePart = DateTime.Now.ToString("HHmmss");
            string formattedFileName = $"{cleanFileName}_{entryBy}_{datePart}_{timePart}{extension}";
            string fullPath = Path.Combine(targetFolder, formattedFileName);

            try
            {
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Primary path save failed for {fullPath}: {ex.Message}. Trying fallback directory...");
                targetFolder = Path.Combine(Path.GetTempPath(), "HRMS_Uploads", fileType ?? "General");
                if (!Directory.Exists(targetFolder))
                {
                    Directory.CreateDirectory(targetFolder);
                }
                fullPath = Path.Combine(targetFolder, formattedFileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }

            int totalRecords = 0;
            int successCount = 0;
            int failedCount = 0;

            // Append Sheet 2 (Upload Summary & Status) if it's an Excel file
            if (extension.Equals(".xlsx", StringComparison.OrdinalIgnoreCase) || extension.Equals(".xls", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var counts = AppendSummarySheet(fullPath, resultDataJson);
                    totalRecords = counts.totalRecords;
                    successCount = counts.successCount;
                    failedCount = counts.failedCount;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding summary sheet to {fullPath}: {ex.Message}");
                }
            }

            var parameters = new DynamicParameters();
            parameters.Add("@file_type", fileType ?? string.Empty, DbType.String);
            parameters.Add("@entry_by", entryBy ?? string.Empty, DbType.String);
            parameters.Add("@file_name", formattedFileName, DbType.String);
            parameters.Add("@company_id", companyId ?? string.Empty, DbType.String);
            parameters.Add("@total_records", totalRecords, DbType.Int32);
            parameters.Add("@success_count", successCount, DbType.Int32);
            parameters.Add("@failed_count", failedCount, DbType.Int32);

            int result = DataBaseFactory.QuerySP("USP_Upload_File_History_Insert", parameters, "Upload_File_History_Insert");
            return result;
        }

        public async Task<(int totalCount, IEnumerable<UploadFileHistoryModel> list)> GetUploadHistoryListAsync(string fileType, string companyId, string entryBy, int pageIndex, int pageSize)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@file_type", fileType ?? string.Empty, DbType.String);
                parameters.Add("@company_id", companyId ?? string.Empty, DbType.String);
                parameters.Add("@entry_by", entryBy ?? string.Empty, DbType.String);
                parameters.Add("@userId", entryBy ?? string.Empty, DbType.String);
                parameters.Add("@pageIndex", pageIndex < 1 ? 1 : pageIndex, DbType.Int32);
                parameters.Add("@pageSize", pageSize < 1 ? 5 : pageSize, DbType.Int32);

                var tuple = DataBaseFactory.QueryMultipleSP<dynamic, UploadFileHistoryModel>(
                    "USP_Upload_File_History_GetList",
                    parameters,
                    "Upload_File_History_GetList"
                );

                List<UploadFileHistoryModel> list;
                int totalCount = 0;

                if (tuple == null || tuple.Item2 == null)
                {
                    // Fallback to single result set if SP returns single list
                    var singleList = DataBaseFactory.QuerySP<UploadFileHistoryModel>("USP_Upload_File_History_GetList", parameters, "Upload_File_History_GetList");
                    list = singleList?.ToList() ?? new List<UploadFileHistoryModel>();
                    totalCount = list.Count;
                }
                else
                {
                    totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                        ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First())
                        : tuple.Item2.Count();
                    list = tuple.Item2.ToList();
                }

                // Deduplicate any repeated records caused by multiple user/company joins in DB
                list = list
                    .GroupBy(x => x.id > 0 ? (object)x.id : (object)$"{x.file_name}_{x.entry_date}")
                    .Select(g => g.First())
                    .ToList();

                foreach (var item in list)
                {
                    int currentTotal = item.totalRecords ?? item.total_records ?? 0;
                    if (currentTotal == 0 && !string.IsNullOrEmpty(item.file_name))
                    {
                        var (t, s, f) = GetOrExtractMetricsFromFile(item.file_type, item.file_name);
                        if (t > 0 || s > 0 || f > 0)
                        {
                            item.totalRecords = t;
                            item.total_records = t;
                            item.successCount = s;
                            item.success_count = s;
                            item.failedCount = f;
                            item.failed_count = f;

                            try
                            {
                                using var conn = DataBaseFactory.ConnString();
                                conn.Open();
                                conn.Execute("UPDATE Upload_File_History SET total_records = @t, success_count = @s, failed_count = @f WHERE id = @id", new { t, s, f, id = item.id });
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error updating metrics in DB for id {item.id}: {ex.Message}");
                            }
                        }
                    }
                }

                return (totalCount, list);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUploadHistoryListAsync for fileType {fileType}: {ex.Message}");
                return (0, new List<UploadFileHistoryModel>());
            }
        }
        public async Task<(byte[] fileBytes, string fileName, string contentType)?> GetFileBytesByIdAsync(long id, string companyId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@id", id, DbType.Int64);
            parameters.Add("@company_id", companyId ?? string.Empty, DbType.String);

            var doc = DataBaseFactory.QuerySP<UploadFileHistoryModel>(
                "USP_Upload_File_History_GetById",
                parameters,
                "Upload_File_History_GetById"
            )?.FirstOrDefault();

            if (doc == null || string.IsNullOrEmpty(doc.file_name))
            {
                return null;
            }

            string fileName = doc.file_name;
            string fileType = doc.file_type;

            string targetFolder = GetUploadFolder(fileType);
            string fullPath = Path.Combine(targetFolder, fileName);

            if (!File.Exists(fullPath))
            {
                var candidatePaths = new[]
                {
                    Path.Combine(AppContext.BaseDirectory, "Uploads", fileType ?? "General", fileName),
                    Path.Combine(Directory.GetCurrentDirectory(), "Uploads", fileType ?? "General", fileName),
                    Path.Combine(Path.GetTempPath(), "HRMS_Uploads", fileType ?? "General", fileName)
                };

                foreach (var path in candidatePaths)
                {
                    if (File.Exists(path))
                    {
                        fullPath = path;
                        break;
                    }
                }
            }

            if (!File.Exists(fullPath))
            {
                return null;
            }

            byte[] bytes = await File.ReadAllBytesAsync(fullPath);
            string ext = Path.GetExtension(fileName).ToLowerInvariant();
            string contentType = ext switch
            {
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xls" => "application/vnd.ms-excel",
                ".csv" => "text/csv",
                _ => "application/octet-stream"
            };

            return (bytes, fileName, contentType);
        }
    }
}
