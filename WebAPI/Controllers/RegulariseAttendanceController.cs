using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RegulariseAttendanceController : ControllerBase
    {
        private readonly IRegulariseAttendanceRepository regulariseAttendanceRepository;

        public RegulariseAttendanceController(IRegulariseAttendanceRepository _regulariseAttendanceRepository)
        {
            regulariseAttendanceRepository = _regulariseAttendanceRepository;
        }

        [HttpGet("EMPAttendanceDashNew")]
        [Authorize]

        public async Task<IActionResult> EMPAttendanceDashNew(string Month, string Year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString();

                // Call repository
                var result = await regulariseAttendanceRepository.EMPAttendanceDashNew(Month, Year, decryptedUserId);

                if (result.Summary == null && (result.Logs == null || !result.Logs.Any()))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance Dashboard details retrieved successfully.";
                modelResponse.Data = new
                {
                    Summary = result.Summary,
                    Logs = result.Logs
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



        [HttpPost("InsertCDO")]
        [Authorize]
        public async Task<IActionResult> InsertCDOAsync([FromBody] CDORequestList data)
        {
            ModelResponse modelResponse = new ModelResponse();

            var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

            if (string.IsNullOrEmpty(decryptedUserId))
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "User ID not found.";
                modelResponse.StatusCode = 400;
                return Ok(modelResponse);
            }

            // 👇 Inject user ID into request model
            data.CDORequest.fk_empid = decryptedUserId;
            try
            {
                ModelResponse result = await regulariseAttendanceRepository.InsertCDOAsync(data);
                modelResponse.IsSuccess = result.IsSuccess;
                modelResponse.Message = result.Message;
                modelResponse.StatusCode = result.IsSuccess ? 200 : 400;
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


        [HttpDelete("DeleteAttendanceRegularisation/{pk_inoutid}")]
        [Authorize]
        public async Task<IActionResult> DeleteAttendanceRegularisationAsync([FromRoute] long pk_inoutid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var (isSuccess, message) = await regulariseAttendanceRepository.DeleteAttendanceRegularisationAsync(pk_inoutid);

                modelResponse.IsSuccess = isSuccess;
                modelResponse.Message = message;
                modelResponse.StatusCode = isSuccess ? 200 : 400;

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


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> InsertRegulariseAttendance([FromBody] RegulariseAttendanceMstDataSet requestData)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // 👇 Inject user ID into request model
                requestData.RegulariseAttendanceMst.fk_empid = decryptedUserId;

                bool isInserted = await regulariseAttendanceRepository.InsertRegulariseAttendanceAsync(requestData);

                modelResponse.IsSuccess = isInserted;
                modelResponse.Message = isInserted
                    ? "Regularisation request inserted successfully."
                    : "Failed to insert regularisation request.";
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

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllRegulariseAttendanceByEmpAsync([FromQuery] int? month, [FromQuery] int? year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await regulariseAttendanceRepository.GetAllRegulariseAttendanceByEmpAsync(decryptedUserId,month,year);

                if (result == null || !result.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No regularisation record found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Regularisation list retrieved successfully.";
                modelResponse.Data = result;
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

        [HttpGet("regularisationDates")]
        [Authorize]
        public async Task<IActionResult> GetRegularisationDatesAsync()
        {
            ModelResponse modelResponse = new ModelResponse();
            string flag = "";

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var result = await regulariseAttendanceRepository.GetRegularisationDateDropdownAsync(decryptedUserId, flag);

                modelResponse.IsSuccess = result.Data.Count > 0;
                modelResponse.Message = result.Data.Count>0? "Sucessfully retrieved":"No data found";
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.Data.Count > 0 ? 200 : 400;

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

        [HttpGet("getInOutTime")]
        [Authorize]
        public async Task<IActionResult> GetInOutTimeByInoutIdAsync([FromQuery] long pk_inoutid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var result = await regulariseAttendanceRepository.GetInOutTimeByInoutIdAsync(decryptedUserId, pk_inoutid);

                modelResponse.IsSuccess = result.Data != null && result.Data.Count > 0;
                modelResponse.Message = result.Data.Count > 0 ? "Successfully retrieved In/Out Time" : "No data found";
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.Data.Count > 0 ? 200 : 400;

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

        //shiv

        [HttpGet("ViewAttendance")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> EmpAttendanceDetails(string Month, string Year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var result = await regulariseAttendanceRepository.EMPAttendanceDetails(Month, Year, decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance Details retrieved successfully.";
                modelResponse.DataObj = result.Atten;
                modelResponse.Data = result.AttenList;

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

        //vewi team Attendance

        [HttpGet("ViewTeamAttendance")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> ViewTeamAttendanceDetails(string Month, string Year, string empId)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var result = await regulariseAttendanceRepository.EMPAttendanceDetails(Month, Year, empId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Team Attendance Details retrieved successfully.";
                modelResponse.DataObj = result.Atten;
                modelResponse.Data = result.AttenList;
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



        [HttpGet("GetEmployeeNameDropdownList")]
        [Authorize]
        public async Task<IActionResult> GetEmployeeNameDropdownListAsync()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {


                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // UserId

                if (string.IsNullOrWhiteSpace(decryptedUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "EmployeeId  is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }
                var result = await regulariseAttendanceRepository.GetEmployeeNameDropdownList(decryptedUserId);


                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "error";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = result.IsSuccessfull;
                modelResponse.Message = result.Message;
                modelResponse.Data = result.Data;
                modelResponse.StatusCode = result.IsSuccessfull ? 200 : 400;

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



        [HttpGet("EMPAttendanceDash")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> EMPAttendanceDash(string Month, string Year)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {

                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var result = await regulariseAttendanceRepository.EMPAttendanceDash(Month, Year, decryptedUserId);
                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No Record found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Attendance Dash Details retrieved successfully.";
                modelResponse.Data = result;
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
