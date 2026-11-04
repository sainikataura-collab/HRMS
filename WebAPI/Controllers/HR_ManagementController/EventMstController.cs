using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.HR_ManagementController
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class EventMstController : ControllerBase
    {

        private readonly IEventMstRepository eventRepository;

        public EventMstController(IEventMstRepository _eventRepository)

        {
            eventRepository = _eventRepository;
        }


        //[HttpPost("Insert")]
        //public async Task<IActionResult> InsertEventAsync([FromBody] EventInsertRequest eventMst)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        // Retrieve decrypted/encrypted IDs from HttpContext
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!;

        //        // Assign to model
        //        eventMst.Event.Fk_UserID = decryptedUserId.ToString();

        //        // Call repository
        //        bool isInserted = await eventRepository.InsertEventAsync(eventMst.Event, eventMst.EventDetails);

        //        modelResponse.IsSuccess = isInserted;
        //        modelResponse.Message = isInserted
        //            ? "Event inserted successfully."
        //            : "Failed to insert event.";
        //        modelResponse.StatusCode = isInserted ? 200 : 400;
        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return Ok(modelResponse);
        //    }
        //}



        [HttpPost("Insert")]
        public async Task<IActionResult> InsertEventAsync([FromBody] EventInsertRequest eventRequest)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Get decrypted user ID from HttpContext (if available)
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "SYSTEM";

                // Assign user ID to event
                eventRequest.Event.Fk_UserID = decryptedUserId;

                // Call repository (pass both department & location details)
                bool isInserted = await eventRepository.InsertEventAsync(
                    eventRequest.Event,
                    eventRequest.departmentDetails,
                    eventRequest.locationDetails
                );

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted
                    ? "Event inserted successfully."
                    : "Failed to insert event.";
                modelResponse.StatusCode = isInserted ? 200 : 400;
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
            }

            return Ok(modelResponse);
        }



        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllEvent(int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var (totalCount, result) = await eventRepository.GetAll(pageIndex, pageSize);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Event List retrieved successfully.";
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



        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateEventAsync([FromBody] EventInsertRequest eventmst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                eventmst.Event.Fk_UserID = decryptedUserId;

                bool isUpdated = await eventRepository.UpdateEventAsync(
                    eventmst.Event,
                    eventmst.departmentDetails,
                    eventmst.locationDetails
                );

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Event updated successfully." : "Failed to update Event.";
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


        //[HttpPut("update")]
        //[Authorize]  // Secured endpoint        
        //public async Task<IActionResult> UpdateEventAsync([FromBody] EventInsertRequest eventmst)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        eventmst.Event.Fk_UserID = decryptedUserId.ToString();

        //        bool isUpdated = await eventRepository.UpdateEventAsync(eventmst.Event, eventmst.EventDetails);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "Event updated successfully." : "Failed to update Event.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

        //        return Ok(modelResponse);
        //    }
        //    catch (Exception ex)
        //    {
        //        modelResponse.IsSuccess = false;
        //        modelResponse.Message = ex.Message;
        //        modelResponse.StatusCode = 500;

        //        return Ok(modelResponse);
        //    }
        //}




        [HttpGet("{eventId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetEventByIdAsync([FromRoute] int eventId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var result = await eventRepository.GetEventByIdAsync(eventId);
                if (result.Item1 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid IDs";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Event detail retrieved successfully.";
                //modelResponse.Data = result;
                modelResponse.Data = new
                {
                    Event = result.Item1,
                    DepDetails = result.Item2,
                    LocDetails = result.Item3,
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

        [HttpDelete("delete/{eventId}")]
        [Authorize]
        public async Task<IActionResult> DeleteDepMstAsync([FromRoute] int eventId)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                bool isDeleted = await eventRepository.DeleteEventMstAsync(eventId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Event detail delete successfully." : "Failed to delete Event detail.";
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


        //event dahsboard for employee

        [HttpGet("EmployeeEventDashboard")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> Eventdashboard([FromQuery] long? fk_yearid = null, [FromQuery] long? monthid = null)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                // var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await eventRepository.GetEventDashboardDataAsync(fk_yearid, monthid);

                if (result.Item1 == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid IDs";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "EventDashboard Data  retrieved successfully.";
                modelResponse.Data = new
                {
                    dashboard = result.Item1,
                    todayBirthdays = result.Item2,
                    upcomingBirthdays = result.Item3,
                    upcomingEvents = result.Item4,
                    Anniversaries = result.Item5

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



        [HttpGet("GetRecentActivity")]
        [Authorize]
        public IActionResult GetRecentActivity()
        {
            try
            {
                var result = eventRepository.GetRecentActivity();

                return Ok(new
                {
                    isSuccess = true,
                    message = "Recent activity retrieved successfully.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = ex.Message
                });
            }
        }




    }
}
