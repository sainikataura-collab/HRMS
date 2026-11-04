using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Ocsp;

namespace HRMSWebAPI.Controllers.RecruitmentManagementController
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ScreeningAppController : ControllerBase
    {

        private readonly IScreeningAppRepository screeningAppRepository;

        public ScreeningAppController(IScreeningAppRepository _screeningAppRepository)
        {
            screeningAppRepository = _screeningAppRepository;
        }



        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetById( [FromQuery] string? fk_jobid = null)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // Await the repository call
                var (CandidateDetails, jobdata, totalCount) = await screeningAppRepository.GetScreeningAppById(fk_jobid);

                if (CandidateDetails == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid LeaveId";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Screening App List retrieved successfully";
                modelResponse.Data = new
                {
                    jobdata = jobdata,
                    CandidateDetails = CandidateDetails,
                    TotalCount = totalCount
                };
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


        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> Insert([FromBody] ScreeningAppGenNode ScreenedApplication)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {

                //var screenedApplication = ScreenedApplication.screenedApplication ?? new List<ScreenedApplication>(); // Ensure it's not null


                // Retrieve User and Location IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                // Call repository method to insert
                bool isInserted = await screeningAppRepository.Update(
                    ScreenedApplication,
                    decryptedUserId,
                    decryptedLocationId
                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isInserted,
                    Message = isInserted ? "Update successfully." : "Failed to Update",
                    StatusCode = isInserted ? 200 : 400
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }



    }
}
