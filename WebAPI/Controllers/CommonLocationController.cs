using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CommonLocationController : ControllerBase
    {
        private readonly ICommonLocationRepository commonLocationRepository;

        public CommonLocationController(ICommonLocationRepository _commonLocationRepository)

        {
            commonLocationRepository = _commonLocationRepository;
        }

        //for get all
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(
            int pageindex = 0,
            int pagesize = 10,
            string? fk_companyId = null,
            string? locname = "",
            string? fk_officeid = "",
            string? fk_cityid = "",
            string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

                var (totalCount, result) = await commonLocationRepository.GetAll(pageindex, pagesize, decryptedCompanyId, locname, fk_officeid, fk_cityid, searchTerm);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "List retrieved successfully.";
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
        [HttpGet("{pk_locid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult>GetById([FromRoute] string pk_locid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                

                CommonLocationMst result = await commonLocationRepository.GetById(pk_locid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                else
                {
                    result.pk_locid = pk_locid;
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
        //delete
        [HttpDelete("{pk_locid}")]
        [Authorize]
        public async Task<IActionResult> delete([FromRoute] string pk_locid)
        {
            ModelResponse modelResponse = new ModelResponse();

           


            try
            {
                bool isDeleted = await commonLocationRepository.delete(pk_locid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail delete successfully." : "Failed to delete detail.";
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

        //for insert
        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult>InsertAsync(CommonLocationMst locationMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                //var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                locationMst.fk_UserId = decryptedUserId;
                locationMst.fk_companyId = decryptedCompanyId;
                locationMst.fk_locid = decryptedLocationId;

                bool isInserted = await commonLocationRepository.InsertAsync(locationMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "detail inserted successfully." : "Failed to insert detail.";
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

        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult>UpdateAsync(CommonLocationMst locationMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                //var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                //var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                // Assign decrypted values              
                locationMst.fk_UserId = decryptedUserId;

                locationMst.fk_companyId = decryptedCompanyId;
               // locationMst.fk_locid= decryptedLocationId;
                bool isUpdated = await commonLocationRepository.UpdateAsync(locationMst);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Updated successfully." : "Failed to update.";
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
