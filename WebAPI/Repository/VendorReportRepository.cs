using ClosedXML.Excel;
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class VendorReportRepository : IVendorReportRepository
    {
        private readonly string _connectionString;

        public VendorReportRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("WebApplication1DBConnection");
        }

        private System.Data.Common.DbConnection GetConnection()
        {
            if (DataBaseFactory.ConnString != null)
            {
                return DataBaseFactory.ConnString();
            }
            return new SqlConnection(_connectionString);
        }

        public async Task<(int TotalCount, VendorReportSummaryDto Summary, List<VendorReportItem> Items)> GetVendorReportAsync(VendorReportFilterRequest filter, string companyId)
        {
            var summary = new VendorReportSummaryDto();
            var items = new List<VendorReportItem>();
            int totalCount = 0;

            try
            {
                using (var connection = GetConnection())
                {
                    var p = new DynamicParameters();
                    p.Add("@fk_companyId", companyId, DbType.String);
                    p.Add("@vendorCode", filter.VendorCode ?? "", DbType.String);
                    p.Add("@location", filter.Location ?? "", DbType.String);
                    p.Add("@status", filter.Status ?? "", DbType.String);
                    p.Add("@month", filter.Month ?? "", DbType.String);
                    p.Add("@year", filter.Year ?? "", DbType.String);
                    p.Add("@fromDate", filter.FromDate ?? "", DbType.String);
                    p.Add("@toDate", filter.ToDate ?? "", DbType.String);
                    p.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    p.Add("@pageIndex", filter.PageIndex, DbType.Int32);
                    p.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);

                    using (var multi = await connection.QueryMultipleAsync(
                        "USP_Vendor_Report_Get",
                        p,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 120))
                    {
                        var summaryRow = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
                        if (summaryRow != null)
                        {
                            var sDict = (IDictionary<string, object>)summaryRow;
                            totalCount = sDict.ContainsKey("TotalCount") && sDict["TotalCount"] != null ? Convert.ToInt32(sDict["TotalCount"]) : 0;
                            summary.TotalVendors = sDict.ContainsKey("TotalVendors") && sDict["TotalVendors"] != null ? Convert.ToInt32(sDict["TotalVendors"]) : totalCount;
                            summary.TotalProfilesSubmitted = sDict.ContainsKey("TotalProfilesSubmitted") && sDict["TotalProfilesSubmitted"] != null ? Convert.ToInt32(sDict["TotalProfilesSubmitted"]) : 0;
                            summary.TotalShortlisted = sDict.ContainsKey("TotalShortlisted") && sDict["TotalShortlisted"] != null ? Convert.ToInt32(sDict["TotalShortlisted"]) : 0;
                            summary.TotalJoined = sDict.ContainsKey("TotalJoined") && sDict["TotalJoined"] != null ? Convert.ToInt32(sDict["TotalJoined"]) : 0;
                            summary.OverallConversionRate = sDict.ContainsKey("OverallConversionRate") && sDict["OverallConversionRate"] != null ? Convert.ToDecimal(sDict["OverallConversionRate"]) : 0;
                        }

                        var dataRows = await multi.ReadAsync<VendorReportItem>();
                        items = dataRows.ToList();
                    }
                }
            }
            catch (Exception ex)
            {
                // Fallback: Return empty list or log exception
                Console.WriteLine($"Error executing USP_Vendor_Report_Get: {ex.Message}");
            }

            return (totalCount, summary, items);
        }

        public async Task<(int TotalCount, List<VendorWiseReportItem> Items)> GetVendorWiseReportAsync(VendorReportFilterRequest filter, string companyId)
        {
            var items = new List<VendorWiseReportItem>();
            int totalCount = 0;

            try
            {
                using (var connection = GetConnection())
                {
                    var p = new DynamicParameters();
                    p.Add("@fk_companyId", companyId, DbType.String);
                    p.Add("@vendorCode", filter.VendorCode ?? "", DbType.String);
                    p.Add("@department", filter.Department ?? "", DbType.String);
                    p.Add("@status", filter.Status ?? "", DbType.String);
                    p.Add("@month", filter.Month ?? "", DbType.String);
                    p.Add("@year", filter.Year ?? "", DbType.String);
                    p.Add("@fromDate", filter.FromDate ?? "", DbType.String);
                    p.Add("@toDate", filter.ToDate ?? "", DbType.String);
                    p.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    p.Add("@pageIndex", filter.PageIndex, DbType.Int32);
                    p.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);

                    using (var multi = await connection.QueryMultipleAsync(
                        "USP_Vendor_Wise_Report_Get",
                        p,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 120))
                    {
                        var countRow = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
                        if (countRow != null)
                        {
                            var cDict = (IDictionary<string, object>)countRow;
                            totalCount = cDict.ContainsKey("TotalCount") && cDict["TotalCount"] != null ? Convert.ToInt32(cDict["TotalCount"]) : 0;
                        }

                        var dataRows = await multi.ReadAsync<VendorWiseReportItem>();
                        items = dataRows.ToList();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing USP_Vendor_Wise_Report_Get: {ex.Message}");
            }

            return (totalCount, items);
        }

        public async Task<VendorReportMasterDataDto> GetReportMasterDataAsync(string companyId)
        {
            var dto = new VendorReportMasterDataDto();

            try
            {
                using (var connection = GetConnection())
                {
                    var p = new DynamicParameters();
                    p.Add("@fk_companyId", companyId ?? "", DbType.String);

                    using (var multi = await connection.QueryMultipleAsync(
                        "USP_Report_Master_Data_Get",
                        p,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 120))
                    {
                        var vendors = await multi.ReadAsync<DropdownItemDto>();
                        dto.Vendors = vendors.ToList();

                        var locations = await multi.ReadAsync<DropdownItemDto>();
                        dto.Locations = locations.ToList();

                        var departments = await multi.ReadAsync<DropdownItemDto>();
                        dto.Departments = departments.ToList();

                        if (!multi.IsConsumed)
                        {
                            var jobs = await multi.ReadAsync<DropdownItemDto>();
                            dto.Jobs = jobs.ToList();
                        }
                    }

                    // 4. Statuses
                    dto.Statuses = new List<DropdownItemDto>
                    {
                        new DropdownItemDto { Value = "Active", Label = "Active" },
                        new DropdownItemDto { Value = "Inactive", Label = "Inactive" },
                        new DropdownItemDto { Value = "Approved", Label = "Approved" },
                        new DropdownItemDto { Value = "On Hold", Label = "On Hold" },
                        new DropdownItemDto { Value = "Closed", Label = "Closed" }
                    };

                    // 5. Years (Dynamic last 5 years up to next year)
                    int currentYear = DateTime.Now.Year;
                    for (int y = currentYear + 1; y >= currentYear - 4; y--)
                    {
                        dto.Years.Add(new DropdownItemDto { Value = y.ToString(), Label = y.ToString() });
                    }

                    // 6. Months (Jan to Dec)
                    string[] monthNames = { "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" };
                    for (int m = 1; m <= 12; m++)
                    {
                        dto.Months.Add(new DropdownItemDto { Value = m.ToString(), Label = monthNames[m - 1] });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching Report Master Data: {ex.Message}");
            }

            return dto;
        }

        public async Task<byte[]> GenerateVendorReportExcelAsync(VendorReportFilterRequest filter, string companyId)
        {
            // Fetch all records for export (PageSize = 100000)
            filter.PageIndex = 0;
            filter.PageSize = 100000;
            var (_, _, items) = await GetVendorReportAsync(filter, companyId);

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Vendor Report");

                var headers = new[]
                {
                    "Sr. No.", "Month", "Vendor Code", "Vendor Name", "Contact Person",
                    "Email", "Phone", "Location", "Assigned Jobs", "Profiles Submitted",
                    "Shortlisted", "Interviewed", "Selected", "Joined", "Conversion Rate (%)",
                    "Avg TAT (Days)", "Status"
                };

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
                foreach (var item in items)
                {
                    worksheet.Cell(row, 1).Value = srNo++;
                    worksheet.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    worksheet.Cell(row, 2).Value = item.MonthYear ?? "";
                    worksheet.Cell(row, 3).Value = item.VendorCode ?? "";
                    worksheet.Cell(row, 4).Value = item.VendorName ?? "";
                    worksheet.Cell(row, 5).Value = item.ContactPerson ?? "";
                    worksheet.Cell(row, 6).Value = item.Email ?? "";
                    worksheet.Cell(row, 7).Value = item.Phone ?? "";
                    worksheet.Cell(row, 8).Value = item.Location ?? "";
                    worksheet.Cell(row, 9).Value = item.ActiveJobsAssigned;
                    worksheet.Cell(row, 10).Value = item.TotalSubmitted;
                    worksheet.Cell(row, 11).Value = item.Shortlisted;
                    worksheet.Cell(row, 12).Value = item.Interviewed;
                    worksheet.Cell(row, 13).Value = item.Selected;
                    worksheet.Cell(row, 14).Value = item.Joined;
                    worksheet.Cell(row, 15).Value = item.ConversionRate.ToString("0.0") + "%";
                    worksheet.Cell(row, 16).Value = item.AvgTatDays;
                    worksheet.Cell(row, 17).Value = item.Status ?? "";

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
                    return stream.ToArray();
                }
            }
        }

        public async Task<byte[]> GenerateVendorWiseReportExcelAsync(VendorReportFilterRequest filter, string companyId)
        {
            filter.PageIndex = 0;
            filter.PageSize = 100000;
            var (_, items) = await GetVendorWiseReportAsync(filter, companyId);

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Vendor Wise Report");

                var headers = new[]
                {
                    "Sr. No.", "Month", "Requisition ID", "Job Title", "Department",
                    "Vendor Name", "Vendor Code", "Location", "Target Positions",
                    "Profiles Shared", "Screened", "Interviewed", "Offered",
                    "Joined", "Rejected", "Vendor Share (%)", "Avg TAT (Days)", "Status"
                };

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
                foreach (var item in items)
                {
                    worksheet.Cell(row, 1).Value = srNo++;
                    worksheet.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    worksheet.Cell(row, 2).Value = item.MonthYear ?? "";
                    worksheet.Cell(row, 3).Value = item.ReqCode ?? "";
                    worksheet.Cell(row, 4).Value = item.JobTitle ?? "";
                    worksheet.Cell(row, 5).Value = item.Department ?? "";
                    worksheet.Cell(row, 6).Value = item.VendorName ?? "";
                    worksheet.Cell(row, 7).Value = item.VendorCode ?? "";
                    worksheet.Cell(row, 8).Value = item.Location ?? "";
                    worksheet.Cell(row, 9).Value = item.TargetPositions;
                    worksheet.Cell(row, 10).Value = item.ProfilesShared;
                    worksheet.Cell(row, 11).Value = item.Screened;
                    worksheet.Cell(row, 12).Value = item.Interviewed;
                    worksheet.Cell(row, 13).Value = item.Offered;
                    worksheet.Cell(row, 14).Value = item.Joined;
                    worksheet.Cell(row, 15).Value = item.Rejected;
                    worksheet.Cell(row, 16).Value = item.VendorSharePct.ToString("0.0") + "%";
                    worksheet.Cell(row, 17).Value = item.AvgTatDays;
                    worksheet.Cell(row, 18).Value = item.Status ?? "";

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
                    return stream.ToArray();
                }
            }
        }
    }
}
