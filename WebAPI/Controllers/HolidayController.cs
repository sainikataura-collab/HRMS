using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]

    public class HolidayController : Controller
    {

        private readonly IHolidayRepository holidayRepository;

        public HolidayController(IHolidayRepository _holidayRepository)

        {
            holidayRepository = _holidayRepository;
        }

        [HttpPost]
        [Authorize]  // Secured endpoint        
        //[HttpPost]
        public async Task<IActionResult> InsertHolidayAsync([FromBody] List<HolidayMst> holidayMstList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                // Call repository method, passing the list of holidays
                bool isInserted = await holidayRepository.InsertHolidayAsync(holidayMstList, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Holiday(s) inserted successfully." : "Failed to insert holiday(s).";
                modelResponse.StatusCode = isInserted ? 200 : 400;

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



        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(long? fk_yearid=null, int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                

                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId



                var (totalCount, result) = await holidayRepository.GetAll(pageIndex, pageSize, fk_yearid,decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Holiday List retrieved successfully.";
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





        [HttpGet("{holidayId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetHolidayByIdAsync([FromRoute] string holidayId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                HolidayMst result = await holidayRepository.GetHolidayByIdAsync(holidayId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid HolidayId";
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Holiday detail retrieved successfully.";
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





        [HttpDelete("{holidayId}")]
        [Authorize]
        public async Task<IActionResult> DeleteHolidayAsync([FromRoute] string holidayId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await holidayRepository.DeleteHolidayAsync(holidayId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Holiday detail delete successfully." : "Failed to delete Holiday detail.";
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




        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateHolidayAsync([FromBody] HolidayMst holidayMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await holidayRepository.UpdateHolidayAsync(holidayMst, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Holiday updated successfully." : "Failed to update Holiday.";
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

        // for  working day 


        [HttpPost("insert")]
        [Authorize]  // Secured endpoint        
        //[HttpPost]
        public async Task<IActionResult> InsertWorkingDayMasterAsync([FromBody] List<SAL_Holidays_Mst_WorkingDayMst> Holidays_Mst_WorkingDayList)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                // Call repository method, passing the list of holidays
                bool isInserted = await holidayRepository.InsertWorkingDayMasterAsync(Holidays_Mst_WorkingDayList, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? "Working Day inserted successfully." : "Failed to insert Working Day.";
                modelResponse.StatusCode = isInserted ? 200 : 400;

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



        [HttpGet("GetAll")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> WorkingDayMasterGetAll(long? fk_yearid = null, int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId



                var (totalCount, result) = await holidayRepository.WorkingDayMasterGetAll(pageIndex, pageSize, fk_yearid, decryptedCompanyId);
                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Working Day List retrieved successfully.";
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





        //[HttpGet("{holidayId}")]
        [HttpGet("GetById/{holidayId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetWorkingDayMasterByIdAsync([FromRoute] string holidayId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                SAL_Holidays_Mst_WorkingDayMst result = await holidayRepository.GetWorkingDayMasterByIdAsync(holidayId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Working Day detail retrieved successfully.";
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





        [HttpDelete("Delete/{holidayId}")]
        [Authorize]
        public async Task<IActionResult> DeleteWorkingDayMasterAsync([FromRoute] string holidayId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await holidayRepository.DeleteWorkingDayMasterAsync(holidayId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? "Working Day detail delete successfully." : "Failed to delete Working Day detail.";
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




        [HttpPut("Update")]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateWorkingDayMasterAsync([FromBody] SAL_Holidays_Mst_WorkingDayMst holidayMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await holidayRepository.UpdateWorkingDayMasterAsync(holidayMst, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Working Day updated successfully." : "Failed to update Working Day.";
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




    }
}
