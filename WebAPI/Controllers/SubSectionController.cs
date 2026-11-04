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
    public class SubSectionController : ControllerBase
    {

        private readonly ISubSectionRepository subSectionRepository;

        public SubSectionController ( ISubSectionRepository _subSectionRepository)
        {
            subSectionRepository = _subSectionRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertSubSectionAsync([FromBody] SubSectionMst subSectionMst)
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

                // Set the relevant properties from the SubSectionMst model
                subSectionMst.fk_insUserID = decryptedUserId;    // Mapping to Fk_UserID in repository
              
                bool isInserted = await subSectionRepository.InsertSubSectionAsync(subSectionMst, decryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Subsection inserted successfully." : "Failed to insert subsection.";
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
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var (totalCount, result) = await subSectionRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Subsection List retrieved successfully.";
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

        [HttpGet("{subSectionId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetSubSectionByIdAsync([FromRoute] string subSectionId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                SubSectionMst result = await subSectionRepository.GetSubSectionByIdAsync(subSectionId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid SubSectionId";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Subsection detail retrieved successfully.";
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
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateSubSectionAsync([FromBody] SubSectionMst subSectionMst)
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
                subSectionMst.fk_updUserID = decryptedUserId;    // Mapping to Fk_UserID in repository
               
                bool isUpdated = await subSectionRepository.UpdateSubSectionAsync(subSectionMst,decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Subsection updated successfully." : "Failed to update Subsection.";
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

        [HttpDelete("{subSectionId}")]
        [Authorize]
        public async Task<IActionResult> DeleteSubSectionAsync([FromRoute] string subSectionId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await subSectionRepository.DeleteSubSectionAsync(subSectionId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Subsection detail deleted successfully." : "Failed to delete Subsection detail.";
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


    }
}
