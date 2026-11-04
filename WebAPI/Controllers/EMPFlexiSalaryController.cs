using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EMPFlexiSalaryController : ControllerBase
    {
        private readonly IEMPFlexiSalaryRepository _eMPFlexiSalaryRepository;
        private readonly FileService fileService;
        private readonly AppSettings appSettings;

        public EMPFlexiSalaryController(IEMPFlexiSalaryRepository eMPFlexiSalaryRepository, FileService _fileService, IOptions<AppSettings> _appSettings)
        {
            _eMPFlexiSalaryRepository = eMPFlexiSalaryRepository;
            fileService = _fileService;
            appSettings = _appSettings.Value;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertFlexiBillAsync([FromForm] SAL_EmployeeFlexiHeadBills_Mst model)
        {
            var userId = HttpContext.Items["DecryptedUserId"]?.ToString();
            var companyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
            var locationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

            model.fk_empid = userId;
            // 📁 Check & Save file
            if (model.FilePath != null && model.FilePath.Length > 0)
            {
                // ✅ Validate image type
                if (!fileService.IsImageFile(model.FilePath))
                {
                    return BadRequest(new { message = "Only image files (jpg, jpeg, png) are allowed." });
                }

                // 💾 Save file
                var savedFileName = await fileService.SaveFileAsync(model.FilePath);

                // 📝 Assign to DB model
                model.filename = savedFileName;
            }

            model.FilePath = null;


            var result = await _eMPFlexiSalaryRepository.InsertEmployeeFlexiHeadBillAsync(model);

            return Ok(new ModelResponse
            {
                IsSuccess = result,
                Message = result ? "Flexi bill uploaded successfully." : "Upload failed.",
                StatusCode = result ? 200 : 400
            });
        }

        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetFlexiBills()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // 🔓 Decrypt CompanyId and EmpId from middleware or HttpContext
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); 

                if (string.IsNullOrEmpty(decryptedCompanyId) || string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid employee or company information.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // 🧾 Fetch Flexi Head Bill Data
                var result = await _eMPFlexiSalaryRepository.GetEmployeeFlexiHeadBillsAsync(decryptedUserId, decryptedCompanyId);

                if (!result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Flexi head bills retrieved successfully.";
                modelResponse.Data = result;
                modelResponse.TotalCount = result.Count();  // optional for pagination
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

        [HttpGet("FlexiHeadDropdown")]
        [Authorize]
        public async Task<IActionResult> GetFlexiHeadDropdown()
        {
            var modelResponse = new ModelResponse();

            try
            {
                // 🔓 Decrypt user and company ID from token context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                // 💬 Repository call
                var result = await _eMPFlexiSalaryRepository.GetFlexiHeadDropdownAsync(decryptedUserId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
            }

            return Ok(modelResponse);
        }

        [HttpGet("validate-bill")]
        [Authorize]
        public async Task<IActionResult> ValidateFlexiBillAsync([FromQuery] string fk_headid, [FromQuery] string billDate, [FromQuery] decimal billAmt)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Employee ID is missing.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await _eMPFlexiSalaryRepository.ValidateFlexiBillAsync(decryptedUserId, fk_headid, billDate, billAmt);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Validation failed or no response.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Validation completed.";
                modelResponse.Data = result;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "Error: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> DeleteFlexiBill([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await _eMPFlexiSalaryRepository.DeleteFlexiBillAsync(id);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Flexi bill deleted successfully." : "Failed to delete Flexi bill.";
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
