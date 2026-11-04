using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Security.Certificates;

namespace HRMSWebAPI.Controllers
{

    [Route("api/v1/[controller]")]
    [ApiController]
    public class DemographicController : ControllerBase
    {
        private readonly IDemographicRepository demographicRepository;

        public DemographicController(IDemographicRepository _demographicRepository)

        {
            demographicRepository = _demographicRepository;
        }

        [HttpPost("GetAllDemographic")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetAllDemographic(
            [FromQuery] int pageIndex,
            [FromQuery] int pageSize,
           
            [FromBody] EmployeeFilterRequest request, [FromQuery] string searchTerm = "")
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();


                var (totalCount, employees) = await demographicRepository.GetAllDemographic(
                    pageIndex, pageSize, request.EmpCode, request.EmpCodeManual,
                    request.EmpName, request.SelectedDepartments, request.SelectedDesignation,
                    request.SelectedLocations, request.SelectedNature, request.SelectedCity,
                    request.SortBy, decryptedUserId, request.EmpStatus, searchTerm
                );

                if (!employees.Any())
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "No records found.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Employee list retrieved successfully.";
                modelResponse.Data = employees;
                modelResponse.TotalCount = totalCount;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = "An error occurred. " + ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }



        [HttpGet("{fk_empid}")]
        [Authorize]  // Secured endpoint
        public async Task<IActionResult> GetWeeklyOffByIdAsync([FromRoute] string fk_empid)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                DemographicMst result = await demographicRepository.GetDemographicByIdAsync(fk_empid);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Weekly Off ID";
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Weekly Off detail retrieved successfully.";
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



        [HttpPut]
        [Authorize]  // Secured endpoint        
        public async Task<IActionResult> UpdateDemographicAsync([FromBody] DemographicMstDataSet request)
        {
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                if (request == null || request.Demographic == null || request.Demographic.Count == 0)
                {
                    return BadRequest(new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Demographic data is required.",
                        StatusCode = 400
                    });
                }

                var demographicMst = request.Demographic.First(); // Get the first demographic entry
                var demographicfamilyMst = request.FamilyMembers ?? new List<DemographicMstFamily>(); // Ensure it's not null

                // Ensure numeric fields are initialized to 0 if null
                demographicMst.prev_pf_amt ??= 0;
                demographicMst.prev_volpf_amt ??= 0;
                demographicMst.prev_epf_amt ??= 0;
                demographicMst.prev_eps_amt ??= 0;
                demographicMst.leave ??= 0;
                demographicMst.superannuation ??= 0;
                demographicMst.saf ??= 0;
                demographicMst.houserent ??= 0;
                demographicMst.totalexp ??= 0;
                demographicMst.gratuity ??= 0;
                demographicMst.loans ??= 0;

                // Retrieve User and Location IDs from HttpContext
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

                // Assigning IDs to demographic object
                demographicMst.fk_updUserID = decryptedUserId;
                demographicMst.fk_locid = decryptedLocationId;

                // Call repository method to update
                bool isUpdated = await demographicRepository.UpdateDemographicAsync(
                    new List<DemographicMst> { demographicMst },
                   demographicfamilyMst,
                    decryptedUserId,
                    decryptedLocationId
                );

