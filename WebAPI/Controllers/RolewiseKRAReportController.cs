using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RolewiseKRAReportController : ControllerBase
    {
        private readonly IRolewiseKRAReportRepository rolewiseKRAReportRepository;


        public RolewiseKRAReportController(IRolewiseKRAReportRepository _rolewiseKRAReportRepository)

        {
            rolewiseKRAReportRepository = _rolewiseKRAReportRepository;
        }





        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllExperienceDetails(int pageIndex = 0, int pageSize = 10, string RoleId = null, string searchTerm = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await rolewiseKRAReportRepository.GetAll(pageIndex, pageSize, RoleId, searchTerm);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Rolewise Details List retrieved successfully.";
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


    }
}
