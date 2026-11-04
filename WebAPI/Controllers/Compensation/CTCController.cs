using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CTCController : ControllerBase
    {
        private readonly ICTCRepository CTCRepository;

        public CTCController(ICTCRepository _CTCRepository)
        {
            CTCRepository = _CTCRepository;
        }


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllEmployeeCTCDetail()
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId) || string.IsNullOrEmpty(decryptedCompanyId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "User ID or Company ID not found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var result = await CTCRepository.GetEmployeeCTCDetailAsync(decryptedUserId, decryptedCompanyId);

                if (result.Item1 == null || !result.Item1.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No CTC records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "CTC details retrieved successfully.";
                modelResponse.Data = new
                {
                    CTCList = result.Item1,
                    CTCGross = result.Item2
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

        

        [HttpPost("forAdmin")]
        [Authorize]
        public async Task<IActionResult> GetAllEmployeeCTCDetailforAdmin(EmployeeFilterRequest request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                //  var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]?.ToString();
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var (totalCount, ctcList, ctcGross) = await CTCRepository.GetAllEmployeeCTCDetailAsync(request.EmpCode, request.EmpCodeManual,
                    request.EmpName, request.SelectedDepartments, request.SelectedDesignation,
                    request.SelectedLocations, request.SelectedNature, request.SelectedCity,
                    request.SortBy, decryptedUserId, request.EmpStatus, request.fk_costcentreid, decryptedCompanyId,
                    request.PageNo, request.PageSize);

                if (ctcList == null || !ctcList.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No CTC records found.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "CTC details retrieved successfully.";
                modelResponse.Data = new
                {
                    CTCList = ctcList,
                    CTCGross = ctcGross
                };
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
