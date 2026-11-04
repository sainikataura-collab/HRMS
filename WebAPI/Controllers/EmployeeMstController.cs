

using DocumentFormat.OpenXml.Office2016.Excel;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Ocsp;


namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]

    public class EmployeeMstController : Controller
    {



        private readonly IEmployeeMstRepository employeeMstRepository;
        private readonly FileService _FileService;


        public EmployeeMstController(IEmployeeMstRepository _employeeMstRepository, FileService fileService)

        {

            employeeMstRepository = _employeeMstRepository;
            _FileService = fileService;
        }



        [HttpPost]
        [Authorize]

        //public async Task<IActionResult> InsertEmployeeAsync([FromBody] EmployeeMstDataSet employeeList)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
        //        var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

        //        bool isInserted = await employeeMstRepository.InsertEmployeeAsync(employeeList,
        //    employeeList.Employee,
        //    employeeList.EmployeeOther, decryptedUserId, decryptedLocationId, decryptedCompanyId);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted ? "Employee Master inserted successfully." : "Failed to insert Employee master.";
        //        modelResponse.StatusCode = isInserted ? 200 : 400;


        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return StatusCode(500, modelResponse);
        //    }
        //}

        public async Task<IActionResult> InsertEmployeeAsync([FromBody] EmployeeMstDataSet employeeList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                var result = await employeeMstRepository.InsertEmployeeAsync(
                    employeeList,
                    employeeList.Employee,
                    employeeList.EmployeeOther,
                    decryptedUserId,
                    decryptedLocationId,
                    decryptedCompanyId
                );

                //if (!string.IsNullOrEmpty(result.pk_empid))
                if (result != null && !string.IsNullOrEmpty(result.pk_empid))

                {
                    modelResponse.IsSuccess = true;
                    modelResponse.Message = "Employee Master inserted successfully.";
                    modelResponse.StatusCode = 200;
                    modelResponse.Data = new { pk_empid = result.pk_empid };
                }
                else
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Failed to insert Employee master.";
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




        //[HttpPost("GetAllEmployees")]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> GetAllEmployeesAsync([FromQuery] int pageIndex, [FromQuery] int pageSize, [FromBody] EmployeeFilterRequest request, string searchTerm = null)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


        //        var (totalCount, employees) = await employeeMstRepository.GetAllEmployeesAsync(
        //            pageIndex, pageSize, request.EmpCode, request.EmpCodeManual,
        //            request.EmpName, request.SelectedDepartments, request.SelectedDesignation,
        //            request.SelectedLocations, request.SelectedNature, request.SelectedCity,
        //            request.SortBy, decryptedUserId, request.EmpStatus, request.fk_costcentreid, searchTerm
        //        );

        //        if (!employees.Any())
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No records found.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Employee list retrieved successfully.";
        //        modelResponse.Data = employees;
        //        modelResponse.TotalCount = totalCount;
        //        modelResponse.StatusCode = 200;
        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = "An error occurred. " + ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }
        //}
        [HttpPost("GetAllEmployees")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEmployeesAsync([FromQuery] int pageIndex, [FromQuery] int pageSize, [FromBody] EmployeeFilterRequest request, string searchTerm = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var (totalCount, employees, counts) = await employeeMstRepository.GetAllEmployeesAsync(
                    pageIndex, pageSize, request.EmpCode, request.EmpCodeManual,
                    request.EmpName, request.SelectedDepartments, request.SelectedDesignation,
                    request.SelectedLocations, request.SelectedNature, request.SelectedCity,
                    request.SortBy, decryptedUserId, request.EmpStatus, request.fk_costcentreid, searchTerm, request.statFilter
                );

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.DataObj = counts;
                modelResponse.TotalCount = totalCount;
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



        [HttpGet("{employeeId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEmployeeByIdAsync([FromRoute] string employeeId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                var result = await employeeMstRepository.GetEmployeeByIdAsync(employeeId);


                if (result.Item1 == null && result.Item2 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid employeeId.";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeMst retrieved successfully.";
                modelResponse.Data = new { employeeMst = result.Item1, employeeOtherDetails = result.Item2 };
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
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateEmployeeAsync([FromBody] EmployeeMstDataSet employeeList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await employeeMstRepository.UpdateEmployeeAsync(employeeList,
                employeeList.Employee,
                employeeList.EmployeeOther, decryptedUserId, decryptedLocationId, decryptedCompanyId);


                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "EmployeeMst updated successfully." : "Failed to update Employeemst.";
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

        // ------------------EmployeeAttendance----------------------

        [HttpGet("EmployeeAttendance{employeeId}")]
        [Authorize]

        public async Task<IActionResult> GetEmployeeAttendanceByIdAsync([FromRoute] string employeeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (EmpShift, ShiftDateWise, AttendanceLocations) = await employeeMstRepository.GetEmployeeAttendanceByIdAsync(employeeId);

                if (EmpShift == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record Found Or Invalid Id";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeAttendance detail retrieved successfully.";
                modelResponse.Data = new
                {
                    EmpShift = EmpShift,
                    ShiftDateWise = ShiftDateWise,
                    AttendanceLocations = AttendanceLocations
                };
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


        [HttpPut("EmployeeAttendance")]
        [Authorize]

        public async Task<IActionResult> UpdateEmployeeAttendanceAsync([FromBody] EmployeeAttendanceMst employeeAttendanceMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                //string[] st = employeeAttendanceMst.Intime.Split(":");
                //employeeAttendanceMst.Intime = st[0];
                //employeeAttendanceMst.intimeMinute = st[1];
                //string[] et = employeeAttendanceMst.Outtime.Split(":");
                //employeeAttendanceMst.Outtime = et[0];
                //employeeAttendanceMst.outtimeMinute = et[1];

                bool isUpdated = await employeeMstRepository.UpdateEmployeeAttendanceAsync(employeeAttendanceMst, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "EmployeeAttendance Master Update successfully." : "Failed to Update EmployeeAttendance master.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }

        // ------------------EmployeeOtherdetails----------------------

        [HttpGet("EmployeeOtherDetails{employeeId}")]
        [Authorize]

        public async Task<IActionResult> GetEmployeeOtherDetailsByIdAsync([FromRoute] string employeeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                EmployeeOtherDetailsMst result = await employeeMstRepository.GetEmployeeOtherDetailsAsync(employeeId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid employeeId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeOtherDetails detail retrieved successfully.";
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

        //[HttpPut("EmployeeOtherDetails")]
        //[Authorize]

        //public async Task<IActionResult> UpdateEmployeeOtherDetailsAsync([FromBody] EmployeeOtherDetailsMst employeeOtherDetailsMst)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
        //        var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

        //        bool isUpdated = await employeeMstRepository.UpdateEmployeeOtherDetailsAsync(employeeOtherDetailsMst, decryptedUserId, decryptedLocationId, decryptedCompanyId);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "EmployeeOtherDetails Master Update successfully." : "Failed to Update EmployeeOtherDetails master.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return StatusCode(500, modelResponse);
        //    }
        //}

        [HttpPut("EmployeeOtherDetails")]
        [Authorize]
        public async Task<IActionResult> UpdateEmployeeOtherDetailsAsync([FromForm] EmployeeOtherDetailsMst employeeOtherDetailsMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                // ✅ File save logic (using your _FileService)
                if (employeeOtherDetailsMst.FileBytes != null && employeeOtherDetailsMst.FileBytes.Length > 0)
                {
                    // Validate image
                    if (!_FileService.IsImageFile(employeeOtherDetailsMst.FileBytes))
                    {
                        return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                    }

                    // Save file using your service
                    var savedFileName = await _FileService.SaveFileAsync(employeeOtherDetailsMst.FileBytes);

                    // Save file path to DB field
                    employeeOtherDetailsMst.policyImagePath = savedFileName;
                }

                // ✅ Repository call
                bool isUpdated = await employeeMstRepository.UpdateEmployeeOtherDetailsAsync(
                    employeeOtherDetailsMst,
                    decryptedUserId,
                    decryptedLocationId,
                    decryptedCompanyId
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "EmployeeOtherDetails updated successfully."
                    : "Failed to update EmployeeOtherDetails.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }


        //-------------EmployeeHead-------

        [HttpPost("head")]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> InsertEmployeeHeadAsync([FromBody] SalHeadAmountRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var (head1, head2) = await employeeMstRepository.GetSalHeadAmountAsync(request, decryptedCompanyId);

                if (head1 == null && head2 == null) // Check if both are null
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeHead list retrieved successfully.";
                modelResponse.Data = new { head1, head2 }; // Convert Tuple into JSON
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }


        [HttpGet("EmployeeHeadDetails{employeeId}")]
        [Authorize]

        public async Task<IActionResult> GetEmployeeHeadDetailsByIdAsync([FromRoute] string employeeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var result = await employeeMstRepository.GetEmployeeHeadDetailsAsync(employeeId);

                if (result.Item1 == null && result.Item2 == null && result.Item3 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid employeeId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeHeadDetails detail retrieved successfully.";
                modelResponse.Data = new { EmployeeHeadMst = result.Item1, Earning = result.Item2, Deduction = result.Item3 };
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

        [HttpPut("EmployeeHeadDetails")]
        [Authorize]


        public async Task<IActionResult> UpdateEmployeeHeadDetailsAsync([FromBody] EmployeeHeadMstDataSet employeeHeadMstDataSet)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Retrieve the CompanyId

                if (decryptedUserId == null || decryptedCompanyId == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "UserId or CompanyId is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                bool isUpdated = await employeeMstRepository.UpdateEmployeeHeadDetailsAsync(
                    employeeHeadMstDataSet,
                    employeeHeadMstDataSet.Employeehead, employeeHeadMstDataSet.employeeHeadMst,
                    decryptedUserId,
                    decryptedCompanyId
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "EmployeeHeadDetails Master updated successfully." : "Failed to update EmployeeHeadDetails Master.";
                modelResponse.StatusCode = isUpdated ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }



        //------------------SubDepDropDown base on DepId---------------------

        [HttpGet("SubDepartment/{fk_deptid}")]
        [Authorize]
        public async Task<IActionResult> GetDropdownList([FromRoute] string fk_deptid)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(fk_deptid))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Id are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId


                var result = await employeeMstRepository.GetSubDeptDropdownList(fk_deptid, decryptedUserId, decryptedCompanyId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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


        //--------------Employee Shift------------


        [HttpPost("InsertEmployeeShift")]
        [Authorize]

        public async Task<IActionResult> InsertEmplyeeShiftAsync([FromBody] List<EmployeeShiftIns> employeeShiftIns)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var EmployeeShiftIns = employeeShiftIns.employeeShiftIns ?? new List<EmployeeShiftIns>();

                bool isInserted = await employeeMstRepository.InsertEmpShift(employeeShiftIns);
                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Employee Shift inserted successfully." : "Failed to insert Employee Shift.";
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

        [HttpPut("UpdtEmployeeShift")]
        [Authorize]

        public async Task<IActionResult> UpdEmplyeeShiftAsync([FromBody] List<EmployeeShiftIns> employeeShiftIns)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var EmployeeShiftIns = employeeShiftIns.employeeShiftIns ?? new List<EmployeeShiftIns>();

                bool isInserted = await employeeMstRepository.UpdateEmpShift(employeeShiftIns);
                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Employee Shift Update successfully." : "Failed to UpdateEmployee Shift.";
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

        [HttpGet("GetTabAuditLogs")]
        [Authorize]
        public async Task<IActionResult> GetTabAuditLogsAsync(
            [FromQuery] string documentId,
            [FromQuery] string documentName,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? entryBy = null,
            [FromQuery] string? fieldName = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, logs) = await employeeMstRepository.GetTabAuditLogsAsync(documentId, documentName, pageIndex, pageSize, entryBy, fieldName);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Audit logs retrieved successfully.";
                modelResponse.StatusCode = 200;
                modelResponse.Data = new
                {
                    TotalCount = totalCount,
                    Logs = logs
                };

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

    }
}