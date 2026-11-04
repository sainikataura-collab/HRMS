//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;

//namespace HRMSWebAPI.Controllers.TransactionsControllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class ChannelController : ControllerBase
//    {
//    }
//}


using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ChannelController : ControllerBase
    {
        private readonly IChannelRepository channelRepository;

        public ChannelController(IChannelRepository _channelRepository)
        {
            channelRepository = _channelRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertChannelMstAsync([FromBody] ChannelMst channelMst)
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

                channelMst.Fk_CompanyId = decryptedCompanyId;
                channelMst.Fk_LocID = decryptedLocationId;
                channelMst.Fk_UserID = decryptedUserId;

                Console.WriteLine($"Before Insert - CompanyId: {decryptedCompanyId}, LocationId: {decryptedLocationId}"); // Debug log


                bool isInserted = await channelRepository.InsertChannelMstAsync(channelMst);

                Console.WriteLine($"Insert Result: {isInserted}"); // Debug log


                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Channel details inserted successfully." : "Failed to insert channel details.";
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
        public async Task<IActionResult> GetAll()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var result = await channelRepository.GetAll();

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Channel List retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = result.Count();
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

        [HttpGet("{channelId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetChannelByIdAsync([FromRoute] string channelId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                ChannelMst result = await channelRepository.GetChannelByIdAsync(channelId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ChannelId";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Channel detail retrieved successfully.";
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
        public async Task<IActionResult> UpdateChannelMstAsync([FromBody] ChannelMst channelMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

                channelMst.Fk_LocID = decryptedLocationId;
                channelMst.Fk_UserID = decryptedUserId;

                bool isUpdated = await channelRepository.UpdateChannelMstAsync(channelMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Channel detail updated successfully." : "Failed to update channel detail.";
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

        [HttpDelete("{channelId}")]
        [Authorize]
        public async Task<IActionResult> DeleteChannelMstAsync([FromRoute] string channelId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await channelRepository.DeleteChannelMstAsync(channelId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Channel detail deleted successfully." : "Failed to delete channel detail.";
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