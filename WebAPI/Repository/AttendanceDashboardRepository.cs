using ClosedXML.Excel;
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HRMSWebAPI.Repository
{
    public class AttendanceDashboardRepository : IAttendanceDashboardRepository
    {
        public async Task<AttendanceDashboardOverviewResponse> GetKPIsAndTrendsAsync(AttendanceDashboardFilterRequest request, string companyId, string userId)
        {
            var response = new AttendanceDashboardOverviewResponse();

            try
            {
                using (var connection = DataBaseFactory.ConnString())
                {
                    var p = new DynamicParameters();
                    p.Add("@action", "OVERVIEW", DbType.String);
                    p.Add("@fk_companyId", companyId ?? "", DbType.String);
                    p.Add("@fk_departmentId", request.Fk_DepartmentId ?? "", DbType.String);
                    p.Add("@fk_locationId", request.Fk_LocationId ?? "", DbType.String);
                    p.Add("@fk_monthId", request.Fk_MonthId, DbType.Int32);
                    p.Add("@fk_yearId", request.Fk_YearId, DbType.Int32);
                    
                    DateTime? selDate = null;
                    if (!string.IsNullOrWhiteSpace(request.SelectedDate) && DateTime.TryParse(request.SelectedDate, out var parsedDate))
                    {
                        selDate = parsedDate;
                    }
                    else if (request.DayFilter > 0 && request.Fk_MonthId > 0 && request.Fk_YearId > 0)
                    {
                        try
                        {
                            selDate = new DateTime(request.Fk_YearId, request.Fk_MonthId, request.DayFilter);
                        }
                        catch { }
                    }
                    p.Add("@selectedDate", selDate, DbType.Date);
                    p.Add("@dayFilter", request.DayFilter, DbType.Int32);
                    p.Add("@fk_userId", userId ?? "", DbType.String);

                    using (var multi = await connection.QueryMultipleAsync("SAL_Admin_Attendance_Dashboard", p, commandType: CommandType.StoredProcedure))
                    {
                        // 1. Overall KPIs
                        var kpis = await multi.ReadFirstOrDefaultAsync<AttendanceDashboardKPIModel>();
                        if (kpis != null)
                        {
                            // Ensure non-negative numbers and safe percentage
                            kpis.TotalEmployees = Math.Max(0, kpis.TotalEmployees);
                            kpis.PresentCount = Math.Max(0, kpis.PresentCount);
                            kpis.AbsentCount = Math.Max(0, kpis.AbsentCount);
                            kpis.LateCount = Math.Max(0, kpis.LateCount);
                            kpis.HalfDayCount = Math.Max(0, kpis.HalfDayCount);
                            kpis.OnLeaveCount = Math.Max(0, kpis.OnLeaveCount);
                            kpis.TotalPresentDays = Math.Max(0, kpis.TotalPresentDays);
                            kpis.TotalAbsentDays = Math.Max(0, kpis.TotalAbsentDays);
                            kpis.TotalLateDays = Math.Max(0, kpis.TotalLateDays);
                            kpis.TotalHalfDays = Math.Max(0, kpis.TotalHalfDays);
                            kpis.TotalLeaveDays = Math.Max(0, kpis.TotalLeaveDays);

                            decimal totalPossible = kpis.TotalPresentDays + kpis.TotalAbsentDays + kpis.TotalLeaveDays;
                            if (totalPossible > 0)
                            {
                                kpis.AvgAttendancePercent = Math.Round((kpis.TotalPresentDays / totalPossible) * 100m, 1);
                            }

                            response.KPIs = kpis;
                        }

                        // 2. Live Action Highlights
                        if (!multi.IsConsumed)
                        {
                            var highlights = (await multi.ReadAsync<LiveHighlightItem>()).ToList();
                            response.LiveHighlights = highlights ?? new List<LiveHighlightItem>();
                        }

                        // 3. Daily Trend List
                        if (!multi.IsConsumed)
                        {
                            var trends = (await multi.ReadAsync<DailyAttendanceTrendModel>()).ToList();
                            response.Trends = trends ?? new List<DailyAttendanceTrendModel>();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AttendanceDashboard GetKPIs] Error: {ex.Message}");
                throw;
            }

            return response;
        }

        public async Task<AttendanceDashboardGridResponse> GetEmployeeGridAsync(AttendanceDashboardFilterRequest request, string companyId, string userId)
        {
            var response = new AttendanceDashboardGridResponse();

            try
            {
                using (var connection = DataBaseFactory.ConnString())
                {
                    var p = new DynamicParameters();
                    p.Add("@action", "GRID", DbType.String);
                    p.Add("@fk_companyId", companyId ?? "", DbType.String);
                    p.Add("@fk_departmentId", request.Fk_DepartmentId ?? "", DbType.String);
                    p.Add("@fk_locationId", request.Fk_LocationId ?? "", DbType.String);
                    p.Add("@fk_monthId", request.Fk_MonthId, DbType.Int32);
                    p.Add("@fk_yearId", request.Fk_YearId, DbType.Int32);

                    DateTime? selDate = null;
                    if (!string.IsNullOrWhiteSpace(request.SelectedDate) && DateTime.TryParse(request.SelectedDate, out var parsedDate))
                    {
                        selDate = parsedDate;
                    }
                    else if (request.DayFilter > 0 && request.Fk_MonthId > 0 && request.Fk_YearId > 0)
                    {
                        try
                        {
                            selDate = new DateTime(request.Fk_YearId, request.Fk_MonthId, request.DayFilter);
                        }
                        catch { }
                    }
                    p.Add("@selectedDate", selDate, DbType.Date);
                    p.Add("@statusFilter", request.StatusFilter ?? "", DbType.String);
                    p.Add("@dayFilter", request.DayFilter, DbType.Int32);
                    p.Add("@searchTerm", request.SearchTerm ?? "", DbType.String);
                    p.Add("@pageNo", request.PageNo <= 0 ? 1 : request.PageNo, DbType.Int32);
                    p.Add("@pageSize", request.PageSize <= 0 ? 10 : request.PageSize, DbType.Int32);
                    p.Add("@fk_userId", userId ?? "", DbType.String);

                    using (var multi = await connection.QueryMultipleAsync("SAL_Admin_Attendance_Dashboard", p, commandType: CommandType.StoredProcedure))
                    {
                        var totalCount = await multi.ReadFirstOrDefaultAsync<int?>();
                        response.TotalRecords = totalCount ?? 0;

                        if (!multi.IsConsumed)
                        {
                            var list = (await multi.ReadAsync<EmployeeAttendanceGridItem>()).ToList();
                            response.Records = list ?? new List<EmployeeAttendanceGridItem>();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AttendanceDashboard GetEmployeeGrid] Error: {ex.Message}");
                throw;
            }

            return response;
        }

        public async Task<byte[]> ExportToExcelWithImagesAsync(AttendanceDashboardFilterRequest request, string companyId, string userId, string uploadFolder)
        {
            // For export, fetch all matching records (e.g. PageSize = 10000)
            request.PageNo = 1;
            request.PageSize = 10000;
            var data = await GetEmployeeGridAsync(request, companyId, userId);

            using (var workbook = new XLWorkbook())
            {
                var ws = workbook.Worksheets.Add("Attendance_Report");

                // Headers
                string[] headers = new[]
                {
                    "Sr No", "Emp Code", "Employee Name", "Department", 
                    "Present", "Absent", "Late", "Leave", "Half Day", "Paid Days",
                    "Punch In", "In Photo", "In Location Address",
                    "Punch Out", "Out Photo", "Out Location Address", "Working Hour", "Source"
                };

                for (int col = 0; col < headers.Length; col++)
                {
                    var cell = ws.Cell(1, col + 1);
                    cell.Value = headers[col];
                    cell.Style.Font.Bold = true;
                    cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1a1a2e");
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                }
                ws.Row(1).Height = 28;

                int row = 2;
                foreach (var emp in data.Records)
                {
                    ws.Cell(row, 1).Value = row - 1;
                    ws.Cell(row, 2).Value = emp.Empcode ?? "";
                    ws.Cell(row, 3).Value = emp.Empname ?? "";
                    ws.Cell(row, 4).Value = emp.Department ?? "";
                    ws.Cell(row, 5).Value = emp.Present;
                    ws.Cell(row, 6).Value = emp.Absent;
                    ws.Cell(row, 7).Value = emp.Late;
                    ws.Cell(row, 8).Value = emp.Leave;
                    ws.Cell(row, 9).Value = emp.Halfday;
                    ws.Cell(row, 10).Value = emp.Paiddays;
                    ws.Cell(row, 11).Value = emp.Intime ?? "-";
                    ws.Cell(row, 13).Value = emp.PunchInLocAddress ?? emp.LocAddress ?? "";
                    ws.Cell(row, 14).Value = emp.Outtime ?? "-";
                    ws.Cell(row, 16).Value = emp.PunchOutLocAddress ?? "";
                    ws.Cell(row, 17).Value = emp.Workhour ?? "-";
                    ws.Cell(row, 18).Value = emp.PunchSource ?? "-";

                    bool hasAnyPhoto = false;

                    // Punch In Photo (Column 12)
                    string inImg = emp.PunchInImageUrl ?? emp.PunchImageUrl ?? "";
                    if (!string.IsNullOrWhiteSpace(inImg))
                    {
                        try
                        {
                            string fileName = Path.GetFileName(inImg);
                            string imagePath = Path.Combine(uploadFolder, fileName);

                            if (File.Exists(imagePath))
                            {
                                hasAnyPhoto = true;
                                var imageCell = ws.Cell(row, 12);
                                ws.AddPicture(imagePath)
                                  .MoveTo(imageCell, 4, 4)
                                  .WithSize(50, 48);
                            }
                            else
                            {
                                ws.Cell(row, 12).Value = "-";
                            }
                        }
                        catch
                        {
                            ws.Cell(row, 12).Value = "-";
                        }
                    }
                    else
                    {
                        ws.Cell(row, 12).Value = "-";
                    }

                    // Punch Out Photo (Column 15)
                    string outImg = emp.PunchOutImageUrl ?? "";
                    if (!string.IsNullOrWhiteSpace(outImg))
                    {
                        try
                        {
                            string fileName = Path.GetFileName(outImg);
                            string imagePath = Path.Combine(uploadFolder, fileName);

                            if (File.Exists(imagePath))
                            {
                                hasAnyPhoto = true;
                                var imageCell = ws.Cell(row, 15);
                                ws.AddPicture(imagePath)
                                  .MoveTo(imageCell, 4, 4)
                                  .WithSize(50, 48);
                            }
                            else
                            {
                                ws.Cell(row, 15).Value = "-";
                            }
                        }
                        catch
                        {
                            ws.Cell(row, 15).Value = "-";
                        }
                    }
                    else
                    {
                        ws.Cell(row, 15).Value = "-";
                    }

                    if (hasAnyPhoto)
                    {
                        ws.Row(row).Height = 55;
                        ws.Column(12).Width = 16;
                        ws.Column(15).Width = 16;
                    }

                    row++;
                }

                ws.Columns(1, 11).AdjustToContents();
                ws.Column(13).AdjustToContents();
                ws.Column(14).AdjustToContents();
                ws.Column(16).AdjustToContents();
                ws.Column(17).AdjustToContents();
                ws.Column(18).AdjustToContents();

                using (var ms = new MemoryStream())
                {
                    workbook.SaveAs(ms);
                    return ms.ToArray();
                }
            }
        }

        public async Task<List<EmployeeOccurrenceItem>> GetEmployeeOccurrencesAsync(string empCode, string empId, int monthId, int yearId, string statusFilter)
        {
            try
            {
                using (var connection = DataBaseFactory.ConnString())
                {
                    var p = new DynamicParameters();
                    p.Add("@action", "OCCURRENCES", DbType.String);
                    p.Add("@empcode", empCode ?? "", DbType.String);
                    p.Add("@empid", empId ?? "", DbType.String);
                    p.Add("@fk_monthId", monthId, DbType.Int32);
                    p.Add("@fk_yearId", yearId, DbType.Int32);
                    p.Add("@statusFilter", statusFilter ?? "", DbType.String);

                    var list = await connection.QueryAsync<EmployeeOccurrenceItem>(
                        "SAL_Admin_Attendance_Dashboard", 
                        p, 
                        commandType: CommandType.StoredProcedure
                    );
                    return list?.ToList() ?? new List<EmployeeOccurrenceItem>();
                }
            }
            catch (Exception)
            {
                return new List<EmployeeOccurrenceItem>();
            }
        }
    }
}
