using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ManualIncomeTaxController : ControllerBase
    {
        private readonly IManualIncomeTaxRepository manualIncomeTaxRepository;
        public ManualIncomeTaxController(IManualIncomeTaxRepository _manualIncomeTaxRepository)

        {
            manualIncomeTaxRepository = _manualIncomeTaxRepository;
        }


        [HttpPost("GetAllData")]
        [Authorize]  // Secure this endpoint
        public async Task<IActionResult> GetAllManualITaxAsync([FromBody] ManualIncomeTaxMstRequest filter)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await manualIncomeTaxRepository.GetAllManualITaxAsync(filter);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Manual Income Tax List retrieved successfully.";
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

        //[HttpPut]
        //[Authorize] // Secured endpoint
        //public async Task<IActionResult> UpdateManualIncomeTaxAsync([FromBody] List<ManualIncomeTaxMst> manualIncomeTaxList)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // User ID
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString(); // Location ID


        //        // Assign location and user ID to model if needed
        //       // manualIncomeTax.fk_locid = decryptedLocationId;

        //        bool isUpdated = await manualIncomeTaxRepository.UpdateManualIncomeTaxAsync(manualIncomeTax);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "Manual Income Tax updated successfully." : "Failed to update Manual Income Tax.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return Ok(modelResponse);
        //    }
        //}


        [HttpPut]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateManualIncomeTaxAsync([FromBody] List<ManualIncomeTaxMst> manualIncomeTaxList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // User ID
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString(); // Location ID

                // Validate the input
                if (manualIncomeTaxList == null || !manualIncomeTaxList.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records to update.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Pass the decrypted Location ID and User ID along with the list of manual taxes to the repository
                bool isUpdated = await manualIncomeTaxRepository.UpdateManualIncomeTaxAsync(manualIncomeTaxList, decryptedLocationId, decryptedUserId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Manual Income Tax updated successfully." : "Failed to update Manual Income Tax.";
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
