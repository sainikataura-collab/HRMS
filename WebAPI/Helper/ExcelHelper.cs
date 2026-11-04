

using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using System.ComponentModel;
using System.Globalization;
using System.Xml.Linq;
using static HRMSWebAPI.Models.ImportExcle;

public static class ExcelHelper
{


    private static string FormatSalaryComparisonHeader(string col)
    {
        if (string.IsNullOrEmpty(col)) return string.Empty;
        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "EmpCode", "Emp Code" },
            { "EmpName", "Emp Name" },
            { "ClientName", "Client Name" },
            { "FatherName", "Father Name" },
            { "MotherName", "Mother Name" },
            { "PanNo", "Pan No" },
            { "AdharNo", "Adhar No" },
            { "DOB", "DOB" },
            { "Location", "Location" },
            { "Department", "Department" },
            { "glposting", "GL Posting" },
            { "Designation", "Designation" },
            { "Grade", "Grade" },
            { "CityName", "City Name" },
            { "StateName", "State Name" },
            { "LWFApp", "LWF App" },
            { "ProfTaxApp", "Prof Tax App" },
            { "Category", "Category" },
            { "JoiningDate", "Joining Date" },
            { "LeaveDate", "Leave Date" },
            { "UANNo", "UAN No" },
            { "PFNo", "PF No" },
            { "ESINo", "ESI No" },
            { "PaidDays", "Paid Days" },
            { "IncentiveDays", "Incentive Days" },
            { "ArrearDays", "Arrear Days" },
            { "ArrearAmount", "Arrear Amount" },
            { "WorkingDays", "Working Days" },
            { "woff", "Weekly Off" },
            { "CL", "CL" },
            { "EL", "EL" },
            { "SL", "SL" },
            { "PL", "PL" },
            { "ML", "ML" },
            { "LWP", "LWP" },
            { "OTHrs", "OT Hrs" },
            { "DoubleNH", "Double NH" },
            { "RateGross", "Rate Gross" },
            { "EarnGross", "Earn Gross" },
            { "GrossTotal", "Gross Total" },
            { "PF", "PF" },
            { "VolPF", "Vol PF" },
            { "ESI", "ESI" },
            { "LWF", "LWF" },
            { "ProfTax", "Prof Tax" },
            { "IT", "IT" },
            { "TotalDeductions", "Total Deductions" },
            { "NetPay", "Net Pay" },
            { "OTGross", "OT Gross" },
            { "OTDays", "OT Days" },
            { "OT", "OT" },
            { "OTEsiGross", "OT Esi Gross" },
            { "OTEsi", "OT Esi" },
            { "NetOT", "Net OT" },
            { "NHAmt", "NH Amt" },
            { "NHEsiGross", "NH Esi Gross" },
            { "NHEsi", "NH Esi" },
            { "NetNHAmt", "Net NH Amt" },
            { "SalTransfer", "Sal Transfer" },
            { "BankAcNo", "Bank Acc No" },
            { "BankAccNo", "Bank Acc No" },
            { "BankName", "Bank Name" },
            { "IFSCCode", "IFSC Code" }
        };

        if (map.TryGetValue(col, out var formatted))
            return formatted;

        return System.Text.RegularExpressions.Regex.Replace(col, "([a-z])([A-Z])", "$1 $2").Replace("_", " ").Trim();
    }
    public static List<IDictionary<string, object>> EnrichExportRowsWithAliases(IEnumerable<dynamic>? rows, string? companyId)
    {
        var resultList = new List<IDictionary<string, object>>();
        if (rows == null) return resultList;

        foreach (var item in rows)
        {
            var dict = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            if (item is IDictionary<string, object> d)
            {
                foreach (var kvp in d)
                {
                    dict[kvp.Key] = kvp.Value;
                }
            }
            else
            {
                foreach (PropertyDescriptor prop in TypeDescriptor.GetProperties(item))
                {
                    dict[prop.Name] = prop.GetValue(item);
                }
            }

            // Bonus aliases
            if (dict.TryGetValue("BonusPay", out var bonusPayVal) && bonusPayVal != null)
            {
                if (!dict.ContainsKey("Bonus")) dict["Bonus"] = bonusPayVal;
                if (!dict.ContainsKey("Bonus Pay")) dict["Bonus Pay"] = bonusPayVal;
            }
            else if (dict.TryGetValue("Bonus", out var bonusVal) && bonusVal != null)
            {
                if (!dict.ContainsKey("BonusPay")) dict["BonusPay"] = bonusVal;
                if (!dict.ContainsKey("Bonus Pay")) dict["Bonus Pay"] = bonusVal;
            }

            // Leave / LTA aliases
            if (dict.TryGetValue("LTA", out var ltaVal) && ltaVal != null)
            {
                if (!dict.ContainsKey("LeaveWages")) dict["LeaveWages"] = ltaVal;
                if (!dict.ContainsKey("Leave Wages")) dict["Leave Wages"] = ltaVal;
            }
            else if (dict.TryGetValue("LeaveWages", out var leaveVal) && leaveVal != null)
            {
                if (!dict.ContainsKey("LTA")) dict["LTA"] = leaveVal;
                if (!dict.ContainsKey("Leave Wages")) dict["Leave Wages"] = leaveVal;
            }

            // Conveyance aliases
            object? convVal = null;
            if (dict.TryGetValue("ConvReim", out convVal) ||
                dict.TryGetValue("ConveyanceReimbursement", out convVal) ||
                dict.TryGetValue("CONVEYANCE", out convVal) ||
                dict.TryGetValue("Conveyance", out convVal) ||
                dict.TryGetValue("Conyenance", out convVal))
            {
                if (convVal != null)
                {
                    if (!dict.ContainsKey("ConvAll")) dict["ConvAll"] = convVal;
                    if (!dict.ContainsKey("Conv")) dict["Conv"] = convVal;
                }
            }

            // Other / Special / Wash Allow aliases
            if (dict.TryGetValue("Other", out var otherVal) && otherVal != null)
            {
                if (!dict.ContainsKey("Other_Spcl_Wash_Allow")) dict["Other_Spcl_Wash_Allow"] = otherVal;
            }
            else if (dict.TryGetValue("SpecialAllowance", out var spclVal) && spclVal != null)
            {
                if (!dict.ContainsKey("Other_Spcl_Wash_Allow")) dict["Other_Spcl_Wash_Allow"] = spclVal;
            }

            // Accom_Allow
            if (dict.TryGetValue("Accom_Allow", out var accomVal) && accomVal != null)
            {
                if (!dict.ContainsKey("AccomAllow")) dict["AccomAllow"] = accomVal;
            }

            resultList.Add(dict);
        }

        return resultList;
    }
    public static async Task<byte[]> GenerateExcelReportAsyncnottosum(
string reportName,
List<IDictionary<string, object>> results,
string? contractorName,
string? dateHeaderText,
Func<Task<dynamic>>? getCompanyNameFunc = null,
string[]? columnsNotToSum = null)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Report");

        int currentRow = 1;
        int headerStartCol = 1;

        // 🔹 Extract company name & filter headers
        var firstRow = results.First();


        string companyName = "Unknown Company";

        // 🔹 Get company name from repo if provided
        if (getCompanyNameFunc != null)
        {
            var companyResult = await getCompanyNameFunc();
            if (companyResult != null)
            {
                if (companyResult is IDictionary<string, object> dict)
                    companyName = dict.ContainsKey("Company Name")
                        ? dict["Company Name"]?.ToString() ?? "Unknown Company"
                        : "Unknown Company";
                else
                    companyName = companyResult?.ToString() ?? "Unknown Company";
            }
        }



        //var tableHeaders = firstRow.Keys
        //    .Where(k => k.ToLower() != "compname" && k.ToLower() != "company name")
        //    .ToList();
        var excludedColumns = new[] { "empid", "compname", "company name", "fk_empid", "pk_id", "pk_rentId" };
        var tableHeaders = firstRow.Keys
    .Where(k => !excludedColumns.Contains(k.ToLower()))
    .ToList();

        int totalReportColumns = Math.Max(tableHeaders.Count, 6);



        var customHeaders = new List<(string Text, double FontSize, bool Bold)>
{
    ($"{companyName}", 16, true)
};

        if (!string.IsNullOrEmpty(reportName) && reportName != "Report")
            customHeaders.Add(($"{reportName}", 12, true));

        if (!string.IsNullOrEmpty(contractorName))
            customHeaders.Add(($"{contractorName}", 14, true));

        if (!string.IsNullOrEmpty(dateHeaderText))
            customHeaders.Add(($"{dateHeaderText}", 10, true));

        foreach (var header in customHeaders)
        {
            var headerCell = worksheet.Cell(currentRow, headerStartCol);
            headerCell.Value = header.Text;
            headerCell.Style.Font.Bold = header.Bold;
            headerCell.Style.Font.FontSize = header.FontSize;

            worksheet.Range(currentRow, headerStartCol, currentRow, totalReportColumns)
                     .Merge()
                     .Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
                     .Alignment.SetVertical(XLAlignmentVerticalValues.Center);

            currentRow++;
        }

        currentRow++; // spacing

        // 🔹 Table headers
        for (int i = 0; i < tableHeaders.Count; i++)
        {
            var cell = worksheet.Cell(currentRow, headerStartCol + i);
            cell.Value = tableHeaders[i];
            //string headerText = tableHeaders[i];

            //// ✅ If header is a date like "26-Aug-25" or "03/10/2025", show only the day
            //if (DateTime.TryParse(headerText, out var headerDate))
            //{
            //    headerText = headerDate.Day.ToString();
            //}

            //cell.Value = headerText;

            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 10;
            cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }
        // currentRow++;
        int headerRowNumber = currentRow;   // 👉 Save the header row number
        currentRow++;

        // 🧊 Freeze the header row so it stays visible while scrolling
        worksheet.SheetView.FreezeRows(headerRowNumber);


        // 🔹 Data rows
        foreach (var row in results)
        {
            int col = 0;
            foreach (var header in tableHeaders)
            {
                //var val = row.ContainsKey(header) ? row[header] : string.Empty;
                //var dataCell = worksheet.Cell(currentRow, headerStartCol + col);

                //if (DateTime.TryParse(val?.ToString(), out var dateValue))
                //{
                //    dataCell.Value = dateValue;
                //    dataCell.Style.NumberFormat.Format = "dd/MM/yyyy";
                //}
                //else if (
                //    !(columnsNotToSum?.Contains(header, StringComparer.OrdinalIgnoreCase) ?? false)
                //    && decimal.TryParse(val?.ToString(), out var numValue))
                //{
                //    dataCell.Value = numValue;
                //    dataCell.Style.NumberFormat.Format = "#,##0.00";
                //}
                //else
                //{
                //    dataCell.Value = val?.ToString();
                //}


                //dataCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                //dataCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                //col++;

                var val = row.ContainsKey(header) ? row[header] : string.Empty;
                var dataCell = worksheet.Cell(currentRow, headerStartCol + col);
                string? strVal = val?.ToString();

                bool notSummable = columnsNotToSum?.Contains(header, StringComparer.OrdinalIgnoreCase) ?? false;

                if (!notSummable && decimal.TryParse(strVal, out var numValue))
                {
                    dataCell.Value = numValue;
                    dataCell.Style.NumberFormat.Format = "#,##0.00";
                }
                else if (DateTime.TryParse(strVal, out var dateValue))
                {
                    dataCell.Value = dateValue;
                    dataCell.Style.NumberFormat.Format = "dd/MM/yyyy";
                }
                else
                {
                    dataCell.Value = strVal;
                }

                dataCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                dataCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                col++;
            }
            currentRow++;
        }




        // 🔹 Auto-fit columns
        for (int i = 1; i <= tableHeaders.Count; i++)
        {
            worksheet.Column(i).AdjustToContents();
            if (worksheet.Column(i).Width < 8) worksheet.Column(i).Width = 8;
            if (worksheet.Column(i).Width > 30) worksheet.Column(i).Width = 30;

            //added for attendacne
            //var col = worksheet.Column(i);
            //col.AdjustToContents();
            //if (col.Width < 8) col.Width = 8;
            //if (col.Width > 30) col.Width = 30;
            //col.Style.Alignment.WrapText = true;
        }

        // 🔹 Summary row (if needed)
        if (results.Any())
        {
            AddSummaryRownottosum(
                worksheet,
                currentRow,
                headerStartCol,
                tableHeaders,
                results,
                columnsNotToSum);
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void AddSummaryRownottosum(
     IXLWorksheet worksheet,
     int row,
     int startCol,
     List<string> headers,
     List<IDictionary<string, object>> data,
     string[]? columnsNotToSum)
    {
        var totalCell = worksheet.Cell(row, startCol);
        totalCell.Value = "TOTAL";
        totalCell.Style.Font.Bold = true;
        totalCell.Style.Fill.BackgroundColor = XLColor.LightGray;

        for (int i = 1; i < headers.Count; i++)
        {
            string header = headers[i];
            var cell = worksheet.Cell(row, startCol + i);

            bool skipColumn =
                columnsNotToSum != null &&
                columnsNotToSum.Contains(header, StringComparer.OrdinalIgnoreCase);

            if (!skipColumn)
            {
                decimal sum = 0;
                bool hasNumericValue = false;

                //foreach (var d in data)
                //{
                //    if (!d.ContainsKey(header))
                //        continue;

                //    var value = d[header]?.ToString();

                //    if (string.IsNullOrWhiteSpace(value))
                //        continue;

                //    // Skip dates in any recognizable format
                //    if (DateTime.TryParse(value, out _))
                //        continue;

                //    if (decimal.TryParse(value, out decimal number))
                //    {
                //        sum += number;
                //        hasNumericValue = true;
                //    }
                //}
                foreach (var d in data)
                {
                    if (!d.ContainsKey(header))
                        continue;

                    var value = d[header]?.ToString();

                    if (string.IsNullOrWhiteSpace(value))
                        continue;

                    if (decimal.TryParse(value, out decimal number))
                    {
                        sum += number;
                        hasNumericValue = true;
                        continue;   // it's a number, done with this value
                    }

                    // only treat as date (and skip) if it wasn't numeric
                    if (DateTime.TryParse(value, out _))
                        continue;
                }

                if (hasNumericValue)
                {
                    cell.Value = sum;
                    cell.Style.NumberFormat.Format = "#,##0.00";
                }
            }

            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }
    }




    //end


    //for the excel export
    public static async Task<byte[]> GenerateExcelReportAsync(
    string reportName,
    List<IDictionary<string, object>> results,
    string? contractorName,
    string? dateHeaderText,
    Func<Task<dynamic>>? getCompanyNameFunc = null,
    string[]? columnsToSum = null)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Report");

        int currentRow = 1;
        int headerStartCol = 1;

        // 🔹 Extract company name & filter headers
        var firstRow = results.First();


        string companyName = "Unknown Company";

        // 🔹 Get company name from repo if provided
        if (getCompanyNameFunc != null)
        {
            var companyResult = await getCompanyNameFunc();
            if (companyResult != null)
            {
                if (companyResult is IDictionary<string, object> dict)
                    companyName = dict.ContainsKey("Company Name")
                        ? dict["Company Name"]?.ToString() ?? "Unknown Company"
                        : "Unknown Company";
                else
                    companyName = companyResult?.ToString() ?? "Unknown Company";
            }
        }



        //var tableHeaders = firstRow.Keys
        //    .Where(k => k.ToLower() != "compname" && k.ToLower() != "company name")
        //    .ToList();
        var excludedColumns = new[] { "empid", "compname", "company name", "fk_empid", "pk_id", "pk_rentId","pk_billid", "summaryctc", "summarybonus", "summarytada", "summaryincentive", "summarygratuity",
"summarytotal", "summaryagencycharges", "summarysubtotal", "summaryrecovery", "summaryfinaltotal",
"summaryigst", "summarygrandtotal","cgst","sgst","igst","commissionpercent","summarysgst","summarycgst","invoiceno" };
        var tableHeaders = firstRow.Keys
    .Where(k => !excludedColumns.Contains(k.ToLower()))
    .ToList();

        int totalReportColumns = Math.Max(tableHeaders.Count, 6);



        var customHeaders = new List<(string Text, double FontSize, bool Bold)>
{
    ($"{companyName}", 16, true)
};

        if (!string.IsNullOrEmpty(reportName) && reportName != "Report")
            customHeaders.Add(($"{reportName}", 12, true));

        if (!string.IsNullOrEmpty(contractorName))
            customHeaders.Add(($"{contractorName}", 14, true));

        if (!string.IsNullOrEmpty(dateHeaderText))
            customHeaders.Add(($"{dateHeaderText}", 10, true));

        foreach (var header in customHeaders)
        {
            var headerCell = worksheet.Cell(currentRow, headerStartCol);
            headerCell.Value = header.Text;
            headerCell.Style.Font.Bold = header.Bold;
            headerCell.Style.Font.FontSize = header.FontSize;

            worksheet.Range(currentRow, headerStartCol, currentRow, totalReportColumns)
                     .Merge()
                     .Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
                     .Alignment.SetVertical(XLAlignmentVerticalValues.Center);

            currentRow++;
        }

        currentRow++; // spacing

        // 🔹 Table headers
        for (int i = 0; i < tableHeaders.Count; i++)
        {
            var cell = worksheet.Cell(currentRow, headerStartCol + i);
            cell.Value = tableHeaders[i];
            //string headerText = tableHeaders[i];

            //// ✅ If header is a date like "26-Aug-25" or "03/10/2025", show only the day
            //if (DateTime.TryParse(headerText, out var headerDate))
            //{
            //    headerText = headerDate.Day.ToString();
            //}

            //cell.Value = headerText;

            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 10;
            cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }
        // currentRow++;
        int headerRowNumber = currentRow;   // 👉 Save the header row number
        currentRow++;

        // 🧊 Freeze the header row so it stays visible while scrolling
        worksheet.SheetView.FreezeRows(headerRowNumber);


        // 🔹 Data rows
        foreach (var row in results)
        {
            int col = 0;
            foreach (var header in tableHeaders)
            {
                var val = row.ContainsKey(header) ? row[header] : string.Empty;
                var dataCell = worksheet.Cell(currentRow, headerStartCol + col);

                if (columnsToSum != null && columnsToSum.Contains(header, StringComparer.OrdinalIgnoreCase))
                {
                    //  Apply numeric formatting only to columns meant to be summed
                    if (decimal.TryParse(val?.ToString(), out var numValue))
                    {
                        dataCell.Value = numValue;
                        dataCell.Style.NumberFormat.Format = "#,##0.00";
                    }
                    else
                    {
                        dataCell.Value = val?.ToString();
                    }
                }
                else if (DateTime.TryParse(val?.ToString(), out var dateValue))
                {
                    // Apply date format normally
                    dataCell.Value = dateValue;
                    dataCell.Style.NumberFormat.Format = "dd/MM/yyyy";
                }
                else
                {
                    //  Treat everything else as plain text
                    dataCell.Value = val?.ToString();
                }


                dataCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                dataCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                col++;
            }
            currentRow++;
        }




        // 🔹 Auto-fit columns
        for (int i = 1; i <= tableHeaders.Count; i++)
        {
            worksheet.Column(i).AdjustToContents();
            if (worksheet.Column(i).Width < 8) worksheet.Column(i).Width = 8;
            if (worksheet.Column(i).Width > 30) worksheet.Column(i).Width = 30;

            //added for attendacne
            //var col = worksheet.Column(i);
            //col.AdjustToContents();
            //if (col.Width < 8) col.Width = 8;
            //if (col.Width > 30) col.Width = 30;
            //col.Style.Alignment.WrapText = true;
        }

        // 🔹 Summary row (if needed)
        if (columnsToSum != null && columnsToSum.Any())
        {
            // currentRow++;
            AddSummaryRow(worksheet, currentRow, headerStartCol, tableHeaders, results, columnsToSum);
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void AddSummaryRow(
        IXLWorksheet worksheet,
        int row,
        int startCol,
        List<string> headers,
        List<IDictionary<string, object>> data,
        string[] columnsToSum)
    {
        var totalCell = worksheet.Cell(row, startCol);
        totalCell.Value = "TOTAL";
        totalCell.Style.Font.Bold = true;
        totalCell.Style.Fill.BackgroundColor = XLColor.LightGray;

        for (int i = 1; i < headers.Count; i++)
        {
            var header = headers[i];
            var cell = worksheet.Cell(row, startCol + i);

            if (columnsToSum.Contains(header, StringComparer.OrdinalIgnoreCase))
            {
                var sum = data.Sum(d =>
                    decimal.TryParse(d[header]?.ToString(), out var val) ? val : 0);

                cell.Value = sum;
                cell.Style.NumberFormat.Format = "#,##0.00";
            }
            else
            {
                cell.Value = "";
            }

            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }
    }



    public static async Task<byte[]> GenerateAttendanceExcelReportAsync(
   string reportName,
   List<IDictionary<string, object>> results,
   string? contractorName,
   string? dateHeaderText,
   Func<Task<dynamic>>? getCompanyNameFunc = null,
   string[]? columnsToSum = null)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Report");

        int currentRow = 1;
        int headerStartCol = 1;

        // 🔹 Extract company name & filter headers
        var firstRow = results.First();


        string companyName = "Unknown Company";

        // 🔹 Get company name from repo if provided
        if (getCompanyNameFunc != null)
        {
            var companyResult = await getCompanyNameFunc();
            if (companyResult != null)
            {
                if (companyResult is IDictionary<string, object> dict)
                    companyName = dict.ContainsKey("Company Name")
                        ? dict["Company Name"]?.ToString() ?? "Unknown Company"
                        : "Unknown Company";
                else
                    companyName = companyResult?.ToString() ?? "Unknown Company";
            }
        }



        //var tableHeaders = firstRow.Keys
        //    .Where(k => k.ToLower() != "compname" && k.ToLower() != "company name")
        //    .ToList();
        var excludedColumns = new[] { "empid", "compname", "company name", "fk_empid", "pk_id", "totalcount" };
        var tableHeaders = firstRow.Keys
    .Where(k => !excludedColumns.Contains(k.ToLower()))
    .ToList();

        int totalReportColumns = Math.Max(tableHeaders.Count, 6);



        var customHeaders = new List<(string Text, double FontSize, bool Bold)>
{
    ($"{companyName}", 16, true)
};

        if (!string.IsNullOrEmpty(reportName) && reportName != "Report")
            customHeaders.Add(($"{reportName}", 12, true));

        if (!string.IsNullOrEmpty(contractorName))
            customHeaders.Add(($"{contractorName}", 14, true));

        if (!string.IsNullOrEmpty(dateHeaderText))
            customHeaders.Add(($"{dateHeaderText}", 10, true));

        foreach (var header in customHeaders)
        {
            var headerCell = worksheet.Cell(currentRow, headerStartCol);
            headerCell.Value = header.Text;
            headerCell.Style.Font.Bold = header.Bold;
            headerCell.Style.Font.FontSize = header.FontSize;

            worksheet.Range(currentRow, headerStartCol, currentRow, totalReportColumns)
                     .Merge()
                     .Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
                     .Alignment.SetVertical(XLAlignmentVerticalValues.Center);

            currentRow++;
        }

        currentRow++; // spacing

        // 🔹 Table headers
        for (int i = 0; i < tableHeaders.Count; i++)
        {
            var cell = worksheet.Cell(currentRow, headerStartCol + i);
            //  cell.Value = tableHeaders[i];
            string headerText = tableHeaders[i];


            // ✅ If header is a date like "26-Aug-25" or "03/10/2025", show only the day
            bool isDateHeader = false;
            if (DateTime.TryParse(headerText, out var headerDate))
            {
                headerText = headerDate.Day.ToString();
                isDateHeader = true;
            }

            cell.Value = headerText;

            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 10;
            cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

            var col = worksheet.Column(headerStartCol + i);
            if (isDateHeader)
            {
                // Smaller width for date-day columns
                // col.Width = 4.9;
                col.Width = 4;
                col.Style.Alignment.WrapText = true;// you can adjust this number as needed
            }
            else
            {
                // Normal columns can auto-fit or have a minimum width
                col.AdjustToContents();
                if (col.Width < 8) col.Width = 8;
                if (col.Width > 30) col.Width = 30;
                col.Style.Alignment.WrapText = true;
            }
        }
        // currentRow++;
        int headerRowNumber = currentRow;   // 👉 Save the header row number
        currentRow++;

        // 🧊 Freeze the header row so it stays visible while scrolling
        worksheet.SheetView.FreezeRows(headerRowNumber);


        foreach (var row in results)
        {
            int col = 0;
            foreach (var header in tableHeaders)
            {
                var val = row.ContainsKey(header) ? row[header]?.ToString() : string.Empty;
                var dataCell = worksheet.Cell(currentRow, headerStartCol + col);

                // 🟡 Handle HTML table case
                if (!string.IsNullOrEmpty(val) && val.Contains("<table", StringComparison.OrdinalIgnoreCase))
                {
                    var (extractedValue, bgColor) = ExtractValueAndColor(val);

                    dataCell.Value = extractedValue;
                    dataCell.Style.Fill.BackgroundColor = bgColor;
                    //dataCell.Style.Font.FontColor = XLColor.White; // font always white
                    if (bgColor == XLColor.Yellow)
                        dataCell.Style.Font.FontColor = XLColor.Black;
                    else
                        dataCell.Style.Font.FontColor = XLColor.White;
                }
                else if (columnsToSum != null && columnsToSum.Contains(header, StringComparer.OrdinalIgnoreCase))
                {
                    if (decimal.TryParse(val, out var numValue))
                    {
                        dataCell.Value = numValue;
                        dataCell.Style.NumberFormat.Format = "#,##0.00";
                    }
                    else
                    {
                        dataCell.Value = val?.ToString();
                    }
                }
                else if (DateTime.TryParse(val, out var dateValue) && val.Contains("/"))

                {
                    dataCell.Value = dateValue;
                    dataCell.Style.NumberFormat.Format = "dd/MM/yyyy";
                }
                else
                {
                    dataCell.Value = val?.ToString();
                }

                // Common style
                dataCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                dataCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                // added new 10/10/2025
                dataCell.Style.Font.FontSize = 6;
                dataCell.Style.Font.Bold = true;

                col++;
            }
            currentRow++;
        }



        // 🔹 Auto-fit columns
        for (int i = 1; i <= tableHeaders.Count; i++)
        {
            //worksheet.Column(i).AdjustToContents();
            //if (worksheet.Column(i).Width < 8) worksheet.Column(i).Width = 8;
            //if (worksheet.Column(i).Width > 30) worksheet.Column(i).Width = 30;

            var col = worksheet.Column(i);
            // Don't touch date columns
            if (int.TryParse(worksheet.Cell(headerRowNumber, i).GetString(), out _))
                continue;
            col.AdjustToContents();
            if (col.Width < 8) col.Width = 8;
            if (col.Width > 30) col.Width = 30;
            col.Style.Alignment.WrapText = true;
        }

        // 🔹 Summary row (if needed)
        if (columnsToSum != null && columnsToSum.Any())
        {
            // currentRow++;
            AddSummaryRow(worksheet, currentRow, headerStartCol, tableHeaders, results, columnsToSum);
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }






    public static async Task<byte[]> GenerateExcelReportPayoutAsync(
    string reportName,
    List<IDictionary<string, object>> results,
    string? contractorName,
    string? dateHeaderText,
    Func<Task<dynamic>>? getCompanyNameFunc = null,
    string[]? columnsToSum = null)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Report");

        int currentRow = 1;
        int headerStartCol = 1;

        // 🔹 Extract company name & filter headers
        var firstRow = results.First();


        string companyName = "Unknown Company";

        // 🔹 Get company name from repo if provided
        if (getCompanyNameFunc != null)
        {
            var companyResult = await getCompanyNameFunc();
            if (companyResult != null)
            {
                if (companyResult is IDictionary<string, object> dict)
                    companyName = dict.ContainsKey("Company Name")
                        ? dict["Company Name"]?.ToString() ?? "Unknown Company"
                        : "Unknown Company";
                else
                    companyName = companyResult?.ToString() ?? "Unknown Company";
            }
        }



        //var tableHeaders = firstRow.Keys
        //    .Where(k => k.ToLower() != "compname" && k.ToLower() != "company name")
        //    .ToList();
        var excludedColumns = new[] { "empid", "compname", "company name", "fk_empid", "pk_id", "pk_rentId" };
        var tableHeaders = firstRow.Keys
    .Where(k => !excludedColumns.Contains(k.ToLower()))
    .ToList();

        int totalReportColumns = Math.Max(tableHeaders.Count, 6);



        var customHeaders = new List<(string Text, double FontSize, bool Bold)>
{
    ($"{companyName}", 16, true)
};

        if (!string.IsNullOrEmpty(reportName) && reportName != "Report")
            customHeaders.Add(($"{reportName}", 12, true));

        if (!string.IsNullOrEmpty(contractorName))
            customHeaders.Add(($"{contractorName}", 14, true));

        if (!string.IsNullOrEmpty(dateHeaderText))
            customHeaders.Add(($"{dateHeaderText}", 10, true));

        foreach (var header in customHeaders)
        {
            var headerCell = worksheet.Cell(currentRow, headerStartCol);
            headerCell.Value = header.Text;
            headerCell.Style.Font.Bold = header.Bold;
            headerCell.Style.Font.FontSize = header.FontSize;

            worksheet.Range(currentRow, headerStartCol, currentRow, totalReportColumns)
                     .Merge()
                     .Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
                     .Alignment.SetVertical(XLAlignmentVerticalValues.Center);

            currentRow++;
        }

        currentRow++; // spacing

        // 🔹 Table headers
        for (int i = 0; i < tableHeaders.Count; i++)
        {
            var cell = worksheet.Cell(currentRow, headerStartCol + i);
            cell.Value = tableHeaders[i];
            //string headerText = tableHeaders[i];

            //// ✅ If header is a date like "26-Aug-25" or "03/10/2025", show only the day
            //if (DateTime.TryParse(headerText, out var headerDate))
            //{
            //    headerText = headerDate.Day.ToString();
            //}

            //cell.Value = headerText;

            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 10;
            cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }
        // currentRow++;
        int headerRowNumber = currentRow;   // 👉 Save the header row number
        currentRow++;

        // 🧊 Freeze the header row so it stays visible while scrolling
        worksheet.SheetView.FreezeRows(headerRowNumber);


        // 🔹 Data rows
        foreach (var row in results)
        {
            int col = 0;
            foreach (var header in tableHeaders)
            {
                var val = row.ContainsKey(header) ? row[header] : string.Empty;
                var dataCell = worksheet.Cell(currentRow, headerStartCol + col);

                if (columnsToSum != null && columnsToSum.Contains(header, StringComparer.OrdinalIgnoreCase))
                {
                    //  Apply numeric formatting only to columns meant to be summed
                    if (decimal.TryParse(val?.ToString(), out var numValue))
                    {
                        dataCell.Value = numValue;
                        dataCell.Style.NumberFormat.Format = "#,##0.00";
                    }
                    else
                    {
                        dataCell.Value = val?.ToString();
                    }
                }
                else if (DateTime.TryParse(val?.ToString(), out var dateValue))
                {
                    dataCell.Value = dateValue;
                    dataCell.Style.NumberFormat.Format = "dd/MM/yyyy hh:mm:ss";
                }
                else
                {
                    //  Treat everything else as plain text
                    dataCell.Value = val?.ToString();
                }


                dataCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                dataCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                col++;
            }
            currentRow++;
        }




        // 🔹 Auto-fit columns
        for (int i = 1; i <= tableHeaders.Count; i++)
        {
            worksheet.Column(i).AdjustToContents();
            if (worksheet.Column(i).Width < 8) worksheet.Column(i).Width = 8;
            if (worksheet.Column(i).Width > 30) worksheet.Column(i).Width = 30;

            //added for attendacne
            //var col = worksheet.Column(i);
            //col.AdjustToContents();
            //if (col.Width < 8) col.Width = 8;
            //if (col.Width > 30) col.Width = 30;
            //col.Style.Alignment.WrapText = true;
        }

        // 🔹 Summary row (if needed)
        if (columnsToSum != null && columnsToSum.Any())
        {
            // currentRow++;
            AddSummaryRow(worksheet, currentRow, headerStartCol, tableHeaders, results, columnsToSum);
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }









    // for the font
    private static (string value, XLColor bgColor) ExtractValueAndColor(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return (string.Empty, XLColor.NoColor);

        // Default background color
        XLColor backgroundColor = XLColor.NoColor;
        string textValue = html;

        // Extract background-color if present
        var colorMatch = System.Text.RegularExpressions.Regex.Match(
            html,
            @"background-color\s*:\s*([a-zA-Z]+)",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );

        if (colorMatch.Success)
        {
            var colorName = colorMatch.Groups[1].Value;
            try
            {
                backgroundColor = XLColor.FromName(colorName);
            }
            catch
            {
                backgroundColor = XLColor.NoColor;
            }
        }

        // Extract value between <b>...</b> or plain text
        var valueMatch = System.Text.RegularExpressions.Regex.Match(
            html,
            @"<b>(.*?)<\/b>",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );

        if (valueMatch.Success)
            textValue = valueMatch.Groups[1].Value.Trim();
        else
            textValue = System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", string.Empty).Trim();

        return (textValue, backgroundColor);
    }

    //for the excel export
    //FOR FORM 12

    public static async Task<byte[]> GenerateForm12ExcelAsync(
      string reportName,
      List<IDictionary<string, object>> results,
      string? contractorName,
      string? dateHeaderText,
      Func<Task<dynamic>>? getCompanyNameFunc = null,
      string[]? columnsToSum = null)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Report");

        int currentRow = 1;
        int headerStartCol = 1;


        //int totalReportColumns = Math.Max(results.First().Count + 6, 25);
        int totalReportColumns = 47;

        int formStartRow = currentRow;

        int LEFT_START = 2;
        int LEFT_END = 5;

        int CENTER_START = 6;
        int CENTER_END = totalReportColumns - 3;

        int RIGHT_START = totalReportColumns - 2;
        int RIGHT_END = totalReportColumns;

        /* ================= LEFT HEADER TABLE ================= */

        worksheet.Cell(formStartRow, 2).Value = "";
        worksheet.Cell(formStartRow, 3).Value = "Time of Commencement of work";
        worksheet.Cell(formStartRow, 4).Value = "From";
        worksheet.Cell(formStartRow, 5).Value = "To";

        worksheet.Cell(formStartRow + 1, 2).Value = "Monday to Friday";
        worksheet.Cell(formStartRow + 2, 2).Value = "Saturday";
        worksheet.Cell(formStartRow + 3, 2).Value = "Sunday";
        worksheet.Cell(formStartRow + 4, 2).Value = "System of Rotation of Relay";

        var leftTable = worksheet.Range(formStartRow, LEFT_START, formStartRow + 4, LEFT_END);
        leftTable.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        leftTable.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
        leftTable.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        leftTable.Style.Font.FontSize = 9;

        /* ================= RIGHT HEADER TABLE ================= */

        worksheet.Cell(formStartRow, RIGHT_START).Value = "From";
        worksheet.Cell(formStartRow, RIGHT_START + 1).Value = "To";
        worksheet.Cell(formStartRow, RIGHT_END).Value = "Time of completion";

        var rightTable = worksheet.Range(formStartRow, RIGHT_START, formStartRow + 4, RIGHT_END);
        rightTable.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        rightTable.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
        rightTable.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        rightTable.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        rightTable.Style.Font.FontSize = 9;

        /* ================= CENTER FORM TITLE ================= */

        // FORM NO. 12
        var c1 = worksheet.Range(formStartRow, CENTER_START, formStartRow, CENTER_END);
        c1.Merge();
        worksheet.Cell(formStartRow, CENTER_START).Value = "FORM NO. 12";
        c1.Style.Font.Bold = true;
        c1.Style.Font.FontSize = 16;
        c1.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        c1.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        // RULE NO
        var c2 = worksheet.Range(formStartRow + 1, CENTER_START, formStartRow + 1, CENTER_END);
        c2.Merge();
        worksheet.Cell(formStartRow + 1, CENTER_START).Value = "(RULE NO. 78)";
        c2.Style.Font.Bold = true;
        c2.Style.Font.FontSize = 10;
        c2.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        c2.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        // DESCRIPTION
        var c3 = worksheet.Range(formStartRow + 2, CENTER_START, formStartRow + 2, CENTER_END);
        c3.Merge();
        worksheet.Cell(formStartRow + 2, CENTER_START).Value =
            "Register of Adult Worker Prescribed under Section 62 of the Act";
        c3.Style.Font.Bold = true;
        c3.Style.Font.FontSize = 12;
        c3.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        c3.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        // CENTER BORDER
        //worksheet.Range(formStartRow, CENTER_START, formStartRow + 4, CENTER_END)
        //         .Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        /* ================= ROW HEIGHTS (VERY IMPORTANT) ================= */

        worksheet.Row(formStartRow).Height = 24;
        worksheet.Row(formStartRow + 1).Height = 18;
        worksheet.Row(formStartRow + 2).Height = 22;
        worksheet.Row(formStartRow + 3).Height = 22;
        worksheet.Row(formStartRow + 4).Height = 22;

        currentRow = formStartRow + 6;

        /* ================= CONTINUE WITH YOUR EXISTING LOGIC ================= */
        // =============================================================


        ///

        // 🔹 Extract company name & filter headers
        var firstRow = results.First();


        string companyName = "Unknown Company";
        string companyAddress = "Unknown Address";

        // 🔹 Get company name from repo if provided
        //if (getCompanyNameFunc != null)
        //{
        //    var companyResult = await getCompanyNameFunc();
        //    if (companyResult != null)
        //    {
        //        if (companyResult is IDictionary<string, object> dict)
        //            companyName = dict.ContainsKey("Company Name")
        //                ? dict["Company Name"]?.ToString() ?? "Unknown Company"
        //                : "Unknown Company"
        //        companyAddress = dict.ContainsKey("Company Name")
        //                ? dict["companyAddress"]?.ToString() ?? "Unknown Company"
        //                : "Unknown Company";
        //        else
        //            companyName = companyResult?.ToString() ?? "Unknown Company";
        //    }
        //}
        if (getCompanyNameFunc != null)
        {
            var companyResult = await getCompanyNameFunc();

            if (companyResult != null)
            {
                if (companyResult is IDictionary<string, object> dict)
                {
                    companyName = dict.ContainsKey("Company Name")
                        ? dict["Company Name"]?.ToString() ?? ""
                        : "";

                    companyAddress = dict.ContainsKey("Company Address")
                        ? dict["Company Address"]?.ToString() ?? ""
                        : "";
                }
                else
                {
                    companyName = companyResult.ToString() ?? "";
                    companyAddress = string.Empty;
                }
            }
        }




        //var tableHeaders = firstRow.Keys
        //    .Where(k => k.ToLower() != "compname" && k.ToLower() != "company name")
        //    .ToList();


        var excludedColumns = new[] { "empid", "compname", "company name", "fk_empid", "pk_id", "otworked", "otpaid", "otlapsed", "cdoadjustment", "monthdays", "coff", "total leave", "absent", "othrs" };
        var tableHeaders = firstRow.Keys
    .Where(k => !excludedColumns.Contains(k.ToLower()))
    .ToList();

        tableHeaders.Insert(0, "srno");
        //int totalReportColumns = Math.Max(tableHeaders.Count, 6);

        int deptIndex = tableHeaders.FindIndex(x => x.Equals("department", StringComparison.OrdinalIgnoreCase));

        if (deptIndex >= 0)
        {
            tableHeaders.Insert(deptIndex + 1, "group of relay");
            tableHeaders.Insert(deptIndex + 2, "shift");
        }



        //        var customHeaders = new List<(string Text, double FontSize, bool Bold)>
        //{
        //    ($"{companyName},{}", 16, true)
        //};
        var customHeaders = new List<(string Text, double FontSize, bool Bold)>
{
    ($"{companyName}{(string.IsNullOrWhiteSpace(companyAddress) ? "" : ", " + companyAddress)}", 16, true)
};



        if (!string.IsNullOrEmpty(contractorName))
            customHeaders.Add(($"{contractorName}", 14, true));

        if (!string.IsNullOrEmpty(dateHeaderText))
            customHeaders.Add(($"{dateHeaderText}", 10, true));

        foreach (var header in customHeaders)
        {
            var headerCell = worksheet.Cell(currentRow, headerStartCol);
            headerCell.Value = header.Text;
            headerCell.Style.Font.Bold = header.Bold;
            headerCell.Style.Font.FontSize = header.FontSize;

            //worksheet.Range(currentRow, headerStartCol, currentRow, totalReportColumns)
            //         .Merge()
            //         .Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
            //         .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
            var range = worksheet.Range(currentRow, headerStartCol, currentRow, totalReportColumns);
            range.Merge();

            // ✅ IF DATE HEADER → RIGHT ALIGN, NORMAL FONT
            if (header.Text == dateHeaderText)
            {
                range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                headerCell.Style.Font.Bold = false;
            }
            else
            {
                range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            }

            range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

            currentRow++;
        }


        currentRow++; // spacing

        // ➕ Extra columns not coming from DB
        var extraColumns = new List<string>
{
    "on account of advance",
    "fine",
    "actual wages paid",
    "total number of weekly holidays lost by the worker",
    "dates on which compensatory holidays will be given",
    "remarks or indication showing that payment have been made together with the date"

};

        // Merge DB headers + extra headers
        tableHeaders.AddRange(extraColumns);

        var headerDisplayMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    { "el", "Rate of basic wages / EL" },
    { "cl", "Rate of allowance if any / CL" },
    { "sl", "Total hours of Overtime/ SL" },
     { "paiddays", "On account of provident fund/ PD" },
            { "present","Total number of days worked/WD"},
            { "fathername","Father's/HusbandName"},
            { "Nature","Nature of work"},
            {"srno","serial no"}
};

        var verticalHeaders = new[]
{ "serial no.",
    "designation",
    "department",
    "location",

    "father's/husbandname",
    "nature of work",
     "total number of days worked/wd",

     "rate of allowance if any / cl",
     "total hours of overtime/ sl",
     "rate of basic wages / el",

     "on account of provident fund/ pd",
     // for extra
      "on account of advance",
    "fine",
     "actual wages paid",
    "total number of weekly holidays lost by the worker",
    "dates on which compensatory holidays will be given",
    "remarks or indication showing that payment have been made together with the date",
    "group of relay",
    "shift"

};

        //// ========== PARENT HEADER ROW (for "Correspondent to that in Form 11") ==========
        //int groupOfRelayIndex = tableHeaders.FindIndex(x => x.Equals("group of relay", StringComparison.OrdinalIgnoreCase));
        //int shiftIndex = tableHeaders.FindIndex(x => x.Equals("shift", StringComparison.OrdinalIgnoreCase));

        //if (groupOfRelayIndex >= 0 && shiftIndex >= 0)
        //{
        //    // Merge cells for parent header
        //    var parentHeaderRange = worksheet.Range(
        //        currentRow,
        //        headerStartCol + groupOfRelayIndex,
        //        currentRow,
        //        headerStartCol + shiftIndex
        //    );
        //    parentHeaderRange.Merge();

        //    var parentCell = worksheet.Cell(currentRow, headerStartCol + groupOfRelayIndex);
        //    parentCell.Value = "Correspondent to that in Form 11";
        //    parentCell.Style.Font.Bold = true;
        //    parentCell.Style.Font.FontSize = 8;
        //    parentCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        //    parentCell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        //    parentCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        //    parentCell.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
        //    parentCell.Style.Alignment.WrapText = true;

        //    worksheet.Row(currentRow).Height = 30;

        //    currentRow++; // Move to next row for actual headers
        //}


        for (int i = 0; i < tableHeaders.Count; i++)
        {



            var cell = worksheet.Cell(currentRow, headerStartCol + i);
            string headerKey = tableHeaders[i];
            bool isDateHeader = false;

            string headerText = headerDisplayMap.ContainsKey(headerKey)
                ? headerDisplayMap[headerKey]
                : headerKey;

            if (DateTime.TryParse(headerText, out var headerDate))
            {
                headerText = GetDayWithSuffix(headerDate.Day); // 25th, 26th
                isDateHeader = true;
            }
            //if (headerText.Equals("Serial No.", StringComparison.OrdinalIgnoreCase))
            //{
            //    //col.Width = 4;
            //    worksheet.Row(currentRow).Height = 80;
            //    cell.Style.Alignment.TextRotation = 90;
            //}


            cell.Value = headerText;

            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 8;
            //cell.Style.Fill.BackgroundColor = XLColor.WhiteSmoke;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

            var col = worksheet.Column(headerStartCol + i);

            // ✅ ROTATE ONLY SPECIFIC HEADERS
            if (verticalHeaders.Contains(headerText.ToLower()))
            {
                cell.Style.Alignment.TextRotation = 90; // vertical text
                worksheet.Row(currentRow).Height = 80; // adjust height
                col.Width = 4;                          // narrow column
                cell.Style.Alignment.WrapText = true;
            }
            else if (isDateHeader)
            {
                col.Width = 4;
                cell.Style.Alignment.WrapText = true;
            }
            else
            {
                col.AdjustToContents();
                if (col.Width < 8) col.Width = 8;
                if (col.Width > 30) col.Width = 30;
                cell.Style.Alignment.WrapText = true;
            }
        }


        // currentRow++;
        int headerRowNumber = currentRow;   // 👉 Save the header row number
        currentRow++;

        // 🧊 Freeze the header row so it stays visible while scrolling
        worksheet.SheetView.FreezeRows(headerRowNumber);


        //adding
        for (int i = 0; i < tableHeaders.Count; i++)
        {
            var cell = worksheet.Cell(currentRow, headerStartCol + i);
            cell.Value = (i + 1).ToString(); // Serial number: 1, 2, 3, ...
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 8;
            //cell.Style.Fill.BackgroundColor = XLColor.WhiteSmoke;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }

        currentRow++;
        //lr


        foreach (var row in results)
        {
            int col = 0;
            foreach (var header in tableHeaders)
            {

                //var val = row.ContainsKey(header) ? row[header]?.ToString() : string.Empty;
                string val;

                if (header.Equals("srno", StringComparison.OrdinalIgnoreCase))
                {
                    val = (currentRow - headerRowNumber - 1).ToString();
                }
                else
                {
                    val = row.ContainsKey(header) ? row[header]?.ToString() : string.Empty;
                }
                var dataCell = worksheet.Cell(currentRow, headerStartCol + col);

                // 🟡 Handle HTML table case
                if (!string.IsNullOrEmpty(val) && val.Contains("<table", StringComparison.OrdinalIgnoreCase))
                {
                    var (extractedValue, bgColor) = ExtractValueAndColor(val);

                    dataCell.Value = extractedValue;
                    dataCell.Style.Fill.BackgroundColor = bgColor;
                    //dataCell.Style.Font.FontColor = XLColor.White; // font always white
                    if (bgColor == XLColor.Yellow)
                        dataCell.Style.Font.FontColor = XLColor.Black;
                    else
                        dataCell.Style.Font.FontColor = XLColor.White;
                }
                else if (columnsToSum != null && columnsToSum.Contains(header, StringComparer.OrdinalIgnoreCase))
                {
                    if (decimal.TryParse(val, out var numValue))
                    {
                        dataCell.Value = numValue;
                        dataCell.Style.NumberFormat.Format = "#,##0.00";
                    }
                    else
                    {
                        dataCell.Value = val?.ToString();
                    }
                }
                else if (DateTime.TryParse(val, out var dateValue) && val.Contains("/"))

                {
                    dataCell.Value = dateValue;
                    dataCell.Style.NumberFormat.Format = "dd/MM/yyyy";
                }
                else
                {
                    dataCell.Value = val?.ToString();
                }

                // Common style
                dataCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                dataCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                // added new 10/10/2025
                dataCell.Style.Font.FontSize = 6;
                dataCell.Style.Font.Bold = true;

                col++;
            }
            currentRow++;
        }



        // 🔹 Auto-fit columns
        for (int i = 1; i <= tableHeaders.Count; i++)
        {
            //worksheet.Column(i).AdjustToContents();
            //if (worksheet.Column(i).Width < 8) worksheet.Column(i).Width = 8;
            //if (worksheet.Column(i).Width > 30) worksheet.Column(i).Width = 30;

            var col = worksheet.Column(i);
            // Don't touch date columns
            if (int.TryParse(worksheet.Cell(headerRowNumber, i).GetString(), out _))
                continue;
            col.AdjustToContents();
            if (col.Width < 8) col.Width = 8;
            if (col.Width > 30) col.Width = 30;
            col.Style.Alignment.WrapText = true;
        }

        // 🔹 Summary row (if needed)
        if (columnsToSum != null && columnsToSum.Any())
        {
            // currentRow++;
            AddSummaryRow(worksheet, currentRow, headerStartCol, tableHeaders, results, columnsToSum);
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static string GetDayWithSuffix(int day)
    {
        if (day >= 11 && day <= 13)
            return day + "th";

        switch (day % 10)
        {
            case 1:
                return day + "st";
            case 2:
                return day + "nd";
            case 3:
                return day + "rd";
            default:
                return day + "th";
        }
    }


    // ================= STYLES =================



    // FOR FORM 12
    // Convert a list of dictionary rows to a list of strongly typed models
    public static List<T> ConvertToModelList<T>(List<Dictionary<string, string>> data) where T : new()
    {
        var result = new List<T>();

        foreach (var row in data)
        {
            var obj = new T();
            foreach (var prop in typeof(T).GetProperties())
            {
                if (row.TryGetValue(prop.Name, out string value))
                {
                    if (!string.IsNullOrEmpty(value))
                    {
                        try
                        {
                            var convertedValue = Convert.ChangeType(value, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType);
                            prop.SetValue(obj, convertedValue);
                        }
                        catch
                        {
                            // Skip conversion if type mismatch
                            continue;
                        }
                    }
                }
            }
            result.Add(obj);
        }

        return result;
    }
    //
    public static List<ExpImpLeaveDetails> ConvertToLeaveModel(List<Dictionary<string, string>> data)
    {
        var result = new List<ExpImpLeaveDetails>();

        // detect the leave column name dynamically
        var leaveColumn = data.First().Keys
            .FirstOrDefault(k => k != "pk_empid" && k != "EmpCode" && k != "EmpName");

        if (string.IsNullOrEmpty(leaveColumn))
            throw new Exception("No leave type column found in Excel.");

        foreach (var row in data)
        {
            var obj = new ExpImpLeaveDetails
            {
               // pk_empid = row.GetValueOrDefault("pk_empid"),
                EmpCode = row.GetValueOrDefault("EmpCode"),
               // EmpName = row.GetValueOrDefault("EmpName"),
                currentyearleaves = row.GetValueOrDefault(leaveColumn),
                LeaveType = leaveColumn  // just pass the column name (CL / EL / OD…)
            };

            result.Add(obj);
        }

        return result;
    }

    public static List<T> ConvertToModelListNoCase<T>(List<Dictionary<string, string>> data) where T : new()
    {
        var result = new List<T>();

        foreach (var row in data)
        {
            var obj = new T();
            foreach (var prop in typeof(T).GetProperties())
            {
                // find dictionary key that matches property name (case-insensitive)
                var match = row.Keys.FirstOrDefault(k =>
                    string.Equals(k, prop.Name, StringComparison.OrdinalIgnoreCase));

                if (match != null && row.TryGetValue(match, out string value))
                {
                    if (!string.IsNullOrEmpty(value))
                    {
                        try
                        {
                            var convertedValue = Convert.ChangeType(
                                value,
                                Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType
                            );
                            prop.SetValue(obj, convertedValue);
                        }
                        catch
                        {
                            // ignore conversion errors
                            continue;
                        }
                    }
                }
            }
            result.Add(obj);
        }

        return result;
    }


    public static List<Dictionary<string, string>> ReadExcelDynamicWithoutTemplate(IFormFile file)
    {
        var result = new List<Dictionary<string, string>>();

        using var stream = file.OpenReadStream();
        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1); // Assuming first sheet
        var firstRow = worksheet.FirstRowUsed();
        if (firstRow == null) return result;

        int lastCol = firstRow.LastCellUsed()?.Address.ColumnNumber ?? 0;
        var headers = new List<string>();
        for (int c = 1; c <= lastCol; c++)
        {
            headers.Add(firstRow.Cell(c).GetString().Trim());
        }

        foreach (var row in worksheet.RowsUsed().Skip(1))
        {
            var rowDict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            bool hasAnyData = false;

            for (int i = 0; i < headers.Count; i++)
            {
                string header = headers[i];
                if (string.IsNullOrWhiteSpace(header)) continue;

                var cell = row.Cell(i + 1);
                string cellValue = cell.GetString()?.Trim() ?? string.Empty;
                if (string.IsNullOrEmpty(cellValue) && !cell.IsEmpty())
                {
                    cellValue = cell.Value.ToString()?.Trim() ?? string.Empty;
                }

                if (!string.IsNullOrEmpty(cellValue))
                    hasAnyData = true;

                rowDict[header] = cellValue;
            }

            if (hasAnyData)
            {
                result.Add(rowDict);
            }
        }

        return result;
    }




    //public static string ConvertOnlyHeadsXml(List<Dictionary<string, string>> data)
    //{
    //    XElement heads = new XElement("heads");

    //    foreach (var row in data)
    //    {
    //        string empId = row.ContainsKey("EmpCode") ? row["EmpCode"].Trim() : string.Empty;
    //        bool isAfterGrade = false;

    //        foreach (var kvp in row)
    //        {
    //            if (isAfterGrade)
    //            {
    //                string amount = (kvp.Value ?? string.Empty).Trim();

    //                // ✅ Allow only whole numbers (digits). Anything else → "0"
    //                if (!decimal.TryParse(amount, out _))
    //                {
    //                    amount = "0";
    //                }
    //                amount = Math.Round(Convert.ToDecimal(amount), 0).ToString();

    //                XElement head = new XElement("head",
    //                   new XElement("fk_empid", empId),
    //                   new XElement("headname", kvp.Key.Trim()),
    //                   new XElement("amount", amount)
    //               );

    //                heads.Add(head);
    //            }
    //            else
    //            {
    //                if (kvp.Key.Equals("Grade", StringComparison.OrdinalIgnoreCase))
    //                {
    //                    isAfterGrade = true;
    //                }
    //            }
    //        }
    //    }

    //    return heads.ToString();
    //}


    public static string ConvertOnlyHeadsXml(List<Dictionary<string, string>> data, string? companyId = null)
    {
        XElement heads = new XElement("heads");

        var excludedKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Rate Total", "RateTotal", "Total", "Status", "Remarks", "Reason", "Diff",
            "sr", "srno", "sr.", "sr_no", "serialno", "serial no", "serial no.",
            "empcode", "emp code", "code", "emp_code", "manualempcode",
            "empname", "emp name", "name", "employee name", "employeename",
            "location", "department", "designation", "grade", "costcentre", "contractor",
            "fk_empid", "fk_costcentreid", "id", "pk_id"
        };

        foreach (var row in data)
        {
            var empCodeKey = row.Keys.FirstOrDefault(k =>
                k.Equals("EmpCode", StringComparison.OrdinalIgnoreCase) ||
                k.Equals("empcode", StringComparison.OrdinalIgnoreCase) ||
                k.Equals("emp_code", StringComparison.OrdinalIgnoreCase) ||
                k.Equals("code", StringComparison.OrdinalIgnoreCase) ||
                k.Replace(" ", "").Equals("empcode", StringComparison.OrdinalIgnoreCase));

            string empId = (empCodeKey != null && !string.IsNullOrWhiteSpace(row[empCodeKey])) ? row[empCodeKey].Trim() : string.Empty;
            bool isAfterGrade = false;

            foreach (var kvp in row)
            {
                if (isAfterGrade)
                {
                    string keyName = kvp.Key.Trim();
                    //if (excludedKeys.Contains(keyName) || keyName.StartsWith("Diff_", StringComparison.OrdinalIgnoreCase) || keyName.StartsWith("__EMPTY", StringComparison.OrdinalIgnoreCase))
                    //{
                    //    continue;
                    //}

                    //string resolvedHeadName = ResolveDbHeadName(keyName, companyId);
                    string resolvedHeadName = keyName;

                    string amount = (kvp.Value ?? string.Empty).Trim();
                    //if (!decimal.TryParse(amount, NumberStyles.Any, CultureInfo.InvariantCulture, out var decVal) && !decimal.TryParse(amount, out decVal))
                    //{
                    //    decVal = 0m;
                    //}

                    //string formattedAmount = Math.Round(decVal, 2).ToString("0.00", CultureInfo.InvariantCulture);

                    // ✅ Allow only whole numbers (digits). Anything else → "0"
                    if (!decimal.TryParse(amount, out _))
                    {
                        amount = "0";
                    }
                    amount = Math.Round(Convert.ToDecimal(amount), 0).ToString();


                    XElement head = new XElement("head",
                        new XElement("fk_empid", empId),
                        new XElement("headname", resolvedHeadName),
                        new XElement("amount", amount)
                    );

                    heads.Add(head);
                }
                else
                {
                    if (kvp.Key.Equals("Grade", StringComparison.OrdinalIgnoreCase))
                    {
                        isAfterGrade = true;
                    }
                }
            }
        }

        return heads.ToString();
    }





  

    public static string ResolveDbHeadName(string excelHeader, string? companyId)
    {
        if (string.IsNullOrWhiteSpace(excelHeader))
            return excelHeader;

        string trimmed = excelHeader.Trim();
        string norm = trimmed.ToLowerInvariant().Replace(" ", "").Replace("_", "");
        string comp = companyId?.Trim().ToUpperInvariant() ?? string.Empty;

        // Bonus
        if (norm == "bonus" || norm == "bonuspay")
        {
            if (comp == "GU-1") return "BonusPay";
            return trimmed;
        }

        // Leave Wages / LTA
        if (norm == "leavewages" || norm == "lta" || norm == "leavetravelallowance")
        {
            if (comp == "GU-1") return "LTA";
            return trimmed;
        }

        // Conveyance
        if (norm == "convall" || norm == "conv" || norm == "conveyance" || norm == "conveyanceallowance" || norm == "convreim" || norm == "conveyancereimbursement" || norm == "conyenance")
        {
            if (comp == "GU-1") return "ConvReim";
            if (comp == "GU-3") return "Conyenance";
            if (comp == "GU-4") return "Conveyance";
            if (comp == "GU-5" || comp == "GU-6") return "ConveyanceReimbursement";
            if (comp == "GU-7" || comp == "GU-13") return "CONVEYANCE";
            return trimmed;
        }

        // Other_Spcl_Wash_Allow
        if (norm == "otherspclwashallow" || norm == "otherspecialwashingallowance")
        {
            if (comp == "GU-1") return "Other";
            if (comp == "GU-5" || comp == "GU-6") return "SpecialAllowance";
            if (comp == "GU-7" || comp == "GU-13") return "OTHER";
            //  return "Other";
            return trimmed; ;
        }

        // Special Allowance
        if (norm == "specialallowance" || norm == "splallow")
        {
            if (comp == "GU-4") return "SplAllow";
            if (comp == "GU-7" || comp == "GU-13") return "SPECIALALLOWANCE";
            return trimmed;
        }

        // Other / Other Allowance
        if (norm == "other" || norm == "otherallowance")
        {
            if (comp == "GU-1") return "Other";
            if (comp == "GU-5" || comp == "GU-6") return "Otherallowance";
            if (comp == "GU-7" || comp == "GU-13") return "OTHER";
            return trimmed;
        }

        // OT Pay / Overtime
        if (norm == "otpay" || norm == "overtime")
        {
            if (comp == "GU-1") return "OTPay";
            return trimmed;
        }

        // Education Allowance / CEA
        if (norm == "cea" || norm == "educationallowance")
        {
            if (comp == "GU-1") return "CEA";
            return trimmed;
        }

        // Washing Allowance / Uniform Allowance
        if (norm == "washingallowance" || norm == "uniformallowance")
        {
            if (comp == "GU-1") return "UniformAllowance";
            return trimmed;
        }

        return trimmed;
    }




    public static async Task<byte[]> GenerateSalaryComparisonExcelAsync(
        string reportName,
        List<IDictionary<string, object>> results,
        string? contractorName,
        string? dateHeaderText,
        Func<Task<dynamic>>? getCompanyNameFunc = null)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Salary Comparison");

        int currentRow = 1;
        int headerStartCol = 1;

        if (results == null || !results.Any())
        {
            var emptyCell = worksheet.Cell(1, 1);
            emptyCell.Value = "No comparison records found";
            using var emptyStream = new MemoryStream();
            workbook.SaveAs(emptyStream);
            return emptyStream.ToArray();
        }

        var firstRow = results.First();

        string companyName = "Company";
        if (getCompanyNameFunc != null)
        {
            var companyResult = await getCompanyNameFunc();
            if (companyResult != null)
            {
                if (companyResult is IDictionary<string, object> dict)
                    companyName = dict.ContainsKey("Company Name")
                        ? dict["Company Name"]?.ToString() ?? "Company"
                        : "Company";
                else
                    companyName = companyResult?.ToString() ?? "Company";
            }
        }

        var excludedColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "empid", "compname", "company name", "fk_empid", "pk_id", "pk_rentId", "pk_billid"
        };

        // Table headers: exclude technical columns and columns that start with "Diff_" or "Diff "
        var tableHeaders = firstRow.Keys
            .Where(k => !excludedColumns.Contains(k) && !k.StartsWith("Diff_", StringComparison.OrdinalIgnoreCase) && !k.StartsWith("Diff ", StringComparison.OrdinalIgnoreCase))
            .ToList();

        int totalReportColumns = Math.Max(tableHeaders.Count, 6);

        // 🔹 Report Title Headers
        var customHeaders = new List<(string Text, double FontSize, bool Bold)>
        {
            ($"{companyName}", 16, true)
        };

        if (!string.IsNullOrEmpty(reportName))
            customHeaders.Add(($"{reportName}", 12, true));

        if (!string.IsNullOrEmpty(contractorName))
            customHeaders.Add(($"{contractorName}", 12, true));

        if (!string.IsNullOrEmpty(dateHeaderText))
            customHeaders.Add(($"{dateHeaderText}", 10, false));

        foreach (var header in customHeaders)
        {
            var headerCell = worksheet.Cell(currentRow, headerStartCol);
            headerCell.Value = header.Text;
            headerCell.Style.Font.Bold = header.Bold;
            headerCell.Style.Font.FontSize = header.FontSize;

            worksheet.Range(currentRow, headerStartCol, currentRow, totalReportColumns)
                     .Merge()
                     .Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
                     .Alignment.SetVertical(XLAlignmentVerticalValues.Center);

            currentRow++;
        }

        currentRow++; // spacing

        // 🔹 Header Row
        int headerRowNumber = currentRow;
        for (int i = 0; i < tableHeaders.Count; i++)
        {
            string colKey = tableHeaders[i];
            string headerDisplay = FormatSalaryComparisonHeader(colKey);

            var cell = worksheet.Cell(currentRow, headerStartCol + i);
            cell.Value = headerDisplay;
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 10;
            cell.Style.Fill.BackgroundColor = XLColor.FromArgb(232, 240, 254); // Soft Light Blue #e8f0fe
            cell.Style.Font.FontColor = XLColor.FromArgb(30, 41, 59); // Slate dark #1e293b
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            cell.Style.Border.OutsideBorderColor = XLColor.FromArgb(203, 213, 225);
        }
        worksheet.Row(currentRow).Height = 24;
        currentRow++;

        worksheet.SheetView.FreezeRows(headerRowNumber);

        var amountColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "RateGross", "EarnGross", "GrossTotal", "PF", "VolPF", "ESI", "LWF", "ProfTax", "IT",
            "TotalDeductions", "NetPay", "OT", "OTHrs", "OTGross", "NHAmt", "Basic", "HRA", "DA", "Conveyance",
            "ArrearAmount", "ArrearAmt"
        };

        var greenColor = XLColor.FromArgb(21, 128, 61); // #15803d
        var redColor = XLColor.FromArgb(185, 28, 28);   // #b91c1c

        // 🔹 Data Rows
        foreach (var row in results)
        {
            worksheet.Row(currentRow).Height = 28;
            for (int col = 0; col < tableHeaders.Count; col++)
            {
                string header = tableHeaders[col];
                var cell = worksheet.Cell(currentRow, headerStartCol + col);
                var val = row.ContainsKey(header) ? row[header] : null;

                bool isAmount = amountColumns.Contains(header) ||
                                header.IndexOf("gross", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                header.IndexOf("pay", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                header.IndexOf("amt", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                header.IndexOf("deduction", StringComparison.OrdinalIgnoreCase) >= 0;

                string diffKey = "Diff_" + header;
                decimal diffVal = 0;
                bool hasDiff = false;
                if (row.ContainsKey(diffKey) && row[diffKey] != null)
                {
                    if (decimal.TryParse(row[diffKey]?.ToString(), out decimal parsedDiff))
                    {
                        diffVal = parsedDiff;
                        hasDiff = true;
                    }
                }

                if (isAmount && decimal.TryParse(val?.ToString(), out decimal numVal))
                {
                    cell.Style.Alignment.WrapText = true;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    if (hasDiff && diffVal != 0)
                    {
                        var richText = cell.GetRichText();
                        richText.ClearText();
                        var mainText = richText.AddText($"₹ {numVal:N2}\n");
                        mainText.SetBold(true);
                        mainText.SetFontSize(10);
                        mainText.SetFontColor(XLColor.Black);

                        if (diffVal > 0)
                        {
                            var diffText = richText.AddText($"↑ +₹{diffVal:N2}");
                            diffText.SetBold(true);
                            diffText.SetFontSize(8.5);
                            diffText.SetFontColor(greenColor);
                        }
                        else
                        {
                            var diffText = richText.AddText($"↓ -₹{Math.Abs(diffVal):N2}");
                            diffText.SetBold(true);
                            diffText.SetFontSize(8.5);
                            diffText.SetFontColor(redColor);
                        }
                    }
                    else
                    {
                        cell.Value = numVal;
                        cell.Style.NumberFormat.Format = "₹ #,##0.00";
                    }
                }
                else if (DateTime.TryParse(val?.ToString(), out DateTime dateVal))
                {
                    cell.Value = dateVal;
                    cell.Style.NumberFormat.Format = "dd/MM/yyyy";
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                }
                else
                {
                    cell.Value = val?.ToString() ?? string.Empty;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                }

                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.FromArgb(226, 232, 240);
            }
            currentRow++;
        }

        // 🔹 Summary / Total Row
        worksheet.Row(currentRow).Height = 28;
        var totalLabelCell = worksheet.Cell(currentRow, headerStartCol);
        totalLabelCell.Value = "TOTAL";
        totalLabelCell.Style.Font.Bold = true;
        totalLabelCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        totalLabelCell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        totalLabelCell.Style.Fill.BackgroundColor = XLColor.FromArgb(241, 245, 249);
        totalLabelCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        totalLabelCell.Style.Border.OutsideBorderColor = XLColor.FromArgb(203, 213, 225);

        for (int col = 1; col < tableHeaders.Count; col++)
        {
            string header = tableHeaders[col];
            var cell = worksheet.Cell(currentRow, headerStartCol + col);
            cell.Style.Fill.BackgroundColor = XLColor.FromArgb(241, 245, 249);
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            cell.Style.Border.OutsideBorderColor = XLColor.FromArgb(203, 213, 225);

            bool isAmount = amountColumns.Contains(header) ||
                            header.IndexOf("gross", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            header.IndexOf("pay", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            header.IndexOf("amt", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            header.IndexOf("deduction", StringComparison.OrdinalIgnoreCase) >= 0;

            if (isAmount)
            {
                decimal totalMain = 0;
                decimal totalDiff = 0;
                bool hasAnyValue = false;
                string diffKey = "Diff_" + header;

                foreach (var row in results)
                {
                    if (row.ContainsKey(header) && decimal.TryParse(row[header]?.ToString(), out decimal v))
                    {
                        totalMain += v;
                        hasAnyValue = true;
                    }
                    if (row.ContainsKey(diffKey) && decimal.TryParse(row[diffKey]?.ToString(), out decimal dv))
                    {
                        totalDiff += dv;
                    }
                }

                if (hasAnyValue)
                {
                    cell.Style.Alignment.WrapText = true;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    if (totalDiff != 0)
                    {
                        var richText = cell.GetRichText();
                        richText.ClearText();
                        var mainText = richText.AddText($"₹ {totalMain:N2}\n");
                        mainText.SetBold(true);
                        mainText.SetFontSize(10);
                        mainText.SetFontColor(XLColor.Black);

                        if (totalDiff > 0)
                        {
                            var diffText = richText.AddText($"↑ +₹{totalDiff:N2}");
                            diffText.SetBold(true);
                            diffText.SetFontSize(8.5);
                            diffText.SetFontColor(greenColor);
                        }
                        else
                        {
                            var diffText = richText.AddText($"↓ -₹{Math.Abs(totalDiff):N2}");
                            diffText.SetBold(true);
                            diffText.SetFontSize(8.5);
                            diffText.SetFontColor(redColor);
                        }
                    }
                    else
                    {
                        cell.Value = totalMain;
                        cell.Style.Font.Bold = true;
                        cell.Style.NumberFormat.Format = "₹ #,##0.00";
                    }
                }
            }
        }

        // 🔹 Auto-fit columns
        for (int i = 1; i <= tableHeaders.Count; i++)
        {
            worksheet.Column(i).AdjustToContents();
            if (worksheet.Column(i).Width < 12) worksheet.Column(i).Width = 12;
            if (worksheet.Column(i).Width > 32) worksheet.Column(i).Width = 32;
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public static List<Dictionary<string, string>> ReadExcelDynamic(IFormFile file)
    {
        var result = new List<Dictionary<string, string>>();

        using (var stream = new MemoryStream())
        {
            file.CopyTo(stream);
            using (var workbook = new XLWorkbook(stream))
            {
                var worksheet = workbook.Worksheet(1); // Read the first sheet
                var firstRow = worksheet.FirstRowUsed();
                if (firstRow == null) return result;

                var headers = firstRow.Cells().Select(c => c.GetValue<string>().Trim()).ToList();
                var dataRows = worksheet.RowsUsed().Skip(1); // Skip header row

                foreach (var row in dataRows)
                {
                    var rowDict = new Dictionary<string, string>();
                    bool isEmptyRow = true;

                    for (int col = 1; col <= headers.Count; col++)
                    {
                        string header = headers[col - 1];
                        string cellValue = row.Cell(col).GetValue<string>().Trim();

                        if (!string.IsNullOrWhiteSpace(cellValue))
                            isEmptyRow = false;

                        rowDict[header] = cellValue;
                    }

                    if (!isEmptyRow)
                        result.Add(rowDict);
                }
            }
        }

        return result;
    }
}
