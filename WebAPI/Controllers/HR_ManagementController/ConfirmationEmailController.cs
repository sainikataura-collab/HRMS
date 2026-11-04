using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ConfirmationEmailController : ControllerBase
    {
        private readonly IConfirmationEmailRepository _confirmationEmailRepository;

        public ConfirmationEmailController(IConfirmationEmailRepository confirmationEmailRepository)
        {
            _confirmationEmailRepository = confirmationEmailRepository;
        }

        // Insert Email Setting
        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertEmailSetting([FromBody] ConfirmationEmailMst emailSetting)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                emailSetting.fk_companyId = decryptedCompanyId;

                bool isInserted = await _confirmationEmailRepository.InsertEmailSetting(emailSetting);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Email Setting inserted successfully." : "Failed to insert Email Setting.";
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

        // Get Email Settings for Grid
        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var (totalCount, result) = await _confirmationEmailRepository.GetAll(pageIndex, pageSize, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Email Settings retrieved successfully.";
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

        // Get Email Setting by ID
        [HttpGet("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetById([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await _confirmationEmailRepository.GetById(id);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ID";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Email Setting retrieved successfully.";
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

        // Update Email Setting
        [HttpPut]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> UpdateEmailSetting([FromBody] ConfirmationEmailMst emailSetting)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isUpdated = await _confirmationEmailRepository.UpdateEmailSetting(emailSetting);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Email Setting updated successfully." : "Failed to update Email Setting.";
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

        // Delete Email Setting
        [HttpDelete("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteEmailSetting([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await _confirmationEmailRepository.DeleteEmailSetting(id);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Email Setting deleted successfully." : "Failed to delete Email Setting.";
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
