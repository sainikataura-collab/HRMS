using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using static HRMSWebAPI.Models.ExitFormAuthorityMst;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ExitFormAuthorityController : ControllerBase
    {
        private readonly IExitFormAuthorityRepository exitFormAuthorityRepository;

        public ExitFormAuthorityController(IExitFormAuthorityRepository _exitFormAuthorityRepository)

        {
            exitFormAuthorityRepository = _exitFormAuthorityRepository;

        }




        [HttpPost]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> CreateAsync([FromBody] ExitInterviewApprovalDetailWrapper model)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                bool isInserted = await exitFormAuthorityRepository.CreateAsync(model);

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



        [HttpGet("{pk_Empid}")]
        [Authorize]
        public async Task<IActionResult> GetById([FromRoute] string pk_Empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var result = await exitFormAuthorityRepository.GetById(pk_Empid);

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





    }
}
