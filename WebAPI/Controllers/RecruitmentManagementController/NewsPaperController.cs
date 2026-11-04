using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class NewsPaperController : ControllerBase
    {
        private readonly INewsPaperRepository newsPaperRepository;

        public NewsPaperController(INewsPaperRepository _newsPaperRepository)
        {
            this.newsPaperRepository = _newsPaperRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertNewsPaperMst([FromBody] NewsPaperMst newsPaperMst)
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

                // Set IDs in the newsPaperMst model
                newsPaperMst.fk_companyId = decryptedCompanyId;
                newsPaperMst.fk_insDateID = decryptedLocationId;
                newsPaperMst.fk_insUserID = decryptedUserId.ToString();

                bool isInserted = await newsPaperRepository.InsertNewsPaperMst(newsPaperMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "NewsPaper details inserted successfully." : "Failed to insert NewsPaper details.";
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

                var (totalCount, result) = await newsPaperRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "NewsPaper List retrieved successfully.";
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

        [HttpGet("{newspaperId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetNewsPaperById([FromRoute] string newspaperId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                NewsPaperMst result = await newsPaperRepository.GetNewsPaperById(newspaperId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid NewsPaperId";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "NewsPaper detail retrieved successfully.";
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
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateNewsPaper([FromBody] NewsPaperMst newsPaperMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                newsPaperMst.fk_companyId = decryptedCompanyId;
                newsPaperMst.fk_updDateID = decryptedLocationId;
                newsPaperMst.fk_updUserID = decryptedUserId.ToString();

                bool isUpdated = await newsPaperRepository.UpdateNewsPaper(newsPaperMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "NewsPaper detail updated successfully." : "Failed to update NewsPaper detail.";
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

        [HttpDelete("{newspaperId}")]
        [Authorize]
        public async Task<IActionResult> DeleteNewsPaper([FromRoute] string newspaperId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await newsPaperRepository.DeleteNewsPaper(newspaperId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "NewsPaper deleted successfully." : "Failed to delete NewsPaper.";
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
