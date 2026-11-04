using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TrainingRatingMastersController : ControllerBase
    {
        private readonly ITrainingRatingRepository trainingRatingRepository;

        public TrainingRatingMastersController(ITrainingRatingRepository _trainingRatingRepository)
        {
            trainingRatingRepository = _trainingRatingRepository;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int pageindex = 0, int pagesize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var (totalCount, result) = await trainingRatingRepository.GetAll(pageindex, pagesize);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
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

        [HttpGet("{pk_ratingId}")]
        [Authorize]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int pk_ratingId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await trainingRatingRepository.GetByIdAsync(pk_ratingId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Detail retrieved successfully.";
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

        [HttpDelete("{pk_ratingId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] int pk_ratingId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await trainingRatingRepository.DeleteAsync(pk_ratingId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Detail deleted successfully." : "Failed to delete detail.";
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

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertAsync([FromBody] TrainingRatingMst model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isInserted = await trainingRatingRepository.InsertAsync(model);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Detail inserted successfully." : "Failed to insert detail.";
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

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateAsync([FromBody] TrainingRatingMst model)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isUpdated = await trainingRatingRepository.UpdateAsync(model);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Detail updated successfully." : "Failed to update detail.";
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
