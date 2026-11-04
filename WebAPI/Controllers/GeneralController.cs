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
    public class GeneralController : ControllerBase
    {
        private readonly IGeneralRepository generalRepository;



        public GeneralController(IGeneralRepository _generalRepository)

        {
            generalRepository = _generalRepository;
        }


        [HttpGet("IsValueAvailable/{fieldName}")]
        [Authorize]
        public async Task<IActionResult> IsValueAvailableAsync([FromRoute] string fieldName, [FromQuery] string fieldValue, [FromQuery] string? generalId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the user ID
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string



                if (string.IsNullOrWhiteSpace(fieldName) || string.IsNullOrWhiteSpace(fieldValue))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "FieldName and FieldValue are required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                Result result = await generalRepository.IsValueAvailableAsync(decryptedCompanyId, decryptedUserId, fieldName, fieldValue, generalId);

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



        [HttpGet("dropdownList/{fieldName}")]
        [Authorize]
        public async Task<IActionResult> GetDropdownListAsync([FromRoute] string fieldName)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(fieldName))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "FieldName and FieldValue are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // CompanyId

                if (string.IsNullOrWhiteSpace(fieldName))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Field Name is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await generalRepository.GetDropdownListAsync(fieldName, decryptedCompanyId, decryptedUserId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
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


        //F OR EMPLOYEE
        [HttpGet("Emp_dropdownList/{fieldName}")]
        [Authorize]
        public async Task<IActionResult> Emp_GetDropdownListAsync([FromRoute] string fieldName)
        {
            ModelResponse modelResponse = new ModelResponse();

            if (string.IsNullOrWhiteSpace(fieldName))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "FieldName and FieldValue are required.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId

                if (string.IsNullOrWhiteSpace(fieldName))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Field Name is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await generalRepository.Emp_GetDropdownListAsync(fieldName, decryptedCompanyId, decryptedUserId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
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

        //



        [HttpGet("ddl/locations")]
        [Authorize]
        public async Task<IActionResult> GetLocationsForUserAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId

                if (string.IsNullOrWhiteSpace(decryptedUserId) || string.IsNullOrWhiteSpace(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID and Company ID are required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                //sending officeTypeId as null
                var result = await generalRepository.GetLocationsForUserAsync(null, decryptedUserId, decryptedCompanyId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
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




        [HttpGet("LeaveList")]
        [Authorize]
        public async Task<IActionResult> GetleavetypeList()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // CompanyId


                var result = await generalRepository.GetleavetypeList(decryptedUserId, decryptedCompanyId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
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

        [HttpGet("ModuleList")]
        [Authorize]
        public async Task<IActionResult> ModuleList()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId


                var result = await generalRepository.ModuleList(decryptedUserId);


                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
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




        //Added Raj 06 May 2026



        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllCodeTypesAsync(
        [FromQuery] int pageNumber = 1, // Optional: Default to the first page
        [FromQuery] int pageSize = 10 // Optional: Default to 10 items per page
    )
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                var result = await generalRepository.GetCodeTypesListAsync(pageNumber, pageSize);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.List;
                modelResponse.TotalCount = result.TotalCount;
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



        [HttpGet("GetListBasedOnCodeType")]
        [Authorize]
        public async Task<IActionResult> GetListBasedOnCodeTypeAsync([FromQuery] string codeTypeId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (String.IsNullOrEmpty(codeTypeId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "CodeTypeId is required and must be greater than 0.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var organizationId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); ; // CompanyId


                var result = await generalRepository.GetListBasedOnCodeTypeAsync(codeTypeId, pageNumber, pageSize, organizationId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.List;
                modelResponse.TotalCount = result.TotalCount;
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




        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateMasterGeneralAsync([FromBody] MasterGeneral masterGeneral)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();  // CompanyId

                // Convert to short before assigning
                masterGeneral.EntryBy = decryptedUserId.ToString();
                masterGeneral.fk_companyId = decryptedCompanyId;

                var response = await generalRepository.CreateMasterGeneralAsync(masterGeneral);

                modelResponse.IsSuccess = response.IsSuccessfull;
                modelResponse.StatusCode = response.IsSuccessfull ? 200 : 400;
                modelResponse.Message = response.Message;
                modelResponse.DocumentId = response.IsSuccessfull ? response.Id.ToString() : null;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500; // Internal Server Error

                return Ok(modelResponse);
            }
        }


        [Authorize]
        [HttpPut("{codeId}")]
        public async Task<IActionResult> UpdateMasterGeneralAsync([FromRoute] string codeId, [FromBody] MasterGeneral masterGeneral)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Check if codeId and masterGeneral.CodeId are valid and matching
                if (string.IsNullOrEmpty(codeId) || masterGeneral.CodeId == null || codeId != masterGeneral.CodeId.ToString())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.StatusCode = 400;
                    modelResponse.Message = "CodeId mismatched. Update failed.";
                    return Ok(modelResponse);
                }

                if (string.IsNullOrEmpty(masterGeneral.CodeTypeId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.StatusCode = 400;
                    modelResponse.Message = "CodeTypeId is required. Update failed.";
                    return Ok(modelResponse);
                }

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the decrypted user ID from context
                masterGeneral.UpdateBy = decryptedUserId; // Assign UpdateBy with decryptedUserId



                var organizationId = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";  // CompanyId

                var response = await generalRepository.UpdateMasterGeneralAsync(masterGeneral, organizationId);
                modelResponse.IsSuccess = response.IsSuccessfull;
                modelResponse.StatusCode = response.IsSuccessfull ? 200 : 400;
                modelResponse.Message = response.Message;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500; // Internal Server Error

                return Ok(modelResponse);
            }
        }


        [HttpGet("IsValueAvailableInLSPGeneral/{codeDescription}")]
        [Authorize]
        public async Task<IActionResult> IsValueAvailableInLSPGeneralAsync([FromRoute] string codeDescription, [FromQuery] string codeTypeId, [FromQuery] string? codeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var organizationIdStr = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";  // CompanyId

                if (string.IsNullOrWhiteSpace(codeDescription) || string.IsNullOrWhiteSpace(codeTypeId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "CodeDescription and CodeTypeId are required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                Result result = await generalRepository.IsValueAvailableInLSPGeneralAsync(codeDescription, codeTypeId, codeId, organizationIdStr);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = $"An error occurred: {ex.Message}";
                modelResponse.StatusCode = 500; // Internal Server Error
                return Ok(modelResponse);
            }
        }



        [HttpGet("{codeId}/{codeTypeId}")]
        [Authorize]
        public async Task<IActionResult> GetMasterGeneralByIdAsync([FromRoute] string codeId, [FromRoute] string codeTypeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await generalRepository.GetMasterGeneralByIdAsync(codeId, codeTypeId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
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



        [HttpGet("GetDdlListBasedOnCodeType")]
        [Authorize]
        public async Task<IActionResult> GetDdlListBasedOnCodeTypeAsync([FromQuery] string codeTypeId, [FromQuery] string? organizationId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (string.IsNullOrEmpty(codeTypeId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "CodeTypeId is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // ✅ Use provided organizationId, fallback to JWT token
                var organizationIdStr = HttpContext.Items["DecryptedCompanyId"]?.ToString() ?? "";
                var finalOrgId = !string.IsNullOrEmpty(organizationId) ? organizationId : organizationIdStr;

                var result = await generalRepository.GetDdlListBasedOnCodeTypeAsync(codeTypeId, finalOrgId);

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.List;
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







    }
}
