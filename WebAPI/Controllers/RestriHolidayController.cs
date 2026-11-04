using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RestriHolidayController : ControllerBase
    {
        private readonly IRestric_HolidayRepository resHolidayRepository;
        public RestriHolidayController(IRestric_HolidayRepository _resHolidayRepository)

        {
            resHolidayRepository = _resHolidayRepository;
        }

        //for display

        [HttpGet]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAll(long? fk_yearid = null, int pageIndex = 0, int pageSize = 10)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                //var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();  // Retrieve the UserId
                //var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Retrieve encryptedCompanyId-string


                var (totalCount, result) = await resHolidayRepository.GetAll(pageIndex, pageSize, fk_yearid, decryptedCompanyId);

                if (result.Count() == 0)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }


                modelResponse.IsSuccess = true;
                modelResponse.Message = "Restriction Holiday List retrieved successfully.";
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
        //get by id
        [HttpGet("{holidayId}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetRes_HolidayByIdAsync([FromRoute] string holidayId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                Restric_Holiday result = await resHolidayRepository.GetRes_HolidayByIdAsync(holidayId);



                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid HolidayId";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }



                modelResponse.IsSuccess = true;
                modelResponse.Message = "Restriction Holiday detail retrieved successfully.";
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



        //insert
        [HttpPost]
        [Authorize]  // Secured endpoint        

        public async Task<IActionResult> InsertRes_HolidayAsync([FromBody] List<Restric_Holiday> re_holidayMstList)
        {

            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                // Call repository method, passing the list of holidays
                bool isInserted = await resHolidayRepository.InsertRes_HolidayAsync(re_holidayMstList, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted ? " Restriction Holiday(s) inserted successfully." : "Failed to insert holiday(s).";
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
        //for delete
        [HttpDelete("{holidayId}")]
        [Authorize]
        public async Task<IActionResult> DeleteRes_HolidayAsync([FromRoute] string holidayId)
        {
            ModelResponse modelResponse = new ModelResponse();



            try
            {
                bool isDeleted = await resHolidayRepository.DeleteRes_HolidayAsync(holidayId);

                modelResponse.IsSuccess = isDeleted;
                modelResponse.Message = isDeleted ? " Restriction Holiday detail delete successfully." : "Failed to delete Holiday detail.";
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
        //for update
        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateRes_HolidayAsync([FromBody] Restric_Holiday Res_holidayMst)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Retrieve the CompanyId
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId

                bool isUpdated = await resHolidayRepository.UpdateRes_HolidayAsync(Res_holidayMst, decryptedUserId, decryptedLocationId, decryptedCompanyId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? " RestrictionHoliday updated successfully." : "Failed to update  Restriction Holiday.";
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
