using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers.TransactionsControllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class StopSalaryController : ControllerBase
    {

        private readonly IStopSalaryRepository stopsalaryRepository;

        public StopSalaryController(IStopSalaryRepository _stopsalaryRepository)
        {
            stopsalaryRepository = _stopsalaryRepository;
        }


        [HttpPost("GetSalaryList")]
        [Authorize]
        public async Task<IActionResult> GetSalaryList([FromBody] EmpArrearProccessRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var stopSalaryData = await stopsalaryRepository.GetStopSalaryAsync(
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId
                );

                if ((stopSalaryData.ProcessSalary?.Count ?? 0) + (stopSalaryData.StoppedSalary?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Stop salary data retrieved successfully.";
                modelResponse.Data = stopSalaryData;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }

          [HttpPost("GetSalaryPaidList")]
        [Authorize]
        public async Task<IActionResult> GetSalaryPaid([FromBody] EmpProccessRequestModel request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var stopSalaryData = await stopsalaryRepository.GetSalaryPaidAsync(
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId
                );

                if ((stopSalaryData.PaidSalary?.Count ?? 0) + (stopSalaryData.StoppedSalary?.Count ?? 0) == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Stop salary data retrieved successfully.";
                modelResponse.Data = stopSalaryData;
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }










        //Stop Salary


        [HttpPost("StopSalary")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> StopSalary([FromBody] EmpListDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from headers or context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Optional use if needed
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Optional use if needed

                // Call repository method with employee list, month and year
                bool isStopped = await stopsalaryRepository.StopSalaryAsync(request.EmpList, request.fk_monthId, request.fk_yearId);

                //request.stopsalary ="Y";
                modelResponse.IsSuccess = isStopped;
                modelResponse.Message = isStopped ? "Salary stopped successfully." : "Failed to stop salary.";
                modelResponse.StatusCode = isStopped ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }

        //End 






        [HttpPost("PayStopSalary")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> PayStopSalary([FromBody] EmpListDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from headers or context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Optional use if needed
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Optional use if needed

                // Call repository method with employee list, month and year
                bool isStopped = await stopsalaryRepository.PayStopSalaryAsync(request.EmpList, request.fk_monthId, request.fk_yearId);

                //request.stopsalary ="Y";
                modelResponse.IsSuccess = isStopped;
                modelResponse.Message = isStopped ? "Salary pay successfully." : "Failed to sto salary.";
                modelResponse.StatusCode = isStopped ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }


        
        //Un-Stop Salary

        [HttpPost("Unstop-Salary")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UnStopSalary([FromBody] EmpListDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                // Retrieve decrypted values from headers or context
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Optional use if needed
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Optional use if needed

                // Call repository method with employee list, month and year
                bool isStopped = await stopsalaryRepository.UnStopSalaryAsync(request.EmpList, request.fk_monthId, request.fk_yearId);

                //request.stopsalary ="Y";
                modelResponse.IsSuccess = isStopped;
                modelResponse.Message = isStopped ? "Salary Un-stopped successfully." : "Failed to Un-stop salary.";
                modelResponse.StatusCode = isStopped ? 200 : 400;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;

                return StatusCode(500, modelResponse);
            }
        }




        [HttpPost("GetSalaryStopPaidList")]
        [Authorize]
        public async Task<IActionResult> GetSalaryPaid([FromBody] SalaryPaidStopProccessRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (Count, stopSalaryData) = await stopsalaryRepository.GetSalaryStopPaidAsync(
                    request.PageIndex,
                    request.PageSize,
                    request.EmpCode,
                    request.EmpCodeManual,
                    request.EmpName,
                    request.SelectedDepartments,
                    request.SelectedDesignation,
                    request.SelectedLocations,
                    request.SelectedNature,
                    request.SelectedCity,
                    request.SortBy,
                    request.FkMonthId,
                    request.FkYearId
                );

                if (stopSalaryData == null || stopSalaryData.Count == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "SalaryStopPaid data retrieved successfully.";
                modelResponse.Data = new
                {
                    totalCount = Count,
                    StoppedSalary = stopSalaryData
                };
                modelResponse.StatusCode = 200;

                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred: " + ex.Message;
                modelResponse.StatusCode = 500;

                return Ok(modelResponse);
            }
        }





    }
}
