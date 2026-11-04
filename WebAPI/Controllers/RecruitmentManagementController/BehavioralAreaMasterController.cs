using DocumentFormat.OpenXml.InkML;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class BehavioralAreaMasterController : ControllerBase
    {
        private readonly IBehavioralAreaMasterRepository behavioralAreaMasterRepository;

        public BehavioralAreaMasterController(IBehavioralAreaMasterRepository _behavioralAreaMasterRepository)
        {
            behavioralAreaMasterRepository = _behavioralAreaMasterRepository;
        }

        [HttpPost]
        [Authorize]  // Requires authentication
        public async Task<IActionResult> InsertBehavioralAreaMasterAsync([FromBody] BehavioralAreaMasterModel model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var DecryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var DecryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                bool isInserted = await behavioralAreaMasterRepository.InsertBehavioralAreaMasterAsync(model, DecryptedUserId, DecryptedLocationId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Behavioral details inserted successfully." : "Failed to insert behavioral details.";
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
        public async Task<IActionResult> GetAll(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await behavioralAreaMasterRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Behavioral area master list retrieved successfully.";
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


        //Get By ID

        [HttpGet("{pk_behaveid}")]
        [Authorize]

        public async Task<IActionResult> GetBehavioralByIdAsync([FromRoute] long pk_behaveid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                BehavioralAreaMasterModelBYID result = await behavioralAreaMasterRepository.GetBehavioralByIdAsync(pk_behaveid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid behavioralId";
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Behavioral detail retrieved successfully.";
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
        [Authorize]  // Secured endpoint
                     // 

        public async Task<IActionResult> UpdateBehavioralAsync([FromBody] BehavioralAreaMasterModel BehavioralAreaMasterModel)
        {
            ModelResponse modelResponse = new ModelResponse();
            var DecryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
            var DecryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

            try
            {
                bool isUpdated = await behavioralAreaMasterRepository.UpdateBehavioralAsync(BehavioralAreaMasterModel, DecryptedUserId, DecryptedLocationId);
                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Functional detail updated successfully." : "Failed to update Functional detail.";
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












        //Delete code
        [HttpDelete("{pk_behaveid}")]
        [Authorize]
        public async Task<IActionResult> DeleteBehavioralAreaMasterAsync([FromRoute] long pk_behaveid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isDeleted = await behavioralAreaMasterRepository.DeleteBehavioralAreaMasterAsync(pk_behaveid);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Functional detail delete successfully." : "Failed to delete Functional detail.";
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





    }
}
