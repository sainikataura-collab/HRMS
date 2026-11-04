
using Microsoft.AspNetCore.Http;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OrganizationChartController : ControllerBase
    {
        private readonly IOrganizationChartRepository organizationChartRepository;
        public OrganizationChartController(IOrganizationChartRepository _organizationChartRepository)

         {
            organizationChartRepository = _organizationChartRepository;

          }



        // Get by id office type master

        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetGradeByIdAsync([FromQuery] string? pk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                if (pk_empid==""|| pk_empid == null)
                {
                    pk_empid = decryptedUserId;
                }

                var result = await organizationChartRepository.GetOrganizationChartByIdAsync(pk_empid);

                if (result == null)

                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid pk_empid";
                    return Ok(modelResponse);
                }
               

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Organization Chart Get successfully.";
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


    }
}
