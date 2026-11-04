using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SalaryLockUnlockController : ControllerBase
    {
        private readonly ISalaryLockUnlockRepository salaryLockUnlockRepository;
        private readonly IExportReportRepository exportReportRepository;
        public SalaryLockUnlockController(ISalaryLockUnlockRepository _salaryLockUnlockRepository, IExportReportRepository exportReportRepository)

        {
            salaryLockUnlockRepository = _salaryLockUnlockRepository;
            this.exportReportRepository = exportReportRepository;
        }


        [HttpPost("GetsalarylockList")]
        [Authorize]
        public async Task<IActionResult> GetsalarylockList([FromQuery] int pageIndex1,
                 [FromQuery] int pageSize1, [FromQuery] int pageIndex2,
                 [FromQuery] int pageSize2,[FromBody] SalaryLockUnlockRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (salarylockCount, salaryunlockCount, employees) = await salaryLockUnlockRepository.GetsalarylockAsync(
                    pageIndex1, pageSize1,
                   pageIndex2, pageSize2,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_monthId,
                    request.fk_yearId,
                    request.fk_costcentreid
                  
                );
                if ((employees.salaryunlock?.Count ?? 0) +

                    (employees.salarylocked?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "salary lock data retrieved successfully.";
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




        [HttpPost("UnlockSalaryEmplyeelist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> UnlockSalarylist([FromBody] SalaryLockUnlockRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve user and location IDs from decrypted context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();


                // Call repository method
                bool isUpdated = await salaryLockUnlockRepository.UpdateForSalaryUnLockAsync(decryptedUserId, decryptedLocationId, request);

                // Success response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list Unlock successfully.";
                modelResponse.Data = isUpdated;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpPost("LockSalaryEmplyeelist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> lockSalarylist([FromBody] SalaryLockUnlockRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve user and location IDs from decrypted context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                // Call repository method
                bool employees = await salaryLockUnlockRepository.UpdateForSalaryLockAsync(decryptedUserId, decryptedLocationId, decryptedCompanyId, request);

                // Success response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list Lock successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        //Salary Apporved list


        //[HttpPost("GetsalaryApprovedList")]
        //[Authorize]
        //public async Task<IActionResult> GetsalaryApprovedList([FromQuery] int pageIndex1,
        //         [FromQuery] int pageSize1, [FromQuery] int pageIndex2,
        //         [FromQuery] int pageSize2, [FromBody] SalaryApprovedRequest request)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var (salaryApprovedcount, salaryDisapprovedcount, employees) = await salaryLockUnlockRepository.GetsalaryApprovedList(
        //            pageIndex1, pageSize1,
        //           pageIndex2, pageSize2,
        //            request.EmpCode,
        //            request.EmpCodeManual,
        //            request.EmpName,
        //            request.SelectedDepartments,
        //            request.SelectedDesignation,
        //            request.SelectedLocations,
        //            request.SelectedNature,
        //            request.SelectedCity,
        //            request.SortBy,
        //            request.fk_monthId,
        //            request.fk_yearId,
        //            request.fk_costcentreid

        //        );
        //        if ((employees.salaryApproved?.Count ?? 0) +

        //            (employees.salaryDisapproved?.Count ?? 0) == 0)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No Record found.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "salary Approved data retrieved successfully.";
        //        modelResponse.Data = employees;
        //        modelResponse.StatusCode = 200;
        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        return Ok(modelResponse);
        //    }
        //}


        [HttpPost("GetsalaryApprovedList")]
        [Authorize]
        public async Task<IActionResult> GetsalaryApprovedList(
[FromQuery] int pageIndex1,
[FromQuery] int pageSize1,
[FromQuery] int pageIndex2,
[FromQuery] int pageSize2,
[FromBody] SalaryApprovedRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await salaryLockUnlockRepository.GetsalaryApprovedList(
                    pageIndex1, pageSize1,
                    pageIndex2, pageSize2,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_monthId,
                    request.fk_yearId,
                    request.fk_costcentreid
                );

                // 🔹 No records found
                if ((result.disapprovedList?.Count ?? 0) +
                    (result.approvedList?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // 🔹 Success response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Salary approved data retrieved successfully.";
                modelResponse.StatusCode = 200;

                modelResponse.Data = new
                {
                    salaryDisapprovedCount = result.disapprovedCount,
                    salaryApprovedCount = result.approvedCount,
                    salaryDisapprovedList = result.disapprovedList,
                    salaryApprovedList = result.approvedList
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

        // export approve or disapproved list
        [HttpPost("downloadGetsalaryApprovedList")]
        [Authorize]
        public async Task<IActionResult> downloadGetsalaryApprovedList(
    string? reportName,
     [FromQuery] int pageIndex1,
    [FromQuery] int pageSize1,
    [FromQuery] int pageIndex2,
    [FromQuery] int pageSize2,
    [FromBody] SalaryApprovedRequest request)
        {
            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
            var result = await salaryLockUnlockRepository.GetsalaryApprovedList(
                pageIndex1, pageSize1,
                    pageIndex2, pageSize2,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.fk_monthId,
                    request.fk_yearId,
                    request.fk_costcentreid
            );

            // ✅ PICK LIST AUTOMATICALLY
            List<dynamic> exportList = null;

            if (result.approvedList != null && result.approvedList.Any())
            {
                exportList = result.approvedList;
            }
            else if (result.disapprovedList != null && result.disapprovedList.Any())
            {
                exportList = result.disapprovedList;
            }

            if (exportList == null)
            {
                return Ok(new
                {
                    IsSuccess = false,
                    StatusCode = 400,
                    Message = "No data found"
                });
            }

            var results = exportList
                .Select(item => (IDictionary<string, object>)item)
                .ToList();



            // 🔹 Date header
            string? dateHeaderText = null;
            if (!string.IsNullOrEmpty(request.fk_monthId) &&
                !string.IsNullOrEmpty(request.fk_yearId))
            {
                int month = int.Parse(request.fk_monthId);
                int year = int.Parse(request.fk_yearId);
                dateHeaderText = $"For the month of {new DateTime(year, month, 1):MMMM yyyy}";
            }

            var fileBytes = await ExcelHelper.GenerateAttendanceExcelReportAsync(
                reportName: reportName ?? "Salary Approval Report",
                results: results,
                contractorName: request.ContractorName,
                dateHeaderText: dateHeaderText,
                getCompanyNameFunc: () => exportReportRepository.GetCompanyNameAsync(decryptedCompanyId)
            );

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{reportName}_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
            );
        }




        // approve list

        [HttpPost("DisapproveSalaryEmplyeelist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DisapproveSalaryEmplyeelist([FromBody] SalaryApprovedRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve user and location IDs from decrypted context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();


                // Call repository method
                bool isUpdated = await salaryLockUnlockRepository.DisapproveSalaryEmplyeelist(decryptedUserId, decryptedLocationId, request);

                // Success response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list disapprove successfully.";
                modelResponse.Data = isUpdated;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        //disapprove lsit


        [HttpPost("approveSalaryEmplyeelist")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> approveSalaryEmplyeelist([FromBody] SalaryApprovedRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve user and location IDs from decrypted context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                // Call repository method
                bool employees = await salaryLockUnlockRepository.approveSalaryEmplyeelist(decryptedUserId, decryptedLocationId, decryptedCompanyId, request);

                // Success response
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list Approve successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


    }
}
