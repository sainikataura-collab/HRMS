using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ExitDashboardController : ControllerBase
    {
        private readonly IExitDashboardRepository _exitDashboardRepository;

        public ExitDashboardController(IExitDashboardRepository exitDashboardRepository)
        {
            _exitDashboardRepository = exitDashboardRepository;
        }

        [HttpPost("GetExitDashboard")]
        [Authorize]
        public async Task<IActionResult> GetExitDashboardAsync([FromBody] ExitDashboardRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                int monthVal = 0;
                int yearVal = 0;
                int.TryParse(request.Month, out monthVal);
                int.TryParse(request.Year, out yearVal);

                if (monthVal == 0 || yearVal == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Month or Year provided.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var data = await _exitDashboardRepository.GetExitDashboardAsync(monthVal, yearVal);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Exit Dashboard details retrieved successfully.";
                modelResponse.Data = data;
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

    public class ExitDashboardRequest
    {
        public string? Month { get; set; }
        public string? Year { get; set; }
    }
}
