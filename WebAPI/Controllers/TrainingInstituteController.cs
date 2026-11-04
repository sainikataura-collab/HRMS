using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingInstituteController : ControllerBase
    {

        private readonly ITrainingInstituteRepository trainingInstituteRepository;

        public TrainingInstituteController(ITrainingInstituteRepository _trainingInstituteRepository)

        {
            trainingInstituteRepository = _trainingInstituteRepository;
        }
        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> InsertAsync([FromBody] TrainingInstituteMst trainingInstituteMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
              
                bool isInserted = await trainingInstituteRepository.InsertAsync(trainingInstituteMst);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "detail inserted successfully." : "Failed to insert detail.";
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
        public async Task<IActionResult> GetAll(int pageindex = 0, int pagesize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
               

                var (totalCount, result) = await trainingInstituteRepository.GetAll(pageindex, pagesize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "List retrieved successfully.";
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



        [HttpGet("{pk_instituteId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] long pk_instituteId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                TrainingInstituteMst result = await trainingInstituteRepository.GetByIdAsync(pk_instituteId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail retrieved successfully.";
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

        //for delete 
        [HttpDelete("{pk_instituteId}")]
        [Authorize]
        public async Task<IActionResult> DeleteMstAsync([FromRoute] long pk_instituteId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await trainingInstituteRepository.DeleteMstAsync(pk_instituteId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail delete successfully." : "Failed to delete  detail.";
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
        public async Task<IActionResult> UpdateAsync([FromBody] TrainingInstituteMst trainingInstituteMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                    bool isUpdated = await trainingInstituteRepository.UpdateAsync(trainingInstituteMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "detail updated successfully." : "Failed to update detail.";
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
