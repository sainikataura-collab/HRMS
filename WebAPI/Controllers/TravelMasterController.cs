using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TravelMasterController : ControllerBase
    {

        private readonly ITravelMasterRepository travelMasterRepository;
        private readonly AppSettings appSettings;
        FileService _FileService;
        public TravelMasterController(ITravelMasterRepository _travelrepository, IOptions<AppSettings> appSettings, FileService fileService)

        {
            travelMasterRepository = _travelrepository;
            this.appSettings = appSettings.Value;
            _FileService = fileService;
        }




        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> CreateAsync([FromBody] TravelMasterMstmodel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isInserted = await travelMasterRepository.CreateAsync(model);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "details inserted successfully." : "Failed to insert  details.";
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
        [Authorize]
        public async Task<IActionResult> GetAllAsync([FromQuery] long? pk_classTvlId=null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
               long id = pk_classTvlId ?? 0;
                var result = await travelMasterRepository.GetAllAsync(id);

                if (result == null)
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

      
        [HttpGet("{pk_classTvlId}")]
        [Authorize]
        public async Task<IActionResult> GetById([FromRoute] long pk_classTvlId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                TravelMasterMst result = await travelMasterRepository.GetById(pk_classTvlId);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Data = result;
                modelResponse.Message = "Data Edited successfully.";
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







        [HttpDelete("{pk_classTvlId}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] long pk_classTvlId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await travelMasterRepository.DeleteAsync(pk_classTvlId);

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
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateTravelMstAsync([FromBody] TravelMasterMstmodel model)
        {
            ModelResponse modelResponse = new ModelResponse();


            try
            {
                bool isUpdated = await travelMasterRepository.UpdateTravelMstAsync(model);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "detail updated successfully." : " update  failed.";
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


