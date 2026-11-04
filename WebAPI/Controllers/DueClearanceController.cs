using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using HRMSWebAPI.Helper;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DueClearanceController : ControllerBase
    {
        private readonly IDueClearanceRepository dueClearanceRepository;

        public DueClearanceController(IDueClearanceRepository _dueClearanceRepository)
        {
            dueClearanceRepository = _dueClearanceRepository;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                var (totalCount, result) = await dueClearanceRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);

                if (result == null || totalCount == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clearance department list retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> CreateAsync([FromBody] ClearanceDepartmentModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var DecryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var DecryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                // Fill audit fields
                model.ClearanceDepartment.fk_insUserID = DecryptedUserId;
                model.ClearanceDepartment.fk_companyId = fk_companyId;

                foreach (var trn in model.Transactions)
                {
                    trn.fk_insUserID = DecryptedUserId;
                    trn.fk_updUserID = DecryptedUserId;
                }

                bool isInserted = await dueClearanceRepository.CreateAsync(model, DecryptedUserId, DecryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Clearance Department inserted successfully." : "Failed to insert Clearance Department.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

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

        [HttpGet("{pk_clsdeptId}")]
        [Authorize]

        public async Task<IActionResult> GetByIdAsync([FromRoute] long pk_clsdeptId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                ClearanceDepartmentModel result = await dueClearanceRepository.GetByIdAsync(pk_clsdeptId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid clsdeptId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clarance detail retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateTravelMstAsync(long pk_clsdeptId, [FromBody] ClearanceDepartmentModel model)
        {
            ModelResponse modelResponse = new ModelResponse();


            try
            {
                var DecryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var DecryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                model.ClearanceDepartment.fk_updUserID = DecryptedUserId;
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                model.ClearanceDepartment.fk_companyId = fk_companyId;
                pk_clsdeptId = (long)model.ClearanceDepartment?.pk_clsdeptId;


                bool isUpdated = await dueClearanceRepository.UpdateClearanceMstAsync(model, pk_clsdeptId, DecryptedUserId, DecryptedLocationId);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "detail updated successfully." : " update  failed.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

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

        [HttpDelete("Delete/{pk_clsdeptId}")]
        [Authorize]
        public async Task<IActionResult> Delete(long pk_clsdeptId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await dueClearanceRepository.Delete(pk_clsdeptId);

                if (!result)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to delete clearance department.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clearance department deleted successfully.";
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

        [HttpGet("GetParamsByDept/{fk_deptid}")]
        [Authorize]
        public async Task<IActionResult> GetParamsByDept(string fk_deptid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await dueClearanceRepository.GetParamsByDept(fk_deptid, fk_companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Department parameters retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpPost("CreateUserClearance")]
        [Authorize]
        public async Task<IActionResult> CreateUserClearanceAsync([FromBody] ClearanceDepartmentUserModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                model.ClearanceDepartmentUser.fk_companyId = fk_companyId;
                model.ClearanceDepartmentUser.fk_insUserID = decryptedUserId;
                model.ClearanceDepartmentUser.fk_updUserID = decryptedUserId;
                model.ClearanceDepartmentUser.isActive = true;

                foreach (var trn in model.Transactions)
                {
                    trn.isActive = true;
                }

                bool isInserted = await dueClearanceRepository.CreateUserClearanceAsync(
                    model,
                    decryptedUserId,
                    decryptedLocationId
                );

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted
                    ? "User due clearance submitted successfully."
                    : "Failed to submit user due clearance.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

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

        [HttpGet("GetUserClearanceById/{pk_deptUserId}")]
        [Authorize]
        public async Task<IActionResult> GetUserClearanceById(long pk_deptUserId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await dueClearanceRepository.GetUserClearanceByIdAsync(pk_deptUserId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "User due clearance details retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpGet("GetUserClearanceList")]
        [Authorize]
        public async Task<IActionResult> GetUserClearanceList(int pageIndex = 0, int pageSize = 10, string fk_deptid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var fk_companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var (totalCount, result) = await dueClearanceRepository.GetUserClearanceList( pageIndex, pageSize, fk_deptid, fk_companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "User due clearance list retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpPut("User")]
        [Authorize]
        public async Task<IActionResult> UpdateUserClearance([FromBody] ClearanceDepartmentUserModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var locationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                model.ClearanceDepartmentUser.fk_companyId = companyId;
                model.ClearanceDepartmentUser.fk_updUserID = userId;

                long pk_deptUserId =
                    (long)model.ClearanceDepartmentUser.pk_deptUserId!;

                bool result =
                    await dueClearanceRepository.UpdateUserClearanceAsync(
                        model,
                        pk_deptUserId,
                        userId,
                        locationId);

                modelResponse.IsSuccess = result;
                modelResponse.Message = result
                    ? "User clearance updated successfully."
                    : "Update failed.";

                modelResponse.StatusCode = result ? 200 : 400;

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

        [HttpGet("HODClearanceList")]
        [Authorize]
        public async Task<IActionResult> GetHODClearanceList( int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();



                var (totalCount, result) =
                    await dueClearanceRepository.GetHODClearanceList( pageIndex, pageSize, companyId, empId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "HOD clearance list retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpGet("HODClearanceByEmp/{fk_empid}")]
        [Authorize]
        public async Task<IActionResult> GetHODClearanceByEmp(string fk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                var result =
                    await dueClearanceRepository.GetHODClearanceByEmpIdAsync( fk_empid, userId, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "HOD clearance details retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpPut("HODClearance")]
        [Authorize]
        public async Task<IActionResult> UpdateHODClearance(
            [FromBody] ClearanceDepartmentUserModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var locationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                model.ClearanceDepartmentUser.fk_companyId = companyId;
                model.ClearanceDepartmentUser.fk_updUserID = userId;

                bool result =
                    await dueClearanceRepository.UpdateHODClearanceAsync( model, userId, locationId);

                modelResponse.IsSuccess = result;
                modelResponse.Message = result
                    ? "HOD clearance updated successfully."
                    : "HOD clearance update failed.";

                modelResponse.StatusCode = result ? 200 : 400;

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
        private bool CheckIsAdmin(string? empId)
        {
            var role = HttpContext.Items["DecryptedUserRole"]?.ToString();
            var loginType = HttpContext.Items["DecryptedLoginType"]?.ToString();

            return role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
                || loginType?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
                || empId == "GU-1";
        }

        [HttpGet("MyClearanceStatus")]
        [Authorize]
        public async Task<IActionResult> GetMyClearanceStatus( int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var (totalCount, result) =
                    await dueClearanceRepository.GetMyClearanceStatus( pageIndex, pageSize, companyId, empId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "My clearance status retrieved successfully.";
                modelResponse.Data = result;
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
        [HttpGet("MyClearance")]
        [HttpGet("DueClearance")]
        [Authorize]
        public async Task<IActionResult> GetMyClearance()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString(); // logged in employee

                var result =
                    await dueClearanceRepository.GetMyClearanceByEmpIdAsync( empId, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "My clearance details retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpGet("GetClearanceByEmp/{fk_empid}")]
        [Authorize]
        public async Task<IActionResult> GetClearanceByEmp(string fk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var result =
                    await dueClearanceRepository.GetMyClearanceByEmpIdAsync( fk_empid, companyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clearance details retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpGet("AdminClearanceStatusList")]
        [Authorize]
        public async Task<IActionResult> GetAdminClearanceStatusList(
            int pageIndex = 0,
            int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();



                var (totalCount, result) =
                    await dueClearanceRepository.GetAdminClearanceStatusList( pageIndex, pageSize, companyId, empId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Admin clearance status list retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpGet("CheckClearanceReviewAccess")]
        [Authorize]
        public async Task<IActionResult> CheckClearanceReviewAccess()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var empId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(empId))
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Data = false;
                    return Ok(modelResponse);
                }

                var isHodOrAdmin = await CheckIsHODOrAdmin(empId);
                if (isHodOrAdmin)
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Data = true;
                    return Ok(modelResponse);
                }

                using (var connection = DataBaseFactory.ConnString())
                {
                    await connection.OpenAsync();
                    var count = await connection.ExecuteScalarAsync<int>(
                        "SELECT COUNT(1) FROM FFS_ClearanceDepartment_Mst WHERE fk_empid = @empId AND isActive = 1",
                        new { empId }
                    );
                    
                    modelResponse.IsSuccess = true;
                    modelResponse.Data = count > 0;
                    return Ok(modelResponse);
                }
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }

        private async Task<bool> CheckIsHODOrAdmin(string? empId)
        {
            if (string.IsNullOrEmpty(empId)) return false;
            if (CheckIsAdmin(empId)) return true;

            var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            using (var connection = DataBaseFactory.ConnString())
            {
                await connection.OpenAsync();
                var query = @"
                    SELECT COUNT(1) 
                    FROM SAL_Employee_Mst 
                    WHERE (fk_FunctionalHODempid = @empId OR fk_AdministrativeHODempid = @empId)
                      AND fk_companyId = @companyId";
                var count = await connection.ExecuteScalarAsync<int>(query, new { empId, companyId });
                return count > 0;
            }
        }

        [HttpPost("SkipClearance/{pk_seprequestId}")]
        [Authorize]
        public async Task<IActionResult> SkipClearance(long pk_seprequestId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();
                
                // Allow only Admins or HRs to skip clearance
                if (!CheckIsAdmin(userId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Unauthorized. Only administrators can skip clearance.";
                    modelResponse.StatusCode = 403;
                    return Ok(modelResponse);
                }

                bool result = await dueClearanceRepository.SkipClearanceAsync(pk_seprequestId, userId!);

                if (result)
                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Due clearance skipped successfully.";
                    modelResponse.StatusCode = 200;
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to skip due clearance.";
                    modelResponse.StatusCode = 400;
                }

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

        [Authorize]
        [HttpGet("ReportPdf/{fk_empid}")]
        public async Task<IActionResult> PrintDueClearancePdf(string fk_empid, [FromQuery] bool isHOD = false)
        {
            try
            {
                var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();

                ClearanceDepartmentUserModel report;
                if (isHOD)
                {
                    report = await dueClearanceRepository.GetHODClearanceByEmpIdAsync(fk_empid, userId!, companyId!);
                }
                else
                {
                    report = await dueClearanceRepository.GetMyClearanceByEmpIdAsync(fk_empid, companyId!);
                }

                if (report == null || report.ClearanceDepartmentUser == null)
                    return NotFound("No due clearance data found.");

                var titleFont = FontFactory.GetFont("Verdana", 14, iTextSharp.text.Font.BOLD);
                var headerFont = FontFactory.GetFont("Verdana", 11, iTextSharp.text.Font.BOLD);
                var bodyFont = FontFactory.GetFont("Verdana", 9, iTextSharp.text.Font.NORMAL);
                var bodyFontBold = FontFactory.GetFont("Verdana", 9, iTextSharp.text.Font.BOLD);

                var pdfDoc = new iTextSharp.text.Document(iTextSharp.text.PageSize.A4, 20, 20, 20, 20);
                var pdfData = new MemoryStream();

                PdfWriter.GetInstance(pdfDoc, pdfData);
                pdfDoc.Open();

                var title = new Paragraph("Due Clearance Report", titleFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 12f
                };
                pdfDoc.Add(title);

                var empTable = new PdfPTable(4) { WidthPercentage = 100 };
                empTable.SetWidths(new float[] { 20f, 30f, 20f, 30f });

                AddInfoCell(empTable, "Employee Code", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.ClearanceDepartmentUser.empcode ?? "-", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Employee Name", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.ClearanceDepartmentUser.empname ?? "-", bodyFont, Element.ALIGN_LEFT);

                AddInfoCell(empTable, "Department", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, report.ClearanceDepartmentUser.employeeDepartment ?? "-", bodyFont, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Status", bodyFontBold, Element.ALIGN_LEFT);
                AddInfoCell(empTable, "Active", bodyFont, Element.ALIGN_LEFT);

                pdfDoc.Add(empTable);
                pdfDoc.Add(new Paragraph(" ", bodyFont));

                var groupedTransactions = report.Transactions
                    .GroupBy(t => t.departmentName ?? "Other")
                    .OrderBy(g => g.Key)
                    .ToList();

                decimal totalRecovery = 0;

                foreach (var group in groupedTransactions)
                {
                    var deptHeading = new Paragraph($"Department - {group.Key}", headerFont)
                    {
                        SpacingBefore = 8f,
                        SpacingAfter = 4f
                    };
                    pdfDoc.Add(deptHeading);

                    var assetTable = new PdfPTable(6) { WidthPercentage = 100 };
                    assetTable.SetWidths(new float[] { 8f, 32f, 15f, 15f, 15f, 15f });

                    AddInfoCell(assetTable, "Sr.No.", bodyFontBold, Element.ALIGN_CENTER);
                    AddInfoCell(assetTable, "Asset Name", bodyFontBold, Element.ALIGN_CENTER);
                    AddInfoCell(assetTable, "Issued?", bodyFontBold, Element.ALIGN_CENTER);
                    AddInfoCell(assetTable, "Status", bodyFontBold, Element.ALIGN_CENTER);
                    AddInfoCell(assetTable, "Recovery (₹)", bodyFontBold, Element.ALIGN_CENTER);
                    AddInfoCell(assetTable, "Remarks", bodyFontBold, Element.ALIGN_CENTER);

                    int count = 1;
                    foreach (var trn in group)
                    {
                        AddInfoCell(assetTable, count.ToString(), bodyFont, Element.ALIGN_CENTER);
                        AddInfoCell(assetTable, trn.assetName ?? "-", bodyFont, Element.ALIGN_LEFT);
                        AddInfoCell(assetTable, trn.isIssued == true ? "Yes" : "No", bodyFont, Element.ALIGN_CENTER);
                        AddInfoCell(assetTable, trn.assetStatus ?? "-", bodyFont, Element.ALIGN_CENTER);
                        AddInfoCell(assetTable, (trn.recoveryAmount ?? 0).ToString("F2"), bodyFont, Element.ALIGN_RIGHT);
                        AddInfoCell(assetTable, trn.remarks ?? "-", bodyFont, Element.ALIGN_LEFT);

                        totalRecovery += trn.recoveryAmount ?? 0;
                        count++;
                    }

                    pdfDoc.Add(assetTable);
                }

                pdfDoc.Add(new Paragraph(" ", bodyFont));
                var summaryTable = new PdfPTable(2) { WidthPercentage = 100 };
                summaryTable.SetWidths(new float[] { 80f, 20f });

                var totalLabelCell = new PdfPCell(new Phrase("Grand Total Recovery Amount:", bodyFontBold))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 6f
                };
                var totalValueCell = new PdfPCell(new Phrase($"₹ {totalRecovery:F2}", bodyFontBold))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 6f
                };
                summaryTable.AddCell(totalLabelCell);
                summaryTable.AddCell(totalValueCell);
                pdfDoc.Add(summaryTable);

                pdfDoc.Close();

                var fileBytes = pdfData.ToArray();
                return File(fileBytes, "application/pdf", $"DueClearance_{fk_empid}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private static void AddInfoCell(PdfPTable table, string text, Font font, int alignment)
        {
            table.AddCell(new PdfPCell(new Phrase(text, font))
            {
                HorizontalAlignment = alignment,
                Padding = 5f
            });
        }
    }
}