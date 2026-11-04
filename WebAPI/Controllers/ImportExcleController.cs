using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Pkcs;
using System.ComponentModel.DataAnnotations;
using System.Dynamic;
using static HRMSWebAPI.Models.ImportExcle;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ImportExcleController : ControllerBase
    {
        private readonly IImportExcleRepository importExcleRepository;

        public ImportExcleController(IImportExcleRepository _importExcleRepository)

        {
            importExcleRepository = _importExcleRepository;
        }
        [HttpPost("LeaveTakenuploadexcel")]
        [Authorize]
        public async Task<IActionResult> LeaveTakenuploadexcel(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                // Read Excel -> List<Dictionary<string, string>>
                var data = ExcelHelper.ReadExcelDynamic(file);

                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data.",
                        StatusCode = 400
                    });
                }

                var employees = ExcelHelper.ConvertToModelListNoCase<Excel_leavetakenUploadModelResponse>(data);

                var request = new Excel_leavetakenUploadRequest
                {
                    Excel_leavetakenUploadModelResponse = employees
                };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.LeaveTakenuploadexcel(request, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                // Combine results
                var combinedResult = new List<dynamic>();

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Leave Taken  data retrieved successfully.";
                modelResponse.Data = result;

                return Ok(modelResponse);

            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }


        [HttpPost("upload-excel")]
        [Authorize]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                // Read Excel -> List<Dictionary<string, string>>
                var data = ExcelHelper.ReadExcelDynamic(file);

                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data.",
                        StatusCode = 400
                    });
                }

                var employees = ExcelHelper.ConvertToModelList<ExcelUploadModelResponse>(data);

                var request = new ExcelUploadRequest
                {
                    Employees = employees
                };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.BulkInsertGeneric(request, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                // Combine results
                var combinedResult = new List<dynamic>();

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee attendance data retrieved successfully.";
                modelResponse.Data = result;

                return Ok(modelResponse);

            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }

        [HttpPost("GetAttendanceList")]
        [Authorize]
        public async Task<IActionResult> GetAttendanceList([FromBody] ImportAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (NotMarkedCount, MarkedCount, employees) = await importExcleRepository.GetAttendanceAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_classid,
                    request.fk_costcentreid

                );
                if ((employees.AttendanceNotmarked?.Count ?? 0) +

                    (employees.Attendancemarked?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "attendance data retrieved successfully.";
                modelResponse.Data = employees;
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






        //for day wise
        [HttpPost("GetAttendanceListfordaywiseImport")]
        [Authorize]
        public async Task<IActionResult> GetAttendanceListfordaywiseImport([FromBody] ImportAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (NotMarkedCount, MarkedCount, employees) = await importExcleRepository.GetdaywiseAttendanceAsync(
                    request.PageIndex1, request.PageSize1,
                    request.PageIndex2, request.PageSize2,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_classid,
                    request.fk_costcentreid

                );
                if ((employees.AttendanceNotmarked?.Count ?? 0) +

                    (employees.Attendancemarked?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "attendance data retrieved successfully.";
                modelResponse.Data = employees;
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


        //for day wise

        [HttpPost("exportAttendancedaywise")]
        [Authorize]
        public async Task<IActionResult> exportAttendancedaywise([FromBody] ImportAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var employees = await importExcleRepository.GetAttendancedaywiseForExportAsync(

                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_classid,
                    request.fk_costcentreid,
                    request.TemplateType <= 0 ? 1 : request.TemplateType
                );


                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = employees;
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

        // for day wise end

        [HttpPost("exportAttendance")]
        [Authorize]
        public async Task<IActionResult> exportAttendance([FromBody] ImportAttendanceRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var employees = await importExcleRepository.GetAttendanceForExportAsync(

                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId,
                    request.fk_classid,
                     request.fk_costcentreid

                );


                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = employees;
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
        // for day wise import
        [HttpPost("ImportDaywiseAttendance")]
        [Authorize]
        public async Task<IActionResult> ImportDaywiseAttendance(IFormFile file, [FromForm] string FkMonthId, [FromForm] string FkYearId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                var data = ExcelHelper.ReadExcelDynamic(file);

                Console.WriteLine(data);

                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data.",
                        StatusCode = 400
                    });
                }


                var employees = ExcelHelper.ConvertToModelListNoCase<SAL_Attendance_Daily>(data);

                // for validate excel input
                // 🔹 STEP 1: Validate using Data Annotations
                var validationErrors = new List<string>();
                foreach (var record in employees)
                {
                    var context = new ValidationContext(record, null, null);
                    var results = new List<ValidationResult>();

                    if (!Validator.TryValidateObject(record, context, results, true))
                    {
                        foreach (var error in results)
                        {
                            validationErrors.Add($"{error.ErrorMessage}");
                        }
                    }
                }

                // If any errors found, return immediately
                if (validationErrors.Count > 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        StatusCode = 400,
                        Message = string.Join("\n", validationErrors)
                    });
                }

                //end

                var request = new AttendanceDaywiseImportRequest
                {
                    SAL_Attendance_Daily = employees
                };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId or LocationId not found.",
                        StatusCode = 401
                    });
                }

                //   bool result = await importExcleRepository.SAL_EmpdaywiseAttendance_ForImport(request, decryptedUserId, decryptedLocationId, FkMonthId, FkYearId);
                var result = (await importExcleRepository.SAL_EmpdaywiseAttendance_ForImport(
       request,
       decryptedUserId,
       decryptedLocationId,
       FkMonthId,
       FkYearId)).ToList();

                var successList = result
                    .Where(x => Convert.ToString(x.Status) == "Success")
                    .ToList();

                var errorList = result
                    .Where(x => Convert.ToString(x.Status) == "Error")
                    .ToList();


                int totalHeadCount = employees?.Count ?? (successList.Count + errorList.Count);

                modelResponse.IsSuccess = true;
                modelResponse.Message = $"Import Completed. Total Head Count: {totalHeadCount}, Success: {successList.Count}, Error: {errorList.Count}";
                modelResponse.Data = new
                {
                    TotalCount = totalHeadCount,
                    SuccessCount = successList.Count,
                    ErrorCount = errorList.Count,
                    SuccessList = successList,
                    ErrorList = errorList
                };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }




        // end


        [HttpPost("ImportAttendance")]
        [Authorize]
        public async Task<IActionResult> ImportAttendance(IFormFile file, [FromForm] string FkMonthId, [FromForm] string FkYearId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                var data = ExcelHelper.ReadExcelDynamic(file);

                Console.WriteLine(data);

                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data.",
                        StatusCode = 400
                    });
                }


                var employees = ExcelHelper.ConvertToModelListNoCase<AttendanceDetail>(data);

                foreach (var item in employees)
                {
                    item.paiddays = Math.Round(item.paiddays, 2);
                    item.lwp = item.totdays - item.paiddays;
                    item.lwp = Math.Round(item.lwp, 2);

                }
                var request = new AttendanceImportRequest
                {
                    AttendanceDetails = employees
                };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId or LocationId not found.",
                        StatusCode = 401
                    });
                }

                bool result = await importExcleRepository.Importattendance(request, decryptedUserId, decryptedLocationId, FkMonthId, FkYearId);

                modelResponse.IsSuccess = result;
                modelResponse.Message = result ? "Attendance data imported successfully." : "Attendance import failed.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }





      

        [HttpPost("ExportImportSalaryHeadList")]
        [Authorize]
        public async Task<IActionResult> ExportImportSalaryHeadList([FromBody] ExportImportSalaryHeadRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, employees) = await importExcleRepository.ExportImportSalaryHeadAsync(
                    request.PageIndex ?? 0, request.PageSize ?? 0,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    request.fk_costcentreid

                );
                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
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




      
        [HttpPost("exportsalartHead")]
        [Authorize]
        public async Task<IActionResult> exportsalartHead([FromBody] ExportImportSalaryHeadRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

            try
            {
                var employees = await importExcleRepository.SalaryHeadExportAsync(

                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    decryptedCompanyId,
                    request.headtype,
                    request.fk_costcentreid

                );

                var enrichedEmployees = employees;
                //var enrichedEmployees = ExcelHelper.EnrichExportRowsWithAliases(employees, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = enrichedEmployees;
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









       
        [HttpPost("ImportSalaryHead")]
        [Authorize]
        public async Task<IActionResult> ImportSalaryHead(IFormFile file, [FromForm] string EffectiveDate)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrWhiteSpace(EffectiveDate))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Effective Date is mandatory for import.",
                        StatusCode = 400
                    });
                }

                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                var data = ExcelHelper.ReadExcelDynamicWithoutTemplate(file);  // List<dynamic>

                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "The uploaded Excel file contains no data or all rows are empty.",
                        StatusCode = 400
                    });
                }

                bool hasValidEmpCode = data.Any(row =>
                {
                    var empCodeKey = row.Keys.FirstOrDefault(k =>
                        k.Equals("EmpCode", StringComparison.OrdinalIgnoreCase) ||
                        k.Equals("empcode", StringComparison.OrdinalIgnoreCase) ||
                        k.Equals("emp_code", StringComparison.OrdinalIgnoreCase) ||
                        k.Equals("code", StringComparison.OrdinalIgnoreCase) ||
                        k.Replace(" ", "").Equals("empcode", StringComparison.OrdinalIgnoreCase));
                    return empCodeKey != null && !string.IsNullOrWhiteSpace(row[empCodeKey]) && row[empCodeKey].Trim() != "0";
                });

                if (!hasValidEmpCode)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Import failed: The first row or data rows in the Excel file are empty or have missing 'EmpCode'. Please provide valid employee records.",
                        StatusCode = 400
                    });
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId or LocationId not found in authentication session.",
                        StatusCode = 401
                    });
                }

                var xmlString = ExcelHelper.ConvertOnlyHeadsXml(data, decryptedCompanyId);

                if (string.IsNullOrWhiteSpace(xmlString) || !xmlString.Contains("<head>"))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Import failed: Invalid Excel structure or empty records. The file must contain valid 'EmpCode' and 'Grade' columns followed by salary head columns.",
                        StatusCode = 400
                    });
                }

                var empCodes = data
                    .Select(row =>
                    {
                        var empCodeKey = row.Keys.FirstOrDefault(k =>
                            k.Equals("EmpCode", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("empcode", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("emp_code", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("code", StringComparison.OrdinalIgnoreCase) ||
                            k.Replace(" ", "").Equals("empcode", StringComparison.OrdinalIgnoreCase));
                        return empCodeKey != null ? row[empCodeKey]?.Trim() : null;
                    })
                    .Where(c => !string.IsNullOrWhiteSpace(c) && c != "0")
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var invalidEmpCodes = await importExcleRepository.ValidateEmpCodesAsync(empCodes, decryptedCompanyId, decryptedUserId);
                if (invalidEmpCodes != null && invalidEmpCodes.Any())
                {
                    string msg = invalidEmpCodes.Count == 1
                        ? $"Import failed: Employee Code '{invalidEmpCodes[0]}' does not exist for your company."
                        : $"Import failed: The following {invalidEmpCodes.Count} Employee Code(s) do not exist for your company: {string.Join(", ", invalidEmpCodes.Take(10))}{(invalidEmpCodes.Count > 10 ? $" and {invalidEmpCodes.Count - 10} more" : "")}.";

                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = msg,
                        StatusCode = 400
                    });
                }

                var (summary, details) = await importExcleRepository.CompareSalaryHeadImportAsync(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

                bool result = await importExcleRepository.ImportSalaryHead(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

                if (!result)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = $"Import failed: No matching employee records or salary heads found to update for Effective Date '{EffectiveDate}'.",
                        StatusCode = 400
                    });
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Salary heads imported successfully.";
                modelResponse.Data = new { isUpdated = result, summary, details };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }


        //[HttpPost("ImportSalaryHead")]
        //[Authorize]
        //public async Task<IActionResult> ImportSalaryHead(IFormFile file, [FromForm] string EffectiveDate)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        if (file == null || file.Length == 0)
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "File is required.",
        //                StatusCode = 400
        //            });
        //        }

        //        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        //        if (fileExtension != ".xlsx" && fileExtension != ".xls")
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Only .xlsx or .xls files are allowed.",
        //                StatusCode = 400
        //            });
        //        }


        //        var data = ExcelHelper.ReadExcelDynamic(file);  // List<dynamic>



        //        if (data == null || !data.Any())
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Excel file has no data.",
        //                StatusCode = 400
        //            });
        //        }
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "UserId or LocationId not found.",
        //                StatusCode = 401
        //            });
        //        }

        //        bool result = await importExcleRepository.ImportSalaryHead(data, decryptedUserId, decryptedLocationId, EffectiveDate);

        //        modelResponse.IsSuccess = result;
        //        modelResponse.Message = result ? "data imported successfully." : "import failed.";
        //        modelResponse.Data = result;
        //        modelResponse.StatusCode = 200;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = false,
        //            Message = ex.Message,
        //            StatusCode = 500
        //        });
        //    }
        //}




        [HttpPost("ImportExportEmpOtherDetailList")]
        [Authorize]
        public async Task<IActionResult> ExportImportEmployeeOtherDetail([FromBody] ExportImportSalaryHeadRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();


            try
            {
                var (totalCount, employees) = await importExcleRepository.ExportImportEmployeeOtherDetailAsync(
                    request.PageIndex ?? 0, request.PageSize ?? 0,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    request.fk_costcentreid,
                    request.empStatus,
                    decryptedCompanyId

                );
                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
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







        //[HttpPost("ImportEmpOtherDetails")]
        //[Authorize]
        //public async Task<IActionResult> ImportEmployeeOtherDetailAsync(IFormFile file)
        //{
        //    try
        //    {

        //        var data = ExcelHelper.ReadExcelDynamic(file);
        //        if (data == null || !data.Any())
        //            return BadRequest(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Excel file has no data."
        //            });

        //        var models = ExcelHelper.ConvertToModelList<EmployeeFullDetails>(data);
        //        var request = new EmployeeImportRequest { Employees = models };

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId


        //        if (string.IsNullOrEmpty(decryptedUserId))
        //            return Unauthorized(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "UserId not found.",
        //                StatusCode = 401
        //            });

        //        // 🌟 GL Posting Validation: Only I, D, S OR NULL allowed
        //        var allowedValues = new List<string> { "I", "D", "S" };
        //        var invalidRows = new List<int>();

        //        for (int i = 0; i < request.Employees.Count; i++)
        //        {
        //            // Read GL posting and normalize (trim + uppercase)
        //            var gl = request.Employees[i].glposting?.ToString().Trim().ToUpper();

        //            // Allow NULL / empty / whitespace,
        //            // but if value exists it must be I / D / S
        //            if (!string.IsNullOrWhiteSpace(gl) && !allowedValues.Contains(gl))
        //            {
        //                invalidRows.Add(i + 2); // Excel starts at row 2 (row 1 = header)
        //            }
        //        }


        //        if (invalidRows.Any())
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = $" found invalid value in row(s): {string.Join(", ", invalidRows)}. Only Allowed  I, D, S or blank.",
        //                StatusCode = 200
        //            });
        //        }
        //        var kraResult = await importExcleRepository.ImportEmployeeOtherDetailAsync(request, decryptedLocationId, decryptedUserId);

        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = true,
        //            Message = "Employee Other Details Updated.",
        //            Data = kraResult,
        //            StatusCode = 200
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
        //    }
        //}

        [HttpPost("ImportEmpOtherDetails")]
        [Authorize]
        public async Task<IActionResult> ImportEmployeeOtherDetailAsync(IFormFile file)
        {
            try
            {
                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data."
                    });

                var models = ExcelHelper.ConvertToModelList<EmployeeFullDetails>(data);
                var request = new EmployeeImportRequest { Employees = models };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                    return Unauthorized(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId not found.",
                        StatusCode = 401
                    });

                // GL Posting Validation: Only I, D, S OR NULL allowed
                var allowedValues = new List<string> { "I", "D", "S" };
                var invalidRows = new List<int>();

                for (int i = 0; i < request.Employees.Count; i++)
                {
                    var gl = request.Employees[i].glposting?.ToString().Trim().ToUpper();

                    if (!string.IsNullOrWhiteSpace(gl) && !allowedValues.Contains(gl))
                    {
                        invalidRows.Add(i + 2); // Excel starts at row 2 (row 1 = header)
                    }
                }

                if (invalidRows.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = $" found invalid value in row(s): {string.Join(", ", invalidRows)}. Only Allowed  I, D, S or blank.",
                        StatusCode = 200
                    });
                }

                // SP ab row-wise data + Status return karta hai
                var rowResult = await importExcleRepository.ImportEmployeeOtherDetailAsync(request, decryptedLocationId, decryptedUserId);

                if (rowResult == null || !rowResult.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "No records could be processed from the uploaded file.",
                        Data = new List<dynamic>(),
                        StatusCode = 400
                    });
                }

                // Status ke hisab se count nikalna
                int successCount = 0, invalidCount = 0;
                foreach (var row in rowResult)
                {
                    var dict = (IDictionary<string, object>)row;
                    var status = dict.TryGetValue("Status", out var s) ? s?.ToString() : null;

                    if (string.Equals(status, "Success", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(status, "Valid", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(status, "Updated", StringComparison.OrdinalIgnoreCase))
                        successCount++;
                    else
                        invalidCount++;
                }

                string message = invalidCount == 0
                    ? $"{successCount} employee other detail(s) updated successfully."
                    : $"{successCount} row(s) updated, {invalidCount} row(s) invalid. Please check Status column.";

                return Ok(new ModelResponse
                {
                    IsSuccess = invalidCount == 0,
                    Message = message,
                    Data = rowResult,   // har row ka saara column + Status
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse { IsSuccess = false, Message = ex.Message });
            }
        }



        //------Export/Import Salary Other Head-----//




        [HttpPost("ExportImportSalaryOtherHeadList")]
        [Authorize]
        public async Task<IActionResult> ExportImportSalaryOtherHeadList([FromBody] ExportImportSalaryOtherHeadRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, employees) = await importExcleRepository.ExportImportSalaryOtherHeadAsync(
                    request.PageIndex ?? 0, request.PageSize ?? 0,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    request.fk_costcentreid

                );
                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
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



       
        [HttpPost("ExportSalaryOthertHead")]
        [Authorize]
        public async Task<IActionResult> ExportSalaryOthertHead([FromBody] ExportImportSalaryOtherHeadRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

            try
            {
                var employees = await importExcleRepository.SalaryOtherHeadExportAsync(

                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    decryptedCompanyId,
                    request.headtype,
                    request.fk_costcentreid,
                    request.heads,
                    request.EffectiveDate
                );

                var enrichedEmployees = employees;
                //var enrichedEmployees = ExcelHelper.EnrichExportRowsWithAliases(employees, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
                modelResponse.Data = enrichedEmployees;
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




       
        [HttpPost("ImportSalaryOtherHead")]
        [Authorize]
        public async Task<IActionResult> ImportSalaryOtherHead(IFormFile file, [FromForm] string EffectiveDate)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrWhiteSpace(EffectiveDate))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Effective Date is mandatory for import.",
                        StatusCode = 400
                    });
                }

                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                var data = ExcelHelper.ReadExcelDynamicWithoutTemplate(file);  // List<dynamic>

                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "The uploaded Excel file contains no data or all rows are empty.",
                        StatusCode = 400
                    });
                }

                bool hasValidEmpCode = data.Any(row =>
                {
                    var empCodeKey = row.Keys.FirstOrDefault(k =>
                        k.Equals("EmpCode", StringComparison.OrdinalIgnoreCase) ||
                        k.Equals("empcode", StringComparison.OrdinalIgnoreCase) ||
                        k.Equals("emp_code", StringComparison.OrdinalIgnoreCase) ||
                        k.Equals("code", StringComparison.OrdinalIgnoreCase) ||
                        k.Replace(" ", "").Equals("empcode", StringComparison.OrdinalIgnoreCase));
                    return empCodeKey != null && !string.IsNullOrWhiteSpace(row[empCodeKey]) && row[empCodeKey].Trim() != "0";
                });

                if (!hasValidEmpCode)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Import failed: The first row or data rows in the Excel file are empty or have missing 'EmpCode'. Please provide valid employee records.",
                        StatusCode = 400
                    });
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId or LocationId not found in authentication session.",
                        StatusCode = 401
                    });
                }

                var xmlString = ExcelHelper.ConvertOnlyHeadsXml(data, decryptedCompanyId);

                if (string.IsNullOrWhiteSpace(xmlString) || !xmlString.Contains("<head>"))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Import failed: Invalid Excel structure or empty records. The file must contain valid 'EmpCode' and 'Grade' columns followed by salary head columns.",
                        StatusCode = 400
                    });
                }

                var empCodes = data
                    .Select(row =>
                    {
                        var empCodeKey = row.Keys.FirstOrDefault(k =>
                            k.Equals("EmpCode", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("empcode", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("emp_code", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("code", StringComparison.OrdinalIgnoreCase) ||
                            k.Replace(" ", "").Equals("empcode", StringComparison.OrdinalIgnoreCase));
                        return empCodeKey != null ? row[empCodeKey]?.Trim() : null;
                    })
                    .Where(c => !string.IsNullOrWhiteSpace(c) && c != "0")
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var invalidEmpCodes = await importExcleRepository.ValidateEmpCodesAsync(empCodes, decryptedCompanyId, decryptedUserId);
                if (invalidEmpCodes != null && invalidEmpCodes.Any())
                {
                    string msg = invalidEmpCodes.Count == 1
                        ? $"Import failed: Employee Code '{invalidEmpCodes[0]}' does not exist for your company."
                        : $"Import failed: The following {invalidEmpCodes.Count} Employee Code(s) do not exist for your company: {string.Join(", ", invalidEmpCodes.Take(10))}{(invalidEmpCodes.Count > 10 ? $" and {invalidEmpCodes.Count - 10} more" : "")}.";

                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = msg,
                        StatusCode = 400
                    });
                }

                var (summary, details) = await importExcleRepository.CompareSalaryOtherHeadImportAsync(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

                bool result = await importExcleRepository.ImportSalaryOtherHead(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

                if (!result)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = $"Import failed: No matching employee records or salary heads found to update for Effective Date '{EffectiveDate}'.",
                        StatusCode = 400
                    });
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Salary other heads imported successfully.";
                modelResponse.Data = new { isUpdated = result, summary, details };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }

        [HttpPost("ExportImportLeaveList")]
        [Authorize]
        public async Task<IActionResult> ExportImportLeaveList([FromBody] ExportImportSalaryHeadRequest2 request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, employees) = await importExcleRepository.ExportImportLeaveList(
                    request.PageIndex ?? 0, request.PageSize ?? 0,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    request.fk_costcentreid,
                    request.empStatus

                );
                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
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










        [HttpPost("ExporImportLeavetAsync")]
        [Authorize]
        public async Task<IActionResult> ExporImportLeavetAsync([FromBody] ExportImportLeaveRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var employees = await importExcleRepository.ExporImportLeavetAsync(
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    request.fk_leaveid,
                    request.fk_costcentreid,
                    request.empStatus
                );

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
                modelResponse.Data = employees;
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




        [HttpPost("ImportLeave")]
        [Authorize]
        public async Task<IActionResult> ImportLeave(IFormFile file, [FromForm] string EffectiveDate)
        {
            try
            {
                // ✅ Validate EffectiveDate parameter
                if (string.IsNullOrEmpty(EffectiveDate))
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "EffectiveDate is required.",
                        StatusCode = 400
                    });
                }

                // ✅ Validate date format
                if (!DateTime.TryParse(EffectiveDate, out DateTime parsedDate))
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Invalid EffectiveDate format.",
                        StatusCode = 400
                    });
                }

                // Debug log
                Console.WriteLine($"Received EffectiveDate: {EffectiveDate}");

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data."
                    });
                }

                var models = ExcelHelper.ConvertToLeaveModel(data);
                var request = new ExpImpLeaverequest { Employees = models };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    return Unauthorized(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId not found.",
                        StatusCode = 401
                    });
                }

                var kraResult = await importExcleRepository.ExportImportLeave(request, decryptedLocationId!, decryptedUserId, EffectiveDate);

                return Ok(new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Data Imported Successfully.",
                    Data = kraResult,
                    StatusCode = 200
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ImportLeave: {ex.Message}");
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }




        [HttpPost("ImportCDO")]
        [Authorize]
        public async Task<IActionResult> ImportCDO(
  IFormFile file,
  [FromForm] int fk_monthId,
  [FromForm] int fk_yearId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data.",
                        StatusCode = 400
                    });
                }

                var employees = ExcelHelper.ConvertToModelListNoCase<CDOImportDetail>(data);
                var request = new CDOImportRequest
                {
                    CdoDetails = employees
                };

                var result = await importExcleRepository.ImportCDOAsync(request, fk_monthId, fk_yearId);

                //  Check if result is null
                if (result == null)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Import failed - no response from database",
                        StatusCode = 500
                    });
                }

                //modelResponse.IsSuccess = true;
                //modelResponse.Message = result.Message ?? "CDO data imported successfully.";
                //modelResponse.Data = result;
                //modelResponse.StatusCode = 200;
                modelResponse.IsSuccess = result.Status != "Error";
                modelResponse.Message = result.Message;
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }


  

        [HttpPost("GetCDOList")]
        [Authorize]
        public async Task<IActionResult> GetCDOList([FromBody] ImportExcle.CdoReportRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // ✅ Unpack tuple — can't use '?' on a struct (value type)
                var (totalCount, pageData) = await importExcleRepository.GetCDOListAsync(request);

                var list = pageData?.ToList() ?? new List<dynamic>();

                if (!list.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "CDO data retrieved successfully.";
                modelResponse.StatusCode = 200;

                //  Return both TotalCount + paged Data — useful for frontend pagination
                modelResponse.Data = new
                {
                    TotalCount = totalCount,
                    Data = list
                };

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }


        [HttpPost("ImportCityMaster")]
        [Authorize]
        public async Task<IActionResult> ImportCityMaster(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var rows = ExcelHelper.ConvertToModelListNoCase<CityImportRow>(data);
                var request = new CityImportRequest { Rows = rows };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.ImportCityMaster(request, decryptedUserId, decryptedLocId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "City Master import completed.";
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        [HttpPost("ImportDesignationMaster")]
        [Authorize]
        public async Task<IActionResult> ImportDesignationMaster(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var rows = ExcelHelper.ConvertToModelListNoCase<DesignationImportRow>(data);
                var request = new DesignationImportRequest { Rows = rows };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.ImportDesignationMaster(request, decryptedUserId, decryptedLocId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Designation Master import completed.";
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        [HttpPost("ImportDepartmentMaster")]
        [Authorize]
        public async Task<IActionResult> ImportDepartmentMaster(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var rows = ExcelHelper.ConvertToModelListNoCase<DepartmentImportRow>(data);
                var request = new DepartmentImportRequest { Rows = rows };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.ImportDepartmentMaster(request, decryptedUserId, decryptedLocId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Department Master import completed.";
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        [HttpPost("ImportLocationMaster")]
        [Authorize]
        public async Task<IActionResult> ImportLocationMaster(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var rows = ExcelHelper.ConvertToModelListNoCase<LocationImportRow>(data);
                var request = new LocationImportRequest { Rows = rows };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.ImportLocationMaster(request, decryptedUserId, decryptedLocId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Location Master import completed.";
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }


        //Added 06 May Raj 

        [HttpPost("ImportClientMaster")]
        [Authorize]
        public async Task<IActionResult> ImportClientMaster(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var rows = ExcelHelper.ConvertToModelListNoCase<ClientImportRow>(data);
                var request = new ClientImportRequest { Rows = rows };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.ImportClientMaster(request, decryptedUserId, decryptedLocId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Client Master import completed.";
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        [HttpPost("ImportOutletMaster")]
        [Authorize]
        public async Task<IActionResult> ImportOutletMaster(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var rows = ExcelHelper.ConvertToModelListNoCase<OutletImportRow>(data);
                var request = new OutletImportRequest { Rows = rows };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.ImportOutletMaster(request, decryptedUserId, decryptedLocId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Outlet Master import completed.";
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }

        [HttpPost("ImportBranchMaster")]
        [Authorize]
        public async Task<IActionResult> BranchImportMaster(IFormFile file)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx" && ext != ".xls")
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });

                var data = ExcelHelper.ReadExcelDynamic(file);
                if (data == null || !data.Any())
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Excel file has no data.", StatusCode = 400 });

                var rows = ExcelHelper.ConvertToModelListNoCase<BranchImportRow>(data);
                var request = new BranchImportRequest { Rows = rows };

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedLocId = HttpContext.Items["DecryptedLocationId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var result = await importExcleRepository.ImportBranchMaster(request, decryptedUserId, decryptedLocId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Branch Master import completed.";
                modelResponse.Data = result;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }


        [HttpPost("ExportImportIncentive")]
        [Authorize]
        public async Task<IActionResult> ExportImportIncentive([FromBody] ExportImportSalaryHeadRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, employees) = await importExcleRepository.ExportImportIncentive(
                    request.PageIndex ?? 0, request.PageSize ?? 0,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    request.fk_costcentreid

                );
                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
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




        // incentive export
        [HttpPost("exportincentive")]
        [Authorize]
        public async Task<IActionResult> exportincentive([FromBody] ExportImportSalaryHeadRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

            try
            {
                var employees = await importExcleRepository.exportincentive(

                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_classid,
                    decryptedCompanyId,
                    request.headtype,
                    request.fk_costcentreid

                );


                modelResponse.IsSuccess = true;
                modelResponse.Message = "data retrieved successfully.";
                modelResponse.Data = employees;
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




        [HttpPost("ImportIncentiveHead")]
        [Authorize]
        public async Task<IActionResult> ImportIncentiveHead(IFormFile file, [FromForm] string EffectiveDate)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "File is required.",
                        StatusCode = 400
                    });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Only .xlsx or .xls files are allowed.",
                        StatusCode = 400
                    });
                }

                var data = ExcelHelper.ReadExcelDynamicWithoutTemplate(file);  // List<dynamic>

                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Excel file has no data.",
                        StatusCode = 400
                    });
                }


                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "UserId or LocationId not found.",
                        StatusCode = 401
                    });
                }

                var xmlString = ExcelHelper.ConvertOnlyHeadsXml(data, decryptedCompanyId);

                var empCodes = data
                    .Select(row =>
                    {
                        var empCodeKey = row.Keys.FirstOrDefault(k =>
                            k.Equals("EmpCode", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("empcode", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("emp_code", StringComparison.OrdinalIgnoreCase) ||
                            k.Equals("code", StringComparison.OrdinalIgnoreCase) ||
                            k.Replace(" ", "").Equals("empcode", StringComparison.OrdinalIgnoreCase));
                        return empCodeKey != null ? row[empCodeKey]?.Trim() : null;
                    })
                    .Where(c => !string.IsNullOrWhiteSpace(c) && c != "0")
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var invalidEmpCodes = await importExcleRepository.ValidateEmpCodesAsync(empCodes, decryptedCompanyId, decryptedUserId);
                if (invalidEmpCodes != null && invalidEmpCodes.Any())
                {
                    string msg = invalidEmpCodes.Count == 1
                        ? $"Import failed: Employee Code '{invalidEmpCodes[0]}' does not exist for your company."
                        : $"Import failed: The following {invalidEmpCodes.Count} Employee Code(s) do not exist for your company: {string.Join(", ", invalidEmpCodes.Take(10))}{(invalidEmpCodes.Count > 10 ? $" and {invalidEmpCodes.Count - 10} more" : "")}.";

                    return Ok(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = msg,
                        StatusCode = 400
                    });
                }

                bool result = await importExcleRepository.ImportIncentiveHead(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

                modelResponse.IsSuccess = result;
                modelResponse.Message = result ? "Data imported successfully." : "Import failed.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    StatusCode = 500
                });
            }
        }

        //[HttpPost("ImportIncentiveHead")]
        //[Authorize]
        //public async Task<IActionResult> ImportIncentiveHead(IFormFile file, [FromForm] string EffectiveDate)
        //{
        //    ModelResponse modelResponse = new ModelResponse();
        //    try
        //    {
        //        if (file == null || file.Length == 0)
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "File is required.",
        //                StatusCode = 400
        //            });
        //        }

        //        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        //        if (fileExtension != ".xlsx" && fileExtension != ".xls")
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Only .xlsx or .xls files are allowed.",
        //                StatusCode = 400
        //            });
        //        }

        //        var data = ExcelHelper.ReadExcelDynamicWithoutTemplate(file);  // List<dynamic>

        //        if (data == null || !data.Any())
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Excel file has no data.",
        //                StatusCode = 400
        //            });
        //        }


        //        var xmlString = ExcelHelper.ConvertOnlyHeadsXml(data);

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
        //        {
        //            return Ok(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "UserId or LocationId not found.",
        //                StatusCode = 401
        //            });
        //        }

        //        bool result = await importExcleRepository.ImportIncentiveHead(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

        //        modelResponse.IsSuccess = result;
        //        modelResponse.Message = result ? "Data imported successfully." : "Import failed.";
        //        modelResponse.Data = result;
        //        modelResponse.StatusCode = 200;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = false,
        //            Message = ex.Message,
        //            StatusCode = 500
        //        });
        //    }
        //}

        [HttpPost("PreviewSalaryHeadComparison")]
        [Authorize]
        public async Task<IActionResult> PreviewSalaryHeadComparison(IFormFile file, [FromForm] string EffectiveDate)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });
                }

                var data = ExcelHelper.ReadExcelDynamicWithoutTemplate(file);
                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "The uploaded Excel file contains no data.", StatusCode = 400 });
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                var xmlString = ExcelHelper.ConvertOnlyHeadsXml(data, decryptedCompanyId);
                var (summary, details) = await importExcleRepository.CompareSalaryHeadImportAsync(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Salary head comparison retrieved successfully from database.";
                modelResponse.Data = new { summary, details };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }






        [HttpPost("PreviewSalaryOtherHeadComparison")]
        [Authorize]
        public async Task<IActionResult> PreviewSalaryOtherHeadComparison(IFormFile file, [FromForm] string EffectiveDate)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "File is required.", StatusCode = 400 });
                }

                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".xlsx" && fileExtension != ".xls")
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "Only .xlsx or .xls files are allowed.", StatusCode = 400 });
                }

                var data = ExcelHelper.ReadExcelDynamicWithoutTemplate(file);
                if (data == null || !data.Any())
                {
                    return Ok(new ModelResponse { IsSuccess = false, Message = "The uploaded Excel file contains no data.", StatusCode = 400 });
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                var xmlString = ExcelHelper.ConvertOnlyHeadsXml(data, decryptedCompanyId);
                var (summary, details) = await importExcleRepository.CompareSalaryOtherHeadImportAsync(xmlString, decryptedUserId, decryptedLocationId, EffectiveDate);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Salary other head comparison retrieved successfully from database.";
                modelResponse.Data = new { summary, details };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                return Ok(new ModelResponse { IsSuccess = false, Message = ex.Message, StatusCode = 500 });
            }
        }
    }
}