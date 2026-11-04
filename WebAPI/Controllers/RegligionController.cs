using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RegligionController : ControllerBase
    {

        private readonly IReligionRepository religionMasterRepository;

        public RegligionController(IReligionRepository _religionMasterRepository)

        {
            religionMasterRepository = _religionMasterRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint 
        public async Task<IActionResult> InsertReligionMst([FromBody] RegligionMst RegligionMaster)
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


                RegligionMaster.Fk_CompanyId = decryptedCompanyId;
                RegligionMaster.Fk_LocID = decryptedLocationId;
                RegligionMaster.Fk_UserID = decryptedUserId.ToString();

                bool isInserted = await religionMasterRepository.InsertReligionMst(RegligionMaster);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Regligion details inserted successfully." : "Failed to insert Regligion details.";
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



                var (totalCount,result) = await religionMasterRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

            

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Regligion List retrieved successfully.";
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


        [HttpGet("{religionid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetRegligionMasterById([FromRoute] string religionid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!; // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                RegligionMst result = await religionMasterRepository.GetRegligionMasterById(religionid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid RegligionId";
                    return Ok(modelResponse);
                }
              

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Regligion detail retrieved successfully.";
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
        public async Task<IActionResult> UpdateRegligionMaster([FromBody] RegligionMst RegligionMaster)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                               
                //RegligionMaster.Fk_CompanyId = decryptedCompanyId;
                RegligionMaster.Fk_LocID = decryptedLocationId;
                RegligionMaster.Fk_UserID = decryptedUserId.ToString();

                bool isUpdated = await religionMasterRepository.UpdateRegligionMaster(RegligionMaster);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Regligion detail updated successfully." : "Failed to update Religion detail.";
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


        [HttpDelete("{religionid}")]
        [Authorize]
        public async Task<IActionResult> DeleteRegligionMaster([FromRoute] string religionid)
        {
            ModelResponse modelResponse = new ModelResponse();


            try
            {
                bool isDeleted = await religionMasterRepository.DeleteRegligionMaster(religionid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Regligion detail delete successfully." : "Failed to delete Regligion detail.";
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
