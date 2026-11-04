using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PerquisiteController : ControllerBase
    {
        private readonly IPerquisiteRepository perquisiteRepository;

        public PerquisiteController(IPerquisiteRepository _perquisiteRepository)

        {
            perquisiteRepository = _perquisiteRepository;
        }

        //for insert
        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertSectionAsync([FromBody] PerquisiteMst perquisiteMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string


                bool isInserted = await perquisiteRepository.InsertperquisitesAsync(perquisiteMst, decryptedLocationId, decryptedUserId, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "perquiste inserted successfully." : "Failed to insert perquiste.";
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

        //for get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await perquisiteRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "perquisites List retrieved successfully.";
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
        [HttpGet("{perquisiteId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult>GetperquisitesByIdAsync([FromRoute] string perquisiteId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                PerquisiteMst result = await perquisiteRepository.GetperquisitesByIdAsync(perquisiteId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid perquisiteId";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "perquisite detail retrieved successfully.";
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
        [HttpDelete("{perquisiteId}")]
        [Authorize]
        public async Task<IActionResult>DeleteperquisitesAsync([FromRoute] string perquisiteId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await perquisiteRepository.DeleteperquisitesAsync(perquisiteId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "perquisites detail delete successfully." : "Failed to delete perquisites detail.";
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
        //for update
        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdatePerquisitesAsync([FromBody] PerquisiteMst perquisite)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string
                bool isUpdated = await perquisiteRepository.UpdatePerquisitesAsync(perquisite, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "perquisite updated successfully." : "Failed to update perquisite.";
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
