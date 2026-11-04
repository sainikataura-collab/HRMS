using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class SalaryDashboardController : ControllerBase
    {


        private readonly ISalaryDashboardRepository salarydashboardrepository;

        public SalaryDashboardController(ISalaryDashboardRepository _salarydashboardrepository)
        {
            salarydashboardrepository = _salarydashboardrepository;
        }



        //[HttpGet("ViewSalaryDashbord")]
        //[Authorize]  // Secured endpoint
        //public async Task<IActionResult> EmpSalaryDetails(string Month, string Year)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
        //        var result = await salarydashboardrepository.EMPSalaryDetails(Month, Year, decryptedUserId);
        //        if (result == null)
        //        {
        //            modelResponse.IsSuccess = false;
        //            modelResponse.Message = "No Record found.";
        //            modelResponse.StatusCode = 400;
        //            return Ok(modelResponse);
        //        }

        //        modelResponse.IsSuccess = true;
        //        modelResponse.Message = "Salary Dashboard Details retrieved successfully.";
        //        modelResponse.Data = result;
        //        modelResponse.StatusCode = 200;
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







        [HttpGet("ViewSalaryDashbord")]
        [Authorize]
        public async Task<IActionResult> EmpSalaryDetails(string Month, string Year)
        {
            ModelResponse modelResponse = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();
                var result = await salarydashboardrepository.EMPSalaryDetails(Month, Year, decryptedUserId);

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Salary Dashboard Details retrieved successfully.";
                modelResponse.Data = new
                {
                    SalaryDistributionOverview = result.SalaryOverview,
                    AnnualCompensationTrend = result.AnnualTrend
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
