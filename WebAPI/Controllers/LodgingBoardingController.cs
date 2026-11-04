using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LodgingBoardingController : ControllerBase
    {
        private readonly ILodgingBoardingRepository lodgingBoardingRepository;

        public LodgingBoardingController(ILodgingBoardingRepository _lodgingBoardingRepository)

        {
            lodgingBoardingRepository = _lodgingBoardingRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Insert([FromBody] LodgingBoardingXmlModel Dataset)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
               


                bool isInserted = await lodgingBoardingRepository.Insert(Dataset);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Inserted successfully." : "Failed to insert .";
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
        [Authorize] // Secured endpoint
        public async Task<IActionResult> Update([FromBody] LodgingBoardingXmlModel dataMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Ensure there's at least one record and pk_lodgingboardingId is valid
                if (dataMst?.LodgingBoardingMst == null || dataMst.LodgingBoardingMst.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data provided.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Get the pk_lodgingboardingId from the first item
                int id = dataMst.LodgingBoardingMst[0].pk_lodgingboardingId;

                if (id <= 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ID.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Call the repository
                bool isUpdated = await lodgingBoardingRepository.Update(id, dataMst);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Updated successfully." : "Failed to update.";
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

        //get by id
        [HttpGet("{pk_lodgingboardingId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] int pk_lodgingboardingId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                LodgingBoardingMst result = await lodgingBoardingRepository.GetByIdAsync(pk_lodgingboardingId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = " detail retrieved successfully.";
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


        [HttpDelete("{pk_lodgingboardingId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] int pk_lodgingboardingId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await lodgingBoardingRepository.DeleteAsync(pk_lodgingboardingId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "detail delete successfully." : "Failed to delete detail.";
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



        [HttpGet("grid")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> GetLodgingBoardingForGrid([FromQuery] int? pk_lodgingboardingId = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                int id = pk_lodgingboardingId ?? 0;
                var result = await lodgingBoardingRepository.GetLodgingBoardingForGrid(id);

                if (result == null || result.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Data retrieved successfully.";
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