                return Ok(new ModelResponse
                {
                    IsSuccess = isUpdated,
                    Message = isUpdated ? "Employee demographic and family details updated successfully." : "Failed to update employee demographic.",
                    StatusCode = isUpdated ? 200 : 400
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}",
                    StatusCode = 500
                });
            }
        }


        //[HttpPut]
        //[Authorize]  // Secured endpoint        
        //public async Task<IActionResult> UpdateDemographicAsync([FromBody] DemographicMstDataSet request)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        if (request == null || request.Demographic == null || request.Demographic.Count == 0)
        //        {
        //            return BadRequest(new ModelResponse
        //            {
        //                IsSuccess = false,
        //                Message = "Demographic data is required.",
        //                StatusCode = 400
        //            });
        //        }

        //        var demographicMst = request.Demographic.First(); // Get the first demographic entry

        //        // Ensure numeric fields are initialized to 0 if null
        //        demographicMst.prev_pf_amt ??= 0;
        //        demographicMst.prev_volpf_amt ??= 0;
        //        demographicMst.prev_epf_amt ??= 0;
        //        demographicMst.prev_eps_amt ??= 0;
        //        demographicMst.leave ??= 0;
        //        demographicMst.superannuation ??= 0;
        //        demographicMst.saf ??= 0;
        //        demographicMst.houserent ??= 0;
        //        demographicMst.totalexp ??= 0;
        //        demographicMst.gratuity ??= 0;
        //        demographicMst.loans ??= 0;

        //        // Retrieve User and Location IDs from HttpContext
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString();

        //        // Assigning IDs to demographic object
        //        demographicMst.fk_updUserID = decryptedUserId;
        //        demographicMst.fk_locid = decryptedLocationId;

        //        // Extract Family Data from DemographicMst
        //        List<DemographicMstFamily> familyMstList = demographicMst.FamilyMembers ?? new List<DemographicMstFamily>();

        //        // Call repository method to update
        //        bool isUpdated = await demographicRepository.UpdateDemographicAsync(
        //            new List<DemographicMst> { demographicMst },
        //            decryptedUserId,
        //            decryptedLocationId
        //        );

        //        return Ok(new ModelResponse
        //        {
        //            IsSuccess = isUpdated,
        //            Message = isUpdated ? "Employee demographic and family details updated successfully." : "Failed to update employee demographic.",
        //            StatusCode = isUpdated ? 200 : 400
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new ModelResponse
        //        {
        //            IsSuccess = false,
        //            Message = $"Error: {ex.Message}",
        //            StatusCode = 500
        //        });
        //    }
        //}




        //===

        //[HttpPut]
        //[Authorize]  // Secured endpoint        
        //public async Task<IActionResult> UpdateDemographicAsync([FromBody] DemographicMst demographicMst)
        //{
        //    ModelResponse modelResponse = new ModelResponse();

        //    try
        //    {
        //        if (demographicMst.prev_pf_amt == null)
        //            demographicMst.prev_pf_amt = 0;

        //        if (demographicMst.prev_volpf_amt == null)
        //            demographicMst.prev_volpf_amt = 0;

        //        if (demographicMst.prev_epf_amt == null)
        //            demographicMst.prev_epf_amt = 0;

        //        if (demographicMst.prev_eps_amt == null)
        //            demographicMst.prev_eps_amt = 0;

        //        if (demographicMst.leave == null)
        //            demographicMst.leave = 0;

        //        if (demographicMst.superannuation == null)
        //            demographicMst.superannuation = 0;

        //        if (demographicMst.saf == null)
        //            demographicMst.saf = 0;

        //        if (demographicMst.houserent == null)
        //            demographicMst.houserent = 0;

        //        if (demographicMst.totalexp == null)
        //            demographicMst.totalexp = 0;

        //        if (demographicMst.gratuity == null)
        //            demographicMst.gratuity = 0;

        //        if (demographicMst.loans == null)
        //            demographicMst.loans = 0;



        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString(); // Retrieve and ensure it's a string
        //        var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

        //        var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]?.ToString(); // Retrieve the LocationId
        //        var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Retrieve encryptedLocationId-string

        //        demographicMst.fk_updUserID = decryptedUserId;
        //        demographicMst.fk_locid = decryptedLocationId;

        //        List<DemographicMst> demographicMstList = new() { demographicMst };

        //        bool isUpdated = await demographicRepository.UpdateDemographicAsync(demographicMstList, decryptedUserId, decryptedLocationId);

        //        modelResponse.IsSuccess = isUpdated;
        //        modelResponse.Message = isUpdated ? "Employee demographic updated successfully." : "Failed to update employee demographic.";
        //        modelResponse.StatusCode = isUpdated ? 200 : 400;

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






    }
}
