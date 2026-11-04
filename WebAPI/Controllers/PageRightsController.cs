using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PageRightsController : ControllerBase
    {
        private readonly IPageRightsRepository pageRightsRepository;

        public PageRightsController(IPageRightsRepository _pageRightsRepository)

        {
            pageRightsRepository = _pageRightsRepository;
        }


        [HttpGet("GetUserLocations")]
        [Authorize]
        public async Task<IActionResult> GetUserLocations([FromQuery] string fk_userId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(fk_userId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await pageRightsRepository.GetUserLocationsAsync(fk_userId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "User locations retrieved successfully.";
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




        [HttpGet]
        [Authorize]  // Optional: keep if required for security
        public async Task<IActionResult> GetWebPagesOnUserModId(
    [FromQuery] string fk_userId,
    [FromQuery] int fk_moduleId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await pageRightsRepository.GetWebPagesOnUserModIdAsync(fk_userId, fk_moduleId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Web pages retrieved successfully.";
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







        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertUserPageRightsAsync([FromBody] PagerightMst model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (model == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid request data.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse); // Always returning Ok
                }

                // Assign token-based userId if needed
                // model.userid = decryptedUserId ?? model.userid;

                bool isInserted = await pageRightsRepository.InsertUserPageRightsAsync(model);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "User Page Rights inserted successfully." : "Failed to insert user page rights.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

                return Ok(modelResponse); //  Always returning Ok
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse); //  Always returning Ok even on exception
            }
        }

        [HttpGet("GetUserFullMenu")]
        [Authorize] // Optional if security is required
        public async Task<IActionResult> GetUserFullMenu()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted user ID from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID could not be retrieved.";
                    modelResponse.StatusCode = 401;
                    return Ok(modelResponse);
                }

                var result = await pageRightsRepository.GetUserFullMenuAsync(decryptedUserId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Menu retrieved successfully.";
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

        [HttpGet("GetActiveModules")]
        [Authorize] // keep if you want security
        public async Task<IActionResult> GetActiveModules()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await pageRightsRepository.GetActiveModulesAsync();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No active modules found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Active modules retrieved successfully.";
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


        /// <summary>
        /// Returns aggregated L1/L2/L3, CanRaiseRequisition, CanEditManpower flags
        /// plus the list of location IDs assigned to this user for the given module.
        /// USP: dbo.UM_SP_GetUserAccessRights
        /// </summary>
        [HttpGet("GetUserAccessRights")]
        [Authorize]
        public async Task<IActionResult> GetUserAccessRights(
            [FromQuery] string userId,
            [FromQuery] int moduleId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await pageRightsRepository.GetUserAccessRightsAsync(userId, moduleId);
                modelResponse.IsSuccess = true;
                modelResponse.Message = "User access rights retrieved successfully.";
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
