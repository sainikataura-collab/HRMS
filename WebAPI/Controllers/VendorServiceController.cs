using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class VendorServiceController : ControllerBase
    {
        private readonly IVendorServiceRepository vendorServiceRepository;

        public VendorServiceController(IVendorServiceRepository _vendorServiceRepository)
        {
            vendorServiceRepository = _vendorServiceRepository;
        }

        [HttpGet("GetLocationsByVendor/{vendorId}")]
        [Authorize]
        public async Task<IActionResult> GetLocationsByVendorAsync([FromRoute] string vendorId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var result = await vendorServiceRepository.GetLocationsByVendorAsync(vendorId, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Locations retrieved successfully.";
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

        [HttpGet("GetClientsByLocation/{locationIds}")]
        [Authorize]
        public async Task<IActionResult> GetClientsByLocationAsync([FromRoute] string locationIds)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var result = await vendorServiceRepository.GetClientsByLocationAsync(locationIds, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clients retrieved successfully.";
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

        [HttpPost("UploadExcel")]
        [Authorize]
        public async Task<IActionResult> UploadExcelAsync([FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] string? companyId = null, [FromForm] string? userId = null)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (file == null || file.Length == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Please select a valid Excel file.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var ext = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();
                if (ext != ".xlsx")
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Only .xlsx Excel files are supported.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    decryptedCompanyId = companyId ?? "";
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    decryptedUserId = userId ?? "";
                }

                var summary = await vendorServiceRepository.UploadExcelAsync(file, decryptedCompanyId, decryptedUserId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = $"Upload processed: {summary.UploadedCount} uploaded, {summary.FailedCount} failed.";
                modelResponse.Data = summary;
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

        [HttpGet("{id}")]
        [HttpGet("GetById/{id}")]
        [Authorize]
        public async Task<IActionResult> GetVendorServiceByIdAsync([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var result = await vendorServiceRepository.GetVendorServiceByIdAsync(id, decryptedCompanyId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Vendor Service record not found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendor Service record retrieved successfully.";
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

        [HttpPost]
        [HttpPost("Insert")]
        [Authorize]
        public async Task<IActionResult> InsertVendorServiceAsync([FromBody] VendorServiceModel vendorService)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";

                vendorService.fk_CompanyID = decryptedCompanyId;

                var result = await vendorServiceRepository.InsertVendorServiceAsync(vendorService, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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
        [HttpPost("Update")]
        [Authorize]
        public async Task<IActionResult> UpdateVendorServiceAsync([FromBody] VendorServiceModel vendorService)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString() ?? "";

                vendorService.fk_CompanyID = decryptedCompanyId;

                var result = await vendorServiceRepository.UpdateVendorServiceAsync(vendorService, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        [HttpDelete("{id}")]
        [HttpDelete("Delete/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteVendorServiceAsync([FromRoute] long id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "";
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";

                var result = await vendorServiceRepository.DeleteVendorServiceAsync(id, decryptedUserId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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

        [HttpPost("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAllPostAsync([FromBody] VendorServiceFilterDto filter)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var (totalCount, list) = await vendorServiceRepository.GetVendorServiceListAsync(filter ?? new VendorServiceFilterDto(), decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data loaded successfully.";
                modelResponse.Data = new { totalCount, vendorServices = list };
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

        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAllGetAsync(
            [FromQuery] int pageIndex = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string searchTerm = "",
            [FromQuery] string? vendorId = null,
            [FromQuery] string? locationId = null,
            [FromQuery] string? clientId = null)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var filter = new VendorServiceFilterDto
                {
                    PageIndex = pageIndex,
                    PageSize = pageSize,
                    SearchTerm = searchTerm,
                    VendorID = vendorId,
                    LocationID = locationId,
                    ClientID = clientId
                };

                var (totalCount, list) = await vendorServiceRepository.GetVendorServiceListAsync(filter, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data loaded successfully.";
                modelResponse.Data = new { totalCount, vendorServices = list };
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

        [HttpGet("GetVendors")]
        [Authorize]
        public async Task<IActionResult> GetVendorsAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var result = await vendorServiceRepository.GetVendorsDropdownAsync(decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Vendors retrieved successfully.";
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

        [HttpGet("GetLocations")]
        [Authorize]
        public async Task<IActionResult> GetLocationsAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var result = await vendorServiceRepository.GetLocationsDropdownAsync(decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Locations retrieved successfully.";
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

        [HttpGet("GetClients")]
        [Authorize]
        public async Task<IActionResult> GetClientsAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var result = await vendorServiceRepository.GetClientsDropdownAsync(decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Clients retrieved successfully.";
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
    }
}
