using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ScheduleInterviewController : ControllerBase
    {
        private readonly IScheduleInterviewRepository scheduleInterviewRepository;


        public ScheduleInterviewController(IScheduleInterviewRepository _scheduleInterviewRepository)

        {
            scheduleInterviewRepository = _scheduleInterviewRepository;
        }



        [HttpPost]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> InsertScheduleInterview([FromBody] ScheduleIntervieDataSet InsData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                // Set IDs in the operationalDivisionMst model
                InsData.ScheduleInterviewInsData[0].Fk_LocID = decryptedLocationId;
                InsData.ScheduleInterviewInsData[0].Fk_UserID = decryptedUserId.ToString();

                bool isInserted = await scheduleInterviewRepository.InsertScheduleInterview(InsData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Interview Schedule inserted successfully." : "Failed to insert Interview Schedule.";
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

        [HttpGet("{fk_jobi}")]
        [Authorize]
        public async Task<IActionResult> GetScheduleInterviewById([FromRoute] string fk_jobi)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (candidatedetails, datedata) = await scheduleInterviewRepository.GetScheduleInterviewById(fk_jobi);

                if (candidatedetails == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid JobId";
                    return Ok(modelResponse);
                }

                foreach (var item in candidatedetails)
                {
                    if (!string.IsNullOrWhiteSpace(item.Htime) && !string.IsNullOrWhiteSpace(item.Mtime))
                    {
                        item.interview_time = $"{item.Htime.Trim()}:{item.Mtime.Trim()}";
                    }
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Interview Schedule detail retrieved successfully.";
                modelResponse.Data = new
                {
                    candidatedetail = candidatedetails,
                    datedata = datedata

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



    }
}
