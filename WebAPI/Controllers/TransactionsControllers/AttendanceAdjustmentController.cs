using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using iTextSharp.text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AttendanceAdjustmentController : ControllerBase
    {
        private readonly IAttendanceAdjustmentRepository  _Repository;

        public AttendanceAdjustmentController(IAttendanceAdjustmentRepository Repository)
        {
            _Repository = Repository;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> GetAll(
     EmpAttendanceAdjRequest res, int pageIndex, int pageSize, int pageIndex1, int pageSize1
       )
        {
            // Create the model response
            var modelResponse = new ModelResponse();

            try
            {
                // Create filter object to pass to the repository method
                var filter = new EmpAttendanceAdjRequest
                {

                    empcode = res.empcode,
                    empcodemanual = res.empcodemanual,
                    empname = res.empname,
                    selectedDesignation = res.selectedDesignation,
                    selectedNature = res.selectedNature,
                    selectedCity = res.selectedCity,
                    sortBy = res.sortBy,
                    fk_monthId = res.fk_monthId,
                    fk_yearId = res.fk_yearId,
                    fk_costcentreid = res.fk_costcentreid,
                    SelectedLocations = res.SelectedLocations ?? new List<string>(),  // Ensure default to an empty list if null
                    SelectedDepartments = res.SelectedDepartments ?? new List<string>() // Ensure default to an empty list if null

                };

                // Calling the repository to get the data
                var (totalCount, result) = await _Repository.GetAll(pageIndex, pageSize, pageIndex1, pageSize1, filter);

                if (result == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid Id";
                    return Ok(modelResponse);
                }
                modelResponse.IsSuccess = true;
                modelResponse.Message = "detail retrieved successfully.";
                result.AttendanceAdjustmentMstCount = result.AttendanceAdjustmentMstCount;
                modelResponse.Data = result;
                modelResponse.TotalCount = totalCount;
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

        //for update
        [HttpPut]
        [Authorize] // Secured endpoint
        public async Task<IActionResult>UpdateAttendanceAdjustmentAsync([FromBody] AttendanceAdjustmentXmlModel model)
        {
          
            ModelResponse modelResponse = new ModelResponse();

            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]!.ToString(); // Retrieve the UserId
                var encryptedUserId = HttpContext.Items["EncryptedUserId"]?.ToString(); // Retrieve encryptedUserId-string

                //var decryptedCompanyId = HttpContext.Items["DecryptedCompanyId"]!.ToString(); // Optional
                //var encryptedCompanyId = HttpContext.Items["EncryptedCompanyId"]?.ToString(); // Optional

                var decryptedLocationId = HttpContext.Items["DecryptedLocationId"]!.ToString(); // Retrieve the LocationId
                var encryptedLocationId = HttpContext.Items["EncryptedLocationId"]?.ToString(); // Optional
                var decryptedFinancialYearId = HttpContext.Items["DecryptedFinancialYearId"]!.ToString();

                foreach (var item in model.AttendanceDetail)
                {
                    if (item.pk_attenid == null)
                    {
                        modelResponse.IsSuccess = false;
                        modelResponse.Message = "One or more records are missing the primary key (pk_attenid).";
                        modelResponse.StatusCode = 400;
                        return Ok(modelResponse);
                    }

                    if (string.IsNullOrEmpty(item.fk_finid))
                    {
                        item.fk_finid = decryptedFinancialYearId;
                    }
                }
                // Ensure pk_rentId is applied to RentMst


                bool isUpdated = await _Repository.UpdateAttendanceAdjustmentAsync(model, decryptedUserId,decryptedLocationId);

                modelResponse.IsSuccess = isUpdated;
                modelResponse.Message = isUpdated ? "Updated successfully." : "Failed to update.";
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
