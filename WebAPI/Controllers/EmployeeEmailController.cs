using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeEmailController : Controller
    {
        private readonly IEmployeeEmailRepository employeeEmailRepository;

        public EmployeeEmailController(IEmployeeEmailRepository _employeeEmailRepository)

        {
            employeeEmailRepository = _employeeEmailRepository;
        }


        [HttpPost("GetAllEmployeeForEmail")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEmployeesAsync([FromBody] EmployeeFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var employees = await employeeEmailRepository.GetAllEmployeesAsync(
                    request.EmpCode, request.EmpCodeManual, request.EmpName, request.SelectedDepartments,
                    request.SelectedDesignation, request.SelectedLocations, request.SelectedNature, request.SelectedCity,
                    request.SortBy, decryptedUserId, request.EmpStatus
                );

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "EmployeeEmail list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }


        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateEmployeeEmailAsync([FromBody] List<EmployeeEmailMst> EmployeeEmailMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                                                                                        // var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await employeeEmailRepository.UpdateEmployeeEmailAsync(EmployeeEmailMst, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "EmployeeEmail updated successfully." : "Failed to update EmployeeEmail.";
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



    }
}
