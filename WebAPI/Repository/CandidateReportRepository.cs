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
    public class CandidateReportRepository : ICandidateReportRepository
    {
        private readonly string _connectionString;

        public CandidateReportRepository(IConfiguration configuration)
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

        public async Task<CandidateReportMasterDataDto> GetReportMasterDataAsync(string companyId)
        {
            var dto = new CandidateReportMasterDataDto();

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

                        if (!multi.IsConsumed)
                        {
                            var sources = await multi.ReadAsync<DropdownItemDto>();
                            dto.Sources = sources.ToList();
                        }
                    }

                    // Candidate Pipeline Statuses
                    dto.Statuses = new List<DropdownItemDto>
                    {
                        new DropdownItemDto { Value = "Applied", Label = "Applied / New" },
                        new DropdownItemDto { Value = "Screened", Label = "Screened / Shortlisted" },
                        new DropdownItemDto { Value = "Interviewed", Label = "Interviewed" },
                        new DropdownItemDto { Value = "Offered", Label = "Offered / Selected" },
                        new DropdownItemDto { Value = "Joined", Label = "Joined / Onboarded" },
                        new DropdownItemDto { Value = "Rejected", Label = "Rejected / Disapproved" }
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
                Console.WriteLine($"Error fetching Candidate Report Master Data: {ex.Message}");
            }

            return dto;
        }

        public async Task<(int TotalCount, CandidateReportSummaryDto Summary, List<CandidateReportItem> Items)> GetCandidateReportAsync(CandidateReportFilterRequest filter, string companyId)
        {
            var summary = new CandidateReportSummaryDto();
            var items = new List<CandidateReportItem>();
            int totalCount = 0;

            try
            {
                using (var connection = GetConnection())
                {
                    var p = new DynamicParameters();
                    p.Add("@fk_companyId", companyId, DbType.String);
                    p.Add("@jobId", filter.JobId ?? "", DbType.String);
                    p.Add("@locationId", filter.LocationId ?? "", DbType.String);
                    p.Add("@department", filter.Department ?? "", DbType.String);
                    p.Add("@source", filter.Source ?? "", DbType.String);
                    p.Add("@status", filter.Status ?? "", DbType.String);
                    p.Add("@month", filter.Month ?? "", DbType.String);
                    p.Add("@year", filter.Year ?? "", DbType.String);
                    p.Add("@fromDate", filter.FromDate ?? "", DbType.String);
                    p.Add("@toDate", filter.ToDate ?? "", DbType.String);
                    p.Add("@searchTerm", filter.SearchTerm ?? "", DbType.String);
                    p.Add("@pageIndex", filter.PageIndex, DbType.Int32);
                    p.Add("@pageSize", filter.PageSize > 0 ? filter.PageSize : 10, DbType.Int32);

                    using (var multi = await connection.QueryMultipleAsync(
                        "USP_Candidate_Report_Get",
                        p,
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: 120))
                    {
                        var summaryRow = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
                        if (summaryRow != null)
                        {
                            var sDict = (IDictionary<string, object>)summaryRow;
                            totalCount = sDict.ContainsKey("TotalCount") && sDict["TotalCount"] != null ? Convert.ToInt32(sDict["TotalCount"]) : 0;
                            summary.TotalCandidates = sDict.ContainsKey("TotalCandidates") && sDict["TotalCandidates"] != null ? Convert.ToInt32(sDict["TotalCandidates"]) : totalCount;
                            summary.TotalScreened = sDict.ContainsKey("TotalScreened") && sDict["TotalScreened"] != null ? Convert.ToInt32(sDict["TotalScreened"]) : 0;
                            summary.TotalInterviewed = sDict.ContainsKey("TotalInterviewed") && sDict["TotalInterviewed"] != null ? Convert.ToInt32(sDict["TotalInterviewed"]) : 0;
                            summary.TotalOffered = sDict.ContainsKey("TotalOffered") && sDict["TotalOffered"] != null ? Convert.ToInt32(sDict["TotalOffered"]) : 0;
                            summary.TotalJoined = sDict.ContainsKey("TotalJoined") && sDict["TotalJoined"] != null ? Convert.ToInt32(sDict["TotalJoined"]) : 0;
                            summary.TotalRejected = sDict.ContainsKey("TotalRejected") && sDict["TotalRejected"] != null ? Convert.ToInt32(sDict["TotalRejected"]) : 0;
                            summary.ConversionRate = sDict.ContainsKey("ConversionRate") && sDict["ConversionRate"] != null ? Convert.ToDecimal(sDict["ConversionRate"]) : 0;
                        }

                        var dataRows = await multi.ReadAsync<CandidateReportItem>();
                        items = dataRows.ToList();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing USP_Candidate_Report_Get: {ex.Message}");
            }

            return (totalCount, summary, items);
        }

        public async Task<byte[]> GenerateCandidateReportExcelAsync(CandidateReportFilterRequest filter, string companyId)
        {
            filter.PageIndex = 0;
            filter.PageSize = 100000;
            var (_, _, items) = await GetCandidateReportAsync(filter, companyId);

            using (var workbook = new XLWorkbook())
            {
                var ws = workbook.Worksheets.Add("Candidate Report");

                string[] headers = new string[] {
                    "Sr. No.", "Month", "Candidate ID", "Candidate Name", "Email", "Mobile",
                    "Job Requisition / MRF", "Position / Job Title", "Department", "Location",
                    "Source / Vendor", "Experience (Yrs)", "Current CTC", "Expected CTC",
                    "Notice Period", "Education", "Key Skills", "Pipeline Status",
                    "Applied Date", "Onboarded Date", "Address"
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
                    ws.Cell(row, 3).Value = item.PkRecId ?? "";
                    ws.Cell(row, 4).Value = item.CandidateName ?? "";
                    ws.Cell(row, 5).Value = item.Email ?? "";
                    ws.Cell(row, 6).Value = item.Mobile ?? "";
                    ws.Cell(row, 7).Value = item.MrfCode ?? item.JobId ?? "";
                    ws.Cell(row, 8).Value = item.JobTitle ?? "";
                    ws.Cell(row, 9).Value = item.Department ?? "";
                    ws.Cell(row, 10).Value = item.Location ?? "";
                    ws.Cell(row, 11).Value = item.Source ?? "";
                    ws.Cell(row, 12).Value = item.Experience ?? "0";
                    ws.Cell(row, 13).Value = item.CurrentCtc ?? "0";
                    ws.Cell(row, 14).Value = item.ExpectedCtc ?? "0";
                    ws.Cell(row, 15).Value = item.NoticePeriod ?? "";
                    ws.Cell(row, 16).Value = item.Education ?? "";
                    ws.Cell(row, 17).Value = item.KeySkills ?? "";
                    ws.Cell(row, 18).Value = item.DisplayStatus ?? "";
                    ws.Cell(row, 19).Value = item.AppliedDate?.ToString("yyyy-MM-dd") ?? "";
                    ws.Cell(row, 20).Value = item.OnboardCompletionDate?.ToString("yyyy-MM-dd") ?? "";
                    ws.Cell(row, 21).Value = item.Address ?? "";

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
