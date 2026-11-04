using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ReminderSetupController : ControllerBase
    {
        private readonly IReminderSetupRepository reminderSetupRepository;

        public ReminderSetupController(IReminderSetupRepository _reminderSetupRepository)

        {
            reminderSetupRepository = _reminderSetupRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> Insert([FromBody] ReminderSetupXmlModel Dataset)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {



                bool isInserted = await reminderSetupRepository.Insert(Dataset);

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

    }
}
