using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]
    public class DeductionSlabController : ControllerBase
    {
        private readonly IDeductionSlabRepository deductionSlabRepository;



        public DeductionSlabController(IDeductionSlabRepository _deductionSlabRepository)

        {
            deductionSlabRepository = _deductionSlabRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertDeductionSlabAsync([FromBody] DeductionSlabMst DeductionSlabMst)
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

                bool isInserted = await deductionSlabRepository.InsertDeductionSlabAsync(DeductionSlabMst, decryptedUserId, decryptedLocationId,decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "DeductionSlab details inserted successfully." : "Failed to insert DeductionSlab details.";
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
        public async Task<IActionResult> GetAll(string? PersonType = null, int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string


                var (totalCount, result) = await deductionSlabRepository.GetAll(pageIndex, pageSize, PersonType, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "DeductionSlab List retrieved successfully.";
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





        [HttpGet("{SlabId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetDeductionSlabByIdAsync([FromRoute] long SlabId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                DeductionSlabMst result = await deductionSlabRepository.GetDeductionSlabByIdAsync(SlabId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid SlabId";
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "DeductionSlab detail retrieved successfully.";
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

        [HttpDelete("{SlabId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDeductionSlabAsync([FromRoute] long SlabId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await deductionSlabRepository.DeleteDeductionSlabAsync(SlabId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "DeductionSlab detail delete successfully." : "Failed to delete DeductionSlab detail.";
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




        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateDeductionSlabAsync([FromBody] DeductionSlabMst DeductionSlabMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string

                bool isUpdated = await deductionSlabRepository.UpdateDeductionSlabAsync(DeductionSlabMst, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "DeductionSlab updated successfully." : "Failed to update DeductionSlab.";
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



    }
}




