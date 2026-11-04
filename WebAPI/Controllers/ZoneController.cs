
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

    public class ZoneController : Controller
    {

        private readonly IZoneRepository zoneRepository;

        public ZoneController(IZoneRepository _zoneRepository)

        {
            zoneRepository = _zoneRepository;
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

                

                var (totalCount, result) = await zoneRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

           
                modelResponse.IsSuccess = true;
                modelResponse.Message = "Zone List retrieved successfully.";
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





        [HttpGet("{zoneId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetZoneByIdAsync([FromRoute] string zoneId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                

                ZoneMst result = await zoneRepository.GetZoneByIdAsync(zoneId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ZoneId";
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Zone detail retrieved successfully.";
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



        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertZoneAsync([FromBody] ZoneMst zoneMst)
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

                

                zoneMst.fk_InsuserId = decryptedUserId;
                zoneMst.fk_companyId = decryptedCompanyId;
                zoneMst.fk_locId = decryptedLocationId;
                

                bool isInserted = await zoneRepository.InsertZoneAsync(zoneMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Zone inserted successfully." : "Failed to insert zone.";
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



        [HttpDelete("{zoneId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] string zoneId)
        {
            ModelResponse modelResponse = new ModelResponse();

          

            try
            {
                bool isDeleted = await zoneRepository.DeleteZoneMstAsync(zoneId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Zone detail delete successfully." : "Failed to delete Zone detail.";
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




        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateDepartmentAsync([FromBody] ZoneMst zoneMst)
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
                zoneMst.fk_InsuserId = decryptedUserId;
                zoneMst.fk_companyId = decryptedCompanyId;
                zoneMst.fk_locId = decryptedLocationId;
            

                bool isUpdated = await zoneRepository.UpdateZoneAsync(zoneMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Zone updated successfully." : "Failed to update Zone.";
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
