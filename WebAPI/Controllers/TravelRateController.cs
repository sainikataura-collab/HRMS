using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TravelRateController : ControllerBase
    {
        private readonly ITravelRateRepository travelRateRepository;

        public TravelRateController(ITravelRateRepository _travelRateRepository)

        {
            travelRateRepository = _travelRateRepository;
        }


        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Insert([FromBody] TravelRateMstXmlModel Dataset)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                bool isInserted = await travelRateRepository.Insert(Dataset);

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
        [HttpGet("grid")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> LTRN_Rate_Mst_Selforgrid([FromQuery] string? pk_RateID = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                string id = pk_RateID ?? string.Empty;
                var result = await travelRateRepository.LTRN_Rate_Mst_Selforgrid(id);

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

        [HttpDelete("{pk_RateID}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] long pk_RateID)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await travelRateRepository.DeleteAsync(pk_RateID);

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

        //get by id
        [HttpGet("{pk_RateID}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] long pk_RateID)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                TravelRateMst result = await travelRateRepository.GetByIdAsync(pk_RateID);
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

        [HttpPut]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> UpdateTravelRateAsync([FromBody] TravelRateMstXmlModel dataMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Ensure there's at least one record and pk_lodgingboardingId is valid
                if (dataMst?.TravelRateMst == null || dataMst.TravelRateMst.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data provided.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Get the pk_lodgingboardingId from the first item
                long id = dataMst.TravelRateMst[0].pk_RateID;

                if (id <= 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ID.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Call the repository
                bool isUpdated = await travelRateRepository.UpdateTravelRateAsync(id, dataMst);

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


    }
}
