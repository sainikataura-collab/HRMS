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
    public class MrfReportRepository : IMrfReportRepository
    {
        private readonly string _connectionString;

        public MrfReportRepository(IConfiguration configuration)
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

                    // Workflow Statuses (Only Approval Tiers)
                    dto.Statuses = new List<DropdownItemDto>
                    {
                        new DropdownItemDto { Value = "Submitted", Label = "Submitted (Awaiting L1)" },
                        new DropdownItemDto { Value = "L1_Pending", Label = "L1_Pending (Operations)" },
                        new DropdownItemDto { Value = "L1_Rejected", Label = "L1_Rejected" },
                        new DropdownItemDto { Value = "L2_Pending", Label = "L2_Pending (Corporate HR)" },
                        new DropdownItemDto { Value = "L2_Rejected", Label = "L2_Rejected" },
                        new DropdownItemDto { Value = "L3_Pending", Label = "L3_Pending (HOD)" },
                        new DropdownItemDto { Value = "L3_Rejected", Label = "L3_Rejected" }
                    };

                    // Years
                    int currentYear = DateTime.Now.Year;
                    for (int y = currentYear + 1; y >= currentYear - 4; y--)
                    {
                        dto.Years.Add(new DropdownItemDto { Value = y.ToString(), Label = y.ToString() });
                    }

                    // Months
                    string[] monthNames = { "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" };
                    for (int m = 1; m <= 12; m++)
                    {
                        dto.Months.Add(new DropdownItemDto { Value = m.ToString(), Label = monthNames[m - 1] });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching MRF Report Master Data: {ex.Message}");
            }

            return dto;
        }

        public async Task<(int TotalCount, MrfReportSummaryDto Summary, List<MrfReportItem> Items)> GetMrfReportAsync(MrfReportFilterRequest filter, string companyId)
        {
            var summary = new MrfReportSummaryDto();
            var items = new List<MrfReportItem>();
            int totalCount = 0;

            try
            {
                using (var connection = GetConnection())
                {
                    var p = new DynamicParameters();
                    p.Add("@fk_companyId", companyId, DbType.String);
                    p.Add("@mrfCode", filter.MrfCode ?? "", DbType.String);
                    p.Add("@locationId", filter.LocationId ?? "", DbType.String);
                    p.Add("@department", filter.Department ?? "", DbType.String);
                    p.Add("@vendorCode", filter.VendorCode ?? "", DbType.String);
                    p.Add("@workflowStatus", filter.WorkflowStatus ?? "", DbType.String);
                    p.Add("@month", filter.Month ?? "", DbType.String);
                    p.Add("@year", filter.Year ?? "", DbType.String);
                    p.Add("@fromDate", filter.FromDate ?? "", DbType.String);
                    p.Add("@toDate", filter.ToDate ?? "", DbType.String);
                    p.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    p.Add("@pageIndex", filter.PageIndex, DbType.Int32);
                    p.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);

                    using (var multi = await connection.QueryMultipleAsync(
                        "USP_MRF_Report_Get",
                        p,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 120))
                    {
                        var summaryRow = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
                        if (summaryRow != null)
                        {
                            var sDict = (IDictionary<string, object>)summaryRow;
                            totalCount = sDict.ContainsKey("TotalCount") && sDict["TotalCount"] != null ? Convert.ToInt32(sDict["TotalCount"]) : 0;
                            summary.TotalMRFs = sDict.ContainsKey("TotalMRFs") && sDict["TotalMRFs"] != null ? Convert.ToInt32(sDict["TotalMRFs"]) : totalCount;
                            summary.TotalPositions = sDict.ContainsKey("TotalPositions") && sDict["TotalPositions"] != null ? Convert.ToInt32(sDict["TotalPositions"]) : 0;
                            summary.TotalInWorkflow = sDict.ContainsKey("TotalInWorkflow") && sDict["TotalInWorkflow"] != null ? Convert.ToInt32(sDict["TotalInWorkflow"]) : 0;
                            summary.TotalActive = sDict.ContainsKey("TotalActive") && sDict["TotalActive"] != null ? Convert.ToInt32(sDict["TotalActive"]) : 0;
                            summary.TotalProfilesSubmitted = sDict.ContainsKey("TotalProfilesSubmitted") && sDict["TotalProfilesSubmitted"] != null ? Convert.ToInt32(sDict["TotalProfilesSubmitted"]) : 0;
                            summary.TotalJoined = sDict.ContainsKey("TotalJoined") && sDict["TotalJoined"] != null ? Convert.ToInt32(sDict["TotalJoined"]) : 0;
                            summary.TotalPendingPositions = sDict.ContainsKey("TotalPendingPositions") && sDict["TotalPendingPositions"] != null ? Convert.ToInt32(sDict["TotalPendingPositions"]) : 0;
                            summary.OverallFulfillmentRate = sDict.ContainsKey("OverallFulfillmentRate") && sDict["OverallFulfillmentRate"] != null ? Convert.ToDecimal(sDict["OverallFulfillmentRate"]) : 0;
                        }

                        var dataRows = await multi.ReadAsync<MrfReportItem>();
                        items = dataRows.ToList();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing USP_MRF_Report_Get: {ex.Message}");
            }

            return (totalCount, summary, items);
        }

        public async Task<byte[]> GenerateMrfReportExcelAsync(MrfReportFilterRequest filter, string companyId)
        {
            filter.PageIndex = 0;
            filter.PageSize = 100000;
            var (_, _, items) = await GetMrfReportAsync(filter, companyId);

            using (var workbook = new XLWorkbook())
            {
                var ws = workbook.Worksheets.Add("MRF Report");

                string[] headers = new string[] {
                    "Sr. No.", "Month", "MRF Code", "Job Title", "Designation", "Department",
                    "Location", "Raised By", "Req. Type", "Exp (Yrs)", "CTC Range",
                    "Target Positions", "Workflow Status", "Current Tier",
                    "Profiles Submitted", "Screened", "Interviewed", "Offered", "Joined",
                    "Rejected", "Pending Positions", "Fulfillment %", "Avg TAT (Days)",
                    "L1 Approver", "L1 Action", "L1 Date", "L1 Remarks",
                    "L2 Approver", "L2 Action", "L2 Date", "L2 Remarks",
                    "L3 Approver", "L3 Action", "L3 Date", "L3 Remarks",
                    "Hiring Opened Date", "Rejection Reason"
                };

                for (int i = 0; i < headers.Length; i++)
                {
                    ws.Cell(1, i + 1).Value = headers[i];
                    ws.Cell(1, i + 1).Style.Font.Bold = true;
                    ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#2563eb");
                    ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
                    ws.Cell(1, i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                }

                for (int i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    int row = i + 2;

                    ws.Cell(row, 1).Value = i + 1;
                    ws.Cell(row, 2).Value = item.MonthYear ?? "";
                    ws.Cell(row, 3).Value = item.MrfCode ?? "";
                    ws.Cell(row, 4).Value = item.JobTitle ?? "";
                    ws.Cell(row, 5).Value = item.Designation ?? "";
                    ws.Cell(row, 6).Value = item.Department ?? "";
                    ws.Cell(row, 7).Value = item.Location ?? "";
                    ws.Cell(row, 8).Value = item.RaisedBy ?? "";
                    ws.Cell(row, 9).Value = item.RequirementType ?? "";
                    ws.Cell(row, 10).Value = $"{item.ExpFrom} - {item.ExpTo} Yrs";
                    ws.Cell(row, 11).Value = $"{item.CtcFrom} - {item.CtcTo}";
                    ws.Cell(row, 12).Value = item.TargetPositions;
                    ws.Cell(row, 13).Value = item.WorkflowStatus ?? "";
                    ws.Cell(row, 14).Value = item.CurrentApprovalLevel == 99 ? "Active" : item.CurrentApprovalLevel == 0 ? "Rejected" : $"Level {item.CurrentApprovalLevel}";
                    ws.Cell(row, 15).Value = item.ProfilesSubmitted;
                    ws.Cell(row, 16).Value = item.Screened;
                    ws.Cell(row, 17).Value = item.Interviewed;
                    ws.Cell(row, 18).Value = item.Offered;
                    ws.Cell(row, 19).Value = item.Joined;
                    ws.Cell(row, 20).Value = item.Rejected;
                    ws.Cell(row, 21).Value = item.PendingPositions;
                    ws.Cell(row, 22).Value = $"{item.FulfillmentPct}%";
                    ws.Cell(row, 23).Value = item.AvgTatDays;
                    ws.Cell(row, 24).Value = item.L1ApproverName ?? "";
                    ws.Cell(row, 25).Value = item.L1Action ?? "";
                    ws.Cell(row, 26).Value = item.L1ActionDate?.ToString("yyyy-MM-dd HH:mm") ?? "";
                    ws.Cell(row, 27).Value = item.L1Remarks ?? "";
                    ws.Cell(row, 28).Value = item.L2ApproverName ?? "";
                    ws.Cell(row, 29).Value = item.L2Action ?? "";
                    ws.Cell(row, 30).Value = item.L2ActionDate?.ToString("yyyy-MM-dd HH:mm") ?? "";
                    ws.Cell(row, 31).Value = item.L2Remarks ?? "";
                    ws.Cell(row, 32).Value = item.L3ApproverName ?? "";
                    ws.Cell(row, 33).Value = item.L3Action ?? "";
                    ws.Cell(row, 34).Value = item.L3ActionDate?.ToString("yyyy-MM-dd HH:mm") ?? "";
                    ws.Cell(row, 35).Value = item.L3Remarks ?? "";
                    ws.Cell(row, 36).Value = item.HiringOpenedDate?.ToString("yyyy-MM-dd HH:mm") ?? "";
                    ws.Cell(row, 37).Value = item.RejectionRemarks ?? "";

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
