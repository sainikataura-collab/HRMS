using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingTypeMasterController : ControllerBase
    {
        private readonly ITrainingTypeMasterRepository trainingTypeMasterRepository;

        public TrainingTypeMasterController(ITrainingTypeMasterRepository _trainingTypeMasterRepository)

        {
            trainingTypeMasterRepository = _trainingTypeMasterRepository;
        }



        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertAsync([FromBody] TrainingTypeMst TrainingTypeMst)
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


                bool isInserted = await trainingTypeMasterRepository.InsertAsync(TrainingTypeMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Training type inserted successfully." : "Failed to insert training type.";
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

        //GetAll

        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string



                var (totalCount, result) = await trainingTypeMasterRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Training type list retrieved successfully.";
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



        //GetById

        [HttpGet("{pk_typeId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] long pk_typeId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                TrainingTypeMst result = await trainingTypeMasterRepository.GetByIdAsync(pk_typeId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid sectionId";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "section detail retrieved successfully.";
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



        //Delete

        [HttpDelete("{pk_typeId}")]
        [Authorize]
        public async Task<IActionResult> DeleteSectionMstAsync([FromRoute] long pk_typeId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await trainingTypeMasterRepository.DeleteAsync(pk_typeId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "section detail delete successfully." : "Failed to delete section detail.";
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



        //for update
        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateSectionAsync([FromBody] TrainingTypeMst TrainingTypeMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isUpdated = await trainingTypeMasterRepository.UpdateAsync(TrainingTypeMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Training Type updated successfully." : "Failed to update training type.";
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

        // traning 




    }
}
