using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TaxDeductorController : ControllerBase
    {
        private readonly ITaxDeductorRepository taxDeductorRepository;

        public TaxDeductorController(ITaxDeductorRepository _taxDeductorRepository)
        {
            this.taxDeductorRepository = _taxDeductorRepository;
        }

        [HttpPost]
        [Authorize]

        public async Task<IActionResult> InsertTaxDeductorAsync([FromBody] List<TaxDeductorMst> taxDeductorList)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();  // Assuming Company ID is also stored
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString(); // Retrieve the FinancialYear
                // Validate input

                foreach (var item in taxDeductorList)
                {
                    item.fk_finid = (decryptedFinancialYearId);
                }

                if (taxDeductorList == null || taxDeductorList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Tax deductor list cannot be empty";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }
                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId) || string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID, Location ID, or Company ID is missing";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method
                bool isInserted = await taxDeductorRepository.InsertTaxDeductorAsync(taxDeductorList, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Tax deductor inserted successfully." : "Failed to insert tax deductor";
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
        public async Task<IActionResult> GetAllTaxDeductors(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from HttpContext.Items
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString(); // Retrieve the CompanyId

                // Validate CompanyId
                if (string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Company ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method to get tax deductors
                var (totalCount, result) = await taxDeductorRepository.GetAllTaxDeductorsAsync(pageIndex, pageSize, decryptedCompanyId);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No tax deductor records found.";
                    modelResponse.StatusCode = 404; // Changed to 404 for "Not Found"
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Tax Deductor List retrieved successfully.";
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

        [HttpGet("{pk_dedid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetTaxDeductorByIdAsync([FromRoute] string pk_dedid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Validate input
                if (string.IsNullOrEmpty(pk_dedid))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Tax Deductor ID is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Call repository method to get tax deductor by ID
                TaxDeductorMst result = await taxDeductorRepository.GetTaxDeductorByIdAsync(pk_dedid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Tax Deductor ID.";
                    modelResponse.StatusCode = 404; // Changed to 404 for not found
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Tax Deductor detail retrieved successfully.";
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

        //[HttpPut]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> UpdateTaxDeductorAsync([FromBody] TaxDeductorMst taxDeductorMst)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        // Retrieve decrypted values from HttpContext.Items
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

        //        // Validate inputs
        //        if (taxDeductorMst == null)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "Tax Deductor data is required.";
        //            modelResponse.StatusCode = 400;
        //            return BadRequest(modelResponse);
        //        }

        //        if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "User ID or Location ID is missing.";
        //            modelResponse.StatusCode = 400;
        //            return BadRequest(modelResponse);
        //        }

        //        // Set update fields
        //        taxDeductorMst.fk_updUserID = decryptedUserId;

        //        // Create list for repository method
        //        List<TaxDeductorMst> taxDeductorMstList = new() { taxDeductorMst };

        //        // Call repository method to update the tax deductor
        //        bool isUpdated = await taxDeductorRepository.UpdateTaxDeductorAsync(taxDeductorMstList,decryptedUserId,decryptedLocationId,taxDeductorMst.pk_dedId);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "Tax Deductor updated successfully." : "Failed to update Tax Deductor.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;
        //        return Ok(modelResponse);
        //    }
        //}


        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateTaxDeductorAsync([FromBody] List<TaxDeductorMst> taxDeductorMstList)
        {
            var modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                if (taxDeductorMstList == null || !taxDeductorMstList.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Tax Deductor list is required.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedLocationId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Location ID is missing.";
                    modelResponse.StatusCode = 400;
                    return BadRequest(modelResponse);
                }

                // Set fk_updUserID in each item
                foreach (var item in taxDeductorMstList)
                {
                    item.fk_updUserID = decryptedUserId;
                }

                // Pick pk_dedId from first object (assuming only one object for now)
                string pk_dedId = taxDeductorMstList.First().pk_dedId;

                bool isUpdated = await taxDeductorRepository.UpdateTaxDeductorAsync(
                    taxDeductorMstList,
                    decryptedUserId,
                    decryptedLocationId,
                    pk_dedId
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Tax Deductor updated successfully." : "Failed to update Tax Deductor.";
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






        [HttpDelete("{pk_dedid}")]  // Route parameter pk_dedid for tax deductor ID
        [Authorize]                  // Secured endpoint
        public async Task<IActionResult> DeleteTaxDeductorAsync([FromRoute] string pk_dedid)  // Parameter for tax deductor ID
        {
            ModelResponse modelResponse = new ModelResponse();  // Initialize response model
            try  // Start try block
            {
                // Call repository method to delete the tax deductor by ID
                bool isDeleted = await taxDeductorRepository.DeleteTaxDeductorAsync(pk_dedid);

                modelResponse.IsSuccess = isDeleted;  // Set success status
                modelResponse.Message = isDeleted ? "Tax Deductor deleted successfully.": "Failed to delete Tax Deductor.";  // Set message based on success
                modelResponse.StatusCode = isDeleted ? 200 : 400;  // Set HTTP status code based on success
                return Ok(modelResponse);  // Return success or failure response
            }
            catch (Exception ex)  // Catch any exceptions that occur
            {
                modelResponse.IsSuccess = false;  // Set failure status
                modelResponse.Message = ex.Message;  // Set exception message
                modelResponse.StatusCode = 500;  // Set error status code
                return Ok(modelResponse);  // Return error response
            }
        }

    }
}
