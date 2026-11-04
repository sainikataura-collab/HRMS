using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class NatureController : ControllerBase
    {
        private readonly INatureRepository natureRepository;



        public NatureController(INatureRepository _natureRepository)

        {
            natureRepository = _natureRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertNatureMstAsync([FromBody] NatureMst NatureMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encrypt

                NatureMst.fk_CompanyId = decryptedCompanyId;
                NatureMst.Fk_LocID = decryptedLocationId;
                NatureMst.Fk_UserID = decryptedUserId.ToString();

                bool isInserted = await natureRepository.InsertNatureMstAsync(NatureMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Nature details inserted successfully." : "Failed to insert Nature details.";
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


                var (totalCount, result) = await natureRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Category List retrieved successfully.";
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

        [HttpGet("{natureId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetNatureByIdAsync([FromRoute] string natureId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                NatureMst result = await natureRepository.GetNatureByIdAsync(natureId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid NatureId";
                    return Ok(modelResponse);
                }
             

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Nature detail retrieved successfully.";
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
        public async Task<IActionResult> UpdateCategoryMstAsync([FromBody] NatureMst NatureMst)
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


                // CategoryMst.Fk_CompanyId = decryptedCompanyId;
                NatureMst.Fk_LocID = decryptedLocationId;
                NatureMst.Fk_UserID = decryptedUserId.ToString();

                bool isUpdated = await natureRepository.UpdateNatureMstAsync(NatureMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Nature detail updated successfully." : "Failed to update Nature detail.";
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



        [HttpDelete("{natureId}")]
        [Authorize]
        public async Task<IActionResult> DeleteNatureMstAsync([FromRoute] string natureId)
        {
            ModelResponse modelResponse = new ModelResponse();

           

            try
            {
                bool isDeleted = await natureRepository.DeleteNatureMstAsync(natureId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Nature detail delete successfully." : "Failed to delete Nature detail.";
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
