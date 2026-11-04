using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EmployeeKRAPLIController : ControllerBase
    {
      
            private readonly IEmployeeKRAPLIRepository employeeKRAPLIRepository;

            public EmployeeKRAPLIController(IEmployeeKRAPLIRepository _employeeKRAPLIRepository)

            {
                employeeKRAPLIRepository = _employeeKRAPLIRepository;
            }

            [HttpPost]
            [Authorize]
        public async Task<IActionResult> GetAll(KRAPLIRequest res)
        {
            // Create the model response
            var modelResponse = new ModelResponse();
            var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId

            try
            {
                // Create filter object to pass to the repository method
                var filter = new KRAPLIRequest
                {

                    EmpCode = res.EmpCode,
                    EmpCodeManual = res.EmpCodeManual,
                    EmpName = res.EmpName,
                    SelectedDesignation = res.SelectedDesignation,
                    SelectedNature = res.SelectedNature,
                    SelectedCity = res.SelectedCity,
                    SortBy = res.SortBy,
                    EmpStatus = res.EmpStatus,
                    fk_userid = decryptedUserId,
                   
                    SelectedLocations = res.SelectedLocations ?? new List<string>(),  // Ensure default to an empty list if null
                    SelectedDepartments = res.SelectedDepartments ?? new List<string>() // Ensure default to an empty list if null

                };

                // Calling the repository to get the data
                var result = await employeeKRAPLIRepository.GetAll(filter);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail retrieved successfully.";
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
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateEmployeeKraPliAsync([FromBody] EmployeeKraPliXmlModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                // Validate input
                if (model == null || model.EmpList == null || !model.EmpList.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No employee data provided.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Assign IDs to model (if needed)
                model.Fk_UserID = decryptedUserId;
                model.Fk_LocID = decryptedLocationId;

                bool isUpdated = await employeeKRAPLIRepository.UpdateEmployeeKraPliAsync(model, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "KRA/PLI updated successfully." : "Failed to update KRA/PLI.";
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
