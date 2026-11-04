using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using UAParser;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using static System.Net.WebRequestMethods;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
//using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.ComponentModel.Design;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LevelController : ControllerBase
    {
        private readonly ILevelRepository levelRepository;

        public LevelController(ILevelRepository _levelRepository)

        {
            levelRepository = _levelRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertLevelAsync([FromBody] LevelMst levelMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string



                // Assign decrypted values to the LevelMst object
                levelMst.fk_companyId = decryptedCompanyId;
                levelMst.fk_locid = decryptedLocationId;

                // Assuming there's no direct fk_InsuserId or fk_locId in LevelMst, omitting those unless specified otherwise
                // If needed, you can add properties to the model or adjust logic here

                bool isInserted = await levelRepository.InsertLevelAsync(levelMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Level Details inserted successfully." : "Failed to insert level Details.";
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


        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var (totalCount, result) = await levelRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Level List retrieved successfully.";
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

        [HttpGet("{levelId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetLevelByIdAsync([FromRoute] string levelId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await levelRepository.GetLevelByIdAsync(levelId);

                if (result.Level == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid LevelId";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Level detail retrieved successfully.";
                //modelResponse.Data = result;
                modelResponse.Data = new
                {
                    level = result.Level,
                    reimbHeads = result.Heads
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

        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateLevelAsync([FromBody] LevelMst levelMst)
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

                // Assign decrypted values              
                levelMst.fk_companyId = decryptedCompanyId;
                // Note: LevelMst does not have fk_locId, so it’s omitted unless you add it to the model

                bool isUpdated = await levelRepository.UpdateLevelAsync(levelMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Level updated successfully." : "Failed to update Level.";
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

        [HttpDelete("{levelId}")]
        [Authorize]
        public async Task<IActionResult> DeleteLevelMstAsync([FromRoute] string levelId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await levelRepository.DeleteLevelMstAsync(levelId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Level detail deleted successfully." : "Failed to delete Level detail.";
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



        [HttpGet("reimb-heads")]
        [Authorize]
        public async Task<IActionResult> GetReimbHeads()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid CompanyId";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await levelRepository.GetReimbursementHeads(decryptedCompanyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Reimbursement heads fetched successfully.";
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




    }
}
