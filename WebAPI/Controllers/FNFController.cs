using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static HRMSWebAPI.Models.ImportExcle;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class FNFController : ControllerBase
    {
        private readonly IFNFRepository fNFRepository;

        public FNFController(IFNFRepository _fNFRepository)

        {
            fNFRepository = _fNFRepository;
        }
        [HttpPost("getfnflist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEmployeesAsync([FromBody] fnfrequestmodel request)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var (totalCount1, totalCount2, pendingData, processedData) = await fNFRepository.fnflist(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.EmpCode, request.EmpCodeManual, request.EmpName,
                    request.SelectedDepartments, request.SelectedDesignation, request.SelectedLocations,
                    request.SelectedNature, request.SelectedCity,
                    request.SortBy, decryptedUserId, request.EmpStatus, request.searchTerm1,request.searchTerm2
                );

                if ((pendingData == null || !((IEnumerable<dynamic>)pendingData).Any())
                    && (processedData == null || !((IEnumerable<dynamic>)processedData).Any()))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "FnF list retrieved successfully.";
                modelResponse.Data = new
                {
                    PendingGrid = new { TotalCount = totalCount1, Data = pendingData },
                    ProcessedGrid = new { TotalCount = totalCount2, Data = processedData }
                };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        // aryan
        [HttpGet("fnf-data/{empId}")]
        [Authorize]
        public async Task<IActionResult> GetFullAndFinalSettlementData(string empId)
        {
            ModelResponse response = new ModelResponse();

            try
            {
                var result =
                    await fNFRepository
                        .GetFullAndFinalSettlementData(empId);

                if (result == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = 404;
                    response.Message = "Record not found.";

                    return Ok(response);
                }

                response.IsSuccess = true;
                response.StatusCode = 200;
                response.Message = "Record Retrieved Successfully.";
                response.Data = result;

                return Ok(response);
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.StatusCode = 500;
                response.Message = ex.Message;

                return Ok(response);
            }
        }



      

        [HttpGet("download-pdf/{empId}")]
        [Authorize]
        public async Task<IActionResult> DownloadPdf(string empId)
        {
            try
            {
                byte[] pdf =
                    await fNFRepository
                        .DownloadPdf(empId);

                if (pdf == null || pdf.Length == 0)
                {
                    return NotFound("PDF could not be generated.");
                }

                return File(
                    pdf,
                    "application/pdf",
                    $"FullAndFinalSettlement_{empId}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        //rupesh

        [HttpGet("GetDetail/{pk_empid}")]
        [Authorize]
        public async Task<IActionResult> GetFnfSettlementDetailAsync([FromRoute] string pk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await fNFRepository.GetFnfSettlementDetailAsync(pk_empid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Repository returned null. SP may be returning multiple result sets.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "F&F settlement details fetched successfully.";
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

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertFnfSettlementAsync([FromBody] FnfSettlementMst fnfSettlementMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isInserted = await fNFRepository.InsertFnfSettlementAsync(fnfSettlementMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted
                    ? "F&F settlement submitted successfully."
                    : "Failed to submit F&F settlement.";
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

        [HttpGet("View/{fk_empid}")]
        [Authorize]
        public async Task<IActionResult> GetFnfSettlementViewAsync([FromRoute] string fk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await fNFRepository.GetFnfSettlementViewAsync(fk_empid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "F&F settlement record not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "F&F settlement record fetched successfully.";
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


        [HttpPost("ViewFnfReportlist")]
        [Authorize]
        public async Task<IActionResult> ViewFnfReportlistAsync([FromBody] ReportModelRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, employees) = await fNFRepository.ViewFnfReportAsync(request);

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data list retrieved successfully.";
                modelResponse.Data = employees;
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

        [HttpPost("downloadViewFnfReportlist")]
        [Authorize]
        public async Task<IActionResult> downloadViewFnfReportlist([FromBody] ReportModelRequest request)
        {
            try
            {
                var (totalCount, dynamicResults) = await fNFRepository.ViewFnfReportAsync(request);

                if (dynamicResults == null || !dynamicResults.Any())
                {
                    return BadRequest("No records to export.");
                }

                using (var workbook = new ClosedXML.Excel.XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("FnF Report");
                    var list = dynamicResults.ToList();
                    var firstRow = list[0] as IDictionary<string, object>;
                    if (firstRow == null) return BadRequest("Invalid data format.");

                    var columns = firstRow.Keys.ToList();

                    // Header Row
                    for (int colIdx = 0; colIdx < columns.Count; colIdx++)
                    {
                        worksheet.Cell(1, colIdx + 1).Value = columns[colIdx];
                        worksheet.Cell(1, colIdx + 1).Style.Font.Bold = true;
                    }

                    // Data Rows
                    for (int rowIdx = 0; rowIdx < list.Count; rowIdx++)
                    {
                        var rowData = list[rowIdx] as IDictionary<string, object>;
                        for (int colIdx = 0; colIdx < columns.Count; colIdx++)
                        {
                            var val = rowData != null && rowData.TryGetValue(columns[colIdx], out var v) ? v : null;
                            worksheet.Cell(rowIdx + 2, colIdx + 1).Value = val != null ? ClosedXML.Excel.XLCellValue.FromObject(val) : ClosedXML.Excel.XLCellValue.FromObject("");
                        }
                    }

                    using (var stream = new System.IO.MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "FnF_Report.xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
