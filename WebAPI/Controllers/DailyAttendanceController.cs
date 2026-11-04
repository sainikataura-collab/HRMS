using HRBook.Models;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace HRBook.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class DailyAttendanceController : ControllerBase
    {
        private readonly IDailyAttendanceRepository dailyAttendanceRepository;

        public DailyAttendanceController(
            IDailyAttendanceRepository dailyAttendanceRepository)
        {
            this.dailyAttendanceRepository = dailyAttendanceRepository;
        }


        [HttpPost("SaveAttendance")]
        public async Task<IActionResult> SaveAttendance(
    [FromBody] DailyAttendanceModelins model)
        {
            try
            {
                model.fk_finId =
                    HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

                var result =
                    await dailyAttendanceRepository.SaveAttendance(model);

                if (result.IsSuccessfull)
                {
                    return Ok(new
                    {
                        IsSuccess = true,
                        Message = result.Message,
                        Data = (object)null
                    });
                }

                return BadRequest(new
                {
                    IsSuccess = false,
                    Message = result.Message,
                    Data = (object)null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    IsSuccess = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }



       [HttpPost("GetAttendance")]
[Authorize]
public async Task<IActionResult> GetAttendance(
    string empId,
    short monthId,
    short yearId)
{
    try
    {
        string finId =
            HttpContext.Items["DecryptedFinancialYearId"]?.ToString();

        var result =
            await dailyAttendanceRepository.GetAttendance(
                empId,
                monthId,
                yearId,
                finId);

        if (result == null)
        {
            return Ok(new
            {
                IsSuccess = false,
                Message = "Attendance not found.",
                Data = (object)null
            });
        }

        return Ok(new
        {
            IsSuccess = true,
            Message = "Attendance retrieved successfully.",
            Data = result
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new
        {
            IsSuccess = false,
            Message = ex.Message,
            Data = (object)null
        });
    }
}

    }
}