using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SelfAssessmentReportController : ControllerBase
    {

        private readonly ISelfAssessmentReportRepository selfAssessmentReportRepository;


        public SelfAssessmentReportController(ISelfAssessmentReportRepository _selfAssessmentReportRepository)

        {
            selfAssessmentReportRepository = _selfAssessmentReportRepository;
        }


        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllSelfAssessment(int pageIndex = 0, int pageSize = 10, string searchTerm = null)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (totalCount, result) = await selfAssessmentReportRepository.GetAllSelfAssessment(pageIndex, pageSize, searchTerm);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Self Assessment List retrieved successfully.";
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
