using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
    public class ClientMasterController : ControllerBase
    {
        private readonly IClientMasterRepository clientMasterRepository;
        private readonly FileService _fileService;

        public ClientMasterController(IClientMasterRepository _clientMasterRepository, FileService fileService)
        {
            clientMasterRepository = _clientMasterRepository;
            _fileService = fileService;
        }

        [HttpGet("{pk_cost_centre_id}")]
        [Authorize]
        public async Task<IActionResult> GetClientMasterByIdAsync([FromRoute] long pk_cost_centre_id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await clientMasterRepository.GetClientMasterByIdAsync(pk_cost_centre_id);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Client Master record not found.";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Client Master record retrieved successfully.";
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
        [Authorize]
        public async Task<IActionResult> InsertClientMasterAsync([FromBody] ClientMasterModel clientMaster)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                clientMaster.fk_companyId = decryptedCompanyId;

                var result = await clientMasterRepository.InsertClientMasterAsync(clientMaster, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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
        [Authorize]
        public async Task<IActionResult> UpdateClientMasterAsync([FromBody] ClientMasterModel clientMaster)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString();

                clientMaster.fk_companyId = decryptedCompanyId;

                var result = await clientMasterRepository.UpdateClientMasterAsync(clientMaster, decryptedUserId, decryptedLocationId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }

        [HttpGet("GetAll")]
        [Authorize]
        public async Task<IActionResult> GetAllAsync([FromQuery] int pageIndex = 0, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString();

                var (totalCount, list) = await clientMasterRepository.GetAll(pageIndex, pageSize, decryptedCompanyId, searchTerm);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data loaded successfully.";
                modelResponse.Data = new { totalCount, list };
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

        [HttpDelete("{pk_cost_centre_id}")]
        [Authorize]
        public async Task<IActionResult> DeleteClientMasterAsync([FromRoute] long pk_cost_centre_id)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var result = await clientMasterRepository.DeleteClientMasterAsync(pk_cost_centre_id);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                return Ok(modelResponse);
            }
        }

        [HttpGet("GetModelListByClient/{fk_cost_centre_id}")]
        [Authorize]
        public async Task<IActionResult> GetModelListByClient([FromRoute] long fk_cost_centre_id, [FromQuery] string? fk_companyId = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? fk_companyId ?? "";
                var result = await clientMasterRepository.GetModelListByClientAsync(fk_cost_centre_id, decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Model dropdown list retrieved successfully.";
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

        [HttpGet("GetEarningHeads")]
        [Authorize]
        public async Task<IActionResult> GetEarningHeads([FromQuery] string? fk_companyId = "")
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? fk_companyId ?? "";
                var result = await clientMasterRepository.GetEarningHeadsAsync(decryptedCompanyId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Earning heads retrieved successfully.";
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

        [HttpPost("UploadClientLogo")]
        [Authorize]
        public async Task<IActionResult> UploadClientLogo([FromForm] ClientLogoUploadModel model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                if (model.ClientId <= 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Client Id is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                if (model.Logo != null && model.Logo.Length > 0)
                {
                    if (!_fileService.IsImageFile(model.Logo))
                    {
                        return Ok(new ModelResponse
                        {
                            IsSuccess = false,
                            Message = "Only image files (jpg, jpeg, png) are allowed.",
                            StatusCode = 400
                        });
                    }

                    var savedLogoName = await _fileService.SaveClientLogoFileAsync(model.Logo, model.ClientId.ToString());
                    model.LogoName = savedLogoName;
                }

                model.Logo = null;

                bool result = await clientMasterRepository.UploadClientLogoAsync(model.ClientId, model.LogoName ?? "");

                modelResponse.IsSuccess = result;
                modelResponse.Message = result
                    ? "Client logo uploaded successfully."
                    : "Client logo upload failed.";
                modelResponse.Data = model.LogoName;
                modelResponse.StatusCode = result ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }
    }
}
