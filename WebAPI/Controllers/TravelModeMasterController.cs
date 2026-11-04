using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using static HRMSWebAPI.Models.RoleWiseKRAImportModel;
using static HRMSWebAPI.Models.TravelModeMasterModel;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class TravelModeMasterController : ControllerBase
    {

        private readonly ITravelModeMasterRepository travelModeMasterRepository;

        public TravelModeMasterController(ITravelModeMasterRepository _travelModeMasterRepository)

        {
            travelModeMasterRepository = _travelModeMasterRepository;
        }





        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Insert(TravelModeMasterModel trvlmodel)
        {
            ModelResponse modelResponse = new ModelResponse();

            var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]!.ToString(); // Retrieve the CompanyId

            var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
            trvlmodel.fk_companyId = decryptedCompanyId;

            try
            {
                bool isInserted = await travelModeMasterRepository.TravelmodeInsert(trvlmodel);

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


        [HttpGet("GetAll")]
        [Authorize] // Secured endpoint
        public async Task<IActionResult> LTRN_TravelMode_Mst_Selforgrid([FromQuery] string? pk_travelmodeID = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                string id = pk_travelmodeID ?? string.Empty;
                var result = await travelModeMasterRepository.LTRN_TravelMode_Mst_Selforgrid(id);

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


        [HttpDelete("{pk_travelmodeID}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync([FromRoute] long pk_travelmodeID)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await travelModeMasterRepository.DeleteAsync(pk_travelmodeID);

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


        [HttpGet("{pk_travelmodeID}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetByIdAsync([FromRoute] long pk_travelmodeID)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                TravelModeMasterModel result = await travelModeMasterRepository.GetByIdAsync(pk_travelmodeID);
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
        public async Task<IActionResult> UpdateTravelRateAsync([FromBody] TrvlModelUpd dataMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                                                                                             
                foreach (var item in dataMst.travel)
                {
                    item.fk_companyId = decryptedCompanyId;
                }


                // Ensure there's at least one record and pk_lodgingboardingId is valid
                if (dataMst?.travel == null || dataMst.travel.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data provided.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Get the pk_lodgingboardingId from the first item
                long id = dataMst.travel[0].pk_travelmodeID;

                if (id <= 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid ID.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Call the repository
                bool isUpdated = await travelModeMasterRepository.UpdateTravelRateAsync(id, dataMst);

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
