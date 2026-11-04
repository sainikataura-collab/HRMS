using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class FreezingStatusController : ControllerBase
    {
        private readonly IFreezingStatusRepository freezingStatusRepository;


        public FreezingStatusController(IFreezingStatusRepository _freezingStatusRepository)

        {
            freezingStatusRepository = _freezingStatusRepository;
        }

        [HttpPut]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> UpdateFreezingFinalStatus([FromBody] FreezingFinalStatusDataSet updateData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                // Set IDs in the freezing status data
                updateData.Candidates[0].Fk_UserID = decryptedUserId;
                updateData.Candidates[0].Fk_LocID = decryptedLocationId;

                bool isUpdated = await freezingStatusRepository.UpdateFreezingFinalStatus(updateData);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated
                    ? "Freezing final status updated successfully."
                    : "Failed to update freezing final status.";
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

        [HttpGet("{fk_jobid}")]
        [Authorize]
        public async Task<IActionResult> GetFreezingFinalStatusByJobId([FromRoute] string fk_jobid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (finalStatusList, freezingDateData) = await freezingStatusRepository.GetFreezingFinalStatusByJobId(fk_jobid);

                if (finalStatusList == null || finalStatusList.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No data found for the given Job ID.";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Freezing Final Status details retrieved successfully.";
                modelResponse.Data = new
                {
                    candidatedetail = finalStatusList,
                    datedata = freezingDateData
                };
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
