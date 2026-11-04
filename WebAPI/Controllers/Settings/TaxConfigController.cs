using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TaxConfigController : ControllerBase
    {
        private readonly ITaxConfigRepository taxConfigRepository;

        public TaxConfigController(ITaxConfigRepository _taxConfigRepository)
        {
            this.taxConfigRepository = _taxConfigRepository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertTaxConfigAsync([FromBody] List<TaxConfigMst> taxConfigList)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (taxConfigList == null || taxConfigList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Tax config list cannot be empty";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call the repository method
                bool isInserted = await taxConfigRepository.InsertTaxConfigAsync(taxConfigList, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Tax config inserted successfully." : "Failed to insert tax config";
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
        [Authorize]
        public async Task<IActionResult> GetTaxConfigAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Call repository method to get TaxConfig (no ID required)
                TaxConfigMst result = await taxConfigRepository.GetTaxConfigByIdAsync();

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Tax Config not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Tax Config retrieved successfully.";
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

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateTaxConfigAsync([FromBody] TaxConfigMst taxConfigObj)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (taxConfigObj == null )
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Tax Config  is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }
                List<TaxConfigMst> taxConfigList = [];
                taxConfigList.Add(taxConfigObj);

                // Set fk_updUserID in each item (optional, if needed in DB)
                foreach (var item in taxConfigList)
                {
                    item.fk_updUserID = decryptedUserId;
                }

                // Call the repository method
                bool isUpdated = await taxConfigRepository.UpdateTaxConfigAsync(
                    taxConfigList,
                    decryptedUserId,
                    decryptedLocationId
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Tax Config updated successfully." : "Failed to update Tax Config.";
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
