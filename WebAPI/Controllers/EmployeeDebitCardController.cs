using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeDebitCardController : Controller
    {
        private readonly IEmployeeDebitCardRepository employeeDebitCardRepository;

        public EmployeeDebitCardController(IEmployeeDebitCardRepository _employeeDebitCardRepository)

        {
            employeeDebitCardRepository = _employeeDebitCardRepository;
        }


        [HttpPost("GetAllEmployeeForDebitCard")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEmployeesAsync([FromBody] EmployeeFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var employees = await employeeDebitCardRepository.GetAllEmployeesAsync(
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
                modelResponse.Message = "Employee DebitCard list retrieved successfully.";
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
        public async Task<IActionResult> UpdateEmployeeDebitCardAsync([FromBody] List<EmployeeDebitCardMst> EmployeeDebitCardMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                                                                                        // var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await employeeDebitCardRepository.UpdateEmployeeDebitCardAsync(EmployeeDebitCardMst, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Employee DebitCard updated successfully." : "Failed to update Employee DebitCard.";
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