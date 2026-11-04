using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Ocsp;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HeadAssignController : ControllerBase
    {
        private readonly IHeadAssignRepository headAssignRepository;

        public HeadAssignController(IHeadAssignRepository _headAssignRepository)

        {
            headAssignRepository = _headAssignRepository;
        }

        [HttpPost("GetAllEmployeeForHeadAssign")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEmployees(
                [FromQuery] int pageIndex,
                 [FromQuery] int pageSize,[FromBody] HeadAssignFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var (totalcount, employees) = await headAssignRepository.GetAllEmployeesAsync( pageIndex, pageSize,
                    request.EmpCode, request.EmpCodeManual, request.EmpName, request.SelectedDepartments,
                    request.SelectedDesignation, request.SelectedLocations, request.SelectedNature, request.SelectedCity,
                    request.SortBy
                );

                if (employees == null || !employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.StatusCode = 200;
                modelResponse.TotalCount = totalcount;
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
        public async Task<IActionResult> UpdateHeadAssignAsync([FromBody] HeadAssignFilterRequest headAssignFilterRequest)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                //HEvar decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await headAssignRepository.UpdateHeadAssignAsync(
                    headAssignFilterRequest.fk_headid, 
                    headAssignFilterRequest.effectivedate, 
                    headAssignFilterRequest.EmpCode, 
                    headAssignFilterRequest.EmpCodeManual,
                    headAssignFilterRequest.EmpName, 
                    headAssignFilterRequest.SelectedDepartments,
                    headAssignFilterRequest.SelectedDesignation, 
                    headAssignFilterRequest.SelectedLocations, 
                    headAssignFilterRequest.SelectedNature, 
                    headAssignFilterRequest.SelectedCity, 
                    headAssignFilterRequest.Overwrite, 
                    decryptedUserId, 
                    decryptedLocationId
                );
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Head updated successfully." : "Failed to update Head Assign.";
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
