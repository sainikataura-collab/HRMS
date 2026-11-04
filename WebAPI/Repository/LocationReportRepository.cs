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
    public class LocationReportRepository : ILocationReportRepository
    {
        private readonly string _connectionString;

        public LocationReportRepository(IConfiguration configuration)
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
                    }

                    // 3. Statuses
                    dto.Statuses = new List<DropdownItemDto>
                    {
                        new DropdownItemDto { Value = "Active", Label = "Active" },
                        new DropdownItemDto { Value = "Inactive", Label = "Inactive" },
                        new DropdownItemDto { Value = "Approved", Label = "Approved" },
                        new DropdownItemDto { Value = "On Hold", Label = "On Hold" },
                        new DropdownItemDto { Value = "Closed", Label = "Closed" }
                    };

                    // 4. Years
                    int currentYear = DateTime.Now.Year;
                    for (int y = currentYear + 1; y >= currentYear - 4; y--)
                    {
                        dto.Years.Add(new DropdownItemDto { Value = y.ToString(), Label = y.ToString() });
                    }

                    // 5. Months
                    string[] monthNames = { "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" };
                    for (int m = 1; m <= 12; m++)
                    {
                        dto.Months.Add(new DropdownItemDto { Value = m.ToString(), Label = monthNames[m - 1] });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching Location Report Master Data: {ex.Message}");
            }

            return dto;
        }

        public async Task<(int TotalCount, LocationReportSummaryDto Summary, List<LocationReportItem> Items)> GetLocationReportAsync(LocationReportFilterRequest filter, string companyId)
        {
            var summary = new LocationReportSummaryDto();
            var items = new List<LocationReportItem>();
            int totalCount = 0;

            try
            {
                using (var connection = GetConnection())
                {
                    var p = new DynamicParameters();
                    p.Add("@fk_companyId", companyId, DbType.String);
                    p.Add("@locationId", filter.LocationId ?? "", DbType.String);
                    p.Add("@location", filter.Location ?? "", DbType.String);
                    p.Add("@vendorCode", filter.VendorCode ?? "", DbType.String);
                    p.Add("@status", filter.Status ?? "", DbType.String);
                    p.Add("@month", filter.Month ?? "", DbType.String);
                    p.Add("@year", filter.Year ?? "", DbType.String);
                    p.Add("@fromDate", filter.FromDate ?? "", DbType.String);
                    p.Add("@toDate", filter.ToDate ?? "", DbType.String);
                    p.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    p.Add("@pageIndex", filter.PageIndex, DbType.Int32);
                    p.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);

                    using (var multi = await connection.QueryMultipleAsync(
                        "USP_Location_Report_Get",
                        p,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 120))
                    {
                        var summaryRow = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
                        if (summaryRow != null)
                        {
                            var sDict = (IDictionary<string, object>)summaryRow;
                            totalCount = sDict.ContainsKey("TotalCount") && sDict["TotalCount"] != null ? Convert.ToInt32(sDict["TotalCount"]) : 0;
                            summary.TotalLocations = sDict.ContainsKey("TotalLocations") && sDict["TotalLocations"] != null ? Convert.ToInt32(sDict["TotalLocations"]) : totalCount;
                            summary.TotalOpeningJobs = sDict.ContainsKey("TotalOpeningJobs") && sDict["TotalOpeningJobs"] != null ? Convert.ToInt32(sDict["TotalOpeningJobs"]) : 0;
                            summary.TotalPositions = sDict.ContainsKey("TotalPositions") && sDict["TotalPositions"] != null ? Convert.ToInt32(sDict["TotalPositions"]) : 0;
                            summary.TotalProfilesSubmitted = sDict.ContainsKey("TotalProfilesSubmitted") && sDict["TotalProfilesSubmitted"] != null ? Convert.ToInt32(sDict["TotalProfilesSubmitted"]) : 0;
                            summary.TotalJoined = sDict.ContainsKey("TotalJoined") && sDict["TotalJoined"] != null ? Convert.ToInt32(sDict["TotalJoined"]) : 0;
                            summary.TotalOpenPositions = sDict.ContainsKey("TotalOpenPositions") && sDict["TotalOpenPositions"] != null ? Convert.ToInt32(sDict["TotalOpenPositions"]) : 0;
                            summary.OverallFulfillmentRate = sDict.ContainsKey("OverallFulfillmentRate") && sDict["OverallFulfillmentRate"] != null ? Convert.ToDecimal(sDict["OverallFulfillmentRate"]) : 0;
                        }

                        var dataRows = await multi.ReadAsync<LocationReportItem>();
                        items = dataRows.ToList();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing USP_Location_Report_Get: {ex.Message}");
            }

            return (totalCount, summary, items);
        }

        public async Task<(int TotalCount, List<LocationWiseJobItem> Items)> GetLocationWiseJobsReportAsync(LocationReportFilterRequest filter, string companyId)
        {
            var items = new List<LocationWiseJobItem>();
            int totalCount = 0;

            try
            {
                using (var connection = GetConnection())
                {
                    var p = new DynamicParameters();
                    p.Add("@fk_companyId", companyId, DbType.String);
                    p.Add("@locationId", filter.LocationId ?? "", DbType.String);
                    p.Add("@department", filter.Department ?? "", DbType.String);
                    p.Add("@vendorCode", filter.VendorCode ?? "", DbType.String);
                    p.Add("@status", filter.Status ?? "", DbType.String);
                    p.Add("@month", filter.Month ?? "", DbType.String);
                    p.Add("@year", filter.Year ?? "", DbType.String);
                    p.Add("@fromDate", filter.FromDate ?? "", DbType.String);
                    p.Add("@toDate", filter.ToDate ?? "", DbType.String);
                    p.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    p.Add("@pageIndex", filter.PageIndex, DbType.Int32);
                    p.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);

                    using (var multi = await connection.QueryMultipleAsync(
                        "USP_Location_Wise_Jobs_Report_Get",
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

                        var dataRows = await multi.ReadAsync<LocationWiseJobItem>();
                        items = dataRows.ToList();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing USP_Location_Wise_Jobs_Report_Get: {ex.Message}");
            }

            return (totalCount, items);
        }

        public async Task<byte[]> GenerateLocationReportExcelAsync(LocationReportFilterRequest filter, string companyId)
        {
            // Fetch all records for export
            filter.PageIndex = 0;
            filter.PageSize = 100000;
            var (_, _, items) = await GetLocationReportAsync(filter, companyId);

            using (var workbook = new XLWorkbook())
            {
                var ws = workbook.Worksheets.Add("Location Report");

                // Headers
                string[] headers = new string[] {
                    "Sr. No.", "Month", "Location Code", "Location Name",
                    "Opening Jobs", "Total Positions", "Profiles Submitted", "Shortlisted",
                    "Interviewed", "Selected", "Joined", "Rejected",
                    "Open Positions", "Fulfillment Rate %", "Avg TAT (Days)", "Status"
                };

                for (int i = 0; i < headers.Length; i++)
                {
                    ws.Cell(1, i + 1).Value = headers[i];
                    ws.Cell(1, i + 1).Style.Font.Bold = true;
                    ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#3080e8");
                    ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
                    ws.Cell(1, i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                }

                // Data Rows
                for (int i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    int row = i + 2;

                    ws.Cell(row, 1).Value = i + 1;
                    ws.Cell(row, 2).Value = item.MonthYear ?? "";
                    ws.Cell(row, 3).Value = item.LocationCode ?? "";
                    ws.Cell(row, 4).Value = item.LocationName ?? "";
                    ws.Cell(row, 5).Value = item.TotalOpeningJobs;
                    ws.Cell(row, 6).Value = item.TotalPositions;
                    ws.Cell(row, 7).Value = item.TotalSubmitted;
                    ws.Cell(row, 8).Value = item.Shortlisted;
                    ws.Cell(row, 9).Value = item.Interviewed;
                    ws.Cell(row, 10).Value = item.Selected;
                    ws.Cell(row, 11).Value = item.Joined;
                    ws.Cell(row, 12).Value = item.Rejected;
                    ws.Cell(row, 13).Value = item.OpenPositions;
                    ws.Cell(row, 14).Value = $"{item.FulfillmentRate}%";
                    ws.Cell(row, 15).Value = item.AvgTatDays;
                    ws.Cell(row, 16).Value = item.Status ?? "Active";

                    for (int c = 1; c <= headers.Length; c++)
                    {
                        ws.Cell(row, c).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                        ws.Cell(row, c).Style.Border.OutsideBorderColor = XLColor.LightGray;
                    }
                }

                ws.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        public async Task<byte[]> GenerateLocationWiseJobsReportExcelAsync(LocationReportFilterRequest filter, string companyId)
        {
            filter.PageIndex = 0;
            filter.PageSize = 100000;
            var (_, items) = await GetLocationWiseJobsReportAsync(filter, companyId);

            using (var workbook = new XLWorkbook())
            {
                var ws = workbook.Worksheets.Add("Location Wise Jobs Report");

                string[] headers = new string[] {
                    "Sr. No.", "Month", "Location Code", "Location Name", "Requisition ID",
                    "Job Title", "Department", "Target Positions", "Profiles Shared",
                    "Screened", "Interviewed", "Offered", "Joined", "Rejected",
                    "Pending Positions", "Fulfillment %", "Avg TAT (Days)", "Status"
                };

                for (int i = 0; i < headers.Length; i++)
                {
                    ws.Cell(1, i + 1).Value = headers[i];
                    ws.Cell(1, i + 1).Style.Font.Bold = true;
                    ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#3080e8");
                    ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
                    ws.Cell(1, i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                }

                for (int i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    int row = i + 2;

                    ws.Cell(row, 1).Value = i + 1;
                    ws.Cell(row, 2).Value = item.MonthYear ?? "";
                    ws.Cell(row, 3).Value = item.LocationCode ?? "";
                    ws.Cell(row, 4).Value = item.LocationName ?? "";
                    ws.Cell(row, 5).Value = item.ReqCode ?? "";
                    ws.Cell(row, 6).Value = item.JobTitle ?? "";
                    ws.Cell(row, 7).Value = item.Department ?? "";
                    ws.Cell(row, 8).Value = item.TargetPositions;
                    ws.Cell(row, 9).Value = item.ProfilesShared;
                    ws.Cell(row, 10).Value = item.Screened;
                    ws.Cell(row, 11).Value = item.Interviewed;
                    ws.Cell(row, 12).Value = item.Offered;
                    ws.Cell(row, 13).Value = item.Joined;
                    ws.Cell(row, 14).Value = item.Rejected;
                    ws.Cell(row, 15).Value = item.PendingPositions;
                    ws.Cell(row, 16).Value = $"{item.FulfillmentPct}%";
                    ws.Cell(row, 17).Value = item.AvgTatDays;
                    ws.Cell(row, 18).Value = item.Status ?? "Active";

                    for (int c = 1; c <= headers.Length; c++)
                    {
                        ws.Cell(row, c).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                        ws.Cell(row, c).Style.Border.OutsideBorderColor = XLColor.LightGray;
                    }
                }

                ws.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }
    }
}
