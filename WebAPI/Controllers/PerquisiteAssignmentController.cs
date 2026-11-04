using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PerquisiteAssignmentController : ControllerBase
    {
        private readonly IPerquisiteAssignmentRepository perquisiteAssignmentRepository;

        public PerquisiteAssignmentController(IPerquisiteAssignmentRepository _perquisiteAssignmentRepository)

        {
            perquisiteAssignmentRepository = _perquisiteAssignmentRepository;
        }
        //for get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10, string? fk_empid = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await perquisiteAssignmentRepository.GetAll(pageIndex, pageSize, fk_empid);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "perquisites assignment List retrieved successfully.";
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
        //get by id

        //get by id
        [HttpGet("{pk_perktrnId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetperquisiteAssignmentByIdAsync([FromRoute] string pk_perktrnId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                PerquisiteAssignment result = await perquisiteAssignmentRepository.GetperquisiteAssignmentByIdAsync(pk_perktrnId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid perquisiteId";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "perquisite assignment detail retrieved successfully.";
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
        //for delete 
        [HttpDelete("{pk_perktrnId}")]
        [Authorize]
        public async Task<IActionResult> DeleteperquisitesAsync([FromRoute] string pk_perktrnId)
        {
            ModelResponse modelResponse = new ModelResponse();
             try
            {
                bool isDeleted = await perquisiteAssignmentRepository.DeleteperquisiteAssignmentAsync(pk_perktrnId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "perquisite assignment detail delete successfully." : "Failed to delete perquisite assignment detail.";
                modelResponse.StatusCode = isDeleted ? 200 : 400;
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
        //insert
        //for insert
        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertSectionAsync([FromBody] PerquisiteAssignment perquisiteAssignmentMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string


                bool isInserted = await perquisiteAssignmentRepository.InsertperquisiteAssignmentAsync(perquisiteAssignmentMst, decryptedLocationId, decryptedUserId,perquisiteAssignmentMst.fk_empid,perquisiteAssignmentMst.fk_perkId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "perquiste assignment inserted successfully." : "Failed to insert perquiste assignment.";
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
        //for update
        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult>UpdatePerquisiteAssignmentAsync([FromBody] PerquisiteAssignment perquisite)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string
                bool isUpdated = await perquisiteAssignmentRepository.UpdatePerquisiteAssignmentAsync(perquisite, decryptedLocationId, decryptedUserId,perquisite.fk_empid,perquisite.fk_perkId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "perquisite assignment updated successfully." : "Failed to update perquisite assignment.";
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
